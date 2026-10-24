import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@content/onboarding";
import { isAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { adminMayUpload } from "@/lib/partners/admin-slots";
import { libraryPrefix, partnerPrefix } from "@/lib/partners/files";
import { getPartner } from "@/lib/partners/service";

/** Upload tokens for admins: contract documents, library documents, and files on a partner's behalf. */
export async function POST(request: Request): Promise<NextResponse> {
  const db = getDb();
  if (!(await isAdmin()) || !db) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload ?? "{}") as { slot?: unknown; eventId?: unknown; partnerId?: unknown };
        const slot = typeof payload.slot === "string" ? payload.slot : "";
        const partnerId = typeof payload.partnerId === "string" ? payload.partnerId : null;
        const eventId = typeof payload.eventId === "string" ? payload.eventId : null;
        const partner = partnerId ? await getPartner(db, partnerId) : null;
        if (partnerId && !partner) throw new Error("Partner not found.");
        const prefix = partnerId ? partnerPrefix(partnerId) : libraryPrefix;
        if (!pathname.startsWith(prefix) || pathname.includes("..")) throw new Error("Wrong folder.");
        if (!adminMayUpload({ partnerId, eventId, slot, partnerType: partner?.type }).ok) throw new Error("Not an upload slot.");
        return { allowedContentTypes: UPLOAD_TYPES, maximumSizeInBytes: UPLOAD_MAX_BYTES, addRandomSuffix: true, validUntil: Date.now() + 10 * 60 * 1000 };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload refused." }, { status: 400 });
  }
}
