import { useSyncExternalStore } from "react";
import { demoCompanies } from "@content/site";

/** Demo data helpers for the demo pages only. No network. Routes and fares are illustrative. */
export type DemoCompany = (typeof demoCompanies)[number];
export type DemoTrip = {
  company: DemoCompany;
  from: string;
  to: string;
  fromStop: string;
  toStop: string;
  dep: string;
  arr: string;
  fare: number;
  full: boolean;
  cross: boolean;
};

export const LAST_COMPANY_KEY = "instatickets-demo-last-company";

export const companiesAlphabetical = (): DemoCompany[] =>
  [...demoCompanies].sort((a, b) => a.name.localeCompare(b.name));

export const findCompany = (slug: string | null | undefined): DemoCompany | undefined =>
  demoCompanies.find((c) => c.slug === slug);

/** Towns one company serves (either end of any of its routes), alphabetical. */
export const companyTowns = (c: DemoCompany): string[] =>
  [...new Set(c.routes.flatMap((r) => [r.a, r.b]))].sort((a, b) => a.localeCompare(b));

/** Every town any participating company serves, alphabetical. */
export const allTowns = (): string[] =>
  [...new Set(demoCompanies.flatMap((c) => c.routes.flatMap((r) => [r.a, r.b])))].sort((a, b) => a.localeCompare(b));

/** Words of a name, also splitting joined words such as InterAfrica into Inter and Africa. */
const words = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/** Matches from the start of any word: "inter" and "africa" find InterAfrica, "ca" does not. */
export function matchCompanies(query: string): DemoCompany[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return companiesAlphabetical().filter(
    (c) => c.name.toLowerCase().startsWith(q) || words(c.name).some((w) => w.startsWith(q)),
  );
}

/** The full list, alphabetical, with the customer's last-used company first. */
export function companyList(lastSlug: string | null): DemoCompany[] {
  const all = companiesAlphabetical();
  const last = all.find((c) => c.slug === lastSlug);
  return last ? [last, ...all.filter((c) => c !== last)] : all;
}

/** Trips for one route (either direction). With a company: only that company's. Without: every company's. */
export function tripsFor(from: string, to: string, company?: DemoCompany, sort: "time" | "fare" = "time"): DemoTrip[] {
  const trips = (company ? [company] : [...demoCompanies]).flatMap((c) =>
    c.routes
      .filter((r) => (r.a === from && r.b === to) || (r.a === to && r.b === from))
      .flatMap((r) => {
        const forward = r.a === from;
        return r.departures.map((d) => ({
          company: c,
          from,
          to,
          fromStop: (forward ? r.aStops : r.bStops)[0],
          toStop: (forward ? r.bStops : r.aStops)[0],
          dep: d.dep,
          arr: d.arr,
          fare: r.fare,
          full: d.full,
          cross: r.cross,
        }));
      }),
  );
  return trips.sort((a, b) =>
    sort === "fare"
      ? a.fare - b.fare || a.dep.localeCompare(b.dep)
      : a.dep.localeCompare(b.dep) || a.company.name.localeCompare(b.company.name),
  );
}

export function readLastCompany(): string | null {
  try {
    return window.localStorage.getItem(LAST_COMPANY_KEY);
  } catch {
    return null;
  }
}

export function saveLastCompany(slug: string) {
  try {
    window.localStorage.setItem(LAST_COMPANY_KEY, slug);
  } catch {
    /* storage can be blocked; the list then stays alphabetical */
  }
}

const noSubscribe = () => () => {};

/** The last-used company slug from this browser (null on the server and when storage is blocked). */
export function useLastCompany(): string | null {
  return useSyncExternalStore(noSubscribe, readLastCompany, () => null);
}
