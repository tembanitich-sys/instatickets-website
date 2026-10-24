import { redirect } from "next/navigation";
import { adminConfigProblem } from "@/lib/admin/config";
import { activeTotpSecret } from "@/lib/admin/totp-store";
import { getDb } from "@/lib/db/client";
import { isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const unavailable = adminConfigProblem() !== null;
  const needsCode = !!(await activeTotpSecret(getDb()).catch(() => null));

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Admin sign in</h1>
        <div className="mt-6">
          {unavailable ? (
            <p role="alert" className="rounded-lg border border-red-dark bg-red-50 px-4 py-3 text-sm font-semibold text-red-dark">
              Admin sign-in is not available. Check the server configuration.
            </p>
          ) : (
            <LoginForm needsCode={needsCode} />
          )}
        </div>
      </div>
    </div>
  );
}
