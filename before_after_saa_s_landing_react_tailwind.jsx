import React, { useRef, useState } from "react";
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
            <a href="#demo" className="hover:text-white">Live demo</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="/app/docs.html" target="_top" className="hover:text-white">Docs</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/client.html" target="_top" className="hover:text-white">Client Portal</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/client.html" target="_top"><Button variant="secondary" className="hidden bg-white/10 text-white hover:bg-white/20 sm:inline-flex">Client Portal</Button></a>
            <a href="#demo"><Button className="gap-2">Try the demo <ArrowRight className="h-4 w-4"/></Button></a>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Let customers visualize results before they buy</h1>
            <p className="mt-4 text-lg text-white/70">Embed a beautiful, one‑click AI visualizer on any website. Perfect for barbers, dental clinics, car detailing and more. Upload a photo, click Generate, slide to compare.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#demo"><Button size="lg" className="gap-2">
                Try the Live Demo <ArrowRight className="h-5 w-5" />
              </Button></a>
              <a href="/client.html" target="_top"><Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                Client Portal
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
            eyebrow="Product"
            title="Drop‑in embed. Modern UI. Multi‑tenant by design."
            subtitle="Paste one script tag. Configure layout with data‑attributes. Provision embeds per client, manage themes and verticals, and track usage — all with a clean, conversion‑ready UI."
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

      {/* Snippet */}
      <section id="docs" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow="Get started in 60 seconds"
            title="Install the embed"
            subtitle="Paste the snippet below, replace the embed id, and you’re live. Configure look‑and‑feel with data‑attributes — no extra JS required."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <CodeBlock code={embedSnippet} />
              <div className="text-xs text-white/60">Example settings: <code>data-theme="dark"</code>, <code>data-variant="compact"</code>, <code>data-max-width</code>, <code>data-align</code>, <code>data-radius</code>, <code>data-shadow</code>, <code>data-border</code>.</div>
            </div>
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-base">What you’ll get</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-white/70">
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> A polished dropzone with upload + generate</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> A responsive before/after slider with badges</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> One‑line install; all styling via attributes</div>
                <div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> Per‑tenant analytics in the Client Portal</div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Vertical examples */}
      <section className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow="Use cases"
            title="Built for barbers, dental clinics, car detailing and more"
            subtitle="Show the transformation. Remove buyer hesitation. Convert with proof in one click."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Barbers & salons", desc: "Preview haircuts, color, or beard styling before the chair.", icon: <Paintbrush className="h-5 w-5"/> },
              { title: "Dental clinics", desc: "Project whitening, veneers, or aligner results from a selfie.", icon: <Shield className="h-5 w-5"/> },
              { title: "Car detailing", desc: "Visualize paint correction, wrap colors, and ceramic coatings.", icon: <ImageIcon className="h-5 w-5"/> },
            ].map((f, i) => (
              <Card key={i} className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">{f.icon} {f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/70">{f.desc}</CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/10 py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow="Pricing" title="Clear, adoption‑first plans" subtitle="All paid tiers include overage: $10 per extra 100 generations." />
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                name: "Free", price: "$0", badge: "Test Drive", popular:false,
                includes: "10 generations / mo",
                bullets: ["1 embed", "Watermark required", "Basic light/dark theme"],
                footnote: "For trials; limited usage"
              },
              {
                name: "Starter", price: "$24", badge: null, popular:false,
                includes: "300 generations / mo",
                bullets: ["1 embed", "Basic light/dark theme", "Watermark removed"],
                footnote: "+ $10 per 100 extra gens"
              },
              {
                name: "Growth", price: "$49", badge: "Most Popular", popular:true,
                includes: "600 generations / mo",
                bullets: ["Up to 3 embeds", "Customizable theme", "Remove watermark", "Basic analytics"],
                footnote: "+ $10 per 100 extra gens"
              },
              {
                name: "Pro", price: "$99", badge: null, popular:false,
                includes: "1,500 generations / mo",
                bullets: ["Up to 10 embeds", "Advanced analytics", "API + Webhooks", "Priority support"],
                footnote: "+ $10 per 100 extra gens"
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
                  <div className="mt-1 text-sm text-emerald-300">Includes {p.includes}</div>
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {p.bullets.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> {f}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-xs text-white/60">{p.footnote}</div>
                  <a href="/client.html" target="_top"><Button className="mt-6 w-full">Choose {p.name}</Button></a>
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

      {/* CTA */}
      <section id="get-started" className="border-t border-white/10 py-16 sm:py-24">
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
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
