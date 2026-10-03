import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace/server";
import { getOrigin } from "@/lib/site";

// Placeholder home. Posts (#6) come next.
export default async function AppPage() {
  const workspace = await requireWorkspace();
  const url = `${await getOrigin()}/${workspace.slug}`;

  return (
    <>
      <h1 className="font-display text-3xl font-medium tracking-tight">{workspace.name}</h1>
      <p className="mt-3 text-graphite">
        Your changelog will live at{" "}
        <a href={url} className="text-blue underline underline-offset-4">
          {url}
        </a>
        .
      </p>
      <Link href="/app/settings" className="mt-8 inline-block text-sm font-medium text-blue hover:underline">
        Workspace settings
      </Link>
    </>
  );
}
