import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { OrdersClient } from "@/components/orders/orders-client";

export default async function SiparislerPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const orders = await db.order.findMany({
    where: {
      location: session.user.locationId
        ? { id: session.user.locationId }
        : { organizationId: session.user.organizationId },
    },
    include: {
      table: { select: { name: true } },
      customer: { select: { name: true, phone: true } },
      items: {
        include: {
          menuItem: { select: { name: true } },
        },
      },
      receipt: {
        include: { payments: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <Topbar title="Siparişler" subtitle="Tüm sipariş geçmişi" />
      <div className="p-6">
        <OrdersClient orders={orders} />
      </div>
    </div>
  );
}
