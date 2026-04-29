import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { CustomersClient } from "@/components/customers/customers-client";
import { hasFeature, type PlanType } from "@/lib/plan-limits";
import { PlanGate } from "@/components/layout/plan-gate";

export default async function MusterilerPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  if (!hasFeature((session.user.plan ?? "STARTER") as PlanType, "customers")) {
    return <div className="flex flex-col h-full"><Topbar title="Müşteriler" subtitle="CRM ve sadakat programı" /><PlanGate feature="customers" /></div>;
  }

  const customers = await db.customer.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      _count: { select: { orders: true, reservations: true } },
    },
    orderBy: { totalSpent: "desc" },
    take: 100,
  });

  return (
    <div>
      <Topbar title="Müşteriler" subtitle="CRM ve sadakat yönetimi" />
      <div className="p-6">
        <CustomersClient customers={customers} organizationId={session.user.organizationId} />
      </div>
    </div>
  );
}
