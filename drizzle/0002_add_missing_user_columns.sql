-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN "imageUrl" varchar;
ALTER TABLE "users" ADD COLUMN "tier" varchar(50) DEFAULT 'Free';
ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 5;
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" varchar(255);
ALTER TABLE "users" ADD COLUMN "stripeSubscriptionId" varchar(255);
ALTER TABLE "users" ADD COLUMN "stripePriceId" varchar(255);
ALTER TABLE "users" ADD COLUMN "stripeCurrentPeriodEnd" varchar(255);

-- Drop old subscriptionId column if it exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscriptionId";
