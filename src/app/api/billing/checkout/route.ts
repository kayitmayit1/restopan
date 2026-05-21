import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckout, updateSubscription, PLANS } from "@/lib/lemonsqueezy";
import { z } from "zod";
import { canManageBilling } from "@/lib/billing-guard";

const schema = z.object({
  plan: z.enum(["PROFESSIONAL", "ENTERPRISE"]),
  acceptedTerms: z.literal(true).optional(),
  fromPaymentPage: z.boolean().optional(),
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
  const { plan, acceptedTerms, fromPaymentPage } = parsed.data;

  const session = await auth();
  if (!session?.user.organizationId || !canManageBilling(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Test modu: ödeme sayfasına yönlendir, oradan geliyorsa planı aktive et
  if (process.env.PAYMENT_TEST_MODE === "true") {
    if (!fromPaymentPage) {
      return NextResponse.json({ url: `/odeme?plan=${encodeURIComponent(plan)}` });
    }
    const existingSubTest = org.subscriptions[0];
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    if (existingSubTest) {
      await db.subscription.update({
        where: { id: existingSubTest.id },
        data: { status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd: periodEnd },
      });
    } else {
      await db.subscription.create({
        data: { organizationId: org.id, status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd: periodEnd },
      });
    }
    await db.organization.update({ where: { id: org.id }, data: { plan } });
    return NextResponse.json({ success: true });
  }

  if (!PLANS[plan].variantId) {
    return NextResponse.json(
      { error: "Ödeme altyapısı yapılandırılmadı (LEMONSQUEEZY_VARIANT_*). Lütfen yöneticiye bildirin." },
      { status: 503 }
    );
  }

  const existingSub = org.subscriptions[0];

  // Aktif LS aboneliği varsa → plan güncelle
  if (existingSub?.lsSubscriptionId && existingSub.status === "ACTIVE") {
    try {
      await updateSubscription(existingSub.lsSubscriptionId, PLANS[plan].variantId);
      await db.subscription.update({
        where: { id: existingSub.id },
        data: { lsVariantId: PLANS[plan].variantId },
      });
      await db.organization.update({ where: { id: org.id }, data: { plan } });
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("[billing/checkout upgrade]", err);
      return NextResponse.json({ error: "Plan yükseltme başarısız" }, { status: 500 });
    }
  }

  // Yeni abonelik → LemonSqueezy checkout URL oluştur
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const publicOrigin = req.nextUrl.origin;
  const redirectUrl = `${publicOrigin}/dashboard/ayarlar/fatura?success=1`;

  try {
    const checkoutUrl = await createCheckout({
      variantId: PLANS[plan].variantId,
      email: user.email,
      name: user.name ?? org.name,
      orgId: org.id,
      redirectUrl,
    });
    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Ödeme sayfası oluşturulamadı" }, { status: 500 });
  }
}
