import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const customer = await db.customer.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orders = await db.order.findMany({
    where: { customerId: id },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(orders);
}
