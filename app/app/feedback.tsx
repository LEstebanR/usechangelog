"use client";

import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendFeedback } from "@/lib/feedback/actions";
import { FEEDBACK_KINDS, FEEDBACK_LABELS, type FeedbackState, MESSAGE_MAX } from "@/lib/feedback/form";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../form-styles";
import { Chips } from "./chips";

const initial: FeedbackState = { values: { kind: "other", message: "" } };

// "Feedback" in the app's nav (#28): a native <dialog>, so the keyboard, the focus trap and
// focus returning to the button come from the browser. The form posts to a Server Action.
export function FeedbackButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  // A new form every time the dialog opens, so it's empty again after a send.
  const [round, setRound] = useState(0);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRound((r) => r + 1);
          dialog.current?.showModal();
        }}
        className="py-3 text-sm font-medium whitespace-nowrap text-graphite transition-colors hover:text-ink"
      >
        Feedback
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="feedback-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-hairline bg-canvas p-0 text-ink shadow-[0_16px_48px_-12px_rgb(14_17_22/0.28)] backdrop:bg-ink/30"
      >
        <FeedbackForm key={round} onDone={close} />
      </dialog>
    </>
  );
}

function FeedbackForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(sendFeedback, initial);
  const [length, setLength] = useState(0);
  const pathname = usePathname();

  // After a sent message: show the thanks for a moment, then close.
  useEffect(() => {
    if (!state.ok) return;
    const timer = setTimeout(onDone, 1800);
    return () => clearTimeout(timer);
  }, [state, onDone]);

  return state.ok ? (
    <p role="status" className="p-8 text-center font-display text-lg font-medium">
      Thanks, we read every message.
    </p>
  ) : (
    <form action={action} className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <h2 id="feedback-title" className="font-display text-xl font-medium tracking-tight">
          Send us feedback
        </h2>
        <p className="mt-1 text-sm text-graphite">What&apos;s broken, what&apos;s missing, what you like. We answer by email.</p>
      </div>
      <input type="hidden" name="page" value={pathname} />
      <Chips
        name="kind"
        legend="Kind"
        options={FEEDBACK_KINDS}
        value={state.values.kind}
        label={(k) => FEEDBACK_LABELS[k]}
        chipClass={() => "px-3 py-1 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas"}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="feedback-message"
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          defaultValue={state.values.message}
          onChange={(e) => setLength(e.target.value.length)}
          aria-invalid={Boolean(state.error)}
          aria-describedby="feedback-hint"
          className={`${inputClass} resize-y`}
        />
        <p id="feedback-hint" className={`flex justify-between gap-3 text-sm ${state.error ? "text-clay" : "text-graphite"}`}>
          <span role={state.error ? "alert" : undefined}>{state.error ?? "At least 10 characters."}</span>
          <span className="tabular-nums text-graphite">
            {length.toLocaleString("en-US")}/{MESSAGE_MAX.toLocaleString("en-US")}
          </span>
        </p>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
