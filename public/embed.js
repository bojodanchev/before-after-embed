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
  const responsive = dataset.responsive === 'true'; // true | false

  const origin = new URL(script.src).origin;

  function renderWidget(cfg){
    const theme = (themeOverride || cfg.theme || 'light').toLowerCase();
    const vertical = verticalOverride || cfg.vertical || '';

    // Create the widget container
    const wrapper = document.createElement('div');
    wrapper.className = 'before-after-embed-widget';
    wrapper.style.cssText = `
      display: inline-block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: ${maxWidth || '400px'};
      width: 100%;
      margin: 0;
      background: ${background === 'transparent' ? 'transparent' : background === 'inherit' ? 'inherit' : theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
      border-radius: ${radius};
      box-shadow: ${shadow};
      border: ${border};
      overflow: hidden;
    `;

    // Create the widget HTML structure (compact version)
    wrapper.innerHTML = `
      <div class="widget-content" style="padding: 16px;">
        <div class="image-upload-area" style="
          border: 2px dashed ${theme === 'dark' ? '#374151' : '#d1d5db'};
          border-radius: 8px;
          padding: 20px 12px;
          text-align: center;
          background: ${theme === 'dark' ? 'rgba(17,24,39,0.5)' : 'rgba(249,250,251,0.5)'};
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
          <div style="font-size: 12px; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; margin-bottom: 6px;">
            Drop image or
          </div>
          <button type="button" class="choose-image-btn" style="
            background: ${theme === 'dark' ? '#374151' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
            border-radius: 6px;
            padding: 4px 12px;
            color: ${theme === 'dark' ? '#ffffff' : '#374151'};
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          ">Choose</button>
          <input type="file" accept="image/*" style="display: none;" />
        </div>
        
        <div class="vertical-options" style="margin-bottom: 12px; display: none;">
          <div style="font-size: 11px; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; margin-bottom: 6px;">Choose option:</div>
          <div class="options-buttons" style="display: flex; gap: 4px; flex-wrap: wrap;"></div>
        </div>
        
        <button type="button" class="generate-btn" style="
          width: 100%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4);
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        " disabled>Generate →</button>
        
        <div class="result-area" style="display: none;">
          <div class="before-after-container" style="
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            background: ${theme === 'dark' ? 'rgba(17,24,39,0.5)' : 'rgba(249,250,251,0.5)'};
          ">
            <div class="before-label" style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              z-index: 10;
            ">Before</div>
            <div class="after-label" style="
              position: absolute;
              top: 8px;
              left: 8px;
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              z-index: 10;
            ">After</div>
            <div class="slider-container" style="position: relative;">
              <img class="before-image" style="width: 100%; height: auto; display: block;" />
              <div class="after-overlay" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 100%;
                overflow: hidden;
                clip-path: inset(0 50% 0 0);
              ">
                <img class="after-image" style="width: 200%; height: auto; display: block;" />
              </div>
              <input type="range" class="slider" min="0" max="100" value="50" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: ew-resize;
                z-index: 20;
              " />
            </div>
          </div>
        </div>
        
        <div class="status" style="
          text-align: center;
          font-size: 14px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          margin-top: 12px;
        "></div>
      </div>
    `;

    // Add event listeners
    setupWidgetEvents(wrapper, embedId, vertical, origin);

    // Handle positioning
    if (position === 'append') {
      document.body.appendChild(wrapper);
    } else {
      script.replaceWith(wrapper);
    }
  }

  function setupWidgetEvents(wrapper, embedId, vertical, origin) {
    const uploadArea = wrapper.querySelector('.image-upload-area');
    const fileInput = wrapper.querySelector('input[type="file"]');
    const chooseBtn = wrapper.querySelector('.choose-image-btn');
    const generateBtn = wrapper.querySelector('.generate-btn');
    const resultArea = wrapper.querySelector('.result-area');
    const beforeImage = wrapper.querySelector('.before-image');
    const afterImage = wrapper.querySelector('.after-image');
    const afterOverlay = wrapper.querySelector('.after-overlay');
    const slider = wrapper.querySelector('.slider');
    const status = wrapper.querySelector('.status');
    const verticalOptions = wrapper.querySelector('.vertical-options');
    const optionsButtons = wrapper.querySelector('.options-buttons');

    let selectedFile = null;
    let selectedOption = null;

    // Setup vertical options
    if (vertical) {
      const options = getVerticalOptions(vertical);
      if (options.length > 0) {
        verticalOptions.style.display = 'block';
        options.forEach(option => {
          const btn = document.createElement('button');
          btn.textContent = option;
          btn.style.cssText = `
            background: transparent;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          `;
          btn.addEventListener('click', () => {
            optionsButtons.querySelectorAll('button').forEach(b => b.style.background = 'transparent');
            btn.style.background = '#8b5cf6';
            btn.style.color = 'white';
            selectedOption = option;
          });
          optionsButtons.appendChild(btn);
        });
      }
    }

    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    chooseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFile = file;
        generateBtn.disabled = false;
        status.textContent = 'Ready to generate';
      }
    });

    // Generate button
    generateBtn.addEventListener('click', async () => {
      if (!selectedFile) return;

      generateBtn.disabled = true;
      status.textContent = 'Generating...';

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('embedId', embedId);
      if (vertical) formData.append('vertical', vertical);
      if (selectedOption) formData.append(`opt_${getOptionKey(vertical)}`, selectedOption);

      try {
        console.log('Sending request to /api/edit with method POST');
        const response = await fetch('/api/edit', {
          method: 'POST',
          body: formData
        });
        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }

        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error('Invalid JSON response:', text);
          throw new Error('Invalid response format');
        }

        if (result.outputUrl) {
          beforeImage.src = URL.createObjectURL(selectedFile);
          afterImage.src = result.outputUrl;
          resultArea.style.display = 'block';
          status.textContent = 'Generation complete!';
        } else {
          status.textContent = 'Error: ' + (result.error || 'Generation failed');
        }
      } catch (error) {
        console.error('Generation error:', error);
        status.textContent = 'Error: ' + error.message;
      } finally {
        generateBtn.disabled = false;
      }
    });

    // Slider
    slider.addEventListener('input', (e) => {
      const value = e.target.value;
      afterOverlay.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    });
  }

  function getVerticalOptions(vertical) {
    const options = {
      'barber': ['fade', 'buzz', 'undercut', 'pompadour'],
      'dental': ['whitening', 'alignment', 'veneers'],
      'detailing': ['exterior', 'interior']
    };
    return options[vertical] || [];
  }

  function getOptionKey(vertical) {
    const keys = {
      'barber': 'style',
      'dental': 'treatment',
      'detailing': 'focus'
    };
    return keys[vertical] || 'option';
  }

  // Ensure DOM is ready before rendering
  function initWidget() {
    if (embedId) {
      fetch(origin + '/api/embed/' + encodeURIComponent(embedId))
        .then(async r => {
          if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          }
          const text = await r.text();
          if (!text) {
            throw new Error('Empty response');
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('Invalid JSON response:', text);
            throw new Error('Invalid JSON response');
          }
        })
        .then(cfg => renderWidget(cfg))
        .catch(err => {
          console.error('Error loading embed config:', err);
          renderWidget({});
        });
    } else {
      renderWidget({});
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();


