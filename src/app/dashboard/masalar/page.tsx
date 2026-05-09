import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { TableFloorPlan } from "@/components/tables/floor-plan";

export default async function MasalarPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const tables = await db.table.findMany({
    where: session.user.locationId
      ? { locationId: session.user.locationId }
      : { location: { organizationId: session.user.organizationId } },
    include: {
      orders: {
        where: { status: { in: ["CONFIRMED", "PREPARING", "READY", "SERVED"] } },
        include: { items: { include: { menuItem: { select: { name: true } } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const locationId = session.user.locationId || (
    await db.location.findFirst({
      where: { organizationId: session.user.organizationId },
    })
  )?.id;

  return (
    <div>
      <Topbar title="Masa Planı" subtitle="Canlı masa durumunu görüntüle ve yönet" />
      <div className="p-6">
        <TableFloorPlan
          tables={tables}
          locationId={locationId || ""}
          organizationId={session.user.organizationId}
        />
      </div>
    </div>
  );
}
