/* Queue tag libraries after the first image paint, or immediately on interaction. */
(() => {
  'use strict';
  let flushed = false;
  const callbacks = [];
  function flush() {
    if (flushed) return;
    flushed = true;
    callbacks.splice(0).forEach(callback => callback());
  }
  window.hpAfterFirstPaint = callback => {
    if (flushed) callback(); else callbacks.push(callback);
  };
  ['pointerdown', 'keydown', 'pagehide'].forEach(name => window.addEventListener(name, flush, {once:true,passive:true}));
  window.setTimeout(flush, 2500);
  function painted() {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (window.requestIdleCallback) window.requestIdleCallback(flush, {timeout:500});
      else window.setTimeout(flush, 0);
    }));
  }
  const image = document.querySelector('.hp-portrait-photo > img');
  if (!image || image.complete) painted();
  else {
    image.addEventListener('load', painted, {once:true});
    image.addEventListener('error', painted, {once:true});
  }
})();
