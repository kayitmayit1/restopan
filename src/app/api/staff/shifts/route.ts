import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  staffId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const shift = await db.shift.create({
    data: { ...data, date: new Date(data.date) },
  });
  return NextResponse.json(shift, { status: 201 });
}
