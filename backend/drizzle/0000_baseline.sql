CREATE TYPE "public"."category_type" AS ENUM('standard', 'custom');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('us_dollar', 'cad_dollar');--> statement-breakpoint
CREATE TYPE "public"."font" AS ENUM('public_sans', 'noto_serif', 'source_code');--> statement-breakpoint
CREATE TABLE "balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current" numeric(12, 2) NOT NULL,
	"income" numeric(12, 2) NOT NULL,
	"expenses" numeric(12, 2) NOT NULL,
	CONSTRAINT "balances_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_definition_id" uuid NOT NULL,
	"maximum" numeric(12, 2) NOT NULL,
	"theme" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "category_type" NOT NULL,
	"creator_id" uuid,
	CONSTRAINT "category_definitions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"theme" text NOT NULL,
	CONSTRAINT "pots_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "recurring_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_definition_id" uuid,
	"name" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"last_paid" timestamp with time zone,
	"due_date" integer NOT NULL,
	"theme" text NOT NULL,
	CONSTRAINT "recurring_bills_due_date_range" CHECK ("recurring_bills"."due_date" between 1 and 31)
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"font" "font" NOT NULL,
	"currency" "currency" NOT NULL,
	"pots" boolean NOT NULL,
	"bills" boolean NOT NULL,
	"budgets" boolean NOT NULL,
	CONSTRAINT "settings_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_definition_id" uuid NOT NULL,
	"recurring_id" uuid,
	"avatar" text,
	"name" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"theme" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"recurring" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"verification_token_expiry" timestamp with time zone,
	"reset_token" text,
	"reset_token_expiry" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_definition_id_category_definitions_id_fk" FOREIGN KEY ("category_definition_id") REFERENCES "public"."category_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_definitions" ADD CONSTRAINT "category_definitions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pots" ADD CONSTRAINT "pots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bills" ADD CONSTRAINT "recurring_bills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bills" ADD CONSTRAINT "recurring_bills_category_definition_id_category_definitions_id_fk" FOREIGN KEY ("category_definition_id") REFERENCES "public"."category_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_definition_id_category_definitions_id_fk" FOREIGN KEY ("category_definition_id") REFERENCES "public"."category_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_id_recurring_bills_id_fk" FOREIGN KEY ("recurring_id") REFERENCES "public"."recurring_bills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budgets_user_id_idx" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "category_definitions_creator_id_idx" ON "category_definitions" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "recurring_bills_user_id_idx" ON "recurring_bills" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_date_idx" ON "transactions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transactions_recurring_id_idx" ON "transactions" USING btree ("recurring_id");