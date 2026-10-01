import { formMessages as m } from "@content/site";
import type { Db } from "../db/client";
import type { Notifier } from "../email";
import type { RateLimiter } from "../ratelimit";
import { hashIp } from "../ratelimit";
import { TURNSTILE_FIELD, type VerifyTurnstile } from "../turnstile";
import { agentEmail, businessEmail, contactEmail, customerEmail } from "./notifications";
import {
  parseAgent,
  parseBusiness,
  parseContact,
  parseCustomer,
  type FieldErrors,
  type Parsed,
  type Values,
} from "./schemas";
import { saveAgent, saveBusiness, saveContact, saveCustomer } from "./store";

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string; fieldErrors: FieldErrors; values: Values };

export type Deps = {
  db: Db | null;
  notify: Notifier;
  verifyTurnstile: VerifyTurnstile;
  rateLimiter: RateLimiter;
  /** Secret used to hash the visitor's IP before it reaches the rate limiter. */
  ipSalt: string;
  log: Pick<Console, "error">;
  now: () => Date;
};

export type RequestContext = { ip: string | null };

type FormKind = "customer" | "business" | "contact" | "agent";

const fail = (message: string, values: Values, fieldErrors: FieldErrors = {}): FormState => ({
  status: "error",
  message,
  fieldErrors,
  values,
});

/**
 * The order is deliberate:
 * 1. parse (cheap, no side effects);
 * 2. rate limit, so repeated bad attempts are counted too;
 * 3. report field errors, without spending a one-time Turnstile token;
 * 4. verify Turnstile;
 * 5. store the record;
 * 6. only then notify, and never fail the submission if the notification fails.
 */
async function handle<D, R extends { id: string }>(
  deps: Deps,
  kind: FormKind,
  formData: FormData,
  ctx: RequestContext,
  parsed: Parsed<D>,
  save: (db: Db, data: D, now: Date) => Promise<R>,
  email: (data: D, saved: R) => Parameters<Notifier>[0],
): Promise<FormState> {
  const { values } = parsed;

  const key = `${kind}:${ctx.ip ? hashIp(ctx.ip, deps.ipSalt) : "unknown"}`;
  if (!(await deps.rateLimiter.allow(key))) return fail(m.rateLimited, values);

  if (!parsed.ok) return fail(m.fixErrors, values, parsed.fieldErrors);

  const token = formData.get(TURNSTILE_FIELD);
  const human = typeof token === "string" && (await deps.verifyTurnstile(token, ctx.ip));
  if (!human) return fail(m.captcha, values);

  let saved: R;
  try {
    if (!deps.db) throw new Error("DATABASE_URL is not configured.");
    saved = await save(deps.db, parsed.data, deps.now());
  } catch (error) {
    deps.log.error(`Could not store ${kind} submission.`, error);
    return fail(m.serverError, values);
  }

  try {
    await deps.notify(email(parsed.data, saved));
  } catch (error) {
    // The record is already safe in the database; a failed email must not turn
    // a successful submission into an error for the visitor.
    deps.log.error(`Notification email for ${kind} submission ${saved.id} failed.`, error);
  }

  return { status: "success" };
}

export function submitCustomer(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "customer", formData, ctx, parseCustomer(formData), saveCustomer, (_data, saved) =>
    customerEmail(saved),
  );
}

export function submitBusiness(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "business", formData, ctx, parseBusiness(formData), saveBusiness, (data, saved) =>
    businessEmail(data, { id: saved.id }),
  );
}

export function submitAgent(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "agent", formData, ctx, parseAgent(formData), saveAgent, (data, saved) =>
    agentEmail(data, { id: saved.id }),
  );
}

export function submitContact(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "contact", formData, ctx, parseContact(formData), saveContact, (data, saved) =>
    contactEmail(data, { id: saved.id }),
  );
}
