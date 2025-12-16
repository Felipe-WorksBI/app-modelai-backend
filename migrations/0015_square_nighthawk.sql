ALTER TABLE "companies" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "company_id" SET DEFAULT gen_random_uuid();