"use client";

import { useActionState } from "react";
import { BODY_MAX, CATEGORIES, LABELS, TITLE_MAX, TYPES, type PostFormState } from "@/lib/posts/form";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../form-styles";

type Props = {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  initial: PostFormState["values"];
  status: "draft" | "published" | "new";
};


// Client only to keep what you typed when the server returns errors.
// Uncontrolled fields: the form re-renders from `state.values` after each submit.
export function PostForm({ action, initial, status }: Props) {
  const [state, formAction, pending] = useActionState(action, { values: initial });
  const v = state.values;

  return (
    <form action={formAction} key={JSON.stringify(v)} className="flex flex-col gap-6">
      <Field label="Title" id="title" error={state.errors?.title}>
        <input id="title" name="title" required maxLength={TITLE_MAX} defaultValue={v.title}
          aria-invalid={Boolean(state.errors?.title)} className={`${inputClass} text-lg`} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Choice name="category" legend="Category" options={CATEGORIES} value={v.category} />
        <Choice name="type" legend="Type" options={TYPES} value={v.type} />
        <Field label="Date" id="publishedOn" error={state.errors?.publishedOn}
          hint={status === "published" ? undefined : "Set on first publish if empty."}>
          <input id="publishedOn" name="publishedOn" type="date" defaultValue={v.publishedOn}
            aria-invalid={Boolean(state.errors?.publishedOn)} className={inputClass} />
        </Field>
      </div>

      <Field label="Body" id="body" error={state.errors?.body} hint="Markdown.">
        <textarea id="body" name="body" rows={14} maxLength={BODY_MAX} defaultValue={v.body}
          aria-invalid={Boolean(state.errors?.body)} className={`${inputClass} font-mono text-sm leading-relaxed`} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        {/* The first button is what Enter submits: always the non-destructive save. */}
        <button type="submit" name="intent" value="save" disabled={pending} className={secondaryButtonClass}>
          {status === "published" ? "Save" : "Save draft"}
        </button>
        {status === "published" ? (
          <button type="submit" name="intent" value="unpublish" disabled={pending} className={secondaryButtonClass}>
            Unpublish
          </button>
        ) : (
          <button type="submit" name="intent" value="publish" disabled={pending} className={primaryButtonClass}>
            Publish
          </button>
        )}
        {pending && <span className="text-sm text-graphite">Saving…</span>}
        {state.saved && !pending && <span role="status" className="text-sm text-green">Saved.</span>}
      </div>
    </form>
  );
}

function Field({ label, id, error, hint, children }: { label: string; id: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {(error || hint) && <p className={`text-sm ${error ? "text-clay" : "text-graphite"}`}>{error ?? hint}</p>}
    </div>
  );
}

function Choice({ name, legend, options, value }: { name: string; legend: string; options: readonly (keyof typeof LABELS)[]; value: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 text-sm">
          <input type="radio" name={name} value={option} defaultChecked={value === option} className="accent-blue" />
          {LABELS[option]}
        </label>
      ))}
    </fieldset>
  );
}
