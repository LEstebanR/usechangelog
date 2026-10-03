"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { requireWorkspace } from "@/lib/workspace/server";
import { dateFromDay, dayFromDate, parsePostForm, type PostFormState } from "./form";
import { requirePost, UUID } from "./server";

// The only place a post becomes public. #16 wraps this with the subscription check.
// Without a date it gets today, as a day (midnight UTC), like dates typed in the form.
function publish(publishedAt: Date | null) {
  return { status: "published" as const, publishedAt: publishedAt ?? dateFromDay(dayFromDate(new Date())) };
}

// Creates the post when `id` is null, updates it otherwise.
// The buttons send `intent`: save keeps the status, publish and unpublish change it.
export async function savePost(
  id: string | null,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const workspace = await requireWorkspace();
  const existing = id ? await requirePost(id) : null;
  const { intent, ...state } = parsePostForm(formData);
  if (state.errors) return state;

  const { publishedOn, ...fields } = state.values;
  // An edited date wins; otherwise keep the one from the first publish.
  const publishedAt = publishedOn ? dateFromDay(publishedOn) : (existing?.publishedAt ?? null);
  const next =
    intent === "publish"
      ? publish(publishedAt)
      : { status: intent === "unpublish" ? ("draft" as const) : (existing?.status ?? "draft"), publishedAt };

  const db = getDb();
  if (!existing) {
    const [created] = await db
      .insert(posts)
      .values({ workspaceId: workspace.id, ...fields, ...next })
      .returning({ id: posts.id });
    revalidatePath("/app");
    redirect(`/app/posts/${created.id}`);
  }

  await db
    .update(posts)
    .set({ ...fields, ...next })
    .where(and(eq(posts.id, existing.id), eq(posts.workspaceId, workspace.id)));
  revalidatePath("/app");
  return { values: { ...state.values, publishedOn: dayFromDate(next.publishedAt) }, saved: true };
}

// One query, scoped to the session's workspace: nothing deleted means not yours, so 404.
export async function deletePost(id: string) {
  const workspace = await requireWorkspace();
  if (!UUID.test(id)) notFound();
  const deleted = await getDb()
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.workspaceId, workspace.id)))
    .returning({ id: posts.id });
  if (!deleted.length) notFound();
  revalidatePath("/app");
  redirect("/app");
}
