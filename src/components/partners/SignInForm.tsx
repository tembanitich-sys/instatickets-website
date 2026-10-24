"use client";

import { useActionState, useState } from "react";
import { portal } from "@content/onboarding";
import { requestSignInAction, type SignInState } from "@/app/partner/actions";
import { Field, FormBanner, SubmitButton, TextInput } from "@/components/forms/fields";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

export function SignInForm() {
  const [state, dispatch] = useActionState(requestSignInAction, { status: "idle" } as SignInState);
  const [attempt, setAttempt] = useState(0);
  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-2xl bg-mist p-5 leading-relaxed text-ink">
        {portal.signIn.sent}
      </p>
    );
  }
  return (
    <form
      action={(fd) => {
        dispatch(fd);
        setAttempt((a) => a + 1);
      }}
      className="space-y-5"
    >
      <FormBanner message={state.status === "error" ? state.message : undefined} />
      <Field label={portal.signIn.email} htmlFor="ps-email" required>
        <TextInput id="ps-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <TurnstileWidget key={attempt} />
      <SubmitButton>{portal.signIn.button}</SubmitButton>
    </form>
  );
}
