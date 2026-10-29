import test from'node:test';import assert from'node:assert/strict';
import{CAN_BASELINE,evaluateCanBaseline,canTerminationModel,canDifferentialModel,canArbitrationModel,canTheoryIllustration}from'../src/can-lesson.js';
test('lesson 4: four ungraded baseline misconceptions are individually explainable',()=>{
 assert.equal(CAN_BASELINE.length,4);
 const correct=Object.fromEntries(CAN_BASELINE.map(q=>[q.id,q.answer]));
 assert.equal(evaluateCanBaseline(correct).filter(x=>x.correct).length,4);
 const wrong=Object.fromEntries(CAN_BASELINE.map(q=>[q.id,(q.answer+1)%3]));
 assert.equal(evaluateCanBaseline(wrong).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateCanBaseline({}),RangeError);
 assert.throws(()=>evaluateCanBaseline({...correct,dominant:3}),RangeError);
 assert.match(canTheoryIllustration(),/60 Ω/);
 assert.match(canTheoryIllustration(),/arbitraje/i);
});
test('classical CAN two 120 Ω terminations in parallel and dominant differential obey the model',()=>{
 const expected=[null,120,60,40];
 for(let ends=0;ends<4;ends++){
  const model=canTerminationModel({ends});
  assert.equal(model.equivalentOhm,expected[ends]);
  assert.equal(model.isolated,true);
  assert.equal(Object.isFrozen(model),true);
  assert.match(model.warning,/desenergizada/);
 }
 const d=canDifferentialModel('dominant'),r=canDifferentialModel('recessive');
 assert.equal(d.highV,3.5);assert.equal(d.lowV,1.5);assert.equal(d.differentialV,2);
 assert.equal(r.highV,2.5);assert.equal(r.lowV,2.5);assert.equal(r.differentialV,0);
 assert.throws(()=>canDifferentialModel('invalid'),RangeError);
 for(const settings of [{ends:-1},{ends:4},{ohmsPerEnd:0},{ends:2.5}]){
  assert.throws(()=>canTerminationModel(settings),RangeError);
 }
});
test('standard 11-bit CAN arbitration: lower ID wins first differing bit, never a bus error',()=>{
 for(const [a,b] of [[0x080,0x120],[0x120,0x080],[0x001,0x7ff],[0x600,0x200]]){
  const arb=canArbitrationModel(a,b);
  assert.equal(arb.winner,a<b?'A':'B');
  assert.equal(arb.loser,a<b?'B':'A');
  assert.ok(arb.decisiveBit>=1&&arb.decisiveBit<=11);
  assert.equal(arb.aBits.length,11);assert.equal(arb.bBits.length,11);
  assert.notEqual(arb.aBits[arb.decisiveBit-1],arb.bBits[arb.decisiveBit-1]);
  assert.match(arb.reason,/sin tratarlo como error/);
 }
 for(const [a,b] of [[0x080,0x080],[-1,10],[0x800,100],[1,0x800],[NaN,1]]){
  assert.throws(()=>canArbitrationModel(a,b),RangeError);
 }
});
