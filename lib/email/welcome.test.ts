import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// No database and no Resend: both are mocked. The fake db keeps one account's
// welcome_email_sent_at and applies the claim's `is null` condition itself.
let sentAt: Date | null = null;
const updates: (Date | null)[] = [];
const fakeDb = {
  update: () => ({
    set: ({ welcomeEmailSentAt }: { welcomeEmailSentAt: Date | null }) => ({
      where: () => {
        // The claim (a Date) only wins while the mark is null; the release (null) always applies.
        const applied = welcomeEmailSentAt === null || sentAt === null;
        if (applied) {
          sentAt = welcomeEmailSentAt;
          updates.push(welcomeEmailSentAt);
        }
        const rows = applied ? [{ id: "account-1" }] : [];
        return Object.assign(Promise.resolve(rows), { returning: async () => rows });
      },
    }),
  }),
};
mock.module("@/db", () => ({ getDb: () => fakeDb }));

let sendResult: () => Promise<{ data: unknown; error: unknown }>;
const send = mock((options: Record<string, unknown>) => (void options, sendResult()));
let hasKey = true;
mock.module("./client", () => ({ getResend: () => (hasKey ? { emails: { send } } : null) }));

const { sendWelcomeEmail, welcomeEmail, WELCOME_FROM, WELCOME_REPLY_TO } = await import("./welcome");

const project = {
  name: "Acme <Beta>",
  publicUrl: "https://www.usechangelog.com/acme",
  appUrl: "https://www.usechangelog.com/app",
};

beforeEach(() => {
  sentAt = null;
  updates.length = 0;
  send.mockClear();
  hasKey = true;
  sendResult = async () => ({ data: { id: "email-1" }, error: null });
});

describe("welcomeEmail", () => {
  const { subject, text, html } = welcomeEmail(project);

  test("links the project's public page and /app, in text and HTML", () => {
    expect(subject).toBe("Welcome to UseChangelog");
    for (const body of [text, html]) {
      expect(body).toContain("https://www.usechangelog.com/acme");
      expect(body).toContain("https://www.usechangelog.com/app");
      expect(body).toContain("widget");
      expect(body).toContain("reply to this email");
    }
  });

  test("escapes the project name in the HTML", () => {
    expect(html).toContain("Acme &#60;Beta&#62;");
    expect(html).not.toContain("<Beta>");
    expect(text).toContain("Acme <Beta>");
  });

  test("never mentions a price", () => {
    for (const body of [subject, text, html]) expect(body).not.toMatch(/\$|USD|per month|\/mo\b|price/i);
  });
});

describe("sendWelcomeEmail", () => {
  test("sends once, from hello@ with Reply-To support@", async () => {
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      from: WELCOME_FROM,
      to: "someone@example.com",
      replyTo: WELCOME_REPLY_TO,
    });
    expect(WELCOME_FROM).toBe("UseChangelog <hello@usechangelog.com>");
    expect(WELCOME_REPLY_TO).toBe("support@usechangelog.com");
    expect(sentAt).toBeInstanceOf(Date);
  });

  test("a second call (a second project, a parallel request) doesn't send again", async () => {
    await Promise.all([
      sendWelcomeEmail("user-1", "someone@example.com", project),
      sendWelcomeEmail("user-1", "someone@example.com", project),
    ]);
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test("an account already marked (backfilled) never gets it", async () => {
    sentAt = new Date("2026-01-01");
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(send).not.toHaveBeenCalled();
  });

  test("a Resend error releases the mark and logs [welcome] without the email", async () => {
    sendResult = async () => ({ data: null, error: { name: "validation_error", message: "Invalid to: someone@example.com" } });
    const log = spyOn(console, "error").mockImplementation(() => {});
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(sentAt).toBeNull();
    expect(updates.at(-1)).toBeNull();
    const line = log.mock.calls.flat().join(" ");
    expect(line).toContain("[welcome]");
    expect(line).not.toContain("someone@example.com");
    log.mockRestore();
  });

  test("a thrown error (network) releases the mark too", async () => {
    sendResult = async () => {
      throw new Error("fetch failed");
    };
    const log = spyOn(console, "error").mockImplementation(() => {});
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(sentAt).toBeNull();
    log.mockRestore();
  });

  test("without RESEND_API_KEY, nothing is sent and the mark isn't touched", async () => {
    hasKey = false;
    const info = spyOn(console, "info").mockImplementation(() => {});
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(send).not.toHaveBeenCalled();
    expect(updates).toEqual([]);
    expect(info).toHaveBeenCalled();
    info.mockRestore();
  });
});
