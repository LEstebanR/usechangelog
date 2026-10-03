import { redirect } from "next/navigation";

// One-time messages shown on /app after an action redirects there (`?done=<key>`).
export const NOTICES = {
  published: "Post published.",
  drafted: "Draft saved.",
  deleted: "Post deleted.",
  settings: "Settings saved.",
} as const;

export type Notice = keyof typeof NOTICES;

export function redirectWithNotice(notice: Notice): never {
  redirect(`/app?done=${notice}`);
}

export const noticeText = (done: unknown) =>
  typeof done === "string" && done in NOTICES ? NOTICES[done as Notice] : undefined;
