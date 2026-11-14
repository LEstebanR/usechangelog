"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violatedUniqueConstraint } from "@/db/errors";
import { workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { projectLimit } from "@/lib/billing/plans";
import { redirectWithNotice } from "@/lib/notice";
import { ensureAccount, listWorkspaces, PROJECT_COOKIE, requireOwnWorkspace } from "./server";
import { parseForm, type WorkspaceFormState } from "./form";
import { SLUG_TAKEN } from "./slug";

// A taken slug becomes a field error; anything else is unexpected.
function slugTakenOrThrow(error: unknown, state: WorkspaceFormState): WorkspaceFormState {
  if (violatedUniqueConstraint(error) === "workspaces_slug_unique") {
    return { ...state, errors: { slug: SLUG_TAKEN } };
  }
  throw error;
}

// Opens a project in /app: the cookie every /app page reads (#65). A year, like a preference.
async function openProject(id: string) {
  (await cookies()).set(PROJECT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

// Onboarding and "New project" (#65). The plan's limit is checked here, not only in the UI:
// a Free account that already has its project goes to billing to move to Pro.
export async function createWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  const [projects, account] = await Promise.all([listWorkspaces(), ensureAccount(user.id)]);
  if (projects.length >= projectLimit(account)) redirect("/app/billing");

  const state = parseForm(formData);
  if (state.errors) return state;

  let id: string;
  try {
    [{ id }] = await getDb()
      .insert(workspaces)
      .values({ ownerId: user.id, ...state.values })
      .returning({ id: workspaces.id });
  } catch (error) {
    return slugTakenOrThrow(error, state);
  }
  await openProject(id);
  // The /app layout shows the project picker and the nav.
  revalidatePath("/app", "layout");
  redirect("/app");
}

// The project picker (#65): only one of the user's own projects can be opened.
export async function switchWorkspace(formData: FormData) {
  const workspace = await requireOwnWorkspace(String(formData.get("id") ?? ""));
  await openProject(workspace.id);
  revalidatePath("/app", "layout");
  redirect("/app");
}

// Turns the widget on or off on the customer's site; their snippet stays in place.
// Bound to the project the page showed, never the cookie (another tab may have switched).
export async function setWidgetEnabled(id: string, formData: FormData) {
  const workspace = await requireOwnWorkspace(id);
  const enabled = formData.get("enabled") === "true";
  await getDb().update(workspaces).set({ widgetEnabled: enabled }).where(eq(workspaces.id, workspace.id));
  revalidatePath("/app", "layout");
}

export async function updateWorkspace(
  id: string,
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const workspace = await requireOwnWorkspace(id);
  const state = parseForm(formData);
  if (state.errors) return state;

  try {
    await getDb().update(workspaces).set(state.values).where(eq(workspaces.id, workspace.id));
  } catch (error) {
    return slugTakenOrThrow(error, state);
  }
  revalidatePath("/app", "layout");
  redirectWithNotice("settings");
}

export type DeleteWorkspaceState = { error?: string };

// Deletes a project and its posts (#65), confirmed with its slug, checked here too. Never the
// last one: that's deleting the account. The next oldest project may start publishing.
export async function deleteWorkspace(
  id: string,
  _prev: DeleteWorkspaceState,
  formData: FormData,
): Promise<DeleteWorkspaceState> {
  const workspace = await requireOwnWorkspace(id);
  if (String(formData.get("slug") ?? "").trim() !== workspace.slug) {
    return { error: "Type the project's slug exactly as it appears to confirm." };
  }
  if ((await listWorkspaces()).length <= 1) {
    return { error: "This is your only project. To remove it, delete your account." };
  }
  await getDb().delete(workspaces).where(eq(workspaces.id, workspace.id));
  // The cookie may point to it; getCurrentWorkspace then falls back to the oldest.
  (await cookies()).delete(PROJECT_COOKIE);
  revalidatePath("/app", "layout");
  redirectWithNotice("projectDeleted");
}
