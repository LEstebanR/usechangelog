"use client";

// Its own form (forms can't nest), with a confirm before the post is gone for good.
export function DeletePost({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this post? This can't be undone.")) event.preventDefault();
      }}
    >
      <button type="submit" className="text-sm font-medium text-clay hover:underline">
        Delete post
      </button>
    </form>
  );
}
