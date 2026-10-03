"use client";

import { useEffect } from "react";

// Some browser extensions cancel Enter in text fields, which stops the browser's
// own submit. We listen last (bubble phase on window) and only step in when
// someone else already cancelled it, so native behavior is untouched otherwise.
// requestSubmit() keeps the browser's validation of required fields.
export function EnterSubmits() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || !event.defaultPrevented || event.isComposing) return;
      const field = event.target;
      if (!(field instanceof HTMLInputElement) || !field.form) return;
      if (["checkbox", "radio", "button", "submit", "file"].includes(field.type)) return;
      // A disabled submit button means the form is already saving: don't send it twice.
      if (field.form.querySelector("button[type=submit]:disabled")) return;
      field.form.requestSubmit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return null;
}
