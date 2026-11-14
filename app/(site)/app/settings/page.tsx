import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/server";
import { deleteAccount } from "@/lib/account/actions";
import { deleteWorkspace, setWidgetEnabled, updateWorkspace } from "@/lib/workspace/actions";
import { listWorkspaces, requireWorkspace } from "@/lib/workspace/server";
import { getOrigin, publicUrl } from "@/lib/site";
import { secondaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";
import { WorkspaceForm } from "../workspace-form";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import { WidgetInstall } from "./widget-install";

export const metadata: Metadata = { title: "Settings — UseChangelog" };

export default async function SettingsPage() {
  // The open project's settings. Its actions are bound to its id, not the cookie (#65).
  const [user, workspace, projects] = await Promise.all([requireUser(), requireWorkspace(), listWorkspaces()]);
  const [origin, url] = await Promise.all([getOrigin(), publicUrl(workspace.slug)]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>

      <section className="border border-hairline bg-canvas p-8">
        <h2 className="font-display text-xl font-medium">Project</h2>
        <p className="mt-2 mb-6 text-sm text-graphite">
          Public page:{" "}
          <a href={url} className="text-blue underline underline-offset-4">
            {url}
          </a>
        </p>
        <WorkspaceForm
          action={updateWorkspace.bind(null, workspace.id)}
          initial={{ name: workspace.name, slug: workspace.slug, widgetLang: workspace.widgetLang }}
          showWidgetLang
          origin={origin}
          submitLabel="Save changes"
        />
      </section>

      <section className="border border-hairline bg-canvas p-8">
        <h2 className="font-display text-xl font-medium">Widget</h2>
        <form
          action={setWidgetEnabled.bind(null, workspace.id)}
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

      {projects.length > 1 && (
        <section aria-labelledby="delete-project" className="mt-8 border border-clay/40 bg-canvas p-8">
          <h2 id="delete-project" className="font-display text-xl font-medium text-clay">
            Delete project
          </h2>
          <p className="mt-2 text-sm text-graphite">
            This deletes {workspace.name} and all its posts. Its public page{" "}
            <span className="font-mono break-all">{url}</span> and its widget stop working. Your other projects and your
            subscription stay as they are. This can&apos;t be undone.
          </p>
          <ConfirmDeleteForm
            action={deleteWorkspace.bind(null, workspace.id)}
            confirm={workspace.slug}
            name="slug"
            label="Delete project"
          />
        </section>
      )}

      <section aria-labelledby="delete-account" className="mt-8 border border-clay/40 bg-canvas p-8">
        <h2 id="delete-account" className="font-display text-xl font-medium text-clay">
          Delete account
        </h2>
        <p className="mt-2 text-sm text-graphite">
          This deletes your account and all your projects and posts: their public pages and widgets stop working. If
          you have a subscription, it&apos;s cancelled right away, without a refund. This can&apos;t be undone.
        </p>
        <ConfirmDeleteForm action={deleteAccount} confirm={user.email} name="email" label="Delete account" />
      </section>
    </div>
  );
}
