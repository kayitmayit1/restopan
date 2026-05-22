import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MenuUI } from "./menu-ui";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ masa?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await db.organization.findUnique({ where: { slug }, select: { name: true, logo: true } });
  if (!org) return { title: "Menü" };
  return {
    title: `${org.name} — Menü`,
    openGraph: { title: `${org.name} — Menü`, images: org.logo ? [org.logo] : [] },
  };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { masa: tableId } = await searchParams;

  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      logo: true,
      currency: true,
      taxRate: true,
      taxIncluded: true,
      dailySpecial: true,
      dailySpecialActive: true,
      wifiName: true,
      wifiPassword: true,
      instagramUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      menuCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          availableFrom: true,
          availableTo: true,
          items: {
            where: { isActive: true, isAvailable: true },
            orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
              price: true,
              calories: true,
              preparationTime: true,
              allergens: true,
              isFeatured: true,
              variants: {
                where: { isActive: true },
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
      },
    },
  });

  if (!org) notFound();

  let tableName: string | null = null;
  let locationId: string | null = null;

  if (tableId) {
    const table = await db.table.findUnique({
      where: { id: tableId },
      select: { name: true, locationId: true },
    });
    tableName = table?.name ?? null;
    locationId = table?.locationId ?? null;
  }

  if (!locationId) {
    const location = await db.location.findFirst({
      where: { organizationId: org.id },
      select: { id: true },
    });
    locationId = location?.id ?? null;
  }

  const categories = org.menuCategories.filter((c) => c.items.length > 0);

  return (
    <MenuUI
      org={{
        name: org.name,
        logo: org.logo,
        currency: org.currency,
        dailySpecial: org.dailySpecialActive ? (org.dailySpecial ?? null) : null,
        wifiName: org.wifiName,
        wifiPassword: org.wifiPassword,
        instagramUrl: org.instagramUrl,
        facebookUrl: org.facebookUrl,
        twitterUrl: org.twitterUrl,
      }}
      categories={categories}
      tableName={tableName}
      tableId={tableId ?? null}
      orgId={org.id}
      locationId={locationId}
    />
  );
}
