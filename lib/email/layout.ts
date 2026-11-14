// What every email we send shares: the sender, the app's look and the error logging (#76, #83).
// One copy of the design, used by the welcome email and the magic link.

// Replies reach support through ImprovMX.
export const EMAIL_FROM = "UseChangelog <hello@usechangelog.com>";
export const EMAIL_REPLY_TO = "support@usechangelog.com";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// The app's palette (app/globals.css) and fonts, inlined: email clients drop <style> and
// CSS variables. Tables for layout, square corners and the 2×2 mark, like the app.
export const C = {
  canvas: "#ffffff",
  wash: "#f6f7f9",
  ink: "#0e1116",
  graphite: "#5a6170",
  hairline: "#e4e7ec",
  blue: "#1d3a8f",
  blueSoft: "#a5b0d2",
};
export const DISPLAY = "'Funnel Display',system-ui,-apple-system,'Segoe UI',sans-serif";
export const SANS = "'Instrument Sans',system-ui,-apple-system,'Segoe UI',sans-serif";

// A body paragraph's style.
export const P = `margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}`;

export function heading(text: string) {
  return `<h1 style="margin:0 0 16px;font-family:${DISPLAY};font-size:28px;line-height:1.2;font-weight:500;letter-spacing:-0.02em;color:${C.ink}">${text}</h1>`;
}

// The primary button: square, ink on white, like the app's. `href` must be escaped already.
export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr>
        <td style="background:${C.ink}"><a href="${href}" style="display:inline-block;padding:11px 18px;font-family:${SANS};font-size:15px;font-weight:500;color:${C.canvas};text-decoration:none">${label}</a></td>
      </tr></table>`;
}

type Layout = {
  // The <title>, plain text.
  title: string;
  // The inbox preview line, hidden in the body.
  preheader: string;
  // The card's HTML, each line indented six spaces.
  content: string;
  // The line under the card.
  footer: string;
};

export function emailLayout({ title, preheader, content, footer }: Layout) {
  const cell = (color: string) => `<td width="7" height="7" style="width:7px;height:7px;background:${color};font-size:0;line-height:0">&nbsp;</td>`;
  const mark = `<table role="presentation" cellpadding="0" cellspacing="1" style="border-collapse:separate"><tr>${cell(C.blue)}${cell(C.blueSoft)}</tr><tr>${cell(C.blueSoft)}${cell(C.blueSoft)}</tr></table>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@500&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.wash}">
<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>
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
${content}
    </td></tr>
    <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.graphite}">
      ${footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// Resend's error for the logs, with any email address or link in its message redacted
// (it may echo the recipient, and a magic link must never reach the logs).
export function describeError(error: unknown) {
  const { name = "Error", message = String(error) } =
    error && typeof error === "object" ? (error as { name?: string; message?: string }) : {};
  return `${name}: ${message.replace(/\S+@\S+/g, "[email]").replace(/https?:\/\/\S+/g, "[url]")}`;
}
