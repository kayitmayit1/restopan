import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { PromotionsClient } from "@/components/promotions/promotions-client";
import { hasFeature, type PlanType } from "@/lib/plan-limits";
import { PlanGate } from "@/components/layout/plan-gate";

export default async function KampanyalarPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  if (!hasFeature((session.user.plan ?? "STARTER") as PlanType, "campaigns")) {
    return <div className="flex flex-col h-full"><Topbar title="Kampanyalar" subtitle="İndirim ve promosyon yönetimi" /><PlanGate feature="campaigns" /></div>;
  }

  const [promotions, giftCards] = await Promise.all([
    db.promotion.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
    }),
    db.giftCard.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <Topbar title="Kampanyalar & İndirimler" subtitle="Promosyon ve hediye kartı yönetimi" />
      <div className="p-6">
        <PromotionsClient promotions={promotions} giftCards={giftCards} organizationId={session.user.organizationId} />
      </div>
    </div>
  );
}
