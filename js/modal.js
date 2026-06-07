const Modal = (() => {
  const el       = () => document.getElementById('recipe-modal');
  const overlay  = () => document.getElementById('modal-overlay');
  const body     = () => document.getElementById('modal-body');
  const closeBtn = () => document.getElementById('modal-close');

  let _onClose  = null;
  let _isOpen   = false;
  let _hasTimer = false;

  function _recipeToSteps(subRecipe) {
    if (!subRecipe || !subRecipe.specs || !subRecipe.specs.brewTimeSec) return [];
    return [{ name: subRecipe.label, start: 0, end: subRecipe.specs.brewTimeSec }];
  }

  function _wireProfileTabs(profiles) {
    const tabs = document.getElementById('profile-tabs');
    if (!tabs) return;

    tabs.querySelectorAll('.recipe-tab').forEach(tab => {
      const activate = () => {
        const key     = tab.dataset.profile;
        const profile = profiles[key];
        if (!profile) return;

        tabs.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const specsEl = document.getElementById('profile-specs-container');
        if (specsEl) specsEl.innerHTML = UIRenderer.renderSpecsGrid(profile.specs);

        BrewTimer.stop();
        BrewTimer.init(profile.brewSteps || []);
        BrewTimer.bindDOM();

        const timeline = document.getElementById('brew-timeline');
        if (timeline) BrewTimer.renderTimeline(timeline);
      };

      tab.addEventListener('click', activate);
      tab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
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
    _onClose  = onClose || null;
    _hasTimer = true;

    body().innerHTML = UIRenderer.renderModalContent(recipe);

    if (recipe.recipes && recipe.recipes.length > 0) {
      // MÁY: simple countdown for selected sub-recipe
      BrewTimer.init(_recipeToSteps(recipe.recipes[0]));
      _wireRecipeTabs(recipe.recipes);
    } else if (recipe.profiles) {
      // FILTER with social/staff profiles
      const firstProfile = Object.values(recipe.profiles)[0];
      BrewTimer.init(firstProfile.brewSteps || []);
      const timeline = document.getElementById('brew-timeline');
      if (timeline) BrewTimer.renderTimeline(timeline);
      _wireProfileTabs(recipe.profiles);
    } else {
      // PHIN, FILTER, COLDBREW
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
    if (_hasTimer) BrewTimer.stop();

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

  function openCoffee(coffee, recipes, { onRecipeOpen } = {}) {
    _onClose  = null;
    _hasTimer = false;

    body().innerHTML = UIRenderer.renderCoffeeModalContent(coffee, recipes);

    // Wire pricing buttons
    const pricingBtns = document.getElementById('pricing-btns');
    const pricingDisplay = document.getElementById('pricing-display');
    if (pricingBtns && pricingDisplay) {
      pricingBtns.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          pricingBtns.querySelectorAll('.pricing-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const price = parseInt(btn.dataset.price, 10);
          pricingDisplay.textContent = price.toLocaleString('vi-VN') + ' ₫';
        });
      });
    }

    // Wire recipe list items
    const recipeList = document.getElementById('modal-recipe-list');
    if (recipeList) {
      recipeList.querySelectorAll('.modal-recipe-item').forEach(item => {
        const id = parseInt(item.dataset.id, 10);

        // Fav button
        const favBtn = item.querySelector('.recipe-card-fav');
        if (favBtn) {
          favBtn.addEventListener('click', e => {
            e.stopPropagation();
            const added = State.toggleFavorite(id);
            UIRenderer.updateFavButton(favBtn, added);
            Toast.show(added ? '♥ Added to favorites' : '♡ Removed from favorites');
            if (typeof App !== 'undefined') App.syncFavBadge();
          });
        }

        // Open recipe
        const activate = () => {
          if (!onRecipeOpen) return;
          close();
          setTimeout(() => onRecipeOpen(id), 350);
        };
        item.addEventListener('click', e => {
          if (e.target.closest('.recipe-card-fav')) return;
          activate();
        });
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
        });
      });
    }

    const modal = el();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    _isOpen = true;

    closeBtn().addEventListener('click', close, { once: true });
    overlay().addEventListener('click', close, { once: true });

    modal.focus();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _isOpen) close();
  });

  return { open, close, isOpen, openCoffee };
})();
