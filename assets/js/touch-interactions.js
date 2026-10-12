/* Brief decorative feedback on each phone appearance, without activating controls. */
(() => {
  const root=document.querySelector('#hegazy-preview');
  if(!root)return;
  const touch=matchMedia('(hover: none), (pointer: coarse), (max-width: 700px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const selector='.hp-tool-group,.hp-portrait-card,.hp-portrait-frame,.hp-tracking-card,.hp-method-card,.hp-service,.hp-background-story,.hp-background-note,.hp-job,.hp-profile-note,.hp-background-tags>span,.hp-tool-chips>span[data-brand],.hp-highlight,.hp-workflow-title,.hp-framed-title,.hp-services-title,.hp-journey-heading,.hp-chat-heading,.hp-journey-stop,.hp-role-cross,.hp-opportunity-mode,.hp-market-country,.service-tabs button,.tab-scene article';
  const elements=[...root.querySelectorAll(selector)];
  const states=new WeakMap();
  const photo=root.querySelector('.hp-portrait-photo');
  let observer;
  const enabled=()=>touch.matches&&!reduced.matches&&!document.hidden;
  function state(element){if(!states.has(element))states.set(element,{played:false});return states.get(element);}
  function configurePhoto(){
    if(!photo)return;
    if(touch.matches){
      photo.setAttribute('role','button');photo.setAttribute('tabindex','0');
      photo.setAttribute('aria-label',document.documentElement.lang==='en'?'Preview portrait color':'معاينة ألوان الصورة');
      photo.setAttribute('aria-pressed',String(photo.closest('.hp-portrait-card').classList.contains('hp-touch-active')));
    }else ['role','tabindex','aria-label','aria-pressed'].forEach(name=>photo.removeAttribute(name));
  }
  function stop(element){
    const item=state(element);clearTimeout(item.start);clearTimeout(item.end);
    element.classList.remove('hp-touch-active');
    element.querySelectorAll('.is-icon-active').forEach(icon=>icon.classList.remove('is-icon-active'));
    if(element.matches('.tab-scene article'))element.classList.remove('is-icon-active');
    if(element.matches('.hp-portrait-card'))configurePhoto();
  }
  function pulse(element,delay=0){
    stop(element);
    state(element).start=setTimeout(()=>{
      if(!enabled())return;
      element.classList.add('hp-touch-active');
      if(element.matches('.tab-scene article'))element.classList.add('is-icon-active');
      if(element.matches('.hp-portrait-card'))configurePhoto();
      state(element).end=setTimeout(()=>stop(element),1600);
    },delay);
  }
  function configure(){
    observer?.disconnect();
    elements.forEach(element=>{stop(element);state(element).played=false;});
    configurePhoto();
    if(!enabled()||typeof IntersectionObserver==='undefined')return;
    observer=new IntersectionObserver(entries=>entries.forEach((entry,index)=>{
      const item=state(entry.target);
      if(!entry.isIntersecting){stop(entry.target);item.played=false;return;}
      if(entry.intersectionRatio>=.25&&!item.played){item.played=true;pulse(entry.target,Math.min(index,4)*100);}
    }),{threshold:[0,.25],rootMargin:'0px 0px -6% 0px'});
    elements.forEach(element=>observer.observe(element));
  }
  root.addEventListener('click',event=>{
    if(!enabled()||event.target.closest('a,button,summary'))return;
    const target=event.target.closest(selector);if(target)pulse(target);
  });
  photo?.addEventListener('keydown',event=>{
    if(enabled()&&(event.key==='Enter'||event.key===' ')){event.preventDefault();pulse(photo.closest('.hp-portrait-card'));}
  });
  touch.addEventListener('change',configure);reduced.addEventListener('change',configure);
  document.addEventListener('visibilitychange',configure);
  new MutationObserver(configurePhoto).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  configure();
})();
