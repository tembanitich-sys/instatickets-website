"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/forms/submit";
import { readUtm } from "@/lib/utm";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/** Shared behaviour of the three forms. */
export function useSubmission(action: Action) {
  const [state, dispatch] = useActionState(action, { status: "idle" } as FormState);
  // Bumped on every submit so the Turnstile widget remounts with a fresh challenge.
  const [attempt, setAttempt] = useState(0);

  const submit = (formData: FormData) => {
    const utm = readUtm();
    formData.set("utm_source", utm.source);
    formData.set("utm_medium", utm.medium);
    formData.set("utm_campaign", utm.campaign);
    dispatch(formData);
    setAttempt((a) => a + 1);
  };

  const errors = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : {};
  return {
    state,
    submit,
    attempt,
    errors,
    message: state.status === "error" ? state.message : undefined,
    /** What the visitor typed in a text field, so an error never wipes the form. */
    val: (name: string) => {
      const v = values[name];
      return typeof v === "string" ? v : undefined;
    },
    vals: (name: string) => {
      const v = values[name];
      return Array.isArray(v) ? v : [];
    },
    on: (name: string) => values[name] === "on",
  };
}
