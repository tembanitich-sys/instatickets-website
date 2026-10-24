import { formMessages as m } from "@content/site";
import type { Db } from "../db/client";
import type { EmailMessage, Notifier } from "../email";
import type { SheetAppender } from "../sheets";
import type { RateLimiter } from "../ratelimit";
import { hashIp } from "../ratelimit";
import { TURNSTILE_FIELD, type VerifyTurnstile } from "../turnstile";
import {
  agentEmail,
  businessEmail,
  contactEmail,
  customerEmail,
  operatorAutoReply,
  operatorEmail,
  operatorFields,
} from "./notifications";
import {
  parseAgent,
  parseBusiness,
  parseContact,
  parseCustomer,
  parseOperator,
  type FieldErrors,
  type Parsed,
  type Values,
} from "./schemas";
import { saveAgent, saveBusiness, saveContact, saveCustomer, saveOperator } from "./store";

export type FormState =
  | { status: "idle" }
  | { status: "success"; reference?: string }
  | { status: "error"; message?: string; fieldErrors: FieldErrors; values: Values };

export type Deps = {
  db: Db | null;
  notify: Notifier;
  /** Adds operator registrations to the onboarding team's Google Sheet. */
  appendOperatorRow: SheetAppender;
  verifyTurnstile: VerifyTurnstile;
  rateLimiter: RateLimiter;
  /** Secret used to hash the visitor's IP before it reaches the rate limiter. */
  ipSalt: string;
  log: Pick<Console, "error">;
  now: () => Date;
};

export type RequestContext = { ip: string | null };

type FormKind = "customer" | "business" | "contact" | "agent" | "operator";

/** Something to do once the record is safely stored. A failure is logged, never shown to the visitor. */
type FollowUp = { name: string; run: () => Promise<void> };

const emailTo = (deps: Deps, message: EmailMessage): FollowUp => ({
  name: "Notification email",
  run: () => deps.notify(message),
});

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
 * 6. only then notify (and run any other follow-ups), never failing the submission if one fails.
 */
async function handle<D, R extends { id: string }>(
  deps: Deps,
  kind: FormKind,
  formData: FormData,
  ctx: RequestContext,
  parsed: Parsed<D>,
  save: (db: Db, data: D, now: Date) => Promise<R>,
  followUps: (data: D, saved: R) => FollowUp[],
  reference?: (saved: R) => string,
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

  // The record is already safe in the database; a failed email or sheet update must
  // not turn a successful submission into an error for the visitor. They run one after
  // another so the team notification always goes first.
  for (const task of followUps(parsed.data, saved)) {
    try {
      await task.run();
    } catch (error) {
      deps.log.error(`${task.name} for ${kind} submission ${saved.id} failed.`, error);
    }
  }

  return reference ? { status: "success", reference: reference(saved) } : { status: "success" };
}

export function submitCustomer(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "customer", formData, ctx, parseCustomer(formData), saveCustomer, (_data, saved) => [
    emailTo(deps, customerEmail(saved)),
  ]);
}

export function submitBusiness(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "business", formData, ctx, parseBusiness(formData), saveBusiness, (data, saved) => [
    emailTo(deps, businessEmail(data, { id: saved.id })),
  ]);
}

export function submitAgent(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "agent", formData, ctx, parseAgent(formData), saveAgent, (data, saved) => [
    emailTo(deps, agentEmail(data, { id: saved.id })),
  ]);
}

export function submitContact(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(deps, "contact", formData, ctx, parseContact(formData), saveContact, (data, saved) => [
    emailTo(deps, contactEmail(data, { id: saved.id })),
  ]);
}

/**
 * Bus operator registration (operators.instatickets.co.zw): the team is emailed, the
 * operator gets an auto-reply with their reference, and a row is added to the Google Sheet.
 */
export function submitOperator(deps: Deps, formData: FormData, ctx: RequestContext) {
  return handle(
    deps,
    "operator",
    formData,
    ctx,
    parseOperator(formData),
    saveOperator,
    (data, saved) => [
      emailTo(deps, operatorEmail(data, saved)),
      { name: "Operator auto-reply email", run: () => deps.notify(operatorAutoReply(data, saved)) },
      {
        name: "Google Sheet row",
        run: () =>
          deps.appendOperatorRow([...operatorFields(data, saved), ["Status", "New"], ["Record", saved.id]], {
            sheet: "Expressions of interest",
          }),
      },
    ],
    (saved) => saved.ref,
  );
}
