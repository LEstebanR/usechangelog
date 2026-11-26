"use client";

import { useActionState, useState } from "react";
import type { ApiKeyState } from "@/lib/api/actions";
import { dangerButtonClass, secondaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";
import { CopyButton } from "../copy-button";

const small = "py-2 text-sm";

// The project's API key (#86): create it, rotate it (after a confirmation, since the current
// key stops at once) or revoke it. The new key shows only this once: we keep its hash, never
// the key. Hidden once the key is revoked, so a dead key isn't offered.
export function ApiKeyPanel({
  create,
  revoke,
  hasKey,
  children,
}: {
  create: (state: ApiKeyState, formData: FormData) => Promise<ApiKeyState>;
  revoke: () => Promise<void>;
  hasKey: boolean;
  // What the server knows of the current key: its prefix and dates.
  children: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(async (prev: ApiKeyState, formData: FormData) => {
    const next = await create(prev, formData);
    setConfirming(false);
    return next;
  }, {});

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border border-hairline bg-wash p-4">
        {children}
        {confirming ? (
          <div className="flex basis-full flex-col gap-3">
            <p className="text-sm">
              Rotating stops the current key at once. Your workflow fails until you replace the{" "}
              <code className="font-mono">USECHANGELOG_API_KEY</code> secret with the new key.
            </p>
            <div className="flex gap-2">
              <form action={formAction}>
                <SubmitButton pendingLabel="Rotating…" className={`${dangerButtonClass} ${small}`}>
                  Rotate key
                </SubmitButton>
              </form>
              <button type="button" onClick={() => setConfirming(false)} className={`${secondaryButtonClass} ${small}`}>
                Cancel
              </button>
            </div>
          </div>
        ) : hasKey ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming(true)} className={`${secondaryButtonClass} ${small}`}>
              Rotate key
            </button>
            <form action={revoke}>
              <SubmitButton pendingLabel="Revoking…" className={`${secondaryButtonClass} ${small}`}>
                Revoke
              </SubmitButton>
            </form>
          </div>
        ) : (
          <form action={formAction}>
            <SubmitButton pendingLabel="Creating…" className={`${secondaryButtonClass} ${small}`}>
              Create API key
            </SubmitButton>
          </form>
        )}
      </div>

      {state.key && hasKey && (
        <div role="status" className="mt-4 border border-green bg-wash p-4">
          <p className="text-sm font-medium">Your new API key. Copy it now: you won&rsquo;t see it again.</p>
          <div className="mt-2 flex items-start gap-3">
            <pre className="min-w-0 flex-1 overflow-x-auto bg-canvas px-3 py-2 font-mono text-sm">
              <code translate="no">{state.key}</code>
            </pre>
            <CopyButton text={state.key} label="Copy" />
          </div>
        </div>
      )}
    </>
  );
}
