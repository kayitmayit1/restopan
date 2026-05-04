import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  cost: z.number().optional().nullable(),
  taxRate: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
  image: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);
    if (data.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const item = await db.menuItem.create({
      data,
      include: { variants: { select: { id: true, name: true, price: true } } },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[menu/items POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
