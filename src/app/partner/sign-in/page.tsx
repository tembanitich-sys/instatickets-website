import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { portal } from "@content/onboarding";
import { currentPartner } from "@/lib/partners/auth";
import { SignInForm } from "@/components/partners/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function PartnerSignInPage(props: PageProps<"/partner/sign-in">) {
  if (await currentPartner()) redirect("/partner");
  const expired = (await props.searchParams).expired === "1";
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">{portal.signIn.heading}</h1>
      {expired && (
        <p role="alert" className="mt-4 rounded-lg border border-red-dark bg-red-50 px-4 py-3 text-sm font-semibold text-red-dark">
          {portal.continue.invalid}
        </p>
      )}
      <p className="mt-3 leading-relaxed text-muted">{portal.signIn.intro}</p>
      <div className="mt-6">
        <SignInForm />
      </div>
      <p className="mt-8 border-t border-line pt-5 text-sm text-muted">
        {portal.signIn.notInvited}{" "}
        <Link href="/operators" className="font-semibold text-navy underline">
          {portal.signIn.interestLink}
        </Link>
        .
      </p>
    </div>
  );
}
