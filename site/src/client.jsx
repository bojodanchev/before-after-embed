import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

function Topbar() {
  return (
    <header className="w-full border-b border-slate-200/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-semibold">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-blue-400 to-violet-400" />
          <span>Before/After</span>
        </a>
        <nav className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <a href="/" className="hover:text-slate-900 dark:hover:text-white">Home</a>
          <a href="/admin.html" className="hover:text-slate-900 dark:hover:text-white">Admin</a>
        </nav>
      </div>
    </header>
  );
}

async function apiGet(path, token){
  const r = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiJson(path, method, body, token){
  const r = await fetch(path, { method, headers: Object.assign({ 'Content-Type':'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}), body: JSON.stringify(body||{}) });
  const j = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

function Section({ title, children }){
  return (
    <section className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function ClientApp(){
  const q = useQuery();
  const [token, setToken] = useState(() => q.get('token') || localStorage.getItem('clientToken') || '');
  const [client, setClient] = useState(null);
  const [embeds, setEmbeds] = useState([]);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      try{
        const me = await apiGet('/api/client/me', token);
        setClient(me.client);
      }catch{
        setClient(null);
      }
    })();
  }, [token]);

  async function signIn(){
    setStatus('Creating link...');
    try{
      const j = await apiJson('/api/client/me', 'POST', { email });
      const url = new URL(j.link, location.origin);
      const t = url.searchParams.get('token');
      if (t){ localStorage.setItem('clientToken', t); setToken(t); window.history.replaceState({}, '', '/app/client.html?token='+encodeURIComponent(t)); }
      setStatus('');
    }catch(e){ setStatus('Error: ' + e.message); }
  }

  function signOut(){
    localStorage.removeItem('clientToken');
    setToken('');
    setClient(null);
    window.history.replaceState({}, '', '/app/client.html');
  }

  async function refreshEmbeds(){
    const j = await apiGet('/api/client/embeds', token);
    setEmbeds(j.embeds || []);
  }

  async function createEmbed(form){
    const id = form.id.value.trim();
    const vertical = form.vertical.value;
    const theme = form.theme.value;
    await apiJson('/api/client/embeds', 'POST', { id, vertical, theme }, token);
    await refreshEmbeds();
    form.reset();
  }

  function buildSnippet({ id, preset, theme }){
    const opts = preset === 'compact'
      ? { theme, variant:'compact', maxWidth:'640px', align:'center', radius:'14px', shadow:'true', border:'true', width:'100%', height:'460px' }
      : { theme, variant:'card', maxWidth:'980px', align:'left', radius:'12px', shadow:'true', border:'true', width:'100%', height:'520px' };
    const attrs = Object.entries({
      'data-embed-id': id,
      'data-theme': opts.theme,
      'data-variant': opts.variant,
      'data-max-width': opts.maxWidth,
      'data-align': opts.align,
      'data-radius': opts.radius,
      'data-shadow': opts.shadow,
      'data-border': opts.border,
      'data-width': opts.width,
      'data-height': opts.height,
    }).map(([k,v])=> `${k}="${v}"`).join(' ');
    return `<script async src="https://before-after-embed.vercel.app/embed.js" ${attrs}></script>`;
  }

  useEffect(() => { if (client) refreshEmbeds(); }, [client]);

  if (!client && !token){
    return (
      <div>
        <Topbar />
        <main className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
          <Section title="Client sign-in">
            <div className="flex gap-3 items-center">
              <input className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <button className="rounded-lg bg-blue-600 text-white px-4 py-2" onClick={signIn}>Send magic link</button>
            </div>
            <p className="text-sm text-slate-500 mt-2">{status}</p>
          </Section>
        </main>
      </div>
    );
  }

  if (!client){
    return (
      <div>
        <Topbar />
        <main className="mx-auto max-w-6xl px-4 py-10 text-slate-600 dark:text-slate-300">Loading...</main>
      </div>
    );
  }

  return (
    <div>
      <Topbar />
      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
        <Section title="Client">
          <div className="flex items-center justify-between">
            <p className="text-slate-700 dark:text-slate-300">Hello, {client.name} (id: {client.id})</p>
            <button className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700" onClick={signOut}>Sign out</button>
          </div>
        </Section>

        <Section title="Your Embeds">
          <div className="flex items-center justify-between mb-3">
            <button className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700" onClick={refreshEmbeds}>Refresh</button>
          </div>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">{JSON.stringify(embeds, null, 2)}</pre>
          <form className="mt-3 grid sm:grid-cols-[1fr,200px,160px,auto] gap-3" onSubmit={(e)=>{ e.preventDefault(); createEmbed(e.currentTarget); }}>
            <input name="id" placeholder="new embed id" className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700" />
            <select name="vertical" className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700">
              <option value="barber">barber</option>
              <option value="dental">dental</option>
              <option value="detailing">detailing</option>
            </select>
            <select name="theme" className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700">
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
            <button className="rounded-lg bg-blue-600 text-white px-4 py-2">Create embed</button>
          </form>
        </Section>

        <Section title="Snippet Preset">
          <SnippetBuilder />
        </Section>
      </main>
    </div>
  );

  function SnippetBuilder(){
    const [embedId, setEmbedId] = useState('');
    const [preset, setPreset] = useState('compact');
    const [theme, setTheme] = useState('light');
    const code = buildSnippet({ id: embedId, preset, theme });
    return (
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr,160px,160px,auto]">
          <input value={embedId} onChange={e=>setEmbedId(e.target.value)} placeholder="embedId" className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700" />
          <select value={preset} onChange={e=>setPreset(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700">
            <option value="compact">Compact</option>
            <option value="card">Card</option>
          </select>
          <select value={theme} onChange={e=>setTheme(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <button className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700" onClick={()=>{ try{ navigator.clipboard.writeText(code); }catch{} }}>Copy snippet</button>
        </div>
        <pre className="text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">{code}</pre>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClientApp />
  </React.StrictMode>
);
