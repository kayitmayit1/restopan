import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";
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
  const { plan } = schema.parse(body);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const planConfig = PLANS[plan];
  const stripeSubId = org.subscriptions[0]?.stripeSubId;

  // If existing Stripe subscription, update it
  if (stripeSubId) {
    const sub = await stripe.subscriptions.retrieve(stripeSubId);
    await stripe.subscriptions.update(stripeSubId, {
      items: [{ id: sub.items.data[0].id, price: planConfig.priceId }],
      proration_behavior: "always_invoice",
    });
    return NextResponse.json({ success: true });
  }

  // New checkout session
  let customerId: string | undefined;
  const existingCustomers = await stripe.customers.list({ email: session.user.email!, limit: 1 });
  if (existingCustomers.data.length > 0) {
    customerId = existingCustomers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: org.name,
      metadata: { organizationId: org.id },
    });
    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/ayarlar/fatura?success=1`,
    cancel_url: `${appUrl}/dashboard/ayarlar/fatura?canceled=1`,
    metadata: { organizationId: org.id, plan },
    subscription_data: {
      metadata: { organizationId: org.id, plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
