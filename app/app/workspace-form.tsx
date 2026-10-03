"use client";

import { useActionState, useState } from "react";
import { LANG_NAMES, WIDGET_LANGS } from "@/lib/widget/copy";
import type { WorkspaceFormState } from "@/lib/workspace/form";
import { NAME_MAX, SLUG_MAX, slugify } from "@/lib/workspace/slug";
import { inputClass, primaryButtonClass } from "../form-styles";
import { SubmitButton } from "../submit-button";
import { Chips } from "./chips";

type Props = {
  action: (state: WorkspaceFormState, formData: FormData) => Promise<WorkspaceFormState>;
  initial: WorkspaceFormState["values"];
  origin: string;
  submitLabel: string;
  // Settings only: onboarding starts in English.
  showWidgetLang?: boolean;
};


// The only client code for workspaces: keeps what you typed on errors and
// suggests a slug from the name until you edit the slug yourself.
export function WorkspaceForm({ action, initial, origin, submitLabel, showWidgetLang }: Props) {
  const [state, formAction] = useActionState(action, { values: initial });
  const [name, setName] = useState(state.values.name);
  // null until the slug is edited by hand: until then it follows the name.
  const [slugInput, setSlugInput] = useState<string | null>(initial.slug || null);
  // After each submit, show the values the server normalized (e.g. a lowercased slug).
  const [shown, setShown] = useState(state);
  if (state !== shown) {
    setShown(state);
    setName(state.values.name);
    // A suggested slug stays a suggestion; only one typed by hand is kept.
    setSlugInput((typed) => (typed === null ? null : state.values.slug));
  }
  const slug = slugInput ?? slugify(name);
  // Settings only: warn before a stored slug changes.
  const slugChanged = Boolean(initial.slug) && slug.trim().toLowerCase() !== initial.slug;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme"
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className={inputClass}
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
            maxLength={SLUG_MAX}
            spellCheck={false}
            autoCapitalize="none"
            value={slug}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="acme"
            aria-invalid={Boolean(state.errors?.slug)}
            aria-describedby="slug-help"
            className={`${inputClass} min-w-0 flex-1`}
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

      {showWidgetLang && (
        <Chips
          name="widgetLang"
          legend="Widget language"
          options={WIDGET_LANGS}
          value={state.values.widgetLang}
          label={(lang) => LANG_NAMES[lang]}
          chipClass={() => "px-3 py-1.5 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas"}
          hint="The widget's own words: its button, title and dates. Your posts show as you wrote them."
        />
      )}

      <div>
        <SubmitButton pendingLabel="Saving…" className={primaryButtonClass}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
