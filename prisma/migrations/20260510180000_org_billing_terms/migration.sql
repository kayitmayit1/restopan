-- AlterTable
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "buyNowCheckoutPending" BOOLEAN NOT NULL DEFAULT false;
