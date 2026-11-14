import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// No database and no Resend: both are mocked. The fake db keeps one account's
// welcome_email_sent_at and applies the claim's `is null` condition itself.
let sentAt: Date | null = null;
let accountExists = true;
const updates: (Date | null)[] = [];
// The claim: an insert that, on conflict, sets the mark only while it's null.
const claim = async () => {
  if (accountExists && sentAt !== null) return [];
  accountExists = true;
  sentAt = new Date();
  updates.push(sentAt);
  return [{ id: "account-1" }];
};
const fakeDb = {
  insert: () => ({ values: () => ({ onConflictDoUpdate: () => ({ returning: claim }) }) }),
  // The release.
  update: () => ({
    set: ({ welcomeEmailSentAt }: { welcomeEmailSentAt: Date | null }) => ({
      where: async () => {
        sentAt = welcomeEmailSentAt;
        updates.push(welcomeEmailSentAt);
      },
    }),
  }),
};
mock.module("@/db", () => ({ getDb: () => fakeDb }));

let sendResult: () => Promise<{ data: unknown; error: unknown }>;
const send = mock((options: Record<string, unknown>, requestOptions?: Record<string, unknown>) => (void options, void requestOptions, sendResult()));
let hasKey = true;
mock.module("./client", () => ({ getResend: () => (hasKey ? { emails: { send } } : null) }));

const { sendWelcomeEmail, welcomeEmail, WELCOME_FROM, WELCOME_REPLY_TO } = await import("./welcome");

const project = { appUrl: "https://www.usechangelog.com/app" };

beforeEach(() => {
  sentAt = null;
  accountExists = true;
  updates.length = 0;
  send.mockClear();
  hasKey = true;
  sendResult = async () => ({ data: { id: "email-1" }, error: null });
});

describe("welcomeEmail", () => {
  const { subject, text, html } = welcomeEmail(project);

  test("asks for the first project, links /app, and mentions posts and the widget", () => {
    expect(subject).toBe("Welcome to UseChangelog");
    for (const body of [text, html]) {
      expect(body).toContain("https://www.usechangelog.com/app");
      expect(body).toContain("first project");
      expect(body).toContain("first post");
      expect(body).toContain("widget");
      expect(body).toContain("reply to this email");
    }
  });

  test("escapes the link in the HTML", () => {
    expect(welcomeEmail({ appUrl: 'https://x.test/app"><b>' }).html).not.toContain('"><b>');
  });

  test("the shared layout (#83) renders the same HTML as before it was extracted", () => {
    const hash = new Bun.CryptoHasher("sha256").update(html).digest("hex");
    expect(hash).toBe("a081f292bfa1aac2ea4f5df4787596a7cc856a20101d70edbedd158176d0c48d");
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
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: "welcome/account-1" });
    expect(WELCOME_FROM).toBe("UseChangelog <hello@usechangelog.com>");
    expect(WELCOME_REPLY_TO).toBe("support@usechangelog.com");
    expect(sentAt).toBeInstanceOf(Date);
  });

  test("a new user without an account row: the claim creates it and sends", async () => {
    accountExists = false;
    await sendWelcomeEmail("user-1", "someone@example.com", project);
    expect(send).toHaveBeenCalledTimes(1);
    expect(accountExists).toBe(true);
  });

  test("a second call (onboarding opened again, a parallel request) doesn't send again", async () => {
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

  test("a database error never throws, and logs [welcome]", async () => {
    const insert = fakeDb.insert;
    fakeDb.insert = () => {
      throw new Error("connection refused");
    };
    const log = spyOn(console, "error").mockImplementation(() => {});
    await expect(sendWelcomeEmail("user-1", "someone@example.com", project)).resolves.toBeUndefined();
    expect(log.mock.calls.flat().join(" ")).toContain("[welcome]");
    expect(send).not.toHaveBeenCalled();
    fakeDb.insert = insert;
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
