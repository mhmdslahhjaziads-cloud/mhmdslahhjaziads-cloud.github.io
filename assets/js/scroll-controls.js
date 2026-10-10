/* The ruler controls page scroll; the bottom arrow returns to the start. */
(() => {
  const root = document.querySelector('#hegazy-preview');
  const rail = root?.querySelector('.hp-side-rail');
  const backTop = root?.querySelector('#hp-back-top');
  if (!rail || !backTop) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let pointerId = null;
  let frame = null;
  const range = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const fraction = () => range() ? Math.min(1, Math.max(0, scrollY / range())) : 0;

  rail.setAttribute('role', 'slider');
  rail.setAttribute('tabindex', '0');
  rail.setAttribute('aria-orientation', 'vertical');
  rail.setAttribute('aria-valuemin', '0');
  rail.setAttribute('aria-valuemax', '100');
  function language() {
    const english = document.documentElement.lang === 'en';
    rail.setAttribute('aria-label', english ? 'Page scroll: click or drag' : 'تمرير الصفحة: اضغط أو اسحب');
    backTop.setAttribute('aria-label', english ? 'Back to top' : 'الرجوع لأعلى الصفحة');
    backTop.title = backTop.getAttribute('aria-label');
  }
  function render() {
    frame = null;
    const percent = Math.round(fraction() * 100);
    rail.setAttribute('aria-valuenow', String(percent));
    rail.setAttribute('aria-valuetext', percent + '%');
    backTop.hidden = range() < 200 || fraction() < .85;
  }
  function queue() {
    if (frame === null) frame = requestAnimationFrame(render);
  }
  function seek(clientY) {
    const bounds = rail.getBoundingClientRect();
    const value = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
    window.scrollTo({ top: value * range(), behavior: 'auto' });
  }
  function release() {
    pointerId = null;
    document.documentElement.classList.remove('hp-scroll-dragging');
  }
  rail.addEventListener('pointerdown', event => {
    if (!fine.matches || event.button !== 0) return;
    event.preventDefault();
    pointerId = event.pointerId;
    document.documentElement.classList.add('hp-scroll-dragging');
    rail.setPointerCapture(pointerId);
    seek(event.clientY);
  });
  rail.addEventListener('pointermove', event => {
    if (event.pointerId === pointerId) seek(event.clientY);
  });
  rail.addEventListener('pointerup', release);
  rail.addEventListener('pointercancel', release);
  rail.addEventListener('lostpointercapture', release);
  rail.addEventListener('keydown', event => {
    const values = { ArrowDown: fraction() + .05, ArrowUp: fraction() - .05, PageDown: fraction() + .1, PageUp: fraction() - .1, Home: 0, End: 1 };
    if (!(event.key in values)) return;
    event.preventDefault();
    window.scrollTo({ top: Math.max(0, Math.min(1, values[event.key])) * range(), behavior: reduced.matches ? 'auto' : 'smooth' });
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }));
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  new MutationObserver(language).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  language();
  render();
})();
