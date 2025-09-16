# Before/After Embed (SaaS)

## Quick start (local)
1. Copy `.env.example` to `.env` and set `FAL_KEY`.
2. `npm i`
3. `npm run dev`
4. Open `http://localhost:3000`

## Analytics & session recordings
- The marketing site now loads PostHog when `VITE_POSTHOG_KEY` (or `NEXT_PUBLIC_POSTHOG_KEY`) is set. Add the key plus optional host (`VITE_POSTHOG_HOST` / `NEXT_PUBLIC_POSTHOG_HOST`) to your `.env` or Vercel project settings.
- Events fired: `landing_view`, `demo_start` (with steps), `demo_generate` (`requested`, `success`, `error`, `missing_file`), `cta_click`, `pricing_select`, and `lead_capture` helper.
- Session recordings are enabled with inputs masked by default. Use the `data-ph-mask` attribute to force masking specific elements if you add forms.
- After updating env vars, restart `npm run dev` (or redeploy) so Vite picks up the PostHog configuration.

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
