const Modal = (() => {
  const el        = () => document.getElementById('recipe-modal');
  const overlay   = () => document.getElementById('modal-overlay');
  const body      = () => document.getElementById('modal-body');
  const closeBtn  = () => document.getElementById('modal-close');

  let _onClose = null;
  let _isOpen  = false;

  function open(recipe, { onClose } = {}) {
    _onClose = onClose || null;

    // Render content
    body().innerHTML = UIRenderer.renderModalContent(recipe);

    // Render timeline & init timer
    BrewTimer.init(recipe.steps);
    BrewTimer.renderTimeline(document.getElementById('brew-timeline'));

    // Show modal
    const modal = el();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    _isOpen = true;

    // Bind timer DOM after render
    BrewTimer.bindDOM();

    // Bind close events
    closeBtn().addEventListener('click', close, { once: true });
    overlay().addEventListener('click', close, { once: true });

    // Trap focus
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

    // Clear body after transition
    setTimeout(() => {
      if (!_isOpen) body().innerHTML = '';
    }, 500);

    if (_onClose) _onClose();
  }

  function isOpen() { return _isOpen; }

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _isOpen) close();
  });

  return { open, close, isOpen };
})();
