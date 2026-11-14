import { verifyNeonWebhook } from "@/lib/auth/webhook";
import { describeError } from "@/lib/email/layout";
import { sendMagicLink } from "@/lib/email/magic-link";

// Neon Auth's webhook (#83), subscribed to send.magic_link on `production` only. With the
// subscription on, Neon doesn't send its own email: it calls this and the user signs in with
// what we send. It's blocking: Neon tries 3 times within 15 s and then fails the sign-in, so
// this only verifies, sends and answers. A static segment, so it wins over the [...path]
// catch-all that serves Neon Auth's own routes.
//
// 401 bad signature (nothing else is read) · 400 not a sign-in magic link (Neon doesn't retry
// a 4xx, so a new type shows up at once) · 500 the JWKS or Resend failed (Neon retries) · 200 sent.
// The logs never carry the address, the link or the token.

type Payload = {
  event_id?: string;
  event_type?: string;
  user?: { email?: string };
  event_data?: { link_type?: string; link_url?: string; expires_at?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  let valid: boolean;
  try {
    valid = await verifyNeonWebhook(rawBody, request.headers);
  } catch (error) {
    console.error("[magic-link] couldn't load Neon's signing keys:", describeError(error));
    return new Response(null, { status: 500 });
  }
  if (!valid) return new Response(null, { status: 401 });

  let payload: Payload;
  try {
    payload = JSON.parse(rawBody) as Payload;
  } catch {
    return reject("the body isn't JSON");
  }
  const { event_id: eventId, event_type: type, user, event_data: data } = payload;
  if (type !== "send.magic_link") return reject(`unexpected event type ${JSON.stringify(type)}`, eventId);
  if (data?.link_type !== "sign-in") return reject(`unexpected link type ${JSON.stringify(data?.link_type)}`, eventId);

  const expiresAt = new Date(data.expires_at ?? "");
  if (!eventId || !user?.email || !data.link_url || Number.isNaN(expiresAt.getTime())) {
    return reject("missing event id, email, link or expiry", eventId);
  }

  const sent = await sendMagicLink(user.email, data.link_url, expiresAt, eventId);
  return new Response(null, { status: sent ? 200 : 500 });
}

function reject(reason: string, eventId?: string) {
  console.error(`[magic-link] rejected event ${eventId ?? "(no id)"}: ${reason}`);
  return new Response(null, { status: 400 });
}
