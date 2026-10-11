/* Each letter follows the previous frame of the letter ahead of it. */
(function (scope) {
  'use strict';
  function step(previous, targets, railHeight, reduced) {
    const end = Math.max(0,railHeight-20);
    const gap = previous.length>1 ? Math.min(24,end/(previous.length-1)) : 0;
    const next=[];
    previous.forEach((letters,groupIndex)=>{
      const target=Math.max(0,Math.min(end,targets[groupIndex]||0));
      if(reduced){next.push(letters.map(()=>target));return;}
      let leader=target;
      const values=letters.map((value,index)=>{
        const above=next[groupIndex-1];
        const phase=letters.length>1?index/(letters.length-1):0;
        const preceding=above?above[Math.round(phase*(above.length-1))]+gap:0;
        const upper=Math.max(0,end-(previous.length-groupIndex-1)*gap);
        const lower=Math.min(upper,Math.max(0,preceding));
        const y=Math.max(lower,Math.min(upper,value+(leader-value)*.38));
        leader=value;
        return y;
      });
      next.push(values);
    });
    return next;
  }
  const api={step};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else scope.HegazyLetterTrain=api;
})(typeof window==='undefined'?globalThis:window);
