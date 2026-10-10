import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const hooks = new Map(), styleHooks = new Map();
let columns = 'none';
const node = () => ({hidden:false,inert:false,attrs:new Map(),classes:new Set(),
  classList:{toggle(){}},setAttribute(k,v){this.attrs.set(k,v)},removeAttribute(k){this.attrs.delete(k)},
  getAttribute(k){return this.attrs.get(k)},addEventListener(){}});
const items = Array.from({length:24},()=>{const item=node(),link=node();item.querySelector=()=>link;return item});
const list={children:items,addEventListener(){}};
const button=node(),labels=node(),panel=node();
panel.querySelector=selector=>selector==='.hp-brand-list'?list:selector==='.hp-brands-toggle'?button:labels;
const stylesheet={addEventListener:(name,fn)=>styleHooks.set(name,fn)};
const document={documentElement:{lang:'ar'},querySelector:selector=>selector==='.hp-tracking-brands'?panel:null,querySelectorAll:()=>[stylesheet]};
const window={matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(n,f)=>hooks.set(n,f)};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/brand-disclosure.js',import.meta.url),'utf8'),
  {document,window,getComputedStyle:()=>({gridTemplateColumns:columns}),requestAnimationFrame:fn=>fn()});
assert.equal(items.filter(e=>!e.hidden&&!e.inert).length,2);
columns='100px 100px 100px 100px 100px';
assert.equal(typeof styleHooks.get('load'),'function','Brand rows must respond to asynchronous CSS');
styleHooks.get('load')();
assert.equal(items.filter(e=>!e.hidden&&!e.inert).length,10,'Desktop shows two complete rows after CSS arrives');
assert.equal(items.filter(e=>!e.hidden&&e.inert).length,5,'Third row remains the faded preview');
columns='140px 140px';hooks.get('load')();
assert.equal(items.filter(e=>!e.hidden&&!e.inert).length,4,'Phone has two complete rows');
console.log('PASS: brands recover the correct visible rows after asynchronous stylesheet loading.');
