import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** Public pages worth indexing. The COMING SOON placeholders (terms, cookies) and /admin are left out. */
const PAGES = [
  { path: "/", priority: 1 },
  { path: "/for-businesses", priority: 0.8 },
  { path: "/agents", priority: 0.7 },
  { path: "/help", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, priority }));
}
