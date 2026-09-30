export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

/** Sends an email or throws. Callers decide what a failure means. */
export type Notifier = (message: EmailMessage) => Promise<void>;

const DEFAULT_FROM = "InstaTickets Website <website@instatickets.co.zw>";

/** Sends through the Resend HTTP API. Needs RESEND_API_KEY and a verified sending domain. */
export const sendEmail: Notifier = async (message) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set; email not sent.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend responded with HTTP ${res.status}.`);
};
