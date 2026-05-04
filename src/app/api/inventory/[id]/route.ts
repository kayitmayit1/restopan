import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.inventoryItem.findUnique({
    where: { id },
    include: { location: { select: { organizationId: true } } },
  });
  if (!existing || existing.location.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { organizationId, locationId, ...data } = await req.json();
  const item = await db.inventoryItem.update({
    where: { id },
    data,
    include: { category: true, supplier: { select: { id: true, name: true } } },
  });
  return NextResponse.json(item);
}
