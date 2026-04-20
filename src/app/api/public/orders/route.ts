import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  locationId: z.string(),
  tableId: z.string().optional().nullable(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number(),
    notes: z.string().optional(),
  })),
  subtotal: z.number(),
  totalAmount: z.number(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = schema.parse(body);

  // Verify org exists
  const org = await db.organization.findUnique({ where: { id: data.organizationId } });
  if (!org) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const orderNumber = generateOrderNumber();
  const taxAmount = data.totalAmount * 0.18;

  const order = await db.order.create({
    data: {
      locationId: data.locationId,
      tableId: data.tableId ?? null,
      orderNumber,
      type: "DINE_IN",
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      subtotal: data.subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount: data.totalAmount,
      notes: data.notes ?? null,
      source: "ONLINE",
      items: {
        create: data.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          notes: item.notes ?? null,
          status: "PREPARING",
          sentToKitchen: true,
        })),
      },
      kitchenTickets: { create: { status: "PENDING", priority: 0 } },
    },
  });

  if (data.tableId) {
    await db.table.update({ where: { id: data.tableId }, data: { status: "OCCUPIED" } });
  }

  broadcast(data.organizationId, "order:new", {
    id: order.id,
    orderNumber: order.orderNumber,
    type: "DINE_IN",
    tableId: order.tableId,
    totalAmount: order.totalAmount,
    itemCount: data.items.reduce((s, i) => s + i.quantity, 0),
    source: "QR",
  });

  return NextResponse.json({ success: true, orderNumber: order.orderNumber }, { status: 201 });
}
