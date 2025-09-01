import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20";
  const secondary = "inline-flex items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/10";
  return (
    <button {...props} className={`${variant === 'secondary' ? secondary : base} ${className}`}>{children}</button>
  );
};

function DentalPage(){
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
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Покажете усмивката „Преди/След” преди лечението</h1>
            <p className="mt-4 text-lg text-white/70">Идеално за избелване, фасети и подравняване. Качете снимка, генерирайте резултат и преместете плъзгача, за да сравните.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button size="lg" className="bg-white/10">Започнете</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">Документация</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-600/20 via-pink-500/20 to-cyan-400/20 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Инсталирайте за 60 секунди</h3>
              <p className="mt-2 text-white/80">Поставете скрипта и използвайте <code>data-variant</code> и <code>data-theme</code> за визия.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Препоръчителни опции</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>Избелване — естествено по-светли зъби без изгаряне на емайла</li>
            <li>Подравняване — дискретно изправяне на усмивката</li>
            <li>Фасети — естествен вид, подобрена форма и нюанс</li>
          </ul>
        </Container>
      </section>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<DentalPage />);


