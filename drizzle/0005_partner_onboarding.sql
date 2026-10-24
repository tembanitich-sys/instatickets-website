CREATE TABLE "partner_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid,
	"event_id" uuid,
	"slot" text NOT NULL,
	"source" text NOT NULL,
	"pathname" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_documents_pathname_unique" UNIQUE("pathname")
);
--> statement-breakpoint
CREATE TABLE "partner_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"review_note" text,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_sign_in_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_sign_in_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"type_seq" integer NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"integration_status" text DEFAULT 'not_started' NOT NULL,
	"legal_name" text NOT NULL,
	"trading_name" text,
	"group_name" text,
	"anchor_addendum" boolean DEFAULT false NOT NULL,
	"organiser_type" text,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"kyc" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"review_note" text,
	"invited_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"integration_sent_at" timestamp with time zone,
	"reminders_sent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partner_documents" ADD CONSTRAINT "partner_documents_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_documents" ADD CONSTRAINT "partner_documents_event_id_partner_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."partner_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_events" ADD CONSTRAINT "partner_events_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_sign_in_tokens" ADD CONSTRAINT "partner_sign_in_tokens_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_documents_partner_idx" ON "partner_documents" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_documents_slot_idx" ON "partner_documents" USING btree ("slot");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_events_seq_idx" ON "partner_events" USING btree ("partner_id","seq");--> statement-breakpoint
CREATE INDEX "partner_sign_in_tokens_partner_idx" ON "partner_sign_in_tokens" USING btree ("partner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "partners_type_seq_idx" ON "partners" USING btree ("type","type_seq");--> statement-breakpoint
CREATE INDEX "partners_contact_email_idx" ON "partners" USING btree ("contact_email");