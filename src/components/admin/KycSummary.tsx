import { currencyShort, organiserTypes, eventTypes } from "@content/onboarding";
import type { BusKyc, EventData, OrganiserKyc } from "@/lib/partners/kyc";
import { normalisePhone } from "@/lib/partners/kyc";

/*
 * Read-only views of what a partner submitted, for review. Shows bank details in full:
 * this is only ever rendered inside the signed-in admin area.
 */

const v = (s: string | undefined | null) => (s ? s : "—");
const phone = (s: string) => (s ? (normalisePhone(s) ?? `${s} (not valid)`) : "—");

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-extrabold text-navy">{title}</h3>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

function Pairs({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
      {rows.map(([k, val]) => (
        <div key={k} className="contents">
          <dt className="font-semibold text-muted">{k}</dt>
          <dd className="break-words text-ink">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | React.ReactNode)[][] }) {
  if (rows.length === 0) return <p className="text-muted">None.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-semibold text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-4 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const contact = (c: { name: string; email: string; phone: string; same?: boolean }, sameAs: string) =>
  c.same ? `Same as ${sameAs}` : `${v(c.name)} · ${v(c.email)} · ${phone(c.phone)}`;

function monthsSince(ym: string, now: Date) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return null;
  return (now.getUTCFullYear() - Number(m[1])) * 12 + (now.getUTCMonth() + 1 - Number(m[2]));
}

function expiry(date: string, now: Date) {
  if (!date) return "—";
  const days = Math.floor((Date.parse(date) - now.getTime()) / 86400000);
  if (Number.isNaN(days)) return date;
  if (days < 0) return `${date} (EXPIRED)`;
  if (days < 30) return `${date} (expires in ${days} days)`;
  return date;
}

function Accounts({ accounts }: { accounts: BusKyc["accounts"] }) {
  return (
    <Table
      head={["Currency", "Bank", "Branch", "Account name", "Account number"]}
      rows={accounts.map((a) => [currencyShort(a.currency), v(a.bank), v(a.branch), v(a.accountName), v(a.accountNumber)])}
    />
  );
}

function Signatories({ list }: { list: BusKyc["signatories"] }) {
  return <Table head={["Name", "Role", "Email", "Phone"]} rows={list.map((s) => [v(s.name), v(s.role), v(s.email), phone(s.phone)])} />;
}

export function BusKycSummary({ k, now }: { k: BusKyc; now: Date }) {
  return (
    <div className="space-y-4">
      <Block title="Company">
        <Pairs
          rows={[
            ["Registered name", v(k.company.legalName)],
            ["Trading name", v(k.company.tradingName)],
            ["Registration number", v(k.company.registrationNumber)],
            ["Operator licence", v(k.company.operatorLicenceNumber)],
            ["Segment", v(k.company.segment.replace("_", "-"))],
            ["Fleet size", v(k.company.fleetSize)],
            ["Notice address", v(k.company.noticeAddress)],
            ["Ticketing system", `${v(k.system.name)} (provider: ${v(k.system.provider)})`],
          ]}
        />
      </Block>
      <Block title="Contacts">
        <Pairs
          rows={[
            ["Finance", contact(k.contacts.finance, "finance")],
            ["Operations", contact(k.contacts.operations, "finance")],
            ["Technical", contact(k.contacts.technical, "finance")],
          ]}
        />
      </Block>
      <Block title="Routes and fare currencies">
        <Table
          head={["Route", "Type", "Since", "Currencies"]}
          rows={k.routes.map((r) => {
            const months = monthsSince(r.operatingSince, now);
            return [
              `${v(r.origin)} to ${v(r.destination)}`,
              r.kind === "cross_border" ? "Cross-border" : r.kind === "local" ? "Local" : "—",
              months !== null && months < 6 ? `${r.operatingSince} (under 6 months)` : v(r.operatingSince),
              r.currencies.map(currencyShort).join(", ") || "—",
            ];
          })}
        />
      </Block>
      <Block title="Settlement accounts">
        <Accounts accounts={k.accounts} />
      </Block>
      <Block title="Signatories for settlement account changes">
        <Signatories list={k.signatories} />
      </Block>
      <Block title="Customer service, expiry dates and declarations">
        <Pairs
          rows={[
            ["Complaints", `${phone(k.customerService.complaintsPhone)} · ${v(k.customerService.complaintsEmail)}`],
            ["Refund policy link", v(k.customerService.refundPolicyUrl)],
            ["Tax clearance expiry", expiry(k.expiry.taxClearance, now)],
            ["Insurance expiry", expiry(k.expiry.insurance, now)],
            ["Information true", k.declarations.true ? "Confirmed" : "Not confirmed"],
            ["Honour every ticket", k.declarations.honour ? "Confirmed" : "Not confirmed"],
          ]}
        />
      </Block>
    </div>
  );
}

export function OrganiserKycSummary({ k, now }: { k: OrganiserKyc; now: Date }) {
  return (
    <div className="space-y-4">
      <Block title="Organisation">
        <Pairs
          rows={[
            ["Registered name", v(k.company.legalName)],
            ["Trading name", v(k.company.tradingName)],
            ["Registration number", v(k.company.registrationNumber)],
            ["Type", organiserTypes.find((o) => o.value === k.company.organiserType)?.label ?? "—"],
            ["Notice address", v(k.company.noticeAddress)],
            ["Currencies", k.currencies.map(currencyShort).join(", ") || "—"],
          ]}
        />
      </Block>
      <Block title="Contacts">
        <Pairs
          rows={[
            ["Main", contact(k.contacts.main, "main")],
            ["Event day", contact(k.contacts.eventDay, "main")],
            ["Finance", contact(k.contacts.finance, "main")],
          ]}
        />
      </Block>
      <Block title="Settlement accounts">
        <Accounts accounts={k.accounts} />
      </Block>
      <Block title="Signatories for settlement account changes">
        <Signatories list={k.signatories} />
      </Block>
      <Block title="Track record">
        {k.trackRecord.depositInstead && <p className="mb-2 font-semibold">First-time organiser: will provide a deposit or guarantee.</p>}
        <Table head={["Event", "Date", "Venue", "Attendance"]} rows={k.trackRecord.events.map((e) => [v(e.name), v(e.date), v(e.venue), v(e.attendance)])} />
      </Block>
      <Block title="Expiry dates and declarations">
        <Pairs
          rows={[
            ["Tax clearance expiry", expiry(k.expiry.taxClearance, now)],
            ["Information true", k.declarations.true ? "Confirmed" : "Not confirmed"],
            ["Never beyond capacity", k.declarations.capacity ? "Confirmed" : "Not confirmed"],
          ]}
        />
      </Block>
    </div>
  );
}

export function EventSummary({ e }: { e: EventData }) {
  const total = e.ticketClasses.reduce((n, t) => n + (Number(t.quantity) || 0), 0);
  return (
    <div className="space-y-4">
      <Block title="Event">
        <Pairs
          rows={[
            ["Name", v(e.name)],
            ["Type", eventTypes.find((t) => t.value === e.type)?.label ?? "—"],
            ["Date", e.endDate ? `${v(e.startDate)} to ${e.endDate}` : v(e.startDate)],
            ["Gates open", v(e.gatesOpen)],
            ["Venue", `${v(e.venueName)}, ${v(e.venueAddress)}`],
            ["Licensed capacity", v(e.licensedCapacity)],
            ["Age and entry conditions", v(e.ageRestrictions)],
            ["Sanctioned by", v(e.sanctionBody)],
            ["Sales", `${v(e.salesOpen)} to ${v(e.salesClose)}`],
            ["InstaTickets allocation", e.allocation === "fixed" ? `${v(e.allocationQuantity)} tickets` : e.allocation === "all" ? "All tickets" : "—"],
            ["Currencies", e.currencies.map(currencyShort).join(", ") || "—"],
            ["Event-day contact", `${v(e.eventDayContact.name)} · ${phone(e.eventDayContact.phone)}`],
            ["Gate control", e.gateControl === "app" ? "InstaTickets app" : e.gateControl === "approved_system" ? `Approved system: ${v(e.gateSystemName)}` : "—"],
            ["Insurance", `${v(e.insurance.insurer)}, cover ${v(e.insurance.coverAmount)}, expires ${v(e.insurance.expiry)}`],
          ]}
        />
      </Block>
      <Block title={`Ticket classes (total ${total})`}>
        <Table
          head={["Class", "Currency", "Face value", "Quantity", "Notes"]}
          rows={e.ticketClasses.map((t) => [v(t.name), currencyShort(t.currency), v(t.faceValue), v(t.quantity), v(t.notes)])}
        />
      </Block>
    </div>
  );
}
