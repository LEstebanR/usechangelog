"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/account/actions";
import { inputClass } from "../../form-styles";

// The button stays off until the slug is typed exactly; the action checks it again.
export function DeleteAccountForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(deleteAccount, {});
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === slug;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <label htmlFor="confirm-slug" className="text-sm font-medium">
        Type <span className="font-mono">{slug}</span> to confirm
      </label>
      <input
        id="confirm-slug"
        name="slug"
        autoComplete="off"
        spellCheck={false}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "delete-error" : undefined}
        className={inputClass}
      />
      {state.error && (
        <p id="delete-error" role="alert" className="border border-clay/30 bg-clay-wash px-4 py-3 text-sm text-clay">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={!matches || pending}
        className="motion-press mt-2 inline-flex items-center justify-center whitespace-nowrap bg-clay px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Deleting…" : "Delete account"}
      </button>
    </form>
  );
}
