(() => {
  const tokenInput = document.getElementById('adm-token');
  const status = document.getElementById('create-status');

  const qp = new URLSearchParams(location.search);
  const tokenFromQuery = qp.get('token');
  const saved = localStorage.getItem('adminToken');
  if (tokenFromQuery){ tokenInput.value = tokenFromQuery; localStorage.setItem('adminToken', tokenFromQuery); }
  else if (saved){ tokenInput.value = saved; }
  tokenInput.addEventListener('change', ()=> localStorage.setItem('adminToken', tokenInput.value.trim()));
  function authedFetch(url, opts){
    const t = tokenInput.value.trim();
    const headers = Object.assign({}, opts?.headers || {}, t ? { Authorization: 'Bearer ' + t, 'X-Admin-Token': t } : {});
    return fetch(url, Object.assign({}, opts, { headers }));
  }

  document.getElementById('create').addEventListener('click', async () => {
    status.textContent = 'Creating...';
    const body = {
      id: document.getElementById('id').value.trim(),
      name: document.getElementById('name').value.trim(),
      vertical: document.getElementById('vertical').value,
      theme: document.getElementById('theme').value,
      width: document.getElementById('width').value.trim(),
      height: document.getElementById('height').value.trim(),
    };
    try{
      const resp = await authedFetch('/api/admin/embeds', { method:'POST', headers:{ 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      status.textContent = 'Created: ' + json.embed.id;
      await refreshEmbeds();
    }catch(err){ status.textContent = 'Error: ' + err.message; }
  });

  async function refreshEmbeds(){
    const pre = document.getElementById('embeds');
    pre.textContent = 'Loading...';
    try{ const resp = await authedFetch('/api/admin/embeds'); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); pre.textContent = JSON.stringify(json.embeds, null, 2);}catch(err){ pre.textContent = 'Error: ' + err.message;}
  }
  document.getElementById('refresh').addEventListener('click', refreshEmbeds);

  document.getElementById('usage-btn').addEventListener('click', async () =>{
    const pre = document.getElementById('usage'); pre.textContent = 'Loading...';
    const embedId = document.getElementById('usage-embed').value.trim();
    const qs = embedId ? ('?embedId='+encodeURIComponent(embedId)) : '';
    try{ const resp = await authedFetch('/api/admin/usage'+qs); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); pre.textContent = JSON.stringify(json.events || [], null, 2);}catch(err){ pre.textContent = 'Error: ' + err.message; }
  });

  document.getElementById('stats-btn').addEventListener('click', async () =>{
    const box = document.getElementById('stats'); box.textContent = 'Loading stats...';
    try{ const resp = await authedFetch('/api/admin/stats'); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); box.textContent = `Total renders: ${json.totals.overall}\nRenders by embed: ${JSON.stringify(json.totals.byEmbed)}\nLast 24h: ${json.last24h.overall}`;}catch(err){ box.textContent = 'Error: ' + err.message; }
  });

  // Clients
  document.getElementById('c-create').addEventListener('click', async ()=>{
    const id = document.getElementById('c-id').value.trim();
    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const out = document.getElementById('c-out'); out.textContent = 'Creating...';
    try{ const resp = await authedFetch('/api/admin/clients', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id, name, email }) }); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); out.textContent = JSON.stringify(json.client, null, 2);}catch(err){ out.textContent = 'Error: ' + err.message; }
  });
  document.getElementById('c-list').addEventListener('click', async ()=>{
    const out = document.getElementById('c-out'); out.textContent = 'Loading...';
    try{ const resp = await authedFetch('/api/admin/clients'); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); out.textContent = JSON.stringify(json.clients || [], null, 2);}catch(err){ out.textContent = 'Error: ' + err.message; }
  });

  document.getElementById('ca-assign').addEventListener('click', async ()=>{
    const clientId = document.getElementById('ca-client').value.trim();
    const embedId = document.getElementById('ca-embed').value.trim();
    const out = document.getElementById('c-out'); out.textContent = 'Assigning...';
    try{ const resp = await authedFetch('/api/admin/client-embeds', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ clientId, embedId }) }); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); out.textContent = JSON.stringify(json.embed, null, 2);}catch(err){ out.textContent = 'Error: ' + err.message; }
  });

  document.getElementById('cl-link').addEventListener('click', async ()=>{
    const clientId = document.getElementById('cl-client').value.trim();
    const out = document.getElementById('cl-out'); out.textContent = 'Generating link...';
    try{ const resp = await authedFetch('/api/admin/link?clientId='+encodeURIComponent(clientId)); const json = await resp.json(); if (!resp.ok) throw new Error(json.error || 'Failed'); out.textContent = json.link || ''; try{ await navigator.clipboard.writeText(json.link); }catch{} }catch(err){ out.textContent = 'Error: ' + err.message; }
  });
})();
