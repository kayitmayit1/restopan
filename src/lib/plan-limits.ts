import { db } from "@/lib/db";

export const PLAN_LIMITS = {
  STARTER: { tables: 10, members: 2, locations: 1 },
  PROFESSIONAL: { tables: 50, members: 10, locations: 3 },
  ENTERPRISE: { tables: Infinity, members: Infinity, locations: Infinity },
} as const;

type PlanType = keyof typeof PLAN_LIMITS;
type LimitKey = keyof (typeof PLAN_LIMITS)["STARTER"];

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
    current = await db.organizationMember.count({ where: { organizationId } });
  } else if (resource === "locations") {
    current = await db.location.count({ where: { organizationId } });
  }

  return { allowed: current < limit, current, limit, plan };
}

export function limitError(resource: LimitKey, limit: number, plan: PlanType) {
  const labels: Record<LimitKey, string> = {
    tables: "masa",
    members: "kullanıcı",
    locations: "şube",
  };
  return {
    error: "PLAN_LIMIT_EXCEEDED",
    message: `${plan} planında maksimum ${limit} ${labels[resource]} oluşturabilirsiniz. Daha fazlası için planınızı yükseltin.`,
    upgradeRequired: true,
  };
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
