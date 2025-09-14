import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
);

const Card = ({ className = "", children }) => (
  <div className={`ba-card border-neutral-200 dark:border-white/10 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-4 dark:border-white/10">
    <div>
      <h3 className="ba-title text-base font-semibold">{title}</h3>
      {subtitle ? <p className="ba-subtle mt-1 text-sm">{subtitle}</p> : null}
    </div>
    {right}
  </div>
);

const CardBody = ({ className = "", children }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 text-white hover:opacity-90 disabled:opacity-60",
    ghost:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
    outline:
      "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10",
    subtle:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/20 dark:bg-slate-900 dark:text-white ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/20 dark:bg-slate-900 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Label = ({ children }) => (
  <label className="text-xs font-medium text-neutral-700 dark:text-white/80">{children}</label>
);

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium border-neutral-300 text-neutral-700 dark:border-white/20 dark:text-white/80 ${className}`}>
    {children}
  </span>
);

const Code = ({ children }) => (
  <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[12px] dark:bg-white/10">{children}</code>
);

const getInitialToken = () => {
  const sp = new URLSearchParams(window.location.search);
  const urlToken = sp.get("token");
  if (urlToken) return urlToken;
  try { return localStorage.getItem("clientToken") || ""; } catch { return ""; }
};

const persistTokenToUrl = (token) => {
  const url = new URL(window.location.href);
  url.searchParams.set("token", token);
  window.history.replaceState({}, "", url.toString());
};

const clearTokenEverywhere = () => {
  try { localStorage.removeItem("clientToken"); } catch {}
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, "", url.toString());
};

async function safeError(res){ try{ const j = await res.json(); return j?.error || j?.message; }catch{ return `${res.status} ${res.statusText}`; } }

const useAuth = () => {
  const [token, setToken] = useState(getInitialToken());
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(!!token);
  const [errorMe, setErrorMe] = useState("");

  useEffect(() => {
    if (!token){ setMe(null); setLoadingMe(false); setErrorMe(""); return; }
    let cancelled = false;
    (async () => {
      setLoadingMe(true); setErrorMe("");
      try{
        const res = await fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json(); if (cancelled) return;
        setMe(data?.client || null); setLoadingMe(false);
        try{ localStorage.setItem("clientToken", token); }catch{}
        persistTokenToUrl(token);
      }catch(e){ if (cancelled) return; setErrorMe("Unable to load account. Please sign in again."); setLoadingMe(false); setMe(null); }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const signOut = () => { setMe(null); setToken(""); clearTokenEverywhere(); window.location.href = "/app/client.html"; };
  return { token, setToken, me, loadingMe, errorMe, signOut };
};

const useEmbeds = (token) => {
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const refresh = async () => {
    if (!token) return; setLoading(true); setErr("");
    try{
      const res = await fetch("/api/client/embeds", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json(); setEmbeds(Array.isArray(data) ? data : data?.embeds || []);
    }catch(e){ setErr("Failed to load embeds."); }
    finally{ setLoading(false); }
  };
  useEffect(() => { refresh(); }, [token]);

  const create = async (payload) => {
    const res = await fetch("/api/client/embeds", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await safeError(res) || "Failed to create embed");
    await refresh();
  };
  return { embeds, loading, err, refresh, create };
};

const useUsage = (token, selectedEmbedId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!token || !selectedEmbedId) return; let cancelled = false;
    (async () => {
      setLoading(true); setErr("");
      try{
        const res = await fetch(`/api/client/stats?embedId=${encodeURIComponent(selectedEmbedId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || 'Failed');
        setEvents(j.events||[]);
      }catch(e){ if (!cancelled) setErr("Failed to load usage."); }
      finally{ if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [token, selectedEmbedId]);
  return { events, loading, err };
};

const useStats = (token) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const refresh = async () => {
    if (!token) return; setLoading(true); setErr("");
    try{
      const res = await fetch(`/api/client/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setPlan(j.plan || null);
      setMonthlyUsed(Number(j.monthlyUsed||0));
      setMonthlyBonus(Number(j.monthlyBonus||0));
    }catch(e){ setErr("Failed to load stats."); }
    finally{ setLoading(false); }
  };
  return { stats, loading, err, refresh };
};

const Topbar = ({ me, onSignOut }) => (
  <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-neutral-950/70">
    <Container className="flex h-14 items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow"><span className="text-xs font-bold text-white">B/A</span></div>
        <span className="text-sm font-semibold">Before/After — Client Portal</span>
      </div>
      {me ? (
        <div className="flex items-center gap-3">
          <Badge>Client</Badge>
          <div className="hidden text-sm sm:block"><span className="opacity-80">{me.name}</span> <span className="opacity-50">·</span> <Code>{me.id}</Code></div>
          <Button variant="outline" onClick={onSignOut}>Sign out</Button>
        </div>
      ) : (<div className="text-sm opacity-70">Not signed in</div>)}
    </Container>
  </header>
);

const SignInCard = ({ onToken }) => {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(""); setInfo(""); setPending(true);
    try{
      const res = await fetch("/api/client/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error(await safeError(res));
      const data = await res.json(); const link = data?.link; const u = new URL(link, window.location.origin); const token = u.searchParams.get("token");
      if (token){ try{ localStorage.setItem("clientToken", token); }catch{} persistTokenToUrl(token); onToken(token); } else { setInfo("Sign-in link sent. Check your email."); }
    }catch(e2){ setErr(e2.message || "Sign-in failed."); }
    finally{ setPending(false); }
  };
  return (
    <Container className="py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader title="Sign in" subtitle="Enter your email to get a magic link." />
        <CardBody>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-1.5"><Label>Email</Label><Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="flex items-center justify-between"><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send link"}</Button><div className="text-xs"><span className="text-red-600 dark:text-red-400">{err}</span><span className="text-neutral-600 dark:text-white/70">{info}</span></div></div>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
};

const EmbedsSection = ({ token, hook }) => {
  const { embeds, loading, err, refresh, create } = hook || useEmbeds(token);
  const [form, setForm] = useState({ id: "", vertical: "barber", theme: "dark" });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const onCreate = async (e) => {
    e.preventDefault(); setCreateErr("");
    const clean = form.id.trim();
    if (!/^[a-z0-9-]{3,32}$/.test(clean)){ setCreateErr('Use 3-32 chars: lowercase letters, numbers, dashes'); return; }
    setCreating(true);
    try{ await create({ id: clean, vertical: form.vertical, theme: form.theme }); setForm({ id: "", vertical: form.vertical, theme: form.theme }); }
    catch(e2){ setCreateErr(e2.message); }
    finally{ setCreating(false); }
  };
  return (
    <Container className="py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Your embeds" subtitle="Manage embed IDs, verticals, and themes." right={<Button variant="subtle" onClick={refresh}>Refresh</Button>} />
          <CardBody>
            {loading ? (<div className="text-sm opacity-70">Loading…</div>) : err ? (<div className="text-sm text-red-600 dark:text-red-400">{err}</div>) : embeds.length === 0 ? (<div className="text-sm opacity-70">No embeds yet. Create your first embed.</div>) : (
              <div className="divide-y divide-neutral-200 dark:divide-white/10">{embeds.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{e.id}</div>
                    <div className="text-xs opacity-70"><span className="uppercase">{e.vertical}</span> · <Code>{e.theme}</Code></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs underline opacity-80 hover:opacity-100" onClick={()=>{ try{ navigator.clipboard.writeText(e.id);}catch{} }}>Copy ID</button>
                    <a className="text-xs underline opacity-80 hover:opacity-100" target="_blank" rel="noreferrer" href={`/widget.html?embedId=${encodeURIComponent(e.id)}&theme=${encodeURIComponent(e.theme)}`}>Open</a>
                  </div>
                </div>
              ))}</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Create embed" subtitle="Provision an embed for a client/tenant." />
          <CardBody>
            <form className="grid gap-3" onSubmit={onCreate}>
              <div className="grid gap-1.5"><Label>Embed ID</Label><Input placeholder="acme-barber-01" required value={form.id} onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Vertical</Label><Select value={form.vertical} onChange={(e) => setForm((s) => ({ ...s, vertical: e.target.value }))}><option value="barber">barber</option><option value="dental">dental</option><option value="detailing">detailing</option><option value="cosmetics">cosmetics</option><option value="custom">custom</option></Select></div>
              <div className="grid gap-1.5"><Label>Theme</Label><Select value={form.theme} onChange={(e) => setForm((s) => ({ ...s, theme: e.target.value }))}><option value="light">light</option><option value="dark">dark</option></Select></div>
              <div className="flex items-center justify-between"><Button type="submit" disabled={creating}>{creating ? "Creating…" : "Create embed"}</Button><div className="text-xs text-red-600 dark:text-red-400">{createErr}</div></div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

const SnippetBuilder = ({ defaultEmbedId = "", embedsHook }) => {
  const [embedId, setEmbedId] = useState(defaultEmbedId);
  const [preset, setPreset] = useState("compact");
  const [theme, setTheme] = useState("dark");
  const [copied, setCopied] = useState(false);
  const embeds = embedsHook?.embeds || [];
  useEffect(() => { if (!embedId && embeds.length) setEmbedId(embeds[0].id); }, [embeds, embedId]);
  const snippet = useMemo(() => {
    const attrs = ["async", "src=\"https://before-after-embed.vercel.app/embed.js\"", `data-embed-id=\"${embedId || "your-embed-id"}\"`, `data-theme=\"${theme}\"`, `data-variant=\"${preset}\"`, `data-max-width=\"640px\"`, `data-align=\"center\"`, `data-radius=\"14px\"`, `data-shadow=\"true\"`, `data-border=\"true\"`, `data-width=\"100%\"`, `data-height=\"460px\"`].join(" ");
    return `<script ${attrs}></script>`;
  }, [embedId, preset, theme]);
  const copy = async () => { try{ await navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1500); }catch{} };
  return (
    <Container className="py-6">
      <Card>
        <CardHeader title="Snippet builder" subtitle="Configure and copy a ready-to-paste embed script." right={copied ? <Badge className="border-emerald-400 text-emerald-500 dark:border-emerald-400/60">Copied</Badge> : null} />
        <CardBody className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Embed ID</Label>{embeds.length ? (<Select value={embedId} onChange={(e) => setEmbedId(e.target.value)}>{embeds.map(e => (<option key={e.id} value={e.id}>{e.id}</option>))}</Select>) : (<Input placeholder="your-embed-id" value={embedId} onChange={(e) => setEmbedId(e.target.value)} />)}</div>
            <div className="grid gap-1.5"><Label>Preset</Label><Select value={preset} onChange={(e) => setPreset(e.target.value)}><option value="compact">compact</option><option value="card">card</option></Select></div>
            <div className="grid gap-1.5"><Label>Theme</Label><Select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">light</option><option value="dark">dark</option></Select></div>
          </div>
          <div className="grid content-start gap-3"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"><pre className="whitespace-pre-wrap break-words">{snippet}</pre></div><div className="flex items-center gap-2"><Button onClick={copy}>Copy snippet</Button><span className="text-xs opacity-70">Includes <Code>data-variant</Code>, <Code>data-theme</Code>, sizing and styles.</span></div></div>
        </CardBody>
      </Card>
    </Container>
  );
};

const UsageAndStats = ({ token, embeds }) => {
  const [selected, setSelected] = useState(embeds?.[0]?.id || "");
  const { events, loading: loadingUsage, err: errUsage } = useUsage(token, selected);
  const { stats, loading: loadingStats, err: errStats, refresh: refreshStats } = useStats(token);
  useEffect(() => { if (token) refreshStats(); }, [token]);
  useEffect(() => { if (embeds?.length && !selected) setSelected(embeds[0].id); }, [embeds, selected]);
  return (
    <Container className="py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Usage (recent events)" subtitle="Filter by embed ID." right={<Select value={selected} onChange={(e) => setSelected(e.target.value)}>{embeds.map((e) => (<option key={e.id} value={e.id}>{e.id}</option>))}</Select>} />
          <CardBody>
            {loadingUsage ? (<div className="text-sm opacity-70">Loading…</div>) : errUsage ? (<div className="text-sm text-red-600 dark:text-red-400">{errUsage}</div>) : events.length === 0 ? (<div className="text-sm opacity-70">No events yet.</div>) : (
              <div className="divide-y divide-neutral-200 text-sm dark:divide-white/10">{events.map((ev, i) => (
                <div key={i} className="flex items-center justify-between py-3"><div className="min-w-0"><div className="truncate"><span className="opacity-70">{ev.type}</span> · <Code>{ev.embedId}</Code></div><div className="text-xs opacity-60">{ev.timestamp}</div></div><Badge>{ev.status || "ok"}</Badge></div>
              ))}</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Stats" subtitle="Totals and last 24h" right={<Button variant="subtle" onClick={refreshStats}>Refresh</Button>} />
          <CardBody>
            {loadingStats ? (<div className="text-sm opacity-70">Loading…</div>) : errStats ? (<div className="text-sm text-red-600 dark:text-red-400">{errStats}</div>) : !stats ? (<div className="text-sm opacity-70">No stats yet.</div>) : (
              <div className="grid gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatTile label="Total generations" value={stats.overall?.generations ?? 0} /><StatTile label="Embeds" value={stats.overall?.embeds ?? 0} /><StatTile label="Gen (24h)" value={stats.last24h?.generations ?? 0} /><StatTile label="—" value={""} /></div><div><h4 className="mb-2 text-sm font-semibold opacity-80">By embed</h4><div className="divide-y divide-neutral-200 text-sm dark:divide-white/10">{(stats.byEmbed || []).map((row) => (<div key={row.embedId} className="flex items-center justify-between py-2"><div className="truncate">{row.embedId}</div><div className="opacity-80">{row.generations}</div></div>))}</div></div></div>
            )}
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

const StatTile = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-white/10 dark:bg-white/5"><div className="text-2xl font-semibold">{value}</div><div className="text-xs opacity-70">{label}</div></div>
);

const App = () => {
  const { token, setToken, me, loadingMe, errorMe, signOut } = useAuth();
  const embedsHook = useEmbeds(token);
  useEffect(() => { const sp = new URLSearchParams(window.location.search); const urlToken = sp.get("token"); if (urlToken) { try { localStorage.setItem("clientToken", urlToken); } catch {} persistTokenToUrl(urlToken); } }, []);
  return (
    <div className="min-h-screen pb-16">
      <Topbar me={me} onSignOut={signOut} />
      {!token ? (<SignInCard onToken={setToken} />) : loadingMe ? (<Container className="py-10"><Card><CardBody><div className="text-sm opacity-70">Loading account…</div></CardBody></Card></Container>) : errorMe ? (<Container className="py-10"><Card><CardBody className="flex items-center justify-between"><div className="text-sm text-red-600 dark:text-red-400">{errorMe}</div><Button variant="outline" onClick={() => setToken("")}>Sign in</Button></CardBody></Card></Container>) : !me ? (<SignInCard onToken={setToken} />) : (<><Container className="py-6"><Card><CardBody className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><div><div className="text-sm opacity-70">Welcome</div><div className="text-lg font-semibold">{me.name}</div><div className="text-xs opacity-60">Client ID: <Code>{me.id}</Code></div></div><div className="flex gap-2"><Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</Button></div></CardBody></Card></Container><EmbedsSection token={token} hook={embedsHook} /><SnippetBuilder embedsHook={embedsHook} /><UsageAndStatsWrapper token={token} /></>)}
      <footer className="mt-10 border-t border-neutral-200 py-8 text-center text-sm opacity-70 dark:border-white/10">© 2025 Before/After Embed</footer>
    </div>
  );
};

const UsageAndStatsWrapper = ({ token }) => {
  const [embeds, setEmbeds] = useState([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  useEffect(() => { let cancelled = false; (async () => { if (!token) return; setLoading(true); setErr(""); try{ const res = await fetch("/api/client/embeds", { headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error(`${res.status}`); const data = await res.json(); if (!cancelled) setEmbeds(Array.isArray(data) ? data : data?.embeds || []); }catch(e){ if (!cancelled) setErr("Failed to load embeds for usage/stats."); }finally{ if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, [token]);
  if (loading) return <Container className="py-6"><div className="text-sm opacity-70">Loading usage & stats…</div></Container>;
  if (err) return <Container className="py-6"><div className="text-sm text-red-600 dark:text-red-400">{err}</div></Container>;
  if (!embeds.length) return null;
  return <UsageAndStats token={token} embeds={embeds} />;
};

createRoot(document.getElementById("root")).render(<App />);


