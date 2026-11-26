"use client";

import { useActionState } from "react";
import type { ApiKeyState } from "@/lib/api/actions";
import { secondaryButtonClass } from "../../form-styles";
import { SubmitButton } from "../../submit-button";
import { CopyButton } from "../copy-button";

// Creates or rotates the project's API key (#86) and shows the new key, only this once:
// we keep its hash, never the key.
export function ApiKeyForm({
  action,
  hasKey,
}: {
  action: (state: ApiKeyState, formData: FormData) => Promise<ApiKeyState>;
  hasKey: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <>
      {state.key && (
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
      <form action={formAction}>
        <SubmitButton pendingLabel="Creating…" className={`${secondaryButtonClass} py-2 text-sm`}>
          {hasKey ? "Rotate key" : "Create API key"}
        </SubmitButton>
      </form>
    </>
  );
}
