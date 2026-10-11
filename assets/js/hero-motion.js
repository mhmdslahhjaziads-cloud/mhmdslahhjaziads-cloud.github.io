(() => {
  const hero=document.querySelector('.hp-choice-six,.variant-6');
  if(!hero)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const cards=[...hero.querySelectorAll('.tab-scene article,.cards .card')];
  const tabs=[...hero.querySelectorAll('[role="tab"]')];
  const drawings={
    ads:[['target','<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path class="icon-detail" d="m12 12 8-8m-4 0h4v4"/>'],['trend','<path d="M4 19h16M4 19V5"/><path class="icon-detail" d="m7 14 4-4 3 2 6-7m-5 0h5v5"/>'],['bars','<path d="M3 20h18"/><rect class="icon-bar bar-1" x="5" y="12" width="3" height="8" rx=".6"/><rect class="icon-bar bar-2" x="10.5" y="8" width="3" height="12" rx=".6"/><rect class="icon-bar bar-3" x="16" y="4" width="3" height="16" rx=".6"/>']],
    tracking:[['events','<path d="M6 6h12v12H6Z" stroke-dasharray="2 3"/><circle class="icon-detail" cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/>'],['check','<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Z"/><path class="icon-check" d="m8 12 3 3 5-6"/>'],['links','<path class="icon-detail" d="m10 8 3-3a4 4 0 0 1 6 6l-3 3"/><path d="m14 16-3 3a4 4 0 0 1-6-6l3-3M9 15l6-6"/>']],
    site:[['window','<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M6 6.5h.01m3 0h.01"/><path class="icon-detail" d="M7 13h10M7 16h6"/>'],['cursor','<rect x="3" y="4" width="18" height="16" rx="3"/><path class="icon-detail" d="m9 9 8 5-4 1-1 4-3-10Z"/>'],['check','<path d="M3 4h3l2 12h10l3-9H7M10 20h.01M18 20h.01"/><path class="icon-check" d="m10 11 2 2 4-4"/>']]
  };
  function icons(){
    const active=tabs.find(t=>t.getAttribute('aria-selected')==='true');
    const type=active?.dataset.service||active?.dataset.kind||'ads';
    cards.forEach((card,i)=>{const symbol=card.querySelector('.symbol');const [kind,paths]=drawings[type][i];symbol.dataset.icon=kind;symbol.setAttribute('aria-hidden','true');symbol.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;});
  }
  function replay(card){
    if(reduced.matches)return;
    card.classList.remove('is-icon-active');
    requestAnimationFrame(()=>card.classList.add('is-icon-active'));
  }
  function change(){
    icons();
    cards.forEach((card,i)=>{
      card.getAnimations().forEach(animation=>animation.cancel());
      if(!reduced.matches)card.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:i*40,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
      replay(card);
    });
  }
  tabs.forEach(tab=>{tab.addEventListener('click',change);tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))change();});});
  cards.forEach(card=>{card.addEventListener('pointerenter',()=>{if(fine.matches)replay(card);});card.addEventListener('pointerleave',()=>card.classList.remove('is-icon-active'));});
  const photo=hero.querySelector('.hp-choice-profile img,.photo');
  let bounds,frame=0,point;
  function reset(){cancelAnimationFrame(frame);frame=0;photo.classList.remove('is-photo-active');photo.style.removeProperty('--photo-x');photo.style.removeProperty('--photo-y');}
  photo.addEventListener('pointerenter',()=>{if(reduced.matches||!fine.matches||innerWidth<=700)return;bounds=photo.getBoundingClientRect();photo.classList.add('is-photo-active');});
  photo.addEventListener('pointermove',event=>{if(!photo.classList.contains('is-photo-active'))return;point={x:event.clientX,y:event.clientY};if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const x=Math.max(-1,Math.min(1,(point.x-bounds.left)/bounds.width*2-1));const y=Math.max(-1,Math.min(1,(point.y-bounds.top)/bounds.height*2-1));photo.style.setProperty('--photo-x',`${x*4}deg`);photo.style.setProperty('--photo-y',`${-y*4}deg`);});});
  photo.addEventListener('pointerleave',reset);
  reduced.addEventListener('change',reset);
  addEventListener('resize',reset,{passive:true});
  icons();
})();
