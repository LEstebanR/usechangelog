// Messages for the `?error=` codes that land on /sign-in: magic link and
// Google errors from Neon, plus our own form errors.
const messages: Record<string, string> = {
  EXPIRED_TOKEN: "That sign-in link has expired. Enter your email to get a new one.",
  INVALID_TOKEN: "That sign-in link was already used or isn't valid. Enter your email to get a new one.",
  MISSING_EMAIL: "Enter your email address.",
  INVALID_EMAIL: "That doesn't look like an email address. Check it and try again.",
  SEND_FAILED: "We couldn't send the link. Check the address and try again.",
  GOOGLE_FAILED: "We couldn't reach Google. Try again, or use your email instead.",
  access_denied: "Google sign-in was cancelled. Try again, or use your email instead.",
};

const fallback = "Something went wrong signing you in. Try again, or use your email to get a new link.";

export function signInErrorMessage(code: string | string[] | undefined) {
  if (typeof code !== "string") return undefined;
  return messages[code] ?? fallback;
}
