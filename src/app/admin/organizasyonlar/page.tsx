import { db } from "@/lib/db";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";

const planLabel: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

const planCls: Record<string, string> = {
  STARTER: "bg-zinc-100 text-zinc-600",
  PROFESSIONAL: "bg-blue-100 text-blue-700",
  ENTERPRISE: "bg-purple-100 text-purple-700",
};

const subStatusCfg: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Aktif", cls: "bg-emerald-100 text-emerald-700" },
  TRIALING: { label: "Trial", cls: "bg-amber-100 text-amber-700" },
  PAST_DUE: { label: "Gecikmiş", cls: "bg-red-100 text-red-700" },
  CANCELED: { label: "İptal", cls: "bg-zinc-100 text-zinc-500" },
};

export default async function AdminOrgsPage() {
  const orgs = await db.organization.findMany({
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { members: true, locations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="h-[60px] border-b border-border/60 bg-white/90 flex items-center justify-between px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Organizasyonlar</h1>
        <span className="text-xs text-muted-foreground">{orgs.length} toplam</span>
      </div>

      <div className="p-6">
        <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Organizasyon</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Abonelik</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Üye</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Şube</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Kayıt Tarihi</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orgs.map((org) => {
                const sub = org.subscriptions[0];
                const statusCfg = sub ? subStatusCfg[sub.status] : null;
                return (
                  <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planCls[org.plan]}`}>
                        {planLabel[org.plan]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {statusCfg ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs">{org._count.members}</td>
                    <td className="px-5 py-3.5 text-xs">{org._count.locations}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {org.createdAt.toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/organizasyonlar/${org.id}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Detay <ChevronRight className="w-3 h-3" />
                      </Link>
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
