import type { Metadata } from "next";
import { updateWorkspace } from "@/lib/workspace/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { getOrigin, publicUrl } from "@/lib/site";
import { CopyButton } from "../copy-button";
import { WorkspaceForm } from "../workspace-form";

export const metadata: Metadata = { title: "Settings — UseChangelog" };

export default async function SettingsPage() {
  const workspace = await requireWorkspace();
  const [origin, url] = await Promise.all([getOrigin(), publicUrl(workspace.slug)]);
  const snippet = `<script src="${origin}/widget.js" data-key="${workspace.widgetKey}" defer></script>`;

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
        <p className="mt-2 mb-4 text-sm text-graphite">
          Paste this once, before <code className="font-mono">&lt;/body&gt;</code>, on every page of your
          product. It shows a &ldquo;What&rsquo;s new&rdquo; button with your latest published posts. It keeps
          working if you change your URL.
        </p>
        <pre className="overflow-x-auto bg-wash px-3 py-2 font-mono text-sm">
          <code translate="no" className="select-all">{snippet}</code>
        </pre>
        <div className="mt-4">
          <CopyButton text={snippet} label="Copy snippet" />
        </div>
        <ul className="mt-6 flex flex-col gap-2 text-sm text-graphite">
          <li>
            <code className="font-mono text-ink">lang=&quot;es&quot;</code>: the widget&rsquo;s language for this
            page (en, es, pt, fr or de). Without it, the one chosen above.
          </li>
          <li>
            <code className="font-mono text-ink">data-trigger=&quot;#whats-new&quot;</code>: open it from your own
            element instead of the floating button.
          </li>
        </ul>
      </section>
    </div>
  );
}
