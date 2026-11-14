"use client";

import { useActionState, useState } from "react";
import { dangerButtonClass, inputClass } from "../../form-styles";

type Props = {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  // What has to be typed, and the field that sends it (the action checks it again).
  confirm: string;
  name: "slug" | "email";
  label: string;
};

// Deleting a project (#65) or the account (#31): the button stays off until `confirm` is
// typed exactly.
export function ConfirmDeleteForm({ action, confirm, name, label }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === confirm.toLowerCase();
  const id = `confirm-${name}`;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-medium">
        Type <span className="font-mono break-all">{confirm}</span> to confirm
      </label>
      <input
        id={id}
        name={name}
        autoComplete="off"
        spellCheck={false}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? `${id}-error` : undefined}
        className={inputClass}
      />
      {state.error && (
        <p id={`${id}-error`} role="alert" className="border border-clay/30 bg-clay-wash px-4 py-3 text-sm text-clay">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={!matches || pending} className={`mt-2 ${dangerButtonClass}`}>
        {pending ? "Deleting…" : label}
      </button>
    </form>
  );
}
