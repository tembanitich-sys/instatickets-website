"use server";

import { headers } from "next/headers";
import { defaultDeps } from "@/lib/forms/deps";
import {
  submitBusiness,
  submitContact,
  submitCustomer,
  type FormState,
} from "@/lib/forms/submit";

/** The visitor's IP, used only (hashed) by the rate limiter and passed to Turnstile. */
async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function preregisterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitCustomer(defaultDeps(), formData, { ip: await clientIp() });
}

export async function registerBusinessAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitBusiness(defaultDeps(), formData, { ip: await clientIp() });
}

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitContact(defaultDeps(), formData, { ip: await clientIp() });
}
