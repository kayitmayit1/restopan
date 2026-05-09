import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upgradeSubscription, PLANS } from "@/lib/iyzico";
import { z } from "zod";
import { canManageBilling } from "@/lib/billing-guard";

const schema = z.object({
  plan: z.enum(["PROFESSIONAL", "ENTERPRISE"]),
  acceptedTerms: z.literal(true).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
  }
  const { plan, acceptedTerms } = parsed.data;

  const session = await auth();
  if (!session?.user.organizationId || !canManageBilling(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PLANS[plan].planCode) {
    return NextResponse.json(
      {
        error:
          "Ödeme altyapısı yapılandırılmadı (IYZICO_PLAN_*). Lütfen yöneticiye bildirin.",
      },
      { status: 503 }
    );
  }

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!org.termsAcceptedAt) {
    if (acceptedTerms !== true) {
      return NextResponse.json(
        {
          error: "Devam etmek için kullanım koşullarını ve mesafeli satış sözleşmesini okuyup onaylamanız gerekir.",
          code: "TERMS_REQUIRED",
        },
        { status: 400 }
      );
    }
    await db.organization.update({
      where: { id: org.id },
      data: { termsAcceptedAt: new Date() },
    });
  }

  const existingSub = org.subscriptions[0];

  // Active iyzico subscription → upgrade plan
  if (existingSub?.iyzicoSubId && existingSub.status === "ACTIVE") {
    try {
      await upgradeSubscription({
        subscriptionReferenceCode: existingSub.iyzicoSubId,
        newPricingPlanReferenceCode: PLANS[plan].planCode,
        upgradePeriod: "NOW",
      });
      await db.subscription.update({
        where: { id: existingSub.id },
        data: { iyzicoPlanCode: PLANS[plan].planCode },
      });
      await db.organization.update({ where: { id: org.id }, data: { plan } });
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("[billing/checkout upgrade]", err);
      return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
    }
  }

  // New subscription → same-origin checkout form (avoids wrong NEXT_PUBLIC_APP_URL)
  const checkoutPath =
    `/api/billing/checkout-form?plan=` + encodeURIComponent(plan);
  return NextResponse.json({ url: checkoutPath });
}
