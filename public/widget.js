(() => {
  const params = new URLSearchParams(location.search);
  const preset = params.get('vertical') || '';
  const theme = params.get('theme') || 'light';
  const embedId = params.get('embedId') || '';
  const variant = (params.get('variant') || 'card').toLowerCase();
  const background = params.get('background') || 'auto';
  const mode = params.get('mode') || 'full';
  const hideHeader = params.get('hideHeader') === 'true';

  document.documentElement.dataset.theme = theme;
  
  // Handle background transparency
  if (background === 'transparent') {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
  } else if (background === 'inherit') {
    document.body.style.background = 'inherit';
    document.documentElement.style.background = 'inherit';
  }

  // Handle content-only mode and header hiding
  if (mode === 'content-only' || hideHeader) {
    // Hide any headers/titles in the widget
    const headers = document.querySelectorAll('h1, h2, h3, .widget-header, .demo-header');
    headers.forEach(header => header.style.display = 'none');
    
    // Remove padding/margins from widget root for tighter integration
    const widgetRoot = document.querySelector('.widget-root');
    if (widgetRoot) {
      widgetRoot.style.padding = '0';
      widgetRoot.style.margin = '0';
    }
  }

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
  const choicesEl = document.getElementById('w-choices');
  const submitBtn = document.getElementById('w-generate');
  submitBtn.disabled = true;

  if (variant === 'compact'){
    const cmp = document.querySelector('.compare');
    cmp.classList.add('compact');
  }

  // Ensure both images render in the same panel gracefully
  function updateClip(percent){
    afterWrapper.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
  }
  slider.addEventListener('input', () => {
    const percent = Number(slider.value);
    updateClip(percent);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    statusEl.textContent = 'Uploading...';
    const file = document.getElementById('w-image').files[0];
    if (!file) {
      submitBtn.disabled = false;
      statusEl.textContent = 'Please choose an image.';
      return;
    }
    const localUrl = URL.createObjectURL(file);
    beforeImg.src = localUrl;
    afterImg.removeAttribute('src');
    // Reset compare state and ensure same-panel overlay
    updateClip(50);

    const formData = new FormData();
    formData.append('image', file);
    const vertical = verticalSel.value;
    // collect any vertical-specific inputs
    const extra = {};
    Array.from(optionsContainer.querySelectorAll('[data-opt]')).forEach(el => { extra[el.getAttribute('data-opt')] = el.value; });
    // pick from choices buttons if present
    if (choicesEl && choicesEl.dataset.key && choicesEl.dataset.value){ extra[choicesEl.dataset.key] = choicesEl.dataset.value; }
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
        // Load after image, then reveal smoothly
        afterImg.onload = () => {
          updateClip(Number(slider.value || 50));
        };
        afterImg.src = json.outputUrl;
        // Server logs both edit_success and a client_render; no client call needed
      } else {
        statusEl.textContent = 'No image returned';
      }
      // Show watermark if required by plan
      const wm = document.getElementById('w-watermark');
      if (json.watermark) { wm.style.display = 'block'; } else { wm.style.display = 'none'; }
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
      const v = (preset || cfg.vertical || '').toLowerCase();
      optionsContainer.innerHTML = '';
      // Render button choices per-vertical
      function renderChoices(key, values){
        choicesEl.innerHTML = '';
        choicesEl.style.display = 'flex';
        choicesEl.dataset.key = key;
        const label = document.createElement('div'); label.className='choices-label'; label.textContent='Choose option'; choicesEl.appendChild(label);
        values.forEach(val =>{
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'btn-choice'; b.textContent = val;
          b.addEventListener('click', ()=>{
            Array.from(choicesEl.children).forEach(c=> c.classList.remove('active'));
            b.classList.add('active'); choicesEl.dataset.value = val;
          });
          choicesEl.appendChild(b);
        });
        // set default from vo if provided
        if (vo && vo[key]){ Array.from(choicesEl.children).forEach(c=>{ if (c.textContent === vo[key]) c.classList.add('active'); }); choicesEl.dataset.value = vo[key]; }
      }

      if (v === 'detailing'){
        renderChoices('focus', ['exterior','interior']);
        const select = document.createElement('select');
        select.setAttribute('data-opt','focus');
        ['exterior','interior'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        select.style.display = 'none'; optionsContainer.appendChild(select);
      } else if (v === 'dental'){
        renderChoices('treatment', ['whitening','alignment','veneers']);
        const select = document.createElement('select');
        select.setAttribute('data-opt','treatment');
        ['whitening','alignment','veneers'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        select.style.display = 'none'; optionsContainer.appendChild(select);
      } else if (v === 'barber'){
        renderChoices('style', ['fade','buzz','undercut','pompadour']);
        const select = document.createElement('select');
        select.setAttribute('data-opt','style');
        ['fade','buzz','undercut','pompadour'].forEach(opt =>{ const o=document.createElement('option'); o.value=opt; o.textContent=opt; select.appendChild(o); });
        select.style.display = 'none'; optionsContainer.appendChild(select);
      }
      // override from config verticalOptions defaults if any
      Object.entries(vo).forEach(([k,v])=>{ const el = optionsContainer.querySelector(`[data-opt="${k}"]`); if (el) el.value = v; });
    }catch{}
  })();

  // Toggle submit enabled when a file is selected
  document.getElementById('w-image').addEventListener('change', ()=>{ submitBtn.disabled = !document.getElementById('w-image').files[0]; });
  document.getElementById('pick').addEventListener('click', ()=>{ /* handled */ });
})();


