import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { adminSecurity } from "../db/schema";
import { writeAudit } from "./audit";
import { verifyTotp } from "./totp";

const ROW = "totp";

/**
 * The authenticator key in force: ADMIN_TOTP_SECRET if set in Vercel, otherwise the one
 * turned on in Admin > Settings. Null means two-step sign-in is off.
 */
export async function activeTotpSecret(db: Db | null, env: Record<string, string | undefined> = process.env): Promise<string | null> {
  if (env.ADMIN_TOTP_SECRET) return env.ADMIN_TOTP_SECRET.replace(/\s/g, "");
  if (!db) return null;
  const [row] = await db.select().from(adminSecurity).where(eq(adminSecurity.id, ROW)).limit(1);
  return row?.secret ?? null;
}

/** Turns two-step sign-in on, but only once a code from the new key proves the phone has it. */
export async function enableTotp(db: Db, secret: string, code: string, nowMs: number): Promise<boolean> {
  if (!verifyTotp(secret, code, nowMs)) return false;
  await db
    .insert(adminSecurity)
    .values({ id: ROW, secret, enabledAt: new Date(nowMs) })
    .onConflictDoUpdate({ target: adminSecurity.id, set: { secret, enabledAt: new Date(nowMs) } });
  await writeAudit(db, "settings.update", { key: "admin_two_step_sign_in", to: "on" });
  return true;
}

/** Turns it off; needs a current code, so a stolen password alone cannot do it. */
export async function disableTotp(db: Db, code: string, nowMs: number): Promise<boolean> {
  const [row] = await db.select().from(adminSecurity).where(eq(adminSecurity.id, ROW)).limit(1);
  if (!row || !verifyTotp(row.secret, code, nowMs)) return false;
  await db.delete(adminSecurity).where(eq(adminSecurity.id, ROW));
  await writeAudit(db, "settings.update", { key: "admin_two_step_sign_in", to: "off" });
  return true;
}
