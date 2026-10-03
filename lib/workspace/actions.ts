"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violatedUniqueConstraint } from "@/db/errors";
import { workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { parseForm, type WorkspaceFormState } from "./form";
import { SLUG_TAKEN } from "./slug";

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
