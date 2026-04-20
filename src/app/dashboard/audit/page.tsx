import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const logs = await db.auditLog.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const actionColor: Record<string, string> = {
    CREATE: "bg-emerald-100 text-emerald-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    LOGIN: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <Topbar title="İşlem Kaydı" subtitle="Sistemdeki tüm işlemlerin geçmişi" />
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Son İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Henüz işlem kaydı yok</p>
            ) : (
              <div className="space-y-0 divide-y">
                {logs.map((log) => {
                  const verb = log.action.split("_")[0];
                  return (
                    <div key={log.id} className="flex items-center gap-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${actionColor[verb] ?? "bg-muted text-muted-foreground"}`}>
                        {log.action}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-muted-foreground ml-1 font-mono text-xs">#{log.entityId.slice(-6)}</span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs flex-shrink-0">
                        {log.userId ? (userMap[log.userId] ?? "Bilinmiyor") : "Sistem"}
                      </span>
                      <span className="text-muted-foreground text-xs flex-shrink-0 w-36 text-right">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
