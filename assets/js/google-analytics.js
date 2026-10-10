/* GA4 runs once on the live portfolio, keeping local previews out of reports. */
(() => {
  'use strict';
  if (location.hostname !== 'mhmdslahhjaziads-cloud.github.io' || window.hpGA4Ready) return;
  window.hpGA4Ready = true;
  const measurementId = 'G-5E9BPGNJJH';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  script.dataset.ga4State = 'loading';
  script.onload = () => { script.dataset.ga4State = 'loaded'; };
  script.onerror = () => { script.dataset.ga4State = 'blocked'; };
  document.head.appendChild(script);
})();
