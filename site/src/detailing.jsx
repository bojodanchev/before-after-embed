import React from "react";
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
  const snippet = `<script async src=\"https://before-after-embed.vercel.app/embed.js\"\n  data-embed-id=\"your-embed-id\"\n  data-theme=\"dark\"\n  data-variant=\"compact\"\n  data-max-width=\"720px\"\n  data-align=\"center\">\n<\/script>`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-rose-500 shadow-lg shadow-red-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After — Auto Detailing</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">Main site</a>
            <a href="/app/docs.html" className="hover:text-white">Docs</a>
            <a href="/client.html" target="_top" className="hover:text-white">Client Portal</a>
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(251,113,133,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Show the shine before the polish</h1>
            <p className="mt-4 text-lg text-white/70">Perfect for paint correction, wraps and ceramic coat upsells. Upload, generate, and slide to compare.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>Get started</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">Docs</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-red-600/15 via-rose-500/15 to-orange-400/15 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Install in 60 seconds</h3>
              <p className="mt-2 text-white/80">Paste the script and use data-variant / data-theme to style.</p>
            </div>
            <div className="rounded-2xl border border-red-900/20 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Recommended options</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>Paint correction — remove swirls and fine scratches; realistic reflections</li>
            <li>Ceramic coating — emphasize gloss and water beading</li>
            <li>Wrap color preview — show subtle color shifts; keep make/model</li>
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Why detailers choose us</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Upsell with visuals</div>
              <p className="mt-1">Before/After comparisons help clients choose premium services.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Set clear expectations</div>
              <p className="mt-1">Show realistic outcomes for correction, wraps, and coatings.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Faster bookings</div>
              <p className="mt-1">Move from interest to scheduled service in minutes.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>1.</b> Paste the script on your site.</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>2.</b> Clients upload a photo, choose correction / wrap / coat.</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>3.</b> They view a Before/After and book a service.</li>
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Results you can expect</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center">
            {[{k:'+30%',v:'higher premium upsells'},{k:'-20%',v:'fewer quote drop‑offs'},{k:'< 60s',v:'to first visualization'}].map((s,i)=> (
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


