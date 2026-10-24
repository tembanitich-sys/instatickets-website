/**
 * operators.instatickets.co.zw is the same app as the main site. Its home page shows the
 * bus operator registration page; any other page address on it sends the visitor to the
 * main site, so the subdomain never becomes a second copy of the whole website.
 */
export const OPERATORS_SUBDOMAIN = "operators.";
export const OPERATORS_PATH = "/operators";
/** Pages the registration form links to, served on the subdomain too so the links work before www is live. */
const SHARED_PATHS = new Set(["/privacy", "/terms", "/cookies"]);

export type HostRoute =
  | { kind: "next" }
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect-local"; pathname: string }
  | { kind: "redirect-main"; pathname: string };

export function isOperatorsHost(host: string | null): boolean {
  if (!host) return false;
  return host.toLowerCase().split(":")[0].startsWith(OPERATORS_SUBDOMAIN);
}

export function routeForHost(host: string | null, pathname: string): HostRoute {
  if (!isOperatorsHost(host)) return { kind: "next" };
  if (pathname === "/") return { kind: "rewrite", pathname: OPERATORS_PATH };
  if (pathname === OPERATORS_PATH || pathname === `${OPERATORS_PATH}/`) return { kind: "redirect-local", pathname: "/" };
  if (SHARED_PATHS.has(pathname)) return { kind: "next" };
  // The invite-only Partner Portal lives on the subdomain, and so does the admin area, so
  // onboarding can run before www.instatickets.co.zw moves to Vercel.
  if (pathname === "/partner" || pathname.startsWith("/partner/")) return { kind: "next" };
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return { kind: "next" };
  return { kind: "redirect-main", pathname };
}
