import type { ReactNode } from "react";
import { brand } from "./Brand";

/**
 * Renders copy with two treatments: unconfirmed [BRACKETED] values are highlighted so they
 * cannot be missed, and the brand names become their logos (see Brand.tsx).
 */
export function withBrackets(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="rounded bg-yellow-200 px-1 font-bold text-ink">
        {part}
      </mark>
    ) : (
      <span key={i}>{brand(part)}</span>
    ),
  );
}
