import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DeliveryMenuClient } from "@/components/menu/delivery-menu-client";

export default async function DeliveryOrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const organization = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true, name: true, logo: true, currency: true, slug: true,
      deliveryMinOrder: true, deliveryFee: true, deliveryZone: true,
      locations: { where: { isActive: true }, take: 1, select: { id: true } },
    },
  });

  if (!organization) notFound();

  const locationId = organization.locations[0]?.id;

  const categories = await db.menuCategory.findMany({
    where: { organizationId: organization.id, isActive: true },
    include: {
      items: {
        where: { isActive: true, isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <DeliveryMenuClient
      organization={{ id: organization.id, name: organization.name, logo: organization.logo, currency: organization.currency }}
      categories={categories}
      locationId={locationId}
      deliveryMinOrder={organization.deliveryMinOrder ?? undefined}
      deliveryFee={organization.deliveryFee ?? undefined}
      deliveryZone={organization.deliveryZone ?? undefined}
    />
  );
}
