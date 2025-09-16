# Before/After Embed (SaaS)

## Quick start (local)
1. Copy `.env.example` to `.env` and set `FAL_KEY`.
2. `npm i`
3. `npm run dev`
4. Open `http://localhost:3000`

## Vercel deployment
- Set env vars in Vercel Project Settings:
  - `FAL_KEY`: your fal.ai API key
  - `ALLOWED_ORIGINS`: `*` or a comma-separated list of site origins
- Serverless functions:
  - `GET /api/health`
  - `GET /api/embed/:id`
  - `POST /api/edit`
  - `POST /api/usage`
- Static assets are served from `public/` via `vercel.json` routes.

## Embed snippet (for customers)
```html
<script async src="https://YOUR-DOMAIN/embed.js"
  data-embed-id="demo-barber"
  data-theme="light"
  data-width="100%"
  data-height="520px"
  data-vertical="barber"></script>
```

- `data-embed-id` is provisioned per customer.
- Optional overrides: `data-theme`, `data-width`, `data-height`, `data-vertical`.

## Billing/usage (MVP)
- Server logs `edit_success` and `edit_error` events in-memory.
- Replace with a database + metering in production.
# Trigger fresh deployment
