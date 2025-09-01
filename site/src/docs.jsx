import React from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";

const Code = ({ children }) => (
  <pre className="whitespace-pre-wrap break-words rounded-md bg-black/60 p-3 text-xs text-white">{children}</pre>
);

function Docs() {
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-bold">Before/After Embed – Documentation</h1>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Quick Start</h2>
          <p className="mt-2 text-sm opacity-80">Paste the script snippet where you want the widget to appear.</p>
          <Code>{`<script async src="https://before-after-embed.vercel.app/embed.js"
  data-embed-id="your-embed-id"
  data-theme="light"
  data-max-width="640px"
  data-align="center">
</script>`}</Code>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Attributes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li><b>data-embed-id</b>: The id of the embed configured in your portal.</li>
            <li><b>data-theme</b>: <code>light</code> | <code>dark</code>.</li>
            <li><b>data-variant</b>: <code>compact</code> (Shadow DOM) | <code>card</code> (iframe for CSP pages).</li>
            <li><b>data-background</b> (card only): <code>transparent</code> | <code>inherit</code> – blend with host page.</li>
            <li><b>data-max-width</b>: Max container width (e.g. <code>640px</code>).</li>
            <li><b>data-align</b>: <code>left</code> | <code>center</code> | <code>right</code>.</li>
            <li><b>data-radius</b>, <b>data-shadow</b>, <b>data-border</b>: Card polish controls.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
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

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Client Portal</h2>
          <p className="mt-2 text-sm opacity-80">Create embeds, choose theme, copy Light/Dark snippet, and preview. Brand color is available on Growth/Pro plans.</p>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Troubleshooting</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
            <li>Seeing CSP errors? Use <code>data-variant="card"</code>.</li>
            <li>Want it to blend with host page? Use <code>data-background="transparent"</code> (card).</li>
            <li>Slider reversed? Hard refresh; ensure latest <code>embed.js</code> is loaded.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
ReactDOMClient.createRoot(rootEl).render(<Docs />);


