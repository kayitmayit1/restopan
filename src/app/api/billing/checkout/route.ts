import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upgradeSubscription, PLANS, type PaidPlan } from "@/lib/iyzico";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["PROFESSIONAL", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = schema.parse(body) as { plan: PaidPlan };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  // New subscription → redirect to iyzico checkout form page
  return NextResponse.json({
    url: `${appUrl}/api/billing/checkout-form?plan=${plan}`,
  });
}
