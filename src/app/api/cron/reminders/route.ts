import { NextResponse } from "next/server";
import { partnerDeps } from "@/lib/partners/deps";
import { sendReminders } from "@/lib/partners/service";

/**
 * Daily (vercel.json "crons"): reminds invited partners who have not submitted, on day 2 and
 * day 5 after the invitation. Vercel calls it with "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  const deps = partnerDeps();
  if (!deps) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const sent = await sendReminders(deps);
  return NextResponse.json({ sent });
}
