(() => {
  'use strict';
  const journey=document.querySelector('.hp-journey-section');
  if(!journey)return;
  const buttons=[...journey.querySelectorAll('.hp-journey-stop')];
  const panels=[...journey.querySelectorAll('.hp-journey-panel')];
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let motion;
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true')return;
    buttons.forEach((item,i)=>item.setAttribute('aria-pressed',String(i===index)));
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    motion?.cancel();
    if(!reduced.matches)motion=panels[index].animate([
      {opacity:.45,transform:'translateY(8px)'},
      {opacity:1,transform:'translateY(0)'}
    ],{duration:280,easing:'cubic-bezier(.16,1,.3,1)'});
  }));
  reduced.addEventListener('change',()=>motion?.cancel());
})();
