(() => {
 const nav=document.querySelector('.hp-section-dots');if(!nav)return;
 const links=[...nav.querySelectorAll('a')];
 if(/^\/en(?:\/|$)/.test(location.pathname)){nav.setAttribute('aria-label','Site sections');const names=['Home','Services','My work','Tools','Workflow','Journey','Contact'];links.forEach((a,i)=>{a.setAttribute('aria-label',names[i]);a.querySelector('span').textContent=names[i];});}
 const sections=links.map(a=>{const section=document.querySelector(a.getAttribute('href'));return section.id==='brand-preview'?section.closest('.hp-brands-section'):section;});
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const phone=matchMedia('(max-width:700px)');
 const ruler=document.querySelector('.hp-side-rail');
 function switchNavigation(){
  nav.inert=!phone.matches;
  if(ruler)ruler.inert=phone.matches;
 }
 phone.addEventListener('change',switchNavigation);switchNavigation();
 let tops=[],frame=0,current=-1;
 function measure(){tops=sections.map(section=>section.getBoundingClientRect().top+scrollY);update();}
 function update(){frame=0;let probe=scrollY+innerHeight*.3,index=0;for(let i=0;i<tops.length;i++)if(tops[i]<=probe)index=i;if(index===current)return;current=index;nav.style.setProperty('--hp-dot-index',index);links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 links.forEach((a,i)=>a.addEventListener('click',event=>{event.preventDefault();sections[i].scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});history.replaceState(null,'',a.getAttribute('href'));}));
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 addEventListener('resize',measure,{passive:true});
 document.fonts.ready.then(measure);addEventListener('load',measure,{once:true});
 new ResizeObserver(measure).observe(document.querySelector('main'));
 measure();
})();
