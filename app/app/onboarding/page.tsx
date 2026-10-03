import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createWorkspace } from "@/lib/workspace/actions";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { getOrigin } from "@/lib/site";
import { WorkspaceForm } from "../workspace-form";

export const metadata: Metadata = { title: "Set up your workspace — UseChangelog" };

export default async function OnboardingPage() {
  if (await getCurrentWorkspace()) redirect("/app");

  return (
    <div className="mx-auto max-w-lg border border-hairline bg-canvas p-8">
      <h1 className="font-display text-2xl font-medium tracking-tight">Set up your workspace</h1>
      <p className="mt-3 mb-8 text-graphite">
        Pick the name your users will see and the URL of your public changelog.
      </p>
      <WorkspaceForm
        action={createWorkspace}
        initial={{ name: "", slug: "" }}
        origin={await getOrigin()}
        submitLabel="Create workspace"
      />
    </div>
  );
}
