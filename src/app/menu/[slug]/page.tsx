import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { OnlineMenuClient } from "@/components/menu/online-menu-client";

export default async function OnlineMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { slug } = await params;
  const { table: tableId } = await searchParams;

  const organization = await db.organization.findUnique({
    where: { slug },
    include: { locations: { where: { isActive: true }, take: 1 } },
  });

  if (!organization) notFound();

  const locationId = organization.locations[0]?.id;

  // Resolve table name if tableId provided
  let tableName: string | undefined;
  if (tableId) {
    const table = await db.table.findUnique({ where: { id: tableId }, select: { name: true } });
    tableName = table?.name;
  }

  const categories = await db.menuCategory.findMany({
    where: { organizationId: organization.id, isActive: true },
    include: {
      items: {
        where: { isActive: true, isAvailable: true },
        include: { variants: { where: { isActive: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <OnlineMenuClient
      organization={{ id: organization.id, name: organization.name, logo: organization.logo, currency: organization.currency }}
      categories={categories}
      locationId={locationId}
      tableId={tableId}
      tableName={tableName}
    />
  );
}
