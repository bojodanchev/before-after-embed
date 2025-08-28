(() => {
  const tokenInput = document.getElementById('adm-token');
  const status = document.getElementById('create-status');

  async function authedFetch(url, opts){
    const token = tokenInput.value.trim();
    const headers = Object.assign({}, opts?.headers || {}, token ? { Authorization: 'Bearer ' + token } : {});
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
      const resp = await authedFetch('/api/admin/embeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      status.textContent = 'Created: ' + json.embed.id;
      await refreshEmbeds();
    } catch(err){
      status.textContent = 'Error: ' + err.message;
    }
  });

  async function refreshEmbeds(){
    const pre = document.getElementById('embeds');
    pre.textContent = 'Loading...';
    try{
      const resp = await authedFetch('/api/admin/embeds');
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      pre.textContent = JSON.stringify(json.embeds, null, 2);
    }catch(err){
      pre.textContent = 'Error: ' + err.message;
    }
  }

  document.getElementById('refresh').addEventListener('click', refreshEmbeds);

  document.getElementById('usage-btn').addEventListener('click', async () => {
    const pre = document.getElementById('usage');
    pre.textContent = 'Loading...';
    const embedId = document.getElementById('usage-embed').value.trim();
    const qs = embedId ? ('?embedId=' + encodeURIComponent(embedId)) : '';
    try{
      const resp = await authedFetch('/api/admin/usage' + qs);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      pre.textContent = JSON.stringify(json.events, null, 2);
    }catch(err){
      pre.textContent = 'Error: ' + err.message;
    }
  });
})();
