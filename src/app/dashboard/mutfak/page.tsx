import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { KDSClient } from "@/components/kds/kds-client";

export default async function MutfakPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const tickets = await db.kitchenTicket.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      order: {
        location: session.user.locationId
          ? { id: session.user.locationId }
          : { organizationId: session.user.organizationId },
      },
    },
    include: {
      order: {
        include: {
          table: { select: { name: true } },
          items: {
            where: { status: { not: "CANCELLED" } },
            include: {
              menuItem: { select: { name: true, preparationTime: true } },
              modifiers: { include: { modifier: { select: { name: true } } } },
            },
          },
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return <KDSClient initialTickets={tickets} />;
}
