/** A placeholder QR code: a fixed pseudo-pattern, not scannable. Replaced by real codes once storefront links exist. */
export function QrPlaceholder({ caption, size = 72 }: { caption: string; size?: number }) {
  const cells = 9;
  const finder = (r: number, c: number) => (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
  return (
    <svg role="img" aria-label={caption} width={size} height={size} viewBox={`0 0 ${cells} ${cells}`} className="shrink-0 rounded-md border border-line bg-white p-1">
      {Array.from({ length: cells * cells }, (_, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        const on = finder(r, c) || (r * 5 + c * 3 + ((r * c) % 4)) % 3 === 0;
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="currentColor" className="text-ink" /> : null;
      })}
    </svg>
  );
}
