/* On desktop, the draft ends alongside the details field and its counter. */
(() => {
  const layout = document.querySelector('.hp-chat-layout');
  const entry = layout?.querySelector('.hp-chat-entry');
  const draft = layout?.querySelector('.hp-chat-draft');
  const details = document.getElementById('hp-message-details');
  const counter = document.getElementById('hp-message-count');
  if (!layout || !entry || !draft || !details || !counter) return;
  const phone = matchMedia('(max-width:700px)');
  let frame = null;
  function measure() {
    frame = null;
    if (phone.matches) { draft.style.removeProperty('--hp-draft-height'); return; }
    const height = Math.ceil(entry.querySelector('.hp-message-fields')?.getBoundingClientRect().height || 420);
    const value = Math.max(390, Math.min(550,height)) + 'px';
    if (draft.style.getPropertyValue('--hp-draft-height') !== value) draft.style.setProperty('--hp-draft-height', value);
  }
  function queue() { if (frame === null) frame = requestAnimationFrame(measure); }
  const observer = new ResizeObserver(queue);
  observer.observe(entry);
  observer.observe(details);
  addEventListener('resize', queue, { passive: true });
  phone.addEventListener('change', queue);
  document.fonts.ready.then(queue);
  queue();
})();
