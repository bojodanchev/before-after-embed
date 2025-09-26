import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const styles = {
    primary: `${base} bg-red-600 text-white hover:bg-red-500 shadow shadow-red-900/20`,
    secondary: `${base} border border-white/10 bg-transparent text-white hover:bg-white/10`,
    subtle: `${base} bg-white/10 text-white hover:bg-white/20`,
  };
  return (
    <button {...props} className={`${styles[variant] || styles.primary} ${className}`}>{children}</button>
  );
};

function DetailingPage(){
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } });
  useEffect(() => { try{ localStorage.setItem('lang', lang); }catch{} }, [lang]);
  const t = (en, bg) => (lang === 'bg' ? bg : en);
  const snippet = `<script async src=\"https://before-after-embed.vercel.app/embed.js\"\n  data-embed-id=\"your-embed-id\"\n  data-theme=\"dark\"\n  data-variant=\"compact\"\n  data-max-width=\"720px\"\n  data-align=\"center\">\n<\/script>`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-rose-500 shadow-lg shadow-red-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">{t('Before/After — Auto Detailing','Before/After — Авто детайлинг')}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">{t('Main site','Основен сайт')}</a>
            <a href="/app/docs.html" className="hover:text-white">{t('Docs','Документация')}</a>
            <a href="/client.html" target="_top" className="hover:text-white">{t('Client Portal','Портал за клиенти')}</a>
            <div className="inline-flex items-center rounded-md border border-white/20 bg-white/5 p-0.5">
              <button onClick={()=> setLang('en')} className={`${lang==='en' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>EN</button>
              <button onClick={()=> setLang('bg')} className={`${lang==='bg' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>BG</button>
            </div>
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(251,113,133,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t('How do car owners see the shine before the polish?','Как собствениците да видят блясъка преди полирането?')}</h1>
            <p className="mt-4 text-lg text-white/70">{t('Embed Before/After, let them upload a shot of their vehicle, and preview paint correction, wraps, or coatings instantly.','Вградете Before/After, позволете им да качат снимка на автомобила и покажете корекция на боя, фолио или покритие мигновено.')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>{t('Get started','Започнете')}</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">{t('Docs','Документация')}</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-red-600/15 via-rose-500/15 to-orange-400/15 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">{t('How fast can you launch the detailing preview?','Колко бързо може да стартирате детайлинг визуализацията?')}</h3>
              <p className="mt-2 text-white/80">{t('Drop in the script, adjust the data attributes, and start showcasing results.','Поставете скрипта, настройте data атрибутите и започнете да показвате резултати.')}</p>
            </div>
            <div className="rounded-2xl border border-red-900/20 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Which services benefit most from Before/After?','Кои услуги печелят най-много от Before/After?')}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>{t('Paint correction — remove swirls and fine scratches; realistic reflections','Корекция на боя — премахване на въртележки и фини драскотини; реалистични отражения')}</li>
            <li>{t('Ceramic coating — emphasize gloss and water beading','Керамично покритие — подчертан блясък и капчици')}</li>
            <li>{t('Wrap color preview — show subtle color shifts; keep make/model','Преглед на фолио — фини цветови промени; запазете марка/модел')}</li>
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Why do detailing teams choose Before/After?','Защо екипите за детайлинг избират Before/After?')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Upsell with visuals','Ъпсел с визия')}</div>
              <p className="mt-1">{t('Before/After comparisons help clients choose premium services.','Сравнения Преди/След помагат клиентите да изберат премиум услуги.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Set clear expectations','Ясни очаквания')}</div>
              <p className="mt-1">{t('Show realistic outcomes for correction, wraps, and coatings.','Показвайте реалистични резултати за корекция, фолио и покрития.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Faster bookings','По-бързи резервации')}</div>
              <p className="mt-1">{t('Move from interest to scheduled service in minutes.','От интерес до записан час за минути.')}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('How does the workflow operate in the shop?','Как протича процесът във вашия сервиз?')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>1.</b> {t('Paste the script on your site.','Поставете скрипта на сайта си.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>2.</b> {t('Clients upload a photo, choose correction / wrap / coat.','Клиентите качват снимка и избират корекция / фолио / покритие.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>3.</b> {t('They view a Before/After and book a service.','Виждат „Преди/След“ и записват услуга.')}</li>
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('What results do detailing studios report?','Какви резултати споделят детайлинг студиата?')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center">
            {[{k:'+30%',v:t('higher premium upsells','повече премиум ъпсел')},{k:'-20%',v:t('fewer quote drop‑offs','по-малко отказани оферти')},{k:'< 60s',v:t('to first visualization','до първа визуализация')}].map((s,i)=> (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-3xl font-semibold text-red-300">{s.k}</div>
                <div className="mt-1 text-sm text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<DetailingPage />);

