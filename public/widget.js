(() => {
  const params = new URLSearchParams(location.search);
  const preset = params.get('vertical') || '';
  const theme = params.get('theme') || 'light';
  const embedId = params.get('embedId') || '';
  const variant = (params.get('variant') || 'card').toLowerCase();

  document.documentElement.dataset.theme = theme;

  const form = document.getElementById('w-form');
  const beforeImg = document.getElementById('w-before');
  const afterImg = document.getElementById('w-after');
  const slider = document.getElementById('w-slider');
  const statusEl = document.getElementById('w-status');
  const afterWrapper = document.querySelector('.after-wrapper');
  const verticalSel = document.getElementById('w-vertical');
  if (preset) verticalSel.value = preset;
  const optionsContainer = document.createElement('div');
  optionsContainer.id = 'w-vertical-options';
  form.insertBefore(optionsContainer, form.children[1]);

  if (variant === 'compact'){
    const cmp = document.querySelector('.compare');
    cmp.classList.add('compact');
  }

  slider.addEventListener('input', () => {
    const percent = Number(slider.value);
    afterWrapper.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    statusEl.textContent = 'Uploading...';
    const file = document.getElementById('w-image').files[0];
    if (!file) {
      submitBtn.disabled = false;
      statusEl.textContent = 'Please choose an image.';
      return;
    }
    beforeImg.src = URL.createObjectURL(file);
    afterImg.removeAttribute('src');
    afterWrapper.style.clipPath = 'inset(0 50% 0 0)';

    const formData = new FormData();
    formData.append('image', file);
    const vertical = verticalSel.value;
    // collect any vertical-specific inputs
    const extra = {};
    Array.from(optionsContainer.querySelectorAll('[data-opt]')).forEach(el => { extra[el.getAttribute('data-opt')] = el.value; });
    const prompt = document.getElementById('w-prompt').value;
    if (vertical) formData.append('vertical', vertical);
    if (prompt) formData.append('prompt', prompt);
    if (embedId) formData.append('embedId', embedId);
    Object.entries(extra).forEach(([k,v])=> formData.append(`opt_${k}`, v));

    try {
      const resp = await fetch('/api/edit', { method: 'POST', body: formData });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      statusEl.textContent = 'Rendering complete';
      if (json.outputUrl) {
        afterImg.src = json.outputUrl;
        // Server logs both edit_success and a client_render; no client call needed
      } else {
        statusEl.textContent = 'No image returned';
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Error: ' + err.message;
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Load vertical options from embed config if provided
  (async ()=>{
    try{
      if (!embedId) return;
      const res = await fetch(`/api/embed/${encodeURIComponent(embedId)}`);
      if (!res.ok) return;
      const cfg = await res.json();
      const vo = cfg.verticalOptions || {};
      const v = (cfg.vertical || '').toLowerCase();
      optionsContainer.innerHTML = '';
      if (v === 'detailing'){
        const select = document.createElement('select');
        select.setAttribute('data-opt','focus');
        ['exterior','interior'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        optionsContainer.appendChild(select);
      } else if (v === 'dental'){
        const select = document.createElement('select');
        select.setAttribute('data-opt','treatment');
        ['whitening','alignment','veneers'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        optionsContainer.appendChild(select);
      } else if (v === 'barber'){
        const select = document.createElement('select');
        select.setAttribute('data-opt','style');
        ['fade','buzz','undercut','pompadour'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        optionsContainer.appendChild(select);
      }
      // override from config verticalOptions defaults if any
      Object.entries(vo).forEach(([k,v])=>{ const el = optionsContainer.querySelector(`[data-opt="${k}"]`); if (el) el.value = v; });
    }catch{}
  })();
})();


