(() => {
  'use strict';
  const trigger = document.getElementById('hp-platform-trigger');
  if (!trigger) return;
  const wrapper = trigger.parentElement;
  const panel = document.getElementById('hp-platform-popover');
  const grid = panel.querySelector('.hp-platform-logo-grid');
  const prefix = /^\/en(?:\/|$)/.test(location.pathname) ? '../' : '';
  const seen = new Set();
  document.querySelectorAll('#hp-toolkit .hp-tool-chips>[data-brand]').forEach(chip => {
    const use = chip.querySelector('use');
    const symbol = use?.getAttribute('href');
    if (!symbol || seen.has(symbol)) return;
    seen.add(symbol);
    const item = document.createElement('span');
    item.className = 'hp-platform-logo';
    item.style.setProperty('--hp-brand',chip.style.getPropertyValue('--hp-brand'));
    const icon = chip.querySelector('svg').cloneNode(true);
    const name = document.createElement('span');
    name.textContent = chip.textContent;
    item.append(icon,name);
    grid.append(item);
  });
  const clarity = document.createElement('span');
  clarity.className = 'hp-platform-logo';
  const image = document.createElement('img');
  image.src = prefix+'assets/clarity-app-icon.png';
  image.alt = '';
  const name = document.createElement('span');
  name.textContent = 'Clarity';
  clarity.append(image,name);
  grid.append(clarity);
  let closeTimer;
  function setOpen(open) {
    clearTimeout(closeTimer);
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded',String(open));
  }
  wrapper.addEventListener('pointerenter',event => {if(event.pointerType==='mouse')setOpen(true);});
  wrapper.addEventListener('pointerleave',event => {if(event.pointerType==='mouse')closeTimer=setTimeout(()=>{if(!wrapper.contains(document.activeElement))setOpen(false);},160);});
  trigger.addEventListener('click',()=>setOpen(panel.hidden));
  trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);}});
  wrapper.addEventListener('focusout',()=>{setTimeout(()=>{if(!wrapper.contains(document.activeElement))setOpen(false);},0);});
  document.addEventListener('pointerdown',event=>{if(!wrapper.contains(event.target))setOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){setOpen(false);trigger.focus();setOpen(false);}});
  function localize(){trigger.setAttribute('aria-label',document.documentElement.lang==='en'?'Show platforms and tools':'عرض المنصات والأدوات');}
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  localize();
})();
