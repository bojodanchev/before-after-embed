import React from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";

const Code = ({ children }) => (
  <pre className="whitespace-pre-wrap break-words rounded-md bg-black/60 p-3 text-xs text-white">{children}</pre>
);

function Docs() {
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold">Before/After Embed — Documentation</h1>
        <p className="mt-2 text-sm opacity-80">Everything you need to integrate the widget, manage embeds, and go live.</p>

        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          {[
            ['#overview','Overview'],
            ['#quickstart','Quick Start'],
            ['#attributes','Attributes'],
            ['#examples','Examples'],
            ['#portal','Client Portal'],
            ['#billing','Billing & Plans'],
            ['#webhooks','Webhooks'],
            ['#api','API Endpoints'],
            ['#troubleshooting','Troubleshooting'],
          ].map(([href,label]) => (
            <a key={href} href={href} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-white hover:bg-white/20">{label}</a>
          ))}
        </nav>

        <section id="overview" className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="mt-2 text-sm opacity-80">The Before/After widget lets customers upload a photo and preview an AI‑generated after result (barber, dental, auto detailing, and more). You can embed it on any site with one script tag.</p>
        </section>

        <section id="quickstart" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Quick Start</h2>
          <p className="mt-2 text-sm opacity-80">Paste the script snippet where you want the widget to appear.</p>
          <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
        </section>

        <section id="attributes" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Attributes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><b>data-embed-id</b>: The id of the embed configured in your portal.</li>
            <li><b>data-theme</b>: <code>light</code> | <code>dark</code>.</li>
            <li><b>data-variant</b>: <code>compact</code> (Shadow DOM) | <code>card</code> (iframe for CSP pages).</li>
            <li><b>data-background</b> (card): <code>transparent</code> | <code>inherit</code> — blend with host page.</li>
            <li><b>data-max-width</b>, <b>data-width</b>, <b>data-height</b></li>
            <li><b>data-align</b>: <code>left</code> | <code>center</code> | <code>right</code></li>
            <li><b>data-radius</b>, <b>data-shadow</b>, <b>data-border</b></li>
          </ul>
        </section>

        <section id="examples" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Examples</h2>
          <h3 className="mt-3 font-medium">Shadow DOM (default)</h3>
          <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="dark">
</script>`}</Code>
          <h3 className="mt-4 font-medium">Iframe (CSP-safe)</h3>
          <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-variant="card"
  data-theme="light"
  data-background="transparent"
  data-max-width="500px"
  data-align="center">
</script>`}</Code>
        </section>

        <section id="portal" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Client Portal</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>Sign in with your email (magic link).</li>
            <li>Create an embed → choose vertical + theme (Light/Dark).</li>
            <li>Use quick actions: Copy Light/Dark snippet, Duplicate to opposite theme, Edit, Delete.</li>
            <li>Brand color (accent) is available on Growth/Pro plans.</li>
            <li>Preview parity ensures what you copy is what renders on your site.</li>
          </ul>
        </section>

        <section id="billing" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Billing & Plans</h2>
          <p className="mt-2 text-sm opacity-80">Free, Starter, Growth, Pro. Growth/Pro unlock custom brand color and higher limits. Stripe Checkout is used for subscriptions and top‑ups.</p>
        </section>

        <section id="webhooks" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <p className="mt-2 text-sm opacity-80">Set a webhook URL in the portal (Growth/Pro). You’ll receive events like <code>render</code>.</p>
          <Code>{`POST https://your-server/webhook
{
  "type": "render",
  "embedId": "your-embed-id",
  "outputUrl": "https://.../result.jpg",
  "ts": 1700000000000
}`}</Code>
        </section>

        <section id="api" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">API Endpoints</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><code>POST /api/client/me</code> — request magic link.</li>
            <li><code>GET/POST/PATCH/DELETE /api/client/embeds</code> — manage embeds (token required).</li>
            <li><code>GET /api/client/stats</code> — usage and quota.</li>
            <li><code>GET /api/client/usage?embedId=...</code> — recent render events.</li>
            <li><code>GET /api/embed/:id</code> — public config for an embed.</li>
            <li><code>POST /api/edit</code> — upload + generate (multipart/form-data).</li>
          </ul>
        </section>

        <section id="troubleshooting" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Troubleshooting</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>CSP blocks script? Use <code>data-variant="card"</code> (iframe).</li>
            <li>Want transparent card? Add <code>data-background="transparent"</code>.</li>
            <li>Slider reversed? Hard refresh to load the latest assets.</li>
            <li>Quota reached? Upgrade plan or buy top‑ups from the portal.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
ReactDOMClient.createRoot(rootEl).render(<Docs />);


