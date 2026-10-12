import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../assets/js/touch-interactions.js',import.meta.url),'utf8');
function setup({touch=true,reduced=false}={}) {
  let clock=0, nextTimer=0;
  const timers=new Map(), observers=[], documentEvents={}, media=[];
  const target={classList:{values:new Set(),add(name){this.values.add(name);},remove(name){this.values.delete(name);},contains(name){return this.values.has(name);}},
    matches(){return false;},querySelectorAll(){return [];},setAttribute(){throw Error('Automatic decoration must not change button semantics');}};
  const root={querySelector(){return null;},querySelectorAll(){return [target];},addEventListener(){}};
  const document={hidden:false,documentElement:{lang:'ar'},querySelector(){return root;},addEventListener(name,fn){documentEvents[name]=fn;}};
  const context={document,matchMedia(query){const item={matches:query.includes('reduced-motion')?reduced:touch,addEventListener(name,fn){this.changed=fn;}};media.push(item);return item;},
    setTimeout(fn,delay){const id=++nextTimer;timers.set(id,{fn,at:clock+delay});return id;},clearTimeout(id){timers.delete(id);},
    IntersectionObserver:class {constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}},
    MutationObserver:class {observe(){}}};
  vm.runInNewContext(source,context);
  const enter=ratio=>observers.at(-1).callback([{target,isIntersecting:ratio>0,intersectionRatio:ratio}]);
  const advance=ms=>{const end=clock+ms;let pending;while((pending=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0])){clock=pending[1].at;timers.delete(pending[0]);pending[1].fn();}clock=end;};
  return {target,observers,media,document,documentEvents,enter,advance,active:()=>target.classList.contains('hp-touch-active')};
}
test('phone decorations start on visibility and return to rest without a tap',()=>{
  const f=setup(); assert.equal(f.observers.length,1); f.enter(.6);f.advance(100);assert.equal(f.active(),true);f.advance(1900);assert.equal(f.active(),false);
});
test('one pulse per appearance, then rearm after leaving the screen',()=>{
  const f=setup();f.enter(.6);f.advance(2000);f.enter(.8);f.advance(100);assert.equal(f.active(),false);f.enter(0);f.enter(.6);f.advance(100);assert.equal(f.active(),true);
});
test('leaving the screen cancels active and queued motion',()=>{
  const f=setup();f.enter(.6);f.enter(0);f.advance(100);assert.equal(f.active(),false);f.enter(.6);f.advance(100);assert.equal(f.active(),true);f.enter(0);assert.equal(f.active(),false);
});
test('desktop and reduced-motion preferences do not start automatic pulses',()=>{
  assert.equal(setup({touch:false}).observers.length,0);assert.equal(setup({reduced:true}).observers.length,0);
});
test('a hidden document stops motion, returning to the foreground rearms it',()=>{
  const f=setup();f.enter(.6);f.advance(100);f.document.hidden=true;f.documentEvents.visibilitychange();assert.equal(f.active(),false);f.document.hidden=false;f.documentEvents.visibilitychange();assert.equal(f.observers.length,2);f.enter(.6);f.advance(100);assert.equal(f.active(),true);
});
test('switching to reduced motion clears a pulse immediately',()=>{
  const f=setup();f.enter(.6);f.advance(100);f.media.find(m=>m!==f.media[0]).matches=true;f.media.find(m=>m!==f.media[0]).changed();assert.equal(f.active(),false);
});
