import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const styles = {
    primary: `${base} bg-blue-600 text-white hover:bg-blue-500 shadow shadow-blue-900/20`,
    secondary: `${base} border border-white/10 bg-transparent text-white hover:bg-white/10`,
    subtle: `${base} bg-white/10 text-white hover:bg-white/20`,
  };
  return (
    <button {...props} className={`${styles[variant] || styles.primary} ${className}`}>{children}</button>
  );
};

function DentalPage(){
  const locale = new URLSearchParams(location.search).get('lang') === 'bg' ? 'bg' : 'en';
  const t = (en, bg) => (locale === 'bg' ? bg : en);
  const snippet = `<script async src=\"https://before-after-embed.vercel.app/embed.js\"
  data-embed-id=\"your-embed-id\"
  data-theme=\"light\"
  data-variant=\"compact\"
  data-max-width=\"640px\"
  data-align=\"center\">\n<\/script>`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After — Dental</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">Main site</a>
            <a href="/app/docs.html" className="hover:text-white">Docs</a>
            <a href="/client.html" target="_top" className="hover:text-white">Client Portal</a>
            <a href={location.pathname + '?lang=' + (locale==='bg'?'en':'bg')} className="hover:text-white">{locale==='bg' ? 'English' : 'Български'}</a>
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(6,182,212,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t('Show a Before/After smile before treatment','Покажете усмивката „Преди/След” преди лечението')}</h1>
            <p className="mt-4 text-lg text-white/70">{t('Perfect for whitening, veneers and alignment. Upload, generate, and slide to compare.','Идеално за избелване, фасети и подравняване. Качете снимка, генерирайте резултат и преместете плъзгача, за да сравните.')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>{t('Get started','Започнете')}</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">{t('Docs','Документация')}</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-sky-500/15 to-cyan-400/15 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">{t('Install in 60 seconds','Инсталирайте за 60 секунди')}</h3>
              <p className="mt-2 text-white/80">{t('Paste the script and use data-variant / data-theme to style.','Поставете скрипта и използвайте data-variant и data-theme за визия.')}</p>
            </div>
            <div className="rounded-2xl border border-blue-900/20 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Recommended options','Препоръчителни опции')}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>{t('Whitening — natural brighter shade without harming enamel','Избелване — естествено по-светли зъби без изгаряне на емайла')}</li>
            <li>{t('Alignment — subtle straightening of the smile','Подравняване — дискретно изправяне на усмивката')}</li>
            <li>{t('Veneers — natural look with improved shape and tone','Фасети — естествен вид, подобрена форма и нюанс')}</li>
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Why clinics choose us','Защо клиниките ни избират')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Reduce no‑shows','По-малко неявявания')}</div>
              <p className="mt-1">{t('Patients visualize results before booking, reducing uncertainty and abandoned consults.','Пациентите виждат резултат преди записване — по-малко съмнения и отказани консултации.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Increase case acceptance','По-висок прием на планове')}</div>
              <p className="mt-1">{t('Before/After visuals help patients say “yes” to whitening, aligners or veneers.','Визуализациите „Преди/След“ помагат пациентите да кажат „да“ на избелване, алайнери или фасети.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Faster consults','По-бързи консултации')}</div>
              <p className="mt-1">{t('Show realistic expectations in seconds; align on treatment and next steps.','Покажете реалистични очаквания за секунди — съгласувайте лечение и следващи стъпки.')}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('How it works','Как работи')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>1.</b> {t('Paste the script on your site.','Поставяте скрипта на сайта си.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>2.</b> {t('Patients upload a selfie, choose whitening / alignment / veneers.','Пациентът качва снимка и избира избелване / подравняване / фасети.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>3.</b> {t('They view a Before/After and book a consult.','Виждат „Преди/След“ и записват консултация.')}</li>
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Results you can expect','Какви резултати да очаквате')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center">
            {[{k:'+18%',v:t('higher case acceptance','по-висок прием на планове')},{k:'-22%',v:t('fewer no‑shows','по-малко неявявания')},{k:'< 60s',v:t('to first visualization','до първа визуализация')}].map((s,i)=> (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-3xl font-semibold text-blue-300">{s.k}</div>
                <div className="mt-1 text-sm text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<DentalPage />);


