"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { requireWorkspace } from "@/lib/workspace/server";
import { parsePostForm, type PostFormState } from "./form";
import { requirePost, UUID } from "./server";

// The only place a post becomes public. #16 wraps this with the subscription check.
// A published post always has a date: the one given, or today.
function publish(publishedOn: string | null, today: string) {
  return { status: "published" as const, publishedOn: publishedOn ?? today };
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
  const { intent, today, ...state } = parsePostForm(formData);
  if (state.errors) return state;

  const { publishedOn: dateField, ...fields } = state.values;
  // The date field is the source of truth: emptying it clears a draft's date.
  const publishedOn = dateField || null;
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (existing?.status ?? "draft");
  const next =
    status === "published"
      ? publish(publishedOn ?? existing?.publishedOn ?? null, today)
      : { status, publishedOn };

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
  return { values: { ...state.values, publishedOn: next.publishedOn ?? "" }, saved: true };
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
