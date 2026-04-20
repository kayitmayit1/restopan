import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendReservationConfirmation } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  locationId: z.string(),
  guestName: z.string().min(1),
  guestPhone: z.string().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  guestCount: z.number().min(1),
  date: z.string(),
  duration: z.number().default(90),
  tableId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const reservation = await db.reservation.create({
    data: {
      ...data,
      date: new Date(data.date),
      status: "CONFIRMED",
    },
    include: {
      table: { select: { id: true, name: true, capacity: true } },
      customer: { select: { name: true, phone: true } },
    },
  });

  if (data.tableId) {
    await db.table.update({ where: { id: data.tableId }, data: { status: "RESERVED" } });
  }

  // E-posta gönder
  if (data.guestEmail) {
    const location = await db.location.findUnique({
      where: { id: data.locationId },
      include: { organization: { select: { name: true } } },
    });
    sendReservationConfirmation({
      to: data.guestEmail,
      guestName: data.guestName,
      date: new Date(data.date),
      guestCount: data.guestCount,
      restaurantName: location?.organization.name ?? "Restoran",
      tableName: reservation.table?.name,
    }).catch(() => {});
  }

  return NextResponse.json(reservation, { status: 201 });
}
