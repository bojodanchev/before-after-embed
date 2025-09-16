# Before/After Embed (SaaS)

## Quick start (local)
1. Copy `.env.example` to `.env` and set `FAL_KEY`.
2. `npm i`
3. `npm run dev`
4. Open `http://localhost:3000`

## Qualitative feedback toolkit
- The marketing site now opens a lightweight feedback prompt after someone interacts with the live demo or hovers on pricing. Responses are posted to `/api/feedback` and logged in the server console.
- Update the Calendly/meeting URL in `before_after_saa_s_landing_react_tailwind.jsx` (`discoveryCallLink`) if you need a different booking page.
- Use `docs/demo-followup-template.md` for an email/DM script when checking in with demo visitors who paused.
- To get email alerts from feedback submissions, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, and `FEEDBACK_NOTIFY_EMAIL` in your environment.

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
