import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initCheckoutForm, PLANS, type PaidPlan } from "@/lib/iyzico";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") as PaidPlan | null;
  if (!plan || !["PROFESSIONAL", "ENTERPRISE"].includes(plan)) {
    return NextResponse.redirect(new URL("/dashboard/ayarlar/fatura", req.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const planConfig = PLANS[plan];

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  if (!user || !org) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  const nameParts = (user.name ?? org.name).split(" ");
  const firstName = nameParts[0] ?? "Müşteri";
  const lastName = nameParts.slice(1).join(" ") || org.name;

  try {
    const result = await initCheckoutForm({
      locale: "tr",
      conversationId: randomUUID(),
      callbackUrl: `${appUrl}/api/billing/callback?orgId=${org.id}`,
      pricingPlanReferenceCode: planConfig.planCode,
      subscriptionInitialStatus: "ACTIVE",
      customer: {
        name: firstName,
        surname: lastName,
        email: user.email,
        gsmNumber: org.phone ?? user.phone ?? "+905000000000",
        billingAddress: {
          contactName: `${firstName} ${lastName}`,
          city: "Istanbul",
          country: "Turkey",
          address: org.address ?? "Belirtilmedi",
          zipCode: "34000",
        },
        shippingAddress: {
          contactName: `${firstName} ${lastName}`,
          city: "Istanbul",
          country: "Turkey",
          address: org.address ?? "Belirtilmedi",
          zipCode: "34000",
        },
      },
    });

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ödeme — restoPAN</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .header { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #fff; border-bottom: 1px solid #e4e4e7; display: flex; align-items: center; justify-content: center; z-index: 10; }
    .logo { font-size: 16px; font-weight: 700; color: #18181b; }
    .logo span { color: #f97316; }
    .plan-badge { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-left: 12px; }
    .container { margin-top: 56px; padding: 32px 16px; width: 100%; max-width: 480px; }
    #iyzipay-checkout-form { width: 100%; }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">resto<span>PAN</span></span>
    <span class="plan-badge">${planConfig.name} — ₺${planConfig.price}/ay</span>
  </div>
  <div class="container">
    ${result.checkoutFormContent}
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[checkout-form]", err);
    return NextResponse.redirect(
      new URL("/dashboard/ayarlar/fatura?error=1", req.url)
    );
  }
}
