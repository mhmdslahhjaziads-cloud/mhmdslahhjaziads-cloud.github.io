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

  const send = (name, parameters = {}) => {
    window.gtag('event', name, { ...parameters, send_to: measurementId });
  };
  window.addEventListener('hp:brands-expanded', () => {
    send('brands_show_more_click', { source: 'button' });
  });

  const milestones = new Set();
  function measureScroll() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    if (distance <= 0) return;
    const percent = Math.min(100, Math.max(0, scrollY / distance * 100));
    [25, 50, 75, 90].forEach(depth => {
      if (percent >= depth && !milestones.has(depth)) {
        milestones.add(depth);
        send('scroll_depth', { percent: depth });
      }
    });
  }
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; measureScroll(); });
  }, { passive: true });
  measureScroll();

  const contactSection = document.querySelector('#hp-contact');
  if (contactSection && 'IntersectionObserver' in window) {
    let contactSeen = false;
    const observer = new IntersectionObserver(entries => {
      if (!contactSeen && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .2)) {
        contactSeen = true;
        send('contact_section_view');
        observer.disconnect();
      }
    }, { threshold: .2 });
    observer.observe(contactSection);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      send('contact', { contact_method: 'whatsapp' });
      send('whatsapp_click');
    } else if (url.protocol === 'mailto:') {
      send('contact', { contact_method: 'email' });
      send('email_click');
    } else if (url.hostname === 'linkedin.com' || url.hostname === 'www.linkedin.com') {
      send('linkedin_click');
    } else if (url.hostname === location.hostname && url.pathname.endsWith('/assets/cv.pdf')) {
      send('cv_download_click');
    } else if (link.closest('.hp-brand-list')) {
      send('brand_website_click', {
        brand: link.closest('[data-brand]')?.dataset.brand || '',
        domain: url.hostname
      });
    } else if (url.hostname === location.hostname && url.hash === '#hp-contact') {
      const placement = link.closest('.hp-nav') ? 'header' : link.closest('.hp-dock-panel') ? 'dock' : 'page';
      send('talk_button_click', { placement });
    }
  });
})();
