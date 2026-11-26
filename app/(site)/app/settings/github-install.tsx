import { createApiKey, revokeApiKey } from "@/lib/api/actions";
import { githubWorkflow, PR_TEMPLATE_SECTION } from "@/lib/api/github";
import { formatDay, toDay } from "@/lib/posts/form";
import { CopyButton } from "../copy-button";
import { ApiKeyPanel } from "./api-key-panel";

const code = "font-mono text-ink";
const day = (date: Date) => formatDay(toDay(date));

type Key = { prefix: string; createdAt: Date; lastUsedAt: Date | null } | null;

// Drafts from merged pull requests (#86): the project's API key, then the workflow and the
// pull request template section to copy.
export function GithubInstall({ origin, workspaceId, apiKey }: { origin: string; workspaceId: string; apiKey: Key }) {
  const workflow = githubWorkflow(origin);
  return (
    <>
      <p className="mt-2 text-sm text-graphite">
        When a pull request with a changelog title is merged, it shows up here as a draft. You review it and
        publish it; nothing is published on its own.
      </p>

      <h3 className="mt-6 text-sm font-medium">1. API key</h3>
      <ApiKeyPanel
        create={createApiKey.bind(null, workspaceId)}
        revoke={revokeApiKey.bind(null, workspaceId)}
        hasKey={Boolean(apiKey)}
      >
        {apiKey ? (
          <p className="text-sm">
            <code className={code} translate="no">
              {apiKey.prefix}…
            </code>
            <span className="text-graphite">
              {" "}
              created {day(apiKey.createdAt)}, {apiKey.lastUsedAt ? `last used ${day(apiKey.lastUsedAt)}` : "never used"}
            </span>
          </p>
        ) : (
          <p className="text-sm text-graphite">No API key yet.</p>
        )}
      </ApiKeyPanel>
      <p className="mt-2 text-sm text-graphite">
        Rotating or revoking stops the current key at once. Add the key to your repository as the{" "}
        <code className={code}>USECHANGELOG_API_KEY</code> secret (Settings → Secrets and variables → Actions).
      </p>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">2. Workflow</h3>
          <p className="text-sm text-graphite">
            Save it as <code className={code}>.github/workflows/usechangelog.yml</code> on your default branch.
          </p>
        </div>
        <CopyButton text={workflow} label="Copy" />
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-graphite">Show the workflow</summary>
        <pre className="mt-2 max-h-96 overflow-auto bg-wash px-3 py-2 font-mono text-xs">
          <code translate="no">{workflow}</code>
        </pre>
      </details>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">3. Pull request template</h3>
          <p className="text-sm text-graphite">
            Add it to <code className={code}>.github/pull_request_template.md</code>. Only this section is sent;
            pull requests with an empty title are skipped.
          </p>
        </div>
        <CopyButton text={PR_TEMPLATE_SECTION} label="Copy" />
      </div>
      <pre className="mt-2 overflow-x-auto bg-wash px-3 py-2 font-mono text-xs">
        <code translate="no">{PR_TEMPLATE_SECTION}</code>
      </pre>
    </>
  );
}
