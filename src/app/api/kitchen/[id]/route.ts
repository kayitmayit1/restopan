import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await req.json();

    const ticket = await db.kitchenTicket.update({
      where: { id },
      data: {
        status,
        ...(status === "IN_PROGRESS" ? { startedAt: new Date() } : {}),
        ...(status === "DONE" ? { completedAt: new Date() } : {}),
      },
    });

    if (status === "DONE") {
      const order = await db.order.update({
        where: { id: ticket.orderId },
        data: { status: "READY" },
        include: {
          location: { select: { organizationId: true } },
          items: {
            include: {
              menuItem: {
                include: { recipeItems: true },
              },
            },
          },
        },
      });

      await db.orderItem.updateMany({
        where: { orderId: ticket.orderId },
        data: { status: "READY" },
      });

      // Stok otomasyonu: reçetedeki malzemeleri düş
      for (const orderItem of order.items) {
        for (const recipe of orderItem.menuItem.recipeItems) {
          const deduction = recipe.quantity * orderItem.quantity;
          await db.inventoryItem.updateMany({
            where: {
              id: recipe.inventoryItemId,
              locationId: order.locationId,
            },
            data: { quantity: { decrement: deduction } },
          });
          await db.stockMovement.create({
            data: {
              locationId: order.locationId,
              inventoryItemId: recipe.inventoryItemId,
              type: "SALE",
              quantity: -deduction,
              notes: `Sipariş ${order.orderNumber}`,
              reference: order.id,
            },
          });
        }
      }

      broadcast(order.location.organizationId, "order:ready", {
        id: order.id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
      });
    } else {
      // IN_PROGRESS veya diğer durum değişikliklerini bildir
      const order = await db.order.findUnique({
        where: { id: ticket.orderId },
        include: { location: { select: { organizationId: true } } },
      });
      if (order) {
        broadcast(order.location.organizationId, "kitchen:update", {
          ticketId: ticket.id,
          orderId: order.id,
          status,
        });
      }
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[KITCHEN PATCH]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
