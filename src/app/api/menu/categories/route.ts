import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const category = await db.menuCategory.create({ data });
  return NextResponse.json(category, { status: 201 });
}
