import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { ReservationsClient } from "@/components/reservations/reservations-client";

export default async function RezervasyonlarPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const locationWhere = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [reservations, tables] = await Promise.all([
    db.reservation.findMany({
      where: locationWhere,
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
    db.table.findMany({
      where: session.user.locationId
        ? { locationId: session.user.locationId, isActive: true }
        : { location: { organizationId: session.user.organizationId }, isActive: true },
      select: { id: true, name: true, capacity: true, status: true },
    }),
  ]);

  const locationId =
    session.user.locationId ||
    (await db.location.findFirst({ where: { organizationId: session.user.organizationId } }))?.id || "";

  return (
    <div>
      <Topbar title="Rezervasyonlar" subtitle="Masa rezervasyon yönetimi" />
      <div className="p-6">
        <ReservationsClient reservations={reservations} tables={tables} locationId={locationId} />
      </div>
    </div>
  );
}
