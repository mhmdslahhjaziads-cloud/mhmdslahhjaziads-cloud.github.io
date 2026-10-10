import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../assets/js/tracking-schedule.js',import.meta.url),'utf8');
function page(){
 const events={},frames=[],timeouts=[],idle=[],imageEvents={};let visible=false;
 const image={complete:false,addEventListener:(n,fn)=>imageEvents[n]=fn};
 const document={readyState:'complete',querySelector:()=>image};
 const window={addEventListener:(n,fn)=>events[n]=fn,requestAnimationFrame:fn=>frames.push(fn),setTimeout:fn=>timeouts.push(fn),requestIdleCallback:fn=>idle.push(fn)};
 vm.runInNewContext(code,{window,document});
 return {window,events,frames,timeouts,idle,imageEvents};
}
let p=page(),calls=[];
assert.equal(typeof p.window.hpAfterFirstPaint,'function','Tracking must have a paint-aware scheduler');
p.window.hpAfterFirstPaint(()=>calls.push('ga'));p.window.hpAfterFirstPaint(()=>calls.push('meta'));
assert.deepEqual(calls,[],'No heavy network work before the initial image is available');
p.imageEvents.load();p.frames.shift()();assert.deepEqual(calls,[]);p.frames.shift()();p.idle.shift()();
assert.deepEqual(calls,['ga','meta'],'All registered tags load after initial paint in original order');
p.events.pointerdown();p.timeouts.forEach(fn=>fn());assert.equal(calls.length,2,'Fallback and interaction never load twice');
p.window.hpAfterFirstPaint(()=>calls.push('clarity'));assert.equal(calls.length,3,'Late registration still runs');
p=page();calls=[];p.window.hpAfterFirstPaint(()=>calls.push('ga'));p.events.keydown();assert.deepEqual(calls,['ga'],'Early keyboard interaction flushes before navigation');
p=page();calls=[];p.window.hpAfterFirstPaint(()=>calls.push('ga'));p.timeouts[0]();assert.deepEqual(calls,['ga'],'Failed/slow image cannot indefinitely block analytics');
console.log('PASS tracking scheduling: initial paint, early interaction, deadline, and once-only loading');
