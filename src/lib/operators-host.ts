/**
 * operators.instatickets.co.zw is the same app as the main site. Its home page shows the
 * bus operator registration page; any other page address on it sends the visitor to the
 * main site, so the subdomain never becomes a second copy of the whole website.
 */
export const OPERATORS_SUBDOMAIN = "operators.";
export const OPERATORS_PATH = "/operators";

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
  return { kind: "redirect-main", pathname };
}
