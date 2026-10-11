import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers=new Map(),frames=new Map();
let nextId=0,intersect,offsetWrites=0;
function node(){
 const events=new Map(),classes=new Set(),styles=new Map(),attrs=new Map();
 return {events,classes,styles,attrs,tabIndex:-1,
  classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k),add:k=>classes.add(k),remove:k=>classes.delete(k)},
  style:{setProperty:(k,v)=>{styles.set(k,v);offsetWrites++;}},
  setAttribute:(k,v)=>attrs.set(k,v),addEventListener:(k,f)=>events.set(k,f),focus(){},setPointerCapture(){}};
}
const rows=Array.from({length:3},()=>{
 const row=node();row.cards=Array.from({length:24},()=>{const c=node(),button=node(),link=node();c.querySelector=s=>s==='button'?button:link;return c;});
 row.querySelectorAll=()=>row.cards;return row;
});
const stage=node(),counter={textContent:''};stage.clientWidth=1536;stage.contains=()=>false;
stage.querySelectorAll=s=>s==='.hp-brand-row'?rows:[];stage.querySelector=()=>counter;
const document={hidden:false,querySelector:()=>stage,addEventListener:(k,f)=>handlers.set(k,f),fonts:{ready:{then(){}}}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/brand-stage.js',import.meta.url),'utf8'),{
 document,location:{pathname:'/'},matchMedia:()=>({matches:false,addEventListener(){}}),
 IntersectionObserver:class{constructor(f){intersect=f;}observe(){}},ResizeObserver:class{observe(){}},
 getComputedStyle:()=>({width:'310px',getPropertyValue:()=> '24px'}),
 requestAnimationFrame:f=>{frames.set(++nextId,f);return nextId;},cancelAnimationFrame:id=>frames.delete(id)
});
let time=0;
function frame(){const [id,f]=frames.entries().next().value;frames.delete(id);f(time+=16.667);}
function offsets(){return rows.map((r,i)=>parseFloat(r.cards[i*8].styles.get('--hp-card-offset')));}
intersect([{isIntersecting:true}]);frame();
const before=offsets();offsetWrites=0;frame();
assert.ok(offsetWrites<=24,`Only visible cards should receive frame updates, got ${offsetWrites}`);
const measuredOffsetWrites=offsetWrites;
const after=offsets();assert.ok(after[0]<before[0]&&after[1]>before[1],'Outer and middle rows must move in opposite directions');
assert.equal(offsetWrites>0,true,'Visible animation must keep running');
stage.events.get('pointerenter')();assert.equal(frames.size,0,'Hover must pause');
stage.events.get('pointerleave')();assert.equal(frames.size,1,'Exit must resume');
for(let i=0;i<12000;i++)frame();
assert.ok(rows.every(r=>r.cards.filter(c=>!c.classes.has('is-offstage')).length>=6),'Every row stays filled through a full cycle');
stage.events.get('pointerenter')();
const draggedCard=rows[0].cards.find(c=>c.classes.has('is-active'));
const dragStart=parseFloat(draggedCard.styles.get('--hp-card-offset'));
rows[0].events.get('pointerdown')({target:{closest:()=>null},clientX:200,clientY:40});
rows[0].events.get('pointermove')({clientX:350,clientY:40,pointerId:1});
assert.ok(Math.abs(parseFloat(draggedCard.styles.get('--hp-card-offset'))-dragStart-150)<.01,'Dragging keeps the same visible motion');
rows[0].events.get('pointerup')({pointerType:'mouse'});assert.equal(frames.size,0);
stage.events.get('pointerleave')();assert.equal(frames.size,1);
document.hidden=true;handlers.get('visibilitychange')();assert.equal(frames.size,0,'Hidden tabs must stop animation work');
document.hidden=false;handlers.get('visibilitychange')();assert.equal(frames.size,1);
intersect([{isIntersecting:false}]);assert.equal(frames.size,0,'Offscreen stages must stop animation work');
console.log('PASS: visible-card-only frame work, opposite directions, continuous wrapping, hover/resume and offscreen/hidden pause.');
console.log(`Measured ${measuredOffsetWrites} transform updates per desktop animation frame; previously 72.`);
