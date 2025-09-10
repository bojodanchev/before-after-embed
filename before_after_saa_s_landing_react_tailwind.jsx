import React, { useRef, useState, useEffect } from "react";
// Minimal Tailwind-like stand-ins (no external UI lib). We keep classNames from your design.
const Button = ({ children, className = "", variant = "primary", size = "md", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20";
  const secondary = "inline-flex items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/10";
  const lg = size === 'lg' ? "px-5 py-2.5 text-base" : "";
  return (
    <button {...props} className={`${variant === 'secondary' ? secondary : base} ${lg} ${className}`}>{children}</button>
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
import { Check, ArrowRight, Code2, Gauge, Layers, Paintbrush, Shield, Sparkles, Terminal, Image as ImageIcon } from "lucide-react";

// Simple utility components
const Container = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const SectionTitle = ({ eyebrow, title, subtitle }) => (
  <div className="mx-auto max-w-3xl text-center">
    {eyebrow && (
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
        <span>{eyebrow}</span>
      </div>
    )}
    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    {subtitle && <p className="mt-3 text-base text-white/70">{subtitle}</p>}
  </div>
);

// Code block with copy
const CodeBlock = ({ code }) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Snippet copied");
    } catch {}
  };
  return (
    <div className="relative rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-sm leading-relaxed shadow-xl">
      <pre className="whitespace-pre-wrap break-words text-white/90">{code}</pre>
      <button onClick={onCopy} className="absolute right-3 top-3 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15">
        Copy
      </button>
    </div>
  );
};

// Live demo wired to backend /api/edit
const LiveDemo = () => {
  const fileRef = useRef(null);
  const [beforeSrc, setBeforeSrc] = useState("");
  const [afterSrc, setAfterSrc] = useState("");
  const [status, setStatus] = useState("");
  const [slider, setSlider] = useState(50);

  const onPick = () => fileRef.current?.click();
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBeforeSrc(URL.createObjectURL(f));
    setAfterSrc("");
  };

  const onGenerate = async () => {
    const f = fileRef.current?.files?.[0];
    if (!f) { setStatus('Please choose an image.'); return; }
    setStatus('Uploading...'); setAfterSrc(""); setSlider(50);
    const fd = new FormData();
    fd.append('image', f);
    // Use a demo embed and vertical for landing tryout
    fd.append('embedId', 'demo-dental');
    fd.append('vertical', 'dental');
    try{
      const resp = await fetch('/api/edit', { method:'POST', body: fd });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      setStatus('Rendering complete');
      if (json.outputUrl) setAfterSrc(json.outputUrl); else setStatus('No image returned');
    }catch(err){ setStatus('Error: '+err.message); }
  };

  return (
    <div id="demo" className="relative grid gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/10 text-white">Live Demo</Badge>
          <span className="text-xs text-white/60">Interactive preview</span>
        </div>
        <div className="text-xs text-white/50">Before/After slider</div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative aspect-[4/3]">
          {/* Labels */}
          <div className="absolute left-4 top-4 rounded-full bg-black/60 px-2 py-1 text-xs text-white/80 z-10">After</div>
          <div className="absolute right-4 top-4 rounded-full bg-black/60 px-2 py-1 text-xs text-white/80 z-10">Before</div>
          {/* Images */}
          {beforeSrc ? (
            <>
              <img src={beforeSrc} alt="Before" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{clipPath:`inset(0 ${100 - slider}% 0 0)`}}>
                {afterSrc ? (
                  <img src={afterSrc} alt="After" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/30"><Sparkles className="h-10 w-10 text-white/40"/></div>
                )}
              </div>
            </>
          ) : (
            <div className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-white/5 to-transparent">
              <ImageIcon className="h-10 w-10 text-white/30" />
            </div>
          )}
          {/* Slider */}
          <input type="range" min="0" max="100" value={slider} onChange={(e)=>setSlider(Number(e.target.value))} className="absolute left-3 right-3 bottom-3" />
        </div>
        <div className="border-t border-white/10 bg-black/40 p-3 text-center text-sm text-white/70">Upload a photo, click Generate, slide to compare</div>
      </div>

      <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
        <div className="text-xs text-white/60">{status || 'Powered by fal.ai image edit model'}</div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={onPick}>Choose image</Button>
          <Button className="gap-2" onClick={onGenerate}>Generate <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default function BeforeAfterLanding() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } });
  useEffect(() => { try { localStorage.setItem('lang', lang); } catch {} }, [lang]);
  const t = (en, bg) => (lang === 'bg' ? bg : en);
  const embedSnippet = `<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="dark"
  data-variant="compact"
  data-max-width="640px"
  data-align="center"
  data-radius="14px"
  data-shadow="true"
  data-border="true"
  data-width="100%" data-height="460px"><\/script>`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-950 text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="#demo" className="hover:text-white">{t('Live demo','Демо на живо')}</a>
            <a href="#features" className="hover:text-white">{t('Features','Функции')}</a>
            <a href="/app/docs.html" target="_top" className="hover:text-white">{t('Docs','Документация')}</a>
            <a href="#pricing" className="hover:text-white">{t('Pricing','Цени')}</a>
            <a href="/client.html" target="_top" className="hover:text-white">{t('Client Portal','Портал за клиенти')}</a>
            <select value={lang} onChange={(e)=> setLang(e.target.value)} className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10">
              <option value="en">EN</option>
              <option value="bg">BG</option>
            </select>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/client.html" target="_top"><Button variant="secondary" className="hidden bg-white/10 text-white hover:bg-white/20 sm:inline-flex">{t('Client Portal','Портал за клиенти')}</Button></a>
            <a href="#demo"><Button className="gap-2">{t('Try the demo','Пробвайте демото')} <ArrowRight className="h-4 w-4"/></Button></a>
            <div className="inline-flex items-center rounded-md border border-white/20 bg-white/5 p-0.5">
              <button onClick={()=> setLang('en')} className={`${lang==='en' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>EN</button>
              <button onClick={()=> setLang('bg')} className={`${lang==='bg' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>BG</button>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t('Let customers visualize results before they buy','Нека клиентите видят резултата преди да купят')}</h1>
            <p className="mt-4 text-lg text-white/70">{t('Embed a beautiful, one‑click AI visualizer on any website. Perfect for barbers, dental clinics, car detailing and more. Upload a photo, click Generate, slide to compare.','Вградете красив AI визуализатор с едно кликване на всеки сайт. Перфектен за барбери, дентални клиники, авто детайлинг и др. Качете снимка, натиснете Генерирай и плъзнете за сравнение.')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#demo"><Button size="lg" className="gap-2">
                {t('Try the Live Demo','Опитайте демото на живо')} <ArrowRight className="h-5 w-5" />
              </Button></a>
              <a href="/client.html" target="_top"><Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                {t('Client Portal','Портал за клиенти')}
              </Button></a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-12">
            <LiveDemo />
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow={t('Product','Продукт')}
            title={t('Drop‑in embed. Modern UI. Multi‑tenant by design.','Вграден виджет. Модерен UI. Мултитенант по дизайн.')}
            subtitle={t('Paste one script tag. Configure layout with data‑attributes. Provision embeds per client, manage themes and verticals, and track usage — all with a clean, conversion‑ready UI.','Поставете един скрипт. Настройвайте чрез data‑атрибути. Създавайте ембедове за всеки клиент, управлявайте теми и вертикали и следете употребата — с чист, модерен интерфейс.')}
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Code2 className="h-5 w-5 text-white/60" /> Drop‑in embed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Paste one script tag. Configure layout (max width, alignment, theme) with data‑attributes.
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Layers className="h-5 w-5 text-white/60" /> Multi‑tenant</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Provision embeds per client, manage themes/verticals, and track usage.
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Paintbrush className="h-5 w-5 text-white/60" /> Modern UI</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Clean dropzone, compact or card variants, “Before/After” badges and slider.
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Gauge className="h-5 w-5 text-white/60" /> Fast integration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Get started in 60 seconds. Works anywhere you can paste a script tag.
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-5 w-5 text-white/60" /> Safe by default</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Client‑scoped API keys, signed uploads, and per‑tenant quotas.
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Terminal className="h-5 w-5 text-white/60" /> Developer‑friendly</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Webhooks for generations, admin API, and audit logs.
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Snippet (swapped with CTA aesthetic) */}
      <section id="docs" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-600/20 via-pink-500/20 to-cyan-400/20 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Get started in 60 seconds</h3>
              <p className="mt-2 text-white/80">Paste the script tag, set your data‑attributes, and launch your visualizer today.</p>
              <div className="mt-6 flex gap-3">
                <Button className="gap-2">Create account <ArrowRight className="h-4 w-4" /></Button>
                <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20">Talk to sales</Button>
              </div>
            </div>
            <div>
              <CodeBlock code={embedSnippet} />
            </div>
          </div>
        </Container>
      </section>

      {/* Vertical examples */}
      <section className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow={t('Use cases','Приложения')}
            title={t('Built for barbers, dental clinics, car detailing and more','Създаден за барбери, дентални клиники, авто детайлинг и др.')}
            subtitle={t('Show the transformation. Remove buyer hesitation. Convert with proof in one click.','Покажете трансформацията. Премахнете колебанието. Конвертирайте с доказателство в едно кликване.')}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: t('Barbers & salons','Барбери и салони'), desc: t('Preview haircuts, color, or beard styling before the chair.','Прегледайте прически, цвят и брада преди стола.'), icon: <Paintbrush className="h-5 w-5"/>, link: "/app/barber.html" },
              { title: t('Dental clinics','Дентални клиники'), desc: t('Project whitening, veneers, or aligner results from a selfie.','Покажете избелване, фасети или алайнери от селфи.'), icon: <Shield className="h-5 w-5"/>, link: "/app/dental.html" },
              { title: t('Car detailing','Авто детайлинг'), desc: t('Visualize paint correction, wrap colors, and ceramic coatings.','Визуализирайте корекция на боя, фолио и керамични покрития.'), icon: <ImageIcon className="h-5 w-5"/>, link: "/app/detailing.html" },
            ].map((f, i) => (
              f.link ? (
                <a key={i} href={f.link} className="block transition hover:scale-[1.01]" target="_top">
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">{f.icon} {f.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">{f.desc}</CardContent>
                  </Card>
                </a>
              ) : (
                <Card key={i} className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">{f.icon} {f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/70">{f.desc}</CardContent>
                </Card>
              )
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow={t('Pricing','Цени')} title={t('Clear, adoption‑first plans','Ясни планове с фокус върху приемането')} subtitle={t('All paid tiers include overage: $10 per extra 100 generations.','Всички платени планове включват надвишаване: $10 за всеки допълнителни 100 генерирания.')} />
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                name: t("Free","Безплатен"), price: "$0", badge: t("Test Drive","Тест период"), popular:false,
                includes: t("10 generations / mo","10 генерирания / месец"),
                bullets: [t("1 embed","1 ембед"), t("Watermark required","С воден знак"), t("Basic light/dark theme","Базова светла/тъмна тема")],
                footnote: t("For trials; limited usage","За тестове; ограничена употреба")
              },
              {
                name: t("Starter","Стартер"), price: "$24", badge: null, popular:false,
                includes: t("300 generations / mo","300 генерирания / месец"),
                bullets: [t("1 embed","1 ембед"), t("Basic light/dark theme","Базова светла/тъмна тема"), t("Watermark removed","Без воден знак")],
                footnote: t("+ $10 per 100 extra gens","+ $10 на всеки доп. 100 генерирания")
              },
              {
                name: t("Growth","Гроус"), price: "$49", badge: t("Most Popular","Най‑популярен"), popular:true,
                includes: t("600 generations / mo","600 генерирания / месец"),
                bullets: [t("Up to 3 embeds","До 3 ембеда"), t("Customizable theme","Персонализируема тема"), t("Remove watermark","Без воден знак"), t("Basic analytics","Базова аналитика")],
                footnote: t("+ $10 per 100 extra gens","+ $10 на всеки доп. 100 генерирания")
              },
              {
                name: t("Pro","Про"), price: "$99", badge: null, popular:false,
                includes: t("1,500 generations / mo","1,500 генерирания / месец"),
                bullets: [t("Up to 10 embeds","До 10 ембеда"), t("Advanced analytics","Разширена аналитика"), t("API + Webhooks","API + Уебкукове"), t("Priority support","Приоритетна поддръжка")],
                footnote: t("+ $10 per 100 extra gens","+ $10 на всеки доп. 100 генерирания")
              }
            ].map((p, i) => (
              <Card key={i} className={`relative border-white/10 ${p.popular ? 'bg-gradient-to-b from-white/10 to-white/5 ring-1 ring-white/10' : 'bg-white/5'}`}>
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
                    {p.bullets.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {f}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-xs text-white/60">{p.footnote}</div>
                  <a href="/client.html" target="_top"><Button className="mt-6 w-full">{t('Choose','Изберете')} {p.name}</Button></a>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow="FAQ" title="Answers to common questions" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { q: "How does the embed work?", a: "You paste a single script tag. We render an upload, generation, and before/after slider UI that calls your tenant‑scoped backend via signed URLs." },
              { q: "Is my data secure?", a: "Yes. Each tenant has isolated credentials and quotas. Images are processed with temporary signed URLs and never shared across tenants." },
              { q: "Can I customize the UI?", a: "Use data‑attributes for quick theming (width, radius, theme, variant). For full control, use our Admin API or CSS variables." },
              { q: "What model powers this?", a: "We use Gemini Nano Banana image edit model for fast, on‑device‑style edits delivered from managed infra." },
            ].map((item, i) => (
              <Card key={i} className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/70">{item.a}</CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA (now shows detailed install content) */}
      <section id="get-started" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow={t('Get started in 60 seconds','Старт за 60 секунди')}
            title={t('Install the embed','Инсталирайте виджета')}
            subtitle={t('Paste the snippet below, replace the embed id, and you’re live. Configure look‑and‑feel with data‑attributes — no extra JS required.','Поставете снипета по‑долу, заменете embed id и сте готови. Настройте визията чрез data‑атрибути — без допълнителен JS.')}
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <CodeBlock code={embedSnippet} />
              <div className="text-xs text-white/60">{t('Example settings:','Примерни настройки:')} <code>data-theme=\"dark\"</code>, <code>data-variant=\"compact\"</code>, <code>data-max-width</code>, <code>data-align</code>, <code>data-radius</code>, <code>data-shadow</code>, <code>data-border</code>.</div>
            </div>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-base">{t('What you’ll get','Какво получавате')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-white/70">
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {t('A polished dropzone with upload + generate','Изчистена зона за качване и генериране')}</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {t('A responsive before/after slider with badges','Адаптивен плъзгач Преди/След с етикети')}</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {t('One‑line install; all styling via attributes','Инсталация с един ред; стилове чрез атрибути')}</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {t('Per‑tenant analytics in the Client Portal','Аналитика по клиент в портала')}</div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Footer */}
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
              <a href="#" className="hover:text-white">Status</a>
              <a href="/app/docs.html" target="_top" className="hover:text-white">Docs</a>
              <a href="#" className="hover:text-white">Security</a>
              <a href="/app/terms.html" className="hover:text-white">Terms</a>
              <a href="/app/privacy.html" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
