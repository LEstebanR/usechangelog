---
name: mvp-scope
description: What the UseChangelog MVP includes. Use before adding or changing any feature, copy or data model, and when a request mentions waitlists, voting, comments, RSS, digests, custom domains, unread badges, teams, SSO, Stripe or translations.
---

# UseChangelog MVP scope

The product rules and the out-of-scope list live in `AGENTS.md` → **Product rules**. That list is the source of truth. This skill lists what *is* in the MVP, so you can check a change against it.

## In

- **Account:** Magic link or Google sign-in (see `auth`), then onboarding creates the first project (`workspaces` in code) with a unique slug. More projects up to the plan's limit, picked in `/app`'s header (#65). A project can be deleted, but not the last one; deleting the account deletes all of them and their posts (#31).
- **Posts:**
  - Title and a Markdown body.
  - A category (New, Improved or Fixed) and a type (Shipped, or Coming for what's on the way).
  - States `draft` and `published`. Drafts are never public. The publish date is set on the first publish and can be edited.
- **Public page:** `usechangelog.com/{slug}` lists the project's published posts, newest first.
- **Widget:** one script tag that shows the latest published posts in a "What's new" panel.
- **Billing:** Free publishes 1 project, Pro (monthly, through Polar, with an optional free trial set in Polar) up to 3. The plan is the account's and decides which projects publish, the page and the widget (see `polar-billing`).
- **Landing and legal:** a marketing page with a sign-up CTA, plus privacy and terms pages.

## When a change isn't on this list

- Check the open issues; they are the backlog.
- If the change needs something from the out-of-scope list in `AGENTS.md`, stop and ask the owner. Don't build a smaller version of it on your own.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
