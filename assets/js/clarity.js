/* Capture sessions only on the published portfolio, once per page. */
(() => {
  'use strict';
  if (location.hostname !== 'mhmdslahhjaziads-cloud.github.io' || window.hpClarityReady) return;
  window.hpClarityReady = true;
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.clarity.ms/tag/yvk9p3430s';
  script.dataset.clarityState = 'loading';
  script.onload = () => { script.dataset.clarityState = 'loaded'; };
  script.onerror = () => { script.dataset.clarityState = 'blocked'; };
  document.head.appendChild(script);
})();
