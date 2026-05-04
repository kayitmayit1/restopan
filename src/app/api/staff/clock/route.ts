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
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // locationId may be null for staff who weren't assigned to a specific branch;
  // fall back to the organization's first active location
  let locationId = session.user.locationId;
  if (!locationId) {
    const loc = await db.location.findFirst({
      where: { organizationId: session.user.organizationId, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!loc) return NextResponse.json({ error: "Aktif şube bulunamadı" }, { status: 404 });
    locationId = loc.id;
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
        locationId,
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
