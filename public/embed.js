(function () {
  const script = document.currentScript;
  const dataset = script ? script.dataset : {};
  const embedId = dataset.embedId || '';
  const widthOverride = dataset.width || '';
  const heightOverride = dataset.height || '';
  const verticalOverride = dataset.vertical || '';
  const themeOverride = dataset.theme || '';

  const origin = new URL(script.src).origin;

  function renderIframe(cfg){
    const width = widthOverride || cfg.width || '100%';
    const height = heightOverride || cfg.height || '520px';
    const theme = (themeOverride || cfg.theme || 'light').toLowerCase();
    const vertical = verticalOverride || cfg.vertical || '';

    const iframe = document.createElement('iframe');
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.border = '0';
    iframe.allow = 'clipboard-read; clipboard-write;';
    const qp = new URLSearchParams({ theme, embedId });
    if (vertical) qp.set('vertical', vertical);
    iframe.src = origin + '/widget.html?' + qp.toString();

    script.parentNode.insertBefore(iframe, script);
  }

  if (embedId) {
    fetch(origin + '/api/embed/' + encodeURIComponent(embedId))
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Embed not found')))
      .then(cfg => renderIframe(cfg))
      .catch(() => renderIframe({}));
  } else {
    renderIframe({});
  }
})();


