import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retrieveCheckoutForm, PLANS } from "@/lib/iyzico";
import { verifyBillingCallbackOrg } from "@/lib/billing-guard";

export async function POST(req: NextRequest) {
  const appUrl = req.nextUrl.origin;

  try {
    const formData = await req.formData();
    const token = formData.get("token") as string | null;
    const status = formData.get("status") as string | null;

    if (!token || status !== "success") {
      return NextResponse.redirect(
        new URL("/dashboard/ayarlar/fatura?error=payment_failed", appUrl)
      );
    }

    const result = await retrieveCheckoutForm(token);

    if (result.status !== "success") {
      return NextResponse.redirect(
        new URL("/dashboard/ayarlar/fatura?error=payment_failed", appUrl)
      );
    }

    const subRefCode = result.referenceCode;
    const planCode = result.pricingPlanReferenceCode;

    const plan =
      planCode === PLANS.PROFESSIONAL.planCode
        ? "PROFESSIONAL"
        : planCode === PLANS.ENTERPRISE.planCode
        ? "ENTERPRISE"
        : "PROFESSIONAL";

    const startDate = result.startDate ? new Date(result.startDate) : new Date();
    const endDate = result.endDate
      ? new Date(result.endDate)
      : new Date(Date.now() + 30 * 86400000);

    const subStatus =
      result.subscriptionStatus === "ACTIVE"
        ? "ACTIVE"
        : result.subscriptionStatus === "TRIAL"
        ? "TRIALING"
        : "ACTIVE";

    const failedUrl = new URL("/dashboard/ayarlar/fatura?error=payment_failed", appUrl);

    const orgId =
      new URL(req.url).searchParams.get("orgId") ??
      new URL(req.url).searchParams.get("org") ??
      null;
    const sig = new URL(req.url).searchParams.get("sig");

    const existing = await db.subscription.findFirst({
      where: { iyzicoSubId: subRefCode },
    });

    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          status: subStatus,
          iyzicoPlanCode: planCode,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });
      await db.organization.update({
        where: { id: existing.organizationId },
        data: {
          plan,
          buyNowCheckoutPending: false,
        },
      });
    } else if (!orgId || !verifyBillingCallbackOrg(orgId, sig)) {
      return NextResponse.redirect(failedUrl);
    } else {
      const orgExists = await db.organization.findUnique({ where: { id: orgId }, select: { id: true } });
      if (!orgExists) {
        return NextResponse.redirect(failedUrl);
      }

      const orgSub = await db.subscription.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
      });

      if (orgSub) {
        await db.subscription.update({
          where: { id: orgSub.id },
          data: {
            iyzicoSubId: subRefCode,
            iyzicoPlanCode: planCode,
            status: subStatus,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      } else {
        await db.subscription.create({
          data: {
            organizationId: orgId,
            iyzicoSubId: subRefCode,
            iyzicoPlanCode: planCode,
            status: subStatus,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      }
      await db.organization.update({
        where: { id: orgId },
        data: { plan, buyNowCheckoutPending: false },
      });
    }

    return NextResponse.redirect(
      new URL("/dashboard/ayarlar/fatura?success=1", appUrl)
    );
  } catch (err) {
    console.error("[billing/callback]", err);
    return NextResponse.redirect(
      new URL("/dashboard/ayarlar/fatura?error=1", appUrl)
    );
  }
}
