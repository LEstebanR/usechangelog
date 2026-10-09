"use client";

import { useSyncExternalStore } from "react";
import { container } from "./layout-styles";

const noop = () => () => {};
const deletedInUrl = () => new URLSearchParams(window.location.search).get("deleted") === "1";

// "Your account was deleted." after deleting an account (#31) lands on /?deleted=1. Read in
// the browser so the landing stays static; the server render never shows it.
export function DeletedNotice() {
  const shown = useSyncExternalStore(noop, deletedInUrl, () => false);
  if (!shown) return null;
  return (
    <div className={`${container} pt-6`}>
      <p role="status" className="border border-green/40 bg-green-wash px-4 py-3 text-sm text-green">
        Your account was deleted.
      </p>
    </div>
  );
}
