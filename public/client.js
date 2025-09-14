(function(){
  const qp = new URLSearchParams(location.search);
  const token = qp.get('token') || localStorage.getItem('clientToken') || '';
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  function set(el, text){ document.getElementById(el).textContent = text; }
  function pre(el, obj){ document.getElementById(el).textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2); }

  async function jget(url){ const r = await fetch(url, { headers }); return r.json(); }

  (async () => {
    try{
      const me = await jget('/api/client/me');
      if (!me.client) throw new Error('no client');
      set('c-info', `Hello, ${me.client.name} (id: ${me.client.id})`);
    }catch(err){
      // show auth form and hide signout
      document.getElementById('auth').style.display = 'flex';
      set('c-info', 'Sign in to your Client Portal');
      const so = document.getElementById('c-signout'); if (so) so.style.display = 'none';
      document.getElementById('auth-start').addEventListener('click', async ()=>{
        const email = document.getElementById('auth-email').value.trim();
        const s = document.getElementById('auth-status'); s.textContent = 'Creating link...';
        try{
          const resp = await fetch('/api/client/me', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
          const json = await resp.json();
          if (!resp.ok) throw new Error(json.error || 'Failed');
          s.textContent = 'Opening portal...';
          // store token locally for future visits and redirect
          const url = new URL(json.link, location.origin);
          const t = url.searchParams.get('token');
          if (t){ localStorage.setItem('clientToken', t); location.href = '/client.html?token='+encodeURIComponent(t); }
        }catch(e){ s.textContent = 'Error: ' + e.message; }
      });
      return;
    }

    const refresh = async ()=>{
      const data = await jget('/api/client/embeds');
      pre('c-embeds', data.embeds || []);
    };
    const so = document.getElementById('c-signout'); if (so) so.style.display = 'inline-block';
    document.getElementById('c-refresh').addEventListener('click', refresh);
    await refresh();

    document.getElementById('c-usage').addEventListener('click', async () =>{
      const id = (document.getElementById('c-embedId').value || '').trim();
      if (!id) return pre('c-usage-out','Provide embedId');
      const data = await jget('/api/client/usage?embedId='+encodeURIComponent(id));
      pre('c-usage-out', data.events || []);
    });

    document.getElementById('c-stats').addEventListener('click', async () =>{
      const id = (document.getElementById('c-embedId').value || '').trim();
      if (!id) return pre('c-stats-out','Provide embedId');
      const data = await jget('/api/client/stats?embedId='+encodeURIComponent(id));
      pre('c-stats-out', data || {});
    });

    document.getElementById('ne-create').addEventListener('click', async ()=>{
      const id = document.getElementById('ne-id').value.trim();
      const vertical = document.getElementById('ne-vertical').value;
      const theme = document.getElementById('ne-theme').value;
      const resp = await fetch('/api/client/embeds', { method:'POST', headers: Object.assign({'Content-Type':'application/json'}, headers), body: JSON.stringify({ id, vertical, theme }) });
      const json = await resp.json();
      if (!resp.ok){ pre('c-embeds', json); return; }
      await refresh();
    });

    document.getElementById('s-generate').addEventListener('click', async () =>{
      const id = (document.getElementById('s-embedId').value || '').trim();
      const preset = document.getElementById('s-preset').value;
      const theme = document.getElementById('s-theme').value;
      if (!id) return pre('s-code', 'Provide embedId');
      const opts = preset === 'compact'
        ? { theme, variant:'compact', maxWidth:'640px', align:'center', radius:'14px', shadow:'true', border:'true', width:'100%', height:'460px' }
        : { theme, variant:'card', maxWidth:'980px', align:'left', radius:'12px', shadow:'true', border:'true', width:'100%', height:'520px' };
      // Build snippet client-side (mirrors server helper)
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
      const code = `<script async src="https://before-after-embed.vercel.app/embed.js" ${attrs}></script>`;
      pre('s-code', code);
      try{ await navigator.clipboard.writeText(code); }catch{}
    });

    document.getElementById('c-signout').addEventListener('click', ()=>{
      try{ localStorage.removeItem('clientToken'); }catch{}
      const url = new URL(location.href);
      url.searchParams.delete('token');
      location.href = '/client.html';
    });
  })();
})();
