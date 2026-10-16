import Image from "next/image";
import { Globe, Store } from "lucide-react";
import { facts, partnerVisible, type PartnerKey } from "@content/facts";

/**
 * One icon per way to buy, so channels read at a glance without text. The EcoCash SuperApp icon is
 * the supplied artwork, the InstaTickets app icon is a mock-up in the same style (replace
 * public/brand/channels/instatickets-app.png with the real app icon), the WhatsApp mark is the
 * brand glyph, and the USSD tile shows the dial code.
 */
export type ChannelKey = "ecocashApp" | "app" | "web" | "whatsapp" | "ussd" | "agents";

/** The EcoCash USSD code customers already know. */
export const USSD_CODE = "*151#";

// WhatsApp glyph (24 x 24 viewBox), from the Simple Icons set.
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

/** A channel shows unless it is switched off, or it needs a partner that has not approved the site. */
export function channelVisible(key: ChannelKey, partner?: PartnerKey): boolean {
  if (facts.channels[key] === "hidden") return false;
  return !partner || partnerVisible(partner);
}

export function ChannelIcon({ channel, size = 48 }: { channel: ChannelKey; size?: number }) {
  const box = { width: size, height: size };
  const round = "shrink-0 overflow-hidden";
  const radius = { borderRadius: Math.round(size * 0.24) };
  switch (channel) {
    case "ecocashApp":
      return (
        <Image
          src="/brand/channels/ecocash-superapp.png"
          alt=""
          width={225}
          height={225}
          sizes="64px"
          className={round}
          style={{ ...box, ...radius }}
        />
      );
    case "app":
      return (
        <Image
          src="/brand/channels/instatickets-app.png"
          alt=""
          width={512}
          height={512}
          sizes="64px"
          className={round}
          style={{ ...box, ...radius }}
        />
      );
    case "web":
      return (
        <span className={`${round} inline-flex items-center justify-center bg-navy text-white`} style={{ ...box, ...radius }}>
          <Globe aria-hidden style={{ width: size * 0.55, height: size * 0.55 }} />
        </span>
      );
    case "whatsapp":
      return (
        <span className={`${round} inline-flex items-center justify-center`} style={{ ...box, ...radius, background: "#25D366" }}>
          <svg aria-hidden viewBox="0 0 24 24" style={{ width: size * 0.62, height: size * 0.62 }} fill="#fff">
            <path d={WHATSAPP_PATH} />
          </svg>
        </span>
      );
    case "ussd":
      return (
        <span
          className={`${round} inline-flex items-center justify-center bg-ink font-extrabold tracking-tight text-white`}
          style={{ ...box, ...radius, fontSize: size * 0.27 }}
        >
          {USSD_CODE}
        </span>
      );
    case "agents":
      return (
        <span className={`${round} inline-flex items-center justify-center bg-red text-white`} style={{ ...box, ...radius }}>
          <Store aria-hidden style={{ width: size * 0.55, height: size * 0.55 }} />
        </span>
      );
  }
}
