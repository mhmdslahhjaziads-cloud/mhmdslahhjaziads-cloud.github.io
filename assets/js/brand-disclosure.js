(() => {
  const panel = document.querySelector('.hp-tracking-brands');
  if (!panel) return;
  const list = panel.querySelector('.hp-brand-list');
  const items = [...list.children];
  const button = panel.querySelector('.hp-brands-toggle');
  const labels = panel.querySelector('.hp-brands-toggle-label');
  const compact = window.matchMedia('(max-width:700px)');
  let expanded = false;

  function render() {
    const columns = getComputedStyle(list).gridTemplateColumns.split(' ').length;
    const limit = columns * 2;
    items.forEach((item, index) => {
      const preview = !expanded && index >= limit && index < limit + columns;
      const hidden = !expanded && index >= limit + columns;
      item.hidden = hidden;
      item.classList.toggle('hp-brand-preview', preview);
      item.inert = hidden || preview;
      if (hidden || preview) item.setAttribute('aria-hidden', 'true');
      else item.removeAttribute('aria-hidden');
      const link = item.querySelector('a');
      if (hidden || preview) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
    panel.classList.toggle('hp-brands-expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
    labels.setAttribute('data-ar', expanded ? 'عرض أقل' : 'عرض المزيد');
    labels.setAttribute('data-en', expanded ? 'Show less' : 'Show more');
    const english = document.documentElement.lang === 'en' || document.querySelector('#hegazy-preview')?.getAttribute('dir') === 'ltr';
    labels.textContent = english ? labels.getAttribute('data-en') : labels.getAttribute('data-ar');
  }
  button.addEventListener('click', () => {
    expanded = !expanded;
    render();
    if (expanded) window.dispatchEvent(new CustomEvent('hp:brands-expanded', { detail: { source: 'button' } }));
    if (!expanded) panel.scrollIntoView({block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
  });
  list.addEventListener('click', (event) => {
    if (!expanded && event.target.closest('.hp-brand-preview')) {
      event.preventDefault();
      expanded = true;
      render();
      window.dispatchEvent(new CustomEvent('hp:brands-expanded', { detail: { source: 'blur_preview' } }));
    }
  });
  compact.addEventListener('change', render);
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(render);
  }, { passive: true });
  render();
})();
