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
    const limit = compact.matches ? 6 : columns === 5 ? 10 : 9;
    const previewStart = !compact.matches && columns >= 5 ? columns : limit - columns;
    items.forEach((item, index) => {
      const hidden = !expanded && index >= limit;
      const preview = !expanded && index >= previewStart;
      item.hidden = hidden;
      item.classList.toggle('hp-brand-preview', preview && !hidden);
      if (preview || hidden) item.setAttribute('aria-hidden', 'true');
      else item.removeAttribute('aria-hidden');
      const link = item.querySelector('a');
      if (preview || hidden) link.setAttribute('tabindex', '-1');
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
