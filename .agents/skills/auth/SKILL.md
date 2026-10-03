---
name: auth
description: How UseChangelog signs users in with Neon Managed Better Auth and magic links. Use when working on sign-in, the session, protecting /app routes, reading the current user, or a foreign key to the user.
---

# Auth

The auth rules (magic link only, one account and one workspace, no teams, SSO or social login) are in `AGENTS.md` → **Product rules**. This skill is how we implement them. For the Neon API itself, use the vendored `neon-auth` skill and the current Neon docs; don't guess.

## How it's built

- **Provider:** Neon Managed Better Auth through `@neondatabase/auth`. Users live in the `neon_auth` schema of the branch's database.
- **Server only:** `lib/auth/server.ts` has `getAuth()`, `getUser()` (cached per request) and `requireUser()`. Clients are created on first use (`lazy()`), so `next build` runs without env vars. Don't create auth or DB clients at import time.
- **SSR first:** pages read the user on the server with `getUser()`. Sign-in and sign-out are Server Actions in `lib/auth/actions.ts`, posted from plain forms. There is no client auth SDK or auth UI library.
- **Routes:**
  - `/sign-in` sends the magic link with absolute callback URLs; Neon resolves relative ones against its own domain. A signed-in visitor on `/sign-in` goes to `/app`.
  - `/auth/callback` is where the link lands. It exchanges Neon's `neon_auth_session_verifier` for the session cookies (what Neon's client SDK does in the browser) and redirects to `/app`. The SDK middleware can't do it: it needs a challenge cookie that magic links never set.
  - An expired or used link lands on `/sign-in?error=` (`EXPIRED_TOKEN`, `INVALID_TOKEN`).
  - Trusted domains are per Neon branch. The branch previews use needs `https://usechangelog-*-lestebanrs-projects.vercel.app`.
  - `/signup` redirects to `/sign-in` (`next.config.ts`).
  - `/app/:path*` requires a session. `proxy.ts` redirects without one, but it skips Server Actions, so every page and action under `/app` calls `requireUser()`.
  - The landing, legal pages, `/{slug}` and the widget never load auth.
- **Ownership:** take the user id from `requireUser()` on the server for every write, never from the client.
- **Foreign keys:** reference `user.id` from `db/neon-auth.ts`. That file is read-only and stays out of `drizzle.config.ts`, so migrations never touch `neon_auth`.

## Neon settings (Console → Auth)

- **Magic Link** on, 15-minute expiry, new user registration on.
- No OAuth providers.
- Previews get their own auth per branch through the Vercel integration.

## Env vars

`NEON_AUTH_BASE_URL` (from the integration) and `NEON_AUTH_COOKIE_SECRET` (set by hand, at least 32 characters).

## Not in the MVP

Passwords, social login, SSO, MFA, passkeys, organizations, an account page. Custom SMTP and domain are #24.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
