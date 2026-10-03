// Messages for the `?error=` codes that land on /sign-in: magic link
// verification errors from Neon, plus our own form errors.
const messages: Record<string, string> = {
  EXPIRED_TOKEN: "That sign-in link has expired. Enter your email to get a new one.",
  INVALID_TOKEN: "That sign-in link was already used or isn't valid. Enter your email to get a new one.",
  MISSING_EMAIL: "Enter your email address.",
  SEND_FAILED: "We couldn't send the link. Check the address and try again.",
};

const fallback = "Something went wrong with that link. Enter your email to get a new one.";

export function signInErrorMessage(code: string | string[] | undefined) {
  if (typeof code !== "string") return undefined;
  return messages[code] ?? fallback;
}
