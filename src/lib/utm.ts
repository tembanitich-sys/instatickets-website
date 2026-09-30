const KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_KEY = "instatickets:utm";

type Utm = { source: string; medium: string; campaign: string };

const clean = (v: string | null) => (v ?? "").trim().slice(0, 100);

/**
 * Remembers the campaign tags of the first page seen in this tab, so they are
 * still known when the visitor reaches a form on another page. Nothing is sent
 * anywhere until they submit a form. Storage errors are ignored.
 */
export function captureUtm(search: string): void {
  try {
    const params = new URLSearchParams(search);
    if (!KEYS.some((k) => params.get(k)) || sessionStorage.getItem(STORAGE_KEY)) return;
    const [source, medium, campaign] = KEYS.map((k) => clean(params.get(k)));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ source, medium, campaign }));
  } catch {
    // Storage may be unavailable (private mode, blocked); campaign tags are optional.
  }
}

export function readUtm(): Utm {
  const empty = { source: "", medium: "", campaign: "" };
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return { ...empty, ...(JSON.parse(stored) as Partial<Utm>) };
    const params = new URLSearchParams(window.location.search);
    return {
      source: clean(params.get("utm_source")),
      medium: clean(params.get("utm_medium")),
      campaign: clean(params.get("utm_campaign")),
    };
  } catch {
    return empty;
  }
}
