import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function AyarlarPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const [organization, locations] = await Promise.all([
    db.organization.findUnique({
      where: { id: session.user.organizationId },
    }),
    db.location.findMany({
      where: { organizationId: session.user.organizationId },
      include: { _count: { select: { tables: true, members: true } } },
    }),
  ]);

  if (!organization) return null;

  return (
    <div>
      <Topbar title="Ayarlar" subtitle="Restoran ve sistem ayarları" />
      <div className="p-6">
        <SettingsClient organization={organization} locations={locations} />
      </div>
    </div>
  );
}
