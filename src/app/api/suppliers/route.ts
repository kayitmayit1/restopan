import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  name: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const supplier = await db.supplier.create({
    data: { ...data, email: data.email || null },
  });
  return NextResponse.json(supplier, { status: 201 });
}
