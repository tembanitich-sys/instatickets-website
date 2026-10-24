"use client";

import { useActionState } from "react";
import { disableTotpAction, enableTotpAction, type TotpState } from "@/app/admin/actions";
import { Field, FormBanner, SubmitButton, TextInput } from "@/components/forms/fields";

function Result({ state }: { state: TotpState }) {
  if (state.status === "error") return <FormBanner message={state.message} />;
  if (state.status === "done")
    return (
      <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
        {state.message}
      </p>
    );
  return null;
}

export function EnableTwoStep({ secret, qrSvg }: { secret: string; qrSvg: string }) {
  const [state, dispatch] = useActionState(enableTotpAction, { status: "idle" } as TotpState);
  if (state.status === "done") return <Result state={state} />;
  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
      {/* The QR code is generated on the server from the key below; it holds nothing else. */}
      <div className="rounded-xl border border-line bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      <form action={dispatch} className="space-y-4">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Open Google Authenticator or Microsoft Authenticator on your phone.</li>
          <li>Tap + and scan this QR code (or choose &quot;Enter a setup key&quot; and type the key below).</li>
          <li>Type the 6-digit code the app shows, and press TURN ON.</li>
        </ol>
        <p className="break-all rounded-lg bg-mist px-3 py-2 font-mono text-sm">{secret}</p>
        <input type="hidden" name="secret" value={secret} />
        <Result state={state} />
        <Field label="6-digit code from the app" htmlFor="totp-code" required>
          <TextInput id="totp-code" name="code" inputMode="numeric" autoComplete="one-time-code" required />
        </Field>
        <SubmitButton>TURN ON</SubmitButton>
      </form>
    </div>
  );
}

export function DisableTwoStep() {
  const [state, dispatch] = useActionState(disableTotpAction, { status: "idle" } as TotpState);
  if (state.status === "done") return <Result state={state} />;
  return (
    <form action={dispatch} className="max-w-sm space-y-4">
      <Result state={state} />
      <Field label="Current code, to turn it off" htmlFor="totp-off" required>
        <TextInput id="totp-off" name="code" inputMode="numeric" autoComplete="one-time-code" required />
      </Field>
      <button type="submit" className="min-h-11 rounded-full border-2 border-navy px-5 text-sm font-bold text-navy hover:bg-mist">
        TURN OFF
      </button>
    </form>
  );
}
