import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export default async function BildirimlerPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const notifications = await db.notification.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <Topbar title="Bildirimler" subtitle="Sistem ve operasyon bildirimleri" />
      <div className="p-6">
        <NotificationsClient notifications={notifications} />
      </div>
    </div>
  );
}
