import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    price: 0,
    limits: { tables: 10, users: 2, locations: 1 },
  },
  PROFESSIONAL: {
    name: "Professional",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
    price: 999,
    limits: { tables: 50, users: 10, locations: 3 },
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
    price: 2499,
    limits: { tables: 999, users: 999, locations: 999 },
  },
} as const;
