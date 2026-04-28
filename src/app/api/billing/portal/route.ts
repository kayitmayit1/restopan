import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// iyzico has no hosted billing portal like Stripe.
// Redirect users to the billing settings page.
export async function POST() {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({ url: `${appUrl}/dashboard/ayarlar/fatura` });
}
