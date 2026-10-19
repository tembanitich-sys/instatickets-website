import { describe, expect, it } from "vitest";
import { demoCompanies } from "@content/site";
import { allTowns, companyList, findCompany, matchCompanies, tripsFor } from "@/lib/demoTrips";

describe("demo bus company search (CR-001)", () => {
  it("matches from the start of any word, not the middle", () => {
    expect(matchCompanies("inter").map((c) => c.slug)).toEqual(["sample-intercity-coaches"]);
    expect(matchCompanies("africa").map((c) => c.slug)).toEqual(["sample-northern-africa-travel"]);
    expect(matchCompanies("ca")).toEqual([]);
    expect(matchCompanies("")).toEqual([]);
  });

  it("lists companies alphabetically with the last-used one first", () => {
    const names = (l: ReturnType<typeof companyList>) => l.map((c) => c.name);
    expect(names(companyList(null))).toEqual([...names(companyList(null))].sort((a, b) => a.localeCompare(b)));
    expect(companyList("sample-zambezi-coaches")[0].slug).toBe("sample-zambezi-coaches");
    expect(companyList("sample-zambezi-coaches")).toHaveLength(demoCompanies.length);
  });

  it("shows only the chosen company's trips and towns inside a storefront", () => {
    const c = findCompany("sample-lakeside-lines")!;
    const trips = tripsFor("Harare", "Kariba", c);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips.every((t) => t.company.slug === c.slug)).toBe(true);
    expect(tripsFor("Harare", "Bulawayo", c)).toEqual([]); // not served: nothing from other companies
  });

  it("lists route trips from every serving company by departure time, or by fare", () => {
    const byTime = tripsFor("Harare", "Bulawayo");
    expect(new Set(byTime.map((t) => t.company.slug)).size).toBeGreaterThan(1);
    expect(byTime.map((t) => t.time)).toEqual([...byTime.map((t) => t.time)].sort());
    const byFare = tripsFor("Harare", "Bulawayo", undefined, "fare").map((t) => t.fare);
    expect(byFare).toEqual([...byFare].sort((a, b) => a - b));
  });

  it("keeps sample fares between 10 and 120, higher for cross-border", () => {
    const fares = allTowns().flatMap((a) => allTowns().flatMap((b) => (a === b ? [] : tripsFor(a, b).map((t) => t.fare))));
    expect(Math.min(...fares)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...fares)).toBeLessThanOrEqual(120);
    const local = Math.max(...tripsFor("Harare", "Bulawayo").map((t) => t.fare));
    expect(Math.min(...tripsFor("Harare", "Cape Town").map((t) => t.fare))).toBeGreaterThan(local);
  });
});
