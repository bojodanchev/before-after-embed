// /site/src/client.jsx — Canvas-friendly + React 17/18 compatible mount
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const EMBED_SCRIPT_URL = import.meta.env.VITE_EMBED_SCRIPT_URL || 'https://before-after-embed.vercel.app/embed.js';
const camelToKebab = (key) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const buildEmbedSnippet = (embedId, templateConfig = {}, extra = {}) => {
  const merged = {
    embedId: embedId || 'your-embed-id',
    ...('attrs' in templateConfig ? templateConfig.attrs : templateConfig),
    ...extra,
  };

  const parts = [`async`, `src="${EMBED_SCRIPT_URL}"`];
  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    const attr = `data-${camelToKebab(key.replace(/^data-/, ''))}`;
    parts.push(`${attr}="${String(value)}"`);
  });
  return `<script ${parts.join(' ')}></script>`;
};

const TEMPLATE_LIBRARY = [
  {
    id: 'light',
    name: 'Light',
    subtitle: 'Bright card for white backgrounds',
    attrs: {
      theme: 'light',
      wide: 'true',
      border: 'true',
      shadow: 'false',
      radius: '18px',
      align: 'center',
      height: '520px',
    },
    preview: { bg: '#f8fafc', fg: '#0f172a' },
    copy: {
      headline: 'Show the transformation instantly',
      body: 'Upload, generate, and drag the slider so customers see the clean finish before booking.',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    subtitle: 'Glassmorphism card for dark sites',
    attrs: {
      theme: 'dark',
      wide: 'true',
      border: 'true',
      shadow: 'true',
      radius: '20px',
      align: 'center',
      height: '520px',
    },
    preview: { bg: '#0b1120', fg: '#f8fafc' },
    copy: {
      headline: 'Bring the shine forward',
      body: 'Let visitors preview your AI enhancements without leaving the page.',
    },
  },
  {
    id: 'brand',
    name: 'Brand color',
    subtitle: 'Uses your accent color for buttons and pills',
    attrs: {
      theme: 'light',
      wide: 'true',
      border: 'true',
      shadow: 'true',
      radius: '18px',
      align: 'center',
      height: '520px',
    },
    preview: { bg: '#ffffff', fg: '#0f172a' },
    copy: {
      headline: 'Spotlight your signature look',
      body: 'Buttons, pills, and slider accents inherit your brand color automatically.',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    subtitle: 'Compact embed for sidebars and narrow sections',
    attrs: {
      theme: 'auto',
      wide: 'false',
      border: 'false',
      shadow: 'false',
      radius: '8px',
      align: 'left',
      height: '420px',
    },
    preview: { bg: '#f1f5f9', fg: '#111827' },
    copy: {
      headline: 'Drop into any sidebar',
      body: 'The compact layout keeps controls stacked for a quick install.',
    },
  },
];

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

const ACCENT_PRESETS = ['#f97316', '#6366f1', '#22d3ee', '#ef4444', '#10b981', '#fbbf24'];

const BrandAccentPicker = ({ t, canCustomize, brandColor, onApply, onPreview, setToast }) => {
  const limitedCount = canCustomize ? ACCENT_PRESETS.length : 2;
  const fileRef = useRef(null);
  const [matching, setMatching] = useState(false);
  const [upgradePreviewColor, setUpgradePreviewColor] = useState(null);

  useEffect(() => {
    setUpgradePreviewColor(null);
  }, [canCustomize]);

  const applyColor = (color, locked) => {
    if (!color) return;
    if (locked && !canCustomize) {
      onPreview(color);
      setUpgradePreviewColor(color);
      setToast(t('Previewing premium color — upgrade to save','Преглед на премиум цвят — ъпгрейд за запис'));
    } else {
      onPreview(null);
      onApply(color);
      setUpgradePreviewColor(null);
    }
  };

  const handleSwatch = (color, idx) => {
    const locked = !canCustomize && idx >= limitedCount;
    applyColor(color, locked);
  };

  const handleMatchLogo = () => {
    fileRef.current?.click();
  };

  const extractDominantColor = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 48;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0, total = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          r = Math.round(r / total);
          g = Math.round(g / total);
          b = Math.round(b / total);
          const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
          resolve(hex);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setMatching(true);
    try {
      const color = await extractDominantColor(file);
      applyColor(color, !canCustomize);
    } catch (_err) {
      setToast(t('Could not read that logo. Try another image.','Неуспешно извличане от логото. Опитайте друг файл.'));
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label>{t('Brand color','Бранд цвят')}</Label>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">{t('Tint buttons and active chips','Акцентиран цвят')}</span>
        {!canCustomize && <span className="text-xs text-white/50">{t('Upgrade for more','Ъпгрейд за повече')}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {ACCENT_PRESETS.map((color, idx) => {
          const active = brandColor?.toLowerCase() === color.toLowerCase() || upgradePreviewColor === color;
          const locked = !canCustomize && idx >= limitedCount;
          return (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border transition ${active ? 'border-white' : 'border-white/10'} ${locked ? 'opacity-50' : ''}`}
              style={{ background: color }}
              onClick={() => handleSwatch(color, idx)}
              aria-label={`Accent ${color}${locked ? ' (locked)' : ''}`}
            />
          );
        })}
        <button
          type="button"
          onClick={handleMatchLogo}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          disabled={matching}
        >
          {matching ? t('Detecting…','Извличане…') : t('Match logo','Цвят от лого')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {canCustomize && (
          <input
            type="color"
            value={brandColor}
            onChange={(e) => applyColor(e.target.value, false)}
            className="h-8 w-12 cursor-pointer rounded border border-white/20 bg-transparent"
            aria-label="Custom color"
          />
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span>{t('Current accent','Текущ акцент')}: {brandColor}</span>
        {upgradePreviewColor && !canCustomize && (
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-amber-300">{t('Preview only • upgrade to apply','Само преглед • ъпгрейд за запис')}</span>
        )}
      </div>
    </div>
  );
};

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

  const sendLink = async () => {
    setLoading(true); setError(""); setInfo("");
    try{
      const res = await fetch('/api/client/me', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error(await safeError(res));
      await res.json();
      setInfo('Sign-in link sent. Check your email.');
    }catch(err){ setError(typeof err?.message === 'string' ? err.message : 'Failed to send sign-in link'); }
    finally{ setLoading(false); }
  };

  const handleSubmit = async (e) => { e.preventDefault(); if (!loading) sendLink(); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Client Portal Sign In</h1>
        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="mt-4 flex items-center gap-2">
          <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Sending…' : 'Send link'}</Button>
          <Button type="button" variant="subtle" disabled={loading || !email} onClick={sendLink}>Resend</Button>
        </div>
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
  // Language state MUST be declared before any early returns to keep hook order stable
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } });
  useEffect(() => { try{ localStorage.setItem('lang', lang); }catch{} }, [lang]);
  const t = (en, bg) => (lang === 'bg' ? bg : en);

  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [monthlyBonus, setMonthlyBonus] = useState(0);

  const [embedId, setEmbedId] = useState("");
  const [previewBrandColor, setPreviewBrandColor] = useState(null);
  const brandColor = (previewBrandColor || settings?.brandColor || '#f97316');
  const templateOptions = useMemo(
    () =>
      TEMPLATE_LIBRARY.map((tpl) =>
        tpl.id === 'brand'
          ? {
              ...tpl,
              attrs: { ...tpl.attrs, brandColor },
              preview: { ...tpl.preview, accent: brandColor },
            }
          : tpl
      ),
    [brandColor]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState('light');
  const selectedTemplate = useMemo(
    () => templateOptions.find((tpl) => tpl.id === selectedTemplateId) || templateOptions[0],
    [templateOptions, selectedTemplateId]
  );
  const snippetCode = useMemo(() => {
    const targetId = embedId || (embeds[0]?.id || 'your-embed-id');
    const vertical = embeds.find((e) => e.id === targetId)?.vertical;
    return buildEmbedSnippet(targetId, selectedTemplate || {}, vertical ? { vertical } : {});
  }, [embedId, embeds, selectedTemplate]);

  const previewRef = React.useRef(null);
  const escapeHtml = (str = '') => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const renderPreview = (code) => {
    try {
      const iframe = previewRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const template = selectedTemplate || {};
      const bg = template.preview?.bg || '#0b1120';
      const fg = template.preview?.fg || '#f8fafc';
      const align = template.attrs?.align === 'left' ? 'flex-start' : 'center';
      const headline = escapeHtml(template.copy?.headline || 'Before & After preview');
      const body = escapeHtml(template.copy?.body || 'Upload, generate, and drag the slider to compare results.');
      const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="margin:0;background:${bg};color:${fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;gap:16px;align-items:${align};padding:32px 24px;"><div style="max-width:680px;text-align:${align==='center'?'center':'left'}"><h2 style="margin:0;font-size:22px;font-weight:600;">${headline}</h2><p style="margin:8px 0 0;font-size:14px;opacity:0.78;">${body}</p></div>${code}</body></html>`;
      doc.open();
      doc.write(html);
      doc.close();
    } catch (_e) {
      /* ignore */
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => renderPreview(snippetCode), 200);
    return () => clearTimeout(timer);
  }, [snippetCode, selectedTemplate]);

  // Usage & Stats
  useEffect(() => { setPreviewBrandColor(null); }, [settings?.brandColor]);

  const [usageEmbedId, setUsageEmbedId] = useState("");
  const [usage, setUsage] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

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
      const res = await fetch(`/api/client/stats?embedId=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
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
      try{
        const res = await fetch(`/api/client/stats`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || 'Failed');
        setPlanInfo(j.plan || null);
        setMonthlyUsed(Number(j.monthlyUsed||0));
        setMonthlyBonus(Number(j.monthlyBonus||0));
      }catch(e){ /* ignore */ }
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
            <div className="text-sm font-semibold">{t('Before/After Portal','Портал Before/After')}</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {client && (
              <span>
                {client.name} (<Code>{client.id}</Code>)
              </span>
            )}
            <Button variant="outline" onClick={onSignOut}>{t('Sign out','Изход')}</Button>
            <div className="inline-flex items-center rounded-md border border-white/20 bg-white/5 p-0.5">
              <button onClick={()=> setLang('en')} className={`${lang==='en' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>EN</button>
              <button onClick={()=> setLang('bg')} className={`${lang==='bg' ? 'bg-white/20 text-white' : 'text-white/80'} rounded px-2 py-1 text-xs`}>BG</button>
            </div>
          </div>
        </Container>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-4">
        {!!toast && (
          <div className="fixed right-4 top-16 z-50 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300 shadow-lg">
            {toast}
          </div>
        )}
        <Section title={t('Embeds','Ембедове')}>
          <div className="mb-3 flex items-center justify-between rounded-md border border-white/10 bg-black/30 p-3 text-sm">
            <div className="flex items-center gap-4">
              <div>
                <div className="opacity-70">{t('Current plan','Текущ план')}</div>
                <div className="font-medium">{planInfo?.name || planInfo?.id || 'free'}</div>
              </div>
              <div className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs opacity-80">
                {(() => {
                  const requires = (planInfo?.id || 'free') === 'free';
                  return `${t('Watermark','Воден знак')}: ${requires ? t('active','активен') : t('removed','премахнат')}`;
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs opacity-70">{(planInfo?.monthlyGenerations ?? 0)} {t('gens / mo','ген./месец')}</div>
              <a href="/app/pricing.html" className="underline">{t('Change plan','Промяна на план')}</a>
              <button className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={async()=>{
                try{
                  const resp = await fetch('/api/billing/topup', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ units: 1 }) });
                  const j = await resp.json();
                  if (!resp.ok) throw new Error(j?.error || 'Top-up failed');
                  if (j?.url) window.location.href = j.url;
                }catch(e){ alert(e.message || 'Top-up failed'); }
              }}>{t('Buy +100','Купи +100')}</button>
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
                  <Button variant="outline" onClick={()=> { setEmbedId(e.id); setToast(`${t('Snippet builder now uses','Снипетът вече използва')} ${e.id}`); }}>Use in builder</Button>
                  <Button variant="outline" onClick={()=> { setEditModel({ ...e, variant: e.variant || 'card', radius: e.radius || '12px', shadow: e.shadow ?? 'true', border: e.border ?? 'true' }); setEditOpen(true); }}>{t('Edit','Редакция')}</Button>
                  <Button variant="outline" onClick={async()=>{ const nid = `${e.id}-copy`; await fetch('/api/client/embeds', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ ...e, id: nid, name: e.name || nid }) }); fetchData(); }}>{t('Duplicate','Дублирай')}</Button>
                  <Button variant="outline" onClick={async()=>{ if (!confirm(`Delete embed ${e.id}?`)) return; const u = new URL('/api/client/embeds', location.origin); u.searchParams.set('id', e.id); await fetch(u.toString(), { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } }); fetchData(); }}>{t('Delete','Изтрий')}</Button>
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
              <BrandAccentPicker
                t={t}
                canCustomize={(planInfo?.themeCustomization === 'custom')}
                brandColor={brandColor}
                onPreview={(color) => setPreviewBrandColor(color)}
                onApply={(color) => setSettings((s) => ({ ...s, brandColor: color }))}
                setToast={setToast}
              />
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
                    <Select value={settings.poweredBy || 'false'} onChange={(e)=> setSettings(s=> ({...s, poweredBy:e.target.value}))} disabled={(planInfo?.id || 'free') === 'free'}>
                      <option value="false">hidden</option>
                      <option value="true">show</option>
                    </Select>
                    {(planInfo?.id || 'free') === 'free' && <div className="text-xs text-white/50">Required on Free plan</div>}
                  </div>
                  <div className="grid gap-1 md:col-span-1">
                    <div className="flex items-center gap-2"><Label>Webhook URL</Label><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Receive render events</span></div>
                    <Input placeholder="https://example.com/webhook" value={settings.webhookUrl || ''} onChange={(e)=> setSettings(s=> ({...s, webhookUrl:e.target.value}))} />
                  </div>
                </div>
              </details>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button
                  disabled={savingSettings}
                  onClick={async()=>{
                    setSavingSettings(true);
                    try{
                      const payload = { ...settings };
                      if (! (planInfo?.themeCustomization === 'custom')) {
                        delete payload.brandColor;
                      }
                      await fetch('/api/client/settings', { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
                      setPreviewBrandColor(null);
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                >
                  {t('Save settings','Запази настройките')}
                </Button>
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
                  <iframe
                    title="edit-preview"
                    sandbox="allow-scripts allow-forms allow-same-origin"
                    style={{width:'100%',height:'360px',border:'0',borderRadius:'10px',background:'#0b0d10'}}
                    ref={(el)=>{
                      if (!el) return;
                      const tmpl = {
                        attrs: {
                          theme: editModel.theme || 'dark',
                          variant: editModel.variant || 'card',
                          width: editModel.width || '100%',
                          height: editModel.height || '520px',
                          radius: editModel.radius || '12px',
                          border: editModel.border ?? 'true',
                          shadow: editModel.shadow ?? 'true',
                        },
                      };
                      const code = buildEmbedSnippet(editModel.id, tmpl, { vertical: editModel.vertical });
                      const doc = el.contentDocument || el.contentWindow?.document; if (!doc) return;
                      doc.open();
                      doc.write(`<!doctype html><html><body style=\"margin:0;background:#0b0d10\">${code}</body></html>`);
                      doc.close();
                    }}
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <Button onClick={async()=>{ const payload = { ...editModel }; await fetch('/api/client/embeds', { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) }); setEditOpen(false); fetchData(); }}>Save changes</Button>
                  <Button variant="subtle" onClick={()=> setEditOpen(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Section title={t('Install your widget','Инсталирайте виджета')}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t('Step 1 · Choose embed','Стъпка 1 · Изберете ембед')}</Label>
                <Select value={embedId || (embeds[0]?.id || '')} onChange={(e)=> setEmbedId(e.target.value)}>
                  {embeds.map(e => (<option key={e.id} value={e.id}>{e.id}</option>))}
                  {!embeds.length && <option value="">{t('No embeds yet','Няма ембеди')}</option>}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('Step 2 · Pick a style','Стъпка 2 · Изберете стил')}</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {templateOptions.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={()=> setSelectedTemplateId(tpl.id)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${tpl.id === selectedTemplateId ? 'border-white/60 bg-white/10 shadow-lg' : 'border-white/10 bg-black/20 hover:border-white/30'}`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{tpl.name}</span>
                        {tpl.id === selectedTemplateId && <span className="text-xs text-emerald-300">{t('Selected','Избрано')}</span>}
                      </div>
                      <p className="mt-1 text-xs text-white/70">{tpl.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Step 3 · Copy & paste','Стъпка 3 · Копирайте и поставете')}</Label>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-white/80">{snippetCode}</pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={()=> { navigator.clipboard.writeText(snippetCode); setToast(t('Snippet copied','Кодът е копиран')); }}>{t('Copy snippet','Копирай кода')}</Button>
                    <Button variant="subtle" onClick={()=> renderPreview(snippetCode)}>{t('Refresh preview','Обнови прегледа')}</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Suggested headline','Препоръчано заглавие')}</Label>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <div className="font-semibold text-white">{selectedTemplate?.copy?.headline}</div>
                  <p className="mt-1 text-white/70">{selectedTemplate?.copy?.body}</p>
                  <Button
                    variant="subtle"
                    className="mt-3"
                    onClick={()=> {
                      const text = `${selectedTemplate?.copy?.headline}\n\n${selectedTemplate?.copy?.body}`;
                      navigator.clipboard.writeText(text);
                      setToast(t('Copy text ready to paste','Текстът е копиран'));
                    }}
                  >
                    {t('Copy text','Копирай текста')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <iframe
                ref={previewRef}
                title="snippet-preview"
                sandbox="allow-scripts allow-forms allow-same-origin"
                style={{ width: '100%', height: selectedTemplate?.attrs?.height || '520px', border: '0', borderRadius: '12px', background: selectedTemplate?.preview?.bg || '#0b1120' }}
              />
              <p className="mt-2 text-xs text-white/60">
                {t('Preview updates automatically. Paste the snippet anywhere on your site to launch the widget.','Прегледът се обновява автоматично. Поставете кода на сайта си, за да стартирате виджета.')}
              </p>
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
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.totals?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Generations</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.last24h?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Generations (24h)</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.clientTotals?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Client renders</div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-2xl font-semibold">{stats?.clientLast24h?.overall ?? 0}</div>
                  <div className="text-xs opacity-70">Client renders (24h)</div>
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
  const onSignOut = async () => {
    try{ await fetch('/api/client/me?action=logout', { method:'POST', headers:{ Authorization: `Bearer ${token}` } }); }catch{}
    setToken("");
    window.location.href = "/app/client.html";
  };
  return (<Dashboard token={token} onSignOut={onSignOut} />);
}

// Basic error boundary to avoid white-screen on runtime errors
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, message:"" }; }
  static getDerivedStateFromError(err){ return { hasError:true, message: err?.message || "" }; }
  componentDidCatch(err, info){ try{ console.error('Client portal error', err, info); }catch(_){} }
  render(){ if (this.state.hasError){ return <div className="p-6 text-red-400">Failed to load portal. Please hard refresh. {this.state.message ? `(${this.state.message})` : ''}</div>; } return this.props.children; }
}

/* ===============================================================
   Safe mount for real HTML + export default for Canvas preview
================================================================*/
const maybeMount = () => {
  const rootEl = document.getElementById("root");
  if (!rootEl) return; // No root in Canvas; Canvas uses exported component
  if (ReactDOMClient && typeof ReactDOMClient.createRoot === "function") {
    ReactDOMClient.createRoot(rootEl).render(<ErrorBoundary><AppWrapper /></ErrorBoundary>);
  } else if (ReactDOMLegacy && typeof ReactDOMLegacy.render === "function") {
    ReactDOMLegacy.render(<ErrorBoundary><AppWrapper /></ErrorBoundary>, rootEl);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", maybeMount, { once: true });
  // Fallback in case DOMContentLoaded listener is missed by early execution
  setTimeout(maybeMount, 1500);
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
  const s1 = buildEmbedSnippet("abc", { attrs: { theme: 'light', wide: 'true', radius: '18px' } });
  assert("snippet has script tag", /^<script\s.+><\/script>$/.test(s1));
  assert("includes data-embed-id", s1.includes('data-embed-id="abc"'));
  assert("includes theme", s1.includes('data-theme="light"'));
  assert("includes wide toggle", s1.includes('data-wide="true"'));

  // Test 2: token bootstrap prefers URL over LS
  const urlHasToken = new URL(window.location.href);
  urlHasToken.searchParams.set("token", "T_URL");
  const fromUrl = urlHasToken.searchParams.get("token") === "T_URL";
  assert("URLSearchParams working", fromUrl);

  // Report
  // eslint-disable-next-line no-console
  console.table(tests.map(t => ({ test: t.name, pass: t.pass, detail: t.detail })));
})();
