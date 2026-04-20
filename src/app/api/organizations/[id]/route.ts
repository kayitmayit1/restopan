import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id !== session.user.organizationId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: _id, plan, ...data } = await req.json();
  const org = await db.organization.update({ where: { id }, data });
  return NextResponse.json(org);
}
