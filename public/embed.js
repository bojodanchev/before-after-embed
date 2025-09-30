// Before/After Embed Widget - Production Ready
// Shadow DOM approach with iframe fallback
(() => {
  const S = document.currentScript; 
  if (!S) return;
  
  const datasetVariant = (S.dataset.variant || '').toLowerCase();
  const datasetWide = (S.dataset.wide || S.dataset.wideLayout || S.dataset.layout || '').toLowerCase();
  const allowWide = datasetWide !== 'false' && datasetWide !== 'compact';

  let resolvedVariant;
  if (datasetVariant === 'card' || datasetVariant === 'compact') {
    resolvedVariant = datasetVariant;
  } else {
    let availableWidth = 0;
    if (S.parentElement) {
      availableWidth = S.parentElement.clientWidth || S.parentElement.getBoundingClientRect().width || 0;
    }
    if (!availableWidth) {
      availableWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    }
    resolvedVariant = (allowWide && availableWidth >= 640) ? 'card' : 'compact';
  }

  const defaultMaxWidth = resolvedVariant === 'card' ? '960px' : '640px';

  const cfg = {
    id: S.dataset.embedId, 
    variant: resolvedVariant || 'compact', 
    theme: S.dataset.theme || 'auto',
    locale: S.dataset.locale || 'en',
    maxWidth: S.dataset.maxWidth || defaultMaxWidth, 
    align: S.dataset.align || 'center',
    radius: S.dataset.radius || '14px', 
    shadow: S.dataset.shadow === 'true',
    border: S.dataset.border === 'true', 
    width: S.dataset.width || '100%', 
    height: S.dataset.height || (resolvedVariant === 'card' ? '520px' : '460px')
  };
  try { window.__lastBAConfig = cfg; } catch (_e) {}
  
  if (!cfg.id) return console.warn('[B/A] missing data-embed-id');

  const supportsShadow = !!HTMLElement.prototype.attachShadow;
  const preferShadow = cfg.variant !== 'card'; // Default to Shadow DOM unless explicitly card
  
  (preferShadow && supportsShadow) ? mountShadow() : mountIframe();

  function mountShadow() {
    const host = document.createElement('div');
    host.style.display = 'inline-block'; 
    host.style.maxWidth = cfg.maxWidth; 
    host.style.width = cfg.width;
    host.style.margin = cfg.align === 'center' ? '0 auto' : (cfg.align === 'right' ? '0 0 0 auto' : '0');
    host.style.verticalAlign = 'top';
    S.parentNode.replaceChild(host, S);
    
    const root = host.attachShadow({ mode: 'open' });

    // Transparent by default; only the card gets a surface color via tokens.
    root.innerHTML = `
      <style>
        :host { all: initial; contain: content; }
        .wrap {
          border-radius: ${cfg.radius}; 
          ${cfg.border ? 'border: 1px solid var(--ba-border);' : ''}
          ${cfg.shadow ? 'box-shadow: 0 6px 24px rgba(0,0,0,.28);' : ''}
          background: var(--ba-surface); 
          color: var(--ba-fg); 
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
        }
        .drop {
          border: 1px dashed var(--ba-border); 
          border-radius: 12px; 
          padding: 18px; 
          background: transparent; 
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .drop:hover {
          border-color: var(--ba-accent);
          background: rgba(124, 58, 237, 0.1);
        }
        .row {
          display: flex; 
          gap: 12px; 
          align-items: center;
          flex-wrap: wrap;
        }
        .btn {
          background: linear-gradient(90deg, #7c3aed, #ec4899, #22d3ee); 
          color: #fff; 
          border: 0; 
          border-radius: 10px; 
          padding: 10px 14px; 
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .opt {
          border: 1px solid var(--ba-border); 
          background: transparent; 
          color: var(--ba-fg); 
          border-radius: 999px; 
          padding: 6px 10px; 
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.04);
          margin-right: 6px;
        }
        .opt:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.18);
        }
        .opt.selected {
          background: linear-gradient(90deg, #7c3aed, #ec4899);
          color: #fff;
          border-color: var(--ba-accent);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
        }
        .muted {
          color: var(--ba-muted); 
          font-size: 12px;
        }
        .slider {
          margin-top: 12px; 
          border: 1px solid var(--ba-border); 
          border-radius: 12px; 
          overflow: hidden; 
          background: transparent; 
          height: ${px(cfg.height)};
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }
        .slider img {
          display: block; 
          max-width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .slider-control {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 14px;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, rgba(124,58,237,.35), rgba(34,211,238,.35));
          border-radius: 2px;
          cursor: ew-resize;
          touch-action: none;
        }
        .slider-thumb {
          position: absolute;
          top: -8px;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .status {
          margin-top: 8px;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          background: rgba(255,255,255,.04);
        }
        .status.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .status.success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }
        /* theme tokens */
        :host { 
          --ba-surface: ${token('surface', cfg.theme)}; 
          --ba-fg: ${token('fg', cfg.theme)};
          --ba-border: ${token('border', cfg.theme)}; 
          --ba-muted: ${token('muted', cfg.theme)};
          --ba-accent: var(--ba-accent-internal, #7c3aed);
        }
      </style>
      <div class="wrap" part="container" role="group" aria-label="Before After editor">
        <div class="row" style="justify-content: space-between; margin-bottom: 8px">
          <span class="muted" aria-hidden="true">Before</span><span class="muted" aria-hidden="true">After</span>
        </div>
        <div class="row">
          <div class="drop" id="dropzone" role="button" tabindex="0" aria-label="Drop image or choose file">
            <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
            <div class="muted" style="margin-bottom: 6px;">Drop image or</div>
            <button type="button" class="btn" style="font-size: 12px; padding: 6px 12px;" aria-label="Choose image">Choose</button>
            <input id="file" type="file" accept="image/*" style="display: none;" aria-hidden="true">
          </div>
          <div id="opts" style="flex: 1; min-width: 200px;"></div>
        </div>
        <div style="margin-top: 12px">
          <button id="gen" class="btn" disabled aria-disabled="true">Generate →</button>
        </div>
        <div id="slider" class="slider" style="display: none;" role="region" aria-live="polite"></div>
        <div id="status" class="status" style="display: none;" role="status" aria-live="polite"></div>
        <div id="wm" class="muted" style="margin-top: 8px; display: none; text-align: center;">Powered by Before/After</div>
      </div>
    `;

    const file = root.getElementById('file');
    const dropzone = root.getElementById('dropzone');
    const slider = root.getElementById('slider');
    const opts = root.getElementById('opts');
    const genBtn = root.getElementById('gen');
    const status = root.getElementById('status');
    let selectedOpt = null;
    let beforeUrl = '';
    let afterUrl = '';

    // Load embed configuration
    fetch(`https://before-after-embed.vercel.app/api/embed/${encodeURIComponent(cfg.id)}`)
      .then(r => r.json())
      .then(conf => {
        const vertical = conf.vertical || 'barber';
        // Apply brand accent if customization is allowed by plan
        try{
          if (conf && conf.customization === 'custom' && conf.accent){
            root.host.style.setProperty('--ba-accent-internal', conf.accent);
          }
        }catch(_e){}
        if (conf.watermark) {
          root.getElementById('wm').style.display = 'block';
        }
        
        const choices = conf.verticalOptions?.choices || {
          barber: ['fade', 'buzz', 'undercut', 'pompadour'],
          dental: ['whitening', 'alignment', 'veneers'],
          detailing: ['interior', 'exterior', 'wheels']
        }[vertical] || [];
        // Store current vertical so we can send it with the request
        root.__ba_vertical = vertical;
        
        if (choices.length > 0) {
          opts.innerHTML = choices.map(o => 
            `<button class="opt" data-o="${o}">${(vertical==='dental' && cfg.locale==='bg')?({whitening:'избелване',alignment:'подравняване',veneers:'фасети'}[o]||o):o}</button>`
          ).join('');
          
          opts.addEventListener('click', e => {
            const b = e.target.closest('.opt');
            if (!b) return;
            selectedOpt = b.dataset.o;
            [...opts.children].forEach(n => n.classList.remove('selected'));
            b.classList.add('selected');
          });
        }
      })
      .catch(() => {});

    // File handling
    dropzone.addEventListener('click', () => file.click());
    dropzone.addEventListener('keydown', (e)=>{ if (e.key==='Enter' || e.key===' '){ e.preventDefault(); file.click(); }});
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--ba-accent)';
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--ba-border)';
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--ba-border)';
      if (e.dataTransfer.files[0]) {
        file.files = e.dataTransfer.files;
        handleFileSelect();
      }
    });

    file.addEventListener('change', handleFileSelect);

    async function handleFileSelect() {
      const f = file.files?.[0];
      if (!f) return;
      
      try {
        showStatus('Uploading image...', 'info');
        beforeUrl = URL.createObjectURL(f);
        slider.innerHTML = `<img src="${beforeUrl}" alt="before">`;
        slider.style.display = 'block';
        genBtn.disabled = false;
        hideStatus();
      } catch (err) {
        showStatus('Failed to load image', 'error');
      }
    }

    // Generate button
    genBtn.addEventListener('click', async () => {
      if (!beforeUrl) {
        showStatus('Choose an image first', 'error');
        return;
      }
      
      try {
        genBtn.disabled = true;
        showStatus('Generating...', 'info');
        
        const formData = new FormData();
        formData.append('image', file.files[0]);
        formData.append('embedId', cfg.id);
        // Send vertical and structured option fields expected by API
        const vertical = root.__ba_vertical || '';
        if (vertical) formData.append('vertical', vertical);
        if (selectedOpt) {
          if (vertical === 'barber') formData.append('opt_style', selectedOpt);
          else if (vertical === 'dental') formData.append('opt_treatment', selectedOpt);
          else if (vertical === 'detailing') formData.append('opt_focus', selectedOpt);
        }
        
        const response = await fetch('https://before-after-embed.vercel.app/api/edit', {
          method: 'POST',
          body: formData
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          const detail = payload?.error || payload?.details || payload?.detail || response.statusText || `HTTP ${response.status}`;
          throw new Error(detail);
        }

        afterUrl = payload.outputUrl;
        renderSlider(slider, beforeUrl, afterUrl);
        showStatus('Generated successfully!', 'success');
        
      } catch (err) {
        // Friendlier errors for users (common cases)
        let msg = err && err.message || 'Failed';
        if (/413|payload too large/i.test(msg)) msg = 'Image too large. Please upload JPG/PNG/WEBP/HEIC under 12MB.';
        if (/415|unsupported/i.test(msg)) msg = 'Unsupported image. Please upload JPG/PNG/WEBP/HEIC.';
        if (/Generation limit/i.test(msg)) msg = 'Monthly generation limit reached. Please upgrade your plan to continue.';
        if (/empty|greater than 0/i.test(msg)) msg = 'Uploaded image seems empty. Please re-upload the photo.';
        showStatus(`Error: ${msg}`, 'error');
      } finally {
        genBtn.disabled = false;
      }
    });

    function renderSlider(root, before, after) {
      if (typeof root.__baCleanup === 'function') {
        try { root.__baCleanup(); } catch (_e) {}
      }

      root.innerHTML = `
        <div style="position: relative; height: 100%">
          <img src="${after}" alt="After image" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover">
          <img id="b" src="${before}" alt="Before image" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; clip-path: inset(0 50% 0 0)">
          <div class="slider-control" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0" aria-label="Before After slider">
            <div id="r" class="slider-thumb" style="left: 50%; transform: translateX(-50%);"></div>
          </div>
        </div>`;
      
      const r = root.querySelector('#r');
      const b = root.querySelector('#b');
      const sliderCtl = root.querySelector('.slider-control');
      let isDragging = false;
      
      function updateSlider(x) {
        const rect = root.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        r.style.left = `${percent}%`;
        b.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        if (sliderCtl) sliderCtl.setAttribute('aria-valuenow', Math.round(percent));
      }

      const getClientX = (e) => {
        if (typeof e?.clientX === 'number') return e.clientX;
        if (e?.touches?.[0]) return e.touches[0].clientX;
        if (e?.changedTouches?.[0]) return e.changedTouches[0].clientX;
        return null;
      };

      const startDrag = (e) => {
        const x = getClientX(e);
        if (x != null) updateSlider(x);
        isDragging = true;
        if (typeof e?.preventDefault === 'function') e.preventDefault();
      };

      const moveDrag = (e) => {
        if (!isDragging) return;
        const x = getClientX(e);
        if (x != null) {
          updateSlider(x);
          if (e?.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
        }
      };

      const endDrag = () => {
        isDragging = false;
      };

      const cleanupFns = [];

      const pointerTargets = [r, sliderCtl];

      if (window.PointerEvent) {
        let captureTarget = null;
        const pointerDown = (e) => {
          captureTarget = e.currentTarget;
          startDrag(e);
          captureTarget.setPointerCapture?.(e.pointerId);
        };
        const pointerMove = (e) => moveDrag(e);
        const pointerUp = (e) => {
          endDrag();
          captureTarget?.releasePointerCapture?.(e.pointerId);
          captureTarget = null;
        };

        pointerTargets.forEach((el) => {
          el.addEventListener('pointerdown', pointerDown);
          el.addEventListener('pointerup', pointerUp);
          cleanupFns.push(() => {
            el.removeEventListener('pointerdown', pointerDown);
            el.removeEventListener('pointerup', pointerUp);
          });
        });

        root.addEventListener('pointermove', pointerMove);
        root.addEventListener('pointerup', pointerUp);
        root.addEventListener('pointerleave', pointerUp);
        cleanupFns.push(() => {
          root.removeEventListener('pointermove', pointerMove);
          root.removeEventListener('pointerup', pointerUp);
          root.removeEventListener('pointerleave', pointerUp);
        });
      } else {
        const mouseMove = (e) => moveDrag(e);
        const mouseUp = () => endDrag();
        const mouseDown = (e) => {
          startDrag(e);
        };

        pointerTargets.forEach((el) => {
          el.addEventListener('mousedown', mouseDown);
          el.addEventListener('touchstart', mouseDown, { passive: true });
        });

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        const touchMove = (e) => moveDrag(e);
        const touchEnd = () => endDrag();
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('touchcancel', touchEnd);
        cleanupFns.push(() => {
          pointerTargets.forEach((el) => {
            el.removeEventListener('mousedown', mouseDown);
            el.removeEventListener('touchstart', mouseDown);
          });
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('mouseup', mouseUp);
          document.removeEventListener('touchmove', touchMove);
          document.removeEventListener('touchend', touchEnd);
          document.removeEventListener('touchcancel', touchEnd);
        });
      }

      root.addEventListener('click', (e) => {
        if (!isDragging) {
          const x = getClientX(e);
          if (x != null) updateSlider(x);
        }
      });

      sliderCtl.addEventListener('keydown', (e)=>{
        const rect = root.getBoundingClientRect();
        const current = parseFloat(r.style.left) || 50;
        if (e.key === 'ArrowLeft'){ updateSlider(rect.left + (rect.width * Math.max(0,current-5)/100)); e.preventDefault(); }
        if (e.key === 'ArrowRight'){ updateSlider(rect.left + (rect.width * Math.min(100,current+5)/100)); e.preventDefault(); }
      });

      root.__baCleanup = () => {
        cleanupFns.forEach((fn) => {
          try { fn(); } catch (_e) {}
        });
      };
    }

    function showStatus(message, type) {
      status.textContent = message;
      status.className = `status ${type}`;
      status.style.display = 'block';
    }

    function hideStatus() {
      status.style.display = 'none';
    }

    function token(kind, mode) {
      const light = {
        surface: '#ffffff',
        fg: '#0b0d10',
        border: 'rgba(2,6,23,0.12)',
        muted: '#64748b'
      };
      const dark = {
        surface: 'rgba(255,255,255,0.06)',
        fg: '#ffffff',
        border: 'rgba(255,255,255,0.12)',
        muted: 'rgba(255,255,255,0.6)'
      };
      
      if (mode === 'light') return light[kind];
      if (mode === 'dark') return dark[kind];
      return (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? dark : light)[kind];
    }
    
    function px(v) { 
      return /^\d+$/.test(v) ? `${v}px` : v; 
    }
  }

  function mountIframe() {
    const f = document.createElement('iframe');
    f.src = `https://before-after-embed.vercel.app/widget.html?embedId=${encodeURIComponent(cfg.id)}&variant=${cfg.variant}&theme=${cfg.theme}&background=transparent`;
    f.style.background = 'transparent'; 
    f.style.border = cfg.border ? '1px solid rgba(255,255,255,.12)' : '0';
    f.style.borderRadius = cfg.radius; 
    f.style.boxShadow = cfg.shadow ? '0 6px 24px rgba(0,0,0,.28)' : 'none';
    f.style.display = 'inline-block'; 
    f.style.width = cfg.width; 
    f.style.height = '10px'; 
    f.style.maxWidth = cfg.maxWidth;
    f.style.margin = cfg.align === 'center' ? '0 auto' : (cfg.align === 'right' ? '0 0 0 auto' : '0');
    f.style.verticalAlign = 'top';
    f.style.overflow = 'hidden';
    f.allowTransparency = 'true';
    S.parentNode.replaceChild(f, S);
    
    // Auto-height
    window.addEventListener('message', e => { 
      if (e.source === f.contentWindow && e.data?.type === 'ba:height') { 
        f.style.height = `${e.data.height}px`; 
      } 
    });
  }
})();
