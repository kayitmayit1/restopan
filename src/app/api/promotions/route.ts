import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "BUY_X_GET_Y", "FREE_ITEM", "GIFT_CARD"]),
  value: z.number(),
  code: z.string().optional().nullable(),
  startsAt: z.string(),
  endsAt: z.string().optional().nullable(),
  maxUses: z.number().optional().nullable(),
  minOrderAmount: z.number().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const promo = await db.promotion.create({
    data: {
      ...data,
      code: data.code || null,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });
  return NextResponse.json(promo, { status: 201 });
}
