import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  birthdate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const customer = await db.customer.create({
    data: {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
