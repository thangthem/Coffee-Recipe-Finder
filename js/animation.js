const Anim = (() => {
  const hasGSAP = typeof gsap !== 'undefined';

  function staggerIn(elements, opts = {}) {
    const defaults = { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' };
    const cfg = { ...defaults, ...opts };
    if (hasGSAP) {
      gsap.fromTo(elements,
        { y: cfg.y, opacity: 0 },
        { y: 0, opacity: 1, duration: cfg.duration, stagger: cfg.stagger, ease: cfg.ease }
      );
    } else {
      Array.from(elements).forEach((el, i) => {
        el.style.transition = `opacity 0.4s ${i * 80}ms, transform 0.4s ${i * 80}ms`;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  function fadeIn(el, opts = {}) {
    const { duration = 0.5, delay = 0, y = 0 } = opts;
    if (hasGSAP) {
      gsap.fromTo(el,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
      );
    } else {
      el.style.transition = `opacity ${duration * 1000}ms`;
      el.style.opacity = '1';
    }
  }

  function fadeOut(el, opts = {}) {
    const { duration = 0.3, onComplete } = opts;
    if (hasGSAP) {
      gsap.to(el, { opacity: 0, duration, ease: 'power2.in', onComplete });
    } else {
      el.style.transition = `opacity ${duration * 1000}ms`;
      el.style.opacity = '0';
      if (onComplete) setTimeout(onComplete, duration * 1000);
    }
  }

  function sectionEnter(el) {
    if (hasGSAP) {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    }
  }

  function landingEntrance() {
    if (!hasGSAP) return;
    const tl = gsap.timeline();
    tl.fromTo('.landing-icon',   { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
      .fromTo('.landing-title',  { opacity: 0, y: 20 },       { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .fromTo('.landing-tagline',{ opacity: 0, y: 16 },       { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .fromTo('#btn-start',      { opacity: 0, y: 12 },       { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
  }

  function timelineFill(stepEls, doneIndex) {
    if (!hasGSAP) return;
    stepEls.forEach((el, i) => {
      const dot = el.querySelector('.timeline-dot');
      if (i < doneIndex) {
        gsap.to(dot, { scale: 1, backgroundColor: 'var(--primary)', duration: 0.3 });
      } else if (i === doneIndex) {
        gsap.fromTo(dot, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      }
    });
  }

  function ripple(btn, event) {
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event.clientX - rect.left) - size / 2;
    const y = (event.clientY - rect.top)  - size / 2;
    circle.classList.add('ripple');
    circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  }

  return { staggerIn, fadeIn, fadeOut, sectionEnter, landingEntrance, timelineFill, ripple };
})();
