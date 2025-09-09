ALTER TABLE "project_expenses" ALTER COLUMN "custo_m2" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_expenses" ALTER COLUMN "custo_m2" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_expenses" ALTER COLUMN "reajuste_anual" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_expenses" ALTER COLUMN "reajuste_anual" DROP NOT NULL;