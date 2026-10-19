import { useSyncExternalStore } from "react";
import { demoCompanies } from "@content/site";

/** Sample data helpers for the demo pages only. No network, no real operators. */
export type DemoCompany = (typeof demoCompanies)[number];
export type DemoTrip = { company: DemoCompany; time: string; fare: number; full: boolean };

export const LAST_COMPANY_KEY = "instatickets-demo-last-company";

export const companiesAlphabetical = (): DemoCompany[] =>
  [...demoCompanies].sort((a, b) => a.name.localeCompare(b.name));

export const findCompany = (slug: string | null | undefined): DemoCompany | undefined =>
  demoCompanies.find((c) => c.slug === slug);

/** Every town any participating company serves, alphabetical. */
export const allTowns = (): string[] =>
  [...new Set(demoCompanies.flatMap((c) => c.towns as readonly string[]))].sort((a, b) => a.localeCompare(b));

/** Matches from the start of any word: "inter" and "africa" match, "ca" does not. */
export function matchCompanies(query: string): DemoCompany[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return companiesAlphabetical().filter((c) => {
    const name = c.name.toLowerCase();
    return name.startsWith(q) || name.includes(` ${q}`);
  });
}

/** The full list, alphabetical, with the customer's last-used company first. */
export function companyList(lastSlug: string | null): DemoCompany[] {
  const all = companiesAlphabetical();
  const last = all.find((c) => c.slug === lastSlug);
  return last ? [last, ...all.filter((c) => c !== last)] : all;
}

const serves = (c: DemoCompany, from: string, to: string) =>
  (c.towns as readonly string[]).includes(from) && (c.towns as readonly string[]).includes(to);

/** Trips for one route. With a company: only that company's. Without: every company's, by departure time. */
export function tripsFor(from: string, to: string, company?: DemoCompany, sort: "time" | "fare" = "time"): DemoTrip[] {
  const border = from === "Cape Town" || to === "Cape Town";
  const trips = (company ? [company] : [...demoCompanies])
    .filter((c) => serves(c, from, to))
    .flatMap((c) =>
      c.departures.map((d) => ({ company: c, time: d.time, fare: border && d.crossBorder ? d.crossBorder : d.fare, full: d.full })),
    );
  return trips.sort((a, b) =>
    sort === "fare" ? a.fare - b.fare || a.time.localeCompare(b.time) : a.time.localeCompare(b.time) || a.company.name.localeCompare(b.company.name),
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
