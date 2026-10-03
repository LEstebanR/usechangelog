"use client";

import { useEffect } from "react";

// Enter in a text field submits its form, even when a browser extension cancels
// the keydown (some do, and then the browser's own implicit submit never runs).
// We listen in the capture phase, before page-level handlers, and submit through
// requestSubmit() so the browser still validates required fields.
export function EnterSubmits() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.isComposing || event.shiftKey) return;
      const field = event.target;
      if (!(field instanceof HTMLInputElement) || !field.form) return;
      if (["checkbox", "radio", "button", "submit", "file"].includes(field.type)) return;
      event.preventDefault();
      field.form.requestSubmit();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
  return null;
}
