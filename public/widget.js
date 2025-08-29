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
    const prompt = document.getElementById('w-prompt').value;
    if (vertical) formData.append('vertical', vertical);
    if (prompt) formData.append('prompt', prompt);
    if (embedId) formData.append('embedId', embedId);

    try {
      const resp = await fetch('/api/edit', { method: 'POST', body: formData });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed');
      statusEl.textContent = 'Rendering complete';
      if (json.outputUrl) {
        afterImg.src = json.outputUrl;
        if (embedId){ fetch('/api/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embedId, event: 'client_render', meta: { theme, vertical, prompt: Boolean(prompt) } }) }).catch(()=>{}); }
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
})();


