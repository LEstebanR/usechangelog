import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// No Neon and no Resend: the signature check and the Resend client are mocked. The email
// itself is the real one (lib/email/magic-link.ts).
let signature: () => Promise<boolean>;
mock.module("@/lib/auth/webhook", () => ({ verifyNeonWebhook: () => signature() }));

let sendResult: () => Promise<{ data: unknown; error: unknown }>;
const send = mock((options: Record<string, unknown>, requestOptions?: Record<string, unknown>) => (void options, void requestOptions, sendResult()));
mock.module("@/lib/email/client", () => ({ getResend: () => ({ emails: { send } }) }));

const { POST } = await import("./route");

const link = "https://auth.example.test/magic-link/verify?token=secret-token";
function event(overrides: { event_type?: string; link_type?: string } = {}) {
  return {
    event_id: "event-1",
    event_type: overrides.event_type ?? "send.magic_link",
    user: { email: "someone@example.com" },
    event_data: { link_type: overrides.link_type ?? "sign-in", link_url: link, token: "secret-token", expires_at: new Date(Date.now() + 15 * 60_000).toISOString() },
  };
}
const post = (body: unknown) => POST(new Request("https://www.usechangelog.com/api/auth/webhook", { method: "POST", body: JSON.stringify(body) }));

let log: ReturnType<typeof spyOn>;
beforeEach(() => {
  signature = async () => true;
  sendResult = async () => ({ data: { id: "email-1" }, error: null });
  send.mockClear();
  log?.mockRestore();
  log = spyOn(console, "error").mockImplementation(() => {});
});
const logged = () => log.mock.calls.flat().join(" ");

describe("POST /api/auth/webhook", () => {
  test("a signed sign-in magic link sends one email and answers 200", async () => {
    const response = await post(event());
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ to: "someone@example.com", subject: "Sign in to UseChangelog" });
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: "magic-link/event-1" });
  });

  test("an invalid signature answers 401 and sends nothing", async () => {
    signature = async () => false;
    expect((await post(event())).status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  test("keys that can't be loaded answer 500, so Neon retries", async () => {
    signature = async () => {
      throw new Error("JWKS request failed: 503");
    };
    expect((await post(event())).status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  test("a link type other than sign-in answers 400, sends nothing and logs [magic-link]", async () => {
    for (const link_type of ["email-verification", "forget-password"]) {
      expect((await post(event({ link_type }))).status).toBe(400);
    }
    expect(send).not.toHaveBeenCalled();
    expect(logged()).toContain("[magic-link]");
  });

  test("another event type answers 400", async () => {
    expect((await post(event({ event_type: "send.otp" }))).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  test("a payload without the email answers 400", async () => {
    const body = event();
    delete (body.user as { email?: string }).email;
    expect((await post(body)).status).toBe(400);
  });

  test("a Resend error answers 500", async () => {
    sendResult = async () => ({ data: null, error: { name: "application_error", message: "Something went wrong" } });
    expect((await post(event())).status).toBe(500);
  });

  test("no log line carries the email, the link or the token", async () => {
    sendResult = async () => ({ data: null, error: { name: "validation_error", message: `Invalid to: someone@example.com ${link}` } });
    await post(event());
    await post(event({ link_type: "forget-password" }));
    expect(logged()).toContain("[magic-link]");
    expect(logged()).not.toMatch(/someone@example\.com|secret-token|auth\.example\.test/);
  });
});
