import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { getDb } from "@/lib/db/client";
import { fileResponse } from "@/lib/partners/download";
import { blobFileStore } from "@/lib/partners/files";
import { getDocument, getPartner, partnerRef } from "@/lib/partners/service";

/** Streams a partner or library document to a signed-in admin; every download is logged. */
export async function GET(request: Request, ctx: RouteContext<"/admin/files/[id]">) {
  const db = getDb();
  if (!(await isAdmin()) || !db) return NextResponse.redirect(new URL("/admin/login", request.url));
  const doc = await getDocument(db, (await ctx.params).id);
  if (!doc) return new NextResponse("Not found.", { status: 404 });
  const partner = doc.partnerId ? await getPartner(db, doc.partnerId) : null;
  try {
    await writeAudit(db, "partner.document.download", { ref: partner ? partnerRef(partner) : "library", slot: doc.slot });
  } catch (error) {
    console.error("Could not log a document download.", error);
  }
  return fileResponse(blobFileStore, doc);
}
