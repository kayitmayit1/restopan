import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED", "BOGO", "FREE_ITEM"]).optional(),
  value: z.number().optional(),
  minOrderAmount: z.number().optional().nullable(),
  maxDiscount: z.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().optional().nullable(),
  code: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.promotion.findUnique({ where: { id }, select: { organizationId: true } });
  if (!existing || existing.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data = patchSchema.parse(body);
  const promo = await db.promotion.update({ where: { id }, data });
  return NextResponse.json(promo);
}
