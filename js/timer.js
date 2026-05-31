const BrewTimer = (() => {
  let _steps       = [];
  let _stepIndex   = 0;
  let _elapsed     = 0;   // seconds elapsed within current step
  let _interval    = null;
  let _isRunning   = false;
  let _isFinished  = false;

  // DOM refs (set on each modal open)
  let _elDisplay, _elStepName, _elProgress, _elPassive, _elPlay, _elPlayIcon, _elPauseIcon;
  let _timelineStepEls = [];

  function _pad(n) { return String(n).padStart(2, '0'); }

  function _fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${_pad(m)}:${_pad(s)}`;
  }

  function _currentStep() { return _steps[_stepIndex]; }

  function _stepDuration(step) {
    if (!step || typeof step.start !== 'number' || typeof step.end !== 'number') return 0;
    return step.end - step.start;
  }

  function _totalElapsed() {
    let total = 0;
    for (let i = 0; i < _stepIndex; i++) total += _stepDuration(_steps[i]);
    total += _elapsed;
    return total;
  }

  function _totalDuration() {
    return _steps.reduce((sum, s) => sum + _stepDuration(s), 0);
  }

  function _updateUI() {
    if (!_elDisplay) return;
    if (!_steps.length) {
      _elDisplay.textContent = '00:00';
      _elStepName.textContent = 'No steps';
      _elProgress.style.width = '0%';
      return;
    }
    const step = _currentStep();
    const dur  = _stepDuration(step);
    const remaining = dur - _elapsed;

    _elDisplay.textContent = _fmt(remaining);
    _elStepName.textContent = step.name;

    const pct = _totalDuration() > 0
      ? (_totalElapsed() / _totalDuration()) * 100
      : 0;
    _elProgress.style.width = `${Math.min(pct, 100)}%`;

    // Passive step banner
    if (step.passive) {
      _elPassive.classList.add('visible');
      _elPassive.textContent = `⏳ ${step.passiveLabel}`;
    } else {
      _elPassive.classList.remove('visible');
    }

    // Timeline highlight
    _timelineStepEls.forEach((el, i) => {
      el.classList.toggle('active', i === _stepIndex);
      el.classList.toggle('done',   i < _stepIndex);
    });
  }

  function _advanceStep() {
    if (_stepIndex >= _steps.length - 1) {
      _finish();
      return;
    }
    _stepIndex++;
    _elapsed = 0;

    // Auto-skip passive steps (they're reference-only — don't countdown)
    if (_currentStep().passive) {
      _updateUI();
      // Stop timer on passive steps so user reads the note
      _pause();
    } else {
      _updateUI();
    }
  }

  function _tick() {
    const step = _currentStep();
    if (!step) { _pause(); return; }
    if (step.passive) {
      // Passive step — just show the note, don't tick
      return;
    }
    _elapsed++;
    if (_elapsed >= _stepDuration(step)) {
      _advanceStep();
    } else {
      _updateUI();
    }
  }

  function _finish() {
    _isRunning  = false;
    _isFinished = true;
    clearInterval(_interval);
    _interval = null;

    if (_elDisplay)    _elDisplay.textContent = '00:00';
    if (_elStepName)   _elStepName.textContent = '✓ Brew Complete!';
    if (_elProgress)   _elProgress.style.width = '100%';
    if (_elPlayIcon)   _elPlayIcon.style.display = 'none';
    if (_elPauseIcon)  _elPauseIcon.style.display = 'none';
    if (_elPlay)       _elPlay.setAttribute('disabled', '');

    _timelineStepEls.forEach(el => el.classList.add('done'));

    // Toast notification
    if (typeof Toast !== 'undefined') Toast.show('☕ Brew complete — enjoy!');
  }

  function _play() {
    if (_isFinished || !_steps.length) return;
    _isRunning = true;
    _elPlayIcon.style.display  = 'none';
    _elPauseIcon.style.display = 'block';
    _interval = setInterval(_tick, 1000);
    _updateUI();
  }

  function _pause() {
    _isRunning = false;
    if (_elPlayIcon)  _elPlayIcon.style.display  = 'block';
    if (_elPauseIcon) _elPauseIcon.style.display = 'none';
    clearInterval(_interval);
    _interval = null;
  }

  function init(steps) {
    _steps      = steps;
    _stepIndex  = 0;
    _elapsed    = 0;
    _isRunning  = false;
    _isFinished = false;
    clearInterval(_interval);
    _interval = null;
  }

  function _replaceWithClone(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    return clone;
  }

  function bindDOM() {
    // Replace buttons with fresh clones to strip any stale listeners
    _elPlay = _replaceWithClone('btn-timer-play');
    _replaceWithClone('btn-timer-reset');
    _replaceWithClone('btn-timer-skip');

    _elDisplay    = document.getElementById('timer-display');
    _elStepName   = document.getElementById('timer-step-name');
    _elProgress   = document.getElementById('timer-progress');
    _elPassive    = document.getElementById('timer-passive');
    _elPlayIcon   = document.getElementById('play-icon');
    _elPauseIcon  = document.getElementById('pause-icon');
    _timelineStepEls = Array.from(document.querySelectorAll('#brew-timeline .timeline-step'));

    const btnReset = document.getElementById('btn-timer-reset');
    const btnSkip  = document.getElementById('btn-timer-skip');

    if (_elPlay) {
      _elPlay.addEventListener('click', () => {
        if (_isFinished) return;
        if (_isRunning) _pause(); else _play();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        _pause();
        _stepIndex  = 0;
        _elapsed    = 0;
        _isFinished = false;
        if (_elPlay) _elPlay.removeAttribute('disabled');
        if (_elPlayIcon)  _elPlayIcon.style.display  = 'block';
        if (_elPauseIcon) _elPauseIcon.style.display = 'none';
        _updateUI();
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        if (_isFinished) return;
        _elapsed = 0;
        _advanceStep();
      });
    }

    _updateUI();
  }

  function renderTimeline(container) {
    container.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'brew-timeline-track';

    _steps.forEach((step, i) => {
      const el = document.createElement('div');
      el.className = 'timeline-step';
      const stepDur = _stepDuration(step);
      const timeLabel = step.passive
        ? step.passiveLabel
        : stepDur < 60
          ? `${stepDur}s`
          : `${Math.floor(stepDur / 60)}m${stepDur % 60 ? (stepDur % 60) + 's' : ''}`;

      let subLabel = '';
      if (step.water && step.water !== '0g') {
        subLabel = step.water;
      } else if (step.ratio) {
        subLabel = step.ratio;
      } else if (step.temp) {
        subLabel = step.temp;
      } else if (step.milkRatio) {
        subLabel = step.milkRatio;
      } else {
        subLabel = timeLabel;
      }

      el.innerHTML = `
        <div class="timeline-dot">${i + 1}</div>
        <div class="timeline-step-name">${step.name}</div>
        <div class="timeline-step-water">${subLabel}</div>
      `;
      track.appendChild(el);
    });

    container.appendChild(track);
  }

  function stop() {
    _pause();
  }

  return { init, bindDOM, renderTimeline, stop };
})();
