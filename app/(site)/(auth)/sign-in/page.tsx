import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { sendMagicLink, signInWithGoogle } from "@/lib/auth/actions";
import { getUser } from "@/lib/auth/server";
import { signInErrorMessage } from "@/lib/auth/sign-in-errors";
import { signInMetadata } from "../../metadata";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";

export const metadata: Metadata = signInMetadata;

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
    : { intro: "New or returning, continue with Google or get a sign-in link by email.", cta: "Send magic link" };

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

      <form action={signInWithGoogle} className="mt-6">
        <SubmitButton pendingLabel="Opening Google…" className={`w-full gap-3 ${secondaryButtonClass}`}>
          <GoogleLogo />
          Continue with Google
        </SubmitButton>
      </form>

      <div className="mt-6 flex items-center gap-3 text-xs text-graphite" aria-hidden="true">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form action={sendMagicLink} noValidate className="mt-4 flex flex-col gap-3">
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
          aria-invalid={error === "MISSING_EMAIL" || error === "INVALID_EMAIL"}
          className={inputClass}
        />
        <SubmitButton
          pendingLabel="Sending…"
          className={`mt-2 ${primaryButtonClass}`}
        >
          {copy.cta}
        </SubmitButton>
      </form>

      <p className="mt-6 text-xs text-graphite">
        By continuing, you agree to the{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
          Terms
        </Link>{" "}
        and the{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          Privacy policy
        </Link>
        .
      </p>
    </div>
  );
}

// Google's "G", in its own colors as Google's sign-in branding asks.
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
