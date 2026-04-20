import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: {
      memberships: {
        include: { organization: { select: { name: true, plan: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="h-[60px] border-b border-border/60 bg-white/90 flex items-center justify-between px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Kullanıcılar</h1>
        <span className="text-xs text-muted-foreground">{users.length} toplam</span>
      </div>

      <div className="p-6">
        <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Kullanıcı</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">E-posta</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Organizasyonlar</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-xs">{user.name || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {user.memberships.map((m) => (
                        <span
                          key={m.id}
                          className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-medium"
                        >
                          {m.organization.name}
                        </span>
                      ))}
                      {user.memberships.length === 0 && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {user.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
