import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { getResend } from "./client";
import { button, C, EMAIL_FROM, EMAIL_REPLY_TO, emailLayout, describeError, escapeHtml, heading, P, SANS } from "./layout";

// The same sender as the magic link (#83).
export const WELCOME_FROM = EMAIL_FROM;
export const WELCOME_REPLY_TO = EMAIL_REPLY_TO;

// Where the email's button goes: /app, which opens onboarding until there is a project.
export type WelcomeLinks = { appUrl: string };

// The welcome email's copy (#76), sent when a new account reaches onboarding, before it has
// a project. English, plain text plus hand-written HTML. No prices: Pro's price comes from Polar.
export function welcomeEmail({ appUrl }: WelcomeLinks) {
  const subject = "Welcome to UseChangelog";
  const text = [
    "Hi there,",
    "",
    "Thanks for signing up for UseChangelog.",
    "",
    "Start by creating your first project: pick a name and a URL, and you get a public changelog your users can read.",
    appUrl,
    "",
    "Then write your first post, and copy the widget snippet from Settings to show your updates inside your own product.",
    "",
    "Questions or feedback? Just reply to this email.",
    "",
    "— UseChangelog",
  ].join("\n");

  return { subject, text, html: welcomeHtml(escapeHtml(appUrl)) };
}

function welcomeHtml(appUrl: string) {
  const step = (n: string, text: string) =>
    `<tr><td width="28" style="padding:0 0 10px;vertical-align:top;font-family:${SANS};font-size:13px;font-weight:500;color:${C.blue}">${n}</td><td style="padding:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">${text}</td></tr>`;
  const content = [
    `      ${heading("Welcome to UseChangelog")}`,
    `      <p style="${P}">Thanks for signing up. Start by creating your first project: pick a name and a URL, and you get a public changelog your users can read.</p>`,
    `      ${button(appUrl, "Create your first project")}`,
    `      <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${C.graphite}">Then</p>`,
    `      <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.hairline};padding-top:12px;width:100%">`,
    `        ${step("01", "Write your first post: what shipped, what improved, what&#39;s coming.")}`,
    `        ${step("02", "Copy the widget snippet from Settings to show your updates inside your own product.")}`,
    `      </table>`,
  ].join("\n");

  return emailLayout({
    title: "Welcome to UseChangelog",
    preheader: "Create your first project and publish your first update.",
    content,
    footer: "Questions or feedback? Just reply to this email.<br>— UseChangelog",
  });
}

// Sends the welcome email once per account (#76). The claim is one statement that also creates
// the account row, so two parallel requests can't both send; a failed send releases it.
// Never throws: it runs in `after()`. The user's email never goes to the logs.
export async function sendWelcomeEmail(userId: string, to: string, links: WelcomeLinks) {
  const resend = getResend();
  if (!resend) {
    console.info("[welcome] RESEND_API_KEY is not set; skipping the welcome email");
    return;
  }
  try {
    await claimAndSend(resend, userId, to, links);
  } catch (error) {
    // The database failed (the claim or the release): logged under the same prefix.
    console.error("[welcome] failed:", describeError(error));
  }
}

// Inserts the account with the mark set, or sets it on an existing account only while it's
// still null. A row comes back only when this call won the claim.
export function claimWelcome(userId: string) {
  return getDb()
    .insert(accounts)
    .values({ userId, welcomeEmailSentAt: sql`now()` })
    .onConflictDoUpdate({
      target: accounts.userId,
      set: { welcomeEmailSentAt: sql`now()` },
      setWhere: sql`${accounts.welcomeEmailSentAt} is null`,
    })
    .returning({ id: accounts.id });
}

async function claimAndSend(
  resend: NonNullable<ReturnType<typeof getResend>>,
  userId: string,
  to: string,
  links: WelcomeLinks,
) {
  const [claimed] = await claimWelcome(userId);
  if (!claimed) return;

  // Resend returns its errors; a network failure throws. Either one releases the claim.
  // The idempotency key makes Resend drop a retry of an email it already accepted (24 h).
  const failure = await resend.emails
    .send(
      { from: WELCOME_FROM, to, replyTo: WELCOME_REPLY_TO, ...welcomeEmail(links) },
      { idempotencyKey: `welcome/${claimed.id}` },
    )
    .then(({ error }) => error, (error: unknown) => error);
  if (!failure) return;

  console.error(`[welcome] sending failed for account ${claimed.id}:`, describeError(failure));
  await getDb().update(accounts).set({ welcomeEmailSentAt: null }).where(eq(accounts.id, claimed.id));
}
