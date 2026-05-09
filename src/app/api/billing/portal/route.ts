import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// iyzico has no hosted billing portal like Stripe.
// Redirect users to the billing settings page.
export async function POST() {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ url: "/dashboard/ayarlar/fatura" });
}
