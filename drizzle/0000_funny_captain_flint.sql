CREATE TYPE "public"."alert_status" AS ENUM('unread', 'read', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('budget_warning_80', 'budget_warning_90', 'budget_exceeded', 'receipt_processing_failed');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'MXN', 'COP', 'ARS', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('comida', 'transporte', 'supermercado', 'salud', 'entretenimiento', 'software', 'educacion', 'hogar', 'servicios', 'trabajo', 'otros');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'otro', 'desconocido');--> statement-breakpoint
CREATE TYPE "public"."receipt_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"budget_id" uuid,
	"expense_id" uuid,
	"receipt_id" uuid,
	"alert_type" "alert_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"percentage" numeric(5, 2),
	"alert_status" "alert_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"is_global" boolean DEFAULT false NOT NULL,
	"category" "expense_category",
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"limit_amount" numeric(12, 2) NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_budget_per_period" UNIQUE("user_id","category","month","year")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"receipt_id" uuid,
	"budget_id" uuid,
	"merchant" text NOT NULL,
	"description" text,
	"expense_date" timestamp NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2),
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'desconocido',
	"category" "expense_category" NOT NULL,
	"is_deductible" boolean DEFAULT false NOT NULL,
	"deductible_notes" text,
	"attachment_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"categories" jsonb,
	"include_deductible_only" boolean DEFAULT false NOT NULL,
	"format" varchar(10) NOT NULL,
	"file_url" text,
	"record_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"cloudinary_public_id" text NOT NULL,
	"cloudinary_url" text NOT NULL,
	"original_filename" text NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"status" "receipt_status" DEFAULT 'pending' NOT NULL,
	"ai_raw_response" jsonb,
	"merchant" text,
	"expense_date" timestamp,
	"total_amount" numeric(12, 2),
	"tax_amount" numeric(12, 2),
	"currency" "currency" DEFAULT 'USD',
	"payment_method" "payment_method" DEFAULT 'desconocido',
	"document_type" text,
	"category_suggestion" "expense_category",
	"confidence_score" numeric(3, 2),
	"raw_text" text,
	"ai_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "receipts_cloudinary_public_id_unique" UNIQUE("cloudinary_public_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_logs" ADD CONSTRAINT "export_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "alert_user_id_idx" ON "alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alert_status_idx" ON "alerts" USING btree ("alert_status");--> statement-breakpoint
CREATE INDEX "alert_user_status_idx" ON "alerts" USING btree ("user_id","alert_status");--> statement-breakpoint
CREATE INDEX "alert_budget_id_idx" ON "alerts" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "alert_expense_id_idx" ON "alerts" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "alert_receipt_id_idx" ON "alerts" USING btree ("receipt_id");--> statement-breakpoint
CREATE INDEX "budget_user_id_idx" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budget_period_idx" ON "budgets" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "expense_user_id_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expense_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "expense_category_idx" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expense_user_date_idx" ON "expenses" USING btree ("user_id","expense_date");--> statement-breakpoint
CREATE INDEX "expense_receipt_id_idx" ON "expenses" USING btree ("receipt_id");--> statement-breakpoint
CREATE INDEX "expense_budget_id_idx" ON "expenses" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "export_user_id_idx" ON "export_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "export_created_at_idx" ON "export_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "receipt_user_id_idx" ON "receipts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "receipt_status_idx" ON "receipts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "receipt_created_at_idx" ON "receipts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "receipt_user_status_idx" ON "receipts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");