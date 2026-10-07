<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UseChangelog

Changelog and product announcements for small teams: a public changelog page and an embeddable "What's new" widget. Global market, USD, self-serve. Code, commits and UI copy are in English.

## Product rules

This list is the source of truth. The skills in `.agents/skills/` add implementation detail and don't restate these rules.

- **Account model:** one account, one workspace. No teams, no organizations.
- **Public page:** the slug lives in the path (`usechangelog.com/{slug}`), never in a subdomain.
- **Auth:** Neon Managed Better Auth with magic link only. No passwords, SSO or social login. See `.agents/skills/auth`.
- **Billing:** Polar, never Stripe. One monthly plan. The price is never hardcoded in code or copy; it comes from Polar. See `.agents/skills/polar-billing`.
- **Paywall:** sign-up is free. Publishing, the public page and the widget require a subscription in state `active`. A free trial counts as `active`; whether there is one, and how long, is set on the product in Polar, never in code. `past_due`, `canceled` and `none` can't publish.
- **Out of scope:**
  - waitlist, voting, comments, reactions
  - RSS or feeds, email digests, scheduled posts
  - custom domains, unread badge
  - teams or roles, SSO or social login
  - Stripe, or a free tier that publishes without a subscription
  - Check `.agents/skills/mvp-scope` for what *is* in before adding a feature.
- **Language:** the app, landing, legal pages and public page are English only. Posts are never translated. The one exception is the widget chrome (its button, title, tags and dates): English by default, or Spanish, Portuguese, French or German, chosen per workspace in settings (`lib/widget/copy.ts`).

## Code conventions

- **Bun, never npm:** `bun install`, `bun add`, `bun run <script>`, `bunx`. `bun.lock` is the only lockfile.
- **SSR first:** read data in Server Components and write it with Server Actions posted from plain forms. Use a client component only for a small interactive island (a pending button, a toggle), and prefer a server form over a client UI library.
- **Access checks in pages, not layouts:** every page and Server Action under `/app` calls `requireUser()` or `requireWorkspace()` itself. Layouts don't re-run on client navigation and don't stop nested routes from rendering, so a layout check protects nothing.
- **Migrations in an open PR:** if a migration hasn't reached `main`, change it by regenerating it (delete the file, its snapshot and its journal entry, then `bun run db:generate`) instead of stacking a fix-up migration. Re-apply it on `develop` only after telling the owner, since local dev and previews share that database; never drop or alter tables there while the owner is using the app.
- **The `develop` Neon branch is permanent:** local dev and previews share it. Create or recreate it with `neonctl branches create --name develop --parent production` (no expiration), never from the Neon console, whose "Automatically delete branch after" is on by default and deleted the previous one after a day. Protect it in Neon if the plan allows.
- **Env vars are checked before deploying:** `vercel-build` runs `bun run check-env` (`scripts/check-env.ts`) first. Add every new required var there with its expected format.
- **No env vars at import time:** create clients (auth, database, SDKs) on first use, so `bun run build` passes without secrets.

## Verifying changes

- **Checks:** `bun run check` runs lint, typecheck and build. `bun run test` runs the tests (`bun test`, files named `*.test.ts`). CI runs all four as separate jobs on every PR.
- **Verifier:** the `verifier` agent (`.cursor/agents/verifier.md`, linked for Claude Code at `.claude/agents/verifier.md`) runs these checks and reports the result without changing code.
- **Runtime:** for runtime behavior in `next dev`, use the `next-dev-loop` skill.

## Pull requests

- One branch and one PR per issue, opened from an up-to-date `main`.
- PRs are ready for review, never draft. Don't merge; the owner merges.
- Fill in `.github/pull_request_template.md`: the Vercel preview URL and `Closes #<issue>` for every issue it resolves, so GitHub closes them on merge.
- Issues follow `.github/ISSUE_TEMPLATE/` and the `write-issue` skill.
- To develop an issue, follow the `develop-issue` skill. It covers the plan checkpoint, the preview verification, simplify, code review and the README update.

## Skills

Every project skill ends with an **improvements** step. It looks back at the result, the process and the skill itself, lists concrete improvements, and asks the owner which to apply. Apply only the ones the owner approves.

This also applies to vendored skills like `next-dev-loop`, which we don't edit, so the hash in `skills-lock.json` stays valid.
- Never commit secrets, `node_modules` or `.env*` files. The one exception is `.env.example`, which lists every env var name with no values.
