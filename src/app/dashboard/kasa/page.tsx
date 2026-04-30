import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { KasaClient } from "@/components/dashboard/kasa-client";
import { hasFeature, type PlanType } from "@/lib/plan-limits";
import { PlanGate } from "@/components/layout/plan-gate";
import { startOfDay, endOfDay } from "date-fns";

export default async function KasaPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  if (!hasFeature((session.user.plan ?? "STARTER") as PlanType, "kasa")) {
    return <div className="flex flex-col h-full"><Topbar title="Kasa" subtitle="Günlük kasa yönetimi" /><PlanGate feature="kasa" /></div>;
  }

  const today = new Date();
  const locationFilter = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [orders, expenses] = await Promise.all([
    db.order.findMany({
      where: {
        ...locationFilter,
        createdAt: { gte: startOfDay(today), lte: endOfDay(today) },
        status: { not: "CANCELLED" },
        paymentStatus: "PAID",
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        createdAt: true,
        receipt: { select: { payments: { select: { method: true, amount: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.expense.findMany({
      where: {
        ...(session.user.locationId
          ? { locationId: session.user.locationId }
          : { location: { organizationId: session.user.organizationId } }),
        date: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <Topbar
        title="Kasa"
        subtitle={today.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />
      <div className="p-6">
        <KasaClient
          orders={orders}
          expenses={expenses}
          locationId={session.user.locationId}
        />
      </div>
    </div>
  );
}
