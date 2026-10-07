---
name: polar-billing
description: How UseChangelog bills with Polar. Use when working on checkout, the Polar webhook, subscription state, the customer portal, or anything gated on having an active subscription (publishing, public page, widget).
---

# Polar billing

The billing rules (Polar only, one monthly plan, sign-up free, only `active` publishes) are in `AGENTS.md` → **Product rules**. This skill is how to implement them. Read the current Polar docs before writing code; this isn't their API reference.

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

- **Product:** reference it by an env var. If the price or the free trial has to be shown, read it from Polar.
- **Free trial:** optional, set on the product in Polar. Polar's `trialing` maps to `active` (it publishes); the webhook stores the trial's end so the billing page can show it.
- **Checkout:** start it from the signed-in app with the workspace owner's identity. Pass our account or workspace id so the webhook can map back to it.
- **Webhook:**
  - It is the only writer of subscription state.
  - Verify the signature with the webhook secret before reading the payload. Reject unsigned or invalid requests.
  - Handlers must be idempotent, because Polar retries deliveries.
- **Stored state:** one per workspace: `active | past_due | canceled | none` (`none` means no subscription yet). Map Polar's status in a single function; `trialing` is `active`, and anything not clearly active or past due is `canceled`.
- **Gate:** check the stored state in one place, server-side. For `past_due`, show a banner that links to the portal. Drafts stay editable in every state.
- **Customer portal:** the only place to change the payment method or cancel. Link to it from the app; don't build our own billing UI.
- **Env vars:** access token, webhook secret and product id.

## Not in the MVP

Coupons, multiple plans, annual billing, usage-based billing, seat pricing.

## Final step: improvements

Before finishing, look back at the result, at how the work went, and at this skill. List up to 5 concrete improvements, each with what would change and why. Ask the owner which ones to apply. Apply only those; if they want none, stop.
