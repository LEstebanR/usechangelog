import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// No Resend: the client is mocked.
let sendResult: () => Promise<{ data: unknown; error: unknown }>;
const send = mock((options: Record<string, unknown>, requestOptions?: Record<string, unknown>) => (void options, void requestOptions, sendResult()));
let hasKey = true;
mock.module("./client", () => ({ getResend: () => (hasKey ? { emails: { send } } : null) }));

const { magicLinkEmail, minutesLeft, sendMagicLink } = await import("./magic-link");
const { EMAIL_FROM, EMAIL_REPLY_TO } = await import("./layout");

const now = new Date("2026-11-14T12:00:00Z");
const expiresAt = new Date("2026-11-14T12:15:00Z");
const url = "https://auth.example.test/magic-link/verify?token=abc&callbackURL=https%3A%2F%2Fwww.usechangelog.com%2Fauth%2Fcallback";

beforeEach(() => {
  send.mockClear();
  hasKey = true;
  sendResult = async () => ({ data: { id: "email-1" }, error: null });
});

describe("magicLinkEmail", () => {
  const { subject, text, html } = magicLinkEmail({ url, expiresAt, now });

  test("has the subject, the link in text and the button, and the ignore line", () => {
    expect(subject).toBe("Sign in to UseChangelog");
    expect(text).toContain(url);
    expect(html).toContain(`href="${url.replace(/&/g, "&#38;")}"`);
    expect(html).toContain(">Sign in</a>");
    for (const body of [text, html]) expect(body).toMatch(/ignore it/);
  });

  test("the minutes come from expiresAt", () => {
    expect(text).toContain("expires in 15 minutes");
    expect(html).toContain("expires in 15 minutes");
    expect(magicLinkEmail({ url, expiresAt: new Date("2026-11-14T12:01:00Z"), now }).text).toContain("expires in 1 minute ");
    expect(minutesLeft(new Date("2026-11-14T11:00:00Z"), now)).toBe(1);
  });

  test("escapes the link in the HTML", () => {
    expect(magicLinkEmail({ url: 'https://x.test/"><b>', expiresAt, now }).html).not.toContain('"><b>');
  });

  test("uses the welcome email's layout", () => {
    expect(html).toContain("UseChangelog</td>");
    expect(html).toContain("#1d3a8f");
    expect(html).toContain("Funnel Display");
  });

  test("never mentions a price", () => {
    for (const body of [subject, text, html]) expect(body).not.toMatch(/\$|USD|per month|\/mo\b|price/i);
  });
});

describe("sendMagicLink", () => {
  test("sends from hello@ with Reply-To support@, keyed by the event id", async () => {
    expect(await sendMagicLink("someone@example.com", url, expiresAt, "event-1")).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ from: EMAIL_FROM, to: "someone@example.com", replyTo: EMAIL_REPLY_TO, subject: "Sign in to UseChangelog" });
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: "magic-link/event-1" });
  });

  test("a retry of the same event uses the same idempotency key, so Resend sends it once", async () => {
    await sendMagicLink("someone@example.com", url, expiresAt, "event-1");
    await sendMagicLink("someone@example.com", url, expiresAt, "event-1");
    expect(send.mock.calls.map((c) => c[1])).toEqual([{ idempotencyKey: "magic-link/event-1" }, { idempotencyKey: "magic-link/event-1" }]);
  });

  test("a Resend error returns false and logs neither the email nor the link", async () => {
    sendResult = async () => ({ data: null, error: { name: "validation_error", message: `Invalid to: someone@example.com, ${url}` } });
    const log = spyOn(console, "error").mockImplementation(() => {});
    expect(await sendMagicLink("someone@example.com", url, expiresAt, "event-1")).toBe(false);
    const line = log.mock.calls.flat().join(" ");
    expect(line).toContain("[magic-link]");
    expect(line).not.toContain("someone@example.com");
    expect(line).not.toContain("token=abc");
    log.mockRestore();
  });

  test("a thrown error (network) returns false", async () => {
    sendResult = async () => {
      throw new Error("fetch failed");
    };
    const log = spyOn(console, "error").mockImplementation(() => {});
    expect(await sendMagicLink("someone@example.com", url, expiresAt, "event-1")).toBe(false);
    log.mockRestore();
  });

  test("without RESEND_API_KEY it returns false", async () => {
    hasKey = false;
    const log = spyOn(console, "error").mockImplementation(() => {});
    expect(await sendMagicLink("someone@example.com", url, expiresAt, "event-1")).toBe(false);
    expect(send).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
