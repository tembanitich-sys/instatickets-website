/** The public address of the site, without a trailing slash. Set NEXT_PUBLIC_SITE_URL to change it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.instatickets.co.zw").replace(/\/+$/, "");

export const SITE_TITLE = "InstaTickets | One Platform. Every Ticket.";
export const SITE_DESCRIPTION =
  "InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with Bus, Events and Sports ticket inventory.";
