CREATE TABLE "business_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"phone_e164" text NOT NULL,
	"email" text NOT NULL,
	"business_type" text NOT NULL,
	"offerings" text[] DEFAULT '{}' NOT NULL,
	"has_ticketing_system" text,
	"ticketing_system_name" text,
	"website" text,
	"details" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"marketing_consent_at" timestamp with time zone,
	"privacy_notice_version" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone_e164" text,
	"enquiry_type" text NOT NULL,
	"message" text NOT NULL,
	"privacy_notice_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_preregistrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_e164" text NOT NULL,
	"email" text,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"marketing_consent_at" timestamp with time zone,
	"privacy_notice_version" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_preregistrations_phone_e164_unique" UNIQUE("phone_e164")
);
--> statement-breakpoint
CREATE INDEX "business_registrations_created_at_idx" ON "business_registrations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_enquiries_created_at_idx" ON "contact_enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customer_preregistrations_created_at_idx" ON "customer_preregistrations" USING btree ("created_at");