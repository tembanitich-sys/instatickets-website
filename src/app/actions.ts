"use server";

import { clientIp } from "@/lib/client-ip";
import { defaultDeps } from "@/lib/forms/deps";
import {
  submitAgent,
  submitBusiness,
  submitContact,
  submitCustomer,
  type FormState,
} from "@/lib/forms/submit";

export async function preregisterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitCustomer(defaultDeps(), formData, { ip: await clientIp() });
}

export async function registerBusinessAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitBusiness(defaultDeps(), formData, { ip: await clientIp() });
}

export async function agentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitAgent(defaultDeps(), formData, { ip: await clientIp() });
}

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitContact(defaultDeps(), formData, { ip: await clientIp() });
}
