const Admin = (() => {
  let recipes  = [];
  let editingId = null;

  const $ = id => document.getElementById(id);

  // ── Tool config ───────────────────────────────────────────
  // Defines which form sections are visible per tool
  const TOOL_SECTIONS = {
    'MÁY':     { baseSpecs: true,  brewSpecs: false, subRecipes: true,  steps: false },
    'PHIN':    { baseSpecs: false, brewSpecs: true,  subRecipes: false, steps: true  },
    'FILTER':  { baseSpecs: false, brewSpecs: true,  subRecipes: false, steps: true  },
    'COLDBREW':{ baseSpecs: false, brewSpecs: true,  subRecipes: false, steps: true  },
  };

  const VALID_TOOLS = ['MÁY', 'PHIN', 'FILTER', 'COLDBREW'];
  const VALID_PREFS = ['LIGHT / FRUITY', 'BALANCE', 'STRONG'];
  const SUB_TYPES   = ['espresso', 'milk_beverage', 'vietnamese_milk_coffee'];
  const SUB_TYPE_LABELS = {
    espresso:                'Espresso',
    milk_beverage:           'Milk Beverage',
    vietnamese_milk_coffee:  'Vietnamese Milk Coffee',
  };

  // ── Pref → CSS slug ──────────────────────────────────────
  function prefSlug(pref) {
    const map = { 'LIGHT / FRUITY': 'LIGHT_FRUITY', 'BALANCE': 'BALANCE', 'STRONG': 'STRONG' };
    return map[pref] || pref.replace(/[^A-Z0-9]/g, '_');
  }

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    await loadRecipes();
    setupEvents();
  }

  async function loadRecipes() {
    try {
      const res = await fetch('data/recipes.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      recipes = await res.json();
    } catch {
      showToast('Cannot load recipes.json — open via a local server (e.g. npx serve .)', 'error');
      recipes = [];
    }
    renderList();
  }

  // ── Events ───────────────────────────────────────────────
  function setupEvents() {
    $('btn-new').addEventListener('click', openNewForm);
    $('btn-export').addEventListener('click', exportJSON);
    $('btn-delete').addEventListener('click', deleteRecipe);
    $('btn-cancel').addEventListener('click', closeForm);
    $('btn-add-step').addEventListener('click', () => { addStepRow(); syncStepsUI(); });
    $('btn-add-sub').addEventListener('click', () => { addSubRecipeCard(); syncSubUI(); });
    $('recipe-form').addEventListener('submit', saveRecipe);
    $('f-tool').addEventListener('change', () => applyToolSections($('f-tool').value));
    $('import-input').addEventListener('change', e => {
      if (e.target.files[0]) importJSON(e.target.files[0]);
      e.target.value = '';
    });
    $('filter-tool').addEventListener('change', renderList);
    $('filter-pref').addEventListener('change', renderList);
  }

  // ── Sidebar list ──────────────────────────────────────────
  function renderList() {
    const tool = $('filter-tool').value;
    const pref = $('filter-pref').value;
    const filtered = recipes.filter(r =>
      (!tool || r.tool === tool) && (!pref || r.preference === pref)
    );

    const list = $('recipe-list');
    list.innerHTML = '';

    if (!filtered.length) {
      list.innerHTML = '<div class="list-empty">No recipes found.</div>';
    } else {
      filtered.forEach(r => {
        const item = document.createElement('div');
        item.className = 'recipe-list-item' + (r.id === editingId ? ' active' : '');
        item.dataset.id = r.id;
        item.innerHTML = `
          <div class="recipe-list-item-name">${esc(r.coffee?.name || 'Untitled')}</div>
          <div class="recipe-list-item-meta">
            <span class="list-chip list-chip--tool">${esc(r.tool || '')}</span>
            <span class="list-chip list-chip--pref-${prefSlug(r.preference || '')}">${esc(r.preference || '')}</span>
            ${r.score != null ? `<span class="list-score">★ ${r.score}</span>` : ''}
          </div>`;
        item.addEventListener('click', () => openEditForm(r.id));
        list.appendChild(item);
      });
    }

    const total = recipes.length;
    const shown = filtered.length;
    $('sidebar-footer').textContent = total === shown
      ? `${total} recipe${total !== 1 ? 's' : ''}`
      : `${shown} of ${total} recipes`;
  }

  // ── Open / close ─────────────────────────────────────────
  function openNewForm() {
    editingId = null;
    const nextId = recipes.length ? Math.max(...recipes.map(r => r.id)) + 1 : 1;
    const blank = {
      id: nextId, tool: 'MÁY', preference: 'LIGHT / FRUITY',
      coffee: { name: '', origin: '', notes: [] },
      disclaimer: '',
    };
    populateForm(blank);
    $('btn-delete').classList.add('hidden');
    showForm();
    renderList();
    $('f-coffee-name').focus();
  }

  function openEditForm(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    editingId = id;
    populateForm(recipe);
    $('btn-delete').classList.remove('hidden');
    showForm();
    renderList();
  }

  function showForm() {
    $('form-empty').classList.add('hidden');
    $('recipe-form').classList.remove('hidden');
    clearErrors();
  }

  function closeForm() {
    editingId = null;
    $('recipe-form').classList.add('hidden');
    $('form-empty').classList.remove('hidden');
    renderList();
  }

  // ── Tool sections ─────────────────────────────────────────
  function applyToolSections(tool) {
    const cfg = TOOL_SECTIONS[tool] || {};
    $('section-base-specs').classList.toggle('hidden', !cfg.baseSpecs);
    $('section-brew-specs').classList.toggle('hidden', !cfg.brewSpecs);
    $('section-sub-recipes').classList.toggle('hidden', !cfg.subRecipes);
    $('section-brew-steps').classList.toggle('hidden', !cfg.steps);

    if (cfg.brewSpecs) {
      const isColdbrew = tool === 'COLDBREW';
      const isFilter   = tool === 'FILTER';
      // PHIN + FILTER fields
      $('bs-field-dose').classList.toggle('hidden', isColdbrew);
      $('bs-field-water').classList.toggle('hidden', isColdbrew);
      $('bs-field-temperature').classList.toggle('hidden', isColdbrew);
      // COLDBREW-only fields
      $('bs-field-bloomTemp').classList.toggle('hidden', !isColdbrew);
      $('bs-field-coldWaterTemp').classList.toggle('hidden', !isColdbrew);
      // FILTER-only field
      $('bs-field-tools').classList.toggle('hidden', !isFilter);
    }
  }

  // ── Populate form ─────────────────────────────────────────
  function populateForm(r) {
    $('f-id').value         = r.id;
    $('f-tool').value       = r.tool        || 'MÁY';
    $('f-preference').value = r.preference  || 'LIGHT / FRUITY';
    $('f-score').value      = r.score       ?? '';
    $('f-disclaimer').value = r.disclaimer  || '';

    $('f-coffee-name').value   = r.coffee?.name   || '';
    $('f-coffee-origin').value = r.coffee?.origin || '';
    $('f-coffee-notes').value  = (r.coffee?.notes || []).join(', ');

    const tool = r.tool || 'MÁY';
    applyToolSections(tool);

    if (tool === 'MÁY') {
      $('f-base-temperature').value = r.baseSpecs?.temperature ?? '';
      $('f-base-grind').value       = r.baseSpecs?.grind       || '';
      $('f-base-waterPPM').value    = r.baseSpecs?.waterPPM    || '';
      // Sub-recipes
      $('sub-recipe-list').innerHTML = '';
      const srEmpty = document.createElement('div');
      srEmpty.className = 'sub-recipe-empty'; srEmpty.id = 'sub-recipe-empty';
      srEmpty.textContent = 'No sub-recipes yet. Click "Add Sub-Recipe" to begin.';
      $('sub-recipe-list').appendChild(srEmpty);
      (r.recipes || []).forEach(sr => addSubRecipeCard(sr));
      syncSubUI();
    }

    if (tool === 'PHIN' || tool === 'FILTER') {
      const bs = r.brewSpecs || {};
      $('f-bs-ratio').value       = bs.ratio       || '';
      $('f-bs-grind').value       = bs.grind       || '';
      $('f-bs-waterPPM').value    = bs.waterPPM    || '';
      $('f-bs-brewTime').value    = bs.brewTime    || '';
      $('f-bs-dose').value        = bs.dose        || '';
      $('f-bs-water').value       = bs.water       || '';
      $('f-bs-temperature').value = bs.temperature ?? '';
      if (tool === 'FILTER') {
        $('f-bs-tools').value = bs.tools || '';
      }
      $('steps-tbody').innerHTML = '';
      (r.brewSteps || []).forEach(s => addStepRow(s));
      syncStepsUI();
    }

    if (tool === 'COLDBREW') {
      const bs = r.brewSpecs || {};
      $('f-bs-ratio').value          = bs.ratio         || '';
      $('f-bs-grind').value          = bs.grind         || '';
      $('f-bs-waterPPM').value       = bs.waterPPM      || '';
      $('f-bs-brewTime').value       = bs.brewTime      || '';
      $('f-bs-bloomTemp').value      = bs.bloomTemp     ?? '';
      $('f-bs-coldWaterTemp').value  = bs.coldWaterTemp ?? '';
      $('steps-tbody').innerHTML = '';
      (r.brewSteps || []).forEach(s => addStepRow(s));
      syncStepsUI();
    }
  }

  // ── Sub-recipes (MÁY) ────────────────────────────────────
  function addSubRecipeCard(sr = {}) {
    const list  = $('sub-recipe-list');
    const index = list.querySelectorAll('.sub-recipe-card').length + 1;
    const card  = document.createElement('div');
    card.className = 'sub-recipe-card';

    const typeOptions = SUB_TYPES.map(t =>
      `<option value="${t}" ${sr.type === t ? 'selected' : ''}>${SUB_TYPE_LABELS[t]}</option>`
    ).join('');

    card.innerHTML = `
      <div class="sub-recipe-card-header">
        <span class="sub-recipe-num">${index}</span>
        <button type="button" class="btn btn-danger btn-del-sr" style="padding:4px 10px;font-size:11px;">Remove</button>
      </div>
      <div class="form-grid form-grid--3" style="margin-bottom:var(--space-3);">
        <div class="form-field">
          <label>Type</label>
          <select class="sr-type">${typeOptions}</select>
        </div>
        <div class="form-field">
          <label>Label</label>
          <input type="text" class="sr-label" value="${esc(sr.label || '')}" placeholder="Espresso">
        </div>
        <div class="form-field">
          <label>Subtitle</label>
          <input type="text" class="sr-subtitle" value="${esc(sr.subtitle || '')}" placeholder="Uống thẳng">
        </div>
      </div>
      <div class="form-grid form-grid--3">
        <div class="form-field">
          <label>Ratio</label>
          <input type="text" class="sr-ratio" value="${esc(sr.specs?.ratio || '')}" placeholder="1:2">
        </div>
        <div class="form-field">
          <label>Temperature (°C)</label>
          <input type="number" class="sr-temperature" value="${sr.specs?.temperature ?? ''}" placeholder="94">
        </div>
        <div class="form-field">
          <label>Brew Time (sec)</label>
          <input type="number" class="sr-brewTimeSec" value="${sr.specs?.brewTimeSec ?? ''}" placeholder="30">
        </div>
        <div class="form-field">
          <label>Grind</label>
          <input type="text" class="sr-grind" value="${esc(sr.specs?.grind || '')}" placeholder="Fine">
        </div>
        <div class="form-field">
          <label>Water PPM</label>
          <input type="text" class="sr-waterPPM" value="${esc(sr.specs?.waterPPM || '')}" placeholder="55-60">
        </div>
        <div class="form-field">
          <label>Milk Ratio (optional)</label>
          <input type="text" class="sr-milkRatio" value="${esc(sr.specs?.milkRatio || '')}" placeholder="1 Coffee : 4-5 Milk">
        </div>
      </div>`;

    card.querySelector('.btn-del-sr').addEventListener('click', () => {
      card.remove();
      renumberSubRecipes();
      syncSubUI();
    });

    list.appendChild(card);
  }

  function renumberSubRecipes() {
    $('sub-recipe-list').querySelectorAll('.sub-recipe-card').forEach((card, i) => {
      const num = card.querySelector('.sub-recipe-num');
      if (num) num.textContent = i + 1;
    });
  }

  function syncSubUI() {
    const cards  = $('sub-recipe-list').querySelectorAll('.sub-recipe-card').length;
    const empty  = $('sub-recipe-empty');
    if (empty) empty.classList.toggle('hidden', cards > 0);
  }

  function collectSubRecipes() {
    return Array.from($('sub-recipe-list').querySelectorAll('.sub-recipe-card')).map(card => {
      const sr = {
        type:     card.querySelector('.sr-type').value,
        label:    card.querySelector('.sr-label').value.trim(),
        subtitle: card.querySelector('.sr-subtitle').value.trim(),
        specs: {
          ratio:        card.querySelector('.sr-ratio').value.trim(),
          temperature:  Number(card.querySelector('.sr-temperature').value) || undefined,
          grind:        card.querySelector('.sr-grind').value.trim(),
          waterPPM:     card.querySelector('.sr-waterPPM').value.trim(),
          brewTimeSec:  Number(card.querySelector('.sr-brewTimeSec').value) || undefined,
        },
      };
      const milk = card.querySelector('.sr-milkRatio').value.trim();
      if (milk) sr.specs.milkRatio = milk;
      // Remove undefined spec fields
      Object.keys(sr.specs).forEach(k => sr.specs[k] === undefined && delete sr.specs[k]);
      return sr;
    });
  }

  // ── Brew steps (PHIN + COLDBREW) ─────────────────────────
  function addStepRow(step = {}) {
    const tbody = $('steps-tbody');
    const num   = tbody.rows.length + 1;
    const tr    = document.createElement('tr');
    // ratio is used by COLDBREW step 0, parts by step 1
    const ratioVal = step.ratio || step.parts || '';
    tr.innerHTML = `
      <td class="col-num" style="color:var(--text-dim);font-size:var(--text-xs);text-align:center;">${num}</td>
      <td class="col-name"><input type="text"   class="s-name"  value="${esc(step.name  || '')}" placeholder="Bloom"></td>
      <td class="col-water"><input type="text"  class="s-water" value="${esc(step.water || '')}" placeholder="50g"></td>
      <td class="col-ratio"><input type="text"  class="s-ratio" value="${esc(ratioVal)}"          placeholder="1:2"></td>
      <td class="col-temp"><input type="text"   class="s-temp"  value="${esc(step.temp  || '')}"  placeholder="90°C"></td>
      <td class="col-start"><input type="number" class="s-start" value="${step.start ?? ''}" placeholder="0" min="0"></td>
      <td class="col-end"><input type="number"   class="s-end"   value="${step.end   ?? ''}" placeholder="60" min="0"></td>
      <td class="col-passive" style="text-align:center;">
        <input type="checkbox" class="s-passive" ${step.passive ? 'checked' : ''}>
      </td>
      <td class="col-passive-label">
        <input type="text" class="s-passive-label"
          value="${esc(step.passiveLabel || '')}" placeholder="Steep 24 hours"
          ${!step.passive ? 'disabled' : ''}>
      </td>
      <td class="col-del">
        <button type="button" class="btn-icon btn-del-step" title="Remove">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>`;

    tr.querySelector('.s-passive').addEventListener('change', function () {
      const lbl = tr.querySelector('.s-passive-label');
      lbl.disabled = !this.checked;
      if (!this.checked) lbl.value = '';
    });
    tr.querySelector('.btn-del-step').addEventListener('click', () => {
      tr.remove(); renumberSteps(); syncStepsUI();
    });
    tbody.appendChild(tr);
  }

  function renumberSteps() {
    Array.from($('steps-tbody').rows).forEach((tr, i) => {
      const c = tr.querySelector('.col-num');
      if (c) c.textContent = i + 1;
    });
  }

  function syncStepsUI() {
    const has = $('steps-tbody').rows.length > 0;
    $('steps-empty').classList.toggle('hidden', has);
    $('steps-table').classList.toggle('hidden', !has);
  }

  function collectSteps() {
    return Array.from($('steps-tbody').rows).map(tr => {
      const step = {
        name:  tr.querySelector('.s-name').value.trim(),
        start: Number(tr.querySelector('.s-start').value),
        end:   Number(tr.querySelector('.s-end').value),
      };
      const water = tr.querySelector('.s-water').value.trim();
      const ratio = tr.querySelector('.s-ratio').value.trim();
      const temp  = tr.querySelector('.s-temp').value.trim();
      if (water) step.water = water;
      if (ratio) step.ratio = ratio;
      if (temp)  step.temp  = temp;
      if (tr.querySelector('.s-passive').checked) {
        step.passive      = true;
        step.passiveLabel = tr.querySelector('.s-passive-label').value.trim();
      }
      return step;
    });
  }

  // ── Save ─────────────────────────────────────────────────
  function saveRecipe(e) {
    e.preventDefault();
    clearErrors();

    const tool  = $('f-tool').value;
    const notes = $('f-coffee-notes').value.split(',').map(s => s.trim()).filter(Boolean);
    const score = $('f-score').value !== '' ? parseFloat($('f-score').value) : undefined;

    const data = {
      id:         Number($('f-id').value),
      tool,
      preference: $('f-preference').value,
      coffee: {
        name:   $('f-coffee-name').value.trim(),
        origin: $('f-coffee-origin').value.trim(),
        notes,
      },
      disclaimer: $('f-disclaimer').value.trim() || undefined,
    };

    if (score !== undefined) data.score = score;

    if (tool === 'MÁY') {
      data.baseSpecs = {
        temperature: Number($('f-base-temperature').value) || undefined,
        grind:       $('f-base-grind').value.trim()   || undefined,
        waterPPM:    $('f-base-waterPPM').value.trim() || undefined,
      };
      Object.keys(data.baseSpecs).forEach(k => data.baseSpecs[k] === undefined && delete data.baseSpecs[k]);
      data.recipes = collectSubRecipes();
    }

    if (tool === 'PHIN' || tool === 'FILTER') {
      const bs = {
        ratio:       $('f-bs-ratio').value.trim()        || undefined,
        dose:        $('f-bs-dose').value.trim()         || undefined,
        water:       $('f-bs-water').value.trim()        || undefined,
        temperature: Number($('f-bs-temperature').value) || undefined,
        grind:       $('f-bs-grind').value.trim()        || undefined,
        waterPPM:    $('f-bs-waterPPM').value.trim()     || undefined,
        brewTime:    $('f-bs-brewTime').value.trim()     || undefined,
      };
      if (tool === 'FILTER') {
        bs.tools = $('f-bs-tools').value.trim() || undefined;
      }
      Object.keys(bs).forEach(k => bs[k] === undefined && delete bs[k]);
      data.brewSpecs = Object.keys(bs).length ? bs : null;
      data.brewSteps = collectSteps();
    }

    if (tool === 'COLDBREW') {
      data.brewSpecs = {
        ratio:         $('f-bs-ratio').value.trim()         || undefined,
        bloomTemp:     Number($('f-bs-bloomTemp').value)     || undefined,
        coldWaterTemp: Number($('f-bs-coldWaterTemp').value) || undefined,
        grind:         $('f-bs-grind').value.trim()         || undefined,
        waterPPM:      $('f-bs-waterPPM').value.trim()      || undefined,
        brewTime:      $('f-bs-brewTime').value.trim()      || undefined,
      };
      Object.keys(data.brewSpecs).forEach(k => data.brewSpecs[k] === undefined && delete data.brewSpecs[k]);
      data.brewSteps = collectSteps();
    }


    const errors = validate(data);
    if (errors.length) {
      errors.forEach(([fieldId, msg]) => markError(fieldId, msg));
      showToast('Please fix the errors before saving.', 'error');
      return;
    }

    if (editingId === null) {
      recipes.push(data);
    } else {
      const idx = recipes.findIndex(r => r.id === editingId);
      if (idx !== -1) recipes[idx] = data;
    }

    editingId = data.id;
    $('btn-delete').classList.remove('hidden');
    renderList();
    showToast('Recipe saved.', 'success');
  }

  // ── Validate ─────────────────────────────────────────────
  function validate(data) {
    const errors = [];
    if (!VALID_TOOLS.includes(data.tool))
      errors.push(['field-tool',         'Invalid tool']);
    if (!VALID_PREFS.includes(data.preference))
      errors.push(['field-preference',   'Invalid preference']);
    if (!data.coffee.name)
      errors.push(['field-coffee-name',  'Required']);
    if (!data.coffee.origin)
      errors.push(['field-coffee-origin','Required']);
    if (!data.coffee.notes.length)
      errors.push(['field-coffee-notes', 'At least one note required']);
    return errors;
  }

  function markError(fieldId, msg) {
    const f = $(fieldId);
    if (!f) return;
    f.classList.add('has-error');
    const e = f.querySelector('.error-msg');
    if (e) e.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.form-field.has-error').forEach(el => el.classList.remove('has-error'));
  }

  // ── Delete ───────────────────────────────────────────────
  function deleteRecipe() {
    if (editingId === null) return;
    const r = recipes.find(r => r.id === editingId);
    if (!r) return;
    if (!confirm(`Delete "${r.coffee.name}"?\nThis cannot be undone.`)) return;
    recipes = recipes.filter(r => r.id !== editingId);
    closeForm();
    showToast('Recipe deleted.', 'info');
  }

  // ── Export ───────────────────────────────────────────────
  function exportJSON() {
    if (!recipes.length) { showToast('No recipes to export.', 'error'); return; }
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'recipes.json' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${recipes.length} recipes.`, 'success');
  }

  // ── Import ───────────────────────────────────────────────
  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error('Root must be an array');
        recipes = parsed;
        closeForm();
        renderList();
        showToast(`Imported ${recipes.length} recipes.`, 'success');
      } catch { showToast('Invalid JSON file.', 'error'); }
    };
    reader.readAsText(file);
  }

  // ── Toast ────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg, type = 'success') {
    const el = $('toast');
    el.textContent = msg;
    el.className   = `toast toast--${type} visible`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
  }

  // ── Utils ────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Admin.init);
