(() => {
  const stage = document.querySelector('.hp-brand-stage');
  if (!stage) return;
  const rows = [...stage.querySelectorAll('.hp-brand-row')].map((element, row) => ({element, cards:[...element.querySelectorAll('.hp-ref-brand-card')], index:row*8, phase:0, stride:334, radius:3}));
  const counter=stage.querySelector('.hp-brand-stage-counter');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let inside=false,visible=false,timer,last=0,keyboard=false;
  function tick(time){
    const delta=last?Math.min(50,time-last):0;last=time;
    rows.forEach((row,i)=>{
      row.phase+=delta*42/1000/row.stride;
      if(row.phase>=1){row.index=(row.index+1)%row.cards.length;row.phase-=1;}
      if(row.phase<=-1){row.index=(row.index-1+row.cards.length)%row.cards.length;row.phase+=1;}
      render(row);
    });
    timer=requestAnimationFrame(tick);
  }
  function auto(){cancelAnimationFrame(timer);last=0;const running=!inside&&visible&&!document.hidden&&!reduced.matches;stage.classList.toggle('is-brand-gliding',running);if(running)timer=requestAnimationFrame(tick);}
  document.addEventListener('keydown',()=>keyboard=true);
  document.addEventListener('pointerdown',()=>keyboard=false);
  stage.addEventListener('pointerenter',()=>{inside=true;auto();});
  stage.addEventListener('pointerleave',()=>{inside=false;auto();});
  stage.addEventListener('focusin',()=>{if(keyboard){inside=true;auto();}});
  stage.addEventListener('keydown',()=>{inside=true;auto();});
  stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget)){inside=false;auto();}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;auto();},{threshold:.15}).observe(stage);
  document.addEventListener('visibilitychange',auto);reduced.addEventListener('change',auto);
  if(/^\/en(?:\/|$)/.test(location.pathname)){rows.forEach((row,i)=>row.element.setAttribute('aria-label',`Brand row ${i+1}`));stage.querySelectorAll('.hp-ref-brand-visit').forEach(a=>a.setAttribute('aria-label',`Visit ${a.closest('li').querySelector('strong').textContent} website`));stage.querySelector('[data-move="-1"]').setAttribute('aria-label','Previous brands');stage.querySelector('[data-move="1"]').setAttribute('aria-label','Next brands');}
  function render(row) {
    row.cards.forEach((card,index) => {
      let offset=(index-row.index-row.phase+row.cards.length)%row.cards.length;
      if(offset>row.cards.length/2) offset-=row.cards.length;
      card.style.setProperty('--hp-card-offset',`${offset*row.stride}px`);
      const active=Math.abs(offset)<.5;
      card.classList.toggle('is-active',active);
      card.classList.toggle('is-offstage',Math.abs(offset)>row.radius);
      card.setAttribute('aria-hidden',String(Math.abs(offset)>row.radius));
      const button=card.querySelector('button');
      button.setAttribute('aria-pressed',String(active));
      button.tabIndex=Math.abs(offset)<=1?0:-1;
      card.querySelector('a').tabIndex=active?0:-1;
    });
    counter.textContent=`${String(rows[0].index+1).padStart(2,'0')} / ${rows[0].cards.length}`;
  }
  rows.forEach(row => {
    row.cards.forEach((card,index)=>card.querySelector('button').addEventListener('click',()=>{row.index=index;row.phase=0;render(row);}));
    row.element.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      row.index=event.key==='Home'?0:event.key==='End'?row.cards.length-1:(row.index+(event.key==='ArrowRight'?1:-1)+row.cards.length)%row.cards.length;
      row.phase=0;render(row);row.cards[row.index].querySelector('button').focus({preventScroll:true});
    });
    let down=null,dragged=false;
    row.element.addEventListener('pointerdown',event=>{if(event.target.closest('a'))return;inside=true;auto();down={x:event.clientX,y:event.clientY,index:row.index,phase:row.phase};dragged=false;});
    row.element.addEventListener('pointermove',event=>{
      if(!down)return;const dx=event.clientX-down.x,dy=event.clientY-down.y;
      if(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){
        dragged=true;row.element.setPointerCapture(event.pointerId);stage.classList.add('is-brand-gliding');
        row.index=down.index;row.phase=down.phase-dx/row.stride;
        while(row.phase>=1){row.index=(row.index+1)%row.cards.length;row.phase-=1;}
        while(row.phase<=-1){row.index=(row.index-1+row.cards.length)%row.cards.length;row.phase+=1;}
        render(row);
      }
    });
    row.element.addEventListener('pointerup',event=>{
      if(!down)return;down=null;stage.classList.remove('is-brand-gliding');
      if(event.pointerType!=='mouse')inside=false;auto();
    });
    row.element.addEventListener('pointercancel',()=>{down=null;inside=false;auto();});
    row.element.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
  });
  stage.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>{
    const direction=Number(button.dataset.move);
    rows.forEach((row,index)=>{row.index=(row.index+direction+row.cards.length)%row.cards.length;row.phase=0;render(row);});
  }));
  function measure(){rows.forEach(row=>{row.stride=parseFloat(getComputedStyle(row.cards[0]).width)+parseFloat(getComputedStyle(stage).getPropertyValue('--hp-card-gap'));row.radius=Math.ceil(stage.clientWidth/(2*row.stride))+.5;render(row);});}
  new ResizeObserver(measure).observe(stage);
  document.fonts.ready.then(measure);
  measure();
})();
