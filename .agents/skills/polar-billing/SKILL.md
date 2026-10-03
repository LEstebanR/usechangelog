---
name: polar-billing
description: How UseChangelog bills with Polar. Use when working on checkout, the Polar webhook, subscription state, the customer portal, or anything gated on having an active subscription (publishing, public page, widget).
---

# Polar billing

UseChangelog has one monthly plan, sold through Polar. There is no Stripe. Read the current Polar docs before writing code. This skill is our rules, not their API reference.

## Docs to read first

- **Index of all pages:** https://polar.sh/docs/llms.txt
- **Next.js adapter (`@polar-sh/nextjs`):** https://polar.sh/docs/integrate/sdk/adapters/nextjs.md
- **Checkout:** https://polar.sh/docs/features/checkout/session.md
- **Webhooks:**
  - Setup: https://polar.sh/docs/integrate/webhooks/endpoints.md
  - Validation and delivery: https://polar.sh/docs/integrate/webhooks/delivery.md
  - Events: https://polar.sh/docs/integrate/webhooks/events.md
- **Subscriptions and failed payments:**
  - https://polar.sh/docs/features/subscriptions/introduction.md
  - https://polar.sh/docs/features/subscriptions/failed-payments.md
- **Customer portal:** https://polar.sh/docs/features/customer-portal/introduction.md
- **Local webhooks with the Polar CLI:** https://polar.sh/docs/integrate/cli/webhooks.md

## Our rules

- **One product, one monthly price.** Reference the product by an env var. Never hardcode the price in code or copy; read it from Polar if it has to be shown.
- **Checkout:** start it from the signed-in app with the workspace owner's identity. Pass our account or workspace id so the webhook can map back to it.
- **Webhook:**
  - It is the only writer of subscription state.
  - Verify the signature with the webhook secret before reading the payload. Reject unsigned or invalid requests.
  - Handlers must be idempotent, because Polar retries deliveries.
- **Stored state:** keep exactly one state per workspace, one of `active | past_due | canceled | none`.
  - `none` means no subscription yet.
  - Map Polar's subscription status into these four and keep the mapping in one function.
  - Anything not clearly active or past due counts as `canceled`.
- **Gate:** only `active` can publish posts, serve the public page and serve the widget.
  - `past_due` doesn't publish. Show a banner that links to the portal.
  - Drafts stay editable in every state.
- **Customer portal:** the only place to change the payment method or cancel. Link to it from the app; don't build our own billing UI.
- **Secrets:** access token and webhook secret live in env vars, documented in `.env.example`, never committed.

## Out of scope

Trials, coupons, multiple plans, annual billing, usage-based billing, seat pricing.
