(() => {
  const stage = document.querySelector('.hp-brand-stage');
  if (!stage) return;
  const rows = [...stage.querySelectorAll('.hp-brand-row')].map((element, row) => ({element, cards:[...element.querySelectorAll('.hp-ref-brand-card')], index:row*8, phase:0, stride:334, radius:3, hovered:false, focused:false, dragging:false}));
  const counter=stage.querySelector('.hp-brand-stage-counter');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const cardStates=new WeakMap();
  let visible=false,timer,last=0,keyboard=false;
  const paused=row=>row.hovered||row.focused||row.dragging;
  function tick(time){
    const delta=last?Math.min(50,time-last):0;last=time;
    rows.forEach((row,i)=>{
      if(paused(row))return;
      row.phase+=(i%2?-1:1)*delta*42/1000/row.stride;
      if(row.phase>=1){row.index=(row.index+1)%row.cards.length;row.phase-=1;}
      if(row.phase<=-1){row.index=(row.index-1+row.cards.length)%row.cards.length;row.phase+=1;}
      render(row);
    });
    timer=requestAnimationFrame(tick);
  }
  function auto(){cancelAnimationFrame(timer);last=0;const running=rows.some(row=>!paused(row))&&visible&&!document.hidden&&!reduced.matches;stage.classList.toggle('is-brand-gliding',running);if(running)timer=requestAnimationFrame(tick);}
  document.addEventListener('keydown',()=>keyboard=true);
  document.addEventListener('pointerdown',()=>keyboard=false);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;auto();},{threshold:.15}).observe(stage);
  document.addEventListener('visibilitychange',auto);reduced.addEventListener('change',auto);
  if(/^\/en(?:\/|$)/.test(location.pathname)){rows.forEach((row,i)=>row.element.setAttribute('aria-label',`Brand row ${i+1}`));stage.querySelectorAll('.hp-ref-brand-visit').forEach(a=>a.setAttribute('aria-label',`Visit ${a.closest('li').querySelector('strong').textContent} website`));stage.querySelector('[data-move="-1"]').setAttribute('aria-label','Previous brands');stage.querySelector('[data-move="1"]').setAttribute('aria-label','Next brands');}
  function render(row) {
    row.cards.forEach((card,index) => {
      let offset=(index-row.index-row.phase+row.cards.length)%row.cards.length;
      if(offset>row.cards.length/2) offset-=row.cards.length;
      const active=Math.abs(offset)<.5;
      const shown=Math.abs(offset)<=row.radius;
      const tabbable=Math.abs(offset)<=1;
      let previous=cardStates.get(card);
      if(!previous){previous={button:card.querySelector('button'),link:card.querySelector('a')};cardStates.set(card,previous);}
      if(shown) card.style.transform=`translate3d(calc(-50% + ${offset*row.stride}px),0,0)`;
      const button=previous.button;
      if(previous.active!==active){
        card.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',String(active));
        previous.link.tabIndex=active?0:-1;
      }
      if(previous.shown!==shown){
        card.classList.toggle('is-offstage',!shown);
        card.setAttribute('aria-hidden',String(!shown));
      }
      if(previous.tabbable!==tabbable) button.tabIndex=tabbable?0:-1;
      previous.active=active;previous.shown=shown;previous.tabbable=tabbable;
    });
    const label=`${String(rows[0].index+1).padStart(2,'0')} / ${rows[0].cards.length}`;
    if(counter.textContent!==label) counter.textContent=label;
  }
  rows.forEach(row => {
    row.element.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){row.hovered=true;auto();}});
    row.element.addEventListener('pointerleave',()=>{row.hovered=false;auto();});
    row.element.addEventListener('focusin',()=>{if(keyboard){row.focused=true;auto();}});
    row.element.addEventListener('keydown',()=>{row.focused=true;auto();});
    row.element.addEventListener('focusout',event=>{if(!row.element.contains(event.relatedTarget)){row.focused=false;auto();}});
    row.cards.forEach((card,index)=>card.querySelector('button').addEventListener('click',()=>{row.index=index;row.phase=0;render(row);}));
    row.element.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      row.index=event.key==='Home'?0:event.key==='End'?row.cards.length-1:(row.index+(event.key==='ArrowRight'?1:-1)+row.cards.length)%row.cards.length;
      row.phase=0;render(row);row.cards[row.index].querySelector('button').focus({preventScroll:true});
    });
    let down=null,dragged=false;
    row.element.addEventListener('pointerdown',event=>{if(event.target.closest('a'))return;row.dragging=true;auto();down={x:event.clientX,y:event.clientY,index:row.index,phase:row.phase};dragged=false;});
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
    function finishDrag(event){
      if(!down)return;down=null;row.dragging=false;
      if(event.pointerType!=='mouse')row.hovered=false;auto();
    }
    row.element.addEventListener('pointerup',finishDrag);
    document.addEventListener('pointerup',finishDrag);
    row.element.addEventListener('pointercancel',()=>{down=null;row.dragging=false;row.hovered=false;auto();});
    row.element.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
  });
  stage.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>{
    const direction=Number(button.dataset.move);
    rows.forEach((row,index)=>{row.index=(row.index+(index%2?-direction:direction)+row.cards.length)%row.cards.length;row.phase=0;render(row);});
  }));
  function measure(){rows.forEach(row=>{row.stride=parseFloat(getComputedStyle(row.cards[0]).width)+parseFloat(getComputedStyle(stage).getPropertyValue('--hp-card-gap'));row.radius=Math.ceil(stage.clientWidth/(2*row.stride))+.5;render(row);});}
  new ResizeObserver(measure).observe(stage);
  document.fonts.ready.then(measure);
  measure();
})();
