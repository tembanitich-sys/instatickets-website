"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfigProblem, getAdminConfig } from "@/lib/admin/config";
import { requireAdmin } from "@/lib/admin/auth";
import { getLockoutStore } from "@/lib/admin/lockout";
import { attemptLogin } from "@/lib/admin/login";
import { activeTotpSecret, disableTotp, enableTotp } from "@/lib/admin/totp-store";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin/session";
import { saveGetStartedLink } from "@/lib/admin/settings";
import { clientIp } from "@/lib/client-ip";
import { getDb } from "@/lib/db/client";
import { ipSalt } from "@/lib/forms/deps";
import { SETTINGS_CACHE_TAG } from "@/lib/settings";
import { TURNSTILE_FIELD, defaultTurnstileVerifier } from "@/lib/turnstile";

export type LoginState = { status: "idle" } | { status: "error"; message: string };
export type SettingsState =
  | { status: "idle" }
  | { status: "saved"; value: string | null }
  | { status: "error"; message: string };

const LOGIN_MESSAGES = {
  unavailable: "Admin sign-in is not available. Check the server configuration.",
  locked: "Too many failed attempts. Try again in 15 minutes.",
  captcha: "Please complete the security check and try again.",
  invalid: "Sign-in failed. Check the password (and authenticator code) and try again.",
} as const;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const base = getAdminConfig();
  if (!base) console.error(`Admin sign-in unavailable: ${adminConfigProblem()}`);
  // Two-step sign-in can be turned on in Admin > Settings (stored in the database).
  const totpSecret = base ? await activeTotpSecret(getDb()).catch(() => null) : null;
  const config = base && totpSecret ? { ...base, totpSecret } : base;

  const password = formData.get("password");
  const code = formData.get("code");
  const token = formData.get(TURNSTILE_FIELD);
  const result = await attemptLogin(
    {
      config,
      lockout: getLockoutStore(),
      verifyTurnstile: defaultTurnstileVerifier(),
      db: getDb(),
      ipSalt: ipSalt(),
      log: console,
      now: Date.now,
    },
    {
      password: typeof password === "string" ? password : "",
      turnstileToken: typeof token === "string" ? token : "",
      ip: await clientIp(),
      code: typeof code === "string" ? code : "",
    },
  );
  if (!result.ok) return { status: "error", message: LOGIN_MESSAGES[result.reason] };

  (await cookies()).set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function saveGetStartedAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "The database is not configured, so nothing was saved." };

  const raw = formData.get("getStartedUrl");
  let result;
  try {
    result = await saveGetStartedLink(db, typeof raw === "string" ? raw : "");
  } catch (error) {
    console.error("Could not save the GET STARTED link.", error);
    return { status: "error", message: "Something went wrong and nothing was saved. Please try again." };
  }
  if (!result.ok) return { status: "error", message: result.error };

  // Make the change live now rather than waiting for the one-minute cache.
  revalidateTag(SETTINGS_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  return { status: "saved", value: result.value };
}

export type TotpState = { status: "idle" } | { status: "done"; message: string } | { status: "error"; message: string };

export async function enableTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "The database is not configured." };
  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!(await enableTotp(db, secret, code, Date.now()))) {
    return { status: "error", message: "That code did not match. Check the time on your phone and try the newest code." };
  }
  revalidatePath("/admin/settings");
  return { status: "done", message: "Two-step sign-in is on. From now on, sign-in asks for a code from your authenticator app." };
}

export async function disableTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "The database is not configured." };
  if (!(await disableTotp(db, String(formData.get("code") ?? ""), Date.now()))) {
    return { status: "error", message: "That code did not match." };
  }
  revalidatePath("/admin/settings");
  return { status: "done", message: "Two-step sign-in is off." };
}
