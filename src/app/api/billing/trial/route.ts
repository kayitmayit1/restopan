import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageBilling } from "@/lib/billing-guard";
import { z } from "zod";

const bodySchema = z.object({ acceptedTerms: z.literal(true).optional() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId || !canManageBilling(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let acceptedTermsExplicit = false;
  try {
    const raw: unknown = await req.json();
    const parsedBody = bodySchema.safeParse(raw);
    acceptedTermsExplicit = parsedBody.success && parsedBody.data.acceptedTerms === true;
  } catch {
    acceptedTermsExplicit = false;
  }

  try {
    const org = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (org.buyNowCheckoutPending) {
      return NextResponse.json(
        { error: "Satın alma sürecindeki hesaplarda önce ödeme tamamlanmalıdır." },
        { status: 400 }
      );
    }

    if (org.plan !== "STARTER") {
      return NextResponse.json({ error: "Deneme yalnızca Starter planındaki hesaplar için başlatılabilir." }, { status: 400 });
    }

    if (!org.termsAcceptedAt) {
      if (!acceptedTermsExplicit) {
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

    if (existingSub?.iyzicoSubId) {
      return NextResponse.json(
        { error: "Ödemeli bir abonelik kaydı olan hesaplarda ücretsiz deneme başlatılamaz." },
        { status: 400 }
      );
    }

    if (existingSub?.status === "TRIALING" && existingSub.currentPeriodEnd > new Date()) {
      return NextResponse.json({ error: "Deneme süreniz zaten aktif." }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 14);

    // Update or create subscription
    if (existingSub) {
      await db.subscription.update({
        where: { id: existingSub.id },
        data: {
          status: "TRIALING",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    } else {
      await db.subscription.create({
        data: {
          organizationId: org.id,
          status: "TRIALING",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    // Update organization plan
    await db.organization.update({
      where: { id: org.id },
      data: { plan: "PROFESSIONAL" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[billing/trial]", error);
    return NextResponse.json(
      { error: "Trial başlatma başarısız" },
      { status: 500 }
    );
  }
}
