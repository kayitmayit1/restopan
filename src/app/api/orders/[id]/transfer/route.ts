import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ toTableId: z.string() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { toTableId } = schema.parse(body);

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, tableId: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    return NextResponse.json({ error: "Bu sipariş aktarılamaz" }, { status: 400 });
  }

  // Eski masayı serbest bırak
  if (order.tableId) {
    await db.table.update({
      where: { id: order.tableId },
      data: { status: "AVAILABLE" },
    });
  }

  // Yeni masayı işaretle ve siparişi güncelle
  await Promise.all([
    db.order.update({ where: { id }, data: { tableId: toTableId } }),
    db.table.update({ where: { id: toTableId }, data: { status: "OCCUPIED" } }),
  ]);

  return NextResponse.json({ success: true });
}
