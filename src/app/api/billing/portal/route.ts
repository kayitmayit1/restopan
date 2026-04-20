import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const customers = await stripe.customers.list({ email: session.user.email!, limit: 1 });
  if (customers.data.length === 0) {
    return NextResponse.json({ error: "No billing account" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${appUrl}/dashboard/ayarlar/fatura`,
  });

  return NextResponse.json({ url: portalSession.url });
}
