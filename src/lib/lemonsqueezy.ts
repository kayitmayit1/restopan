import { createHmac } from "crypto";

const LS_API = "https://api.lemonsqueezy.com/v1";

async function lsRequest(method: string, path: string, body?: unknown) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY yapılandırılmamış");

  const res = await fetch(`${LS_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (method === "DELETE" && res.status === 204) return null;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LemonSqueezy ${method} ${path} başarısız (${res.status}): ${text}`);
  }

  return res.json();
}

export const PLANS = {
  STARTER: {
    name: "Starter",
    variantId: "",
    price: 0,
    limits: { tables: 10, users: 2, locations: 1 },
  },
  PROFESSIONAL: {
    name: "Professional",
    variantId: process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL ?? "",
    price: 999,
    limits: { tables: 50, users: 10, locations: 3 },
  },
  ENTERPRISE: {
    name: "Enterprise",
    variantId: process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE ?? "",
    price: 2499,
    limits: { tables: 999, users: 999, locations: 999 },
  },
} as const;

export type PaidPlan = "PROFESSIONAL" | "ENTERPRISE";

export async function createCheckout({
  variantId,
  email,
  name,
  orgId,
  redirectUrl,
}: {
  variantId: string;
  email: string;
  name: string;
  orgId: string;
  redirectUrl: string;
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID yapılandırılmamış");

  const data = await lsRequest("POST", "/checkouts", {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email,
          name,
          custom: { org_id: orgId },
        },
        product_options: {
          redirect_url: redirectUrl,
        },
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  });

  return data.data.attributes.url as string;
}

export async function updateSubscription(subscriptionId: string, variantId: string) {
  return lsRequest("PATCH", `/subscriptions/${subscriptionId}`, {
    data: {
      type: "subscriptions",
      id: String(subscriptionId),
      attributes: { variant_id: Number(variantId) },
    },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return lsRequest("DELETE", `/subscriptions/${subscriptionId}`);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hash = createHmac("sha256", secret).update(rawBody).digest("hex");
  return hash === signature;
}
