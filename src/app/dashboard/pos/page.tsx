import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { POSClient } from "@/components/pos/pos-client";

export default async function POSPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const [categories, tables] = await Promise.all([
    db.menuCategory.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      include: {
        items: {
          where: { isActive: true, isAvailable: true },
          include: {
            modifierGroups: {
              include: {
                modifierGroup: {
                  include: { modifiers: { where: { isActive: true } } },
                },
              },
            },
            variants: { where: { isActive: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.table.findMany({
      where: session.user.locationId
        ? { locationId: session.user.locationId, isActive: true }
        : {
            location: { organizationId: session.user.organizationId },
            isActive: true,
          },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <POSClient
      categories={categories}
      tables={tables}
      organizationId={session.user.organizationId}
      locationId={session.user.locationId}
      staffId={session.user.id}
    />
  );
}
