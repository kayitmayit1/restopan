import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";

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
    include: { location: { select: { organizationId: true } } },
  });

  if (!order || order.location.organizationId !== session.user.organizationId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.order.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
    },
  });

  if (body.status === "COMPLETED" && body.status !== order.status) {
    await db.table.updateMany({
      where: { id: order.tableId ?? "" },
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
