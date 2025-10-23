ALTER TABLE "real_estate_details" DROP CONSTRAINT "real_estate_details_prj_id_projects_project_id_fk";
--> statement-breakpoint
ALTER TABLE "real_state_payments" DROP CONSTRAINT "real_state_payments_real_estate_id_real_estate_details_real_estate_id_fk";
--> statement-breakpoint
ALTER TABLE "real_state_payments" DROP CONSTRAINT "real_state_payments_prj_id_projects_project_id_fk";
--> statement-breakpoint
ALTER TABLE "real_state_payments" DROP CONSTRAINT "real_state_payments_emp_id_properties_emp_id_fk";
--> statement-breakpoint
ALTER TABLE "real_state_payments" ALTER COLUMN "tipo_parcela" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD COLUMN "nome_real_estate" text DEFAULT 'Ativo 1';--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD COLUMN "tipo_real_estate" text DEFAULT 'Outros' NOT NULL;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD CONSTRAINT "real_estate_details_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "real_state_payments" DROP COLUMN "real_estate_id";--> statement-breakpoint

-- Remover a constraint unique existente
ALTER TABLE "real_state_payments" DROP CONSTRAINT IF EXISTS "real_state_payments_nome_real_estate_unique";
-- -- Adicionar constraint composta
-- ALTER TABLE "real_state_payments" 
-- ADD CONSTRAINT "unique_real_estate_per_project" 
-- UNIQUE ("prj_id", "emp_id", "nome_real_estate");