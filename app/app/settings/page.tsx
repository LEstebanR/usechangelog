import type { Metadata } from "next";
import { setWidgetEnabled, updateWorkspace } from "@/lib/workspace/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { getOrigin, publicUrl } from "@/lib/site";
import { secondaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";
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
        <form
          action={setWidgetEnabled}
          className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-hairline bg-wash p-4"
        >
          <input type="hidden" name="enabled" value={String(!workspace.widgetEnabled)} />
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden="true" className={`size-2 ${workspace.widgetEnabled ? "bg-green" : "border border-graphite"}`} />
              Show the widget on your site: {workspace.widgetEnabled ? "On" : "Off"}
            </p>
            <p className="mt-1 text-sm text-graphite">
              {workspace.widgetEnabled
                ? "Turn it off to hide it without touching your code."
                : "Your snippet stays in place and shows nothing."}{" "}
              Changes take up to a minute to show.
            </p>
          </div>
          <SubmitButton pendingLabel="Saving…" className={`${secondaryButtonClass} py-2 text-sm`}>
            {workspace.widgetEnabled ? "Turn off" : "Turn on"}
          </SubmitButton>
        </form>
        <WidgetInstall origin={origin} widgetKey={workspace.widgetKey} />
      </section>
    </div>
  );
}
