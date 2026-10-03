---
name: mvp-scope
description: What the UseChangelog MVP includes. Use before adding or changing any feature, copy or data model, and when a request mentions waitlists, voting, comments, RSS, digests, custom domains, unread badges, teams, SSO, Stripe or translations.
---

# UseChangelog MVP scope

The product rules and the out-of-scope list live in `AGENTS.md` → **Product rules**. That list is the source of truth. This skill lists what *is* in the MVP, so you can check a change against it.

## In

- **Account:** Magic link sign-in (see `auth`) creates one workspace with a unique slug.
- **Posts:**
  - Markdown body, one tag: New, Improved or Fixed.
  - States `draft` and `published`. Drafts are never public.
- **Public page:** `usechangelog.com/{slug}` lists the workspace's published posts, newest first.
- **Widget:** one script tag that shows the latest published posts in a "What's new" panel.
- **Billing:** one monthly plan through Polar, gating publishing, the page and the widget (see `polar-billing`).
- **Landing and legal:** a marketing page with a sign-up CTA, plus privacy and terms pages.

## When a change isn't on this list

- Check the open issues; they are the backlog.
- If the change needs something from the out-of-scope list in `AGENTS.md`, stop and ask the owner. Don't build a smaller version of it on your own.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
