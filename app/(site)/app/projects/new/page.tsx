import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { projectLimit } from "@/lib/billing/plans";
import { getOrigin } from "@/lib/site";
import { createWorkspace } from "@/lib/workspace/actions";
import { listWorkspaces, requireWorkspace } from "@/lib/workspace/server";
import { WorkspaceForm } from "../../workspace-form";

export const metadata: Metadata = { title: "New project — UseChangelog" };

// A second (or third) project (#65), with the onboarding form. At the plan's limit, billing
// instead; createWorkspace checks the limit again.
export default async function NewProjectPage() {
  const [workspace, projects] = await Promise.all([requireWorkspace(), listWorkspaces()]);
  if (projects.length >= projectLimit(workspace)) redirect("/app/billing");

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3 text-sm text-graphite">
        <Link href="/app" className="hover:text-ink">← {workspace.name}</Link>
      </div>
      <div className="border border-hairline bg-canvas p-8">
        <h1 className="font-display text-2xl font-medium tracking-tight">New project</h1>
        <p className="mt-3 mb-8 text-graphite">
          Its own changelog page, widget and posts. Pick the name your users will see and its URL.
        </p>
        <WorkspaceForm
          action={createWorkspace}
          initial={{ name: "", slug: "", widgetLang: "en" }}
          origin={await getOrigin()}
          submitLabel="Create project"
        />
      </div>
    </div>
  );
}
