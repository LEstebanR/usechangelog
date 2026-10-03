import type { Metadata } from "next";
import { updateWorkspace } from "@/lib/workspace/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { getOrigin, publicUrl } from "@/lib/site";
import { WorkspaceForm } from "../workspace-form";
import { WidgetInstall } from "./widget-install";

export const metadata: Metadata = { title: "Settings — UseChangelog" };

export default async function SettingsPage() {
  const workspace = await requireWorkspace();
  const [origin, url] = await Promise.all([getOrigin(), publicUrl(workspace.slug)]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>

      <section className="border border-hairline bg-canvas p-8">
        <h2 className="font-display text-xl font-medium">Workspace</h2>
        <p className="mt-2 mb-6 text-sm text-graphite">
          Public page:{" "}
          <a href={url} className="text-blue underline underline-offset-4">
            {url}
          </a>
        </p>
        <WorkspaceForm
          action={updateWorkspace}
          initial={{ name: workspace.name, slug: workspace.slug, widgetLang: workspace.widgetLang }}
          showWidgetLang
          origin={origin}
          submitLabel="Save changes"
        />
      </section>

      <section className="border border-hairline bg-canvas p-8">
        <h2 className="font-display text-xl font-medium">Widget</h2>
        <WidgetInstall origin={origin} widgetKey={workspace.widgetKey} />
      </section>
    </div>
  );
}
