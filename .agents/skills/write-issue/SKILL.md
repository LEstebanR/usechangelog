---
name: write-issue
description: How to write or rewrite a GitHub issue for UseChangelog so it can be developed without guessing. Use when asked to create, complete, fix or improve an issue, or to plan a piece of the MVP as an issue.
---

# Write an issue

An issue is ready when someone can develop it without asking questions, and the owner can approve or reject its decisions by reading it.

## Before writing

1. **Read the rules.** `AGENTS.md` → Product rules is the scope. Don't write an issue for something listed there as out of scope.
2. **Read the neighbors.** `gh issue list --state open`, then `gh issue view <n>` for the issues before and after this one. Check:
   - **Order:** does this issue need something a later issue builds, like a table, an env var or a route? If so, move that piece here or reorder, and say why.
   - **Overlap:** is part of this already in another issue? Remove it from one of them.
3. **Verify external facts.** For any vendor, library or service (pricing, limits, domain requirements, APIs, Next.js version behavior):
   - Read the current docs (`WebFetch`/`WebSearch`, or `node_modules/next/dist/docs/` for Next.js).
   - Cite them in **References**.
   - Never state a limit or a price from memory.
4. **When there's a choice of tool or approach,** compare 2–3 real options against this project's constraints: `*.vercel.app` with no own domain, a solo developer, the MVP scope, the services we already use. Pick one and say what we give up.

## Structure

Use `.github/ISSUE_TEMPLATE/feature.md` for product work and `.github/ISSUE_TEMPLATE/bug.md` for bugs. Those templates are the source of truth for the structure, so don't restate them here.

- **Title:** `<n>. <Área>: <resultado>`, for example `3. Posts: crear, editar y publicar desde el app`. `<n>` is the priority order, not the GitHub number.
- **Priority label:** every issue gets one.
  - `P0`: core product and billing.
  - `P1`: needed before opening sign-up.
  - `P2`: after launch.

  Within a priority, dependencies set the order.
- **Language:** the body is in Spanish; code, paths and identifiers stay in English.
- **References:** point to other issues by their GitHub number (`#12`), never by the number in their title.
- **Sections:** "Depende de", "Decisiones", "Impacto" and "Riesgos" go in only when they apply.

## Rules

- **Specific:** write "15-minute magic link expiry, sign-up on", not "configure auth". Write "`/app` redirects to `/sign-in`", not "protect routes".
- **Owner steps apart:** anything only the owner can do (a vendor console, a marketplace integration, a secret, a DNS record) goes in a "Lo hace el owner" section, with the exact path or command. Verify console paths in the current docs, and give the API or CLI alternative when there is one, because consoles change.
- **One outcome per issue.** If "Hecho cuando" needs two unrelated demos, split the issue.
- **Testable criteria:** every item can be checked as true or false. No "works well" or "looks good".
- **No invented facts:** if something can't be confirmed before implementing, like an exact table name, say so and make confirming it part of the work.
- **Real names:** tables, columns, routes and functions that already exist are named exactly as in the code (`db/schema.ts` for columns, e.g. `published_on`, not `published_at`). Check them before writing.
- **Changing a decision:** if a rewrite changes a decision from the previous version, say so at the top in one line, and list the affected issues and PRs in "Impacto".
- **One owner per rule:** product rules live in `AGENTS.md`. Shared logic (a validator, a renderer, a gate function) belongs to one issue, and the others reuse it by name.
- **Order changes renumber:** if an issue now depends on a later one, or its priority changes, renumber the titles so the order holds, and update every "Depende de".

## Publishing

- **New issue:** `gh issue create --title "<n>. …" --body-file <file>`, with the body built from the template.
- **Rewrite:** `gh issue edit <n> --title … --body-file <file>`.
- **Approval first:** don't start development in the same turn. The owner reads and approves the issue first.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
