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
  const $ = id => document.getElementById(id);

  const sections = {
    landing: $('section-landing'),
    flavor:  $('section-flavor'),
    catalog: $('section-catalog'),
  };

  let _currentWeather    = null;
  let _currentCondition  = null;

  function _showSection(name) {
    Object.entries(sections).forEach(([key, el]) => {
      const isTarget = key === name;
      el.classList.toggle('hidden', !isTarget);
      el.classList.toggle('active', isTarget);
    });

    const isLanding = name === 'landing';
    document.getElementById('app-header').classList.toggle('visible', !isLanding);
    document.getElementById('step-indicator').classList.toggle('hidden', isLanding);

    if (!isLanding) {
      const stepNum = { flavor: 1, catalog: 2 }[name] || 1;
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
      _goToFlavor();
    });
  }

  /* ── Flavor selector ── */
  function _goToFlavor() {
    _showSection('flavor');
    UIRenderer.renderFlavorCards(
      $('flavor-cards'),
      State.get().selectedFlavor,
      _onFlavorSelect
    );
    _syncFlavorNext();
    _refreshWeatherCard();
  }

  function _onFlavorSelect(flavorId) {
    State.set('selectedFlavor', flavorId);
    UIRenderer.updateFlavorSelection($('flavor-cards'), flavorId);
    _syncFlavorNext();
  }

  function _syncFlavorNext() {
    $('btn-flavor-next').disabled = !State.get().selectedFlavor;
  }

  /* ── Weather recommendation ── */
  async function _initWeather() {
    try {
      _currentWeather = await WeatherService.init();
      _refreshWeatherCard();
    } catch { /* silent fail */ }
  }

  function _refreshWeatherCard() {
    const rec = RecommendationEngine.getRecommendation(_currentWeather, _currentCondition);
    UIRenderer.renderWeatherCard(
      $('weather-card'),
      _currentWeather || { locationGranted: false },
      rec,
      _onWeatherExplore,
      _onWeatherManual
    );
  }

  function _onWeatherExplore(coffeeIds) {
    State.set('compareSelection', []);
    const coffees = coffeeIds
      .map(id => DataService.getCoffeeById(id))
      .filter(Boolean);
    _showSection('catalog');
    $('catalog-title').textContent = "Today's Pick";
    $('catalog-subtitle').textContent = 'Based on your current weather and time of day.';
    _renderCatalog(coffees);
  }

  function _onWeatherManual(weatherKey) {
    _currentCondition = RecommendationEngine.manualCondition(weatherKey);
    _refreshWeatherCard();
  }

  /* ── Coffee catalog ── */
  function _goToCatalog() {
    State.set('compareSelection', []);
    _showSection('catalog');
    const { selectedFlavor } = State.get();
    const coffees = DataService.getCoffeesByFlavor(selectedFlavor);
    const profile = FLAVOR_PROFILES.find(f => f.id === selectedFlavor);
    $('catalog-title').textContent   = profile ? profile.label : 'Our Coffees';
    $('catalog-subtitle').textContent = profile ? profile.keywords.join(' · ') : 'Select a coffee to view details.';
    _renderCatalog(coffees);
  }

  function _renderCatalog(coffees) {
    UIRenderer.renderCoffeeCards($('catalog-grid'), coffees, _openCoffee, _onCompareToggle);
    _updateCompareBar();
  }

  function _openCoffee(coffeeId) {
    const coffee = DataService.getCoffeeById(coffeeId);
    if (!coffee) return;
    State.set('selectedCoffee', coffee);
    const recipes = DataService.getRecipesByCoffee(coffee);
    Modal.openCoffee(coffee, recipes, { onRecipeOpen: _openRecipe });
  }

  function _openRecipe(id) {
    const recipe = DataService.getById(id);
    if (!recipe) return;
    State.set('selectedRecipe', recipe);
    Modal.open(recipe);
  }

  /* ── Compare ── */
  function _onCompareToggle(coffeeId) {
    const sel = State.get().compareSelection;
    if (!State.isComparing(coffeeId) && sel.length >= 2) {
      Toast.show('Max 2 coffees for comparison. Clear first.');
      return;
    }
    State.toggleCompare(coffeeId);
    UIRenderer.updateCompareCardState($('catalog-grid'), State.get().compareSelection);
    _updateCompareBar();
  }

  function _updateCompareBar() {
    const sel = State.get().compareSelection;
    const bar = $('compare-bar');
    if (!bar) return;

    if (!sel || sel.length === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    const textEl   = $('compare-bar-text');
    const openBtn  = $('btn-compare-open');

    if (sel.length === 1) {
      const c = DataService.getCoffeeById(sel[0]);
      if (textEl) textEl.textContent = `"${c ? c.name : ''}" selected — pick one more to compare`;
      openBtn?.classList.add('hidden');
    } else if (sel.length === 2) {
      if (textEl) textEl.textContent = '2 coffees selected';
      openBtn?.classList.remove('hidden');
    }
  }

  function _openComparison() {
    const [idA, idB] = State.get().compareSelection;
    const coffeeA = DataService.getCoffeeById(idA);
    const coffeeB = DataService.getCoffeeById(idB);
    if (!coffeeA || !coffeeB) return;

    const drawer  = $('compare-drawer');
    const body    = $('compare-drawer-body');
    const overlay = $('compare-drawer-overlay');

    UIRenderer.renderComparison(body, coffeeA, coffeeB, id => {
      _closeComparison();
      setTimeout(() => _openCoffee(id), 300);
    });

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function _closeComparison() {
    const drawer = $('compare-drawer');
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function _initCompare() {
    $('btn-compare-open')?.addEventListener('click', _openComparison);
    $('btn-compare-clear')?.addEventListener('click', () => {
      State.set('compareSelection', []);
      UIRenderer.updateCompareCardState($('catalog-grid'), []);
      _updateCompareBar();
    });
    $('btn-compare-close')?.addEventListener('click', _closeComparison);
    $('compare-drawer-overlay')?.addEventListener('click', _closeComparison);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') _closeComparison();
    });
  }

  /* ── Favorites panel ── */
  function _initFavPanel() {
    const panel    = document.getElementById('favorites-panel');
    const overlay  = document.getElementById('favorites-overlay');
    const btnOpen  = $('btn-nav-favorites');
    const btnClose = $('btn-close-favorites');

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
      id => _openRecipe(id)
    );
    _updateFavCount();
  }

  /* ── Ripple on primary buttons ── */
  function _initRipples() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', e => Anim.ripple(btn, e));
    });
  }

  /* ── Navigation wiring ── */
  function _initNav() {
    $('btn-flavor-next').addEventListener('click', e => {
      Anim.ripple($('btn-flavor-next'), e);
      _goToCatalog();
    });
    $('btn-back-flavor').addEventListener('click', () => _showSection('landing'));
    $('btn-back-catalog').addEventListener('click', () => _goToFlavor());
  }

  /* ── Init ── */
  async function init() {
    await DataService.load();
    _initLanding();
    _initNav();
    _initCompare();
    _initFavPanel();
    _initRipples();
    _updateFavCount();
    _initWeather();

    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 500, once: true, offset: 40 });
    }
  }

  return { init, syncFavBadge: _updateFavCount };
})();

document.addEventListener('DOMContentLoaded', App.init);
