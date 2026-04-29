import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cancelSubscription } from "@/lib/iyzico";

export async function POST() {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await db.subscription.findFirst({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  if (!sub?.iyzicoSubId) {
    return NextResponse.json({ error: "Aktif iyzico aboneliği bulunamadı" }, { status: 400 });
  }

  try {
    await cancelSubscription(sub.iyzicoSubId);

    await db.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELED" },
    });
    await db.organization.update({
      where: { id: session.user.organizationId },
      data: { plan: "STARTER" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[billing/cancel]", err);
    return NextResponse.json({ error: "İptal işlemi başarısız" }, { status: 500 });
  }
}
