"use client";

import { useActionState } from "react";
import { saveGetStartedAction, type SettingsState } from "@/app/admin/actions";
import { Field, FormBanner, SubmitButton, TextInput } from "@/components/forms/fields";

export function GetStartedForm({ current, defaultUrl }: { current: string | null; defaultUrl: string }) {
  const [state, dispatch] = useActionState(saveGetStartedAction, { status: "idle" } as SettingsState);
  // After a save, show what was saved; before that, what is stored now.
  const shown = state.status === "saved" ? state.value : current;

  return (
    <form action={dispatch} className="max-w-2xl space-y-4">
      <FormBanner message={state.status === "error" ? state.message : undefined} />
      {state.status === "saved" && (
        <p role="status" className="rounded-lg border border-green-700 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {state.value ? "Saved. The GET STARTED button now uses this link." : "Reset. The GET STARTED button now uses the default link."}
        </p>
      )}
      <Field
        label="GET STARTED link"
        htmlFor="getStartedUrl"
        hint={`Used by the GET STARTED button after launch. Must start with https://. Leave empty to use the default (${defaultUrl}).`}
      >
        <TextInput
          id="getStartedUrl"
          name="getStartedUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          maxLength={2000}
          placeholder={defaultUrl}
          // key makes the field pick up the saved value after a successful save
          key={shown ?? "default"}
          defaultValue={shown ?? ""}
        />
      </Field>
      <SubmitButton>SAVE</SubmitButton>
    </form>
  );
}
