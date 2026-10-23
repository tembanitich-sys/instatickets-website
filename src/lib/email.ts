export type EmailMessage = {
  /** One address or several; every address receives the same message. */
  to: string | readonly string[];
  /** Overrides EMAIL_FROM, for example so the operator auto-reply comes from accounts@. */
  from?: string;
  subject: string;
  text: string;
  replyTo?: string;
};

/** Sends an email or throws. Callers decide what a failure means. */
export type Notifier = (message: EmailMessage) => Promise<void>;

const DEFAULT_FROM = "InstaTickets Website <website@instatickets.co.zw>";

/**
 * Bus operator registrations: the onboarding team that is notified, and the mailbox the
 * operator's auto-reply comes from (so their replies reach the team). The auto-reply needs
 * instatickets.co.zw verified in Resend.
 */
export const OPERATOR_MAIL = {
  notify: ["accounts@instatickets.co.zw", "tich@instatickets.co.zw"],
  from: "InstaTickets Operator Onboarding <accounts@instatickets.co.zw>",
  replyTo: "accounts@instatickets.co.zw",
} as const;

/** Sends through the Resend HTTP API. Needs RESEND_API_KEY and a verified sending domain. */
export const sendEmail: Notifier = async (message) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set; email not sent.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: message.from || process.env.EMAIL_FROM || DEFAULT_FROM,
      to: typeof message.to === "string" ? [message.to] : [...message.to],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend responded with HTTP ${res.status}.`);
};
