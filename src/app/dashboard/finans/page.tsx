import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { FinancialClient } from "@/components/dashboard/financial-client";
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export default async function FinansPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const today = new Date();
  const locationFilter = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const expLocationFilter = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [thisMonthOrders, lastMonthOrders, expenses, taxSummary] = await Promise.all([
    db.order.aggregate({
      where: { ...locationFilter, createdAt: { gte: startOfMonth(today), lte: endOfMonth(today) }, status: { not: "CANCELLED" } },
      _sum: { totalAmount: true, taxAmount: true, discountAmount: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        ...locationFilter,
        createdAt: { gte: startOfMonth(subDays(today, 30)), lte: endOfMonth(subDays(today, 30)) },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.expense.findMany({
      where: expLocationFilter,
      orderBy: { date: "desc" },
      take: 20,
    }),
    db.order.groupBy({
      by: ["createdAt"],
      where: { ...locationFilter, createdAt: { gte: startOfMonth(today) }, status: { not: "CANCELLED" } },
      _sum: { taxAmount: true, totalAmount: true, subtotal: true },
    }),
  ]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <Topbar title="Finansal Raporlar" subtitle="Gelir, gider ve vergi özeti" />
      <div className="p-6">
        <FinancialClient
          thisMonth={thisMonthOrders}
          lastMonth={lastMonthOrders}
          expenses={expenses}
          totalExpenses={totalExpenses}
          locationId={session.user.locationId || ""}
        />
      </div>
    </div>
  );
}
