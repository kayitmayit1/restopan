import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/iyzico";

// iyzico sends webhook events as JSON POST requests
// Event types: subscription.order.success, subscription.order.failure,
//              subscription.canceled, subscription.upgraded, subscription.activated

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const eventType = body.eventType as string | undefined;
    const data = body.data as Record<string, unknown> | undefined;

    if (!eventType || !data) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const subRefCode = data.referenceCode as string | undefined;
    const planCode = data.pricingPlanReferenceCode as string | undefined;

    switch (eventType) {
      case "subscription.order.success": {
        if (!subRefCode) break;
        const plan =
          planCode === PLANS.PROFESSIONAL.planCode
            ? "PROFESSIONAL"
            : planCode === PLANS.ENTERPRISE.planCode
            ? "ENTERPRISE"
            : "PROFESSIONAL";

        const startDate = data.startDate ? new Date(data.startDate as string) : new Date();
        const endDate = data.endDate
          ? new Date(data.endDate as string)
          : new Date(Date.now() + 30 * 86400000);

        const sub = await db.subscription.findFirst({
          where: { iyzicoSubId: subRefCode },
        });
        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: "ACTIVE", currentPeriodStart: startDate, currentPeriodEnd: endDate },
          });
          await db.organization.update({
            where: { id: sub.organizationId },
            data: { plan },
          });
        }
        break;
      }

      case "subscription.order.failure": {
        if (!subRefCode) break;
        await db.subscription.updateMany({
          where: { iyzicoSubId: subRefCode },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      case "subscription.canceled": {
        if (!subRefCode) break;
        const sub = await db.subscription.findFirst({
          where: { iyzicoSubId: subRefCode },
        });
        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: "CANCELED" },
          });
          await db.organization.update({
            where: { id: sub.organizationId },
            data: { plan: "STARTER" },
          });
        }
        break;
      }

      case "subscription.activated": {
        if (!subRefCode) break;
        const plan =
          planCode === PLANS.PROFESSIONAL.planCode
            ? "PROFESSIONAL"
            : planCode === PLANS.ENTERPRISE.planCode
            ? "ENTERPRISE"
            : "PROFESSIONAL";
        const startDate = data.startDate ? new Date(data.startDate as string) : new Date();
        const endDate = data.endDate
          ? new Date(data.endDate as string)
          : new Date(Date.now() + 30 * 86400000);
        const sub = await db.subscription.findFirst({ where: { iyzicoSubId: subRefCode } });
        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: "ACTIVE", iyzicoPlanCode: planCode ?? sub.iyzicoPlanCode, currentPeriodStart: startDate, currentPeriodEnd: endDate },
          });
          await db.organization.update({ where: { id: sub.organizationId }, data: { plan } });
        }
        break;
      }

      case "subscription.upgraded": {
        if (!subRefCode || !planCode) break;
        const plan =
          planCode === PLANS.PROFESSIONAL.planCode
            ? "PROFESSIONAL"
            : planCode === PLANS.ENTERPRISE.planCode
            ? "ENTERPRISE"
            : "PROFESSIONAL";
        const sub = await db.subscription.findFirst({
          where: { iyzicoSubId: subRefCode },
        });
        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { iyzicoPlanCode: planCode },
          });
          await db.organization.update({
            where: { id: sub.organizationId },
            data: { plan },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[billing/webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
