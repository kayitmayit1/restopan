import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  locationName: z.string().min(1).default("Ana Şube"),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default("TRY"),
  taxRate: z.number().min(0).max(100).default(10),
  businessType: z.string().optional(),
  tableCount: z.number().min(0).max(200),
  tablePrefix: z.string().default("Masa"),
  tableCapacity: z.number().default(4),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = schema.parse(body);
  const orgId = session.user.organizationId;

  await db.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: orgId },
      data: {
        phone: data.phone || null,
        address: data.address || null,
        currency: data.currency,
        taxRate: data.taxRate,
        taxIncluded: true,
      },
    });

    const location = await tx.location.findFirst({ where: { organizationId: orgId } });
    if (location) {
      await tx.location.update({
        where: { id: location.id },
        data: {
          name: data.locationName,
          phone: data.phone || null,
          address: data.address || null,
        },
      });

      if (data.tableCount > 0) {
        await tx.table.createMany({
          data: Array.from({ length: data.tableCount }, (_, i) => ({
            locationId: location.id,
            name: `${data.tablePrefix} ${i + 1}`,
            capacity: data.tableCapacity,
            status: "AVAILABLE" as const,
          })),
          skipDuplicates: true,
        });
      }
    }
  });

  return NextResponse.json({ success: true });
}
