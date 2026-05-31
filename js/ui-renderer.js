const UIRenderer = (() => {
  const TOOLS = [
    { id: 'MÁY',      label: 'Espresso', icon: '⚡', desc: 'Pressure-extracted concentrated shot' },
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
      const notes = r.coffee.notes || [];
      const originLine = [r.coffee.origin, r.coffee.region].filter(Boolean).join(' — ');
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.setAttribute('role', 'listitem');
      card.dataset.staggerItem = '';
      card.dataset.id = r.id;
      card.innerHTML = `
        <div class="recipe-card-header">
          <div>
            <div class="recipe-card-title">${r.coffee.name}</div>
            <div class="recipe-card-origin">${originLine}</div>
          </div>
          <button class="recipe-card-fav${isFav ? ' active' : ''}" aria-label="${isFav ? 'Remove from' : 'Add to'} favorites" data-id="${r.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="recipe-card-notes">
          ${notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
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
      const toolLabel = { MÁY: 'Espresso', PHIN: 'Phin', ESPRESSO: 'Espresso', FILTER: 'Filter', COLD_BREW: 'Cold Brew', COLDBREW: 'Cold Brew' }[r.tool] || r.tool;
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

  // ── Specs grid (shared helper, also exposed publicly) ─────────────────
  function renderSpecsGrid(specs) {
    if (!specs) return '';
    const items = [
      { label: 'Ratio',       value: specs.ratio },
      { label: 'Temperature', value: specs.temperature != null ? `${specs.temperature}°C` : null },
      { label: 'Bloom Temp',  value: specs.bloomTemp != null ? `${specs.bloomTemp}°C` : null },
      { label: 'Cold Water',  value: specs.coldWaterTemp != null ? `${specs.coldWaterTemp}°C` : null },
      { label: 'Dose',        value: specs.doseGr != null ? `${specs.doseGr}g` : (specs.dose || null) },
      { label: 'Water',       value: specs.waterGr != null ? `${specs.waterGr}g` : (specs.water || null) },
      { label: 'Grind',       value: specs.grind },
      { label: 'Water PPM',   value: specs.waterPPM },
      { label: 'Tools',       value: specs.tools },
      { label: 'Brew Time',   value: specs.brewTime || (specs.brewTimeSec != null ? `${specs.brewTimeSec}s` : null) },
      { label: 'Milk Ratio',  value: specs.milkRatio },
    ].filter(item => item.value != null);

    return `<div class="recipe-detail-grid">
      ${items.map(item => `
        <div class="recipe-detail-item">
          <div class="recipe-detail-label">${item.label}</div>
          <div class="recipe-detail-value">${item.value}</div>
        </div>
      `).join('')}
    </div>`;
  }

  // ── Scoring bars ──────────────────────────────────────────────────────
  function renderScoring(scoring) {
    if (!scoring) return '';
    const LABELS = { flavor: 'Flavor', aftertaste: 'Aftertaste', acid: 'Acidity', sweet: 'Sweetness', mouthfeel: 'Mouthfeel' };
    const entries = Object.entries(scoring);
    const total   = entries.reduce((s, [, v]) => s + v, 0);
    const max     = entries.length * 5;
    return `<div class="scoring-grid">
      ${entries.map(([key, val]) => `
        <div class="scoring-row">
          <span class="scoring-label">${LABELS[key] || key}</span>
          <div class="scoring-bar-wrap"><div class="scoring-bar" style="width:${(val / 5 * 100).toFixed(1)}%"></div></div>
          <span class="scoring-value">${val}</span>
        </div>`).join('')}
      <div class="scoring-total">Total <strong>${total.toFixed(2)}</strong> / ${max}</div>
    </div>`;
  }

  // ── Modal content ─────────────────────────────────────────────────────
  function renderModalContent(recipe) {
    const TOOL_LABELS = { MÁY: 'Espresso', PHIN: 'Phin', FILTER: 'Filter', COLDBREW: 'Cold Brew', ESPRESSO: 'Espresso', COLD_BREW: 'Cold Brew' };
    const toolLabel   = TOOL_LABELS[recipe.tool] || recipe.tool;
    const prefSlug    = (recipe.preference || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const prefDisplay = recipe.preference ? recipe.preference.charAt(0) + recipe.preference.slice(1).toLowerCase() : '';

    const RECIPE_ICONS = {
      espresso: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14v9a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/><path d="M19 10h1a3 3 0 010 6h-1"/></svg>`,
      milk_beverage: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2h8l1 4H7L8 2z"/><rect x="6" y="6" width="12" height="14" rx="2"/></svg>`,
      vietnamese_milk_coffee: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="3" width="12" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>`,
    };

    const PROFILE_ICONS = {
      social: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
      staff:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    };

    const originLine = [recipe.coffee.origin, recipe.coffee.region].filter(Boolean).join(' — ');
    const notes      = recipe.coffee.notes || [];

    const header = `
      <p class="modal-origin">📍 ${originLine}</p>
      ${recipe.coffee.varietyProcess ? `<p class="modal-variety">${recipe.coffee.varietyProcess}</p>` : ''}
      <h2 class="modal-coffee-name">${recipe.coffee.name}</h2>
      <div class="modal-chips">
        <span class="chip chip--tool">${toolLabel}</span>
        ${recipe.preference ? `<span class="chip chip--pref-${prefSlug}">${prefDisplay}</span>` : ''}
        ${notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
      </div>
    `;

    const timerWidget = `
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
      ${recipe.disclaimer ? `<p class="modal-disclaimer">${recipe.disclaimer}</p>` : ''}
    `;

    // ── FILTER with profiles (social / staff) ──
    if (recipe.profiles) {
      const profileKeys  = Object.keys(recipe.profiles);
      const firstProfile = recipe.profiles[profileKeys[0]];
      return header + `
        <hr class="modal-divider">
        <div class="modal-section-label">Brewing Profiles</div>
        <div class="recipe-tabs" id="profile-tabs">
          ${profileKeys.map((key, i) => `
            <div class="recipe-tab${i === 0 ? ' active' : ''}" data-profile="${key}" role="button" tabindex="0">
              <div class="recipe-tab-icon">${PROFILE_ICONS[key] || PROFILE_ICONS.social}</div>
              <div class="recipe-tab-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div class="recipe-tab-sub">${recipe.profiles[key].specs?.tools || ''}</div>
            </div>`).join('')}
        </div>
        <hr class="modal-divider">
        <div class="modal-section-label">Recipe Details</div>
        <div id="profile-specs-container">${renderSpecsGrid(firstProfile.specs)}</div>
        <hr class="modal-divider">
        <div class="modal-section-label">Brew Timeline</div>
        <div class="brew-timeline" id="brew-timeline"></div>
        <hr class="modal-divider">
        <div class="modal-section-label">Brew Timer</div>
        ${timerWidget}
        ${recipe.scoring ? `
          <hr class="modal-divider">
          <div class="modal-section-label">Scoring</div>
          ${renderScoring(recipe.scoring)}` : ''}
        ${recipe.comment ? `
          <hr class="modal-divider">
          <div class="modal-section-label">Notes</div>
          <p class="modal-comment">${recipe.comment}</p>` : ''}
        ${recipe.disclaimer ? `<p class="modal-disclaimer">${recipe.disclaimer}</p>` : ''}
      `;
    }

    // ── MÁY: recipe sub-selector ──
    if (recipe.recipes && recipe.recipes.length > 0) {
      const firstRec = recipe.recipes[0];
      return header + `
        <hr class="modal-divider">
        <div class="modal-section-label">Chọn Recipe</div>
        <div class="recipe-tabs" id="recipe-tabs">
          ${recipe.recipes.map((r, i) => `
            <div class="recipe-tab${i === 0 ? ' active' : ''}" data-index="${i}" role="button" tabindex="0">
              <div class="recipe-tab-icon">${RECIPE_ICONS[r.type] || RECIPE_ICONS.espresso}</div>
              <div class="recipe-tab-label">${r.label}</div>
              <div class="recipe-tab-sub">${r.subtitle}</div>
            </div>
          `).join('')}
        </div>
        <hr class="modal-divider">
        <div class="modal-section-label">Recipe Details</div>
        <div id="recipe-specs-container">${renderSpecsGrid(firstRec.specs)}</div>
        <hr class="modal-divider">
        <div class="modal-section-label" id="timer-section-label">Brew Timer — ${firstRec.label}</div>
        ${timerWidget}
      `;
    }

    // ── PHIN / COLDBREW: step-based timeline ──
    if (recipe.brewSteps) {
      return header + `
        <hr class="modal-divider">
        <div class="modal-section-label">Recipe Details</div>
        ${renderSpecsGrid(recipe.brewSpecs)}
        <hr class="modal-divider">
        <div class="modal-section-label">Brew Timeline</div>
        <div class="brew-timeline" id="brew-timeline"></div>
        <hr class="modal-divider">
        <div class="modal-section-label">Brew Timer</div>
        ${timerWidget}
      `;
    }

    // ── FILTER: note only ──
    return header + `
      <hr class="modal-divider">
      <p class="modal-recipe-desc">${recipe.note || ''}</p>
      <hr class="modal-divider">
      <div class="modal-section-label">Brew Timer</div>
      ${timerWidget}
    `;
  }

  return {
    TOOLS, PREFS,
    renderTools, updateToolSelection,
    renderPrefs, updatePrefSelection,
    renderRecipeCards, updateFavButton,
    renderFavoritesList,
    renderModalContent,
    renderSpecsGrid,
    renderScoring,
  };
})();
