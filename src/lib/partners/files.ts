import { del, get, head } from "@vercel/blob";

/**
 * Private file storage for partner documents. Files are never public: they are read on the
 * server and streamed only to a signed-in partner who owns them or to a signed-in admin.
 * Uploads go straight from the browser to storage (src/app/partner/api/upload), so scanned
 * documents are not limited by the 4.5 MB request size of a server function.
 */
export type StoredFile = { size: number; contentType: string };

export interface FileStore {
  head(pathname: string): Promise<StoredFile | null>;
  read(pathname: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string; size: number } | null>;
  remove(pathname: string): Promise<void>;
}

export const blobFileStore: FileStore = {
  async head(pathname) {
    try {
      const h = await head(pathname);
      return { size: h.size, contentType: h.contentType };
    } catch {
      return null;
    }
  },
  async read(pathname) {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return { stream: result.stream, contentType: result.blob.contentType, size: result.blob.size };
  },
  async remove(pathname) {
    await del(pathname);
  },
};

/** Reads a whole file into memory (for email attachments, which are small). */
export async function readAll(store: FileStore, pathname: string): Promise<Buffer | null> {
  const file = await store.read(pathname);
  if (!file) return null;
  return Buffer.from(await new Response(file.stream).arrayBuffer());
}

/** Storage path for a partner's file; the server checks every upload starts with this. */
export const partnerPrefix = (partnerId: string) => `partners/${partnerId}/`;
export const libraryPrefix = "library/";

/** Letters, digits, dot, dash and underscore only, so a file name cannot change the path. */
export function safeFileName(name: string): string {
  const cleaned = name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").replace(/^[._]+/, "");
  return (cleaned || "file").slice(-120);
}

/** In-memory store for tests. */
export function createMemoryFileStore(): FileStore & { files: Map<string, { data: Buffer; contentType: string }> } {
  const files = new Map<string, { data: Buffer; contentType: string }>();
  return {
    files,
    async head(pathname) {
      const f = files.get(pathname);
      return f ? { size: f.data.length, contentType: f.contentType } : null;
    },
    async read(pathname) {
      const f = files.get(pathname);
      if (!f) return null;
      return { stream: new Response(new Uint8Array(f.data)).body!, contentType: f.contentType, size: f.data.length };
    },
    async remove(pathname) {
      files.delete(pathname);
    },
  };
}
