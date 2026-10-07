(function () {
  'use strict';
  const root = document.getElementById('hegazy-preview');
  const languageButton = document.getElementById('hp-language');
  const themeButton = document.getElementById('hp-theme');
  const menuButton = document.getElementById('hp-menu');
  const navigation = document.getElementById('hp-nav-links');
  const header = root.querySelector('.hp-nav');
  const slot = root.querySelector('.hp-nav-slot');
  const dockButton = document.getElementById('hp-dock-toggle');
  const dockPanel = document.getElementById('hp-dock-panel');
  const dockLanguage = document.getElementById('hp-dock-language');
  const dockTheme = document.getElementById('hp-dock-theme');
  const railLinks = root.querySelectorAll('.hp-side-rail a');
  let docked = false;
  let dockOpen = false;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let storage;
  try {storage = window.localStorage;} catch (_) {storage = null;}
  const preferences = window.HegazyPreferences.readPreferences(storage);
  let scrollQueued = false;
  let letterFrame = null;
  let letterGroups = [];

  function animateLetters() {
    let moving = false;
    const targets = letterGroups.map(group => parseFloat(group.label.style.getPropertyValue('--hp-label-y')) || 0);
    letterGroups.forEach((group, groupIndex) => {
      const target = parseFloat(group.label.style.getPropertyValue('--hp-label-y')) || 0;
      const lower = groupIndex ? (targets[groupIndex - 1] + target) / 2 + 14 : target - 12;
      const upper = groupIndex < targets.length - 1 ? (target + targets[groupIndex + 1]) / 2 - 14 : target + 12;
      let leader = target;
      group.letters.forEach((letter, index) => {
        const previous = letter.y;
        letter.y = motion.matches ? target : Math.max(lower, Math.min(upper, letter.y + (leader - letter.y) * .18));
        if (Math.abs(target - letter.y) > .15) moving = true;
        letter.element.style.setProperty('--hp-letter-y', letter.y.toFixed(2)+'px');
        const bend = motion.matches ? 0 : Math.max(-1,Math.min(1,(letter.y-target)/75));
        const width = group.label.offsetWidth;
        const center = (index + .5) / group.letters.length * width;
        const horizontal = preferences.language === 'en' ? (width - center) * Math.abs(bend) : center * Math.abs(bend);
        letter.element.style.setProperty('--hp-letter-x',horizontal.toFixed(2)+'px');
        letter.element.style.setProperty('--hp-letter-turn',(-75 * bend).toFixed(2)+'deg');
        letter.element.style.setProperty('--hp-letter-origin', (preferences.language === 'en' ? center : width-center).toFixed(2)+'px 50%');
        leader = previous;
      });
    });
    letterFrame = moving ? requestAnimationFrame(animateLetters) : null;
  }

  function queueLetters() {
    if (letterFrame === null) letterFrame = requestAnimationFrame(animateLetters);
  }

  function prepareLetterMotion() {
    if (letterFrame !== null) cancelAnimationFrame(letterFrame);
    letterFrame = null;
    letterGroups = [];
    root.querySelectorAll('.hp-moving-labels > span').forEach(label => {
      const text = label.textContent;
      const count = Array.from(text).length;
      const base = document.createElement('b');
      base.className = 'hp-letter-base';
      base.textContent = text;
      label.replaceChildren(base);
      const group = {label:label,letters:[]};
      Array.from(text).forEach((_,index) => {
        const slice = document.createElement('i');
        slice.className = 'hp-letter-slice';
        slice.textContent = text;
        const position = preferences.language === 'ar' ? count - index - 1 : index;
        slice.style.setProperty('--hp-slice-x','inset(0 '+ ((count-position-1)/count*100) +'% 0 '+(position/count*100)+'%)');
        slice.style.setProperty('--hp-slice-y','inset('+(index/count*100)+'% 0 '+((count-index-1)/count*100)+'% 0)');
        slice.style.setProperty('--hp-letter-delay', index * 18 + 'ms');
        label.appendChild(slice);
        group.letters.push({element:slice,y:parseFloat(label.style.getPropertyValue('--hp-label-y')) || 0});
      });
      letterGroups.push(group);
    });
    queueLetters();
  }

  function applyLanguage() {
    const english = preferences.language === 'en';
    const language = english ? 'en' : 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = english ? 'ltr' : 'rtl';
    root.lang = language;
    root.dir = english ? 'ltr' : 'rtl';
    root.querySelectorAll('[data-ar][data-en]').forEach(element => {
      element.textContent = element.getAttribute('data-' + language);
    });
    languageButton.textContent = english ? 'العربية ↗' : 'EN ↗';
    languageButton.setAttribute('aria-label', english ? 'Switch to Arabic' : 'Switch to English');
    dockLanguage.textContent = english ? 'العربية ↗' : 'EN ↗';
    dockLanguage.setAttribute('aria-label', languageButton.getAttribute('aria-label'));
    dockPanel.setAttribute('aria-label', english ? 'Side navigation' : 'القائمة الجانبية');
    root.querySelector('.hp-side-rail').setAttribute('aria-label', english ? 'Section progress' : 'مؤشر أقسام الموقع');
    railLinks.forEach(link => {link.setAttribute('aria-label', root.querySelector('.hp-dock-panel a[href="'+link.getAttribute('href')+'"]').textContent);});
    navigation.setAttribute('aria-label', english ? 'Site navigation' : 'أقسام الموقع');
    root.setAttribute('aria-label', english ? 'Mohamed Salah Hegazy portfolio' : 'موقع محمد صلاح حجازي');
    root.querySelector('.hp-map').setAttribute('aria-label', english ? 'Workflow from advertising to optimization' : 'مسار عمل من الإعلان إلى التحسين');
    const campaignCTA = root.querySelector('#hp-campaign-cta');
    campaignCTA.href = 'https://wa.me/201558272805?text=' + encodeURIComponent(campaignCTA.getAttribute('data-message-' + language));
    root.querySelector('.hp-email-cta').href = 'mailto:mhmdslahhjazi.ads@gmail.com?subject=' + encodeURIComponent(english ? 'Collaboration with Mohamed Salah Hegazy' : 'تعاون مع محمد صلاح حجازي');
    document.title = english ? 'Mohamed Salah Hegazy | Performance Marketing & Tracking' : 'محمد صلاح حجازي | Performance Marketing & Tracking';
    document.querySelector('meta[name="description"]').content = english
      ? 'Mohamed Salah Hegazy — performance marketing, account management, tracking and data accuracy for e-commerce. Explore my experience and get in touch.'
      : 'محمد صلاح حجازي — التسويق بالأداء، إدارة الحسابات، ومتابعة التتبّع ودقة البيانات للتجارة الإلكترونية. اكتشف خبرتي وأدواتي وتواصل معي.';
    prepareLetterMotion();
    updateControlLabels();
  }

  function applyTheme() {
    const dark = preferences.theme === 'dark';
    root.dataset.appearance = preferences.theme;
    document.body.classList.toggle('hp-dark', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#171c19' : '#f6f3ec';
    themeButton.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>';
    updateControlLabels();
  }

  function updateControlLabels() {
    const english = preferences.language === 'en';
    const dark = preferences.theme === 'dark';
    themeButton.setAttribute('aria-label', english ? (dark ? 'Use light mode' : 'Use dark mode') : (dark ? 'المظهر الفاتح' : 'المظهر الداكن'));
    dockTheme.innerHTML = themeButton.innerHTML;
    dockTheme.setAttribute('aria-label', themeButton.getAttribute('aria-label'));
    dockTheme.setAttribute('aria-pressed', String(dark));
    dockButton.setAttribute('aria-label', english ? (dockOpen ? 'Close side menu' : 'Open side menu') : (dockOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'));
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', english ? (open ? 'Close menu' : 'Open menu') : (open ? 'إغلاق القائمة' : 'فتح القائمة'));
  }

  function setMenu(open) {
    navigation.classList.toggle('hp-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    updateControlLabels();
  }

  languageButton.addEventListener('click', function () {
    preferences.language = preferences.language === 'ar' ? 'en' : 'ar';
    applyLanguage();
    window.HegazyPreferences.savePreferences(storage, preferences);
  });
  themeButton.addEventListener('click', function () {
    preferences.theme = preferences.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    window.HegazyPreferences.savePreferences(storage, preferences);
  });
  menuButton.addEventListener('click', function () {setMenu(menuButton.getAttribute('aria-expanded') !== 'true');});
  function setDock(open) {
    dockOpen = open && docked;
    dockPanel.hidden = !dockOpen;
    root.classList.toggle('hp-dock-open', dockOpen);
    dockButton.setAttribute('aria-expanded', String(dockOpen));
    updateControlLabels();
  }
  dockButton.addEventListener('click', () => setDock(!dockOpen));
  dockLanguage.addEventListener('click', () => languageButton.click());
  dockTheme.addEventListener('click', () => themeButton.click());
  dockPanel.addEventListener('click', event => {if(event.target.closest('a'))setDock(false);});
  navigation.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && dockOpen) {setDock(false);dockButton.focus();}
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', function (event) {
    const path = event.composedPath();
    if (!path.includes(dockPanel) && !path.includes(dockButton) && !path.includes(languageButton) && !path.includes(themeButton)) setDock(false);
    if (!event.target.closest('.hp-nav')) setMenu(false);
  });

  function updateScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--hp-progress', range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)).toFixed(4) : '0');
    header.classList.toggle('hp-scrolled', window.scrollY > 20);
    const nextDocked = window.matchMedia('(min-width: 900px)').matches && window.scrollY > (docked ? 70 : 150);
    if (nextDocked !== docked) {
      docked = nextDocked;
      if (!docked) setDock(false);
      root.classList.toggle('hp-docked', docked);
      header.querySelectorAll('.hp-identity,.hp-links,.hp-controls,.hp-contact').forEach(el=>{el.inert=docked;});
      dockButton.hidden = !docked;
      dockButton.tabIndex = docked ? 0 : -1;
      setMenu(false);
      if (!docked && motion.matches) requestAnimationFrame(measureHeader);
    }
    let active = 'hp-home';
    railLinks.forEach(link=>{if(document.getElementById(link.dataset.section).getBoundingClientRect().top < window.innerHeight * .4)active=link.dataset.section;});
    railLinks.forEach(link=>{const selected=link.dataset.section===active;link.classList.toggle('hp-rail-active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    const labels = root.querySelector('.hp-moving-labels');
    const labelBounds = labels.getBoundingClientRect();
    let previousLabelY = -40;
    labels.querySelectorAll(':scope > span').forEach((label,index)=>{
      const selected = label.dataset.labelSection === active;
      label.classList.toggle('hp-label-current',selected);
      const sectionTop = document.getElementById(label.dataset.labelSection).getBoundingClientRect().top;
      const y = Math.max(index * 40,previousLabelY + 40,Math.min(labelBounds.height - (5-index)*40,sectionTop-labelBounds.top));
      previousLabelY = y;
      label.style.setProperty('--hp-label-y',y+'px');
    });
    queueLetters();
    scrollQueued = false;
  }
  window.addEventListener('scroll', function () {
    if (!scrollQueued) {scrollQueued = true;requestAnimationFrame(updateScroll);}
  }, {passive:true});
  function measureHeader() {
    const bounds = slot.getBoundingClientRect();
    root.style.setProperty('--hp-nav-left', bounds.left + 'px');
    root.style.setProperty('--hp-nav-width', bounds.width + 'px');
    if (!docked) {
      header.style.height = 'auto';
      root.style.setProperty('--hp-nav-height', header.offsetHeight + 'px');
      slot.style.height = header.offsetHeight + 'px';
      header.style.height = '';
    }
    updateScroll();
  }
  window.addEventListener('resize', measureHeader, {passive:true});
  header.addEventListener('transitionend', event => {
    if (event.target === header && event.propertyName === 'width' && !docked) measureHeader();
  });

  const revealElements = root.querySelectorAll('.hp-section-heading,.hp-service,.hp-tool-group,.hp-job,.hp-education,.hp-callout');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {entry.target.classList.add('hp-visible');observer.unobserve(entry.target);}
      });
    }, {threshold:0.12,rootMargin:'0px 0px -10px 0px'});
    revealElements.forEach(function (element, index) {
      element.classList.add('hp-reveal');
      element.style.setProperty('--hp-delay', (index % 3) * 65 + 'ms');
      observer.observe(element);
    });
    root.classList.toggle('hp-motion', !motion.matches);
    motion.addEventListener('change', function () {root.classList.toggle('hp-motion', !motion.matches);});
  }

  root.querySelectorAll('.hp-map,.hp-service').forEach(function (element) {
    let frame = null;
    element.addEventListener('pointermove', function (event) {
      if (motion.matches || !finePointer.matches) return;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const bounds = element.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        element.style.setProperty('--hp-rx', (-y * 5).toFixed(2) + 'deg');
        element.style.setProperty('--hp-ry', (x * 5).toFixed(2) + 'deg');
        frame = null;
      });
    }, {passive:true});
    element.addEventListener('pointerleave', function () {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      element.style.setProperty('--hp-rx', '0deg');
      element.style.setProperty('--hp-ry', '0deg');
    });
  });
  applyLanguage();
  applyTheme();
  measureHeader();
  document.fonts.ready.then(measureHeader);
})();
