"use client";

import { useActionState, useSyncExternalStore } from "react";
import { BODY_MAX, CATEGORIES, LABELS, TITLE_MAX, TYPES, type PostFormState } from "@/lib/posts/form";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../form-styles";

type Props = {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  initial: PostFormState["values"];
  status: "draft" | "published" | "new";
};

// Chosen chips take the landing's tag colors.
const chipOn = {
  new: "peer-checked:border-blue peer-checked:bg-blue peer-checked:text-canvas",
  improved: "peer-checked:border-green/40 peer-checked:bg-green-wash peer-checked:text-green",
  fixed: "peer-checked:border-clay/40 peer-checked:bg-clay-wash peer-checked:text-clay",
  shipped: "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas",
  coming: "peer-checked:border-dashed peer-checked:border-graphite peer-checked:text-ink",
} as const;

// A writing surface on the left, everything about publishing on the right.
// Client only to keep what you typed when the server returns errors.
export function PostForm({ action, initial, status }: Props) {
  const [state, formAction, pending] = useActionState(action, { values: initial });
  const v = state.values;
  // The author's local day, so a post published tonight isn't dated tomorrow (UTC).
  const today = useSyncExternalStore(noSubscribe, localDay, () => "");
  const published = status === "published";

  return (
    <form
      action={formAction}
      key={JSON.stringify(v)}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <input type="hidden" name="today" value={today} />

      <div className="flex min-w-0 flex-col gap-2 border border-hairline bg-canvas p-6 sm:p-8">
        <label htmlFor="title" className="sr-only">Title</label>
        <input
          id="title"
          name="title"
          maxLength={TITLE_MAX}
          defaultValue={v.title}
          placeholder="Post title"
          autoFocus={!v.title}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
          className="w-full bg-transparent font-display text-3xl font-medium tracking-tight outline-none placeholder:text-graphite/50"
        />
        {state.errors?.title && <p id="title-error" className="text-sm text-clay">{state.errors.title}</p>}

        <div className="my-4 h-px bg-hairline" />

        <label htmlFor="body" className="sr-only">Body</label>
        <textarea
          id="body"
          name="body"
          rows={18}
          maxLength={BODY_MAX}
          defaultValue={v.body}
          placeholder="What changed, and why it matters. Markdown works: **bold**, lists, [links](https://…)."
          aria-invalid={Boolean(state.errors?.body)}
          className="w-full resize-y bg-transparent leading-relaxed outline-none placeholder:text-graphite/60"
        />
        <p className={`text-sm ${state.errors?.body ? "text-clay" : "text-graphite"}`}>
          {state.errors?.body ?? "Markdown. Your public page shows it formatted."}
        </p>
      </div>

      <aside className="flex flex-col gap-6 self-start border border-hairline bg-canvas p-6 lg:sticky lg:top-6">
        <Chips name="category" legend="Category" options={CATEGORIES} value={v.category} />
        <Chips name="type" legend="Type" options={TYPES} value={v.type} />

        <div className="flex flex-col gap-2">
          <label htmlFor="publishedOn" className="text-sm font-medium">Date</label>
          <input
            id="publishedOn"
            name="publishedOn"
            type="date"
            defaultValue={v.publishedOn}
            aria-invalid={Boolean(state.errors?.publishedOn)}
            className={inputClass}
          />
          <p className={`text-xs ${state.errors?.publishedOn ? "text-clay" : "text-graphite"}`}>
            {state.errors?.publishedOn ?? (published ? "Shown on your changelog." : "Today if left empty when you publish.")}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-hairline pt-6">
          {/* Save comes first in the markup, so Enter in the title saves and never publishes.
              The primary action is moved to the top visually. */}
          <button type="submit" name="intent" value="save" disabled={pending}
            className={published ? `order-first ${primaryButtonClass}` : secondaryButtonClass}>
            {published ? "Update" : "Save draft"}
          </button>
          {published ? (
            <button type="submit" name="intent" value="unpublish" disabled={pending} className={secondaryButtonClass}>
              Unpublish
            </button>
          ) : (
            <button type="submit" name="intent" value="publish" disabled={pending}
              className={`order-first ${primaryButtonClass}`}>
              Publish
            </button>
          )}
          <p role="status" className="min-h-5 text-sm text-graphite">
            {pending ? "Saving…" : state.notice && <span className="text-green">{state.notice}</span>}
          </p>
        </div>
      </aside>
    </form>
  );
}

const noSubscribe = () => () => {};
// "YYYY-MM-DD" in the browser's time zone.
const localDay = () => new Date().toLocaleDateString("en-CA");

function Chips({ name, legend, options, value }: { name: string; legend: string; options: readonly (keyof typeof chipOn)[]; value: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} defaultChecked={value === option} className="peer sr-only" />
            <span className={`block border border-hairline px-2.5 py-1 font-display text-xs font-medium uppercase tracking-wider text-graphite transition-colors hover:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${chipOn[option]}`}>
              {LABELS[option]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
