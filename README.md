# UseChangelog

Changelog and product announcements for small teams: publish what shipped and what's coming on a public page and an embeddable widget.

> The current site is a placeholder landing, not the product yet.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

CI runs lint, typecheck and build as separate jobs on every pull request and on pushes to `main` (`.github/workflows/ci.yml`). To run the same checks locally:

```bash
npm run check
```

`typecheck` runs `next typegen` first so route types like `LayoutProps` exist before `tsc --noEmit`.

## Deploy

Production (Vercel): https://usechangelog-xi.vercel.app

Every pull request gets its own Vercel preview deployment.
