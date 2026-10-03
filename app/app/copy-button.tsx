"use client";

import { useState } from "react";
import { secondaryButtonClass } from "../form-styles";

// Copies `text` to the clipboard and says so for a moment. If the browser blocks the
// clipboard, nothing happens; the text itself stays selectable.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`${secondaryButtonClass} py-2 text-sm`}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
