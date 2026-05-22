import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { broadcast } from "@/lib/sse";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  locationId: z.string(),
  tableId: z.string().optional().nullable(),
  type: z.enum(["DINE_IN", "TAKEOUT"]),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(20),
        notes: z.string().max(200).optional(),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const org = await db.organization.findFirst({
      where: { id: data.organizationId },
      select: { id: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Restoran bulunamadı" }, { status: 404 });
    }

    const location = await db.location.findFirst({
      where: { id: data.locationId, organizationId: data.organizationId },
      select: { id: true },
    });
    if (!location) {
      return NextResponse.json({ error: "Şube bulunamadı" }, { status: 404 });
    }

    // Server-side price validation — client prices are ignored
    const menuItemIds = [...new Set(data.items.map((i) => i.menuItemId))];
    const dbItems = await db.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        organizationId: data.organizationId,
        isActive: true,
        isAvailable: true,
      },
      select: {
        id: true,
        price: true,
        variants: {
          where: { isActive: true },
          select: { id: true, price: true },
        },
      },
    });
    if (dbItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: "Geçersiz ürün" }, { status: 400 });
    }

    const itemMap = new Map(dbItems.map((m) => [m.id, m]));
    const validatedItems = data.items.map((item) => {
      const dbItem = itemMap.get(item.menuItemId)!;
      let unitPrice = dbItem.price;
      if (item.variantId) {
        const variant = dbItem.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new Error("INVALID_VARIANT");
        unitPrice = variant.price;
      }
      return {
        menuItemId: item.menuItemId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        notes: item.notes,
      };
    });

    const subtotal = validatedItems.reduce((s, i) => s + i.totalPrice, 0);
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal;
    const orderNumber = generateOrderNumber();

    const order = await db.order.create({
      data: {
        locationId: data.locationId,
        tableId: data.tableId ?? null,
        orderNumber,
        type: data.type,
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        notes: data.notes,
        deliveryName: data.customerName,
        deliveryPhone: data.customerPhone,
        source: "ONLINE",
        items: {
          create: validatedItems.map((item) => ({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
            status: "PENDING",
            sentToKitchen: false,
          })),
        },
        kitchenTickets: {
          create: { status: "PENDING", priority: 0 },
        },
      },
    });

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
      itemCount: validatedItems.reduce((s, i) => s + i.quantity, 0),
      source: "ONLINE",
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "INVALID_VARIANT") {
      return NextResponse.json({ error: "Geçersiz varyant" }, { status: 400 });
    }
    console.error("[PUBLIC ORDERS]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
