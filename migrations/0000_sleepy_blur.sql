CREATE TYPE "public"."tipo_parcela" AS ENUM('Entrada', 'Parcela', 'Pagamento Final', 'Intermediário');--> statement-breakpoint
CREATE TYPE "public"."tipo_despesa" AS ENUM('Marketing', 'Comissão de vendas', 'Taxa de Gestão', 'Impostos');--> statement-breakpoint
CREATE TYPE "public"."base_calulo" AS ENUM('% do VGV', '% da Receita Líquida Prevista', '% sobre Cada Venda', '% sobre Custo da Obra', '% sobre Resultado');--> statement-breakpoint
CREATE TYPE "public"."tipo_valor" AS ENUM('entrada', 'licença', 'parcela', 'escritura');--> statement-breakpoint
CREATE TYPE "public"."tipo" AS ENUM('Terreno', 'Registro e Incorporação', 'Outros');--> statement-breakpoint
CREATE TYPE "public"."periodo_reforco" AS ENUM('trimestral', 'semestral', 'anual');--> statement-breakpoint
CREATE TABLE "administrative_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"prj_id" uuid NOT NULL,
	"tipo_despesa" "tipo_despesa" NOT NULL,
	"pct_valor" numeric(5, 2) NOT NULL,
	"base_calulo" "base_calulo" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"prj_id" uuid NOT NULL,
	"emp_id" uuid NOT NULL,
	"prj_fase" text DEFAULT 'Fase 1' NOT NULL,
	"area_vendida" numeric(10, 2) NOT NULL,
	"area_permuta" numeric(10, 2) NOT NULL,
	"valor_m2" numeric(10, 2) NOT NULL,
	"data_inicio" date DEFAULT now() NOT NULL,
	"prazo_vendas" numeric(5, 2) NOT NULL,
	"pct_valorizacao" numeric(5, 2) DEFAULT 0 NOT NULL,
	"pct_unidades_vista" numeric(5, 2) DEFAULT 0 NOT NULL,
	"pct_entrada" numeric(5, 2) DEFAULT 0 NOT NULL,
	"pct_reforco" numeric(5, 2) DEFAULT 0 NOT NULL,
	"qtd_parcelas" integer NOT NULL,
	"qtd_baloes" integer NOT NULL,
	"periodicidade_reforco" "periodo_reforco" NOT NULL,
	"pct_juros" numeric(5, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"prj_id" uuid NOT NULL,
	"data_inicio_custo" date DEFAULT now() NOT NULL,
	"tempo_obra" integer NOT NULL,
	"custo_m2" numeric(10, 2) NOT NULL,
	"custo_total_projetado" numeric(10, 2) NOT NULL,
	"area_construida_total" numeric(10, 2) NOT NULL,
	"reajuste_anual" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"project_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	CONSTRAINT "projects_project_name_unique" UNIQUE("project_name")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"emp_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" uuid NOT NULL,
	"emp_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	CONSTRAINT "properties_emp_name_unique" UNIQUE("emp_name")
);
--> statement-breakpoint
CREATE TABLE "property_acquisitions" (
	"property_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" uuid NOT NULL,
	"numero_instituicao" integer DEFAULT 1 NOT NULL,
	"nome_empresa" text NOT NULL,
	"data_captacao" date DEFAULT now() NOT NULL,
	"data_inicio_pagamento" date DEFAULT now() NOT NULL,
	"valor_captacao" numeric(10, 2) NOT NULL,
	"qtd_parcelas" integer DEFAULT 1 NOT NULL,
	"juros_ano" numeric(5, 2) DEFAULT 0 NOT NULL,
	"carencia_meses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "real_estate_details" (
	"real_estate_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" uuid NOT NULL,
	"tipo_real_estate" "tipo" NOT NULL,
	"data_compra" date DEFAULT now() NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"tipo_valor" "tipo_valor" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "real_state_payments" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"real_estate_id" uuid NOT NULL,
	"prj_id" uuid NOT NULL,
	"data_vencimento" date DEFAULT now() NOT NULL,
	"tipo_parcela" "tipo_parcela" NOT NULL,
	"numero_parcela" integer DEFAULT 1 NOT NULL,
	"valor_parcela" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "administrative_expenses" ADD CONSTRAINT "administrative_expenses_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administrative_expenses" ADD CONSTRAINT "administrative_expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administrative_expenses" ADD CONSTRAINT "administrative_expenses_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_details" ADD CONSTRAINT "project_details_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_acquisitions" ADD CONSTRAINT "property_acquisitions_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_acquisitions" ADD CONSTRAINT "property_acquisitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_acquisitions" ADD CONSTRAINT "property_acquisitions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD CONSTRAINT "real_estate_details_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD CONSTRAINT "real_estate_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD CONSTRAINT "real_estate_details_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_real_estate_id_real_estate_details_real_estate_id_fk" FOREIGN KEY ("real_estate_id") REFERENCES "public"."real_estate_details"("real_estate_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_prj_id_projects_project_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;