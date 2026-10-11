(() => {
  'use strict';
  const value=document.getElementById('hp-message-kind');
  const choices=[...document.querySelectorAll('.hp-kind-picker input[type=radio]')];
  if(!value||!choices.length)return;
  choices.forEach(choice=>choice.addEventListener('change',()=>{if(!choice.checked)return;value.value=choice.value;value.dispatchEvent(new Event('change',{bubbles:true}));}));
  value.addEventListener('change',()=>choices.forEach(choice=>{choice.checked=choice.value===value.value;}));
})();
