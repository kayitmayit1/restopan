import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SubscriptionGate } from "@/components/layout/subscription-gate";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/giris");

  let trialBanner: { daysLeft: number } | null = null;
  let gateReason: "expired" | "past_due" | "canceled" | null = null;

  const org = session.user.organizationId
    ? await db.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { plan: true },
      })
    : null;

  // Trial/gate kontrolleri sadece ücretli planlarda geçerli — STARTER sonsuza kadar ücretsiz
  if (session.user.organizationId && org?.plan !== "STARTER") {
    const sub = await db.subscription.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    if (sub) {
      if (sub.status === "CANCELED") {
        gateReason = "canceled";
      } else if (sub.status === "PAST_DUE") {
        gateReason = "past_due";
      } else if (sub.status === "TRIALING") {
        const daysLeft = Math.max(
          0,
          Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / 86400000)
        );
        if (daysLeft === 0) {
          gateReason = "expired";
        } else {
          trialBanner = { daysLeft };
        }
      }
    }
  }

  return (
    <DashboardShell
      plan={(org?.plan ?? "STARTER") as "STARTER" | "PROFESSIONAL" | "ENTERPRISE"}
      trialDaysLeft={trialBanner?.daysLeft}
      gateNode={gateReason ? <SubscriptionGate reason={gateReason} planName={org?.plan ?? "STARTER"} /> : undefined}
    >
      {children}
    </DashboardShell>
  );
}
