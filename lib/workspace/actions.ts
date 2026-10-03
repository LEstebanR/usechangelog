"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { SLUG_TAKEN, slugify, validateSlug } from "./slug";
import { violatedUniqueConstraint } from "./server";

export type WorkspaceFormState = {
  values: { name: string; slug: string };
  errors?: { name?: string; slug?: string; form?: string };
  saved?: boolean;
};

const NAME_MAX = 60;

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "");
  return { name, rawSlug: rawSlug.trim() || slugify(name) };
}

function validate(name: string, rawSlug: string): WorkspaceFormState {
  const values = { name, slug: rawSlug };
  const errors: WorkspaceFormState["errors"] = {};
  if (name.length < 1 || name.length > NAME_MAX) errors.name = `Use 1–${NAME_MAX} characters.`;
  const slug = validateSlug(rawSlug);
  if (slug.ok) values.slug = slug.slug;
  else errors.slug = slug.error;
  return Object.keys(errors).length ? { values, errors } : { values };
}

export async function createWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const { name, rawSlug } = readForm(formData);
  const state = validate(name, rawSlug);
  if (state.errors) return state;

  try {
    await getDb().insert(workspaces).values({ ownerId: user.id, ...state.values });
  } catch (error) {
    const constraint = violatedUniqueConstraint(error);
    if (constraint === "workspaces_slug_unique") return { ...state, errors: { slug: SLUG_TAKEN } };
    // One workspace per user: the database refuses a second one.
    if (constraint !== "workspaces_owner_id_unique") throw error;
  }
  redirect("/app");
}

export async function updateWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const { name, rawSlug } = readForm(formData);
  const state = validate(name, rawSlug);
  if (state.errors) return state;

  try {
    await getDb()
      .update(workspaces)
      .set(state.values)
      .where(eq(workspaces.ownerId, user.id));
  } catch (error) {
    if (violatedUniqueConstraint(error) === "workspaces_slug_unique") {
      return { ...state, errors: { slug: SLUG_TAKEN } };
    }
    throw error;
  }
  revalidatePath("/app", "layout");
  return { ...state, saved: true };
}
