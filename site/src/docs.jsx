import React, { useEffect, useState } from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";

const Code = ({ children }) => (
  <pre className="whitespace-pre-wrap break-words rounded-md bg-black/60 p-3 text-xs text-white">{children}</pre>
);

function Docs() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } });
  useEffect(() => { try{ localStorage.setItem('lang', lang); }catch{} }, [lang]);
  const t = (en, bg) => (lang === 'bg' ? bg : en);
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('Before/After Embed — Documentation','Before/After Embed — Документация')}</h1>
          <div className="inline-flex items-center rounded-md border border-white/20 bg-white/5 p-0.5">
            <button onClick={()=> setLang('en')} className={`${lang==='en' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>EN</button>
            <button onClick={()=> setLang('bg')} className={`${lang==='bg' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>BG</button>
          </div>
        </div>
        <p className="mt-2 text-sm opacity-80">{t('Everything you need to integrate the widget, manage embeds, and go live.','Всичко необходимо за интеграция, управление и пускане на живо.')}</p>

        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          {[ 
            ['#overview', t('Overview','Общ преглед')],
            ['#quickstart', t('Quick Start','Бърз старт')],
            ['#choose-vertical', t('Choose your vertical','Изберете вертикал')],
            ['#attributes', t('Attributes','Атрибути')],
            ['#examples', t('Examples','Примери')],
            ['#portal', t('Client Portal','Портал за клиенти')],
            ['#billing', t('Billing & Plans','Плащане и планове')],
            ['#webhooks', t('Webhooks','Уебкукове')],
            ['#api', t('API Endpoints','API крайни точки')],
            ['#troubleshooting', t('Troubleshooting','Отстраняване на проблеми')],
          ].map(([href,label]) => (
            <a key={href} href={href} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-white hover:bg-white/20">{label}</a>
          ))}
        </nav>
        <section id="choose-vertical" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Choose your vertical','Изберете вертикал')}</h2>
          <p className="mt-2 text-sm opacity-80">{t('Pick a tailored onboarding:','Изберете подходящо въведение:')}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <a href="/app/dental.html" className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10">{t('Dental clinics','Дентални клиники')}</a>
            <a href="/app/barber.html" className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10">{t('Barbers','Барбери')}</a>
            <a href="/app/detailing.html" className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10">{t('Car detailing','Авто детайлинг')}</a>
          </div>
        </section>

        <section id="onboarding" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Onboarding','Онбординг')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>{t('Choose your vertical above (e.g., Dental).','Изберете вертикал по-горе (напр. Дентал).')}</li>
            <li>{t('Follow the guided one‑pager with the exact snippet and recommended settings.','Следвайте едностраничното ръководство със снипета и препоръчаните настройки.')}</li>
            <li>{t('In the portal, create your first embed (or click “Create starter embed” from the one‑pager if available).','В портала създайте първия си embed (или натиснете „Create starter embed“, ако е налично).')}</li>
          </ol>
        </section>

        <section id="pilot-flow" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Pilot Flow (Repeatable)','Пилотен поток (повторяем)')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li><b>{t('Create client','Създайте клиент')}</b>: {t('Enter the pilot’s email in the portal sign‑in; they’ll receive a magic link.','Въведете имейла в портала; ще получат magic link.')}</li>
            <li><b>{t('Login','Вход')}</b>: {t('Click the magic link; it logs directly into their account.','Кликнете линка; влиза директно в акаунта.')}</li>
            <li><b>{t('Create first embed','Създайте първи embed')}</b>: {t('In “Embeds”, click Create, set ID/vertical/theme.','В „Embeds“ натиснете Create и задайте ID/вертикал/тема.')}</li>
            <li><b>{t('Choose variant','Изберете вариант')}</b>: {t('Use','Използвайте')} <Code>data-variant="compact"</Code> {t('(Shadow DOM) or','(Shadow DOM) или')} <Code>data-variant="card"</Code> {t('(iframe) for strict CSP sites.','(iframe) за сайтове със строг CSP.')}</li>
            <li><b>{t('Paste snippet','Поставете снипета')}</b>: {t('Copy the script tag into their site (see CMS notes below).','Копирайте script тага в сайта (вижте бележките за CMS по‑долу).')}</li>
            <li><b>{t('Test','Тест')}</b>: {t('Upload a test image → Generate → confirm before/after. Stats should reflect the render.','Качете тестово изображение → Generate → потвърдете Преди/След. Статистиката трябва да отчете рендера.')}</li>
          </ol>
          <div className="mt-3 text-xs opacity-70">{t('Tip: If the widget doesn’t appear or network calls are blocked, use the','Съвет: Ако widget‑ът не се вижда или заявките са блокирани, използвайте')} <b>card</b> {t('variant which isolates via iframe.','варианта, който изолира чрез iframe.')}</div>
        </section>

        <section id="cms-csp" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('CSP + CMS Minis (WordPress / Shopify / Wix)','CSP + CMS мини (WordPress / Shopify / Wix)')}</h2>
          <div className="mt-2 grid gap-3 text-sm opacity-90">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium">WordPress</h3>
              <ul className="mt-1 list-disc pl-5">
                <li>{t('Use a Custom HTML block and paste the snippet.','Използвайте Custom HTML блок и поставете снипета.')}</li>
                <li>{t('If theme/CSP strips scripts, switch to','Ако темата/CSP премахва скриптове, превключете на')} <Code>data-variant="card"</Code>.</li>
                <li>{t('Place near a CTA; set','Поставете близо до CTA; задайте')} <Code>data-max-width</Code> {t('(e.g., 640px) and','(напр. 640px) и')} <Code>data-align</Code>.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium">Shopify</h3>
              <ul className="mt-1 list-disc pl-5">
                <li>{t('In the editor, add a “Custom liquid” block and paste the snippet.','В редактора добавете „Custom liquid“ блок и поставете снипета.')}</li>
                <li>{t('For strict CSP themes, use','За строги CSP теми ползвайте')} <Code>data-variant="card"</Code> (iframe).</li>
                <li>{t('Consider','Помислете за')} <Code>data-background="transparent"</Code> {t('for the iframe card to blend in.','за да се слее картата с фона.')}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium">Wix</h3>
              <ul className="mt-1 list-disc pl-5">
                <li>{t('Use the “Embed Code” widget and paste the snippet.','Използвайте „Embed Code“ widget и поставете снипета.')}</li>
                <li>{t('Prefer','Предпочетете')} <Code>data-variant="card"</Code> {t('to avoid builder restrictions.','за да избегнете ограничения на билдъра.')}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium">Common Pitfalls</h3>
              <ul className="mt-1 list-disc pl-5">
                <li><b>CSP blocks</b>: Switch to <Code>data-variant="card"</Code>.</li>
                <li><b>Image too large</b>: Upload JPG/PNG/WEBP/HEIC under 10 MB.</li>
                <li><b>Style conflicts</b>: Shadow DOM variant isolates styles; otherwise use card.</li>
                <li><b>Cross‑origin</b>: Our API allows all origins during pilots; we can restrict later.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="brand-color" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Brand Color (Growth / Pro)</h2>
          <p className="mt-2 text-sm opacity-80">On Growth/Pro plans you can set a brand accent color in the portal Settings. The embed will adopt it automatically where theme customization is allowed.</p>
          <ul className="mt-2 list-disc pl-5 text-sm opacity-90">
            <li>Set the color in <b>Settings → Brand color</b>.</li>
            <li>The public config exposes an accent when customization is <Code>custom</Code>.</li>
            <li>The embed reads that and sets the internal accent token for buttons/badges.</li>
          </ul>
        </section>

        <section id="dental-setup" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Dental — Quick Setup (staff‑friendly)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>Open your website editor (e.g., WordPress) and navigate to the page where you want the demo.</li>
            <li>Paste this snippet where the widget should appear:
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>Save/publish the page and test: upload a selfie → Generate → move the slider.</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">Tip: For strict security settings (CSP), add <code>data-variant="card"</code>.</p>
        </section>

        <section id="detailing-setup" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Auto Detailing — Quick Setup (staff‑friendly)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>Open your website editor (e.g., WordPress) and navigate to the page where you want the visualizer.</li>
            <li>Paste this snippet where the widget should appear:
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="dark"
  data-max-width="720px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>Save/publish the page and test: upload a car photo → Generate → move the slider.</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">Tip: For strict security policies (CSP), use the card variant: <code>data-variant="card"</code>.</p>
        </section>

        <section id="barber-setup" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Barbers — Quick Setup (staff‑friendly)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>Open your website editor and go to the page where you want the preview.</li>
            <li>Paste this snippet where the widget should appear:
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>Save/publish the page and test: upload a selfie → Generate → move the slider.</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">Tip: If your site has strict security (CSP), use the card variant: <code>data-variant="card"</code>.</p>
        </section>

        <section id="troubleshooting-dental" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Dental — Troubleshooting</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><b>Widget doesn’t show</b>: Ensure the script is pasted in the page content (not blocked by theme). Try the card variant for CSP pages.</li>
            <li><b>Can’t upload</b>: Check image type (JPG/PNG) and size (&lt; 10MB).</li>
            <li><b>“Cross‑origin/CORS” errors</b>: Use the card variant which isolates with iframe.</li>
            <li><b>Style conflicts</b>: Shadow DOM version prevents theme styles leaking in. If conflicts persist, switch to card variant.</li>
            <li><b>Not centered</b>: Set <code>data-align="center"</code> and a <code>data-max-width</code> like <code>640px</code>.</li>
          </ul>
        </section>

        <section id="best-practices-dental" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Dental — Best Practices</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>Place the widget near a clear call‑to‑action (e.g., “Book whitening consult”).</li>
            <li>Use supportive copy: “This preview is illustrative and not a medical guarantee.”</li>
            <li>Offer a private demo page for staff to test without affecting your homepage.</li>
            <li>Encourage patients to use a well‑lit selfie facing the camera for best results.</li>
          </ul>
        </section>

        <section id="best-practices-detailing" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Auto Detailing — Best Practices</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>Place the widget near your service CTA (e.g., “Book paint correction”).</li>
            <li>Add a short note: “Preview is illustrative; final results depend on vehicle condition.”</li>
            <li>Use clean, well‑lit exterior photos; avoid extreme angles or heavy shadows.</li>
            <li>Highlight problem areas (swirls, light scratches) in the before photo for a clearer preview.</li>
            <li>For strict security policies, use the card variant: <code>data-variant="card"</code>.</li>
            <li>Center the widget with <code>data-align="center</code> and set <code>data-max-width</code> (e.g., <code>720px</code>).</li>
            <li>Prefer the dark theme for contrast on automotive sites: <code>data-theme="dark"</code>.</li>
          </ul>
        </section>

        <section id="best-practices-barber" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Barbers — Best Practices</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>Place the widget near the booking CTA (e.g., “Book haircut”).</li>
            <li>Add a short note: “Preview is illustrative; the final cut depends on hair type.”</li>
            <li>Use front‑facing, well‑lit selfies; avoid hats and heavy shadows.</li>
            <li>Offer quick presets: fade levels (low/mid/high), beard length/outline, and fringe options.</li>
            <li>Center with <code>data-align="center"</code> and set <code>data-max-width</code> (e.g., <code>640px</code>).</li>
            <li>Use light or dark theme to match your site; start with <code>data-theme="light"</code>.</li>
          </ul>
        </section>

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

