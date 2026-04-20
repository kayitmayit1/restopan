import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  inventoryItemId: z.string(),
  type: z.enum(["PURCHASE", "SALE", "WASTE", "ADJUSTMENT", "TRANSFER", "RETURN"]),
  quantity: z.number(),
  costPerUnit: z.number().optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const [movement, item] = await db.$transaction([
    db.stockMovement.create({
      data: { ...data, createdBy: session.user.id },
      include: { inventoryItem: { select: { name: true, unit: true } } },
    }),
    db.inventoryItem.update({
      where: { id: data.inventoryItemId },
      data: {
        quantity: { increment: data.quantity },
        ...(data.costPerUnit ? { costPerUnit: data.costPerUnit } : {}),
      },
      include: { category: true, supplier: { select: { id: true, name: true } } },
    }),
  ]);

  return NextResponse.json({ movement, item }, { status: 201 });
}
