import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers = new Map(), documentHandlers = new Map(), scripts = [], frames = [], timers = [];
const on = (name, fn) => handlers.set(name, [...(handlers.get(name) || []), fn]);
const document = {
  documentElement: {scrollHeight:2000},
  querySelector: () => null,
  createElement: () => ({dataset:{}}),
  head: {appendChild: node => scripts.push(node)},
  addEventListener:(name,fn)=>documentHandlers.set(name,[...(documentHandlers.get(name)||[]),fn]),
};
const sandbox = {document, location:{hostname:'mhmdslahhjaziads-cloud.github.io',href:'https://mhmdslahhjaziads-cloud.github.io/'},
  URL, Date, Set, innerHeight:1000, scrollY:0, addEventListener:on,
  requestAnimationFrame:fn=>frames.push(fn), setTimeout:fn=>timers.push(fn)};
sandbox.window = sandbox;
const context = vm.createContext(sandbox);
const run = name => vm.runInContext(fs.readFileSync(new URL('../assets/js/'+name+'.js',import.meta.url),'utf8'),context);
run('tracking-schedule');
for(const name of ['google-analytics','meta-pixel','clarity']) {run(name);run(name);}
assert.equal(scripts.length,0,'Libraries must wait while configuration and events queue');
const ga = () => Array.from(sandbox.dataLayer, args=>Array.from(args));
const meta = () => Array.from(sandbox.fbq.queue,args=>Array.from(args));
assert.equal(ga().filter(x=>x[0]==='config').length,1,'One GA page-view configuration');
assert.equal(meta().filter(x=>x[2]==='PageView').length,1,'One initial Meta PageView');
for(const fn of handlers.get('hp:contact-composed')) fn({detail:{method:'whatsapp',request_type:'tracking',details:'PRIVATE_DRAFT',url:'https://private.example/'}});
assert.equal(ga().filter(x=>x[1]==='contact').length,1);
assert.equal(ga().filter(x=>x[1]==='contact_message_prepare').length,1);
assert.equal(meta().filter(x=>x[2]==='Contact').length,1);
assert.equal(meta().filter(x=>x[2]==='ContactMessagePrepare').length,1);
assert(!JSON.stringify([ga(),meta()]).includes('PRIVATE_DRAFT'));
assert(!JSON.stringify([ga(),meta()]).includes('private.example'));
const queued = JSON.stringify([ga(),meta()]);
for(const fn of handlers.get('pointerdown')) fn({});
assert.equal(scripts.length,3,'Early interaction releases all three providers once');
timers.forEach(fn=>fn());
assert.equal(scripts.length,3);
assert.equal(JSON.stringify([ga(),meta()]),queued,'Loading must preserve the exact queued events');
assert.equal(new Set(scripts.map(x=>x.src)).size,3);
console.log('PASS: queued initial PageView/contact events, privacy, early flush, and provider duplicate prevention.');
