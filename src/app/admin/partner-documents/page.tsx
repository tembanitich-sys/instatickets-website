import { AdminShell, NoDatabase } from "@/components/admin/AdminShell";
import { DocumentSlots } from "@/components/partners/DocumentSlots";
import { librarySlots } from "@content/onboarding";
import { adminDeleteDocumentAction, adminRecordUploadAction } from "@/app/admin/partners/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { libraryPrefix } from "@/lib/partners/files";
import { libraryDocument } from "@/lib/partners/service";

export default async function PartnerDocumentsPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <AdminShell active="partner-documents" title="Partner documents">
        <NoDatabase />
      </AdminShell>
    );
  }
  const current = (await Promise.all(librarySlots.map((s) => libraryDocument(db, s.slot)))).filter((d) => d !== null);
  return (
    <AdminShell active="partner-documents" title="Partner documents">
      <div className="max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Documents shared by every partner of a type. Uploading a new version replaces the old one for everyone who downloads it
          from now on. The Integration Standard is attached to the email sent to each bus operator&apos;s technical contact.
        </p>
        <DocumentSlots
          slots={librarySlots.map((s) => ({ slot: s.slot, label: s.label, multiple: false }))}
          docs={current.map(({ id, slot, fileName, size }) => ({ id, slot, fileName, size }))}
          editable
          prefix={libraryPrefix}
          uploadUrl="/admin/api/upload"
          downloadBase="/admin/files"
          record={adminRecordUploadAction.bind(null, null)}
          remove={adminDeleteDocumentAction}
        />
      </div>
    </AdminShell>
  );
}
