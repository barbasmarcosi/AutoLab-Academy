import test from'node:test';import assert from'node:assert/strict';
import{DTC_GUIDED_ID,DTC_CASES,DTC_TESTS,DTC_FALSIFIERS,dtcReading,gradeDtcGuided,dtcTheoryIllustration,dtcCounterfactual,DTC_BASELINE,evaluateDtcBaseline}from'../src/dtc-lesson.js';
test('three distinct diagnostic causes and discriminating synthetic observations',()=>{
 assert.equal(DTC_CASES.length,3);assert.equal(DTC_GUIDED_ID,'lab-dtc-guided-v1');
 for(const c of DTC_CASES){
  assert.match(dtcReading(c.id,'trims'),/correcciones|Correcciones/);
  assert.match(dtcReading(c.id,'pressure'),/NO OEM/);
  assert.match(dtcReading(c.id,'leak'),/estanqueidad/);
  assert.match(dtcReading(c.id,'sensor'),/referencia/);
 }
 assert.match(dtcTheoryIllustration(),/2,1 bar/);
 assert.match(dtcTheoryIllustration(),/refutación/i);
});
test('four different tests, first-probe plan and hypothesis-relative falsifiers are mandatory',()=>{
 for(const c of DTC_CASES){
  const tests=DTC_TESTS.map(t=>t.id),initial=c.id==='air'?'fuel':'air';
  const base={caseId:c.id,initial,first:'trims',tests,diagnosis:c.id,falsifier:DTC_FALSIFIERS[c.id].answer};
  const g=gradeDtcGuided(base);assert.equal(g.score,100);assert.equal(g.changed,true);
  assert.throws(()=>gradeDtcGuided({...base,tests:tests.slice(0,3)}),RangeError);
  assert.throws(()=>gradeDtcGuided({...base,tests:['trims','trims','leak','sensor']}),RangeError);
  assert.throws(()=>gradeDtcGuided({...base,first:'sensor'}),RangeError);
  assert.throws(()=>gradeDtcGuided({...base,diagnosis:'unknown'}),RangeError);
  assert.equal(gradeDtcGuided({...base,falsifier:(base.falsifier+1)%3}).score,70);
 }
 assert.throws(()=>dtcReading('none','trims'),RangeError);
 assert.throws(()=>dtcReading('air','nonexistent'),RangeError);
});

test('post-submission counterfactual changes only the scripted causal mechanism, never a physical guarantee',()=>{
 for(const c of DTC_CASES){
  for(const option of DTC_CASES){
   const cf=dtcCounterfactual(c.id,option.id);
   assert.equal(cf.matched,c.id===option.id);
   assert.deepEqual(cf.before,{idle:c.idle,load:c.load});
   assert.deepEqual(cf.after,cf.matched?{idle:3,load:4}:cf.before);
   assert.match(cf.caution,/no acredita/);
   assert.equal(Object.isFrozen(cf),true);
  }
 }
 assert.throws(()=>dtcCounterfactual('air','unknown'),RangeError);
 assert.throws(()=>dtcCounterfactual('unknown','air'),RangeError);
});

test('pre-reading DTC baseline is graded only in-memory and tests common misconceptions',()=>{
 const good=Object.fromEntries(DTC_BASELINE.map(q=>[q.id,q.answer]));
 assert.equal(DTC_BASELINE.length,3);
 assert.equal(evaluateDtcBaseline(good).filter(x=>x.correct).length,3);
 const poor=Object.fromEntries(DTC_BASELINE.map(q=>[q.id,(q.answer+1)%3]));
 assert.equal(evaluateDtcBaseline(poor).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateDtcBaseline({...good,code:4}),RangeError);
 assert.throws(()=>evaluateDtcBaseline({}),RangeError);
});
