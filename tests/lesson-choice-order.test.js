import test from'node:test';import assert from'node:assert/strict';
import{choiceOrder,choiceOrderReport,CHOICE_ORDER_MODEL}from'../src/lesson-choice-order.js';
import{REASONING_CHALLENGES}from'../src/lesson-reasoning.js';
import{transferCase}from'../src/lesson-transfer.js';
test('each seed reorders display only: canonical answers survive across all 18 lessons',()=>{
 const seen=new Set();
 for(let seed=1;seed<=48;seed++){
  for(const step of ['hypothesis','measurement','falsifier','transfer']){
   const perm=choiceOrder(seed,step);
   assert.deepEqual([...perm].sort(),[0,1,2]);
   assert.deepEqual(choiceOrder(seed,step),perm);
   if(step==='hypothesis')seen.add(perm.join(''));
  }
  for(const scenario of REASONING_CHALLENGES){
   const target=transferCase(scenario.id);
   assert.ok(target);
   for(const step of scenario.steps)assert.equal(scenario.steps.find(x=>x.id===step.id).options[step.answer],
     scenario.steps.find(x=>x.id===step.id).options[choiceOrder(seed,step.id).find(x=>x===step.answer)]);
   const report=choiceOrderReport(seed,scenario.id,scenario,target);
   assert.match(report,/Semilla de presentación:/);
   assert.match(report,/índices originales mostrados/);
   assert.match(report,/índice canónico/);
  }
 }
 assert.equal(seen.size,6);
 assert.equal(CHOICE_ORDER_MODEL,'autolab-reasoning-option-order-v1');
});
test('reordering cannot accept malformed seed, step or partial report',()=>{
 for(const seed of [0,-1,2.5,NaN,Infinity,2147483648])assert.throws(()=>choiceOrder(seed,'hypothesis'),RangeError);
 assert.throws(()=>choiceOrder(1,'answer'),RangeError);
 assert.throws(()=>choiceOrderReport(1,'',{},{}),RangeError);
});
