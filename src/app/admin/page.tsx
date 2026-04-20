import { db } from "@/lib/db";
import { startOfMonth, subMonths } from "date-fns";
import { Building2, Users, TrendingUp, CreditCard, Activity, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PLAN_PRICE: Record<string, number> = {
  PROFESSIONAL: 999,
  ENTERPRISE: 2499,
};

export default async function AdminPage() {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const [orgs, users, subs, newOrgsThisMonth, newOrgsLastMonth] = await Promise.all([
    db.organization.findMany({
      include: {
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.count(),
    db.subscription.findMany({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    db.organization.count({ where: { createdAt: { gte: thisMonthStart } } }),
    db.organization.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
  ]);

  const mrr = orgs.reduce((sum, org) => {
    const price = PLAN_PRICE[org.plan] ?? 0;
    const sub = org.subscriptions[0];
    if (!price || !sub || !["ACTIVE", "TRIALING"].includes(sub.status)) return sum;
    return sum + price;
  }, 0);

  const activeOrgs = orgs.filter((o) => {
    const sub = o.subscriptions[0];
    return sub && ["ACTIVE", "TRIALING"].includes(sub.status);
  }).length;

  const canceledOrgs = orgs.filter((o) => {
    const sub = o.subscriptions[0];
    return sub?.status === "CANCELED";
  }).length;

  const pastDueOrgs = orgs.filter((o) => {
    const sub = o.subscriptions[0];
    return sub?.status === "PAST_DUE";
  }).length;

  const trialOrgs = orgs.filter((o) => {
    const sub = o.subscriptions[0];
    return sub?.status === "TRIALING";
  }).length;

  const stats = [
    {
      label: "Toplam Organizasyon",
      value: orgs.length,
      icon: Building2,
      color: "bg-blue-50 text-blue-600",
      sub: `+${newOrgsThisMonth} bu ay`,
    },
    {
      label: "Toplam Kullanıcı",
      value: users,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      sub: "tüm organizasyonlar",
    },
    {
      label: "Tahmini MRR",
      value: formatCurrency(mrr),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      sub: `${activeOrgs} aktif abonelik`,
    },
    {
      label: "Trial",
      value: trialOrgs,
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600",
      sub: "deneme süresi",
    },
    {
      label: "Aktif",
      value: activeOrgs - trialOrgs,
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600",
      sub: "ödeme alınan",
    },
    {
      label: "Sorunlu / İptal",
      value: pastDueOrgs + canceledOrgs,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
      sub: `${pastDueOrgs} gecikmiş, ${canceledOrgs} iptal`,
    },
  ];

  const recentOrgs = orgs.slice(0, 10);

  const planLabel: Record<string, string> = {
    STARTER: "Starter",
    PROFESSIONAL: "Professional",
    ENTERPRISE: "Enterprise",
  };

  const subStatusLabel: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Aktif", cls: "bg-emerald-100 text-emerald-700" },
    TRIALING: { label: "Trial", cls: "bg-amber-100 text-amber-700" },
    PAST_DUE: { label: "Gecikmiş", cls: "bg-red-100 text-red-700" },
    CANCELED: { label: "İptal", cls: "bg-zinc-100 text-zinc-500" },
  };

  return (
    <div>
      <div className="h-[60px] border-b border-border/60 bg-white/90 flex items-center px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Genel Bakış</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-border/70 shadow-sm rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent orgs */}
        <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-sm">Son Kayıtlar</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Organizasyon</th>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Durum</th>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Üye</th>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentOrgs.map((org) => {
                const sub = org.subscriptions[0];
                const statusCfg = sub ? subStatusLabel[sub.status] : null;
                return (
                  <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <a href={`/admin/organizasyonlar/${org.id}`} className="font-medium hover:text-primary transition-colors">
                        {org.name}
                      </a>
                      <p className="text-xs text-muted-foreground">{org.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-xs">{planLabel[org.plan]}</td>
                    <td className="px-5 py-3">
                      {statusCfg ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs">{org._count.members}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {org.createdAt.toLocaleDateString("tr-TR")}
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
