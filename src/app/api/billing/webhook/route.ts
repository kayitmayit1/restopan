import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode !== "subscription") break;
      const orgId = cs.metadata?.organizationId;
      const plan = (cs.metadata?.plan ?? "PROFESSIONAL") as "PROFESSIONAL" | "ENTERPRISE";
      if (!orgId || typeof cs.subscription !== "string") break;

      const sub = await stripe.subscriptions.retrieve(cs.subscription);
      await upsertSubscription(orgId, sub, plan);
      await db.organization.update({ where: { id: orgId }, data: { plan } });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organizationId;
      if (!orgId) break;
      const plan = (sub.metadata?.plan ?? "PROFESSIONAL") as "PROFESSIONAL" | "ENTERPRISE";
      await upsertSubscription(orgId, sub, plan);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organizationId;
      if (!orgId) break;
      await db.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: "CANCELED" },
      });
      await db.organization.update({ where: { id: orgId }, data: { plan: "STARTER" } });
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as unknown as { subscription?: string | { id: string } };
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      if (!subId) break;
      await db.subscription.updateMany({
        where: { stripeSubId: subId },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  orgId: string,
  sub: Stripe.Subscription,
  plan: "PROFESSIONAL" | "ENTERPRISE"
) {
  const status =
    sub.status === "trialing" ? "TRIALING" :
    sub.status === "active" ? "ACTIVE" :
    sub.status === "past_due" ? "PAST_DUE" : "CANCELED";

  const item = sub.items.data[0];
  const periodStart = new Date((item?.billing_thresholds as unknown as { current_period_start?: number })?.current_period_start ?? Date.now());
  const periodEnd = new Date((item?.billing_thresholds as unknown as { current_period_end?: number })?.current_period_end ?? Date.now() + 30 * 86400000);

  // Use subscription-level billing cycle from Stripe's response
  const subAny = sub as unknown as { current_period_start: number; current_period_end: number };

  await db.subscription.upsert({
    where: { stripeSubId: sub.id },
    create: {
      organizationId: orgId,
      stripeSubId: sub.id,
      stripePriceId: item?.price.id,
      status,
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
    },
    update: {
      status,
      stripePriceId: item?.price.id,
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
    },
  });

  void plan;
}
