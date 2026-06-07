const State = (() => {
  const _state = {
    selectedFlavor: null,
    selectedCoffee: null,
    selectedRecipe: null,
    favorites: [],
    currentStep: 1,
  };

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('brew_favorites') || '[]');
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem('brew_favorites', JSON.stringify(_state.favorites));
  }

  _state.favorites = getFavorites();

  return {
    get() { return { ..._state }; },

    set(key, value) { _state[key] = value; },

    isFavorite(id) { return _state.favorites.includes(id); },

    toggleFavorite(id) {
      const idx = _state.favorites.indexOf(id);
      if (idx === -1) {
        _state.favorites.push(id);
      } else {
        _state.favorites.splice(idx, 1);
      }
      saveFavorites();
      return idx === -1;
    },

    reset() {
      _state.selectedFlavor = null;
      _state.selectedCoffee = null;
      _state.selectedRecipe = null;
      _state.currentStep = 1;
    },
  };
})();
