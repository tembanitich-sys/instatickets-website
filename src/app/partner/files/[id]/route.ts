import { NextResponse } from "next/server";
import { currentPartner } from "@/lib/partners/auth";
import { getDb } from "@/lib/db/client";
import { blobFileStore } from "@/lib/partners/files";
import { partnerMayDownload } from "@/lib/partners/permissions";
import { getDocument } from "@/lib/partners/service";
import { fileResponse } from "@/lib/partners/download";

/** Streams a file to the partner who owns it (never a public link). */
export async function GET(_request: Request, ctx: RouteContext<"/partner/files/[id]">) {
  const partner = await currentPartner();
  const db = getDb();
  if (!partner || !db) return NextResponse.redirect(new URL("/partner/sign-in", _request.url));
  const doc = await getDocument(db, (await ctx.params).id);
  if (!doc || !partnerMayDownload(partner, doc)) return new NextResponse("Not found.", { status: 404 });
  return fileResponse(blobFileStore, doc);
}
