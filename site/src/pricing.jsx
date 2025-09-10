import React, { useEffect, useState } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";

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
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => (<div className="border-b border-white/10 p-4">{children}</div>);
const CardTitle = ({ children, className = "" }) => (<div className={`font-medium ${className}`}>{children}</div>);
const CardContent = ({ children, className = "" }) => (<div className={`p-4 ${className}`}>{children}</div>);
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 ${className}`}>{children}</span>
);

const plans = [
  { id:'free', name: "Free", price: "$0", includes: "10 generations / mo", bullets: ["1 embed", "Watermark required", "Basic light/dark theme"], note: "For trials; limited usage", popular:false },
  { id:'starter', name: "Starter", price: "$24", includes: "300 generations / mo", bullets: ["1 embed", "Basic light/dark theme", "Watermark removed"], note: "+ $10 per 100 extra gens", popular:false },
  { id:'growth', name: "Growth", price: "$49", includes: "600 generations / mo", bullets: ["Up to 3 embeds", "Customizable theme", "Remove watermark", "Basic analytics"], note: "+ $10 per 100 extra gens", popular:true, badge:"Most Popular" },
  { id:'pro', name: "Pro", price: "$99", includes: "1,500 generations / mo", bullets: ["Up to 10 embeds", "Advanced analytics", "API + Webhooks", "Priority support"], note: "+ $10 per 100 extra gens", popular:false },
];

function App(){
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } });
  useEffect(() => { try{ localStorage.setItem('lang', lang); }catch{} }, [lang]);
  const t = (en, bg) => (lang === 'bg' ? bg : en);
  const goCheckout = (planId) => {
    // If not signed in, send to portal sign-in; otherwise, start Stripe Checkout via backend
    const token = (()=>{ try{return localStorage.getItem('clientToken') || '';}catch{return '';} })();
    if (!token){
      const u = new URL("/app/client.html", window.location.origin);
      u.searchParams.set("nextPlan", planId);
      window.location.href = u.toString();
      return;
    }
    (async () => {
      try{
        const resp = await fetch('/api/billing/checkout', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ planId }) });
        const j = await resp.json();
        if (!resp.ok) throw new Error(j?.error || 'Checkout failed');
        if (j?.url) window.location.href = j.url;
      }catch(e){ alert(e.message || 'Checkout failed'); }
    })();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">{t('Home','Начало')}</a>
            <a href="/client.html" target="_top" className="hover:text-white">{t('Client Portal','Портал за клиенти')}</a>
            <select value={lang} onChange={(e)=> setLang(e.target.value)} className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10">
              <option value="en">EN</option>
              <option value="bg">BG</option>
            </select>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/client.html" target="_top"><Button variant="secondary" className="hidden bg-white/10 text-white hover:bg-white/20 sm:inline-flex">{t('Client Portal','Портал за клиенти')}</Button></a>
            <a href="/app/index.html"><Button>{t('Back to Home','Назад към началото')}</Button></a>
          </div>
        </Container>
      </header>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">{t('Pricing','Цени')}</div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('Clear, adoption‑first plans','Ясни планове с фокус върху приемането')}</h2>
            <p className="mt-3 text-base text-white/70">{t('All paid tiers include overage: $10 per extra 100 generations.','Всички платени планове включват надвишаване: $10 за всеки допълнителни 100 генерирания.')}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {plans.map((p)=> (
              <Card key={p.id} className={`relative ${p.popular ? 'bg-gradient-to-b from-white/10 to-white/5 ring-1 ring-white/10' : 'bg-white/5'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {p.badge && <Badge className="border-amber-300/40 text-amber-300">{p.badge}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{p.price}<span className="text-sm text-white/60">/mo</span></div>
                  <div className="mt-1 text-sm text-emerald-300">{t('Includes','Вкл.')} {p.includes}</div>
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {p.bullets.map((b,idx)=> (
                      <li key={idx} className="flex items-start gap-2"><span className="mt-0.5 inline-block h-4 w-4 rounded-full bg-emerald-400/30"/> {b}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-xs text-white/60">{p.note}</div>
                  <Button className="mt-6 w-full" onClick={()=> goCheckout(p.id)}>{t('Choose','Изберете')} {p.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <footer className="border-t border-white/10 py-10">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400">
                <span className="text-xs font-bold">B/A</span>
              </div>
              <div className="text-sm text-white/70">© 2025 Before/After Embed</div>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a href="/app/index.html" className="hover:text-white">{t('Home','Начало')}</a>
              <a href="#" className="hover:text-white">{t('Pricing','Цени')}</a>
              <a href="/client.html" target="_top" className="hover:text-white">{t('Client Portal','Портал за клиенти')}</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
