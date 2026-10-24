import { NextResponse } from "next/server";
import type { FileStore } from "./files";
import type { PartnerDocument } from "./service";

/** A download response that is never cached and always saves as a file. */
export async function fileResponse(files: FileStore, doc: PartnerDocument) {
  const file = await files.read(doc.pathname);
  if (!file) return new NextResponse("This file is no longer in storage.", { status: 404 });
  const name = doc.fileName.replace(/[^\w.-]+/g, "_");
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
