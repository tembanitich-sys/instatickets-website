import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminConfig } from "./config";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** True if the request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  // Always wait for a real request and read the cookie first. Without this, a build
  // with no admin password set would prerender the redirect (or the "not available"
  // message) as a static page and it would never respond to a real sign-in.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const config = getAdminConfig();
  if (!config) return false;
  return verifySessionToken(config, token, Date.now());
}

/**
 * Call at the top of every admin page, server action and route handler. Layouts are
 * not enough: they do not re-run on client navigation, and actions can be called
 * directly.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
