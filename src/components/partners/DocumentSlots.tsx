"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UPLOAD_MAX_BYTES, UPLOAD_TYPES, portal } from "@content/onboarding";

export type SlotView = { slot: string; label: string; multiple: boolean; optional?: boolean; hint?: string };
export type DocView = { id: string; slot: string; fileName: string; size: number };
type Result = { ok: true } | { ok: false; message: string };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const safeName = (name: string) => name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/^[._]+/, "").slice(-120) || "file";

/**
 * A checklist of document slots. Each upload goes straight from the browser to private
 * storage (with a token from `uploadUrl`), then `record` saves it against the slot.
 */
export function DocumentSlots({
  slots,
  docs,
  editable,
  prefix,
  uploadUrl,
  downloadBase,
  eventId = null,
  missing = [],
  record,
  remove,
}: {
  slots: SlotView[];
  docs: DocView[];
  editable: boolean | ((slot: string) => boolean);
  /** Storage folder, e.g. partners/<id>/ */
  prefix: string;
  uploadUrl: string;
  downloadBase: string;
  eventId?: string | null;
  /** Slots flagged as missing by the last submit attempt. */
  missing?: string[];
  record: (input: { slot: string; eventId: string | null; pathname: string; fileName: string }) => Promise<Result>;
  remove?: (documentId: string) => Promise<Result>;
}) {
  return (
    <ul className="divide-y divide-line">
      {slots.map((s) => (
        <Slot
          key={s.slot}
          def={s}
          files={docs.filter((d) => d.slot === s.slot)}
          editable={typeof editable === "function" ? editable(s.slot) : editable}
          prefix={prefix}
          uploadUrl={uploadUrl}
          downloadBase={downloadBase}
          eventId={eventId}
          missing={missing.includes(s.slot)}
          record={record}
          remove={remove}
        />
      ))}
    </ul>
  );
}

function Slot({
  def,
  files,
  editable,
  prefix,
  uploadUrl,
  downloadBase,
  eventId,
  missing,
  record,
  remove,
}: {
  def: SlotView;
  files: DocView[];
  editable: boolean;
  prefix: string;
  uploadUrl: string;
  downloadBase: string;
  eventId: string | null;
  missing: boolean;
  record: (input: { slot: string; eventId: string | null; pathname: string; fileName: string }) => Promise<Result>;
  remove?: (documentId: string) => Promise<Result>;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    const chosen = def.multiple ? [...list] : [list[0]];
    for (const f of chosen) {
      if (!UPLOAD_TYPES.includes(f.type) || f.size > UPLOAD_MAX_BYTES) {
        setError(`${f.name}: upload a PDF, JPG or PNG file of up to 20 MB.`);
        return;
      }
    }
    setBusy(true);
    try {
      for (const f of chosen) {
        const pathname = `${prefix}${eventId ? `events/${eventId}/` : ""}${def.slot.replace(/:/g, "-")}/${safeName(f.name)}`;
        const blob = await upload(pathname, f, {
          access: "private",
          handleUploadUrl: uploadUrl,
          clientPayload: JSON.stringify({ slot: def.slot, eventId }),
          contentType: f.type,
        });
        const result = await record({ slot: def.slot, eventId, pathname: blob.pathname, fileName: f.name });
        if (!result.ok) {
          setError(result.message);
          break;
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message ? `Upload failed: ${e.message}` : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function onRemove(id: string) {
    if (!remove) return;
    setBusy(true);
    const result = await remove(id);
    setBusy(false);
    if (!result.ok) setError(result.message);
    router.refresh();
  }

  const done = files.length > 0;
  return (
    <li className={`py-4 ${missing && !done ? "rounded-lg bg-red-50 px-3" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            <span aria-hidden className={done ? "text-green-700" : "text-muted"}>
              {done ? "✓ " : "○ "}
            </span>
            {def.label}
            {def.optional && <span className="ml-1 text-sm font-medium text-muted">(optional)</span>}
          </p>
          {def.hint && <p className="mt-0.5 text-sm text-muted">{def.hint}</p>}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {files.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center gap-x-3">
                  <a href={`${downloadBase}/${f.id}`} className="font-semibold text-navy underline">
                    {f.fileName}
                  </a>
                  <span className="text-muted">{kb(f.size)}</span>
                  {editable && remove && (
                    <button type="button" onClick={() => onRemove(f.id)} disabled={busy} className="min-h-11 text-red-dark underline">
                      {portal.remove}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-dark">
              {error}
            </p>
          )}
        </div>
        {editable && (
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy px-4 text-sm font-bold text-navy hover:bg-mist">
            {busy ? portal.uploading : done && !def.multiple ? "Replace" : portal.upload}
            <input
              ref={input}
              type="file"
              className="sr-only"
              accept={UPLOAD_TYPES.join(",")}
              multiple={def.multiple}
              disabled={busy}
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </li>
  );
}
