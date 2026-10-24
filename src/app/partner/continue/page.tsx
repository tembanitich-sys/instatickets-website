import type { Metadata } from "next";
import { portal } from "@content/onboarding";
import { continueAction } from "../actions";

export const metadata: Metadata = { title: "Continue", referrer: "no-referrer" };

/**
 * The link in the email opens this page; the token is only used when the person presses
 * Continue. Email security scanners that open links therefore cannot use up the link.
 */
export default async function PartnerContinuePage(props: PageProps<"/partner/continue">) {
  const token = (await props.searchParams).token;
  const value = typeof token === "string" ? token.slice(0, 100) : "";
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">{portal.continue.heading}</h1>
      <p className="mt-3 leading-relaxed text-muted">{portal.continue.body}</p>
      <form action={continueAction} className="mt-6">
        <input type="hidden" name="token" value={value} />
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-red-dark sm:w-auto"
        >
          {portal.continue.button}
        </button>
      </form>
    </div>
  );
}
