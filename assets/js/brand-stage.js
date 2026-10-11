(() => {
  const stage = document.querySelector('.hp-brand-stage');
  if (!stage) return;
  const rows = [...stage.querySelectorAll('.hp-brand-row')].map((element, row) => ({element, cards:[...element.querySelectorAll('.hp-ref-brand-card')], index:row ? 2 : 0}));
  const counter=stage.querySelector('.hp-brand-stage-counter');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let paused=false,inside=false,visible=false,timer;
  const pause=document.createElement('button');
  pause.type='button';pause.className='hp-brand-pause';pause.setAttribute('aria-pressed','false');
  stage.querySelector('.hp-brand-stage-controls').append(pause);
  function labelPause(){pause.textContent=document.documentElement.lang==='en'?(paused?'Resume':'Pause'):(paused?'تشغيل':'إيقاف');}
  function auto(){clearInterval(timer);if(paused||inside||!visible||document.hidden||reduced.matches)return;timer=setInterval(()=>{rows.forEach((row,i)=>{row.index=(row.index+(i?-1:1)+row.cards.length)%row.cards.length;render(row);});},3400);}
  pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));labelPause();auto();});
  stage.addEventListener('pointerenter',()=>{inside=true;auto();});
  stage.addEventListener('pointerleave',()=>{inside=false;auto();});
  stage.addEventListener('focusin',()=>{inside=true;auto();});
  stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget)){inside=false;auto();}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;auto();},{threshold:.15}).observe(stage);
  document.addEventListener('visibilitychange',auto);reduced.addEventListener('change',auto);
  new MutationObserver(labelPause).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});labelPause();
  if(/^\/en(?:\/|$)/.test(location.pathname)){rows.forEach((row,i)=>row.element.setAttribute('aria-label',`Brand row ${i+1}`));stage.querySelectorAll('.hp-ref-brand-visit').forEach(a=>a.setAttribute('aria-label',`Visit ${a.closest('li').querySelector('strong').textContent} website`));stage.querySelector('[data-move="-1"]').setAttribute('aria-label','Previous brands');stage.querySelector('[data-move="1"]').setAttribute('aria-label','Next brands');}
  function render(row) {
    const width=parseFloat(getComputedStyle(row.cards[0]).width);
    const gap=parseFloat(getComputedStyle(stage).getPropertyValue('--hp-card-gap'));
    row.cards.forEach((card,index) => {
      let offset=(index-row.index+row.cards.length)%row.cards.length;
      if(offset>row.cards.length/2) offset-=row.cards.length;
      card.style.setProperty('--hp-card-offset',`${offset*(width+gap)}px`);
      card.classList.toggle('is-active',offset===0);
      card.classList.toggle('is-offstage',Math.abs(offset)>2);
      card.setAttribute('aria-hidden',String(Math.abs(offset)>2));
      const button=card.querySelector('button');
      button.setAttribute('aria-pressed',String(offset===0));
      button.tabIndex=Math.abs(offset)<=1?0:-1;
      card.querySelector('a').tabIndex=offset===0?0:-1;
    });
    counter.textContent=`${String(rows[0].index+1).padStart(2,'0')} / ${rows[0].cards.length}`;
  }
  rows.forEach(row => {
    row.cards.forEach((card,index)=>card.querySelector('button').addEventListener('click',()=>{row.index=index;render(row);}));
    row.element.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      row.index=event.key==='Home'?0:event.key==='End'?row.cards.length-1:(row.index+(event.key==='ArrowRight'?1:-1)+row.cards.length)%row.cards.length;
      render(row);row.cards[row.index].querySelector('button').focus({preventScroll:true});
    });
    let down=null,dragged=false;
    row.element.addEventListener('pointerdown',event=>{if(event.target.closest('a'))return;down={x:event.clientX,y:event.clientY};dragged=false;});
    row.element.addEventListener('pointermove',event=>{if(!down)return;const dx=event.clientX-down.x,dy=event.clientY-down.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))row.element.setPointerCapture(event.pointerId);});
    row.element.addEventListener('pointerup',event=>{
      if(!down)return;const dx=event.clientX-down.x,dy=event.clientY-down.y;down=null;
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){dragged=true;row.index=(row.index+(dx<0?1:-1)+row.cards.length)%row.cards.length;render(row);}
    });
    row.element.addEventListener('pointercancel',()=>down=null);
    row.element.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
  });
  stage.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>{
    const direction=Number(button.dataset.move);
    rows.forEach((row,index)=>{row.index=(row.index+(index? -direction:direction)+row.cards.length)%row.cards.length;render(row);});
  }));
  new ResizeObserver(()=>rows.forEach(render)).observe(stage);
  document.fonts.ready.then(()=>rows.forEach(render));
  rows.forEach(render);
})();
