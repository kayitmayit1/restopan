import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

const schema = z.object({
  type: z.enum(["CLOCK_IN", "CLOCK_OUT", "BREAK_START", "BREAK_END"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.locationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type } = schema.parse(body);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  let shift = await db.shift.findFirst({
    where: {
      staffId: session.user.id,
      date: { gte: todayStart, lte: todayEnd },
    },
  });

  // Auto-create shift on first clock-in if manager hasn't created one
  if (!shift && type === "CLOCK_IN") {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    shift = await db.shift.create({
      data: {
        locationId: session.user.locationId,
        staffId: session.user.id,
        date: todayStart,
        startTime: timeStr,
        endTime: "23:59",
        status: "ACTIVE",
      },
    });
  }

  if (!shift) {
    return NextResponse.json({ error: "Vardiya bulunamadı" }, { status: 404 });
  }

  // Update shift status
  if (type === "CLOCK_IN") {
    await db.shift.update({ where: { id: shift.id }, data: { status: "ACTIVE" } });
  } else if (type === "CLOCK_OUT") {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    await db.shift.update({
      where: { id: shift.id },
      data: { status: "COMPLETED", endTime: timeStr },
    });
  }

  const event = await db.clockEvent.create({
    data: { userId: session.user.id, shiftId: shift.id, type },
  });

  return NextResponse.json(event, { status: 201 });
}
