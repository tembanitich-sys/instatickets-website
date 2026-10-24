import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "../db/client";
import { getPartner, type Partner } from "./service";
import { PARTNER_SESSION_COOKIE, partnerSessionSecret, readPartnerSession } from "./tokens";

/** The signed-in partner, or null. Rejected and suspended partners are signed out. */
export async function currentPartner(): Promise<Partner | null> {
  await connection();
  const secret = partnerSessionSecret();
  const db = getDb();
  if (!secret || !db) return null;
  const session = readPartnerSession(secret, (await cookies()).get(PARTNER_SESSION_COOKIE)?.value, Date.now());
  if (!session) return null;
  const partner = await getPartner(db, session.partnerId);
  if (!partner || ["created", "rejected", "suspended"].includes(partner.status)) return null;
  return partner;
}

/** Call at the top of every partner page, action and route. */
export async function requirePartner(): Promise<Partner> {
  const partner = await currentPartner();
  if (!partner) redirect("/partner/sign-in");
  return partner;
}
