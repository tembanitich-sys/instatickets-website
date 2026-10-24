"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clientIp } from "@/lib/client-ip";
import { ipSalt } from "@/lib/forms/deps";
import { getRateLimiter, hashIp } from "@/lib/ratelimit";
import { TURNSTILE_FIELD, defaultTurnstileVerifier } from "@/lib/turnstile";
import { requirePartner } from "@/lib/partners/auth";
import { partnerDeps } from "@/lib/partners/deps";
import type { Problem } from "@/lib/partners/kyc";
import { partnerMayUpload } from "@/lib/partners/permissions";
import {
  consumeSignIn,
  createEvent,
  getDocument,
  PartnerError,
  recordDocument,
  removeDocument,
  requestSignIn,
  saveEvent,
  saveKyc,
  submitEvent,
  submitKyc,
} from "@/lib/partners/service";
import { createPartnerSession, PARTNER_SESSION_COOKIE, PARTNER_SESSION_TTL_SECONDS, partnerSessionSecret } from "@/lib/partners/tokens";

export type ActionResult = { ok: true } | { ok: false; message: string; problems?: Problem[] };

const unavailable: ActionResult = { ok: false, message: "The portal is not available right now. Please try again later." };

async function guard<T>(run: () => Promise<T>): Promise<T | ActionResult> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof PartnerError) return { ok: false, message: error.message };
    // redirect() and notFound() work by throwing; let them through.
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Partner portal action failed.", error);
    return { ok: false, message: "Something went wrong and nothing was saved. Please try again." };
  }
}

// --- Signing in ---------------------------------------------------------------------

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

export async function requestSignInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const deps = partnerDeps();
  if (!deps) return { status: "error", message: "The portal is not available right now." };
  const ip = await clientIp();
  if (!(await getRateLimiter().allow(`partner-sign-in:${ip ? hashIp(ip, ipSalt()) : "unknown"}`))) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }
  const token = formData.get(TURNSTILE_FIELD);
  if (typeof token !== "string" || !(await defaultTurnstileVerifier()(token, ip))) {
    return { status: "error", message: "Please complete the security check and try again." };
  }
  const email = formData.get("email");
  try {
    await requestSignIn(deps, typeof email === "string" ? email : "");
  } catch (error) {
    console.error("Sign-in request failed.", error);
  }
  return { status: "sent" };
}

export async function continueAction(formData: FormData): Promise<void> {
  const deps = partnerDeps();
  const secret = partnerSessionSecret();
  const token = formData.get("token");
  const partnerId = deps && secret && typeof token === "string" ? await consumeSignIn(deps, token) : null;
  if (!partnerId || !secret) redirect("/partner/sign-in?expired=1");
  (await cookies()).set(PARTNER_SESSION_COOKIE, createPartnerSession(secret, partnerId, Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/partner",
    maxAge: PARTNER_SESSION_TTL_SECONDS,
  });
  redirect("/partner");
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete({ name: PARTNER_SESSION_COOKIE, path: "/partner" });
  redirect("/partner/sign-in");
}

// --- KYC ---------------------------------------------------------------------------

export async function saveKycAction(json: string): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await saveKyc(deps, partner.id, JSON.parse(json.slice(0, 200_000)));
    revalidatePath("/partner");
    return { ok: true as const };
  });
}

export async function submitKycAction(json: string): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await saveKyc(deps, partner.id, JSON.parse(json.slice(0, 200_000)));
    const result = await submitKyc(deps, partner.id);
    revalidatePath("/partner");
    if (!result.ok) return { ok: false as const, message: "Some details are still missing.", problems: result.problems };
    return { ok: true as const };
  });
}

// --- Documents -----------------------------------------------------------------------

export async function recordUploadAction(input: { slot: string; eventId: string | null; pathname: string; fileName: string }): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const may = await partnerMayUpload(deps.db, partner, input.slot, input.eventId);
    if (!may.ok) throw new PartnerError("This document cannot be changed now.");
    await recordDocument(deps, { partnerId: partner.id, eventId: input.eventId, slot: input.slot, source: "partner", pathname: input.pathname, fileName: input.fileName, multiple: may.multiple });
    revalidatePath("/partner", "layout");
    return { ok: true as const };
  });
}

export async function deleteDocumentAction(documentId: string): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const doc = await getDocument(deps.db, documentId);
    if (!doc || doc.partnerId !== partner.id || doc.source !== "partner") throw new PartnerError("Document not found.");
    const may = await partnerMayUpload(deps.db, partner, doc.slot, doc.eventId);
    if (!may.ok) throw new PartnerError("This document cannot be changed now.");
    await removeDocument(deps, doc);
    revalidatePath("/partner", "layout");
    return { ok: true as const };
  });
}

// --- Events --------------------------------------------------------------------------

export async function createEventAction(): Promise<void> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) redirect("/partner");
  let id: string;
  try {
    id = (await createEvent(deps, partner.id)).id;
  } catch {
    redirect("/partner");
  }
  redirect(`/partner/events/${id}`);
}

export async function saveEventAction(eventId: string, json: string): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await saveEvent(deps, partner.id, eventId, JSON.parse(json.slice(0, 200_000)));
    revalidatePath(`/partner/events/${eventId}`);
    return { ok: true as const };
  });
}

export async function submitEventAction(eventId: string, json: string): Promise<ActionResult> {
  const partner = await requirePartner();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await saveEvent(deps, partner.id, eventId, JSON.parse(json.slice(0, 200_000)));
    const result = await submitEvent(deps, partner.id, eventId);
    revalidatePath(`/partner/events/${eventId}`);
    if (!result.ok) return { ok: false as const, message: "Some details are still missing.", problems: result.problems };
    return { ok: true as const };
  });
}
