import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
});

const categorySchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
});

const schema = z.object({
  organizationId: z.string(),
  categories: z.array(categorySchema),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  let totalItems = 0;

  for (let ci = 0; ci < data.categories.length; ci++) {
    const cat = data.categories[ci];

    const existing = await db.menuCategory.findFirst({
      where: { organizationId: data.organizationId, name: cat.name },
    });

    const category = existing ?? await db.menuCategory.create({
      data: { organizationId: data.organizationId, name: cat.name, sortOrder: ci },
    });

    if (cat.items.length > 0) {
      await db.menuItem.createMany({
        data: cat.items.map((item, ii) => ({
          organizationId: data.organizationId,
          categoryId: category.id,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          sortOrder: ii,
        })),
        skipDuplicates: true,
      });
      totalItems += cat.items.length;
    }
  }

  return NextResponse.json({ categoriesCreated: data.categories.length, totalItems });
}
