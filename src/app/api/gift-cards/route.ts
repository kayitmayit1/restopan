import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateCode() {
  return Array.from({ length: 4 }, () =>
    Math.random().toString(36).toUpperCase().slice(2, 6)
  ).join("-");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { balance } = await req.json();
  const card = await db.giftCard.create({
    data: { code: generateCode(), balance, initialBalance: balance },
  });
  return NextResponse.json(card, { status: 201 });
}
