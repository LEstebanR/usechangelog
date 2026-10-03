---
name: mvp-scope
description: UseChangelog MVP scope. Use before adding or changing any feature, copy or data model to check it's in the MVP, and when a request mentions waitlists, voting, comments, RSS, digests, custom domains, unread badges, teams, SSO, Stripe or translations.
---

# UseChangelog MVP scope

The MVP is small on purpose. If a change isn't in **In**, don't build it. Say it's out of scope and point to this file.

## In

- **Auth:** Clerk magic link. One account owns one workspace.
- **Workspace:** a unique slug, served in the path at `usechangelog.com/{slug}`.
- **Posts:**
  - Markdown body, tagged New, Improved or Fixed.
  - States `draft` and `published`. Drafts are never public.
- **Public page:** published posts of a workspace, newest first.
- **Widget:** one script tag that shows the latest published posts in a "What's new" panel. The chrome is English by default, Spanish with `lang="es"` on the snippet. Post content is shown as written.
- **Billing:** one monthly plan through Polar. Publishing, the public page and the widget require subscription state `active`. See the `polar-billing` skill.
- **Landing:** marketing page with a CTA to sign up.
- **Legal:** privacy and terms pages.

## Out

Don't add these, even partially or behind a flag:

- Waitlist, voting, comments, reactions.
- RSS or any feed, email digests or notifications to readers.
- Scheduled posts.
- Custom domains or subdomains per workspace.
- Unread badge or unread counts in the widget.
- Teams, organizations, roles, SSO, social login.
- Stripe or any payment provider other than Polar.
- Free tier that can publish, trials, or a hardcoded price.
- Translations of the app, landing, legal pages, public page or posts.

## When unsure

- Check the open issues in the repo. They are the backlog.
- If a request needs something from **Out**, stop and ask the owner. Don't pick a smaller version of it on your own.
