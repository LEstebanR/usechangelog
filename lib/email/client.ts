import { Resend } from "resend";

let client: Resend | undefined;

// Created on first use, not at import, so `next build` runs without env vars.
// Null without RESEND_API_KEY (CI, local without it): callers skip sending.
export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}
