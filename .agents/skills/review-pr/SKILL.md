---
name: review-pr
description: Code review of a UseChangelog change against the project's own rules (AGENTS.md). Use whenever reviewing a PR, a branch or the current diff in this repo, for "revisa el PR", "code review", "LGTM?", and as the code review step of develop-issue. Use it instead of the generic code-review plugin.
---

# UseChangelog code review

Review a change against `AGENTS.md` → Product rules and Code conventions. Those are the source of truth; this skill says what to look for in a diff and doesn't restate them. When a rule here and `AGENTS.md` disagree, `AGENTS.md` wins and this skill gets fixed.

## 1. Gather

- **The diff:** `gh pr diff <n>` for a PR, otherwise `git diff main...HEAD` plus `git diff HEAD` for uncommitted work. Skip generated files (`db/migrations/meta/*`, `bun.lock`) except to check they changed when they should.
- **The issue:** the PR's `Closes #n`. Read its "Hecho cuando" and "Fuera": a change outside them is a finding.
- **Context:** read the whole file around each hunk, not only the hunk, and the callers of anything whose signature changed.

## 2. Checklist

### Blocking

- **Scope:** the change adds something `AGENTS.md` or the `mvp-scope` skill rules out (voting, comments, RSS, custom domains, teams, Stripe, a third auth method, translated posts…), or something outside the issue.
- **Access checks:** every new page and Server Action under `/app` calls `requireUser()`, `requireWorkspace()` or, for staff, `requireAdmin()` itself, first, before reading the form or the database. A check in a layout protects nothing. An admin page or action must 404 for anyone else, not redirect.
- **Trusting the client:** who the user is, which workspace and which account come from the session, never from a form field or the URL. An id from a form is validated (`UUID` in `lib/uuid.ts`) and the query scopes it to what the user owns.
- **Billing and paywall:** Polar only; Pro's price is never in code or copy; project limits come from `lib/billing/plans.ts` and `projectLimit`; a free trial is never decided in code; `past_due`, `canceled` and `none` are Free. A new gate on publishing must reuse the existing rule, not a second copy of it.
- **Public surface:** the slug is in the path, never a subdomain. A prefix rule (robots `Disallow`, the proxy `matcher`, a rewrite) is anchored so `/app` doesn't catch `/apple`, with a test using a lookalike slug. Private data (feedback, emails, unpublished posts, projects over the plan's limit) never reaches the public page, the widget API or the sitemap.
- **Migrations:**
  - A migration that drops or renames something the current code reads breaks production during `vercel-build`. Flag it unless it's the second PR of a two-step change, or the owner accepted the window in the PR.
  - If the PR stacks a fix-up migration on another migration that isn't in `main`, it should be regenerated instead.
  - A hand-written `sql` with an enum, a `CASE` or a cast was run once against `develop`, and the PR says so. CI has no database.
  - Another open PR adds a migration with the same number (`gh pr list`, then each PR's `db/migrations/`). Both reach `develop` on push, so agree the merge order now: the one with the lower journal `when` merges first, and the other is renumbered keeping its SQL and its `when`, with its snapshot chained to `main`'s. Regenerating it would give it a new `when`, and `develop` would try to apply it again.
- **Env vars:**
  - A new `process.env.X` must be in `scripts/check-env.ts` with its format and in `.env.example` with no value.
  - No client, SDK or env read at import time.
  - No secret in git.
- **Security:**
  - `dangerouslySetInnerHTML` on user content.
  - Unescaped Markdown or HTML on the public page or the widget.
  - A `mailto:` or `href` built from user input without validating it.
  - A new public endpoint without the same limits as its neighbours (rate limit, size).
  - A public endpoint that reads the whole body (`request.text()`, `request.json()`) before checking its size: a chunked request has no `Content-Length`, so read it with a cap, as `app/api/v1/posts/route.ts` does.
  - A `fetch` to an outside API in a build or a script (`check-env`, `vercel-build`) without a timeout (`AbortSignal.timeout`): a hung API holds the build until Vercel's own limit.
  - A user's personal data (email, name) in a log line, including a vendor's error message that may echo it back. Log an id instead, or redact it.

### Should fix

- **SSR first:**
  - A client component that a Server Component plus a plain form would cover.
  - `"use client"` on more than the small island that needs it.
  - A client UI library where a server form works.
- **Next.js version:** an API used the way older Next.js worked. Check `node_modules/next/dist/docs/` for anything you aren't sure of (e.g. `PageProps`, `searchParams` as a promise, `revalidatePath` and `redirect` in actions).
- **Language:**
  - App, landing and legal copy is in English.
  - Strings around posts on the public page or the widget go through `lib/changelog/copy.ts` or `lib/widget/copy.ts`, in all five languages.
  - Post content is never translated.
- **Tests:**
  - New pure logic (a parser, a label table, a rule) has a co-located `*.test.ts`.
  - A parser of Markdown that looks for headings or fields line by line skips code fences (``` and ~~~): a `# comment` in a code block is not a heading. Test it with one.
  - Queries are tested from their SQL (`.toSQL()`), with no database (see `lib/posts/server.test.ts`).
  - A test that the types already guarantee adds nothing.
- **Reuse:** before accepting a new helper, grep for the existing one: `oneOf` (`lib/posts/form.ts`), `UUID` (`lib/uuid.ts`), `redirectWithNotice` (`lib/notice.ts`), `dateTime` (`lib/admin/format.ts`), `requireAdmin` (`lib/auth/roles.ts`).
- **Data integrity:**
  - Writes that two requests can race (counts, limits, "first one wins") need a lock or a single statement, like `insertFeedback`.
  - A timestamp that records when something happened shouldn't be overwritten by a later unrelated write.
- **Tooling:**
  - Bun only. `bun.lock` is the only lockfile.
  - Versions are exact (no `^`).

### Docs freshness (suggestion)

| The change | Update |
|---|---|
| A route, table, script, env var or deploy step | `README.md` (Project structure, Scripts, Environment variables, Deployment) |
| An issue finished | `README.md` → Roadmap row |
| A product rule or convention | `AGENTS.md`, plus the skills that restate it |
| A new skill | its symlink in `.claude/skills/` |

## 3. Verify each finding

Before reporting, confirm each finding against the code: read the caller, run the test, or run the query once against `develop` (read-only, or inside a `db.batch` that fails so it rolls back). Drop what you can't confirm, or list it under questions. Say how each one was confirmed.

## 4. Report

```markdown
## Summary
[1–3 sentences: what changed and the risk: low / medium / high]

## Blocking
- [file:line — the problem — the concrete failure — how it was confirmed]

## Should fix
- [file:line — the problem — the simpler or safer form]

## Suggestions (non-blocking)
- [optional improvement]

## Questions
- [what needs the owner's context]
```

Omit empty sections. Be direct and specific. Don't flag style that lint already enforces, or preferences.

## 5. Acting on findings

When the review runs as part of developing the issue:

- **Blocking and should fix:** fix them before pushing, then run `bun run check` again.
- **A fix that changes the issue's scope or a decision:** ask the owner instead.
- **Suggestions:** don't apply them silently and don't drop them. List them and ask the owner whether to apply them in this PR or in another one.

## 6. Improvements

Look back at the result, at how the review went, and at this skill. List up to 5 concrete improvements, each with what would change and why: a check that caught nothing, a rule that's missing, a finding that slipped through. Ask the owner which to apply. Apply only those; if they want none, stop.
