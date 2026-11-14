import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { getResend } from "./client";

// The same sender as the magic link; replies reach support through ImprovMX.
export const WELCOME_FROM = "UseChangelog <hello@usechangelog.com>";
export const WELCOME_REPLY_TO = "support@usechangelog.com";

// Where the email's button goes: /app, which opens onboarding until there is a project.
export type WelcomeLinks = { appUrl: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

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

// The app's palette (app/globals.css) and fonts, inlined: email clients drop <style> and
// CSS variables. Tables for layout, square corners and the 2×2 mark, like the app.
const C = {
  canvas: "#ffffff",
  wash: "#f6f7f9",
  ink: "#0e1116",
  graphite: "#5a6170",
  hairline: "#e4e7ec",
  blue: "#1d3a8f",
  blueSoft: "#a5b0d2",
};
const DISPLAY = "'Funnel Display',system-ui,-apple-system,'Segoe UI',sans-serif";
const SANS = "'Instrument Sans',system-ui,-apple-system,'Segoe UI',sans-serif";

function welcomeHtml(appUrl: string) {
  const cell = (color: string) => `<td width="7" height="7" style="width:7px;height:7px;background:${color};font-size:0;line-height:0">&nbsp;</td>`;
  const mark = `<table role="presentation" cellpadding="0" cellspacing="1" style="border-collapse:separate"><tr>${cell(C.blue)}${cell(C.blueSoft)}</tr><tr>${cell(C.blueSoft)}${cell(C.blueSoft)}</tr></table>`;
  const p = `margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Welcome to UseChangelog</title>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@500&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.wash}">
<div style="display:none;max-height:0;overflow:hidden">Create your first project and publish your first update.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.wash}">
<tr><td align="center" style="padding:40px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 0 20px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:10px;vertical-align:middle">${mark}</td>
        <td style="vertical-align:middle;font-family:${DISPLAY};font-size:17px;font-weight:500;letter-spacing:-0.01em;color:${C.ink}">UseChangelog</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:${C.canvas};border:1px solid ${C.hairline};padding:36px 32px">
      <h1 style="margin:0 0 16px;font-family:${DISPLAY};font-size:28px;line-height:1.2;font-weight:500;letter-spacing:-0.02em;color:${C.ink}">Welcome to UseChangelog</h1>
      <p style="${p}">Thanks for signing up. Start by creating your first project: pick a name and a URL, and you get a public changelog your users can read.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr>
        <td style="background:${C.ink}"><a href="${appUrl}" style="display:inline-block;padding:11px 18px;font-family:${SANS};font-size:15px;font-weight:500;color:${C.canvas};text-decoration:none">Create your first project</a></td>
      </tr></table>
      <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${C.graphite}">Then</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.hairline};padding-top:12px;width:100%">
        <tr><td width="28" style="padding:0 0 10px;vertical-align:top;font-family:${SANS};font-size:13px;font-weight:500;color:${C.blue}">01</td><td style="padding:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">Write your first post: what shipped, what improved, what&#39;s coming.</td></tr>
        <tr><td width="28" style="padding:0 0 10px;vertical-align:top;font-family:${SANS};font-size:13px;font-weight:500;color:${C.blue}">02</td><td style="padding:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">Copy the widget snippet from Settings to show your updates inside your own product.</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.graphite}">
      Questions or feedback? Just reply to this email.<br>— UseChangelog
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
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
    console.error("[welcome] failed:", describe(error));
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

  console.error(`[welcome] sending failed for account ${claimed.id}:`, describe(failure));
  await getDb().update(accounts).set({ welcomeEmailSentAt: null }).where(eq(accounts.id, claimed.id));
}

// Resend's error, with any email address in its message redacted (it may echo the recipient).
function describe(error: unknown) {
  const { name = "Error", message = String(error) } =
    error && typeof error === "object" ? (error as { name?: string; message?: string }) : {};
  return `${name}: ${message.replace(/\S+@\S+/g, "[email]")}`;
}
