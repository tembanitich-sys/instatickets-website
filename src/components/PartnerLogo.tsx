import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { partnerVisible, type PartnerKey } from "@content/facts";
import { partners } from "@content/partners";

/** Width and height from a PNG header, so a dropped-in logo needs no code change. */
function pngSize(file: string): { width: number; height: number } | null {
  try {
    const b = readFileSync(file);
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  } catch {
    return null;
  }
}

/** Logos supplied on a dark background keep it: they sit on a black label instead of a white one. */
const darkLogo: Partial<Record<PartnerKey, boolean>> = { tn: true };

/**
 * A partner mark on a white label (a logo supplied on a dark background keeps its own black label). Shows the supplied
 * logo when its file exists, otherwise the partner's name. Hidden until the partner has approved
 * the site (production only; see content/facts.ts).
 */
export function PartnerLogo({ partner, height = 28 }: { partner: PartnerKey; height?: number }) {
  if (!partnerVisible(partner)) return null;
  const { name } = partners[partner];
  const file = join(process.cwd(), "public", "brand", "partners", `${partner}.png`);
  const size = existsSync(file) ? pngSize(file) : null;
  return (
    <span
      className={`inline-flex items-center rounded-lg shadow-sm ring-1 ring-line ${
        size && darkLogo[partner] ? "bg-black px-2 py-1.5" : "bg-white px-3 py-2"
      }`}
    >
      {size ? (
        <Image
          src={`/brand/partners/${partner}.png`}
          alt={name}
          width={size.width}
          height={size.height}
          sizes="160px"
          style={{ height: darkLogo[partner] ? Math.round(height * 1.6) : height, width: "auto" }}
        />
      ) : (
        <span className="text-sm font-extrabold tracking-wide text-navy">{name}</span>
      )}
    </span>
  );
}

/** A row of partner marks, skipping any that are not visible. */
export function PartnerRow({ keys, height }: { keys: PartnerKey[]; height?: number }) {
  const shown = keys.filter((k) => partnerVisible(k));
  if (shown.length === 0) return null;
  return (
    <span className="flex flex-wrap items-center gap-3">
      {shown.map((k) => (
        <PartnerLogo key={k} partner={k} height={height} />
      ))}
    </span>
  );
}
