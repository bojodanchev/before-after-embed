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

function BarberPage(){
  const snippet = `<script async src=\"https://before-after-embed.vercel.app/embed.js\"\n  data-embed-id=\"your-embed-id\"\n  data-theme=\"light\"\n  data-variant=\"compact\"\n  data-max-width=\"640px\"\n  data-align=\"center\">\n<\/script>`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After — Barbers</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">Main site</a>
            <a href="/app/docs.html" className="hover:text-white">Docs</a>
            <a href="/client.html" target="_top" className="hover:text-white">Client Portal</a>
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(14,165,233,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Preview the cut before the chair</h1>
            <p className="mt-4 text-lg text-white/70">Perfect for haircuts, fades and beard styling. Upload, generate, and slide to compare.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>Get started</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">Docs</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-sky-500/15 to-cyan-400/15 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">Install in 60 seconds</h3>
              <p className="mt-2 text-white/80">Paste the script and use data-variant / data-theme to style.</p>
            </div>
            <div className="rounded-2xl border border-blue-900/20 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Recommended options</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>Haircut preview — show subtle style changes without changing hair color drastically</li>
            <li>Fade levels — let customers compare skin/low/mid/high fade looks</li>
            <li>Beard styling — outline, density and length refinement</li>
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Why barbers choose us</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Fewer regrets</div>
              <p className="mt-1">Customers preview styles before committing, reducing reworks and refunds.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Higher satisfaction</div>
              <p className="mt-1">Align on expectations in seconds with a realistic before/after.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">Faster decisions</div>
              <p className="mt-1">Help undecided customers pick a style quickly.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>1.</b> Paste the script on your site.</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>2.</b> Customers upload a selfie, choose haircut/fade/beard styling.</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>3.</b> They view a Before/After and book an appointment.</li>
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">Results you can expect</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center">
            {[{k:'+15%',v:'higher upsell acceptance'},{k:'-20%',v:'fewer reworks'},{k:'< 60s',v:'to first preview'}].map((s,i)=> (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-3xl font-semibold text-sky-300">{s.k}</div>
                <div className="mt-1 text-sm text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<BarberPage />);
