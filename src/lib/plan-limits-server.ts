import { db } from "@/lib/db";
import { PLAN_LIMITS, type PlanType, type LimitKey } from "@/lib/plan-limits";

export { limitError } from "@/lib/plan-limits";

export async function checkLimit(
  organizationId: string,
  resource: LimitKey
): Promise<{ allowed: boolean; current: number; limit: number; plan: PlanType }> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  const plan = (org?.plan ?? "STARTER") as PlanType;
  const limit = PLAN_LIMITS[plan][resource];

  let current = 0;
  if (resource === "tables") {
    current = await db.table.count({ where: { location: { organizationId } } });
  } else if (resource === "members") {
    current = await db.organizationMember.count({ where: { organizationId, role: { not: "OWNER" } } });
  } else if (resource === "locations") {
    current = await db.location.count({ where: { organizationId } });
  }

  return { allowed: current < limit, current, limit, plan };
}

export async function isSubscriptionActive(organizationId: string): Promise<boolean> {
  const sub = await db.subscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) return false;
  if (sub.status === "ACTIVE") return true;
  if (sub.status === "TRIALING" && sub.currentPeriodEnd > new Date()) return true;
  return false;
}
