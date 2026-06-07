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

    // ── PHIN / FILTER / COLDBREW: step-based timeline ──
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
        ${recipe.disclaimer ? `<p class="modal-disclaimer">${recipe.disclaimer}</p>` : ''}
      `;
    }

    // Fallback
    return header;
  }

  // ── Flavor profile cards ──────────────────────────────────────────────
  function renderFlavorCards(container, selectedId, onSelect) {
    container.innerHTML = '';
    FLAVOR_PROFILES.forEach(f => {
      const card = document.createElement('div');
      card.className = `sel-card${selectedId === f.id ? ' selected' : ''}`;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', selectedId === f.id);
      card.setAttribute('tabindex', '0');
      card.dataset.staggerItem = '';
      card.innerHTML = `
        <span class="sel-card-icon" aria-hidden="true">${f.icon}</span>
        <div class="sel-card-title">${f.label}</div>
        <div class="sel-card-desc">${f.description}<br><span class="sel-card-keywords">${f.keywords.join(' · ')}</span></div>
        <div class="sel-card-check">✓</div>
      `;
      card.addEventListener('click', () => onSelect(f.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); }
      });
      container.appendChild(card);
    });
    Anim.staggerIn(container.querySelectorAll('.sel-card'));
  }

  function updateFlavorSelection(container, selectedId) {
    container.querySelectorAll('.sel-card').forEach(card => {
      const match = FLAVOR_PROFILES.find(f => card.querySelector('.sel-card-title')?.textContent === f.label);
      if (!match) return;
      const isSelected = match.id === selectedId;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-checked', isSelected);
    });
  }

  // ── Coffee catalog cards ──────────────────────────────────────────────
  const TOOL_EMOJIS = { 'MÁY': '⚡', PHIN: '🫖', FILTER: '☕', COLDBREW: '🧊', ESPRESSO: '⚡', COLD_BREW: '🧊' };

  function renderCoffeeCards(container, coffees, onOpen, onCompare) {
    container.innerHTML = '';
    if (!coffees.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:var(--space-8);grid-column:1/-1">No coffees found.</p>';
      return;
    }
    coffees.forEach(c => {
      const comparing = State.isComparing(c.id);
      const card = document.createElement('div');
      card.className = 'coffee-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.dataset.id = c.id;
      card.dataset.staggerItem = '';
      card.innerHTML = `
        <div class="coffee-card-header">
          <div>
            <div class="coffee-card-name">${c.name}</div>
            <div class="coffee-card-origin">${c.origin}</div>
          </div>
        </div>
        <div class="coffee-card-meta">
          <span class="coffee-card-roast">${c.roastLevel}</span>
          <span class="coffee-card-process">${c.processingMethod}</span>
        </div>
        <div class="coffee-card-notes">
          ${c.flavorNotes.map(n => `<span class="note-tag">${n}</span>`).join('')}
        </div>
        <div class="coffee-card-footer">
          ${onCompare ? `<button class="btn-compare${comparing ? ' active' : ''}" data-compare-id="${c.id}" aria-label="${comparing ? 'Remove from' : 'Add to'} comparison" aria-pressed="${comparing}">${comparing ? '✓ Comparing' : 'Compare'}</button>` : ''}
          <span class="recipe-card-cta">View Details →</span>
        </div>
      `;
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-compare')) return;
        onOpen(c.id);
      });
      card.addEventListener('keydown', e => {
        if (e.target.closest('.btn-compare')) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c.id); }
      });
      if (onCompare) {
        card.querySelector('.btn-compare')?.addEventListener('click', e => {
          e.stopPropagation();
          onCompare(c.id);
        });
      }
      container.appendChild(card);
    });
    Anim.staggerIn(container.querySelectorAll('.coffee-card'), { stagger: 0.07 });
  }

  function updateCompareCardState(container, compareSelection) {
    container.querySelectorAll('.coffee-card').forEach(card => {
      const id = card.dataset.id;
      const btn = card.querySelector('.btn-compare');
      if (!btn) return;
      const active = compareSelection.includes(id);
      btn.classList.toggle('active', active);
      btn.textContent = active ? '✓ Comparing' : 'Compare';
      btn.setAttribute('aria-pressed', active);
    });
  }

  // ── Coffee detail modal content ───────────────────────────────────────
  function renderCoffeeModalContent(coffee, recipes) {
    const fmt = p => p.toLocaleString('vi-VN') + ' ₫';
    const TOOL_LABELS = { 'MÁY': 'Espresso', PHIN: 'Phin', FILTER: 'Filter', COLDBREW: 'Cold Brew', ESPRESSO: 'Espresso', COLD_BREW: 'Cold Brew' };

    const usageChips = coffee.recommendedUsage
      .map(u => `<span class="usage-chip">${u}</span>`).join('');

    const recipeListHTML = recipes.length > 0
      ? recipes.map(r => {
          const toolLabel = TOOL_LABELS[r.tool] || r.tool;
          const toolEmoji = TOOL_EMOJIS[r.tool] || '☕';
          const prefDisplay = r.preference ? r.preference.charAt(0) + r.preference.slice(1).toLowerCase() : '';
          const isFav = State.isFavorite(r.id);
          return `
            <div class="modal-recipe-item" data-id="${r.id}" role="button" tabindex="0" aria-label="View ${toolLabel} recipe">
              <div class="modal-recipe-item-left">
                <span class="modal-recipe-item-emoji" aria-hidden="true">${toolEmoji}</span>
                <div class="modal-recipe-item-info">
                  <div class="modal-recipe-item-name">${toolLabel}</div>
                  ${prefDisplay ? `<div class="modal-recipe-item-pref">${prefDisplay}</div>` : ''}
                </div>
              </div>
              <div class="modal-recipe-item-right">
                <button class="recipe-card-fav${isFav ? ' active' : ''}" data-fav-id="${r.id}" aria-label="${isFav ? 'Remove from' : 'Add to'} favorites">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          `;
        }).join('')
      : '<p class="modal-recipe-empty">No recipes available for this coffee yet.</p>';

    return `
      <p class="modal-origin">📍 ${coffee.origin}</p>
      <h2 class="modal-coffee-name">${coffee.name}</h2>
      <div class="modal-chips">
        <span class="chip chip--tool">${coffee.roastLevel}</span>
        <span class="chip chip--tool">${coffee.processingMethod}</span>
        ${coffee.flavorNotes.map(n => `<span class="note-tag">${n}</span>`).join('')}
      </div>

      <hr class="modal-divider">
      <div class="modal-section-label">Recommended Usage</div>
      <div class="usage-chips">${usageChips}</div>

      <hr class="modal-divider">
      <div class="modal-section-label">Pricing</div>
      <div class="pricing-section">
        <div class="pricing-btns" id="pricing-btns" role="group" aria-label="Select weight">
          <button class="pricing-btn active" data-price="${coffee.pricing.g250}" data-grams="250">250g</button>
          <button class="pricing-btn" data-price="${coffee.pricing.g500}" data-grams="500">500g</button>
          <button class="pricing-btn" data-price="${coffee.pricing.g1kg}" data-grams="1000">1kg</button>
        </div>
        <div class="pricing-display" id="pricing-display">${fmt(coffee.pricing.g250)}</div>
      </div>

      <hr class="modal-divider">
      <div class="modal-section-label">Brew Cost Calculator</div>
      <div class="brew-calc" id="brew-calc">
        <div class="brew-calc-inputs">
          <div class="brew-calc-field">
            <label class="brew-calc-label" for="calc-dose">Coffee Dose</label>
            <div class="brew-calc-input-wrap">
              <input type="number" id="calc-dose" class="brew-calc-input" value="18" min="1" max="100" aria-label="Coffee dose in grams">
              <span class="brew-calc-unit">g</span>
            </div>
          </div>
          <div class="brew-calc-field">
            <label class="brew-calc-label" for="calc-ratio">Water Ratio</label>
            <div class="brew-calc-input-wrap">
              <span class="brew-calc-prefix">1 :</span>
              <input type="number" id="calc-ratio" class="brew-calc-input brew-calc-input--ratio" value="16" min="1" max="30" aria-label="Water ratio">
            </div>
          </div>
        </div>
        <div class="brew-calc-outputs">
          <div class="brew-calc-result">
            <div class="brew-calc-result-label">Cost per brew</div>
            <div class="brew-calc-result-value" id="calc-cost-brew">—</div>
          </div>
          <div class="brew-calc-result">
            <div class="brew-calc-result-label">Cups per bag</div>
            <div class="brew-calc-result-value" id="calc-cups">—</div>
          </div>
        </div>
      </div>

      <hr class="modal-divider">
      <div class="modal-section-label">Wholesale</div>
      <div class="wholesale-section">
        <p class="wholesale-text">Need wholesale pricing?<br>Available for cafés and businesses.</p>
        <div class="wholesale-btns">
          <a href="https://m.me/" class="btn-contact btn-contact--messenger" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.408 5.503 3.611 7.22V22l3.274-1.81c.874.243 1.799.373 2.761.373 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm1.053 12.45l-2.543-2.717-4.97 2.717 5.465-5.805 2.605 2.717 4.908-2.717-5.465 5.805z"/>
            </svg>
            Contact via Messenger
          </a>
          <a href="https://zalo.me/" class="btn-contact btn-contact--zalo" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#0068FF"/>
              <text x="16" y="22" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="13" fill="white">Zalo</text>
            </svg>
            Contact via Zalo
          </a>
        </div>
      </div>

      <hr class="modal-divider">
      <div class="modal-section-label">Brewing Recipes</div>
      <div class="modal-recipe-list" id="modal-recipe-list">
        ${recipeListHTML}
      </div>
    `;
  }

  // ── Weather recommendation card ───────────────────────────────────────
  function renderWeatherCard(container, weather, rec, onExplore, onManualSelect) {
    if (!container) return;

    const weatherRec = rec.weatherRec;
    const timeRec    = rec.timeRec;

    const primaryRec  = weatherRec || timeRec;
    if (!primaryRec) { container.classList.add('hidden'); return; }

    const coffeesText = primaryRec.coffeeIds
      .map(id => { const c = COFFEES.find(x => x.id === id); return c ? c.name : ''; })
      .filter(Boolean)
      .map(n => `<span class="weather-coffee-chip">${n}</span>`)
      .join('');

    const manualBtns = !weather.locationGranted
      ? `<div class="weather-manual-row">
          ${RecommendationEngine.MANUAL_OPTIONS.map(o =>
            `<button class="weather-manual-btn${rec.condition === RecommendationEngine.manualCondition(o.key) ? ' active' : ''}" data-weather="${o.key}" aria-label="${o.label}">
              <span aria-hidden="true">${o.emoji}</span> ${o.label}
            </button>`
          ).join('')}
        </div>`
      : '';

    const tempText = weather.locationGranted && weather.temp != null
      ? `<span class="weather-temp">${weather.temp}°C</span>`
      : '';

    container.innerHTML = `
      <div class="weather-card-inner">
        <div class="weather-card-header">
          <span class="weather-card-emoji" aria-hidden="true">${primaryRec.emoji}</span>
          <div class="weather-card-title-block">
            <div class="weather-card-label">${primaryRec.label} ${tempText}</div>
            <div class="weather-card-msg">${primaryRec.message}</div>
          </div>
        </div>
        ${manualBtns}
        <div class="weather-card-body">
          <div class="weather-coffees">${coffeesText}</div>
          <button class="weather-explore-btn btn-primary" id="btn-weather-explore">
            Explore
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `;
    container.classList.remove('hidden');

    container.querySelector('#btn-weather-explore')?.addEventListener('click', () => {
      onExplore(primaryRec.coffeeIds);
    });

    container.querySelectorAll('.weather-manual-btn').forEach(btn => {
      btn.addEventListener('click', () => onManualSelect(btn.dataset.weather));
    });
  }

  // ── Comparison content ────────────────────────────────────────────────
  function _scale(val, max = 5) {
    const filled = Math.round(val);
    const empty  = max - filled;
    return `<span class="rating-dots" aria-label="${val} of ${max}">${'●'.repeat(filled)}${'○'.repeat(empty)}</span>`;
  }

  function renderComparison(container, coffeeA, coffeeB, onView) {
    if (!container || !coffeeA || !coffeeB) return;

    const rows = [
      { label: 'Origin',            a: coffeeA.origin,                        b: coffeeB.origin },
      { label: 'Roast Level',       a: coffeeA.roastLevel,                    b: coffeeB.roastLevel },
      { label: 'Processing',        a: coffeeA.processingMethod,               b: coffeeB.processingMethod },
      { label: 'Flavor Notes',      a: coffeeA.flavorNotes.join(', '),         b: coffeeB.flavorNotes.join(', ') },
      { label: 'Best For',          a: coffeeA.recommendedUsage.join(', '),    b: coffeeB.recommendedUsage.join(', ') },
    ];

    const profileRows = (coffeeA.profile && coffeeB.profile)
      ? [
          { label: 'Acidity',   a: _scale(coffeeA.profile.acidity),   b: _scale(coffeeB.profile.acidity) },
          { label: 'Body',      a: _scale(coffeeA.profile.body),       b: _scale(coffeeB.profile.body) },
          { label: 'Sweetness', a: _scale(coffeeA.profile.sweetness),  b: _scale(coffeeB.profile.sweetness) },
        ]
      : [];

    const allRows = [...rows, ...profileRows];

    container.innerHTML = `
      <div class="compare-names">
        <div class="compare-name">${coffeeA.name}</div>
        <div class="compare-vs">vs</div>
        <div class="compare-name">${coffeeB.name}</div>
      </div>
      <div class="compare-rows">
        ${allRows.map(row => `
          <div class="compare-row">
            <div class="compare-cell">${row.a}</div>
            <div class="compare-row-label">${row.label}</div>
            <div class="compare-cell">${row.b}</div>
          </div>
        `).join('')}
      </div>
      <div class="compare-actions">
        <button class="compare-view-btn btn-primary" data-id="${coffeeA.id}">View ${coffeeA.name}</button>
        <button class="compare-view-btn btn-primary" data-id="${coffeeB.id}">View ${coffeeB.name}</button>
      </div>
    `;

    container.querySelectorAll('.compare-view-btn').forEach(btn => {
      btn.addEventListener('click', () => onView(btn.dataset.id));
    });
  }

  return {
    TOOLS, PREFS,
    renderTools, updateToolSelection,
    renderPrefs, updatePrefSelection,
    renderFlavorCards, updateFlavorSelection,
    renderCoffeeCards, updateCompareCardState,
    renderCoffeeModalContent,
    renderWeatherCard,
    renderComparison,
    renderRecipeCards, updateFavButton,
    renderFavoritesList,
    renderModalContent,
    renderSpecsGrid,
    renderScoring,
  };
})();
