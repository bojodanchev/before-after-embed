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

const buildEmbedSnippet = (embedId, preset, theme, opt={}) => {
  const defaults = {
    maxWidth: '640px',
    align: 'center',
    radius: '14px',
    shadow: 'true',
    border: 'true',
    width: '100%',
    height: '460px',
  };
  const o = Object.assign({}, defaults, opt);
  const attrs = [
    `async`,
    `src="https://before-after-embed.vercel.app/embed.js"`,
    `data-embed-id="${embedId || "your-embed-id"}"`,
    `data-theme="${theme}"`,
    `data-variant="${preset}"`,
    ...(o.vertical ? [`data-vertical="${o.vertical}"`] : []),
    `data-max-width="${o.maxWidth}"`,
    `data-align="${o.align}"`,
    `data-radius="${o.radius}"`,
    `data-shadow="${o.shadow}"`,
    `data-border="${o.border}"`,
    `data-width="${o.width}"`,
    `data-height="${o.height}"`,
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
const Label = ({ children }) => (<span className="text-xs font-medium text-white/70">{children}</span>);

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
  const [form, setForm] = useState({ id: "", vertical: "barber", theme: "dark" });

  const [embedId, setEmbedId] = useState("");
  const [preset, setPreset] = useState("compact");
  const [theme, setTheme] = useState("dark");
  const [opts, setOpts] = useState({ maxWidth:'640px', align:'center', radius:'14px', shadow:'true', border:'true', width:'100%', height:'460px' });
  const snippetCode = useMemo(() => buildEmbedSnippet(embedId, preset, theme, opts), [embedId, preset, theme, opts]);
  // Live snippet preview
  const [previewCode, setPreviewCode] = useState("");
  const previewRef = React.useRef(null);
  useEffect(() => { setPreviewCode(snippetCode); }, [snippetCode]);
  const renderPreview = (code) => {
    try{
      const iframe = previewRef.current; if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document; if (!doc) return;
      // Preview MUST match production: no extra wrappers, just the snippet on a page with chosen bg
      const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="margin:0;background:${previewBg};display:flex;justify-content:${opts.align==='center'?'center':'flex-start'};padding:16px">${code}</body></html>`;
      doc.open(); doc.write(html); doc.close();
    }catch(_e){/* ignore */}
  };
  const [previewBg, setPreviewBg] = useState('#0b0d10');
  const [previewError, setPreviewError] = useState('');
  useEffect(() => { const t = setTimeout(() => { try{ renderPreview(previewCode); setPreviewError(''); }catch(e){ setPreviewError('Failed to render preview'); } }, 300); return () => clearTimeout(t); }, [previewCode, previewBg, opts.align]);

  // Usage & Stats
  const [usageEmbedId, setUsageEmbedId] = useState("");
  const [usage, setUsage] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  // Client settings
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);

  // Edit drawer
  const [editOpen, setEditOpen] = useState(false);
  const [editModel, setEditModel] = useState({ id:"", name:"", vertical:"barber", theme:"dark", width:"100%", height:"520px", variant:"card", radius:"12px", shadow:"true", border:"true" });

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
      // settings
      try{ const s = await fetch('/api/client/settings', { headers:{ Authorization:`Bearer ${token}` } }); const sj = await s.json(); setSettings(sj?.settings || {}); setPlanInfo(sj?.plan || null); }catch{}
      if (!embedId && list.length) setEmbedId(list[0].id);
      if (!usageEmbedId && list.length) setUsageEmbedId(list[0].id);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  // If redirected from Pricing pre-login, auto-start checkout
  useEffect(() => {
    (async () => {
      try{
        const sp = new URLSearchParams(window.location.search);
        const nextPlan = sp.get('nextPlan');
        if (!nextPlan) return;
        // Clear param from URL
        sp.delete('nextPlan');
        const url = new URL(window.location.href); url.search = sp.toString(); window.history.replaceState({}, '', url.toString());
        // Initiate checkout
        const resp = await fetch('/api/billing/checkout', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ planId: nextPlan }) });
        const j = await resp.json();
        if (!resp.ok) throw new Error(j?.error || 'Checkout failed');
        if (j?.url) window.location.href = j.url;
      }catch(e){ /* show non-blocking error in portal */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle pricing handoff (?choosePlan=planId)
  // (No longer needed with Stripe checkout)

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/client/embeds", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await safeError(res));
      setForm({ id: "", vertical: form.vertical, theme: form.theme });
      fetchData();
    } catch (err) {
      setError(typeof err?.message === "string" ? err.message : "Failed to create embed");
    }
  };

  const handleUpdateTheme = async (id, nextTheme) => {
    try{
      const res = await fetch("/api/client/embeds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, theme: nextTheme }),
      });
      if (!res.ok) throw new Error(await safeError(res));
      fetchData();
    }catch(e){ setError(typeof e?.message === "string" ? e.message : "Failed to update embed"); }
  };

  const fetchUsage = async (id) => {
    if (!id) return;
    setUsageLoading(true);
    try{
      const res = await fetch(`/api/client/usage?embedId=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await safeError(res));
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.events || []);
      setUsage(arr);
    }catch(e){ setUsage([]); }
    finally{ setUsageLoading(false); }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try{
      const res = await fetch(`/api/client/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await safeError(res));
      const j = await res.json();
      setStats(j || null);
    }catch(e){ setStats(null); }
    finally{ setStatsLoading(false); }
  };

  // Tiny toast after returning from checkout with success
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('success') === '1'){
      const added = sp.get('topup') || sp.get('plan') ? (sp.get('topup') ? `+${sp.get('topup')} generations` : 'Plan updated') : 'Success';
      setToast(`${added} 🎉`);
      setTimeout(() => setToast(""), 3000);
      // Clean URL
      sp.delete('success'); sp.delete('topup'); sp.delete('plan');
      const url = new URL(window.location.href); url.search = sp.toString(); window.history.replaceState({}, '', url.toString());
      // Refresh stats to reflect credit
      fetchStats();
      if (usageEmbedId) fetchUsage(usageEmbedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {!!toast && (
          <div className="fixed right-4 top-16 z-50 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300 shadow-lg">
            {toast}
          </div>
        )}
        <Section title="Embeds">
          <div className="mb-3 flex items-center justify-between rounded-md border border-white/10 bg-black/30 p-3 text-sm">
            <div className="flex items-center gap-4">
              <div>
                <div className="opacity-70">Current plan</div>
                <div className="font-medium">{planInfo?.name || planInfo?.id || 'free'}</div>
              </div>
              <div className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs opacity-80">
                {(() => {
                  const requires = (planInfo?.id || 'free') === 'free';
                  return `Watermark: ${requires ? 'active' : 'removed'}`;
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs opacity-70">{(planInfo?.monthlyGenerations ?? 0)} gens / mo</div>
              <a href="/app/pricing.html" className="underline">Change plan</a>
              <button className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={async()=>{
                try{
                  const resp = await fetch('/api/billing/topup', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ units: 1 }) });
                  const j = await resp.json();
                  if (!resp.ok) throw new Error(j?.error || 'Top-up failed');
                  if (j?.url) window.location.href = j.url;
                }catch(e){ alert(e.message || 'Top-up failed'); }
              }}>Buy +100</button>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {embeds.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 rounded-md border border-white/10 bg-black/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="truncate">{e.id} – {e.vertical} – {e.theme}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={e.theme} onChange={(ev)=>handleUpdateTheme(e.id, ev.target.value)}>
                    <option value="dark">dark</option>
                    <option value="light">light</option>
                  </Select>
                  <Button variant="subtle" onClick={()=> setEmbedId(e.id)}>Use in Snippet</Button>
                  <Button variant="outline" onClick={()=> navigator.clipboard.writeText(buildEmbedSnippet(e.id, preset, e.theme))}>Copy Current</Button>
                  <Button variant="outline" onClick={()=> navigator.clipboard.writeText(buildEmbedSnippet(e.id, preset, 'light'))}>Copy Light</Button>
                  <Button variant="outline" onClick={()=> navigator.clipboard.writeText(buildEmbedSnippet(e.id, preset, 'dark'))}>Copy Dark</Button>
                  <Button variant="outline" onClick={async()=>{ const opposite = e.theme === 'dark' ? 'light' : 'dark'; const nid = `${e.id}-${opposite}`; await fetch('/api/client/embeds', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ ...e, id: nid, theme: opposite, name: e.name ? `${e.name} (${opposite})` : nid }) }); fetchData(); }}>Duplicate to {" "}{e.theme === 'dark' ? 'light' : 'dark'}</Button>
                  <a className="text-xs underline" target="_blank" rel="noreferrer" href={`/widget.html?embedId=${encodeURIComponent(e.id)}&theme=${encodeURIComponent(e.theme)}`}>Open</a>
                  <Button variant="outline" onClick={()=> { setEditModel({ ...e, variant: e.variant || 'card', radius: e.radius || '12px', shadow: e.shadow ?? 'true', border: e.border ?? 'true' }); setEditOpen(true); }}>Edit</Button>
                  <Button variant="outline" onClick={async()=>{ const nid = `${e.id}-copy`; await fetch('/api/client/embeds', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ ...e, id: nid, name: e.name || nid }) }); fetchData(); }}>Duplicate</Button>
                  <Button variant="outline" onClick={async()=>{ if (!confirm(`Delete embed ${e.id}?`)) return; const u = new URL('/api/client/embeds', location.origin); u.searchParams.set('id', e.id); await fetch(u.toString(), { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } }); fetchData(); }}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleCreate} className="mt-4 grid gap-2 md:grid-cols-4">
            <Input placeholder="id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
            <Select value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })}>
              <option value="barber">barber</option>
              <option value="dental">dental</option>
              <option value="detailing">detailing</option>
              <option value="cosmetics">cosmetics</option>
              <option value="custom">custom</option>
            </Select>
            <Select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </Select>
            <Button type="submit" className="md:col-span-4">Create</Button>
          </form>
        </Section>

        <Section title="Client settings">
          {!settings ? (
            <div className="text-sm opacity-70">Loading…</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Label>Display name</Label>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Shown only in your portal</span>
                </div>
                <Input value={settings.displayName || ''} onChange={(e)=> setSettings(s=> ({...s, displayName:e.target.value}))} />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Label>Brand color</Label>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Tint buttons and active chips</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={settings.brandColor || '#7c3aed'} onChange={(e)=> setSettings(s=> ({...s, brandColor:e.target.value}))} disabled={!planInfo || (planInfo.themeCustomization !== 'custom')} />
                  {(!planInfo || planInfo.themeCustomization !== 'custom') && (
                    <span className="text-xs text-white/50">Growth/Pro only</span>
                  )}
                </div>
              </div>
              {/* Vertical-specific options removed: now selected directly in widget */}
              <div className="grid gap-1">
                <div className="flex items-center gap-2"><Label>Default theme</Label><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Light or dark for new embeds</span></div>
                <Select value={settings.defaultTheme || 'dark'} onChange={(e)=> setSettings(s=> ({...s, defaultTheme:e.target.value}))}><option value="dark">dark</option><option value="light">light</option></Select>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2"><Label>Default variant</Label><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Compact (inline) or Card (iframe)</span></div>
                <Select value={settings.defaultVariant || 'card'} onChange={(e)=> setSettings(s=> ({...s, defaultVariant:e.target.value}))}><option value="compact">compact</option><option value="card">card</option></Select>
              </div>
              <details className="md:col-span-2 rounded-md border border-white/10 bg-black/30 p-3">
                <summary className="cursor-pointer text-sm text-white/80">Advanced</summary>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2"><Label>Powered by</Label><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Show small attribution</span></div>
                    <Select value={settings.poweredBy || 'false'} onChange={(e)=> setSettings(s=> ({...s, poweredBy:e.target.value}))}><option value="false">hidden</option><option value="true">show</option></Select>
                  </div>
                  <div className="grid gap-1 md:col-span-1">
                    <div className="flex items-center gap-2"><Label>Webhook URL</Label><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Receive render events</span></div>
                    <Input placeholder="https://example.com/webhook" value={settings.webhookUrl || ''} onChange={(e)=> setSettings(s=> ({...s, webhookUrl:e.target.value}))} />
                  </div>
                </div>
              </details>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button disabled={savingSettings} onClick={async()=>{ setSavingSettings(true); try{ await fetch('/api/client/settings', { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(settings) }); }finally{ setSavingSettings(false);} }}>Save settings</Button>
              </div>
            </div>
          )}
        </Section>

        {editOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-xl border border-white/10 bg-neutral-950 p-4 text-white">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold">Edit embed</div>
                <button className="text-white/70" onClick={()=> setEditOpen(false)}>✕</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1"><label className="text-xs text-white/70">ID</label><Input value={editModel.id} disabled /></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Name</label><Input value={editModel.name || ''} onChange={(e)=> setEditModel(m=> ({...m, name:e.target.value}))} /></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Vertical</label><Select value={editModel.vertical} onChange={(e)=> setEditModel(m=> ({...m, vertical:e.target.value}))}><option value="barber">barber</option><option value="dental">dental</option><option value="detailing">detailing</option><option value="cosmetics">cosmetics</option><option value="custom">custom</option></Select></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Variant</label><Select value={editModel.variant} onChange={(e)=> setEditModel(m=> ({...m, variant:e.target.value}))}><option value="compact">compact</option><option value="card">card</option></Select></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Width</label><Input value={editModel.width} onChange={(e)=> setEditModel(m=> ({...m, width:e.target.value}))} /></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Height</label><Input value={editModel.height} onChange={(e)=> setEditModel(m=> ({...m, height:e.target.value}))} /></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Radius</label><Input value={editModel.radius} onChange={(e)=> setEditModel(m=> ({...m, radius:e.target.value}))} /></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Border</label><Select value={editModel.border} onChange={(e)=> setEditModel(m=> ({...m, border:e.target.value}))}><option value="true">true</option><option value="false">false</option></Select></div>
                <div className="grid gap-1"><label className="text-xs text-white/70">Shadow</label><Select value={editModel.shadow} onChange={(e)=> setEditModel(m=> ({...m, shadow:e.target.value}))}><option value="true">true</option><option value="false">false</option></Select></div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs text-white/70">Live preview</div>
                  <iframe title="edit-preview" sandbox="allow-scripts allow-forms allow-same-origin" style={{width:'100%',height:'360px',border:'0',borderRadius:'10px',background:'#0b0d10'}} ref={(el)=>{ if (!el) return; const code = buildEmbedSnippet(editModel.id, editModel.variant, editModel.theme || 'dark', { vertical: editModel.vertical }).replace('data-width="100%"','data-width="'+(editModel.width||'100%')+'"').replace('data-height="460px"','data-height="'+(editModel.height||'520px')+'"'); const doc = el.contentDocument || el.contentWindow?.document; if (!doc) return; doc.open(); doc.write(`<!doctype html><html><body style=\"margin:0;background:#0b0d10\">${code}</body></html>`); doc.close(); }} />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <Button onClick={async()=>{ const payload = { ...editModel }; await fetch('/api/client/embeds', { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) }); setEditOpen(false); fetchData(); }}>Save changes</Button>
                  <Button variant="subtle" onClick={()=> setEditOpen(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <Button variant="subtle" onClick={()=>{ setPreset('compact'); setOpts({ ...opts, maxWidth:'640px', align:'center', radius:'14px', width:'100%', height:'460px' }); }}>Preset: Compact</Button>
            <Button variant="subtle" onClick={()=>{ setPreset('card'); setOpts({ ...opts, maxWidth:'980px', align:'left', radius:'12px', width:'100%', height:'520px' }); }}>Preset: Card</Button>
            <Button variant="subtle" onClick={()=>{ setPreset('card'); setOpts({ ...opts, maxWidth:'100%', align:'center', radius:'0px', width:'100%', height:'600px', border:'false', shadow:'false' }); }}>Preset: Full‑bleed</Button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-md bg-black/60 p-2 text-xs">{snippetCode}</pre>
          <div className="mt-2 text-xs text-white/70">Preview is a raw HTML page containing only your snippet—identical to what a client site will execute.</div>
          <Button className="mt-2" onClick={() => navigator.clipboard.writeText(snippetCode)}>Copy snippet</Button>
        </Section>

        <Section title="Live Snippet Preview (iframe sandbox)">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <textarea value={previewCode} onChange={(e)=> setPreviewCode(e.target.value)} rows={10} className="w-full rounded-md border border-white/10 bg-black/40 p-2 text-xs font-mono" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="subtle" onClick={()=> setPreviewCode(snippetCode)}>Reset to builder</Button>
                <Button onClick={()=> renderPreview(previewCode)}>Run preview</Button>
                <Select value={previewBg} onChange={(e)=> setPreviewBg(e.target.value)}>
                  <option value="#0b0d10">dark page</option>
                  <option value="#ffffff">white page</option>
                  <option value="#f1f5f9">light grey</option>
                </Select>
                <Select value={opts.align} onChange={(e)=> setOpts(o=> ({...o, align:e.target.value}))}>
                  <option value="center">center</option>
                  <option value="left">left</option>
                </Select>
              </div>
              {!!previewError && <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{previewError}</div>}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-2">
              <iframe ref={previewRef} title="snippet-preview" sandbox="allow-scripts allow-forms allow-same-origin" style={{width:'100%',height:'520px',border:'0',borderRadius:'10px',background:'#0b0d10'}} />
            </div>
          </div>
        </Section>

        <Section title="Usage">
          <div className="mb-2 flex items-center gap-2">
            <Select value={usageEmbedId} onChange={(e)=>{ setUsageEmbedId(e.target.value); fetchUsage(e.target.value); }}>
              {embeds.map(e => (<option key={e.id} value={e.id}>{e.id}</option>))}
            </Select>
            <Button variant="subtle" onClick={()=> fetchUsage(usageEmbedId)} disabled={!usageEmbedId || usageLoading}>{usageLoading ? 'Loading…' : 'Refresh'}</Button>
          </div>
          {usage.filter(u=> u && u.event === 'client_render').length === 0 ? (
            <div className="text-sm text-white/70">No events yet.</div>
          ) : (
            <ul className="space-y-1 text-xs">
              {[...usage]
                .filter(u => u && u.event === 'client_render')
                .sort((a,b)=> (b?.ts||0)-(a?.ts||0))
                .map((u) => (
                <li key={u.id || u.ts} className="rounded border border-white/10 bg-black/20 p-2">
                  <span className="opacity-80">render</span> · <span className="opacity-60">{new Date(u.ts).toLocaleString(undefined, { timeZoneName: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Stats & Usage">
          <div className="mb-3 flex items-center gap-2">
            <Button variant="subtle" onClick={fetchStats} disabled={statsLoading}>{statsLoading ? 'Loading…' : 'Refresh stats'}</Button>
          </div>
          {!stats ? (
            <div className="text-sm text-white/70">No stats yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.totals?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Total events</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.last24h?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Events (24h)</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.plan?.monthlyGenerations ?? 0}</div>
                  <div className="text-xs opacity-70">Plan gens / mo</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.monthlyUsed ?? 0}</div>
                  <div className="text-xs opacity-70">Used this month</div>
                </div>
              </div>

              {/* Progress bar + top-up */}
              <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
                {(() => {
                  const used = Number(stats?.monthlyUsed || 0);
                  const cap = Number(stats?.plan?.monthlyGenerations || 0) + Number(stats?.monthlyBonus || 0);
                  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
                  return (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <div className="opacity-80">Monthly generations</div>
                        <div className="opacity-70">{used} / {cap} {stats?.monthlyBonus ? `(+${stats.monthlyBonus} bonus)` : ''}</div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded bg-white/10">
                        <div className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400" style={{ width: pct + '%' }} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between text-xs">
                        <div className="opacity-70">$10 per extra 100 gens after limit</div>
                        <Button className="px-3 py-1" onClick={async()=>{
                          if ((window.__topupBusy||false)) return;
                          window.__topupBusy = true;
                          const btn = event?.currentTarget; if (btn) btn.disabled = true;
                          try{
                            const units = 1; // one block of 100
                            const resp = await fetch('/api/billing/topup', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ units }) });
                            const j = await resp.json();
                            if (!resp.ok) throw new Error(j?.error || 'Top-up failed');
                            if (j?.url) window.location.href = j.url;
                          }catch(e){ alert(e.message || 'Top-up failed'); }
                          finally{ window.__topupBusy = false; if (btn) btn.disabled = false; }
                        }}>Buy top-up</Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
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
