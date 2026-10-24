"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { CURRENCIES, eventTypes, portal } from "@content/onboarding";
import {
  Card,
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
type TicketClass = { name: string; currency: string; faceValue: string; quantity: string; notes: string };

const currencyOptions = CURRENCIES.map((c) => ({ value: c.code, label: c.label }));

export function EventForm({
  initial,
  editable,
  save,
  submit,
  children,
}: {
  initial: Record<string, unknown>;
  editable: boolean;
  save: (json: string) => Promise<Result>;
  submit: (json: string) => Promise<Result>;
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
        <EventSections />
        {children}
        {editable && (
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
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

function EventSections() {
  const { data, set, disabled, errors } = useFormKit();
  const classes = (getAt(data, "ticketClasses") as TicketClass[] | undefined) ?? [];
  const currencies = (getAt(data, "currencies") as string[] | undefined) ?? [];
  const type = getAt(data, "type");
  const sports = type === "sports_fixture" || type === "season";
  const allocation = getAt(data, "allocation");
  const gate = getAt(data, "gateControl");
  const chosen = currencyOptions.filter((c) => currencies.includes(c.value));
  return (
    <>
      <Card title="Event">
        <Grid>
          <TextField path="name" label="Event or fixture name" required />
          <SelectField path="type" label="Event type" options={eventTypes} required />
          <TextField path="startDate" label="Event date" type="date" required />
          <TextField path="endDate" label="Last day (for multi-day events)" type="date" />
          <TextField path="gatesOpen" label="Gates open at" type="time" required />
          <TextField path="licensedCapacity" label="Licensed capacity" inputMode="numeric" required />
        </Grid>
        <Grid>
          <TextField path="venueName" label="Venue" required />
          <TextField path="venueAddress" label="Venue address" required />
        </Grid>
        <TextField path="ageRestrictions" label="Age restrictions and entry conditions" multiline />
        {sports && <TextField path="sanctionBody" label="Governing body, league or club sanctioning the fixture" required />}
      </Card>

      <Card title="Sales">
        <Grid>
          <TextField path="salesOpen" label="Sales open on" type="date" required />
          <TextField path="salesClose" label="Sales close on" type="date" required />
        </Grid>
        <RadioField
          path="allocation"
          label="Tickets sold through InstaTickets"
          options={[
            { value: "all", label: "All tickets (exclusive)" },
            { value: "fixed", label: "A fixed quantity" },
          ]}
        />
        {allocation === "fixed" && <TextField path="allocationQuantity" label="Quantity for InstaTickets" inputMode="numeric" required />}
        <MultiCheckField path="currencies" label="Currencies for this event" options={currencyOptions} />
      </Card>

      <Card title="Ticket classes" intro="Complimentary tickets count towards capacity.">
        {errors.ticketClasses && <p className="text-sm font-semibold text-red-dark">{errors.ticketClasses}</p>}
        {classes.map((_, i) => (
          <div key={i} className="rounded-2xl bg-mist p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">Class {i + 1}</p>
              {!disabled && (
                <SmallButton tone="plain" onClick={() => set("ticketClasses", classes.filter((__, j) => j !== i))}>
                  {portal.remove}
                </SmallButton>
              )}
            </div>
            <div className="mt-3">
              <Grid>
                <TextField path={`ticketClasses.${i}.name`} label="Class name" required placeholder="General, VIP, Child" />
                <SelectField path={`ticketClasses.${i}.currency`} label="Currency" options={chosen} required />
                <TextField path={`ticketClasses.${i}.faceValue`} label="Face value" inputMode="decimal" required placeholder="25.00" />
                <TextField path={`ticketClasses.${i}.quantity`} label="Quantity" inputMode="numeric" required />
              </Grid>
              <div className="mt-4">
                <TextField path={`ticketClasses.${i}.notes`} label="Notes" placeholder="For example: proof of age required at the gate" />
              </div>
            </div>
          </div>
        ))}
        {!disabled && classes.length < 20 && (
          <SmallButton
            onClick={() =>
              set("ticketClasses", [...classes, { name: "", currency: currencies[0] ?? "", faceValue: "", quantity: "", notes: "" }])
            }
          >
            {portal.addClass}
          </SmallButton>
        )}
      </Card>

      <Card title="Event day">
        <Grid>
          <TextField path="eventDayContact.name" label="Event-day contact name" required />
          <TextField path="eventDayContact.phone" label="Event-day contact phone" type="tel" required />
        </Grid>
        <RadioField
          path="gateControl"
          label="Gate entry is validated by"
          options={[
            { value: "app", label: "The InstaTickets validation app" },
            { value: "approved_system", label: "Another approved system" },
          ]}
        />
        {gate === "approved_system" && <TextField path="gateSystemName" label="Name of the gate system" required />}
      </Card>

      <Card title="Public liability insurance">
        <Grid>
          <TextField path="insurance.insurer" label="Insurer" required />
          <TextField path="insurance.coverAmount" label="Cover amount" required />
          <TextField path="insurance.expiry" label="Cover expires on" type="date" required />
        </Grid>
      </Card>
    </>
  );
}

