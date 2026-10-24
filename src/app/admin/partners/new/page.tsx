import { AdminShell } from "@/components/admin/AdminShell";
import { CreatePartnerForm } from "@/components/admin/PartnerControls";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewPartnerPage() {
  await requireAdmin();
  return (
    <AdminShell active="partners" title="New partner">
      <div className="max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-muted">
          Create an approved partner from the contact you already have. Next you upload its contract documents, then send the
          invitation.
        </p>
        <CreatePartnerForm />
      </div>
    </AdminShell>
  );
}
