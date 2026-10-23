CREATE TABLE "operator_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_no" serial NOT NULL,
	"company_name" text NOT NULL,
	"trading_name" text,
	"contact_person" text NOT NULL,
	"contact_role" text,
	"phone_e164" text NOT NULL,
	"email" text NOT NULL,
	"fleet_size" integer NOT NULL,
	"route_type" text NOT NULL,
	"main_routes" text NOT NULL,
	"has_ticketing_system" text NOT NULL,
	"ticketing_system_name" text,
	"currencies" text[] DEFAULT '{}' NOT NULL,
	"heard_from" text,
	"details" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"marketing_consent_at" timestamp with time zone,
	"privacy_notice_version" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operator_registrations_reference_no_unique" UNIQUE("reference_no")
);
--> statement-breakpoint
CREATE INDEX "operator_registrations_created_at_idx" ON "operator_registrations" USING btree ("created_at");