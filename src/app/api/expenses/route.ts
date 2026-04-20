import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  category: z.string(),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const expense = await db.expense.create({
    data: { ...data, date: new Date(data.date), createdBy: session.user.id },
  });
  return NextResponse.json(expense, { status: 201 });
}
