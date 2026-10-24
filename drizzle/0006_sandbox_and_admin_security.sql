CREATE TABLE "admin_security" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"enabled_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "sandbox_credentials" text;