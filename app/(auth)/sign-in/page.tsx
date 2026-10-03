import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sendMagicLink } from "@/lib/auth/actions";
import { getUser } from "@/lib/auth/server";
import { SubmitButton } from "../../submit-button";

export const metadata: Metadata = { title: "Sign in — UseChangelog" };

const errors: Record<string, string> = {
  EXPIRED_TOKEN: "That sign-in link has expired. Enter your email to get a new one.",
  INVALID_TOKEN: "That sign-in link was already used or isn't valid. Enter your email to get a new one.",
  MISSING_EMAIL: "Enter your email address.",
  SEND_FAILED: "We couldn't send the link. Check the address and try again.",
};
const fallbackError = "Something went wrong with that link. Enter your email to get a new one.";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  if (await getUser()) redirect("/app");

  const { error, sent } = await searchParams;
  const errorMessage = typeof error === "string" ? (errors[error] ?? fallbackError) : undefined;
  const copy = sent
    ? { intro: "Check your email. We sent you a sign-in link that works for 15 minutes.", cta: "Send another link" }
    : { intro: "New or returning, enter your email and we\u2019ll send you a sign-in link.", cta: "Send magic link" };

  return (
    <div className="w-full max-w-sm border border-hairline bg-canvas p-8">
      <h1 className="font-display text-2xl font-medium tracking-tight">Sign in</h1>

      <p role={sent ? "status" : undefined} className="mt-3 text-graphite">
        {copy.intro}
      </p>

      {errorMessage && (
        <p role="alert" className="mt-4 border border-clay/30 bg-clay-wash px-4 py-3 text-sm text-clay">
          {errorMessage}
        </p>
      )}

      <form action={sendMagicLink} className="mt-6 flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="you@company.com"
          className="border border-hairline bg-canvas px-3 py-2 placeholder:text-graphite/70 focus:border-blue"
        />
        <SubmitButton
          pendingLabel="Sending…"
          className="motion-press mt-2 bg-blue px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {copy.cta}
        </SubmitButton>
      </form>
    </div>
  );
}
