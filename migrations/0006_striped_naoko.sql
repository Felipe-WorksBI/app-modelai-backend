ALTER TABLE "project_details" ALTER COLUMN "area_vendida" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_details" ALTER COLUMN "area_vendida" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_details" ALTER COLUMN "pct_unidades_vista" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_details" ALTER COLUMN "periodicidade_reforco" DROP NOT NULL;