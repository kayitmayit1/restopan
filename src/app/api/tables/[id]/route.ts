import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "INACTIVE"]).optional(),
  name: z.string().optional(),
  capacity: z.number().optional(),
  section: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const data = patchSchema.parse(body);

    const existing = await db.table.findUnique({
      where: { id },
      include: { location: { select: { organizationId: true } } },
    });
    if (!existing || existing.location.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (data.name) {
      const duplicate = await db.table.findFirst({
        where: { locationId: existing.locationId, name: data.name, isActive: true, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Bu masa adı zaten kullanımda" }, { status: 409 });
      }
    }

    const table = await db.table.update({ where: { id }, data });
    return NextResponse.json(table);
  } catch (error) {
    console.error("[TABLES PATCH]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.table.findUnique({
    where: { id },
    include: { location: { select: { organizationId: true } } },
  });
  if (!existing || existing.location.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.table.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
