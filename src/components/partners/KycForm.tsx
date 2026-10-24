"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { CURRENCIES, organiserTypes, portal, type PartnerType } from "@content/onboarding";
import {
  Card,
  CheckField,
  FormKit,
  Grid,
  MultiCheckField,
  ProblemList,
  RadioField,
  SelectField,
  SmallButton,
  TextField,
  getAt,
  useFormKit,
  useFormState,
} from "./kit";

type Result = { ok: true } | { ok: false; message: string; problems?: { path: string; message: string }[] };
type Data = Record<string, unknown>;

const currencyOptions = CURRENCIES.map((c) => ({ value: c.code, label: c.label }));
const short = (code: string) => CURRENCIES.find((c) => c.code === code)?.short ?? code;
const s = portal.sections;

export function KycForm({
  type,
  initial,
  editable,
  save,
  submit,
  children,
}: {
  type: PartnerType;
  initial: Data;
  editable: boolean;
  save: (json: string) => Promise<Result>;
  submit: (json: string) => Promise<Result>;
  /** Documents and contract sections, rendered on the server between the form and the buttons. */
  children: ReactNode;
}) {
  const router = useRouter();
  const { data, set } = useFormState(initial);
  const [problems, setProblems] = useState<{ path: string; message: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const errors = useMemo(() => Object.fromEntries(problems.map((p) => [p.path, p.message])), [problems]);

  const run = (action: (json: string) => Promise<Result>, after: string | null) =>
    start(async () => {
      setMessage(null);
      const result = await action(JSON.stringify(data));
      if (result.ok) {
        setProblems([]);
        setMessage(after);
        router.refresh();
      } else {
        setProblems(result.problems ?? []);
        setMessage(result.problems?.length ? null : result.message);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

  return (
    <FormKit value={{ data, set, errors, disabled: !editable || pending }}>
      <div className="space-y-6">
        <ProblemList heading={portal.dashboard.missingHeading} problems={problems} />
        {type === "bus_operator" ? <BusSections /> : <OrganiserSections />}
        {children}
        {editable && (
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
            <p className="mb-3 text-sm text-muted">{portal.dashboard.submitIntro}</p>
            <div className="flex flex-wrap items-center gap-3">
              <SmallButton onClick={() => run(save, portal.dashboard.saved)} disabled={pending}>
                {portal.dashboard.save}
              </SmallButton>
              <SmallButton tone="red" onClick={() => run(submit, null)} disabled={pending}>
                {portal.dashboard.submit}
              </SmallButton>
              {message && (
                <span role="status" className="text-sm font-semibold text-navy">
                  {message}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </FormKit>
  );
}

// --- Shared sections -------------------------------------------------------------------

function ContactFields({ path, label, emailReadOnly }: { path: string; label: string; emailReadOnly?: boolean }) {
  return (
    <Grid>
      <TextField path={`${path}.name`} label={`${label}: name`} required />
      <TextField
        path={`${path}.email`}
        label={`${label}: email`}
        type="email"
        required
        readOnly={emailReadOnly}
        hint={emailReadOnly ? "This is the address that signs in. To change it, contact InstaTickets." : undefined}
      />
      <TextField path={`${path}.phone`} label={`${label}: phone`} type="tel" required placeholder="077 123 4567" />
    </Grid>
  );
}

function LinkedContact({ path, label, sameLabel }: { path: string; label: string; sameLabel: string }) {
  const { data } = useFormKit();
  const same = getAt(data, `${path}.same`) === true;
  return (
    <div className="rounded-2xl bg-mist p-4">
      <p className="font-bold text-navy">{label}</p>
      <CheckField path={`${path}.same`} label={sameLabel} />
      {!same && <ContactFields path={path} label={label} />}
    </div>
  );
}

function Accounts({ currencies }: { currencies: string[] }) {
  const { data, set } = useFormKit();
  const accounts = (getAt(data, "accounts") as { currency: string }[] | undefined) ?? [];
  if (currencies.length === 0) {
    return <p className="text-sm text-muted">Choose your currencies first; an account appears here for each one.</p>;
  }
  return (
    <div className="space-y-5">
      {currencies.map((cur) => {
        let index = accounts.findIndex((a) => a.currency === cur);
        if (index < 0) index = accounts.length; // a new account is added on first edit
        const at = (field: string) => `accounts.${index}.${field}`;
        const ensure = () => {
          if (!accounts.some((a) => a.currency === cur)) set(`accounts.${index}.currency`, cur);
        };
        return (
          <div key={cur} className="rounded-2xl bg-mist p-4" onFocusCapture={ensure}>
            <p className="font-bold text-navy">{short(cur)} settlement account</p>
            <div className="mt-3">
              <Grid>
                <TextField path={at("bank")} label="Bank" required />
                <TextField path={at("branch")} label="Branch" required />
                <TextField path={at("accountName")} label="Account name" required />
                <TextField path={at("accountNumber")} label="Account number" required />
              </Grid>
            </div>
            {["bank", "branch", "accountName", "accountNumber"].map((f) => (
              <AccountError key={f} path={`accounts.${cur}.${f}`} />
            ))}
            <AccountError path={`accounts.${cur}`} />
          </div>
        );
      })}
    </div>
  );
}

function AccountError({ path }: { path: string }) {
  const { errors } = useFormKit();
  return errors[path] ? <p className="mt-1 text-sm font-semibold text-red-dark">{errors[path]}</p> : null;
}

function Signatories() {
  return (
    <div className="space-y-5">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl bg-mist p-4">
          <p className="font-bold text-navy">Signatory {i + 1}</p>
          <div className="mt-3">
            <Grid>
              <TextField path={`signatories.${i}.name`} label="Full name" required />
              <TextField path={`signatories.${i}.role`} label="Role" required />
              <TextField path={`signatories.${i}.email`} label="Email" type="email" required />
              <TextField path={`signatories.${i}.phone`} label="Phone" type="tel" required />
            </Grid>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Bus operator ------------------------------------------------------------------------

type Route = { origin: string; destination: string; kind: string; operatingSince: string; currencies: string[] };

function BusSections() {
  const { data, set, disabled, errors } = useFormKit();
  const routes = (getAt(data, "routes") as Route[] | undefined) ?? [];
  const used = CURRENCIES.map((c) => c.code).filter((c) => routes.some((r) => (r.currencies ?? []).includes(c)));
  return (
    <>
      <Card title={s.company}>
        <Grid>
          <TextField path="company.legalName" label="Registered company name" required />
          <TextField path="company.tradingName" label="Trading name (if different)" />
          <TextField path="company.registrationNumber" label="Company registration number" required />
          <TextField path="company.operatorLicenceNumber" label="Operator licence number" required />
        </Grid>
        <TextField path="company.noticeAddress" label="Address for notices" multiline required />
        <Grid>
          <RadioField
            path="company.segment"
            label="Which routes do you run?"
            options={[
              { value: "local", label: "Local" },
              { value: "cross_border", label: "Cross-border" },
              { value: "both", label: "Both" },
            ]}
          />
          <TextField path="company.fleetSize" label="Number of buses in your fleet" inputMode="numeric" required />
        </Grid>
      </Card>

      <Card title={s.system}>
        <Grid>
          <TextField path="system.name" label="Ticketing system name" required />
          <TextField path="system.provider" label="Provider" required hint="The company that supplies or built it." />
        </Grid>
      </Card>

      <Card title={s.contacts}>
        <div className="rounded-2xl bg-mist p-4">
          <p className="mb-3 font-bold text-navy">Finance contact</p>
          <ContactFields path="contacts.finance" label="Finance contact" emailReadOnly />
        </div>
        <LinkedContact path="contacts.operations" label="Operations contact" sameLabel={portal.sameAsFinance} />
        <LinkedContact path="contacts.technical" label="Technical contact" sameLabel={portal.sameAsFinance} />
        <p className="text-sm text-muted">
          The operations contact must be reachable throughout trading hours. The technical contact receives the
          Integration Standard as soon as you submit.
        </p>
      </Card>

      <Card title={s.routes} intro={s.routesIntro}>
        {errors.routes && <p className="text-sm font-semibold text-red-dark">{errors.routes}</p>}
        {routes.map((_, i) => (
          <div key={i} className="rounded-2xl bg-mist p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">Route {i + 1}</p>
              {!disabled && (
                <SmallButton tone="plain" onClick={() => set("routes", routes.filter((__, j) => j !== i))}>
                  {portal.remove}
                </SmallButton>
              )}
            </div>
            <div className="mt-3 space-y-4">
              <Grid>
                <TextField path={`routes.${i}.origin`} label="From" required />
                <TextField path={`routes.${i}.destination`} label="To" required />
                <SelectField
                  path={`routes.${i}.kind`}
                  label="Route type"
                  required
                  options={[
                    { value: "local", label: "Local" },
                    { value: "cross_border", label: "Cross-border" },
                  ]}
                />
                <TextField
                  path={`routes.${i}.operatingSince`}
                  label="Operating on this route since"
                  type="month"
                  required
                  hint="At least 6 months of history is required."
                />
              </Grid>
              <MultiCheckField path={`routes.${i}.currencies`} label="Fare currencies on this route" options={currencyOptions} />
            </div>
          </div>
        ))}
        {!disabled && routes.length < 40 && (
          <SmallButton
            onClick={() => set("routes", [...routes, { origin: "", destination: "", kind: "", operatingSince: "", currencies: [] }])}
          >
            {portal.addRoute}
          </SmallButton>
        )}
      </Card>

      <Card title={s.accounts} intro={s.accountsIntro}>
        <Accounts currencies={used} />
      </Card>

      <Card title={s.signatories} intro={s.signatoriesIntro}>
        <Signatories />
      </Card>

      <Card title={s.customerService}>
        <Grid>
          <TextField path="customerService.complaintsPhone" label="Complaints phone" type="tel" required />
          <TextField path="customerService.complaintsEmail" label="Complaints email" type="email" required />
        </Grid>
        <TextField
          path="customerService.refundPolicyUrl"
          label="Link to your published refund and cancellation policy"
          type="url"
          hint="If it is not online, upload it under Documents instead."
        />
      </Card>

      <Card title={s.expiry}>
        <Grid>
          <TextField path="expiry.taxClearance" label="ZIMRA tax clearance expires on" type="date" required />
          <TextField path="expiry.insurance" label="Passenger insurance expires on" type="date" required />
        </Grid>
      </Card>

      <Card title={s.declarations}>
        <CheckField path="declarations.true" label={portal.declarations.true} />
        <CheckField path="declarations.honour" label={portal.declarations.honour} />
      </Card>
    </>
  );
}

// --- Event organiser ------------------------------------------------------------------------

type PastEvent = { name: string; date: string; venue: string; attendance: string };

function OrganiserSections() {
  const { data, set, disabled, errors } = useFormKit();
  const currencies = (getAt(data, "currencies") as string[] | undefined) ?? [];
  const past = (getAt(data, "trackRecord.events") as PastEvent[] | undefined) ?? [];
  return (
    <>
      <Card title={s.company}>
        <Grid>
          <TextField path="company.legalName" label="Registered name" required />
          <TextField path="company.tradingName" label="Trading name (if different)" />
          <TextField path="company.registrationNumber" label="Registration number" required />
          <SelectField path="company.organiserType" label="You are a" options={organiserTypes} required />
        </Grid>
        <TextField path="company.noticeAddress" label="Address for notices" multiline required />
      </Card>

      <Card title={s.contacts}>
        <div className="rounded-2xl bg-mist p-4">
          <p className="mb-3 font-bold text-navy">Main contact</p>
          <ContactFields path="contacts.main" label="Main contact" emailReadOnly />
        </div>
        <LinkedContact path="contacts.eventDay" label="Event-day contact" sameLabel={portal.sameAsMain} />
        <LinkedContact path="contacts.finance" label="Finance contact" sameLabel={portal.sameAsMain} />
      </Card>

      <Card title={s.currencies} intro={s.currenciesIntro}>
        <MultiCheckField path="currencies" label="Currencies" options={currencyOptions} />
      </Card>

      <Card title={s.accounts} intro={s.accountsIntro}>
        {errors.accounts && <p className="text-sm font-semibold text-red-dark">{errors.accounts}</p>}
        <Accounts currencies={CURRENCIES.map((c) => c.code).filter((c) => currencies.includes(c))} />
      </Card>

      <Card title={s.signatories} intro={s.signatoriesIntro}>
        <Signatories />
      </Card>

      <Card title={s.trackRecord} intro={s.trackRecordIntro}>
        {errors.trackRecord && <p className="text-sm font-semibold text-red-dark">{errors.trackRecord}</p>}
        <CheckField path="trackRecord.depositInstead" label="We are a first-time organiser and will provide a security deposit or guarantee." />
        {past.map((_, i) => (
          <div key={i} className="rounded-2xl bg-mist p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">Past event {i + 1}</p>
              {!disabled && (
                <SmallButton tone="plain" onClick={() => set("trackRecord.events", past.filter((__, j) => j !== i))}>
                  {portal.remove}
                </SmallButton>
              )}
            </div>
            <div className="mt-3">
              <Grid>
                <TextField path={`trackRecord.events.${i}.name`} label="Event name" required />
                <TextField path={`trackRecord.events.${i}.date`} label="Date" type="date" required />
                <TextField path={`trackRecord.events.${i}.venue`} label="Venue" required />
                <TextField path={`trackRecord.events.${i}.attendance`} label="Attendance" inputMode="numeric" />
              </Grid>
            </div>
          </div>
        ))}
        {!disabled && past.length < 3 && (
          <SmallButton onClick={() => set("trackRecord.events", [...past, { name: "", date: "", venue: "", attendance: "" }])}>
            {portal.addEvent}
          </SmallButton>
        )}
      </Card>

      <Card title={s.expiry}>
        <Grid>
          <TextField path="expiry.taxClearance" label="ZIMRA tax clearance expires on" type="date" required />
        </Grid>
      </Card>

      <Card title={s.declarations}>
        <CheckField path="declarations.true" label={portal.declarations.true} />
        <CheckField path="declarations.capacity" label={portal.declarations.capacity} />
      </Card>
    </>
  );
}
