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
  }

  function _onFlavorSelect(flavorId) {
    State.set('selectedFlavor', flavorId);
    UIRenderer.updateFlavorSelection($('flavor-cards'), flavorId);
    _syncFlavorNext();
  }

  function _syncFlavorNext() {
    $('btn-flavor-next').disabled = !State.get().selectedFlavor;
  }

  /* ── Coffee catalog ── */
  function _goToCatalog() {
    _showSection('catalog');
    const { selectedFlavor } = State.get();
    const coffees = DataService.getCoffeesByFlavor(selectedFlavor);
    const profile = FLAVOR_PROFILES.find(f => f.id === selectedFlavor);

    $('catalog-title').textContent = profile ? profile.label : 'Our Coffees';
    $('catalog-subtitle').textContent =
      profile ? profile.keywords.join(' · ') : 'Select a coffee to view details.';

    UIRenderer.renderCoffeeCards($('catalog-grid'), coffees, _openCoffee);
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

  /* ── Favorites panel ── */
  function _initFavPanel() {
    const panel   = document.getElementById('favorites-panel');
    const overlay = document.getElementById('favorites-overlay');
    const btnOpen = $('btn-nav-favorites');
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
    _initFavPanel();
    _initRipples();
    _updateFavCount();

    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 500, once: true, offset: 40 });
    }
  }

  return { init, syncFavBadge: _updateFavCount };
})();

document.addEventListener('DOMContentLoaded', App.init);
