(function () {
  const script = document.currentScript;
  const dataset = script ? script.dataset : {};
  const embedId = dataset.embedId || '';
  const widthOverride = dataset.width || '';
  const heightOverride = dataset.height || '';
  const verticalOverride = dataset.vertical || '';
  const themeOverride = dataset.theme || '';
  const maxWidth = dataset.maxWidth || '';
  const align = (dataset.align || 'center').toLowerCase(); // center | left | right
  const radius = dataset.radius || '12px';
  const shadow = dataset.shadow === 'false' ? 'none' : '0 8px 24px rgba(0,0,0,.12)';
  const border = dataset.border === 'false' ? '0' : '1px solid rgba(0,0,0,.08)';
  const variant = dataset.variant || 'card'; // card | compact
  const position = dataset.position || 'inline'; // inline | append
  const background = dataset.background || 'auto'; // auto | transparent | inherit
  const mode = dataset.mode || 'full'; // full | content-only
  const hideHeader = dataset.hideHeader === 'true'; // true | false
  const width = dataset.width || 'auto'; // auto | specific width
  const maxWidth = dataset.maxWidth || ''; // max width constraint
  const responsive = dataset.responsive === 'true'; // true | false

  const origin = new URL(script.src).origin;

  function renderIframe(cfg){
    const width = widthOverride || cfg.width || '100%';
    const height = heightOverride || cfg.height || '520px';
    const theme = (themeOverride || cfg.theme || 'light').toLowerCase();
    const vertical = verticalOverride || cfg.vertical || '';

    // wrapper to control layout gracefully across sites
    const wrapper = document.createElement('div');
    wrapper.style.display = 'block';
    wrapper.className = 'before-after-embed-widget';
    
    // Handle background transparency
    if (background === 'transparent') {
      wrapper.style.background = 'transparent';
    } else if (background === 'inherit') {
      wrapper.style.background = 'inherit';
    }
    
    // Handle width constraints
    if (width !== 'auto') {
      wrapper.style.width = width;
    }
    if (maxWidth) {
      wrapper.style.maxWidth = maxWidth;
    }
    if (responsive) {
      wrapper.style.width = '100%';
      wrapper.style.maxWidth = '100%';
    }
    
    if (align === 'center') wrapper.style.margin = '0 auto';
    if (align === 'left') wrapper.style.margin = '0';
    if (align === 'right') { wrapper.style.marginLeft = 'auto'; wrapper.style.marginRight = '0'; }

    const iframe = document.createElement('iframe');
    iframe.style.width = width || '100%';
    iframe.style.height = height;
    iframe.style.border = '0';
    iframe.style.borderRadius = radius;
    iframe.style.boxShadow = shadow;
    iframe.style.border = border;
    iframe.style.overflow = 'hidden';
    iframe.allow = 'clipboard-read; clipboard-write;';

    const qp = new URLSearchParams({ theme, embedId, variant });
    if (vertical) qp.set('vertical', vertical);
    if (background) qp.set('background', background);
    if (mode) qp.set('mode', mode);
    if (hideHeader) qp.set('hideHeader', 'true');
    iframe.src = origin + '/widget.html?' + qp.toString();

    wrapper.appendChild(iframe);
    
    // Handle positioning - render where script is placed by default
    if (position === 'append') {
      // Legacy behavior - append to body
      document.body.appendChild(wrapper);
    } else {
      // Default behavior - render inline where script is placed
      // Use replaceWith to replace the script tag with the widget
      script.replaceWith(wrapper);
    }
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


