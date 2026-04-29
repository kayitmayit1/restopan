import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [shift, clockEvents] = await Promise.all([
    db.shift.findFirst({
      where: {
        staffId: session.user.id,
        date: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.clockEvent.findMany({
      where: {
        userId: session.user.id,
        time: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { time: "asc" },
    }),
  ]);

  return NextResponse.json({ shift, clockEvents });
}
