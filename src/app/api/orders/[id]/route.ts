import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { sendOrderReceipt } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const order = await db.order.findUnique({
    where: { id },
    include: {
      location: { select: { organizationId: true } },
      customer: { select: { email: true, name: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
  });

  if (!order || order.location.organizationId !== session.user.organizationId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Payment for existing order (e.g. table checkout)
  if (body.payment) {
    const taxAmount = order.totalAmount * 0.18;
    const receiptNumber = `R${order.orderNumber.slice(1)}`;

    const [updated] = await db.$transaction([
      db.order.update({
        where: { id },
        data: { status: "COMPLETED", paymentStatus: "PAID", completedAt: new Date() },
      }),
      db.receipt.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          locationId: order.locationId,
          receiptNumber,
          subtotal: order.subtotal,
          taxAmount,
          discountAmount: order.discountAmount,
          totalAmount: order.totalAmount,
          payments: { create: { method: body.payment.method, amount: body.payment.amount } },
        },
        update: {
          payments: { create: { method: body.payment.method, amount: body.payment.amount } },
        },
      }),
    ]);

    if (order.tableId) {
      await db.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } });
    }

    if (order.customer?.email) {
      const org = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { name: true },
      });
      sendOrderReceipt({
        to: order.customer.email,
        customerName: order.customer.name ?? "Müşteri",
        restaurantName: org?.name ?? "Restoran",
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.menuItem?.name ?? "Ürün",
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        subtotal: order.subtotal,
        taxAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        paymentMethod: body.payment.method,
      }).catch(() => {}); // fire-and-forget, ödemeyi bloklamamalı
    }

    broadcast(session.user.organizationId, "order:updated", {
      id: updated.id,
      status: updated.status,
      orderNumber: updated.orderNumber,
    });

    return NextResponse.json(updated);
  }

  // Add items to existing order (e.g. table ordering more food)
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    const menuItemIds = [...new Set(body.items.map((i: { menuItemId: string }) => i.menuItemId))] as string[];
    const dbItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds }, organizationId: session.user.organizationId, isActive: true },
      select: { id: true, price: true },
    });
    if (dbItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: "Geçersiz ürün" }, { status: 400 });
    }
    const priceMap = new Map(dbItems.map((m) => [m.id, m.price]));
    type IncomingItem = { menuItemId: string; quantity: number; notes?: string; modifiers?: { modifierId: string; price: number }[] };
    const validatedItems = (body.items as IncomingItem[]).map((item) => ({
      ...item,
      unitPrice: priceMap.get(item.menuItemId)!,
    }));

    const addedSubtotal = validatedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const newSubtotal = order.subtotal + addedSubtotal;
    const newTotal = Math.max(0, newSubtotal - order.discountAmount);
    const newTax = newTotal * 0.18;

    const updated = await db.$transaction(async (tx) => {
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes,
            status: "PREPARING",
            sentToKitchen: true,
            ...(item.modifiers?.length ? {
              modifiers: { create: item.modifiers.map((m) => ({ modifierId: m.modifierId, price: m.price })) },
            } : {}),
          },
        });
      }
      await tx.kitchenTicket.create({ data: { orderId: id, status: "PENDING", priority: 0 } });
      return tx.order.update({
        where: { id },
        data: { subtotal: newSubtotal, taxAmount: newTax, totalAmount: newTotal },
      });
    });

    broadcast(session.user.organizationId, "order:updated", {
      id: updated.id,
      status: updated.status,
      orderNumber: updated.orderNumber,
      totalAmount: updated.totalAmount,
    });

    return NextResponse.json(updated);
  }

  // Status-only update
  const updated = await db.order.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
    },
  });

  if (body.status === "COMPLETED" && body.status !== order.status && order.tableId) {
    await db.table.update({
      where: { id: order.tableId },
      data: { status: "AVAILABLE" },
    });
  }

  broadcast(session.user.organizationId, "order:updated", {
    id: updated.id,
    status: updated.status,
    orderNumber: updated.orderNumber,
  });

  return NextResponse.json(updated);
}
