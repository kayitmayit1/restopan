import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SubscriptionGate } from "@/components/layout/subscription-gate";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/giris");

  let trialBanner: { daysLeft: number } | null = null;
  let gateReason: "expired" | "past_due" | "canceled" | null = null;

  if (session.user.organizationId) {
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
        } else if (daysLeft <= 10) {
          trialBanner = { daysLeft };
        }
      }
    }
  }

  const org = session.user.organizationId
    ? await db.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { plan: true },
      })
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {gateReason && (
        <SubscriptionGate reason={gateReason} planName={org?.plan ?? "STARTER"} />
      )}
      <AppSidebar plan={(org?.plan ?? "STARTER") as "STARTER" | "PROFESSIONAL" | "ENTERPRISE"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {trialBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Deneme sürenizin bitmesine <strong>{trialBanner.daysLeft} gün</strong> kaldı.
              </span>
            </div>
            <Link
              href="/dashboard/ayarlar/fatura"
              className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
            >
              Planı Yükselt →
            </Link>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
