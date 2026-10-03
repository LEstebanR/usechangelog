"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violatedUniqueConstraint } from "@/db/errors";
import { workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { NAME_MAX, SLUG_TAKEN, slugify, validateSlug } from "./slug";

export type WorkspaceFormState = {
  values: { name: string; slug: string };
  errors?: { name?: string; slug?: string };
  saved?: boolean;
};

// Reads and validates the form. An empty slug falls back to one built from the name.
function parseForm(formData: FormData): WorkspaceFormState {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim() || slugify(name);
  const slug = validateSlug(slugInput);
  const values = { name, slug: slug.ok ? slug.slug : slugInput };
  const errors = {
    ...(name.length < 1 || name.length > NAME_MAX ? { name: `Use 1–${NAME_MAX} characters.` } : {}),
    ...(slug.ok ? {} : { slug: slug.error }),
  };
  return Object.keys(errors).length ? { values, errors } : { values };
}

// A taken slug becomes a field error; anything else is unexpected.
function slugTakenOrThrow(error: unknown, state: WorkspaceFormState): WorkspaceFormState {
  if (violatedUniqueConstraint(error) === "workspaces_slug_unique") {
    return { ...state, errors: { slug: SLUG_TAKEN } };
  }
  throw error;
}

export async function createWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const state = parseForm(formData);
  if (state.errors) return state;

  try {
    await getDb().insert(workspaces).values({ ownerId: user.id, ...state.values });
  } catch (error) {
    // One workspace per user: the database refuses a second one, so just go to /app.
    if (violatedUniqueConstraint(error) !== "workspaces_owner_id_unique") {
      return slugTakenOrThrow(error, state);
    }
  }
  redirect("/app");
}

export async function updateWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const state = parseForm(formData);
  if (state.errors) return state;

  try {
    await getDb().update(workspaces).set(state.values).where(eq(workspaces.ownerId, user.id));
  } catch (error) {
    return slugTakenOrThrow(error, state);
  }
  revalidatePath("/app", "layout");
  return { ...state, saved: true };
}
