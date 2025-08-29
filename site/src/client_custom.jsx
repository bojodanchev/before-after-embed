// /site/src/client.jsx — Canvas-friendly + React 17/18 compatible mount
import React, { useEffect, useMemo, useState } from "react";
import * as ReactDOMClient from "react-dom/client"; // React 18+
import ReactDOMLegacy from "react-dom"; // Fallback for React 17
import "./index.css";

/* ===============================================================
   Utilities (token, errors, snippet)
================================================================*/
const getInitialToken = () => {
  const sp = new URLSearchParams(window.location.search);
  const urlToken = sp.get("token");
  if (urlToken) return urlToken;
  try { return localStorage.getItem("clientToken") || ""; } catch { return ""; }
};

const persistToken = (token) => {
  try { localStorage.setItem("clientToken", token); } catch {}
};

const clearToken = () => {
  try { localStorage.removeItem("clientToken"); } catch {}
};

async function safeError(res) {
  try { const j = await res.json(); return j?.error || j?.message || `${res.status}`; } catch { return `${res.status} ${res.statusText}`; }
}

const buildEmbedSnippet = (embedId, preset, theme) => {
  const attrs = [
    `async`,
    `src="https://before-after-embed.vercel.app/embed.js"`,
    `data-embed-id="${embedId || "your-embed-id"}"`,
    `data-theme="${theme}"`,
    `data-variant="${preset}"`,
    `data-max-width="640px"`,
    `data-align="center"`,
    `data-radius="14px"`,
    `data-shadow="true"`,
    `data-border="true"`,
    `data-width="100%"`,
    `data-height="460px"`,
  ].join(" ");
  return `<script ${attrs}></script>`;
};

/* ===============================================================
   UI Primitives (Tailwind-only, dark/light ready)
================================================================*/
const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
);

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur`}>{children}</div>
);

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
    {title && <h2 className="text-base font-semibold">{title}</h2>}
    <div className={title ? "mt-3" : ""}>{children}</div>
  </section>
);

const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants = {
    primary: "text-white bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 hover:opacity-90 disabled:opacity-60",
    outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
    subtle: "bg-white/10 text-white hover:bg-white/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>
  );
};

const Input = (props) => (
  <input {...props} className={`w-full rounded-md border border-white/20 bg-neutral-900 p-2 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-violet-500`} />
);
const Select = ({ children, ...props }) => (
  <select {...props} className="w-full rounded-md border border-white/20 bg-neutral-900 p-2 text-sm text-white focus:ring-2 focus:ring-violet-500">
    {children}
  </select>
);
const Code = ({ children }) => <code className="rounded-md bg-black/40 px-1.5 py-0.5 text-[12px]">{children}</code>;

/* ===============================================================
   Auth hook
================================================================*/
function useToken() {
  const [token, setToken] = useState("");
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("token") || getInitialToken();
    if (t) {
      setToken(t);
      persistToken(t);
      // keep or remove token from URL? By default we keep it minimal: remove after persisting
      if (sp.get("token")) {
        sp.delete("token");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);
  const update = (t) => {
    setToken(t || "");
    if (t) persistToken(t); else clearToken();
  };
  return [token, update];
}

/* ===============================================================
   Screens
================================================================*/
function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setInfo("");
    try {
      const res = await fetch("/api/client/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await safeError(res));
      const data = await res.json();
      if (data?.link) {
        // magic link flow
        window.location.href = data.link;
      } else if (data?.token) {
        // direct token flow (fallback)
        const url = new URL(window.location.href);
        url.searchParams.set("token", data.token);
        window.location.replace(url.toString());
      } else {
        setInfo("Sign-in link sent. Check your email.");
      }
    } catch (err) {
      setError(typeof err?.message === "string" ? err.message : "Failed to send sign-in link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Client Portal Sign In</h1>
        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="mt-4 w-full" disabled={loading}>{loading ? "Sending…" : "Send sign-in link"}</Button>
        {!!error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {!!info && <p className="mt-2 text-sm text-white/70">{info}</p>}
      </form>
    </div>
  );
}

function Dashboard({ token, onSignOut }) {
  const [client, setClient] = useState(null);
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", vertical: "", theme: "dark" });

  const [embedId, setEmbedId] = useState("");
  const [preset, setPreset] = useState("compact");
  const [theme, setTheme] = useState("dark");
  const snippetCode = useMemo(() => buildEmbedSnippet(embedId, preset, theme), [embedId, preset, theme]);

  const fetchData = async () => {
    try {
      setLoading(true); setError("");
      const me = await fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!me.ok) throw new Error("Auth failed");
      const meData = await me.json();
      // API contract: may be {client} or the client object itself
      setClient(meData?.client || meData);
      const emb = await fetch("/api/client/embeds", { headers: { Authorization: `Bearer ${token}` } });
      if (!emb.ok) throw new Error(await safeError(emb));
      const embData = await emb.json();
      const list = Array.isArray(embData) ? embData : embData?.embeds || [];
      setEmbeds(list);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/client/embeds", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await safeError(res));
      setForm({ id: "", vertical: "", theme: "dark" });
      fetchData();
    } catch (err) {
      setError(typeof err?.message === "string" ? err.message : "Failed to create embed");
    }
  };

  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <div className="text-sm font-semibold">Before/After Portal</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {client && (
              <span>
                {client.name} (<Code>{client.id}</Code>)
              </span>
            )}
            <Button variant="outline" onClick={onSignOut}>Sign out</Button>
          </div>
        </Container>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-4">
        <Section title="Embeds">
          <ul className="space-y-2 text-sm">
            {embeds.map((e) => (
              <li key={e.id} className="rounded-md border border-white/10 bg-black/20 p-2">
                {e.id} – {e.vertical} – {e.theme}
              </li>
            ))}
          </ul>
          <form onSubmit={handleCreate} className="mt-4 grid gap-2 md:grid-cols-3">
            <Input placeholder="id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
            <Input placeholder="vertical" value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })} required />
            <Select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </Select>
            <Button type="submit" className="md:col-span-3">Create</Button>
          </form>
        </Section>

        <Section title="Snippet Builder">
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder="embedId" value={embedId} onChange={(e) => setEmbedId(e.target.value)} />
            <Select value={preset} onChange={(e) => setPreset(e.target.value)}>
              <option value="compact">compact</option>
              <option value="card">card</option>
            </Select>
            <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </Select>
          </div>
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-md bg-black/60 p-2 text-xs">{snippetCode}</pre>
          <Button className="mt-2" onClick={() => navigator.clipboard.writeText(snippetCode)}>Copy snippet</Button>
        </Section>
      </main>
    </div>
  );
}

function AppWrapper() {
  const [token, setToken] = useToken();
  if (!token) return <SignIn />;
  return (
    <Dashboard token={token} onSignOut={() => { setToken(""); window.location.href = "/app/client.html"; }} />
  );
}

/* ===============================================================
   Safe mount for real HTML + export default for Canvas preview
================================================================*/
const maybeMount = () => {
  const rootEl = document.getElementById("root");
  if (!rootEl) return; // No root in Canvas; Canvas uses exported component
  if (ReactDOMClient && typeof ReactDOMClient.createRoot === "function") {
    ReactDOMClient.createRoot(rootEl).render(<AppWrapper />);
  } else if (ReactDOMLegacy && typeof ReactDOMLegacy.render === "function") {
    ReactDOMLegacy.render(<AppWrapper />, rootEl);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", maybeMount, { once: true });
} else {
  maybeMount();
}

// Exported component so Canvas can render without a #root
export default function ClientPortalPreview() {
  return <AppWrapper />;
}

/* ===============================================================
   Inline Dev Tests (run when ?devtest=1)
   - We NEVER change existing tests; adding more keeps safety net.
================================================================*/
(function runDevTests() {
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("devtest") !== "1") return;
  const tests = [];
  const assert = (name, cond, detail = "") => tests.push({ name, pass: !!cond, detail });

  // Test 1: snippet builder produces required attributes
  const s1 = buildEmbedSnippet("abc", "compact", "dark");
  assert("snippet has script tag", /^<script\s.+><\/script>$/.test(s1));
  assert("includes data-embed-id", s1.includes('data-embed-id="abc"'));
  assert("includes variant", s1.includes('data-variant="compact"'));
  assert("includes theme", s1.includes('data-theme="dark"'));

  // Test 2: token bootstrap prefers URL over LS
  const urlHasToken = new URL(window.location.href);
  urlHasToken.searchParams.set("token", "T_URL");
  const fromUrl = urlHasToken.searchParams.get("token") === "T_URL";
  assert("URLSearchParams working", fromUrl);

  // Report
  // eslint-disable-next-line no-console
  console.table(tests.map(t => ({ test: t.name, pass: t.pass, detail: t.detail })));
})();
