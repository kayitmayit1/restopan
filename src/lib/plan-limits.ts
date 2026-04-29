export const PLAN_LIMITS = {
  STARTER: { tables: 10, members: 3, locations: 1 },
  PROFESSIONAL: { tables: 50, members: 10, locations: 3 },
  ENTERPRISE: { tables: Infinity, members: Infinity, locations: Infinity },
} as const;

// Features unlocked per plan (cumulative — each plan includes all previous)
export const PLAN_FEATURES = {
  STARTER: [
    "pos", "tables", "kds", "orders", "menu",
    "reservations", "staff", "inventory", "notifications", "kasa",
  ],
  PROFESSIONAL: [
    "pos", "tables", "kds", "orders", "menu",
    "reservations", "staff", "inventory", "notifications",
    "analytics", "finance", "kasa", "online-order",
    "campaigns", "customers", "suppliers",
  ],
  ENTERPRISE: ["*"],
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type PlanFeature = string;

export function hasFeature(plan: PlanType, feature: PlanFeature): boolean {
  const features = PLAN_FEATURES[plan] as readonly string[];
  return features.includes("*") || features.includes(feature);
}

export type LimitKey = keyof (typeof PLAN_LIMITS)["STARTER"];

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
