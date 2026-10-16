/**
 * Partner display names and where their logos live. A logo is shown when its file exists in
 * public/brand/partners/<key>.png (drop the supplied artwork in, no code change); until then the
 * partner appears as its name in a plain label. Never recreate a partner logo.
 */
import type { PartnerKey } from "./facts";

export const partners: Record<PartnerKey, { name: string; role: string }> = {
  ecocash: { name: "EcoCash", role: "Payment partner" },
  econet: { name: "Econet Shops", role: "Agent outlets" },
  tn: { name: "TN CyberTech Bank", role: "Agent network" },
};

export const partnerCopy = {
  heading: "Our partners",
  availableAt: "Available at",
} as const;
