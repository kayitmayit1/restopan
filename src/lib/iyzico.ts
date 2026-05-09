/** iyzico: `IYZICO_BASE_URL` açıksa doğrudan kullanılır; değilse `IYZICO_SANDBOX=true` → sandbox URI. Sandbox anahtarları yalnızca sandbox adresiyle çalışır (canlı: api.iyzipay.com). */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay");

const IYZICO_LIVE_URI = "https://api.iyzipay.com";
const IYZICO_SANDBOX_URI = "https://sandbox-api.iyzipay.com";

export function resolveIyzicoBaseUrl(): string {
  const explicit = process.env.IYZICO_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const sandbox = process.env.IYZICO_SANDBOX?.toLowerCase().trim();
  if (sandbox === "1" || sandbox === "true" || sandbox === "yes") {
    return IYZICO_SANDBOX_URI;
  }
  return IYZICO_LIVE_URI;
}

let _client: InstanceType<typeof Iyzipay> | null = null;

function getClient() {
  if (!_client) {
    _client = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: resolveIyzicoBaseUrl(),
    });
  }
  return _client;
}

export const PLANS = {
  STARTER: {
    name: "Starter",
    planCode: "",
    price: 0,
    limits: { tables: 10, users: 2, locations: 1 },
  },
  PROFESSIONAL: {
    name: "Professional",
    planCode: process.env.IYZICO_PLAN_PROFESSIONAL ?? "",
    price: 999,
    limits: { tables: 50, users: 10, locations: 3 },
  },
  ENTERPRISE: {
    name: "Enterprise",
    planCode: process.env.IYZICO_PLAN_ENTERPRISE ?? "",
    price: 2499,
    limits: { tables: 999, users: 999, locations: 999 },
  },
} as const;

export type PaidPlan = "PROFESSIONAL" | "ENTERPRISE";

interface CheckoutFormResult {
  status: string;
  checkoutFormContent: string;
  token: string;
  tokenExpireTime: number;
}

interface RetrieveResult {
  status: string;
  subscriptionStatus: string;
  referenceCode: string;
  parentReferenceCode: string;
  pricingPlanReferenceCode: string;
  startDate: string;
  endDate: string;
  trialStartDate?: string;
  trialEndDate?: string;
}

export function initCheckoutForm(
  params: Record<string, unknown>
): Promise<CheckoutFormResult> {
  return new Promise((resolve, reject) => {
    getClient().subscriptionCheckoutForm.initialize(
      params,
      (err: Error | null, result: CheckoutFormResult) => {
        if (err) reject(err);
        else if (result.status !== "success")
          reject(new Error(JSON.stringify(result)));
        else resolve(result);
      }
    );
  });
}

export function retrieveCheckoutForm(token: string): Promise<RetrieveResult> {
  return new Promise((resolve, reject) => {
    getClient().subscriptionCheckoutForm.retrieve(
      { checkoutFormToken: token },
      (err: Error | null, result: RetrieveResult) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

export function upgradeSubscription(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    getClient().subscription.upgrade(
      params,
      (err: Error | null, result: Record<string, unknown>) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

export function cancelSubscription(subscriptionReferenceCode: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    getClient().subscription.cancel(
      { subscriptionReferenceCode },
      (err: Error | null, result: Record<string, unknown>) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}
