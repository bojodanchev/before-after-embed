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
        <div id="placeholder" class="slider" style="display: block;" role="region">
          <div style="position: relative; width: 100%; padding-bottom: 66.67%; background: #1a1a1a; overflow: hidden; border-radius: 8px;">
            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&q=80" alt="Before example" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
            <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&q=80" alt="After example" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; clip-path: inset(0 50% 0 0);">
            <div class="slider-thumb" style="left: 50%; transform: translateX(-50%); pointer-events: none;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.75); color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; text-align: center; pointer-events: none; max-width: 80%;">
              📸 Upload a photo to see your results
            </div>
          </div>
        </div>
        <div id="slider" class="slider" style="display: none;" role="region" aria-live="polite"></div>
        <div id="status" class="status" style="display: none;" role="status" aria-live="polite"></div>
        <div id="wm" class="muted" style="margin-top: 8px; display: none; text-align: center;">Powered by Before/After</div>
      </div>
    `;

    const file = root.getElementById('file');
    const dropzone = root.getElementById('dropzone');
    const placeholder = root.getElementById('placeholder');
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

          // Set default selected option (first button, which is 'interior' for detailing)
          const defaultButton = opts.querySelector('button');
          if (defaultButton) {
            selectedOpt = defaultButton.dataset.o;
            defaultButton.classList.add('selected');
            console.log('[Before/After] Default option selected:', selectedOpt);
          }

          opts.addEventListener('click', e => {
            const b = e.target.closest('.opt');
            if (!b) return;
            selectedOpt = b.dataset.o;
            [...opts.children].forEach(n => n.classList.remove('selected'));
            b.classList.add('selected');
            console.log('[Before/After] Option selected:', selectedOpt);
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

    // Compress large images before upload
    async function compressImage(file, maxSizeMB = 10, maxWidthOrHeight = 2048) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Scale down if image is too large
            if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
              if (width > height) {
                height = (height / width) * maxWidthOrHeight;
                width = maxWidthOrHeight;
              } else {
                width = (width / height) * maxWidthOrHeight;
                height = maxWidthOrHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Try different quality levels until under target size
            let quality = 0.9;
            const tryCompress = () => {
              canvas.toBlob((blob) => {
                if (!blob) {
                  reject(new Error('Compression failed'));
                  return;
                }
                
                const sizeMB = blob.size / 1024 / 1024;
                if (sizeMB <= maxSizeMB || quality <= 0.5) {
                  // Create a File object with original name
                  const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                  console.log('[Before/After] Compressed:', `${(file.size/1024/1024).toFixed(1)}MB → ${sizeMB.toFixed(1)}MB`);
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  tryCompress();
                }
              }, 'image/jpeg', quality);
            };
            tryCompress();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    }

    async function handleFileSelect() {
      const f = file.files?.[0];
      if (!f) return;
      
      try {
        // Validate file type first
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        if (!allowedTypes.includes(f.type.toLowerCase())) {
          showStatus(`Unsupported format (${f.type}). Please upload JPG, PNG, WEBP, or HEIC.`, 'error');
          console.warn('[Before/After] Unsupported file type:', f.type);
          return;
        }
        
        showStatus('Loading image...', 'info');
        let processedFile = f;
        
        // Auto-compress if file is large (> 5MB)
        const sizeMB = f.size / 1024 / 1024;
        if (sizeMB > 5) {
          showStatus(`Compressing image (${sizeMB.toFixed(1)}MB)...`, 'info');
          try {
            processedFile = await compressImage(f, 10, 2048);
            console.log('[Before/After] Compression complete');
          } catch (compressionErr) {
            console.warn('[Before/After] Compression failed, using original:', compressionErr);
            // Continue with original file if compression fails
          }
        }
        
        // Validate final size (25MB hard limit)
        const finalSizeMB = processedFile.size / 1024 / 1024;
        if (finalSizeMB > 25) {
          showStatus(`Image too large (${finalSizeMB.toFixed(1)}MB). Please upload a smaller photo.`, 'error');
          console.warn('[Before/After] File size exceeds 25MB after compression:', processedFile.size);
          return;
        }
        
        // Store processed file for upload
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(processedFile);
        file.files = dataTransfer.files;
        
      beforeUrl = URL.createObjectURL(processedFile);
      placeholder.style.display = 'none';
      slider.innerHTML = `<img src="${beforeUrl}" alt="before" style="width: 100%; height: 100%; object-fit: contain;">`;
      slider.style.display = 'block';
      genBtn.disabled = false;
      hideStatus();
      console.log('[Before/After] Image loaded:', processedFile.name, `${(processedFile.size / 1024).toFixed(1)}KB`);
      } catch (err) {
        showStatus('Failed to load image. Please try a different photo.', 'error');
        console.error('[Before/After] Image load error:', err);
      }
    }

    // Generate button
    genBtn.addEventListener('click', async () => {
      if (!beforeUrl) {
        showStatus('Choose an image first', 'error');
        return;
      }
      
      const startTime = Date.now();
      try {
        genBtn.disabled = true;
        showStatus('Generating...', 'info');
        console.log('[Before/After] Starting generation...', { embedId: cfg.id, vertical: root.__ba_vertical, option: selectedOpt });
        
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
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (!response.ok || !payload) {
          const detail = payload?.error || payload?.details || payload?.detail || response.statusText || `HTTP ${response.status}`;
          console.error('[Before/After] Generation failed:', { status: response.status, error: detail, duration: `${duration}s` });
          throw new Error(detail);
        }

        afterUrl = payload.outputUrl;
        renderSlider(slider, beforeUrl, afterUrl);
        showStatus('Generated successfully!', 'success');
        console.log('[Before/After] Generation complete:', { duration: `${duration}s`, outputUrl: afterUrl });
        
      } catch (err) {
        // Friendlier errors for users (common cases)
        let msg = err && err.message || 'Failed';
        const originalMsg = msg;
        
        if (/413|payload too large/i.test(msg)) msg = 'Image too large. Please upload JPG/PNG/WEBP/HEIC under 25MB.';
        else if (/415|unsupported/i.test(msg)) msg = 'Unsupported image. Please upload JPG/PNG/WEBP/HEIC.';
        else if (/Generation limit/i.test(msg)) msg = 'Monthly generation limit reached. Please upgrade your plan to continue.';
        else if (/empty|greater than 0/i.test(msg)) msg = 'Uploaded image seems empty. Please re-upload the photo.';
        else if (/network|fetch/i.test(msg)) msg = 'Network error. Please check your connection and try again.';
        else if (/timeout/i.test(msg)) msg = 'Request timed out. The image may be too large or your connection is slow.';
        
        showStatus(`Error: ${msg}`, 'error');
        console.error('[Before/After] Generation error:', { error: originalMsg, userMessage: msg, embedId: cfg.id });
      } finally {
        genBtn.disabled = false;
      }
    });

    function renderSlider(root, before, after) {
      if (typeof root.__baCleanup === 'function') {
        try { root.__baCleanup(); } catch (_e) {}
      }

      root.innerHTML = `
        <div style="position: relative; width: 100%; padding-bottom: 75%; background: #000; border-radius: 8px; overflow: hidden;">
          <img src="${after}" alt="After image" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;">
          <img id="b" src="${before}" alt="Before image" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; clip-path: inset(0 50% 0 0);">
          <div class="slider-control" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0" aria-label="Before After slider" style="position: absolute; inset: 0; cursor: ew-resize; touch-action: none;">
            <div id="r" class="slider-thumb" style="left: 50%; transform: translateX(-50%); cursor: ew-resize;"></div>
          </div>
        </div>`;
      
      const r = root.querySelector('#r');
      const b = root.querySelector('#b');
      const sliderCtl = root.querySelector('.slider-control');
      let isDragging = false;
      
      function updateSlider(x) {
        const rect = sliderCtl.getBoundingClientRect();
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
