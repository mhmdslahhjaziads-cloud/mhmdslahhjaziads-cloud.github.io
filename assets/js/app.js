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
  preferences.language = /^\/en(?:\/|$)/.test(location.pathname) ? 'en' : 'ar';
  const assetPrefix = preferences.language === 'en' ? '../' : '';
  let scrollQueued = false;
  let letterFrame = null;
  let letterGroups = [];

  function animateLetters() {
    let moving = false;
    const targets = letterGroups.map(group => parseFloat(group.label.style.getPropertyValue('--hp-label-y')) || 0);
    const next = window.HegazyLetterTrain.step(letterGroups.map(group=>group.letters.map(letter=>letter.y)),targets,root.querySelector('.hp-moving-labels').clientHeight,motion.matches);
    letterGroups.forEach((group, groupIndex) => {
      const target = parseFloat(group.label.style.getPropertyValue('--hp-label-y')) || 0;
      group.letters.forEach((letter, index) => {
        letter.y = next[groupIndex][index];
        if (Math.abs(target - letter.y) > .15) moving = true;
        letter.element.style.setProperty('--hp-letter-y', letter.y.toFixed(2)+'px');
        const bend = motion.matches ? 0 : Math.max(-1,Math.min(1,(letter.y-target)/75));
        const width = group.width || 80;
        const center = (index + .5) / group.letters.length * width;
        const horizontal = preferences.language === 'en' ? (width - center) * Math.abs(bend) : center * Math.abs(bend);
        letter.element.style.setProperty('--hp-letter-x',horizontal.toFixed(2)+'px');
        letter.element.style.setProperty('--hp-letter-turn',(-75 * bend).toFixed(2)+'deg');
        letter.element.style.setProperty('--hp-letter-origin', (preferences.language === 'en' ? center : width-center).toFixed(2)+'px 50%');
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
    if (window.innerWidth <= 700) return;
    root.querySelectorAll('.hp-moving-labels > span').forEach((label, labelIndex) => {
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
        group.letters.push({element:slice,y:parseFloat(label.style.getPropertyValue('--hp-label-y')) || labelIndex * Math.min(40,root.querySelector('.hp-moving-labels').clientHeight/railLinks.length)});
      });
      letterGroups.push(group);
    });
    measureLetterColumn();
    queueLetters();
  }

  function measureLetterColumn() {
    if (window.innerWidth <= 700) return;
    // Reserve only the space the section names need, including the active font.
    letterGroups.forEach(group => {group.width = group.label.offsetWidth;});
    const columnWidth = Math.ceil(Math.max(0, ...letterGroups.map(group => group.width)) * 1.1 + 4);
    document.documentElement.style.setProperty('--hp-letter-column-width', columnWidth + 'px');
  }

  const platformLogos = {'Meta':'meta','Google Ads':'googleads','Google Tag Manager':'googletagmanager','GTM':'googletagmanager','GA4':'googleanalytics','Google Analytics 4':'googleanalytics','TikTok':'tiktok','Snapchat':'snapchat','YouTube':'youtube','Shopify':'shopify','WooCommerce':'woocommerce','WordPress':'wordpress','Salla':'salla','Zid':'zid','Excel':'excel','Google Sheets':'googlesheets','Notion':'notion','ChatGPT':'openai','Claude':'claude'};
  const platformPattern = new RegExp('(?<![A-Za-z])(' + Object.keys(platformLogos).sort((a,b)=>b.length-a.length).join('|') + ')(?![A-Za-z])', 'g');
  function decoratePlatformMentions() {
    root.querySelectorAll('p[data-ar][data-en]').forEach(paragraph => {
      const text = paragraph.textContent;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const match of text.matchAll(platformPattern)) {
        fragment.append(document.createTextNode(text.slice(cursor,match.index)));
        const mention = document.createElement('span');
        mention.className = 'hp-inline-brand';
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('class','hp-brand-icon');
        svg.setAttribute('viewBox','0 0 24 24');
        svg.setAttribute('aria-hidden','true');
        const use = document.createElementNS('http://www.w3.org/2000/svg','use');
        use.setAttribute('href',assetPrefix+'assets/brand-icons.svg#brand-'+platformLogos[match[0]]);
        svg.append(use);
        mention.append(svg,document.createTextNode(match[0]));
        fragment.append(mention);
        cursor = match.index + match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(cursor)));
      paragraph.replaceChildren(fragment);
    });
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
    languageButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></svg><span>' + (english ? 'العربية' : 'English') + '</span>';
    languageButton.setAttribute('aria-label', english ? 'Switch to Arabic' : 'Switch to English');
    dockLanguage.textContent = english ? 'العربية ↗' : 'EN ↗';
    dockLanguage.setAttribute('aria-label', languageButton.getAttribute('aria-label'));
    dockPanel.setAttribute('aria-label', english ? 'Side navigation' : 'القائمة الجانبية');
    root.querySelector('.hp-side-rail').setAttribute('aria-label', english ? 'Section progress' : 'مؤشر أقسام الموقع');
    railLinks.forEach(link => {const menuLink = root.querySelector('.hp-dock-panel a[href="'+link.getAttribute('href')+'"]'); if (menuLink) link.setAttribute('aria-label', menuLink.textContent);});
    navigation.setAttribute('aria-label', english ? 'Site navigation' : 'أقسام الموقع');
    root.setAttribute('aria-label', english ? 'Mohamed Salah Hegazy portfolio' : 'موقع محمد صلاح حجازي');
    root.querySelector('.hp-map')?.setAttribute('aria-label', english ? 'Workflow from advertising to optimization' : 'مسار عمل من الإعلان إلى التحسين');
    const campaignCTA = root.querySelector('#hp-campaign-cta');
    if (campaignCTA) campaignCTA.href = 'https://wa.me/201558272805?text=' + encodeURIComponent(campaignCTA.getAttribute('data-message-' + language));
    const emailCTA = root.querySelector('.hp-email-cta');
    if (emailCTA) emailCTA.href = 'mailto:mhmdslahhjazi.ads@gmail.com?subject=' + encodeURIComponent(emailCTA.getAttribute('data-subject-' + language)) + '&body=' + encodeURIComponent(emailCTA.getAttribute('data-body-' + language));
    document.title = english ? 'Mohamed Salah Hegazy | Performance Marketing & Tracking' : 'محمد صلاح حجازي | Performance Marketing & Tracking';
    document.querySelector('meta[name="description"]').content = english
      ? 'Mohamed Salah Hegazy — performance marketing, account management, tracking and data accuracy for e-commerce. Explore my experience and get in touch.'
      : 'محمد صلاح حجازي — التسويق بالأداء، إدارة الحسابات، ومتابعة التتبّع ودقة البيانات للتجارة الإلكترونية. اكتشف خبرتي وأدواتي وتواصل معي.';
    decoratePlatformMentions();
    prepareLetterMotion();
    updateRouteMenu();
    updateControlLabels();
  }

  function applyTheme() {
    const dark = preferences.theme === 'dark';
    document.documentElement.dataset.appearance = preferences.theme;
    root.dataset.appearance = preferences.theme;
    document.body.classList.toggle('hp-dark', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#0b0e11' : '#f6f3ec';
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
    if (window.matchMedia('(max-width: 1300px), (hover: none) and (pointer: coarse)').matches) {setDock(open);return;}
    navigation.classList.toggle('hp-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    syncMenuAccess();
    updateControlLabels();
  }
  function syncMenuAccess() {
    navigation.inert = window.matchMedia('(max-width: 1300px), (hover: none) and (pointer: coarse)').matches && menuButton.getAttribute('aria-expanded') !== 'true';
  }
  window.addEventListener('resize', syncMenuAccess, {passive:true});
  syncMenuAccess();

  languageButton.addEventListener('click', function () {
    preferences.language = preferences.language === 'ar' ? 'en' : 'ar';
    window.HegazyPreferences.savePreferences(storage, preferences);
    location.href = (preferences.language === 'en' ? '/en/' : '/') + location.search + location.hash;
  });
  themeButton.addEventListener('click', function () {
    preferences.theme = preferences.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    window.HegazyPreferences.savePreferences(storage, preferences);
  });
  menuButton.addEventListener('click', function () {setMenu(menuButton.getAttribute('aria-expanded') !== 'true');});
  function setDock(open) {
    dockOpen = open;
    dockPanel.hidden = !dockOpen;
    root.classList.toggle('hp-dock-open', dockOpen);
    dockButton.setAttribute('aria-expanded', String(dockOpen));
    menuButton.setAttribute('aria-expanded', String(dockOpen));
    syncMenuAccess();
    if (dockOpen) updateRouteMenu();
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
    if (event.key === 'Escape' && dockOpen) {setDock(false);(docked?dockButton:menuButton).focus();}
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', function (event) {
    const path = event.composedPath();
    if (!path.includes(dockPanel) && !path.includes(dockButton) && !path.includes(languageButton) && !path.includes(themeButton) && !path.includes(menuButton)) setDock(false);
    if (!event.target.closest('.hp-nav') && !path.includes(dockPanel)) setMenu(false);
  });

  let routeActive = 'hp-home';
  function updateRouteMenu(section) {
    if (section) routeActive = section === 'hp-background' ? 'hp-experience' : section === 'brand-preview' ? 'hp-tracking-work' : section;
    const links = [...dockPanel.querySelectorAll('.hp-route-link')];
    if (!links.length) return;
    const chosen = links.find(link => link.getAttribute('href') === '#'+routeActive) || links[0];
    links.forEach(link => {
      const selected = link === chosen;
      link.classList.toggle('hp-route-selected',selected);
      if (selected) link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    });
    dockPanel.querySelector('.hp-route-current').textContent = chosen.querySelector('small').textContent+' / '+chosen.querySelector('span').textContent;
  }

  function updateScroll() {
    // All geometry reads precede style writes. Hidden phone labels need no layout work.
    const showLetters = window.innerWidth > 700;
    const sectionTops = new Map();
    railLinks.forEach(link => {const id=link.dataset.section;const target=document.getElementById(id);const section=id==='brand-preview'?target.closest('.hp-brands-section'):target;if(!sectionTops.has(id))sectionTops.set(id,section.getBoundingClientRect().top+window.scrollY);});
    const labels = root.querySelector('.hp-moving-labels');
    const labelBounds = showLetters ? labels.getBoundingClientRect() : null;
    const labelItems = showLetters ? [...labels.querySelectorAll(':scope > span')] : [];
    const ruler = window.HegazyRuler.layout({documentHeight:document.documentElement.scrollHeight,viewportHeight:window.innerHeight,scrollY:window.scrollY,railHeight:labelBounds?.height || 0,sectionTops:[...railLinks].map(link=>sectionTops.get(link.dataset.section))});
    const progress = ruler.progress;
    root.style.setProperty('--hp-progress', progress.toFixed(4));
    const percent = String(Math.round(progress * 100)).padStart(3, '0') + '%';
    root.querySelectorAll('.hp-progress-value,.hp-mobile-progress').forEach(value => {value.textContent = percent;});
    root.style.setProperty('--hp-view-size', (ruler.bandSize * 100) + '%');
    root.style.setProperty('--hp-view-start', (ruler.bandStart * 100) + '%');
    header.classList.toggle('hp-scrolled', window.scrollY > 20);
    const nextDocked = window.scrollY > (docked ? 16 : 48);
    if (nextDocked !== docked) {
      docked = nextDocked;
      if (!docked) setDock(false);
      root.classList.toggle('hp-docked', docked);
      header.querySelectorAll('.hp-identity,.hp-links,.hp-controls,.hp-contact').forEach(el=>{el.inert=docked;});
      dockButton.hidden = !docked;
      dockButton.tabIndex = docked ? 0 : -1;
      if (!dockOpen) setMenu(false);
      if (!docked && motion.matches) requestAnimationFrame(measureHeader);
    }
    const active = railLinks[ruler.activeIndex].dataset.section;
    railLinks.forEach(link=>{const selected=link.dataset.section===active;link.classList.toggle('hp-rail-active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    let previousLabelY = -40;
    const labelGap = Math.min(40, (labelBounds?.height || 0) / Math.max(1,labelItems.length));
    labelItems.forEach((label,index)=>{
      const selected = label.dataset.labelSection === active;
      label.classList.toggle('hp-label-current',selected);
      const sectionTop = sectionTops.get(label.dataset.labelSection) - window.scrollY;
      const y = Math.max(index * labelGap, previousLabelY + labelGap, Math.min(labelBounds.height - (labelItems.length-index)*labelGap, sectionTop-labelBounds.top));
      previousLabelY = y;
      label.style.setProperty('--hp-label-y',y+'px');
    });
    if (showLetters) queueLetters();
    updateRouteMenu(active);
    scrollQueued = false;
  }
  window.addEventListener('scroll', function () {
    if (!scrollQueued) {scrollQueued = true;requestAnimationFrame(updateScroll);}
  }, {passive:true});
  function measureHeader() {
    if (window.innerWidth > 700 && !letterGroups.length) prepareLetterMotion();
    measureLetterColumn();
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
  new ResizeObserver(measureHeader).observe(root.querySelector('main'));
  document.fonts.ready.then(measureHeader);
  header.addEventListener('transitionend', event => {
    if (event.target === header && event.propertyName === 'width' && !docked) measureHeader();
  });

  // Keep every toolkit visible at every breakpoint; folders stack on phones.
  root.querySelectorAll('#hp-toolkit .hp-tool-group').forEach((group, index) => {
    const panel = document.createElement('div');
    panel.className = 'hp-tool-panel';
    panel.id = 'hp-tool-panel-' + index;
    const inner = document.createElement('div');
    inner.className = 'hp-tool-panel-inner';
    const chips = group.querySelector('.hp-tool-chips');
    chips.before(panel);
    inner.append(chips);
    panel.append(inner);
  });

  const revealElements = root.querySelectorAll('.hp-section-heading,.hp-service,.hp-tool-group,.hp-job,.hp-education,.hp-callout,.hp-reference-heading,.hp-method-card,.hp-background-story,.hp-background-note,.hp-experience-heading,#hp-contact');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {entry.target.classList.add('hp-visible');observer.unobserve(entry.target);}
      });
    }, {threshold:0.12,rootMargin:'0px 0px -10px 0px'});
    revealElements.forEach(function (element, index) {
      element.classList.add('hp-reveal');
      const methodIndex = element.classList.contains('hp-method-card') ? Array.from(element.parentElement.children).indexOf(element) : -1;
      element.style.setProperty('--hp-delay', (methodIndex >= 0 ? methodIndex * 120 : (index % 3) * 65) + 'ms');
      observer.observe(element);
    });
    root.classList.toggle('hp-motion', !motion.matches);
    motion.addEventListener('change', function () {root.classList.toggle('hp-motion', !motion.matches);});
  }

  root.querySelectorAll('.hp-map,.hp-service:not(.hp-service-compact),.hp-method-card,.hp-tool-group,.hp-background-story,.hp-background-note').forEach(function (element) {
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
  // Repeat the compact strip far enough to fill any viewport, then duplicate
  // that complete group so the horizontal loop never reveals an empty edge.
  const platformStrip = root.querySelector('.hp-tools-strip');
  const platformTrack = root.querySelector('.hp-platform-track');
  const platformSet = platformTrack.querySelector('.hp-platform-set');
  const platformItems = [...platformSet.children].map(item => item.cloneNode(true));
  function fillPlatformStrip() {
    if (!platformStrip.clientWidth) return;
    platformSet.replaceChildren(...platformItems.map(item => item.cloneNode(true)));
    if (!motion.matches) {
      while (platformSet.offsetWidth < platformStrip.clientWidth + 120) {
        platformItems.forEach(item => {
          const copy = item.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          platformSet.append(copy);
        });
      }
    }
    const duplicate = platformSet.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    platformTrack.lastElementChild.replaceWith(duplicate);
    platformTrack.style.setProperty('--hp-marquee-duration', (platformSet.offsetWidth / 38) + 's');
  }
  new ResizeObserver(fillPlatformStrip).observe(platformStrip);
  motion.addEventListener('change', fillPlatformStrip);
  document.fonts.ready.then(fillPlatformStrip);
  fillPlatformStrip();
  applyLanguage();
  applyTheme();
  measureHeader();
  document.fonts.ready.then(measureHeader);
})();
