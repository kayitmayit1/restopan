import { db } from "@/lib/db";

const subStatusCfg: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Aktif", cls: "bg-emerald-100 text-emerald-700" },
  TRIALING: { label: "Trial", cls: "bg-amber-100 text-amber-700" },
  PAST_DUE: { label: "Gecikmiş", cls: "bg-red-100 text-red-700" },
  CANCELED: { label: "İptal", cls: "bg-zinc-100 text-zinc-500" },
};

const planLabel: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

const PLAN_PRICE: Record<string, number> = {
  PROFESSIONAL: 999,
  ENTERPRISE: 2499,
};

export default async function AdminSubscriptionsPage() {
  const subs = await db.subscription.findMany({
    include: { organization: { select: { name: true, slug: true, plan: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const activeMrr = subs.reduce((sum, sub) => {
    if (!["ACTIVE", "TRIALING"].includes(sub.status)) return sum;
    return sum + (PLAN_PRICE[sub.organization.plan] ?? 0);
  }, 0);

  return (
    <div>
      <div className="h-[60px] border-b border-border/60 bg-white/90 flex items-center justify-between px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Abonelikler</h1>
        <span className="text-sm font-semibold text-primary">
          MRR: ₺{activeMrr.toLocaleString("tr-TR")}
        </span>
      </div>

      <div className="p-6">
        <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Organizasyon</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Durum</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Dönem Başlangıç</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Dönem Bitiş</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">LS Abonelik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {subs.map((sub) => {
                const cfg = subStatusCfg[sub.status];
                const isExpiringSoon =
                  sub.status === "TRIALING" &&
                  sub.currentPeriodEnd < new Date(Date.now() + 7 * 86400_000);
                return (
                  <tr key={sub.id} className={`hover:bg-muted/20 transition-colors ${isExpiringSoon ? "bg-amber-50/40" : ""}`}>
                    <td className="px-5 py-3.5">
                      <a href={`/admin/organizasyonlar/${sub.organizationId}`} className="font-medium text-xs hover:text-primary transition-colors">
                        {sub.organization.name}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-xs">{planLabel[sub.organization.plan]}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      {isExpiringSoon && (
                        <span className="ml-1.5 text-[10px] text-amber-600 font-medium">⚠ Sona eriyor</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {sub.currentPeriodStart.toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {sub.currentPeriodEnd.toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">
                      {sub.lsSubscriptionId ? sub.lsSubscriptionId.slice(0, 16) + "…" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
