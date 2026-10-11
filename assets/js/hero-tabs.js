(() => {
  const english = /^\/en(?:\/|$)/.test(location.pathname);
  const hero=document.querySelector('.hp-choice-hero');
  if(!hero)return;
  const content={
    ar:{ads:[['◎','الهدف والجمهور','بداية واضحة للحملة'],['↗','ميزانية وكرياتيف','متابعة عناصر الأداء'],['▥','قراءة النتائج','بيانات تحدد الخطوة التالية']],tracking:[['⌁','أحداث التحويل','مراجعة الإعدادات'],['▥','دقة البيانات','فهم فروقات التقارير'],['✓','ربط المنصات','GTM · GA4 · Pixels']],site:[['▧','عرض النشاط','واجهة بسيطة وواضحة'],['↗','تجربة التصفح','متجر مناسب للفون'],['☑','التواصل والشراء','خطوة تالية سهلة']]},
    en:{ads:[['◎','Goal & audience','A clear campaign starting point'],['↗','Budget & creative','Review the campaign essentials'],['▥','Read the results','Data informs the next step']],tracking:[['⌁','Conversion events','Review the setup'],['▥','Data accuracy','Understand reporting differences'],['✓','Connect platforms','GTM · GA4 · Pixels']],site:[['▧','Show the business','A clear and simple interface'],['↗','Browsing experience','A store that works on mobile'],['☑','Contact & checkout','An easy next step']]}
  };
  const tabs=[...hero.querySelectorAll('[role="tab"]')];
  if(english){hero.querySelector('[role="tablist"]').setAttribute('aria-label','Request type');hero.querySelector('.hp-choice-profile img').alt='Mohamed Salah Hegazy';}
  const names=english?['Ads','Tracking','Website']:['إعلانات','تراكنج','موقع'];
  hero.querySelector('h1').textContent=english?'Mohamed Salah Hegazy — Media Buyer & Tracking Specialist':'محمد صلاح حجازي — ميديا باير وتراكنج';
  hero.querySelector('.hp-choice-badge').textContent=english?'Media Buying · Tracking':'ميديا باينج · تراكنج';
  const actions=hero.querySelectorAll('.hp-choice-actions a');
  actions[0].firstChild.textContent=english?'Let’s talk ':'ابدأ كلام معايا ';
  actions[1].firstChild.textContent=english?'Download CV ':'حمّل الـCV ';
  function select(tab){
    tabs.forEach(button=>{const selected=button===tab;button.classList.toggle('is-selected',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    const values=content[english?'en':'ar'][tab.dataset.service];
    hero.querySelectorAll('.tab-scene article').forEach((card,i)=>{card.querySelector('.symbol').textContent=values[i][0];card.querySelector('strong').textContent=values[i][1];card.querySelector('p').textContent=values[i][2];});
  }
  tabs.forEach((tab,i)=>{const label=tab.querySelector('.hp-service-tab-label')||tab;label.textContent=names[i];tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[index]);tabs[index].focus();});});
  select(tabs[0]);
})();
