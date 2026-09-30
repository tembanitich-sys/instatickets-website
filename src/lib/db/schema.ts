import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Key/value settings editable from the admin page (Phase 4). */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});
