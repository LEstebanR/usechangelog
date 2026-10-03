// Our own confirmation: no browser dialog, no JS. "Delete post" opens an inline
// panel holding the real delete button; the same toggle reads "Cancel" while open.
export function DeletePost({ action }: { action: () => Promise<void> }) {
  return (
    <details className="group flex w-full max-w-sm flex-col items-end">
      <summary className="cursor-pointer list-none text-sm font-medium text-clay hover:underline group-open:text-ink [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Delete post</span>
        <span className="hidden group-open:inline">Cancel</span>
      </summary>
      <div role="alertdialog" aria-labelledby="delete-title" className="mt-3 w-full border border-clay/30 bg-clay-wash p-4">
        <p id="delete-title" className="font-medium text-clay">Delete this post?</p>
        <p className="mt-1 text-sm text-clay">
          It disappears from your changelog and widget. This can&apos;t be undone.
        </p>
        <form action={action} className="mt-4">
          <button
            type="submit"
            className="motion-press bg-clay px-3 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Yes, delete it
          </button>
        </form>
      </div>
    </details>
  );
}
