import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { sendMagicLink } from "@/lib/auth/actions";
import { getUser } from "@/lib/auth/server";
import { signInErrorMessage } from "@/lib/auth/sign-in-errors";
import { inputClass, primaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";

export const metadata: Metadata = { title: "Sign in — UseChangelog" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  // The proxy doesn't refresh the session on the login URL, and the SDK can
  // try to set a cookie mid-render, which throws. Show the form then.
  const user = await getUser().catch((error: unknown) => {
    unstable_rethrow(error);
    return null;
  });
  if (user) redirect("/app");

  const { error, sent } = await searchParams;
  const errorMessage = signInErrorMessage(error);
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
          className={inputClass}
        />
        <SubmitButton
          pendingLabel="Sending…"
          className={`mt-2 ${primaryButtonClass}`}
        >
          {copy.cta}
        </SubmitButton>
      </form>
    </div>
  );
}
