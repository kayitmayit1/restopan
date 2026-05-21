import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cancelSubscription } from "@/lib/lemonsqueezy";
import { canManageBilling } from "@/lib/billing-guard";

export async function POST() {
  const session = await auth();
  if (!session?.user.organizationId || !canManageBilling(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await db.subscription.findFirst({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) {
    return NextResponse.json({ error: "Aktif abonelik bulunamadı" }, { status: 400 });
  }

  try {
    if (sub.lsSubscriptionId) {
      // LemonSqueezy'de dönem sonunda iptal et (anında değil)
      await cancelSubscription(sub.lsSubscriptionId);
    }

    // DB'de sadece "dönem sonunda iptal" bayrağını set et, plan değişmez
    await db.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[billing/cancel]", err);
    return NextResponse.json({ error: "İptal işlemi başarısız" }, { status: 500 });
  }
}
