(() => {
 const ids=['hp-home','hp-services','hp-tracking-work','brand-preview','hp-toolkit','hp-method','hp-experience','hp-contact'];
 const main=document.querySelector('#hp-main');if(!main)return;
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('is-in-view',isIntersecting)),{threshold:.2});
 ids.slice(1).forEach(id=>{
  const section=document.getElementById(id);if(!section)return;
  const separator=document.createElement('div');separator.className='hp-section-connector';separator.setAttribute('aria-hidden','true');separator.dataset.before=id;
  for(let i=0;i<9;i++){const dot=document.createElement('i');dot.style.setProperty('--dot',i);separator.append(dot);}
  // The merged journey and contact each keep their own section boundary.
  const target=id==='brand-preview'?section.closest('.hp-brands-section'):section;
  target.classList.add('hp-after-connector');
  target.previousElementSibling?.classList.add('hp-before-connector');
  target.before(separator);observer.observe(separator);
 });
})();
