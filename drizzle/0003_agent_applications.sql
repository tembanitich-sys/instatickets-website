CREATE TABLE "agent_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone_e164" text NOT NULL,
	"email" text,
	"applicant_type" text NOT NULL,
	"business_name" text,
	"province" text NOT NULL,
	"town" text NOT NULL,
	"selling_location" text NOT NULL,
	"has_device" boolean NOT NULL,
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
CREATE INDEX "agent_applications_created_at_idx" ON "agent_applications" USING btree ("created_at");