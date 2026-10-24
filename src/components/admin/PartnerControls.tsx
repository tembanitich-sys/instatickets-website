"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { organiserTypes } from "@content/onboarding";
import {
  createPartnerAction,
  eventAction,
  inviteAction,
  partnerAction,
  sandboxAction,
  updateSetupAction,
  type AdminResult,
} from "@/app/admin/partners/actions";
import type { AdminAction, EventAction } from "@/lib/partners/service";
import { Field, FormBanner, SubmitButton, TextInput } from "@/components/forms/fields";

function Message({ result }: { result: AdminResult | null }) {
  if (!result) return null;
  return result.ok ? (
    result.message ? (
      <p role="status" className="text-sm font-semibold text-green-800">
        {result.message}
      </p>
    ) : null
  ) : (
    <FormBanner message={result.message} />
  );
}

export function CreatePartnerForm() {
  const [state, dispatch] = useActionState(createPartnerAction, null);
  const [type, setType] = useState("bus_operator");
  const bus = type === "bus_operator";
  return (
    <form action={dispatch} className="space-y-5">
      <Message result={state} />
      <fieldset>
        <legend className="mb-1 text-sm font-bold text-navy">Partner type</legend>
        <div className="flex flex-wrap gap-x-6">
          {[
            ["bus_operator", "Bus operator"],
            ["event_organiser", "Event or sports organiser"],
          ].map(([v, l]) => (
            <label key={v} className="flex min-h-11 items-center gap-3 text-sm">
              <input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} className="size-5 accent-navy" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Registered name" htmlFor="cp-legal" required>
          <TextInput id="cp-legal" name="legalName" required />
        </Field>
        <Field label="Trading name" htmlFor="cp-trading" optional>
          <TextInput id="cp-trading" name="tradingName" />
        </Field>
        {bus ? (
          <Field label="Group" htmlFor="cp-group" optional hint="For example CAG group or InterAfrica group.">
            <TextInput id="cp-group" name="groupName" />
          </Field>
        ) : (
          <Field label="Organiser type" htmlFor="cp-otype" required>
            <select id="cp-otype" name="organiserType" required className="block min-h-11 w-full rounded-lg border border-line bg-white px-3">
              <option value="">Choose…</option>
              {organiserTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      {bus && (
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="anchorAddendum" className="size-5 accent-navy" />
          The Anchor Operator Addendum applies (CAG and InterAfrica groups)
        </label>
      )}
      <p className="pt-2 font-bold text-navy">{bus ? "Finance contact (signs in to the portal)" : "Main contact (signs in to the portal)"}</p>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Name" htmlFor="cp-cname" required>
          <TextInput id="cp-cname" name="contactName" required />
        </Field>
        <Field label="Email" htmlFor="cp-cemail" required>
          <TextInput id="cp-cemail" name="contactEmail" type="email" required />
        </Field>
        <Field label="Phone" htmlFor="cp-cphone" optional>
          <TextInput id="cp-cphone" name="contactPhone" type="tel" />
        </Field>
      </div>
      <SubmitButton>CREATE PARTNER</SubmitButton>
    </form>
  );
}

export function SetupForm({
  partnerId,
  bus,
  initial,
}: {
  partnerId: string;
  bus: boolean;
  initial: { contactName: string; contactEmail: string; contactPhone: string; anchorAddendum: boolean; groupName: string };
}) {
  const [state, dispatch] = useActionState(updateSetupAction.bind(null, partnerId), null);
  return (
    <form action={dispatch} className="space-y-4">
      <Message result={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact name" htmlFor="su-name" required>
          <TextInput id="su-name" name="contactName" defaultValue={initial.contactName} required />
        </Field>
        <Field label="Contact email (signs in)" htmlFor="su-email" required>
          <TextInput id="su-email" name="contactEmail" type="email" defaultValue={initial.contactEmail} required />
        </Field>
        <Field label="Contact phone" htmlFor="su-phone" optional>
          <TextInput id="su-phone" name="contactPhone" defaultValue={initial.contactPhone} />
        </Field>
      </div>
      {bus && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Group" htmlFor="su-group" optional>
            <TextInput id="su-group" name="groupName" defaultValue={initial.groupName} />
          </Field>
          <label className="flex min-h-11 items-center gap-3 self-end text-sm">
            <input type="checkbox" name="anchorAddendum" defaultChecked={initial.anchorAddendum} className="size-5 accent-navy" />
            Anchor Operator Addendum applies
          </label>
        </div>
      )}
      <button type="submit" className="min-h-11 rounded-full border-2 border-navy px-5 text-sm font-bold text-navy hover:bg-mist">
        SAVE CONTACT
      </button>
    </form>
  );
}

export function InviteButton({ partnerId, label, blockers }: { partnerId: string; label: string; blockers: string[] }) {
  const router = useRouter();
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      {blockers.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
          {blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={pending || blockers.length > 0}
        onClick={() =>
          start(async () => {
            setResult(await inviteAction(partnerId));
            router.refresh();
          })
        }
        className="inline-flex min-h-11 items-center rounded-full bg-red px-5 text-sm font-bold text-white hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending…" : label}
      </button>
      <Message result={result} />
    </div>
  );
}

type ActionDef<A extends string> = { action: A; label: string; needsNote?: boolean; tone?: "red" | "navy" };

function ActionPanel<A extends string>({
  actions,
  run,
}: {
  actions: ActionDef<A>[];
  run: (action: A, note: string) => Promise<AdminResult>;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  if (actions.length === 0) return null;
  const go = (a: ActionDef<A>) =>
    start(async () => {
      if (a.needsNote && !note.trim()) {
        setResult({ ok: false, message: "Write a note first." });
        return;
      }
      const r = await run(a.action, note);
      setResult(r);
      if (r.ok) setNote("");
      router.refresh();
    });
  return (
    <div className="space-y-3">
      {actions.some((a) => a.needsNote) && (
        <div>
          <label htmlFor="review-note" className="mb-1.5 block text-sm font-bold text-navy">
            Note to the partner (needed to request changes or reject)
          </label>
          <textarea
            id="review-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full rounded-lg border border-line bg-white px-3 py-2"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.action}
            type="button"
            disabled={pending}
            onClick={() => go(a)}
            className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold disabled:opacity-60 ${
              a.tone === "red" ? "bg-red text-white hover:bg-red-dark" : "border-2 border-navy text-navy hover:bg-mist"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <Message result={result} />
    </div>
  );
}

export function PartnerActions({ partnerId, actions }: { partnerId: string; actions: ActionDef<AdminAction>[] }) {
  return <ActionPanel actions={actions} run={(a, note) => partnerAction(partnerId, a, note)} />;
}

export function EventActions({ partnerId, eventId, actions }: { partnerId: string; eventId: string; actions: ActionDef<EventAction>[] }) {
  return <ActionPanel actions={actions} run={(a, note) => eventAction(partnerId, eventId, a, note)} />;
}

export function SandboxForm({ partnerId, initial }: { partnerId: string; initial: string }) {
  const [state, dispatch] = useActionState(sandboxAction.bind(null, partnerId), null);
  return (
    <form action={dispatch} className="space-y-3">
      <Message result={state} />
      <label htmlFor="sandbox" className="block text-sm font-bold text-navy">
        Sandbox credentials for this operator
      </label>
      <p className="text-sm text-muted">
        Exactly as the technical contact should receive them, for example the sandbox URL, client ID and secret. They are emailed with
        the Integration Standard when the operator submits.
      </p>
      <textarea
        id="sandbox"
        name="credentials"
        rows={5}
        defaultValue={initial}
        maxLength={2000}
        className="block w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-sm"
      />
      <button type="submit" className="min-h-11 rounded-full border-2 border-navy px-5 text-sm font-bold text-navy hover:bg-mist">
        SAVE CREDENTIALS
      </button>
    </form>
  );
}
