import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers=new Map(),frames=new Map();
let nextId=0,intersect,offsetWrites=0,cardQueries=0;
function node(){
 const events=new Map(),classes=new Set(),styles=new Map(),attrs=new Map();
 return {events,classes,styles,attrs,tabIndex:-1,
  classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k),add:k=>classes.add(k),remove:k=>classes.delete(k)},
  style:{setProperty:(k,v)=>{styles.set(k,v);offsetWrites++;},set transform(v){styles.set('transform',v);offsetWrites++;}},
  setAttribute:(k,v)=>attrs.set(k,v),addEventListener:(k,f)=>events.set(k,f),focus(){},setPointerCapture(){}};
}
const rows=Array.from({length:3},()=>{
 const row=node();row.cards=Array.from({length:24},()=>{const c=node(),button=node(),link=node();c.querySelector=s=>{cardQueries++;return s==='button'?button:link;};return c;});
 row.querySelectorAll=()=>row.cards;row.contains=target=>row.cards.includes(target);return row;
});
const stage=node(),counter={textContent:''};stage.clientWidth=1536;stage.contains=()=>false;
stage.querySelectorAll=s=>s==='.hp-brand-row'?rows:[];stage.querySelector=()=>counter;
const document={hidden:false,querySelector:()=>stage,addEventListener:(k,f)=>{const previous=handlers.get(k);handlers.set(k,previous?event=>{previous(event);f(event);}:f);},fonts:{ready:{then(){}}}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/brand-stage.js',import.meta.url),'utf8'),{
 document,location:{pathname:'/'},matchMedia:()=>({matches:false,addEventListener(){}}),
 IntersectionObserver:class{constructor(f){intersect=f;}observe(){}},ResizeObserver:class{observe(){}},
 getComputedStyle:()=>({width:'310px',getPropertyValue:()=> '24px'}),
 requestAnimationFrame:f=>{frames.set(++nextId,f);return nextId;},cancelAnimationFrame:id=>frames.delete(id)
});
let time=0;
function frame(){const [id,f]=frames.entries().next().value;frames.delete(id);f(time+=16.667);}
function offset(card){return card.styles.has('transform')?Number(card.styles.get('transform').match(/\+ ([\d.-]+)px/)[1]):parseFloat(card.styles.get('--hp-card-offset'));}
function offsets(){return rows.map((r,i)=>offset(r.cards[i*8]));}
intersect([{isIntersecting:true}]);frame();
const before=offsets();offsetWrites=0;cardQueries=0;frame();
assert.equal(cardQueries,0,'Animation frames must reuse cached controls instead of querying every card');
assert.ok(offsetWrites<=24,`Only visible cards should receive frame updates, got ${offsetWrites}`);
const measuredOffsetWrites=offsetWrites;
const after=offsets();assert.ok(after[0]<before[0]&&after[1]>before[1],'Outer and middle rows must move in opposite directions');
assert.equal(offsetWrites>0,true,'Visible animation must keep running');
stage.events.get('pointerenter')?.();
assert.equal(frames.size,1,'Entering the stage must not stop all rows');
for(let hovered=0;hovered<3;hovered++){
 rows[hovered].events.get('pointerenter')({pointerType:'mouse'});
 const paused=offsets();frame();frame();const moving=offsets();
 assert.equal(moving[hovered],paused[hovered],`Hovered row ${hovered+1} must hold its position`);
 for(let i=0;i<3;i++)if(i!==hovered)assert.notEqual(moving[i],paused[i],`Row ${i+1} must continue while row ${hovered+1} is hovered`);
 rows[hovered].events.get('pointerleave')();frame();frame();
 assert.notEqual(offsets()[hovered],moving[hovered],'Leaving the row must resume its motion');
}
for(let i=0;i<12000;i++)frame();
assert.ok(rows.every(r=>r.cards.filter(c=>!c.classes.has('is-offstage')).length>=6),'Every row stays filled through a full cycle');
rows[0].events.get('pointerenter')({pointerType:'mouse'});
const draggedCard=rows[0].cards.find(c=>c.classes.has('is-active'));
const dragStart=offset(draggedCard);
rows[0].events.get('pointerdown')({target:{closest:()=>null},clientX:200,clientY:40});
rows[0].events.get('pointermove')({clientX:350,clientY:40,pointerId:1});
assert.ok(Math.abs(offset(draggedCard)-dragStart-150)<.01,'Dragging keeps the same visible motion');
const duringDrag=offsets();frame();frame();
assert.equal(offsets()[0],duringDrag[0],'Dragged row must stay under pointer control');
assert.notEqual(offsets()[1],duringDrag[1],'Other rows must continue during a drag');
rows[0].events.get('pointerup')({pointerType:'mouse'});assert.equal(frames.size,1);
rows[0].events.get('pointerleave')();frame();frame();
assert.notEqual(offsets()[0],duringDrag[0],'Pointer exit must resume the dragged row');
handlers.get('keydown')();rows[1].events.get('focusin')();
const focused=offsets();frame();frame();
assert.equal(offsets()[1],focused[1],'Keyboard focus must pause only its row');
assert.notEqual(offsets()[0],focused[0],'Other rows must continue during keyboard focus');
rows[1].events.get('focusout')({relatedTarget:null});frame();frame();
assert.notEqual(offsets()[1],focused[1],'Focus exit must resume its row');
rows[0].events.get('pointerenter')({pointerType:'mouse'});
rows[0].events.get('pointerdown')({target:{closest:()=>null},clientX:200,clientY:40});
rows[0].events.get('pointerleave')();
handlers.get('pointerup')?.({pointerType:'mouse'});
const releasedOutside=offsets();frame();frame();
assert.notEqual(offsets()[0],releasedOutside[0],'Releasing outside a row before horizontal capture must resume that row');
document.hidden=true;handlers.get('visibilitychange')();assert.equal(frames.size,0,'Hidden tabs must stop animation work');
document.hidden=false;handlers.get('visibilitychange')();assert.equal(frames.size,1);
intersect([{isIntersecting:false}]);assert.equal(frames.size,0,'Offscreen stages must stop animation work');
console.log('PASS: visible-card-only frame work, opposite directions, continuous wrapping, independent row hover/drag/focus and offscreen/hidden pause.');
console.log(`Measured ${measuredOffsetWrites} transform updates per desktop animation frame; zero per-frame card lookups.`);
