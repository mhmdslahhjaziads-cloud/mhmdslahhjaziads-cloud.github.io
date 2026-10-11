/* Hover, keyboard and touch share the same country flag reveal. */
(() => {
  const section = document.querySelector('.hp-opportunity');
  if (!section) return;
  const buttons = [...section.querySelectorAll('.hp-market-country')];
  const touch = matchMedia('(hover:none), (pointer:coarse)');
  function close(button) {
    button.classList.remove('is-flag-open');
    button.setAttribute('aria-pressed', 'false');
  }
  buttons.forEach(button => {
    button.addEventListener('click', event => {
      if (!touch.matches && event.detail !== 0) return;
      const open = !button.classList.contains('is-flag-open');
      buttons.forEach(close);
      button.classList.toggle('is-flag-open', open);
      button.setAttribute('aria-pressed', String(open));
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape') { close(button); button.blur(); }
    });
    button.addEventListener('blur', () => close(button));
  });
  document.addEventListener('pointerdown', event => {
    if (!section.contains(event.target)) buttons.forEach(close);
  });
})();
