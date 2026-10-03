---
name: clerk-auth
description: How UseChangelog uses Clerk. Use when working on sign-up, sign-in, the session, protecting /app routes, or reading the current user in the Next.js App Router.
---

# Clerk auth

The auth rules (Clerk magic link only, one account and one workspace, no teams or SSO) are in `AGENTS.md` → **Product rules**. This skill is how to implement them. Read the current Clerk docs before writing code; this isn't a copy of their guide.

## Docs to read first

- **Next.js quickstart (App Router):** https://clerk.com/docs/nextjs/getting-started/quickstart
- **`clerkMiddleware()`:** https://clerk.com/docs/references/nextjs/clerk-middleware. In Next 16 the file is `proxy.ts`; check `node_modules/next/dist/docs/` too.
- **`auth()` in server code:** https://clerk.com/docs/references/nextjs/auth
- **Sign-up and sign-in options, where email link is enabled:** https://clerk.com/docs/authentication/configuration/sign-up-sign-in-options
- **Email link custom flow, only if prebuilt components aren't enough:** https://clerk.com/docs/guides/development/custom-flows/authentication/email-links

## Our rules

- **Dashboard:** enable only email address with email link. Leave passwords, OAuth, SAML and organizations off.
- **Routes:**
  - Everything under `/app` requires a session. Protect it in `proxy.ts` with `clerkMiddleware()`, and check again with `auth()` in server code that reads or writes data.
  - The landing, the legal pages, `/{slug}` and the widget endpoint are public. Public pages are still gated by the workspace subscription (see `polar-billing`), not by auth.
- **Workspace:** create it on first sign-in, keyed by the Clerk user id. Don't model it with Clerk organizations.
- **Ownership:** read the user id on the server (`auth()`) for every write, never from the client.
- **Env vars:** the Clerk publishable and secret keys.

## Not in the MVP

Invitations, account linking, multi-factor flows beyond Clerk's defaults.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
