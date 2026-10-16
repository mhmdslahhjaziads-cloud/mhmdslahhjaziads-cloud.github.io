(() => {
  'use strict';
  const root = document.querySelector('#hegazy-preview [data-carbon-carousel]');
  if (!root) return;
  const scroller = root.querySelector('.hp-carbon-window');
  const track = root.querySelector('.hp-carbon-track');
  const slides = [...track.querySelectorAll('.hp-carbon-slide')];
  const dots = [...root.querySelectorAll('.hp-carbon-dot')];
  const count = root.querySelector('.hp-carbon-count');
  const title = document.querySelector('#hegazy-preview .hp-carbon-title');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let timer = 0;
  let visible = false;
  let held = false;
  let scrollTimer = 0;

  function update(next) {
    index = (next + slides.length) % slides.length;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function show(next) {
    const target = (next + slides.length) % slides.length;
    const left = slides[target].offsetLeft - track.offsetLeft;
    scroller.scrollTo({left, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
    update(target);
  }

  function stop() { window.clearInterval(timer); timer = 0; }
  function start() {
    stop();
    if (!visible || held || reducedMotion.matches || document.hidden || slides.length < 2) return;
    timer = window.setInterval(() => show(index + 1), 6500);
  }
  function move(delta) { show(index + delta); start(); }

  root.querySelector('.hp-carbon-previous').addEventListener('click', () => move(-1));
  root.querySelector('.hp-carbon-next').addEventListener('click', () => move(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  scroller.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const position = scroller.scrollLeft + 8;
      let nearest = 0;
      slides.forEach((slide, i) => {
        if (Math.abs((slide.offsetLeft - track.offsetLeft) - position) < Math.abs((slides[nearest].offsetLeft - track.offsetLeft) - position)) nearest = i;
      });
      update(nearest);
    }, 80);
  }, {passive:true});

  root.addEventListener('pointerenter', () => { held = true; stop(); });
  root.addEventListener('pointerleave', () => { held = false; start(); });
  root.addEventListener('focusin', () => { held = true; stop(); });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) { held = false; start(); }
  });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener?.('change', start);

  if (title) {
    const hoverInput = window.matchMedia('(hover: hover) and (pointer: fine)');
    let badgeTimer = 0;
    const hasKeyboardFocus = () => title.matches(':focus-within');
    const hasHover = () => hoverInput.matches && title.matches(':hover');
    function revealBadges() {
      window.clearTimeout(badgeTimer);
      title.classList.add('is-visible');
    }
    function hideBadges() {
      window.clearTimeout(badgeTimer);
      badgeTimer = 0;
      title.classList.remove('is-visible');
    }

    title.addEventListener('pointerenter', () => {
      if (hoverInput.matches) revealBadges();
    });
    title.addEventListener('pointerleave', () => {
      if (!hasKeyboardFocus()) hideBadges();
    });
    title.addEventListener('focusin', revealBadges);
    title.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!hasKeyboardFocus() && !hasHover()) hideBadges();
      }, 0);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          revealBadges();
          if (!hasHover() && !hasKeyboardFocus()) {
            badgeTimer = window.setTimeout(() => {
              if (!hasKeyboardFocus() && !hasHover()) hideBadges();
            }, 950);
          }
        } else if (!hasHover() && !hasKeyboardFocus()) {
          hideBadges();
        }
      }, {threshold:.65, rootMargin:'0px 0px -8% 0px'}).observe(title);
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      start();
    }, {threshold:.35}).observe(root);
  } else {
    visible = true;
    start();
  }
})();
