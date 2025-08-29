(function(){
  const qp = new URLSearchParams(location.search);
  const token = qp.get('token') || '';
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  function set(el, text){ document.getElementById(el).textContent = text; }
  function pre(el, obj){ document.getElementById(el).textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2); }

  async function jget(url){ const r = await fetch(url, { headers }); return r.json(); }

  (async () => {
    try{
      const me = await jget('/api/client/me');
      if (!me.client){ set('c-info', 'Unauthorized'); return; }
      set('c-info', `Hello, ${me.client.name} (id: ${me.client.id})`);
    }catch(err){ set('c-info', 'Unauthorized'); return; }

    const refresh = async ()=>{
      const data = await jget('/api/client/embeds');
      pre('c-embeds', data.embeds || []);
    };
    document.getElementById('c-refresh').addEventListener('click', refresh);
    await refresh();

    document.getElementById('c-usage').addEventListener('click', async () =>{
      const id = (document.getElementById('c-embedId').value || '').trim();
      if (!id) return pre('c-usage-out','Provide embedId');
      const data = await jget('/api/client/usage?embedId='+encodeURIComponent(id));
      pre('c-usage-out', data.events || []);
    });

    document.getElementById('c-stats').addEventListener('click', async () =>{
      const data = await jget('/api/client/stats');
      pre('c-stats-out', data || {});
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
  })();
})();
