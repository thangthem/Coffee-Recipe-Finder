/* ── Toast ──────────────────────────────────────────────── */
const Toast = (() => {
  let _timer = null;
  function show(msg, duration = 2800) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(_timer);
    _timer = setTimeout(() => el.classList.remove('visible'), duration);
  }
  return { show };
})();

/* ── App ────────────────────────────────────────────────── */
const App = (() => {
  let _currentResults = [];

  /* ── DOM refs ── */
  const $ = id => document.getElementById(id);

  const sections = {
    landing:    $('section-landing'),
    tool:       $('section-tool'),
    preference: $('section-preference'),
    results:    $('section-results'),
  };

  function _showSection(name) {
    Object.entries(sections).forEach(([key, el]) => {
      const isTarget = key === name;
      el.classList.toggle('hidden', !isTarget);
      el.classList.toggle('active', isTarget);
    });

    const isLanding = name === 'landing';
    const header = document.getElementById('app-header');
    const stepInd = document.getElementById('step-indicator');

    header.classList.toggle('visible', !isLanding);
    stepInd.classList.toggle('hidden', isLanding);

    if (!isLanding) {
      const stepNum = { tool: 1, preference: 2, results: 3 }[name] || 1;
      _updateStepIndicator(stepNum);
      Anim.sectionEnter(sections[name]);
    }
  }

  function _updateStepIndicator(step) {
    document.querySelectorAll('.step-dot').forEach(dot => {
      const n = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('active',    n === step);
      dot.classList.toggle('completed', n < step);
    });
    document.querySelectorAll('.step-line').forEach((line, i) => {
      line.classList.toggle('active', i + 1 < step);
    });
  }

  function _updateFavCount() {
    const count = State.get().favorites.length;
    const badge = document.getElementById('fav-count');
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /* ── Landing ── */
  function _initLanding() {
    Anim.landingEntrance();

    const btnStart = $('btn-start');
    btnStart.addEventListener('click', e => {
      Anim.ripple(btnStart, e);
      _goToTool();
    });
  }

  /* ── Tool selector ── */
  function _goToTool() {
    _showSection('tool');
    UIRenderer.renderTools(
      $('tool-cards'),
      State.get().selectedTool,
      _onToolSelect
    );
    _syncToolNext();
  }

  function _onToolSelect(toolId) {
    State.set('selectedTool', toolId);
    UIRenderer.updateToolSelection($('tool-cards'), toolId);
    _syncToolNext();
  }

  function _syncToolNext() {
    $('btn-tool-next').disabled = !State.get().selectedTool;
  }

  /* ── Preference selector ── */
  function _goToPref() {
    _showSection('preference');
    UIRenderer.renderPrefs(
      $('preference-cards'),
      State.get().selectedPreference,
      _onPrefSelect
    );
    _syncPrefNext();
  }

  function _onPrefSelect(prefId) {
    State.set('selectedPreference', prefId);
    UIRenderer.updatePrefSelection($('preference-cards'), prefId);
    _syncPrefNext();
  }

  function _syncPrefNext() {
    $('btn-pref-next').disabled = !State.get().selectedPreference;
  }

  /* ── Results ── */
  async function _goToResults() {
    _showSection('results');

    const { selectedTool, selectedPreference } = State.get();
    const recipes = DataService.filter(selectedTool, selectedPreference);
    _currentResults = recipes;

    $('results-title').textContent =
      `${_toolLabel(selectedTool)} · ${_prefLabel(selectedPreference)}`;

    _renderResults(recipes);
    $('search-input').value = '';
  }

  function _toolLabel(t) {
    return { MÁY: 'Espresso', PHIN: 'Phin', ESPRESSO: 'Espresso', FILTER: 'Filter', COLD_BREW: 'Cold Brew', COLDBREW: 'Cold Brew' }[t] || t;
  }

  function _prefLabel(p) {
    return p ? p.charAt(0) + p.slice(1).toLowerCase() : '';
  }

  function _renderResults(recipes) {
    const grid    = $('results-grid');
    const noRes   = $('no-results');
    const meta    = $('results-meta');

    const count = recipes.length;
    meta.textContent = count > 0
      ? `${count} recipe${count !== 1 ? 's' : ''} found`
      : '';

    noRes.classList.toggle('hidden', count > 0);
    grid.classList.toggle('hidden', count === 0);

    UIRenderer.renderRecipeCards(
      grid,
      recipes,
      id => _openRecipe(id),
      (id, cardEl) => _toggleFav(id, cardEl)
    );
  }

  function _openRecipe(id) {
    const recipe = DataService.getById(id);
    if (!recipe) return;
    State.set('selectedRecipe', recipe);
    Modal.open(recipe);
  }

  function _toggleFav(id, cardEl) {
    const added = State.toggleFavorite(id);
    const btn   = cardEl.querySelector('.recipe-card-fav');
    UIRenderer.updateFavButton(btn, added);
    Toast.show(added ? '♥ Added to favorites' : '♡ Removed from favorites');
    _updateFavCount();
    _syncFavPanel();
  }

  /* ── Favorites panel ── */
  function _initFavPanel() {
    const panel   = document.getElementById('favorites-panel');
    const overlay = document.getElementById('favorites-overlay');
    const btnOpen = $('btn-nav-favorites');
    const btnClose= $('btn-close-favorites');

    function openPanel() {
      _syncFavPanel();
      panel.classList.add('open');
      overlay.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
    }

    function closePanel() {
      panel.classList.remove('open');
      overlay.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    }

    btnOpen.addEventListener('click', openPanel);
    btnClose.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
  }

  function _syncFavPanel() {
    const favIds  = State.get().favorites;
    const all     = DataService.getAll();
    const favRecs = favIds.map(id => all.find(r => r.id === id)).filter(Boolean);

    UIRenderer.renderFavoritesList(
      $('favorites-list'),
      document.getElementById('favorites-empty'),
      favRecs,
      id => { _openRecipe(id); }
    );
  }

  /* ── Search ── */
  function _initSearch() {
    $('search-input').addEventListener('input', e => {
      const q = e.target.value.trim();
      const pool = q ? DataService.search(q, _currentResults) : _currentResults;
      _renderResults(pool);
    });
  }

  /* ── Ripple on primary buttons ── */
  function _initRipples() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', e => Anim.ripple(btn, e));
    });
  }

  /* ── Navigation wiring ── */
  function _initNav() {
    // Tool step
    $('btn-tool-next').addEventListener('click', e => {
      Anim.ripple($('btn-tool-next'), e);
      _goToPref();
    });
    $('btn-back-tool').addEventListener('click', () => _showSection('landing'));

    // Preference step
    $('btn-pref-next').addEventListener('click', async e => {
      Anim.ripple($('btn-pref-next'), e);
      await _goToResults();
    });
    $('btn-back-pref').addEventListener('click', () => _goToTool());

    // Results step
    $('btn-back-results').addEventListener('click', () => _goToPref());
  }

  /* ── Init ── */
  async function init() {
    await DataService.load();
    _initLanding();
    _initNav();
    _initSearch();
    _initFavPanel();
    _initRipples();
    _updateFavCount();

    // AOS
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 500, once: true, offset: 40 });
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
