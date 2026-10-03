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
- **Auth:** Clerk with magic link only. No SSO, no social login. See `.agents/skills/clerk-auth`.
- **Billing:** Polar, never Stripe. One monthly plan. The price is never hardcoded in code or copy; it comes from Polar. See `.agents/skills/polar-billing`.
- **Paywall:** sign-up is free. Publishing, the public page and the widget require a subscription in state `active`. `past_due`, `canceled` and `none` can't publish.
- **Out of scope:**
  - waitlist, voting, comments, reactions
  - RSS or feeds, email digests, scheduled posts
  - custom domains, unread badge
  - teams or roles, SSO or social login
  - Stripe, trials or a free tier that publishes
  - Check `.agents/skills/mvp-scope` for what *is* in before adding a feature.
- **Language:** the app, landing, legal pages and public page are English only. Posts are never translated. The one exception is the widget chrome: English by default, Spanish with `lang="es"` on the snippet.

## Verifying changes

- **Checks:** `npm run check` runs lint, typecheck and build. CI runs the same three as separate jobs on every PR. Tests run with `npm test` once that script exists.
- **Verifier:** the `verifier` agent (`.cursor/agents/verifier.md`, linked for Claude Code at `.claude/agents/verifier.md`) runs these checks and reports the result without changing code.
- **Runtime:** for runtime behavior in `next dev`, use the `next-dev-loop` skill.

## Pull requests

- One branch and one PR per issue, opened from an up-to-date `main`.
- PRs are ready for review, never draft. Don't merge; the owner merges.
- The PR description includes the Vercel preview URL and `Closes #<issue>` for every issue it resolves, so GitHub closes them when the PR is merged.
- Never commit secrets, `node_modules` or `.env*` files. The one exception is `.env.example`, which lists every env var name with no values.
