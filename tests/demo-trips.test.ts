import { describe, expect, it } from "vitest";
import { demoCompanies } from "@content/site";
import { allTowns, companyList, companyTowns, findCompany, matchCompanies, tripsFor } from "@/lib/demoTrips";

describe("demo bus company search (CR-001)", () => {
  it("matches from the start of any word, including joined words such as InterAfrica", () => {
    const inter = matchCompanies("inter").map((c) => c.slug);
    expect(inter).toContain("interafrica");
    expect(inter).toContain("intercity");
    expect(matchCompanies("africa").map((c) => c.slug)).toEqual(["interafrica"]);
    expect(matchCompanies("ca").map((c) => c.slug)).not.toContain("interafrica");
    expect(matchCompanies("rica")).toEqual([]);
    expect(matchCompanies("")).toEqual([]);
  });

  it("lists companies alphabetically with the last-used one first", () => {
    const names = companyList(null).map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(companyList("tenda")[0].slug).toBe("tenda");
    expect(companyList("tenda")).toHaveLength(demoCompanies.length);
  });

  it("shows only the chosen company's trips and towns inside a storefront", () => {
    const c = findCompany("tenda")!;
    const trips = tripsFor("Harare", "Mutare", c);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips.every((t) => t.company.slug === c.slug)).toBe(true);
    expect(tripsFor("Harare", "Johannesburg", c)).toEqual([]); // not served: nothing from other companies
    expect(companyTowns(c)).toEqual(expect.arrayContaining(["Harare", "Mutare", "Chipinge"]));
  });

  it("lists route trips from every serving company by departure time, or by fare, both directions", () => {
    const byTime = tripsFor("Harare", "Bulawayo");
    expect(new Set(byTime.map((t) => t.company.slug)).size).toBeGreaterThan(1);
    expect(byTime.map((t) => t.dep)).toEqual([...byTime.map((t) => t.dep)].sort());
    const byFare = tripsFor("Harare", "Bulawayo", undefined, "fare").map((t) => t.fare);
    expect(byFare).toEqual([...byFare].sort((a, b) => a - b));
    expect(tripsFor("Bulawayo", "Harare").length).toBe(byTime.length);
  });

  it("has a logo file for every company, and higher fares for cross-border trips", () => {
    for (const c of demoCompanies) expect(c.logo).toMatch(/^\/brand\/operators\/.+\.webp$/);
    expect(allTowns()).toContain("Johannesburg");
    const local = Math.max(...tripsFor("Harare", "Bulawayo").map((t) => t.fare));
    expect(Math.min(...tripsFor("Harare", "Johannesburg").map((t) => t.fare))).toBeGreaterThan(local);
  });
});
