---
name: clerk-auth
description: How UseChangelog uses Clerk. Use when working on sign-up, sign-in, the session, protecting /app routes, or reading the current user in the Next.js App Router.
---

# Clerk auth

Auth is Clerk with **magic link (email link) only**. Read the current Clerk docs before writing code. This skill is our rules, not a copy of their guide.

## Docs to read first

- **Next.js quickstart (App Router):** https://clerk.com/docs/nextjs/getting-started/quickstart
- **`clerkMiddleware()`:** https://clerk.com/docs/references/nextjs/clerk-middleware. In Next 16 the file is `proxy.ts`; check `node_modules/next/dist/docs/` too.
- **`auth()` in server code:** https://clerk.com/docs/references/nextjs/auth
- **Sign-up and sign-in options, where email link is enabled:** https://clerk.com/docs/authentication/configuration/sign-up-sign-in-options
- **Email link custom flow, only if prebuilt components aren't enough:** https://clerk.com/docs/guides/development/custom-flows/authentication/email-links

## Our rules

- **Methods:**
  - Email address with email link is the only method enabled in the Clerk dashboard.
  - No passwords, no OAuth or social providers, no SSO or SAML, no organizations.
- **Routes:**
  - Everything under `/app` requires a session. Protect it in `proxy.ts` with `clerkMiddleware()`, and check again with `auth()` in server code that reads or writes data.
  - The landing, the legal pages, `/{slug}` and the widget endpoint are public. Public pages are still gated by the workspace subscription (see `polar-billing`), not by auth.
- **Account model:** one Clerk user owns one workspace.
  - Create the workspace on first sign-in, keyed by the Clerk user id.
  - Don't use Clerk organizations to model it.
- **Ownership:** read the user id on the server (`auth()`) for every write, never from the client.
- **Secrets:** Clerk keys live in env vars, documented in `.env.example`, never committed.

## Out of scope

Teams, invitations, roles, account linking, multi-factor flows beyond Clerk's defaults.
