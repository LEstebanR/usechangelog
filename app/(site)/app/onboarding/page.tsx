import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { createWorkspace } from "@/lib/workspace/actions";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { getOrigin } from "@/lib/site";
import { WorkspaceForm } from "../workspace-form";

export const metadata: Metadata = { title: "Set up your project — UseChangelog" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getCurrentWorkspace()) redirect("/app");
  const origin = await getOrigin();
  // The welcome email (#76). A new account lands here right after signing up, by magic link
  // or Google: Neon Auth doesn't tell us about sign-ups. Once per account (the claim), after
  // the page is sent, so a failed send never blocks onboarding.
  after(() => sendWelcomeEmail(user.id, user.email, { appUrl: `${origin}/app` }));

  return (
    <div className="mx-auto max-w-lg border border-hairline bg-canvas p-8">
      <h1 className="font-display text-2xl font-medium tracking-tight">Set up your project</h1>
      <p className="mt-3 mb-8 text-graphite">
        Pick the name your users will see and the URL of your public changelog.
      </p>
      <WorkspaceForm
        action={createWorkspace}
        initial={{ name: "", slug: "", widgetLang: "en" }}
        origin={origin}
        submitLabel="Create project"
      />
    </div>
  );
}
