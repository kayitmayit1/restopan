import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason: string = body.reason ?? "";

  const order = await db.order.findUnique({
    where: { id },
    include: {
      location: { select: { organizationId: true } },
      receipt: { include: { payments: true } },
    },
  });

  if (!order || order.location.organizationId !== session.user.organizationId)
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

  if (order.paymentStatus !== "PAID")
    return NextResponse.json({ error: "Yalnızca ödenmiş siparişler iade edilebilir" }, { status: 400 });

  const refundAmount = order.totalAmount;

  const updated = await db.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: { paymentStatus: "REFUNDED", status: "CANCELLED" },
    });

    if (order.receipt) {
      await tx.payment.create({
        data: {
          receiptId: order.receipt.id,
          method: order.receipt.payments[0]?.method ?? "CASH",
          amount: -refundAmount,
          reference: reason || "İade",
        },
      });
    }

    if (order.tableId) {
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    return updatedOrder;
  });

  broadcast(session.user.organizationId, "order:updated", {
    id: updated.id,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    orderNumber: updated.orderNumber,
  });

  return NextResponse.json({ success: true, refundAmount, order: updated });
}
