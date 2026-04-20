import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { MenuManagement } from "@/components/menu/menu-management";

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const categories = await db.menuCategory.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      items: {
        include: { variants: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Topbar title="Menü Yönetimi" subtitle="Kategoriler, ürünler ve fiyatlar" />
      <div className="p-6">
        <MenuManagement
          categories={categories}
          organizationId={session.user.organizationId}
        />
      </div>
    </div>
  );
}
