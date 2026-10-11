import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {step}=createRequire(import.meta.url)('../assets/js/letter-train.js');
test('Letters follow one another instead of moving as a single word',()=>{
  const up=step([[220,220,220,220]],[100],600,false)[0];
  assert.ok(up[0]<up[1]);assert.equal(up.at(-1),220);
  const down=step([[100,100,100,100]],[220],600,false)[0];
  assert.ok(down[0]>down[1]);assert.equal(down.at(-1),100);
});
test('Unequal word lengths stay ordered while each next name takes its place',()=>{
  let values=[Array(7).fill(280),Array(14).fill(340),Array(5).fill(420)];
  const targets=[80,150,240];
  for(let frame=0;frame<400;frame++){
    values=step(values,targets,600,false);
    values.forEach((letters,i)=>letters.forEach((y,j)=>{
      assert.ok(y>=0&&y<=580);
      if(i){const above=values[i-1];const phase=j/(letters.length-1);assert.ok(y>=above[Math.round(phase*(above.length-1))]+24-.001);}
    }));
  }
  values.forEach((letters,i)=>letters.forEach(y=>assert.ok(Math.abs(y-targets[i])<.15)));
});
test('Reduced motion puts complete names straight at their destinations',()=>{
  assert.deepEqual(step([[400,450],[510,540]],[50,120],600,true),[[50,50],[120,120]]);
});
