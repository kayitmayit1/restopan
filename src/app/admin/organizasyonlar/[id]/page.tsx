import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OrgAdminActions } from "@/components/admin/org-admin-actions";

const planLabel: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

const roleLabel: Record<string, string> = {
  OWNER: "Sahip",
  ADMIN: "Admin",
  MANAGER: "Müdür",
  CASHIER: "Kasiyer",
  WAITER: "Garson",
  KITCHEN: "Mutfak",
  STAFF: "Personel",
};

const subStatusCfg: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Aktif", cls: "bg-emerald-100 text-emerald-700" },
  TRIALING: { label: "Trial", cls: "bg-amber-100 text-amber-700" },
  PAST_DUE: { label: "Gecikmiş", cls: "bg-red-100 text-red-700" },
  CANCELED: { label: "İptal", cls: "bg-zinc-100 text-zinc-500" },
};

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const org = await db.organization.findUnique({
    where: { id },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      members: { include: { user: { select: { name: true, email: true, createdAt: true } } } },
      locations: { select: { id: true, name: true, isActive: true } },
      _count: { select: { menuCategories: true, menuItems: true, members: true } },
    },
  });

  if (!org) notFound();

  const activeSub = org.subscriptions[0];

  return (
    <div>
      <div className="h-[60px] border-b border-border/60 bg-white/90 flex items-center gap-3 px-6">
        <Link href="/admin/organizasyonlar" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-[15px] font-semibold tracking-tight">{org.name}</h1>
        <span className="text-xs text-muted-foreground">/ {org.slug}</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Info + Actions */}
          <div className="space-y-4">
            {/* Org Info */}
            <div className="bg-white border border-border/70 shadow-sm rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-sm">Organizasyon Bilgileri</h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Ad", value: org.name },
                  { label: "Slug", value: org.slug },
                  { label: "E-posta", value: org.email || "—" },
                  { label: "Telefon", value: org.phone || "—" },
                  { label: "Plan", value: planLabel[org.plan] },
                  { label: "Kayıt", value: org.createdAt.toLocaleDateString("tr-TR") },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">{row.label}</span>
                    <span className="font-medium text-xs text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white border border-border/70 shadow-sm rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3">İstatistikler</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Kategori", value: org._count.menuCategories },
                  { label: "Ürün", value: org._count.menuItems },
                  { label: "Üye", value: org._count.members },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/40 rounded-lg p-2">
                    <p className="text-base font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <OrgAdminActions
              orgId={org.id}
              currentPlan={org.plan}
              activeSub={activeSub ? {
                id: activeSub.id,
                status: activeSub.status,
                currentPeriodEnd: activeSub.currentPeriodEnd,
              } : null}
            />
          </div>

          {/* Right: Subscription + Members */}
          <div className="lg:col-span-2 space-y-4">
            {/* Subscription history */}
            <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-sm">Abonelik Geçmişi</h2>
              </div>
              {org.subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground px-5 py-4">Abonelik kaydı yok</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Durum</th>
                      <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Başlangıç</th>
                      <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Bitiş</th>
                      <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Stripe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {org.subscriptions.map((sub) => {
                      const cfg = subStatusCfg[sub.status];
                      return (
                        <tr key={sub.id}>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs">
                            {sub.currentPeriodStart.toLocaleDateString("tr-TR")}
                          </td>
                          <td className="px-5 py-3 text-xs">
                            {sub.currentPeriodEnd.toLocaleDateString("tr-TR")}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground font-mono">
                            {sub.lsSubscriptionId ? sub.lsSubscriptionId.slice(0, 20) + "…" : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Members */}
            <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-sm">Üyeler ({org.members.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Ad</th>
                    <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">E-posta</th>
                    <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Rol</th>
                    <th className="text-left px-5 py-2.5 text-xs text-muted-foreground font-medium">Katıldı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {org.members.map((m) => (
                    <tr key={m.id}>
                      <td className="px-5 py-3 text-xs font-medium">{m.user.name || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{m.user.email}</td>
                      <td className="px-5 py-3 text-xs">{roleLabel[m.role]}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {m.createdAt.toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Locations */}
            <div className="bg-white border border-border/70 shadow-sm rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3">Şubeler ({org.locations.length})</h2>
              <div className="space-y-2">
                {org.locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between text-sm">
                    <span>{loc.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${loc.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {loc.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
