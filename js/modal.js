const Modal = (() => {
  const el       = () => document.getElementById('recipe-modal');
  const overlay  = () => document.getElementById('modal-overlay');
  const body     = () => document.getElementById('modal-body');
  const closeBtn = () => document.getElementById('modal-close');

  let _onClose = null;
  let _isOpen  = false;

  function _recipeToSteps(subRecipe) {
    if (!subRecipe || !subRecipe.specs || !subRecipe.specs.brewTimeSec) return [];
    return [{ name: subRecipe.label, start: 0, end: subRecipe.specs.brewTimeSec }];
  }

  function _wireRecipeTabs(subRecipes) {
    const tabs = document.getElementById('recipe-tabs');
    if (!tabs) return;

    tabs.querySelectorAll('.recipe-tab').forEach(tab => {
      const activate = () => {
        const idx = parseInt(tab.dataset.index, 10);
        const rec = subRecipes[idx];

        tabs.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const specsEl = document.getElementById('recipe-specs-container');
        if (specsEl) specsEl.innerHTML = UIRenderer.renderSpecsGrid(rec.specs);

        const labelEl = document.getElementById('timer-section-label');
        if (labelEl) labelEl.textContent = `Brew Timer — ${rec.label}`;

        BrewTimer.stop();
        BrewTimer.init(_recipeToSteps(rec));
        BrewTimer.bindDOM();
      };

      tab.addEventListener('click', activate);
      tab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  function open(recipe, { onClose } = {}) {
    _onClose = onClose || null;

    body().innerHTML = UIRenderer.renderModalContent(recipe);

    if (recipe.recipes && recipe.recipes.length > 0) {
      // MÁY: simple countdown for selected sub-recipe
      BrewTimer.init(_recipeToSteps(recipe.recipes[0]));
      _wireRecipeTabs(recipe.recipes);
    } else {
      // PHIN, COLDBREW, FILTER
      const steps = recipe.brewSteps || [];
      BrewTimer.init(steps);
      const timeline = document.getElementById('brew-timeline');
      if (timeline) BrewTimer.renderTimeline(timeline);
    }

    const modal = el();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    _isOpen = true;

    BrewTimer.bindDOM();

    closeBtn().addEventListener('click', close, { once: true });
    overlay().addEventListener('click', close, { once: true });

    modal.focus();
  }

  function close() {
    if (!_isOpen) return;
    BrewTimer.stop();

    const modal = el();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    _isOpen = false;

    setTimeout(() => {
      if (!_isOpen) body().innerHTML = '';
    }, 500);

    if (_onClose) _onClose();
  }

  function isOpen() { return _isOpen; }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _isOpen) close();
  });

  return { open, close, isOpen };
})();
