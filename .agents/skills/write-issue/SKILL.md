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

Title: `<n>. <Short outcome>`, keeping the existing numbering. The body is in Spanish; code, paths and identifiers stay in English.

```markdown
<One or two lines: what this unlocks and why it comes now.>

## 1. Decisión            ← only if the issue picks a tool or approach
- Options table (rows: the criteria that matter here)
- What we chose and why (numbered)
- What we accept in exchange

## 2. Alcance
Grouped by area (A, B, C…). Concrete: packages, files, routes, env vars,
config values. Say what is read-only or must not be touched.

## 3. Hecho cuando
- [ ] Checkboxes, each one observable by a person or a check
- [ ] Verified on the PR's Vercel preview, not only locally
- [ ] CI green; no secrets in git
- [ ] What the PR description must document

## 4. Fuera
What a developer might reasonably add but must not, each with where it goes instead.

## 5. Impacto en otros issues   ← if this changes another issue or open PR
## 6. Riesgos                    ← risk | mitigation table, if any
## Referencias                   ← links to the docs used for decisions
```

## Rules

- **Specific:** write "15-minute magic link expiry, sign-up on", not "configure auth". Write "`/app` redirects to `/sign-in`", not "protect routes".
- **One outcome per issue.** If "Hecho cuando" needs two unrelated demos, split the issue.
- **Testable criteria:** every item can be checked as true or false. No "works well" or "looks good".
- **No invented facts:** if something can't be confirmed before implementing, like an exact table name, say so and make confirming it part of the work.
- **Changing a decision:** if a rewrite changes a decision from the previous version, say so at the top in one line, and list the affected issues and PRs in "Impacto".

## Publishing

- **New issue:** `gh issue create --title "<n>. …" --body-file <file>`.
- **Rewrite:** `gh issue edit <n> --title … --body-file <file>`.
- **Approval first:** don't start development in the same turn. The owner reads and approves the issue first.
