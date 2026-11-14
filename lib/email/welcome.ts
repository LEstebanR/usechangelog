import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { getResend } from "./client";

// The same sender as the magic link; replies reach support through ImprovMX.
export const WELCOME_FROM = "UseChangelog <hello@usechangelog.com>";
export const WELCOME_REPLY_TO = "support@usechangelog.com";

export type WelcomeProject = { name: string; publicUrl: string; appUrl: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// The welcome email's copy (#76). English, plain text plus hand-written HTML. No prices:
// Pro's price comes from Polar.
export function welcomeEmail({ name, publicUrl, appUrl }: WelcomeProject) {
  const subject = "Welcome to UseChangelog";
  const text = [
    "Hi there,",
    "",
    `Thanks for trying UseChangelog. Your project ${name} is set up, and its public changelog lives at:`,
    publicUrl,
    "",
    `Write your first post here: ${appUrl}`,
    "",
    "To show your updates inside your own product, copy the widget snippet from Settings.",
    "",
    "Questions or feedback? Just reply to this email.",
    "",
    "— UseChangelog",
  ].join("\n");

  const project = escapeHtml(name);
  const link = (href: string, label = href) =>
    `<a href="${escapeHtml(href)}" style="color:#111827">${escapeHtml(label)}</a>`;
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111827">
    <p>Hi there,</p>
    <p>Thanks for trying UseChangelog. Your project <strong>${project}</strong> is set up, and its public changelog lives at ${link(publicUrl)}.</p>
    <p>${link(appUrl, "Write your first post")}.</p>
    <p>To show your updates inside your own product, copy the widget snippet from Settings.</p>
    <p>Questions or feedback? Just reply to this email.</p>
    <p>— UseChangelog</p>
  </body>
</html>`;

  return { subject, text, html };
}

// Sends the welcome email once per account (#76). The claim is atomic, so two parallel
// requests can't both send; a failed send releases it. Never throws: it runs in `after()`.
// The user's email never goes to the logs.
export async function sendWelcomeEmail(userId: string, to: string, project: WelcomeProject) {
  const resend = getResend();
  if (!resend) {
    console.info("[welcome] RESEND_API_KEY is not set; skipping the welcome email");
    return;
  }
  try {
    await claimAndSend(resend, userId, to, project);
  } catch (error) {
    // The database failed (the claim or the release): logged under the same prefix.
    console.error("[welcome] failed:", describe(error));
  }
}

async function claimAndSend(
  resend: NonNullable<ReturnType<typeof getResend>>,
  userId: string,
  to: string,
  project: WelcomeProject,
) {
  const db = getDb();
  const [claimed] = await db
    .update(accounts)
    .set({ welcomeEmailSentAt: new Date() })
    .where(and(eq(accounts.userId, userId), isNull(accounts.welcomeEmailSentAt)))
    .returning({ id: accounts.id });
  if (!claimed) return;

  // Resend returns its errors; a network failure throws. Either one releases the claim.
  // The idempotency key makes Resend drop a retry of an email it already accepted (24 h).
  const failure = await resend.emails
    .send(
      { from: WELCOME_FROM, to, replyTo: WELCOME_REPLY_TO, ...welcomeEmail(project) },
      { idempotencyKey: `welcome/${claimed.id}` },
    )
    .then(({ error }) => error, (error: unknown) => error);
  if (!failure) return;

  console.error(`[welcome] sending failed for account ${claimed.id}:`, describe(failure));
  await db.update(accounts).set({ welcomeEmailSentAt: null }).where(eq(accounts.id, claimed.id));
}

// Resend's error, with any email address in its message redacted (it may echo the recipient).
function describe(error: unknown) {
  const { name = "Error", message = String(error) } =
    error && typeof error === "object" ? (error as { name?: string; message?: string }) : {};
  return `${name}: ${message.replace(/\S+@\S+/g, "[email]")}`;
}
