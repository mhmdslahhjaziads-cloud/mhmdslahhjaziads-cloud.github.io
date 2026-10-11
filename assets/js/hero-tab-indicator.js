(() => {
 document.querySelectorAll('.hp-choice-six .service-tabs,.variant-6 .tabs').forEach(tabs=>{
  const buttons=[...tabs.querySelectorAll('button')];
  const indicator=document.createElement('span');indicator.className='hp-tab-slide';indicator.setAttribute('aria-hidden','true');tabs.append(indicator);
  const ns='http://www.w3.org/2000/svg';
  const neon=document.createElementNS(ns,'svg');neon.classList.add('hp-tab-neon');neon.setAttribute('aria-hidden','true');neon.setAttribute('focusable','false');
  const ring=document.createElementNS(ns,'rect');ring.setAttribute('fill','none');ring.setAttribute('pathLength','100');neon.append(ring);tabs.append(neon);
  let frame=0;
  function update(){frame=0;const selected=buttons.find(b=>b.getAttribute('aria-selected')==='true')||buttons[0];const {offsetLeft:left,offsetTop:top,offsetWidth:width,offsetHeight:height}=selected;
   indicator.style.setProperty('--tab-left',left+'px');indicator.style.setProperty('--tab-top',top+'px');indicator.style.setProperty('--tab-width',width+'px');indicator.style.setProperty('--tab-height',height+'px');
   const w=tabs.clientWidth,h=tabs.clientHeight;neon.setAttribute('viewBox',`0 0 ${w} ${h}`);ring.setAttribute('x','1');ring.setAttribute('y','1');ring.setAttribute('width',String(w-2));ring.setAttribute('height',String(h-2));ring.setAttribute('rx',String((h-2)/2));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  new MutationObserver(schedule).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  new ResizeObserver(schedule).observe(tabs);document.fonts.ready.then(schedule);
  new IntersectionObserver(entries=>entries.forEach(e=>tabs.classList.toggle('is-neon-visible',e.isIntersecting))).observe(tabs);
  update();requestAnimationFrame(()=>tabs.classList.add('is-tab-motion-ready'));
 });
})();
