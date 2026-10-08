/* Portfolio events: production only, with one initialization per page. */
(() => {
  'use strict';
  const pixelId = '1166315572519798';
  if (location.hostname !== 'mhmdslahhjaziads-cloud.github.io' || window.hpMetaPixelReady) return;
  window.hpMetaPixelReady = true;

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset.metaPixelState = 'loading';
    script.onload = () => { script.dataset.metaPixelState = 'loaded'; };
    script.onerror = () => { script.dataset.metaPixelState = 'blocked'; };
    document.head.appendChild(script);
  }
  window.fbq('set', 'autoConfig', false, pixelId);
  window.fbq('init', pixelId);
  window.fbq('trackSingle', pixelId, 'PageView');

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const send = (name, parameters, standard = false) => {
      window.fbq(standard ? 'trackSingle' : 'trackSingleCustom', pixelId, name, parameters);
    };
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      send('Contact', { contact_method: 'whatsapp' }, true);
    } else if (url.protocol === 'mailto:') {
      send('Contact', { contact_method: 'email' }, true);
    } else if (url.hostname === 'linkedin.com' || url.hostname === 'www.linkedin.com') {
      send('LinkedInClick', {});
    } else if (url.hostname === location.hostname && url.pathname.endsWith('/assets/cv.pdf')) {
      send('CVDownloadClick', {});
    } else if (link.closest('.hp-brand-list')) {
      send('BrandWebsiteClick', {
        brand: link.closest('[data-brand]')?.dataset.brand || '',
        domain: url.hostname
      });
    }
  });
})();
