import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { SuppliersClient } from "@/components/suppliers/suppliers-client";

export default async function TedarikcilerPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const locationWhere = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [suppliers, orders] = await Promise.all([
    db.supplier.findMany({
      where: locationWhere,
      include: { _count: { select: { purchaseOrders: true, inventoryItems: true } } },
      orderBy: { name: "asc" },
    }),
    db.purchaseOrder.findMany({
      where: { supplier: locationWhere },
      include: { supplier: { select: { name: true } }, items: { include: { inventoryItem: { select: { name: true, unit: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const locationId =
    session.user.locationId ||
    (await db.location.findFirst({ where: { organizationId: session.user.organizationId } }))?.id || "";

  return (
    <div>
      <Topbar title="Tedarikçiler" subtitle="Tedarikçi ve satın alma yönetimi" />
      <div className="p-6">
        <SuppliersClient suppliers={suppliers} orders={orders} locationId={locationId} />
      </div>
    </div>
  );
}
