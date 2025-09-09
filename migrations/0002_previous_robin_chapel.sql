ALTER TABLE "administrative_expenses" ADD COLUMN "emp_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD COLUMN "emp_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "property_acquisitions" ADD COLUMN "emp_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD COLUMN "emp_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD COLUMN "emp_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "administrative_expenses" ADD CONSTRAINT "administrative_expenses_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_acquisitions" ADD CONSTRAINT "property_acquisitions_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_estate_details" ADD CONSTRAINT "real_estate_details_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_state_payments" ADD CONSTRAINT "real_state_payments_emp_id_properties_emp_id_fk" FOREIGN KEY ("emp_id") REFERENCES "public"."properties"("emp_id") ON DELETE no action ON UPDATE no action;