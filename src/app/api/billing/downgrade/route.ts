import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId;

  const org = await db.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
  if (org?.plan === "STARTER") {
    return NextResponse.json({ error: "Zaten Starter planındasınız" }, { status: 400 });
  }

  const now = new Date();
  const farFuture = new Date(now);
  farFuture.setFullYear(farFuture.getFullYear() + 100);

  await db.$transaction([
    db.organization.update({
      where: { id: orgId },
      data: { plan: "STARTER" },
    }),
    db.subscription.updateMany({
      where: { organizationId: orgId },
      data: {
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: farFuture,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
