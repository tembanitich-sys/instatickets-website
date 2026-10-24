import { AdminShell, ExportLink, NoDatabase } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { GetStartedForm } from "@/components/admin/GetStartedForm";
import { DisableTwoStep, EnableTwoStep } from "@/components/admin/TwoStepForms";
import { newTotpSecret, otpauthUri } from "@/lib/admin/totp";
import { activeTotpSecret } from "@/lib/admin/totp-store";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/admin/auth";
import { TABLES, listRows } from "@/lib/admin/tables";
import { getDb } from "@/lib/db/client";
import { DEFAULT_GET_STARTED_URL, GET_STARTED_KEY, readGetStartedUrl } from "@/lib/settings";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const db = getDb();

  return (
    <AdminShell active="settings" title="Settings">
      {!db ? (
        <NoDatabase />
      ) : (
        <SettingsBody db={db} />
      )}
    </AdminShell>
  );
}

async function SettingsBody({ db }: { db: NonNullable<ReturnType<typeof getDb>> }) {
  const [stored, { rows }] = await Promise.all([readGetStartedUrl(db), listRows(db, TABLES.settings, {})]);
  const isCustom = rows.some((r) => r.key === GET_STARTED_KEY);

  const fromEnv = !!process.env.ADMIN_TOTP_SECRET;
  const twoStepOn = !!(await activeTotpSecret(db));
  const newSecret = twoStepOn ? "" : newTotpSecret();
  const qrSvg = twoStepOn ? "" : await QRCode.toString(otpauthUri(newSecret), { type: "svg", margin: 1, width: 200 });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-1 text-lg font-extrabold text-navy">Two-step sign-in</h2>
        <p className="mb-5 text-sm text-muted">
          {twoStepOn
            ? "On. Signing in to the admin area needs the password and a code from the authenticator app."
            : "Off. Turn this on before partners submit: the admin area shows bank details and identity documents."}
        </p>
        {twoStepOn ? (
          fromEnv ? (
            <p className="text-sm text-muted">Managed by the ADMIN_TOTP_SECRET setting in Vercel.</p>
          ) : (
            <DisableTwoStep />
          )
        ) : (
          <EnableTwoStep secret={newSecret} qrSvg={qrSvg} />
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-md">
        <GetStartedForm current={isCustom ? stored : null} defaultUrl={DEFAULT_GET_STARTED_URL} />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">All stored settings</h2>
          <ExportLink slug="settings">Export as CSV</ExportLink>
        </div>
        <DataTable columns={TABLES.settings.columns} rows={rows} />
      </section>
    </div>
  );
}
