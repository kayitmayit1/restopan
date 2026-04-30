import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { broadcast } from "@/lib/sse";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const VALID_STATUSES = new Set(Object.values(OrderStatus));

const orderSchema = z.object({
  locationId: z.string().optional(),
  organizationId: z.string(),
  tableId: z.string().optional().nullable(),
  staffId: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEOUT", "DELIVERY", "ONLINE"]).default("DINE_IN"),
  notes: z.string().optional(),
  deliveryName: z.string().optional(),
  deliveryPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number(),
      notes: z.string().optional(),
      modifiers: z.array(
        z.object({
          modifierId: z.string(),
          name: z.string(),
          price: z.number(),
        })
      ).optional(),
    })
  ),
  subtotal: z.number(),
  discountAmount: z.number().default(0),
  totalAmount: z.number(),
  payment: z.object({
    method: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "GIFT_CARD", "LOYALTY_POINTS", "ONLINE", "BANK_TRANSFER"]),
    amount: z.number(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    // Get the first location if not specified
    let locationId = data.locationId;
    if (!locationId) {
      const location = await db.location.findFirst({
        where: { organizationId: data.organizationId },
      });
      locationId = location?.id;
    }
    if (!locationId) {
      return NextResponse.json({ error: "Şube bulunamadı" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const taxAmount = data.totalAmount * 0.18;

    const order = await db.order.create({
      data: {
        locationId,
        tableId: data.tableId || null,
        staffId: data.staffId,
        orderNumber,
        type: data.type,
        status: "CONFIRMED",
        paymentStatus: data.payment ? "PAID" : "UNPAID",
        subtotal: data.subtotal,
        taxAmount,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
        notes: data.notes,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
        source: "POS",
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes,
            status: "PREPARING",
            sentToKitchen: true,
            modifiers: item.modifiers?.length
              ? {
                  create: item.modifiers.map((m) => ({
                    modifierId: m.modifierId,
                    price: m.price,
                  })),
                }
              : undefined,
          })),
        },
        kitchenTickets: {
          create: {
            status: "PENDING",
            priority: 0,
          },
        },
      },
    });

    // Create receipt if payment is made
    if (data.payment) {
      const receiptNumber = `R${orderNumber.slice(1)}`;
      await db.receipt.create({
        data: {
          orderId: order.id,
          locationId,
          receiptNumber,
          subtotal: data.subtotal,
          taxAmount,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          payments: {
            create: {
              method: data.payment.method,
              amount: data.payment.amount,
            },
          },
        },
      });
    }

    // Update table status if dine-in
    if (data.tableId && data.type === "DINE_IN") {
      await db.table.update({
        where: { id: data.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    broadcast(data.organizationId, "order:new", {
      id: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      tableId: order.tableId,
      totalAmount: order.totalAmount,
      itemCount: data.items.reduce((s, i) => s + i.quantity, 0),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[ORDERS POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tableId = searchParams.get("tableId");
  const paymentStatus = searchParams.get("paymentStatus");
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");

  const orders = await db.order.findMany({
    where: {
      location: { organizationId: session.user.organizationId },
      ...(status && VALID_STATUSES.has(status as OrderStatus) ? { status: status as OrderStatus } : {}),
      ...(tableId ? { tableId } : {}),
      ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
    },
    include: {
      table: { select: { name: true } },
      items: {
        include: {
          menuItem: { select: { name: true } },
          modifiers: { include: { modifier: { select: { name: true } } } },
        },
      },
      receipt: { include: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  return NextResponse.json(orders);
}
