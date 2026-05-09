import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cancelSubscription } from "@/lib/iyzico";
import { canManageBilling } from "@/lib/billing-guard";

export async function POST() {
  const session = await auth();
  if (!session?.user?.organizationId || !canManageBilling(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId;

  const org = await db.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
  if (org?.plan === "STARTER") {
    return NextResponse.json({ error: "Zaten Starter planındasınız" }, { status: 400 });
  }

  const sub = await db.subscription.findFirst({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const farFuture = new Date(now);
  farFuture.setFullYear(farFuture.getFullYear() + 100);

  let canceledPaidRemote = false;
  if (sub?.iyzicoSubId && (sub.status === "ACTIVE" || sub.status === "PAST_DUE")) {
    try {
      const result = (await cancelSubscription(sub.iyzicoSubId)) as { status?: string };
      const st = result?.status?.toLowerCase?.() ?? "";
      if (st !== "success") {
        console.warn("[billing/downgrade] iyzico unexpected status:", result);
        return NextResponse.json(
          { error: "Abonelik iptali tamamlanamadığı için plan düşürülemedi." },
          { status: 502 }
        );
      }
      canceledPaidRemote = true;
    } catch (err) {
      console.error("[billing/downgrade] cancel", err);
      return NextResponse.json(
        { error: "Ödeme sağlayıcısı bağlantı hatası. Lütfen tekrar deneyin." },
        { status: 502 }
      );
    }
  }

  await db.$transaction([
    db.organization.update({
      where: { id: orgId },
      data: { plan: "STARTER", buyNowCheckoutPending: false },
    }),
    ...(sub
      ? [
          db.subscription.update({
            where: { id: sub.id },
            data: {
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: farFuture,
              ...(canceledPaidRemote ? { iyzicoSubId: null, iyzicoPlanCode: null } : {}),
            },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ success: true });
}
