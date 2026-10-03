import { cspDirectives, widgetSnippets } from "@/lib/widget/snippets";
import { CopyButton } from "../copy-button";

const code = "font-mono text-ink";

// How to add the widget, per stack, plus what usually stops it from showing.
export function WidgetInstall({ origin, widgetKey }: { origin: string; widgetKey: string }) {
  const csp = cspDirectives(origin);
  return (
    <>
      <p className="mt-2 text-sm text-graphite">
        Add it once and it shows a &ldquo;What&rsquo;s new&rdquo; button with your latest published posts. It
        keeps working if you change your URL.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {widgetSnippets(origin, widgetKey).map((snippet) => (
          <div key={snippet.id}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">{snippet.label}</h3>
                <p className="text-sm text-graphite">{snippet.where}</p>
              </div>
              <CopyButton text={snippet.code} label="Copy" />
            </div>
            <pre className="mt-2 overflow-x-auto bg-wash px-3 py-2 font-mono text-sm">
              <code translate="no">{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-sm font-medium">Options</h3>
      <ul className="mt-2 flex flex-col gap-2 text-sm text-graphite">
        <li>
          <code className={code}>lang=&quot;es&quot;</code>: the widget&rsquo;s language on that page (en, es, pt,
          fr or de). Without it, the one chosen above. A multilingual site can pass its current
          language, like <code className={code}>lang={"{locale}"}</code>.
        </li>
        <li>
          <code className={code}>data-trigger=&quot;#whats-new&quot;</code>: open it from your own element, like a
          link in your header, instead of the floating button.
        </li>
      </ul>

      <h3 className="mt-8 text-sm font-medium">Content Security Policy</h3>
      <p className="mt-2 text-sm text-graphite">
        If your site sets one, allow our origin in these two directives, or the browser blocks the widget:
      </p>
      <div className="mt-2 flex items-start gap-3">
        <pre className="min-w-0 flex-1 overflow-x-auto bg-wash px-3 py-2 font-mono text-sm">
          <code translate="no">{csp}</code>
        </pre>
        <CopyButton text={csp} label="Copy" />
      </div>

      <details className="mt-8 text-sm">
        <summary className="cursor-pointer font-medium">The button doesn&rsquo;t show?</summary>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-graphite">
          <li>Open your browser&rsquo;s console: every problem shows as a warning that starts with &ldquo;UseChangelog widget&rdquo;.</li>
          <li>Check the key: copy the snippet again from this page.</li>
          <li>Publish at least one post. Drafts never show.</li>
          <li>With a Content Security Policy, allow the two directives above.</li>
          <li>
            In the Network tab, <code className={code}>widget.js</code> should load. If it doesn&rsquo;t, the script tag
            isn&rsquo;t on the page.
          </li>
          <li>A click on your own trigger before the page finishes loading does nothing; click again.</li>
          <li>New posts can take up to a minute to appear.</li>
        </ul>
      </details>
    </>
  );
}
