---
name: develop-issue
description: The full process to develop a UseChangelog issue, from reading it to a PR ready for review. Use whenever asked to develop, implement, build or start an issue (e.g. "desarrolla el #4", "start issue 5"), and to resume one already in progress.
---

# Develop an issue

Goal: a PR, ready for review and not merged, that meets every "Hecho cuando" item of the issue, verified on its Vercel preview. Work in the order below. **Steps 3 and 10 are checkpoints:** stop and wait for the owner.

## 1. Check it can start

- **The issue is approved.** The owner said so in this conversation, or the issue says so. If not, stop and ask.
- **Its dependencies are done.** For every `#n` under "Depende de", the issue is closed, or its PR is merged into `main`. If one is missing, stop and say which.
- **Its infrastructure is ready.** If the issue needs external services or env vars (look for a "Lo hace el owner" section), check them before planning: `vercel env ls` for env var names, and the vendor's dashboard or CLI for services. List what's missing in the plan as owner steps, with exact commands, so the owner can do them while you code.
- **Auth on the preview.** If the PR touches sign-in or `/app` and will be checked on its preview, add an owner step to the plan: in Neon, on the branch previews use, Better Auth → Domains → `https://usechangelog-git-<branch>-lestebanrs-projects.vercel.app`. Neon has no wildcard that covers preview URLs.
- **Resuming:** if a branch or PR for this issue already exists, continue there; don't start over.

## 2. Read before writing code

- The issue, in full.
- `AGENTS.md`: product rules and conventions.
- The project skills that apply: `mvp-scope` always, plus `polar-billing` for billing and the auth skill for auth.
- For Next.js APIs, the guide in `node_modules/next/dist/docs/`. This Next.js version differs from older training data.
- For other vendors, their current docs. Never guess an API.

## 3. Plan → checkpoint

- Branch from an up-to-date `main`. The name is `<type>/<issue>-<short-slug>`, for example `feat/4-auth`.
- Write a short plan: one line per step, each with how it will be verified.

  ```
  1. <step> → verificar: <check>
  2. <step> → verificar: <check>
  ```

- Call out assumptions and any point where the issue leaves room for more than one reading.
- **Show the plan to the owner and wait for an OK.** Don't write product code before that.

## 4. Implement

- **Follow the plan.** Make small commits with clear English messages and the attribution lines the session asks for.
- **Stay inside the issue.** If you find something broken or odd outside it, mention it in the report; don't fix it.
- **Decisions belong to the owner.** If the work needs a change to a decision in the issue (a different tool, schema or route), stop and ask before doing it.
- **No secrets in git.** New env var names go in `.env.example`, without values.

## 5. Verify locally

- Run the `verifier` agent, or the same commands it runs: lint, typecheck, build, and tests if they exist. Everything must pass.
- For runtime behavior, use the `next-dev-loop` skill against `next dev`.
- For anything behind sign-in, `bun run smoke <email> [base-url]` signs in with a real magic link (you paste it from the email) and checks `/app` and onboarding. It reuses the saved session, so it only spends a Neon email when the session has expired; don't sign in by hand for each check. It never writes to the database.

## 6. Open the PR and verify on the preview

- **Open the PR:** push, then open it with `.github/pull_request_template.md` filled in: `Closes #<issue>`, the Vercel preview URL, what changes and how it was tested. It is ready for review, never draft.
- **Wait for checks:** wait for CI (lint, typecheck, build, test) and for the Vercel preview to be Ready.
- **Check every item:** go through each "Hecho cuando" item **on the preview** and record the result in the PR description. Explain any item that isn't met.

## 7. Simplify and review

1. **Simplify:** run the `simplify` skill on the branch diff and apply its fixes.
2. **Code review:** run the `code-review` skill on the PR. Fix confirmed bugs. If a finding would change the issue's scope or a decision, ask the owner instead.
3. **Re-check:** run step 5 again, push, and confirm CI is still green.

In Cursor, where these skills don't exist, do the same review by hand: reuse, simplification, efficiency, then a correctness pass.

## 8. Update the README

If the change affects something `README.md` documents, update it in the same PR. That covers:
- Status;
- Tech stack: a "Planned" row that is now "In use";
- Project structure;
- Scripts;
- Environment variables;
- Deployment;
- Roadmap.

## 9. Report

Tell the owner:
- the PR link;
- the status of each "Hecho cuando" item;
- what simplify and code-review changed;
- any deviation from the issue, and why.

**Never merge:** the owner merges.

## 10. Improvements → checkpoint

Look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Examples: code that could be simpler, a missing test, a step in this skill that slowed things down, an issue that was unclear.

Ask the owner which ones to apply. Apply only those. If they want none, stop there.
