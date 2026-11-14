import { getResend } from "./client";
import { button, C, describeError, EMAIL_FROM, EMAIL_REPLY_TO, emailLayout, escapeHtml, heading, P, SANS } from "./layout";

type MagicLink = { url: string; expiresAt: Date; now?: Date };

// Minutes until the link expires, from Neon's expires_at, never written by hand. At least 1.
export function minutesLeft(expiresAt: Date, now = new Date()) {
  return Math.max(1, Math.round((expiresAt.getTime() - now.getTime()) / 60_000));
}

// The sign-in email's copy (#83), replacing Neon's template. English, plain text plus
// hand-written HTML in the welcome email's layout.
export function magicLinkEmail({ url, expiresAt, now }: MagicLink) {
  const minutes = minutesLeft(expiresAt, now);
  const expiry = `This link expires in ${minutes} minute${minutes === 1 ? "" : "s"} and can only be used once.`;
  const ignore = "If you didn't request this email, you can safely ignore it.";
  const subject = "Sign in to UseChangelog";
  const text = [
    "Sign in to UseChangelog with this link:",
    url,
    "",
    expiry,
    "",
    ignore,
    "",
    "— UseChangelog",
  ].join("\n");

  const href = escapeHtml(url);
  const small = `margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.graphite};word-break:break-all`;
  const content = [
    `      ${heading("Sign in to UseChangelog")}`,
    `      <p style="${P}">Click the button below to sign in. ${expiry}</p>`,
    `      ${button(href, "Sign in")}`,
    `      <p style="${small}">Or paste this link into your browser:<br><a href="${href}" style="color:inherit">${href}</a></p>`,
  ].join("\n");

  const html = emailLayout({
    title: subject,
    preheader: expiry,
    content,
    footer: `${ignore.replace("'", "&#39;")}<br>— UseChangelog`,
  });
  return { subject, text, html };
}

// Sends the sign-in email for Neon's send.magic_link webhook. Returns whether Resend accepted
// it: the webhook answers 500 otherwise, so Neon retries. Neon repeats the event id on its
// retries, and the idempotency key makes Resend drop a second send of the same event (24 h).
// Never logs the address, the link or the token.
export async function sendMagicLink(to: string, url: string, expiresAt: Date, eventId: string) {
  const resend = getResend();
  if (!resend) {
    console.error("[magic-link] RESEND_API_KEY is not set; the sign-in email can't be sent");
    return false;
  }
  const failure = await resend.emails
    .send(
      { from: EMAIL_FROM, to, replyTo: EMAIL_REPLY_TO, ...magicLinkEmail({ url, expiresAt }) },
      { idempotencyKey: `magic-link/${eventId}` },
    )
    .then(({ error }) => error, (error: unknown) => error);
  if (!failure) return true;
  console.error(`[magic-link] sending failed for event ${eventId}:`, describeError(failure));
  return false;
}
