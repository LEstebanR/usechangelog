import Link from "next/link";
import { PLANS, planOf, projectLimit } from "@/lib/billing/plans";
import { canPublish } from "@/lib/billing/status";
import { switchWorkspace } from "@/lib/workspace/actions";
import type { Workspace } from "@/lib/workspace/server";

// The project picker in /app's header (#65). No client code: a <details> menu whose items
// are server forms that set the project cookie. Marks the projects the plan doesn't publish.
// On Free at its limit, "New project" leads to billing instead of the form.
export function ProjectPicker({ projects, current }: { projects: Workspace[]; current: Workspace }) {
  const plan = planOf(current);
  const limit = projectLimit(current);
  const atLimit = projects.length >= limit;

  return (
    <details className="group relative">
      <summary className="flex max-w-48 cursor-pointer list-none items-center gap-2 border border-hairline bg-canvas px-3 py-2 text-sm font-medium hover:border-ink [&::-webkit-details-marker]:hidden">
        <span className="truncate">{current.name}</span>
        <span aria-hidden="true" className="text-graphite transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-64 border border-hairline bg-canvas shadow-lg sm:left-auto sm:right-0">
        <p className="border-b border-hairline px-4 py-2 text-xs uppercase tracking-wider text-graphite">
          Projects · {PLANS[plan].name} publishes {limit}
        </p>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <form action={switchWorkspace}>
                <input type="hidden" name="id" value={project.id} />
                <button
                  type="submit"
                  aria-current={project.id === current.id ? "true" : undefined}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-wash aria-[current=true]:font-medium"
                >
                  <span className="truncate">{project.name}</span>
                  {canPublish(project) ? (
                    <span className="shrink-0 text-xs text-green">Public</span>
                  ) : (
                    <span className="shrink-0 text-xs text-clay">Not public</span>
                  )}
                </button>
              </form>
            </li>
          ))}
        </ul>
        {atLimit && plan === "pro" ? (
          <p className="border-t border-hairline px-4 py-2.5 text-sm text-graphite">You&apos;re using all your projects.</p>
        ) : (
          <Link
            href={atLimit ? "/app/billing" : "/app/projects/new"}
            className="block border-t border-hairline px-4 py-2.5 text-sm text-blue hover:bg-wash"
          >
            {atLimit ? "More projects with Pro" : "+ New project"}
          </Link>
        )}
      </div>
    </details>
  );
}
