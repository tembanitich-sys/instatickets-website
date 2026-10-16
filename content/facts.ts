/**
 * Go-live switches. Each channel and partner is one value here, so the site only claims
 * what is true on the day it is published, and one edit turns a channel on.
 *
 * - "live":   shown as available.
 * - "soon":   shown with a COMING SOON label (no date).
 * - "hidden": not shown at all.
 *
 * Partner names and logos (EcoCash, Econet, TN CyberTech Bank) are public only after the
 * partner has approved the wording. Until then `partnerApproved` is false: Production hides
 * them, while preview and local builds show them so the partner can review the real page.
 */
export type ChannelStatus = "live" | "soon" | "hidden";
export type PartnerKey = "ecocash" | "econet" | "tn";

export const facts = {
  channels: {
    /** InstaTickets inside the EcoCash app (needs the `ecocash` partner to be visible). */
    ecocashApp: "live",
    app: "live",
    web: "live",
    whatsapp: "live",
    /** EcoCash USSD for customers (needs the `ecocash` partner to be visible). */
    ussd: "soon",
    /** Registered InstaTickets Agents. */
    agents: "live",
  } as Record<"ecocashApp" | "app" | "web" | "whatsapp" | "ussd" | "agents", ChannelStatus>,

  /** Set a partner to true only once it has approved the site wording in writing. */
  partnerApproved: { ecocash: false, econet: false, tn: false } as Record<PartnerKey, boolean>,

  /** Set to true when legal has signed off the Terms; until then /terms shows a DRAFT notice. */
  termsFinal: false,
} as const;

/** Production hides unapproved partners; previews and local builds show them for review. */
const isProduction = process.env.VERCEL_ENV === "production";

export const partnerVisible = (key: PartnerKey): boolean => !isProduction || facts.partnerApproved[key];
/** True when this build is showing content that is not yet approved for the public. */
export const isReviewBuild = !isProduction;

/** Where booking happens. Provided by the back office; falls back to the page's own channel list. */
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/#how-to-buy";
export const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || "";
export const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "";
