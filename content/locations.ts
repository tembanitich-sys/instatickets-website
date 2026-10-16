/**
 * Where customers can buy in person: Econet Shops and TN CyberTech Bank agents.
 *
 * Edit this list to add, correct or remove outlets. Production shows only entries with `confirmed: true`; preview
 * and local builds show everything, tagged UNCONFIRMED, so the list can be checked first.
 *
 * Seed data: the Econet Shop entries below come from public web results (a remittance
 * provider's branch page and a 2018 Techzim article), searched on 16 October 2026. They have
 * not been verified with Econet and may be out of date, so none is confirmed. No list of TN
 * CyberTech Bank outlets or agents was found publicly; supply one from the bank or the back office.
 */
export type OutletKind = "econet_shop" | "tn_agent";

export type Outlet = {
  id: string;
  kind: OutletKind;
  name: string;
  town: string;
  province: string;
  address?: string;
  confirmed: boolean;
};

const shop = (town: string, province: string, name: string, address?: string): Outlet => ({
  id: `econet-${town}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  kind: "econet_shop",
  name: `Econet Shop, ${name}`,
  town,
  province,
  address,
  confirmed: false,
});

export const outlets: Outlet[] = [
  shop("Harare", "Harare", "First Street"),
  shop("Harare", "Harare", "Joina City"),
  shop("Harare", "Harare", "Chitepo"),
  shop("Harare", "Harare", "Borrowdale"),
  shop("Harare", "Harare", "Avondale"),
  shop("Harare", "Harare", "Airport"),
  shop("Bulawayo", "Bulawayo", "Robert Mugabe Way", "Robert Mugabe Way"),
  shop("Bulawayo", "Bulawayo", "Bradfield"),
  shop("Bulawayo", "Bulawayo", "Hunterfly", "Fife Street"),
  shop("Gweru", "Midlands", "Mercury Building"),
  shop("Gweru", "Midlands", "Megawatt Complex"),
  shop("Mutare", "Manicaland", "2nd Street", "2nd Street"),
  shop("Mutare", "Manicaland", "1st Street", "1st Street"),
];
