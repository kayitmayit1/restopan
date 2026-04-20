import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  unit: z.string().default("kg"),
  quantity: z.number().default(0),
  minQuantity: z.number().default(0),
  maxQuantity: z.number().optional().nullable(),
  costPerUnit: z.number().default(0),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const item = await db.inventoryItem.create({
    data,
    include: { category: true, supplier: { select: { id: true, name: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}
