import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { StaffClient } from "@/components/staff/staff-client";

export default async function PersonelPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const [members, shifts] = await Promise.all([
    db.organizationMember.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        location: { select: { name: true } },
      },
    }),
    db.shift.findMany({
      where: session.user.locationId
        ? { locationId: session.user.locationId }
        : { location: { organizationId: session.user.organizationId } },
      include: {
        clockEvents: { orderBy: { time: "asc" } },
      },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  const locationId =
    session.user.locationId ||
    (await db.location.findFirst({ where: { organizationId: session.user.organizationId } }))?.id ||
    "";

  return (
    <div>
      <Topbar title="Personel" subtitle="Çalışan yönetimi ve vardiya takibi" />
      <div className="p-6">
        <StaffClient
          members={members}
          shifts={shifts}
          locationId={locationId}
          organizationId={session.user.organizationId}
        />
      </div>
    </div>
  );
}
