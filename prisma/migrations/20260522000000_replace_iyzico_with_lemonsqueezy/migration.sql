-- Rename iyzico subscription fields to LemonSqueezy equivalents
ALTER TABLE "Subscription" RENAME COLUMN "iyzicoSubId" TO "lsSubscriptionId";
ALTER TABLE "Subscription" RENAME COLUMN "iyzicoPlanCode" TO "lsVariantId";
