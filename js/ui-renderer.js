const UIRenderer = (() => {
  const TOOLS = [
    { id: 'MÁY',      label: 'Máy Espresso', icon: '⚡', desc: 'Pressure-extracted concentrated shot' },
    { id: 'PHIN',     label: 'Phin',          icon: '🫖', desc: 'Traditional Vietnamese drip filter' },
    { id: 'FILTER',   label: 'Filter',        icon: '☕', desc: 'Pour-over or drip brew method' },
    { id: 'COLDBREW', label: 'Cold Brew',     icon: '🧊', desc: 'Slow cold-water immersion extraction' },
  ];

  const PREFS = [
    { id: 'LIGHT / FRUITY', label: 'Light / Fruity', icon: '🍑', desc: 'Bright acidity\nFloral aroma\nVibrant & light' },
    { id: 'BALANCE',        label: 'Balance',        icon: '⚖️', desc: 'Sweet & nutty\nSmooth body\nEveryday perfect' },
    { id: 'STRONG',         label: 'Strong',         icon: '💪', desc: 'Bold & intense\nDark chocolate\nHeavy body' },
  ];

  function prefClass(id) {
    return `chip--pref-${id.toLowerCase()}`;
  }

  function stars(score) {
    const full  = Math.floor(score);
    const half  = score % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  // ── Tool cards ────────────────────────────────────────────────────────
  function renderTools(container, selectedId, onSelect) {
    container.innerHTML = '';
    TOOLS.forEach(t => {
      const card = document.createElement('div');
      card.className = `sel-card${selectedId === t.id ? ' selected' : ''}`;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', selectedId === t.id);
      card.setAttribute('tabindex', '0');
      card.dataset.staggerItem = '';
      card.innerHTML = `
        <span class="sel-card-icon">${t.icon}</span>
        <div class="sel-card-title">${t.label}</div>
        <div class="sel-card-desc">${t.desc}</div>
        <div class="sel-card-check">✓</div>
      `;
      card.addEventListener('click', () => onSelect(t.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); }
      });
      container.appendChild(card);
    });
    Anim.staggerIn(container.querySelectorAll('.sel-card'));
  }

  function updateToolSelection(container, selectedId) {
    container.querySelectorAll('.sel-card').forEach(card => {
      const match = TOOLS.find(t => card.querySelector('.sel-card-title')?.textContent === t.label);
      if (!match) return;
      const isSelected = match.id === selectedId;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-checked', isSelected);
    });
  }

  // ── Preference cards ──────────────────────────────────────────────────
  function renderPrefs(container, selectedId, onSelect) {
    container.innerHTML = '';
    PREFS.forEach(p => {
      const card = document.createElement('div');
      card.className = `sel-card${selectedId === p.id ? ' selected' : ''}`;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', selectedId === p.id);
      card.setAttribute('tabindex', '0');
      card.dataset.staggerItem = '';
      const descLines = p.desc.split('\n').join('<br>');
      card.innerHTML = `
        <span class="sel-card-icon">${p.icon}</span>
        <div class="sel-card-title">${p.label}</div>
        <div class="sel-card-desc">${descLines}</div>
        <div class="sel-card-check">✓</div>
      `;
      card.addEventListener('click', () => onSelect(p.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id); }
      });
      container.appendChild(card);
    });
    Anim.staggerIn(container.querySelectorAll('.sel-card'));
  }

  function updatePrefSelection(container, selectedId) {
    container.querySelectorAll('.sel-card').forEach(card => {
      const match = PREFS.find(p => card.querySelector('.sel-card-title')?.textContent === p.label);
      if (!match) return;
      const isSelected = match.id === selectedId;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-checked', isSelected);
    });
  }

  // ── Recipe cards ──────────────────────────────────────────────────────
  function renderRecipeCards(container, recipes, onOpen, onFavToggle) {
    container.innerHTML = '';
    if (!recipes.length) return;

    recipes.forEach(r => {
      const isFav = State.isFavorite(r.id);
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.setAttribute('role', 'listitem');
      card.dataset.staggerItem = '';
      card.dataset.id = r.id;
      card.innerHTML = `
        <div class="recipe-card-header">
          <div>
            <div class="recipe-card-title">${r.coffee.name}</div>
            <div class="recipe-card-origin">${r.coffee.origin}</div>
          </div>
          <button class="recipe-card-fav${isFav ? ' active' : ''}" aria-label="${isFav ? 'Remove from' : 'Add to'} favorites" data-id="${r.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="recipe-card-notes">
          ${r.coffee.notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
        </div>
        <div class="recipe-card-footer">
          ${r.score != null ? `<div class="recipe-card-score"><span>${stars(r.score)}</span><span>${r.score}</span></div>` : '<div></div>'}
          <span class="recipe-card-cta">View Recipe →</span>
        </div>
      `;

      // Open modal on card click (but not fav button)
      card.addEventListener('click', e => {
        if (e.target.closest('.recipe-card-fav')) return;
        onOpen(r.id);
      });

      // Fav toggle
      card.querySelector('.recipe-card-fav').addEventListener('click', e => {
        e.stopPropagation();
        onFavToggle(r.id, card);
      });

      container.appendChild(card);
    });

    Anim.staggerIn(container.querySelectorAll('.recipe-card'), { stagger: 0.07 });
  }

  function updateFavButton(btn, isActive) {
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-label', (isActive ? 'Remove from' : 'Add to') + ' favorites');
    btn.querySelector('svg').setAttribute('fill', isActive ? 'currentColor' : 'none');
    btn.classList.add('pop');
    btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
  }

  // ── Favorites list ────────────────────────────────────────────────────
  function renderFavoritesList(container, emptyEl, recipes, onOpen) {
    container.innerHTML = '';
    const hasFavs = recipes.length > 0;
    emptyEl.style.display = hasFavs ? 'none' : 'block';

    recipes.forEach(r => {
      const item = document.createElement('div');
      item.className = 'fav-item';
      item.setAttribute('tabindex', '0');
      const toolLabel = { MÁY: 'Máy Espresso', PHIN: 'Phin', ESPRESSO: 'Espresso', FILTER: 'Filter', COLD_BREW: 'Cold Brew', COLDBREW: 'Cold Brew' }[r.tool] || r.tool;
      item.innerHTML = `
        <div class="fav-item-name">${r.coffee.name}</div>
        <div class="fav-item-sub">${toolLabel} · ${r.preference.charAt(0) + r.preference.slice(1).toLowerCase()}</div>
      `;
      item.addEventListener('click', () => onOpen(r.id));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter') onOpen(r.id);
      });
      container.appendChild(item);
    });
  }

  // ── Modal content ─────────────────────────────────────────────────────
  function renderModalContent(recipe) {
    const TOOL_LABELS = { MÁY: 'Máy Espresso', PHIN: 'Phin', ESPRESSO: 'Espresso', FILTER: 'Filter', COLD_BREW: 'Cold Brew', COLDBREW: 'Cold Brew' };
    const toolLabel = TOOL_LABELS[recipe.tool] || recipe.tool;

    const prefSlug = recipe.preference.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const prefChipClass = `chip--pref-${prefSlug}`;
    const prefDisplay = recipe.preference.charAt(0) + recipe.preference.slice(1).toLowerCase();

    const r = recipe.recipe || {};
    const temp = r.temperature;
    const tempStr = temp != null ? (temp === 4 ? `${temp}°C (cold)` : `${temp}°C`) : null;

    const detailItems = [
      { label: 'Ratio',       value: r.ratio },
      { label: 'Dose',        value: r.dose },
      { label: 'Water',       value: r.water },
      { label: 'Temperature', value: tempStr },
      { label: 'Bloom Temp',  value: r.bloomTemp != null ? `${r.bloomTemp}°C` : null },
      { label: 'Cold Water',  value: r.coldWaterTemp != null ? `${r.coldWaterTemp}°C` : null },
      { label: 'Grind',       value: r.grind },
      { label: 'Water PPM',   value: r.waterPPM },
      { label: 'Brew Time',   value: r.brewTime },
      { label: 'Milk Ratio',  value: r.milkRatio },
    ].filter(item => item.value != null);

    const detailSection = r.note
      ? `<p class="modal-recipe-desc">${r.note}</p>`
      : `<div class="recipe-detail-grid">
          ${detailItems.map(item => `
            <div class="recipe-detail-item">
              <div class="recipe-detail-label">${item.label}</div>
              <div class="recipe-detail-value">${item.value}</div>
            </div>
          `).join('')}
        </div>`;

    return `
      <p class="modal-origin">📍 ${recipe.coffee.origin}</p>
      <h2 class="modal-coffee-name">${recipe.coffee.name}</h2>
      <div class="modal-chips">
        <span class="chip chip--tool">${toolLabel}</span>
        <span class="chip ${prefChipClass}">${prefDisplay}</span>
      </div>
      <div class="modal-notes">
        ${recipe.coffee.notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
      </div>
      ${recipe.description ? `<p class="modal-recipe-desc">${recipe.description}</p>` : ''}

      <hr class="modal-divider">

      <div class="modal-section-label">Recipe Details</div>
      ${detailSection}

      <hr class="modal-divider">

      <div class="modal-section-label">Brew Timeline</div>
      <div class="brew-timeline" id="brew-timeline"></div>

      <hr class="modal-divider">

      <div class="modal-section-label">Brew Timer</div>
      <div class="brew-timer" id="brew-timer-widget">
        <div class="brew-timer-display" id="timer-display">00:00</div>
        <div class="brew-timer-step-name" id="timer-step-name">Ready to brew</div>
        <div class="brew-timer-progress-wrap">
          <div class="brew-timer-progress" id="timer-progress"></div>
        </div>
        <div class="brew-timer-passive" id="timer-passive"></div>
        <div class="brew-timer-controls">
          <button class="btn-timer" id="btn-timer-reset" aria-label="Reset timer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
          </button>
          <button class="btn-timer btn-timer-play" id="btn-timer-play" aria-label="Start timer">
            <svg id="play-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg id="pause-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="display:none">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button class="btn-timer" id="btn-timer-skip" aria-label="Skip step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
          </button>
        </div>
      </div>
      ${recipe.disclaimer ? `<p class="modal-recipe-desc" style="font-size:0.8em;opacity:0.7;margin-top:var(--space-4)">${recipe.disclaimer}</p>` : ''}
    `;
  }

  return {
    TOOLS, PREFS,
    renderTools, updateToolSelection,
    renderPrefs, updatePrefSelection,
    renderRecipeCards, updateFavButton,
    renderFavoritesList,
    renderModalContent,
  };
})();
