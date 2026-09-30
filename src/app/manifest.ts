import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InstaTickets",
    short_name: "InstaTickets",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#002f6c",
    icons: [
      { src: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/favicon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
