import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/settings/billing-client";

export default async function FaturaPage() {
  const session = await auth();
  if (!session?.user.organizationId) redirect("/giris");

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!org) redirect("/giris");

  const sub = org.subscriptions[0] ?? null;
  const trialDaysLeft = sub?.status === "TRIALING"
    ? Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div>
      <Topbar title="Fatura & Plan" subtitle="Abonelik ve ödeme yönetimi" />
      <div className="p-6">
        <BillingClient
          plan={org.plan}
          status={sub?.status ?? "ACTIVE"}
          trialDaysLeft={trialDaysLeft}
          periodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
          hasActiveSubscription={!!sub?.lsSubscriptionId}
          cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
          termsAcceptedAt={org.termsAcceptedAt?.toISOString() ?? null}
        />
      </div>
    </div>
  );
}
