import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS, verifyWebhookSignature } from "@/lib/lemonsqueezy";

// LemonSqueezy webhook events:
// subscription_created, subscription_updated, subscription_cancelled,
// subscription_payment_success, subscription_payment_failed

function planFromVariantId(variantId: string | number | undefined): "PROFESSIONAL" | "ENTERPRISE" {
  const id = String(variantId ?? "");
  if (id === PLANS.ENTERPRISE.variantId) return "ENTERPRISE";
  return "PROFESSIONAL";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const customData = meta?.custom_data as Record<string, unknown> | undefined;

  if (!eventName || !data) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const attrs = data.attributes as Record<string, unknown> | undefined;
  const lsSubId = String(data.id ?? "");
  const variantId = String(attrs?.variant_id ?? "");
  const orgId = String(customData?.org_id ?? "");

  switch (eventName) {
    case "subscription_created": {
      if (!lsSubId || !orgId) break;
      const plan = planFromVariantId(variantId);
      const startDate = attrs?.current_period_start
        ? new Date(attrs.current_period_start as string)
        : new Date();
      const endDate = attrs?.current_period_end
        ? new Date(attrs.current_period_end as string)
        : new Date(Date.now() + 30 * 86400000);

      const orgSub = await db.subscription.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
      });

      if (orgSub) {
        await db.subscription.update({
          where: { id: orgSub.id },
          data: {
            lsSubscriptionId: lsSubId,
            lsVariantId: variantId,
            status: "ACTIVE",
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      } else {
        await db.subscription.create({
          data: {
            organizationId: orgId,
            lsSubscriptionId: lsSubId,
            lsVariantId: variantId,
            status: "ACTIVE",
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      }
      await db.organization.update({ where: { id: orgId }, data: { plan } });
      break;
    }

    case "subscription_updated":
    case "subscription_payment_success": {
      if (!lsSubId) break;
      const plan = planFromVariantId(variantId);
      const startDate = attrs?.current_period_start
        ? new Date(attrs.current_period_start as string)
        : new Date();
      const endDate = attrs?.current_period_end
        ? new Date(attrs.current_period_end as string)
        : new Date(Date.now() + 30 * 86400000);

      const sub = await db.subscription.findFirst({ where: { lsSubscriptionId: lsSubId } });
      if (sub) {
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            lsVariantId: variantId || sub.lsVariantId,
            status: "ACTIVE",
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
        await db.organization.update({ where: { id: sub.organizationId }, data: { plan } });
      }
      break;
    }

    case "subscription_payment_failed": {
      if (!lsSubId) break;
      await db.subscription.updateMany({
        where: { lsSubscriptionId: lsSubId },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    case "subscription_cancelled": {
      if (!lsSubId) break;
      const sub = await db.subscription.findFirst({ where: { lsSubscriptionId: lsSubId } });
      if (sub) {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "CANCELED", cancelAtPeriodEnd: false },
        });
        await db.organization.update({ where: { id: sub.organizationId }, data: { plan: "STARTER" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
