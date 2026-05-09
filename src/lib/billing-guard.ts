import { createHmac, timingSafeEqual } from "crypto";
import type { Session } from "next-auth";

/** Ayarlar / fatura ve faturalama API ile aynı: OWNER ve ADMIN */
export const OWNER_BILLING_ROLES = ["OWNER", "ADMIN"] as const;

export function canManageBilling(session: Session | null): boolean {
  const role = session?.user?.role;
  return !!(session?.user?.organizationId && OWNER_BILLING_ROLES.includes(role as (typeof OWNER_BILLING_ROLES)[number]));
}

function billingCallbackSecret(): string | null {
  return process.env.BILLING_CALLBACK_SECRET ?? process.env.NEXTAUTH_SECRET ?? null;
}

export function signingOrgId(orgId: string): string | null {
  const secret = billingCallbackSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(`billing-org:${orgId}`).digest("hex");
}

export function verifyBillingCallbackOrg(orgId: string | null, sig: string | null): boolean {
  const secret = billingCallbackSecret();
  if (!secret || !orgId || !sig) return false;
  const expected = createHmac("sha256", secret).update(`billing-org:${orgId}`).digest("hex");
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig, "utf8"));
  } catch {
    return false;
  }
}
