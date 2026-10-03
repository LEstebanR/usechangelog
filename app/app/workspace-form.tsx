"use client";

import { useActionState, useState } from "react";
import type { WorkspaceFormState } from "@/lib/workspace/actions";
import { slugify } from "@/lib/workspace/slug";

type Props = {
  action: (state: WorkspaceFormState, formData: FormData) => Promise<WorkspaceFormState>;
  initial: WorkspaceFormState["values"];
  origin: string;
  submitLabel: string;
  // Settings: the slug already in use, to warn before it changes.
  currentSlug?: string;
};

const input =
  "border border-hairline bg-canvas px-3 py-2 placeholder:text-graphite/70 focus:border-blue aria-invalid:border-clay";

// The only client code for workspaces: keeps what you typed on errors and
// suggests a slug from the name until you edit the slug yourself.
export function WorkspaceForm({ action, initial, origin, submitLabel, currentSlug }: Props) {
  const [state, formAction, pending] = useActionState(action, { values: initial });
  const [name, setName] = useState(state.values.name);
  const [slug, setSlug] = useState(state.values.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(currentSlug));
  // After each submit, show the values the server normalized (e.g. a lowercased slug).
  const [shown, setShown] = useState(state);
  if (state !== shown) {
    setShown(state);
    setName(state.values.name);
    setSlug(state.values.slug);
  }
  const slugChanged = currentSlug !== undefined && slug.trim().toLowerCase() !== currentSlug;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          placeholder="Acme"
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className={input}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-sm text-clay">
            {state.errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Public URL
        </label>
        <div className="flex items-stretch">
          <span className="flex items-center border border-r-0 border-hairline bg-wash px-3 text-sm text-graphite">
            {origin.replace(/^https?:\/\//, "")}/
          </span>
          <input
            id="slug"
            name="slug"
            required
            maxLength={40}
            spellCheck={false}
            autoCapitalize="none"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            placeholder="acme"
            aria-invalid={Boolean(state.errors?.slug)}
            aria-describedby="slug-help"
            className={`${input} min-w-0 flex-1`}
          />
        </div>
        <p id="slug-help" className={`text-sm ${state.errors?.slug ? "text-clay" : "text-graphite"}`}>
          {state.errors?.slug ?? "Lowercase letters, numbers and hyphens."}
        </p>
        {slugChanged && (
          <p role="status" className="border border-clay/30 bg-clay-wash px-3 py-2 text-sm text-clay">
            Your old URL will stop working.
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="motion-press bg-blue px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {state.saved && !pending && (
          <p role="status" className="text-sm text-green">
            Saved.
          </p>
        )}
      </div>
    </form>
  );
}
