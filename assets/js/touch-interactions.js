/* Tap gives touch users the same visual feedback as desktop hover. */
(() => {
  const root = document.querySelector('#hegazy-preview');
  if (!root) return;
  const touch = matchMedia('(hover: none), (pointer: coarse), (max-width: 700px)');
  const targets = '.hp-portrait-card,.hp-tracking-card,.hp-method-card,.hp-service,.hp-background-story,.hp-background-note,.hp-job,.hp-profile-note,.hp-background-tags>span,.hp-tool-chips>span[data-brand],.hp-highlight,.hp-workflow-title,.hp-framed-title,.hp-services-title';
  const photo = root.querySelector('.hp-portrait-photo');
  function configurePhoto() {
    if (!photo) return;
    if (touch.matches) {
      photo.setAttribute('role', 'button');
      photo.setAttribute('tabindex', '0');
      photo.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Toggle portrait color' : 'تغيير الصورة بين الألوان والأبيض والأسود');
      photo.setAttribute('aria-pressed', String(photo.closest('.hp-portrait-card').classList.contains('hp-touch-active')));
    } else {
      ['role', 'tabindex', 'aria-label', 'aria-pressed'].forEach(name => photo.removeAttribute(name));
      root.querySelectorAll('.hp-touch-active').forEach(el => el.classList.remove('hp-touch-active'));
    }
  }
  function toggle(target) {
    target.classList.toggle('hp-touch-active');
    if (target.matches('.hp-portrait-card')) configurePhoto();
  }
  root.addEventListener('click', event => {
    if (!touch.matches || event.target.closest('a,button,summary')) return;
    const target = event.target.closest(targets);
    if (target) toggle(target);
  });
  photo?.addEventListener('keydown', event => {
    if (touch.matches && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggle(photo.closest('.hp-portrait-card'));
    }
  });
  touch.addEventListener('change', configurePhoto);
  new MutationObserver(configurePhoto).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  configurePhoto();
})();
