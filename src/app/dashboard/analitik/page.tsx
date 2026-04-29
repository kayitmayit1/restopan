import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import { hasFeature, type PlanType } from "@/lib/plan-limits";
import { PlanGate } from "@/components/layout/plan-gate";
import { subDays, startOfDay, endOfDay } from "date-fns";

export default async function AnalitikPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  if (!hasFeature((session.user.plan ?? "STARTER") as PlanType, "analytics")) {
    return <div className="flex flex-col h-full"><Topbar title="Analitik" subtitle="Satış ve performans verileri" /><PlanGate feature="analytics" /></div>;
  }

  const today = new Date();
  const locationFilter = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [
    revenueByDay,
    ordersByType,
    ordersByHour,
    topItems,
    paymentMethods,
    customerStats,
  ] = await Promise.all([
    // Revenue last 30 days
    db.order.groupBy({
      by: ["createdAt"],
      where: { ...locationFilter, createdAt: { gte: subDays(today, 29) }, status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // Orders by type
    db.order.groupBy({
      by: ["type"],
      where: { ...locationFilter, createdAt: { gte: subDays(today, 29) }, status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // Orders by hour of day
    db.order.findMany({
      where: { ...locationFilter, createdAt: { gte: subDays(today, 29) }, status: { not: "CANCELLED" } },
      select: { createdAt: true, totalAmount: true },
    }),
    // Top menu items
    db.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { ...locationFilter, createdAt: { gte: subDays(today, 29) } } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10,
    }),
    // Payment methods
    db.payment.groupBy({
      by: ["method"],
      where: { receipt: { location: session.user.locationId ? { id: session.user.locationId } : { organizationId: session.user.organizationId } } },
      _sum: { amount: true },
      _count: true,
    }),
    // Customer stats
    db.customer.aggregate({
      where: { organizationId: session.user.organizationId },
      _count: true,
      _avg: { totalSpent: true },
      _sum: { loyaltyPoints: true },
    }),
  ]);

  const menuItemIds = topItems.map((i) => i.menuItemId);
  const menuItems = menuItemIds.length > 0 ? await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true },
  }) : [];

  return (
    <div>
      <Topbar title="Analitik" subtitle="Performans ve iş zekası" />
      <div className="p-6">
        <AnalyticsClient
          revenueByDay={revenueByDay}
          ordersByType={ordersByType}
          ordersRaw={ordersByHour}
          topItems={topItems.map((i) => ({ ...i, name: menuItems.find((m) => m.id === i.menuItemId)?.name || "—" }))}
          paymentMethods={paymentMethods}
          customerStats={customerStats}
        />
      </div>
    </div>
  );
}
