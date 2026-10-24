import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@content/onboarding";
import { currentPartner } from "@/lib/partners/auth";
import { getDb } from "@/lib/db/client";
import { partnerPrefix } from "@/lib/partners/files";
import { partnerMayUpload } from "@/lib/partners/permissions";

/**
 * Issues a short-lived token so the browser can upload one file straight to private storage.
 * The partner must be signed in, the slot must be open to it, and the path must sit inside
 * its own folder. The file is recorded afterwards by recordUploadAction, which checks again.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const partner = await currentPartner();
  const db = getDb();
  if (!partner || !db) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload ?? "{}") as { slot?: unknown; eventId?: unknown };
        const slot = typeof payload.slot === "string" ? payload.slot : "";
        const eventId = typeof payload.eventId === "string" ? payload.eventId : null;
        if (!pathname.startsWith(partnerPrefix(partner.id)) || pathname.includes("..")) throw new Error("Wrong folder.");
        if (!(await partnerMayUpload(db, partner, slot, eventId)).ok) throw new Error("This document cannot be changed now.");
        return {
          allowedContentTypes: UPLOAD_TYPES,
          maximumSizeInBytes: UPLOAD_MAX_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload refused." }, { status: 400 });
  }
}
