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
          <h2 className="text-lg font-semibold">{t('Dental — Quick Setup (staff‑friendly)','Дентал — Бърза настройка (удобно за екипа)')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>{t('Open your website editor (e.g., WordPress) and navigate to the page where you want the demo.','Отворете редактора на сайта (напр. WordPress) и отидете на страницата, където искате демото.')}</li>
            <li>{t('Paste this snippet where the widget should appear:','Поставете този снипет, където трябва да се появи widget‑ът:')}
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>{t('Save/publish the page and test: upload a selfie → Generate → move the slider.','Запазете/публикувайте страницата и тествайте: качете селфи → Generate → преместете плъзгача.')}</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">{t('Tip: For strict security settings (CSP), add','Съвет: За строги настройки за сигурност (CSP), добавете')} <code>data-variant="card"</code>.</p>
        </section>

        <section id="detailing-setup" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Auto Detailing — Quick Setup (staff‑friendly)','Авто детайлинг — Бърза настройка (удобно за екипа)')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>{t('Open your website editor (e.g., WordPress) and navigate to the page where you want the visualizer.','Отворете редактора на сайта (напр. WordPress) и отидете на страницата, където искате визуализатора.')}</li>
            <li>{t('Paste this snippet where the widget should appear:','Поставете този снипет, където трябва да се появи widget‑ът:')}
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="dark"
  data-max-width="720px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>{t('Save/publish the page and test: upload a car photo → Generate → move the slider.','Запазете/публикувайте страницата и тествайте: качете снимка на автомобил → Generate → преместете плъзгача.')}</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">{t('Tip: For strict security policies (CSP), use the card variant:','Съвет: При строги политики за сигурност (CSP) използвайте варианта card:')} <code>data-variant="card"</code>.</p>
        </section>

        <section id="barber-setup" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Barbers — Quick Setup (staff‑friendly)','Барбери — Бърза настройка (удобно за екипа)')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm opacity-90">
            <li>{t('Open your website editor and go to the page where you want the preview.','Отворете редактора и отидете на страницата, където искате прегледа.')}</li>
            <li>{t('Paste this snippet where the widget should appear:','Поставете този снипет, където трябва да се появи widget‑ът:')}
              <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
            </li>
            <li>{t('Save/publish the page and test: upload a selfie → Generate → move the slider.','Запазете/публикувайте страницата и тествайте: качете селфи → Generate → преместете плъзгача.')}</li>
          </ol>
          <p className="mt-2 text-xs opacity-70">{t('Tip: If your site has strict security (CSP), use the card variant:','Съвет: Ако сайтът е със строг CSP, използвайте варианта card:')} <code>data-variant="card"</code>.</p>
        </section>

        <section id="troubleshooting-dental" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Dental — Troubleshooting','Дентал — Отстраняване на проблеми')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><b>{t('Widget doesn’t show','Widget не се вижда')}</b>: {t('Ensure the script is pasted in the page content (not blocked by theme). Try the card variant for CSP pages.','Уверете се, че скриптът е поставен в съдържанието (не е блокиран от тема). За CSP страници — ползвайте варианта card.')}</li>
            <li><b>{t('Can’t upload','Не може да се качи')}</b>: {t('Check image type (JPG/PNG) and size (< 10MB).','Проверете типа (JPG/PNG) и размера (< 10MB).')}</li>
            <li><b>"Cross‑origin/CORS"</b>: {t('Use the card variant which isolates with iframe.','Използвайте варианта card, който изолира с iframe.')}</li>
            <li><b>{t('Style conflicts','Конфликт на стилове')}</b>: {t('Shadow DOM version prevents theme styles leaking in. If conflicts persist, switch to card variant.','Версията със Shadow DOM предотвратява изтичане на стилове. Ако продължи, преминете към варианта card.')}</li>
            <li><b>{t('Not centered','Не е центрирано')}</b>: {t('Set','Задайте')} <code>data-align="center"</code> {t('and a','и')} <code>data-max-width</code> {t('like','например')} <code>640px</code>.</li>
          </ul>
        </section>

        <section id="best-practices-dental" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Dental — Best Practices','Дентал — Добри практики')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>{t('Place the widget near a clear call‑to‑action (e.g., “Book whitening consult”).','Поставете widget‑а близо до ясен CTA (напр. „Book whitening consult“).')}</li>
            <li>{t('Use supportive copy: “This preview is illustrative and not a medical guarantee.”','Добавете пояснение: „Прегледът е илюстративен и не е медицинска гаранция.“')}</li>
            <li>{t('Offer a private demo page for staff to test without affecting your homepage.','Осигурете частна демо страница за екипа, за да не влияе на началната страница.')}</li>
            <li>{t('Encourage patients to use a well‑lit selfie facing the camera for best results.','Насърчете пациентите да използват добре осветено селфи, гледащо към камерата, за най‑добри резултати.')}</li>
          </ul>
        </section>

        <section id="best-practices-detailing" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Auto Detailing — Best Practices','Авто детайлинг — Добри практики')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>{t('Place the widget near your service CTA (e.g., “Book paint correction”).','Поставете widget‑а близо до CTA за услуга (напр. „Book paint correction“).')}</li>
            <li>{t('Add a short note: “Preview is illustrative; final results depend on vehicle condition.”','Добавете бележка: „Прегледът е илюстративен; финалният резултат зависи от състоянието на автомобила.“')}</li>
            <li>{t('Use clean, well‑lit exterior photos; avoid extreme angles or heavy shadows.','Използвайте чисти, добре осветени външни снимки; избягвайте крайни ъгли или тежки сенки.')}</li>
            <li>{t('Highlight problem areas (swirls, light scratches) in the before photo for a clearer preview.','Подчертайте проблемните зони (въртележки, леки драскотини) на снимката „преди“ за по‑ясен преглед.')}</li>
            <li>{t('For strict security policies, use the card variant:','При строги политики за сигурност използвайте варианта card:')} <code>data-variant="card"</code>.</li>
            <li>{t('Center the widget with','Центрирайте widget‑а с')} <code>data-align="center</code> {t('and set','и задайте')} <code>data-max-width</code> (e.g., <code>720px</code>).</li>
            <li>{t('Prefer the dark theme for contrast on automotive sites:','За по‑добър контраст в авто сайтове предпочетете тъмна тема:')} <code>data-theme="dark"</code>.</li>
          </ul>
        </section>

        <section id="best-practices-barber" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Barbers — Best Practices','Барбери — Добри практики')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>{t('Place the widget near the booking CTA (e.g., “Book haircut”).','Поставете widget‑а близо до CTA за записване (напр. „Book haircut“).')}</li>
            <li>{t('Add a short note: “Preview is illustrative; the final cut depends on hair type.”','Добавете бележка: „Прегледът е илюстративен; крайният резултат зависи от типа коса.“')}</li>
            <li>{t('Use front‑facing, well‑lit selfies; avoid hats and heavy shadows.','Използвайте фронтални, добре осветени селфита; избягвайте шапки и силни сенки.')}</li>
            <li>{t('Offer quick presets: fade levels (low/mid/high), beard length/outline, and fringe options.','Добавете бързи опции: нива на fade (low/mid/high), брада (дължина/контур) и бретон.')}</li>
            <li>{t('Center with','Центрирайте с')} <code>data-align="center"</code> {t('and set','и задайте')} <code>data-max-width</code> (e.g., <code>640px</code>).</li>
            <li>{t('Use light or dark theme to match your site; start with','Изберете светла или тъмна тема според сайта; започнете със')} <code>data-theme="light"</code>.</li>
          </ul>
        </section>

        <section id="overview" className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Overview','Общ преглед')}</h2>
          <p className="mt-2 text-sm opacity-80">{t('The Before/After widget lets customers upload a photo and preview an AI‑generated after result (barber, dental, auto detailing, and more). You can embed it on any site with one script tag.','Widget‑ът Before/After позволява на клиентите да качат снимка и да видят AI резултат „след“ (барбери, дентал, авто детайлинг и др.). Може да го вградите на всеки сайт с един script таг.')}</p>
        </section>

        <section id="quickstart" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Quick Start','Бърз старт')}</h2>
          <p className="mt-2 text-sm opacity-80">{t('Paste the script snippet where you want the widget to appear.','Поставете снипета там, където искате да се появи widget‑ът.')}</p>
          <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
        </section>

        <section id="attributes" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Attributes','Атрибути')}</h2>
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
          <h2 className="text-lg font-semibold">{t('Client Portal','Портал за клиенти')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>{t('Sign in with your email (magic link).','Влезте с имейл (magic link).')}</li>
            <li>{t('Create an embed → choose vertical + theme (Light/Dark).','Създайте embed → изберете вертикал + тема (Light/Dark).')}</li>
            <li>{t('Use quick actions: Copy Light/Dark snippet, Duplicate to opposite theme, Edit, Delete.','Бързи действия: копиране на Light/Dark снипет, дубликат към противоположна тема, редакция, изтриване.')}</li>
            <li>{t('Brand color (accent) is available on Growth/Pro plans.','Бранд цвят (accent) е достъпен в планове Growth/Pro.')}</li>
            <li>{t('Preview parity ensures what you copy is what renders on your site.','Preview parity гарантира, че копираното е това, което се рендерира на сайта.')}</li>
          </ul>
        </section>

        <section id="billing" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Billing & Plans','Плащане и планове')}</h2>
          <p className="mt-2 text-sm opacity-80">{t('Free, Starter, Growth, Pro. Growth/Pro unlock custom brand color and higher limits. Stripe Checkout is used for subscriptions and top‑ups.','Free, Starter, Growth, Pro. Growth/Pro отключват бранд цвят и по‑високи лимити. Stripe Checkout се използва за абонаменти и топ‑ъпи.')}</p>
        </section>

        <section id="webhooks" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <p className="mt-2 text-sm opacity-80">{t('Set a webhook URL in the portal (Growth/Pro). You’ll receive events like','Задайте Webhook URL в портала (Growth/Pro). Ще получавате събития като')} <code>render</code>.</p>
          <Code>{`POST https://your-server/webhook
{
  "type": "render",
  "embedId": "your-embed-id",
  "outputUrl": "https://.../result.jpg",
  "ts": 1700000000000
}`}</Code>
        </section>

        <section id="api" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('API Endpoints','API крайни точки')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><code>POST /api/client/me</code> — {t('request magic link.','заявка за magic link.')}</li>
            <li><code>GET/POST/PATCH/DELETE /api/client/embeds</code> — {t('manage embeds (token required).','управление на embeds (изисква token).')}</li>
            <li><code>GET /api/client/stats</code> — {t('usage and quota.','използване и квота.')}</li>
            <li><code>GET /api/client/stats?embedId=...</code> — {t('recent render events.','скорошни render събития.')}</li>
            <li><code>GET /api/embed/:id</code> — {t('public config for an embed.','публична конфигурация за embed.')}</li>
            <li><code>POST /api/edit</code> — {t('upload + generate (multipart/form-data).','качване + генериране (multipart/form-data).')}</li>
          </ul>
        </section>

        <section id="troubleshooting" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{t('Troubleshooting','Отстраняване на проблеми')}</h2>
          <p className="mt-2 text-sm opacity-80">{t('Common issues and solutions for the Before/After widget.','Чести проблеми и решения за Before/After widget.')}</p>
          
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('🚫 Widget Not Appearing','🚫 Widget не се вижда')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li><b>{t('Check browser console','Проверете браузър конзолата')}</b>: {t('Open DevTools (F12) → Console tab. Look for red errors.','Отворете DevTools (F12) → раздел Console. Търсете червени грешки.')}</li>
                <li><b>{t('CSP blocking?','CSP блокира?')}</b> {t('If you see "Content Security Policy" errors, use','Ако виждате „Content Security Policy" грешки, използвайте')} <code>data-variant="card"</code> (iframe).</li>
                <li><b>{t('Network blocked?','Мрежата е блокирана?')}</b> {t('Check Network tab in DevTools. Ensure','Проверете раздел Network в DevTools. Уверете се, че')} <code>embed.js</code> {t('loads successfully.','се зарежда успешно.')}</li>
                <li><b>{t('Cache issue?','Проблем с кеш?')}</b> {t('Hard refresh (Ctrl+F5 / Cmd+Shift+R) to clear cached assets.','Направете hard refresh (Ctrl+F5 / Cmd+Shift+R) за да изчистите кешираните файлове.')}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('📤 Upload Failing','📤 Качването се проваля')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li><b>{t('File size','Размер на файла')}</b>: {t('Maximum 25 MB. Compress large photos before uploading.','Максимум 25 MB. Компресирайте големи снимки преди качване.')}</li>
                <li><b>{t('Supported formats','Поддържани формати')}</b>: JPG, PNG, WEBP, HEIC/HEIF. {t('Convert other formats (TIFF, BMP, GIF) to JPG.','Конвертирайте други формати (TIFF, BMP, GIF) в JPG.')}</li>
                <li><b>{t('Empty file error?','Грешка празен файл?')}</b> {t('File may be corrupted or too small. Try re-exporting the photo.','Файлът може да е повреден или твърде малък. Опитайте да експортирате снимката отново.')}</li>
                <li><b>{t('Network timeout?','Мрежов timeout?')}</b> {t('Check your internet connection. Large files may take 10-15 seconds to upload.','Проверете интернет връзката. Големи файлове може да отнемат 10-15 секунди за качване.')}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('⚡ Generation Failing','⚡ Генерирането се проваля')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li><b>{t('"Quota reached"','"Достигнат лимит"')}</b>: {t('Monthly generation limit reached. Upgrade your plan or buy top-ups from the Client Portal.','Достигнат месечен лимит за генерирания. Ъпгрейднете плана или купете топ-ъпи от портала.')}</li>
                <li><b>{t('"Generation failed"','"Генерирането се провали"')}</b>: {t('AI service may be temporarily unavailable. Wait 30 seconds and try again.','AI услугата може временно да не е достъпна. Изчакайте 30 секунди и опитайте отново.')}</li>
                <li><b>{t('Poor quality results?','Лоши резултати?')}</b> {t('Use well-lit, high-resolution photos. Avoid blurry or dark images.','Използвайте добре осветени, високо-резолютни снимки. Избягвайте замъглени или тъмни изображения.')}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('🔄 Intermittent Loading','🔄 Прекъсващо зареждане')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li><b>{t('Browser compatibility','Съвместимост на браузъра')}</b>: {t('Tested on Chrome, Firefox, Safari, Edge. Update to the latest version.','Тествано на Chrome, Firefox, Safari, Edge. Обновете до последната версия.')}</li>
                <li><b>{t('Ad blockers','Блокери на реклами')}</b>: {t('Some aggressive blockers may interfere. Try disabling temporarily.','Някои агресивни блокери може да пречат. Опитайте да ги деактивирате временно.')}</li>
                <li><b>{t('Firewall/VPN','Firewall/VPN')}</b>: {t('Corporate networks may block API calls. Test on a different network.','Корпоративни мрежи могат да блокират API заявки. Тествайте на друга мрежа.')}</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('🎨 Styling Issues','🎨 Проблеми със стилизирането')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li><b>{t('Widget too wide?','Widget твърде широк?')}</b> {t('Set','Задайте')} <code>data-max-width="640px"</code> {t('and','и')} <code>data-align="center"</code>.</li>
                <li><b>{t('Theme not applying?','Темата не се прилага?')}</b> {t('Ensure','Уверете се, че')} <code>data-theme="dark"</code> {t('or','или')} <code>"light"</code> {t('is set correctly.','е зададена правилно.')}</li>
                <li><b>{t('Want custom colors?','Искате персонализирани цветове?')}</b> {t('Growth/Pro plans allow brand accent colors in the portal.','Планове Growth/Pro позволяват бранд цветове в портала.')}</li>
                <li><b>{t('Transparent background?','Прозрачен фон?')}</b> {t('Use','Използвайте')} <code>data-variant="card"</code> + <code>data-background="transparent"</code>.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h3 className="font-medium text-sm">{t('🐛 Debugging Steps','🐛 Стъпки за отстраняване на проблеми')}</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs opacity-90">
                <li>{t('Open browser console (F12) and check for errors','Отворете браузър конзолата (F12) и проверете за грешки')}</li>
                <li>{t('Check Network tab: look for failed requests to','Проверете раздел Network: търсете провалени заявки към')} <code>before-after-embed.vercel.app</code></li>
                <li>{t('Verify your embed ID is correct in the snippet','Проверете дали вашият embed ID е правилен в снипета')}</li>
                <li>{t('Try a different browser (Chrome recommended)','Опитайте различен браузър (препоръчва се Chrome)')}</li>
                <li>{t('Test with a small sample image (<5MB)','Тествайте с малка примерна снимка (<5MB)')}</li>
                <li>{t('Check Client Portal → Stats to see if renders are recorded','Проверете Портал за клиенти → Stats дали рендерите се записват')}</li>
              </ol>
            </div>

            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
              <h3 className="font-medium text-sm text-emerald-400">{t('💡 Still Need Help?','💡 Все още имате нужда от помощ?')}</h3>
              <p className="mt-2 text-xs opacity-90">{t('Contact support at','Свържете се с поддръжката на')} <a href="mailto:bojodanchev@gmail.com" className="text-emerald-400 underline">bojodanchev@gmail.com</a> {t('with:','с:')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs opacity-90">
                <li>{t('Screenshot of browser console (F12 → Console tab)','Скрийншот на браузър конзолата (F12 → раздел Console)')}</li>
                <li>{t('Your embed ID','Вашият embed ID')}</li>
                <li>{t('Description of the issue and steps to reproduce','Описание на проблема и стъпки за възпроизвеждане')}</li>
                <li>{t('Browser and OS version','Версия на браузъра и ОС')}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
ReactDOMClient.createRoot(rootEl).render(<Docs />);

