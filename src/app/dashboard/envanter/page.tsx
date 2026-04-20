import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { InventoryClient } from "@/components/inventory/inventory-client";

export default async function EnvanterPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const locationWhere = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [items, categories, movements] = await Promise.all([
    db.inventoryItem.findMany({
      where: { ...locationWhere, isActive: true },
      include: {
        category: true,
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.inventoryCategory.findMany({
      where: { organizationId: session.user.organizationId },
    }),
    db.stockMovement.findMany({
      where: locationWhere,
      include: {
        inventoryItem: { select: { name: true, unit: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const locationId =
    session.user.locationId ||
    (
      await db.location.findFirst({
        where: { organizationId: session.user.organizationId },
      })
    )?.id ||
    "";

  return (
    <div>
      <Topbar title="Envanter & Stok" subtitle="Malzeme ve stok yönetimi" />
      <div className="p-6">
        <InventoryClient
          items={items}
          categories={categories}
          movements={movements}
          locationId={locationId}
          organizationId={session.user.organizationId}
        />
      </div>
    </div>
  );
}
