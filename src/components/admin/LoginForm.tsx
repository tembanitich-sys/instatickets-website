"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { Field, FormBanner, SubmitButton, TextInput } from "@/components/forms/fields";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

export function LoginForm() {
  const [state, dispatch] = useActionState(loginAction, { status: "idle" } as LoginState);
  // A Turnstile token works once, so each attempt gets a fresh challenge.
  const [attempt, setAttempt] = useState(0);

  return (
    <form
      action={(formData) => {
        dispatch(formData);
        setAttempt((a) => a + 1);
      }}
      className="space-y-5"
    >
      <FormBanner message={state.status === "error" ? state.message : undefined} />
      <Field label="Password" htmlFor="admin-password" required>
        <TextInput
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </Field>
      <TurnstileWidget key={attempt} />
      <SubmitButton>SIGN IN</SubmitButton>
    </form>
  );
}
