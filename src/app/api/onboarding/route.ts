import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default("TRY"),
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

  await db.organization.update({
    where: { id: orgId },
    data: {
      phone: data.phone || null,
      address: data.address || null,
      currency: data.currency,
    },
  });

  if (data.tableCount > 0) {
    const location = await db.location.findFirst({
      where: { organizationId: orgId },
    });

    if (location) {
      await db.table.createMany({
        data: Array.from({ length: data.tableCount }, (_, i) => ({
          organizationId: orgId,
          locationId: location.id,
          name: `${data.tablePrefix} ${i + 1}`,
          capacity: data.tableCapacity,
          status: "AVAILABLE",
          sortOrder: i,
        })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ success: true });
}
