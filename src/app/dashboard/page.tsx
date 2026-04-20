import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { DashboardStats } from "@/components/dashboard/stats";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopItems } from "@/components/dashboard/top-items";
import { LiveTables } from "@/components/dashboard/live-tables";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { startOfDay, endOfDay, subDays } from "date-fns";

async function getDashboardData(organizationId: string, locationId?: string) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const yesterdayStart = startOfDay(subDays(today, 1));
  const yesterdayEnd = endOfDay(subDays(today, 1));

  const locationFilter = locationId ? { locationId } : {
    location: { organizationId },
  };

  const [
    todayOrders,
    yesterdayOrders,
    activeOrders,
    tables,
    lowStockItems,
    recentOrders,
    topItems,
    revenueData,
    prevRevenueData,
  ] = await Promise.all([
    db.order.aggregate({
      where: {
        ...locationFilter,
        createdAt: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        ...locationFilter,
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.order.count({
      where: {
        ...locationFilter,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
      },
    }),
    db.table.findMany({
      where: locationId
        ? { locationId }
        : { location: { organizationId } },
      select: { id: true, name: true, status: true, capacity: true },
    }),
    db.inventoryItem.findMany({
      where: {
        ...(locationId ? { locationId } : { location: { organizationId } }),
        isActive: true,
        quantity: { lte: db.inventoryItem.fields.minQuantity },
      },
      take: 5,
      select: { id: true, name: true, quantity: true, minQuantity: true, unit: true },
    }),
    db.order.findMany({
      where: { ...locationFilter, status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        table: { select: { name: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
    }),
    db.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          ...locationFilter,
          createdAt: { gte: subDays(today, 7) },
          status: { not: "CANCELLED" },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),
    // Last 7 days revenue
    db.order.groupBy({
      by: ["createdAt"],
      where: {
        ...locationFilter,
        createdAt: { gte: subDays(today, 6) },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
    }),
    // Previous 7 days revenue (for comparison)
    db.order.groupBy({
      by: ["createdAt"],
      where: {
        ...locationFilter,
        createdAt: { gte: subDays(today, 13), lte: subDays(today, 7) },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const menuItemIds = topItems.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, price: true },
  });

  return {
    todayRevenue: todayOrders._sum.totalAmount ?? 0,
    todayOrderCount: todayOrders._count,
    yesterdayRevenue: yesterdayOrders._sum.totalAmount ?? 0,
    yesterdayOrderCount: yesterdayOrders._count,
    activeOrders,
    tables,
    lowStockItems,
    recentOrders,
    topItems: topItems.map((item) => ({
      ...item,
      menuItem: menuItems.find((m) => m.id === item.menuItemId),
    })),
    revenueData,
    prevRevenueData,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const data = await getDashboardData(
    session.user.organizationId,
    session.user.locationId
  );

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={`Bugün, ${new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="p-6 space-y-6">
        <DashboardStats
          todayRevenue={data.todayRevenue}
          todayOrderCount={data.todayOrderCount}
          yesterdayRevenue={data.yesterdayRevenue}
          yesterdayOrderCount={data.yesterdayOrderCount}
          activeOrders={data.activeOrders}
          tableCount={data.tables.length}
          occupiedTables={data.tables.filter((t) => t.status === "OCCUPIED").length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={data.revenueData} prevData={data.prevRevenueData} />
          </div>
          <div>
            <LiveTables tables={data.tables} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrders orders={data.recentOrders} />
          </div>
          <div className="space-y-6">
            <TopItems items={data.topItems} />
            {data.lowStockItems.length > 0 && (
              <LowStockAlert items={data.lowStockItems} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
