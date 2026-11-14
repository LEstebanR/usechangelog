"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violatedUniqueConstraint } from "@/db/errors";
import { newWidgetKey, workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { projectLimit } from "@/lib/billing/plans";
import { redirectWithNotice } from "@/lib/notice";
import {
  ensureAccount,
  listWorkspaces,
  lockProjects,
  openProject,
  PROJECT_COOKIE,
  projectCountSql,
  projectLimitSql,
  requireOwnWorkspace,
} from "./server";
import { parseForm, type WorkspaceFormState } from "./form";
import { SLUG_TAKEN } from "./slug";

// A taken slug becomes a field error; anything else is unexpected.
function slugTakenOrThrow(error: unknown, state: WorkspaceFormState): WorkspaceFormState {
  if (violatedUniqueConstraint(error) === "workspaces_slug_unique") {
    return { ...state, errors: { slug: SLUG_TAKEN } };
  }
  throw error;
}

// Onboarding and "New project" (#65). The plan's limit is checked here, not only in the UI:
// a Free account that already has its project goes to billing to move to Pro.
export async function createWorkspace(
  _prev: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const user = await requireUser();
  // Fast path for the UI; the insert below checks it again, under a lock.
  const projects = await listWorkspaces();
  if (projects.length >= projectLimit(projects[0] ?? { subscriptionStatus: "none" })) redirect("/app/billing");

  const state = parseForm(formData);
  if (state.errors) return state;

  const { name, slug, widgetLang } = state.values;
  const db = getDb();
  let id: string | undefined;
  try {
    // One transaction: the lock, then the insert only while the account is under its limit,
    // so two parallel requests can't both take the last slot.
    const [, inserted] = await db.batch([
      db.execute(lockProjects(user.id)),
      db.execute(sql`
        insert into ${workspaces} (owner_id, name, slug, widget_lang, widget_key)
        select ${user.id}::uuid, ${name}, ${slug}, ${widgetLang}::widget_lang, ${newWidgetKey()}
        where ${projectCountSql(user.id)} < ${projectLimitSql(user.id)}
        returning id`),
    ]);
    id = (inserted.rows[0] as { id: string } | undefined)?.id;
  } catch (error) {
    return slugTakenOrThrow(error, state);
  }
  if (!id) redirect("/app/billing");

  // Onboarding creates the account row; billing reads it later.
  await Promise.all([ensureAccount(user.id), openProject(id)]);
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
  const user = await requireUser();
  const db = getDb();
  // Under the same lock as creates: two tabs deleting the last two projects can't both succeed.
  const [, deleted] = await db.batch([
    db.execute(lockProjects(user.id)),
    db.execute(sql`
      delete from ${workspaces}
      where ${workspaces.id} = ${workspace.id} and ${projectCountSql(user.id)} > 1
      returning ${workspaces.id}`),
  ]);
  if (!deleted.rows.length) {
    return { error: "This is your only project. To remove it, delete your account." };
  }
  // The cookie may point to it; getCurrentWorkspace then falls back to the oldest.
  (await cookies()).delete(PROJECT_COOKIE);
  revalidatePath("/app", "layout");
  redirectWithNotice("projectDeleted");
}
