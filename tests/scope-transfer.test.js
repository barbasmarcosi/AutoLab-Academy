import test from'node:test';import assert from'node:assert/strict';
import{SCOPE_HOLDOUT_ID,SCOPE_HOLDOUT_CASES,SCOPE_HOLDOUT_TESTS,SCOPE_HOLDOUT_FALSIFIERS,
 scopeHoldoutReading,freezeScopeHoldout,gradeScopeHoldout,nextScopeHoldoutIndex}from'../src/scope-transfer.js';
test('lesson 3: 9 unique held-out scenarios cover actual frequency, apparent scale and reference',()=>{
 assert.equal(SCOPE_HOLDOUT_CASES.length,9);
 assert.equal(new Set(SCOPE_HOLDOUT_CASES.map(c=>c.id)).size,9);
 assert.equal(SCOPE_HOLDOUT_CASES.filter(c=>c.cause==='frequency').length,3);
 assert.equal(SCOPE_HOLDOUT_CASES.filter(c=>c.cause==='gain').length,3);
 assert.equal(SCOPE_HOLDOUT_CASES.filter(c=>c.cause==='reference').length,3);
 for(const c of SCOPE_HOLDOUT_CASES){
  const period=1000/c.hz;
  assert.ok(period>0&&period<10);
  assert.match(scopeHoldoutReading(c.id,'period'),/calibrado/);
  assert.match(scopeHoldoutReading(c.id,'vertical'),/2,40 V/);
  assert.match(scopeHoldoutReading(c.id,'reference'),/2,50 V/);
  assert.match(scopeHoldoutReading(c.id,'source'),/patrón ficticio/);
  if(c.cause!=='frequency')assert.equal(c.hz,200);
  if(c.cause!=='gain')assert.equal(c.voltsDiv,1);
  if(c.cause!=='reference')assert.equal(c.referenceShift,0);
  assert.equal(Object.isFrozen(c),true);
 }
 assert.throws(()=>scopeHoldoutReading('bad','period'),RangeError);
 assert.throws(()=>scopeHoldoutReading('S01','bad'),RangeError);
});
test('lesson 3: independent numeric calibration and final falsifier are required, never prior correctness',()=>{
 const expectedTest={frequency:'period',gain:'vertical',reference:'reference'};
 for(const c of SCOPE_HOLDOUT_CASES){
  const prior=freezeScopeHoldout({caseId:c.id,hypothesis:'unknown',firstTest:'period',predictedHz:200});
  const measurements=SCOPE_HOLDOUT_TESTS.map(x=>x.id),params={caseId:c.id,prior,measurements,observedHz:c.hz,
   diagnosis:c.cause,decisiveTest:expectedTest[c.cause],falsifier:SCOPE_HOLDOUT_FALSIFIERS[c.cause].answer,
   reasoning:'Medí el patrón calibrado para separar señal y pantalla',
   alternative:'Consideré offset y escala como explicaciones alternativas'};
  const good=gradeScopeHoldout(params);assert.equal(good.score,100);assert.equal(good.passed,true);
  assert.equal(good.changed,true);assert.equal(good.qualitativeReview,'pending');
  assert.equal(good.expected.frequencyHz,c.hz);
  assert.equal(gradeScopeHoldout({...params,observedHz:c.hz*1.1}).score,60);
  assert.equal(gradeScopeHoldout({...params,decisiveTest:'source'}).score,90);
  assert.equal(gradeScopeHoldout({...params,falsifier:(params.falsifier+1)%3}).score,90);
  assert.throws(()=>gradeScopeHoldout({...params,measurements:measurements.slice(1)}),RangeError);
  assert.throws(()=>gradeScopeHoldout({...params,measurements:['period','period','reference','source']}),RangeError);
  assert.throws(()=>gradeScopeHoldout({...params,prior:{...prior,caseId:'SXX'}}),RangeError);
  assert.throws(()=>gradeScopeHoldout({...params,reasoning:''}),RangeError);
  assert.throws(()=>gradeScopeHoldout({...params,observedHz:Infinity}),RangeError);
 }
});
test('lesson 3: concrete wrong diagnosis cannot pass even with excellent numeric reading',()=>{
 const c=SCOPE_HOLDOUT_CASES[0],prior=freezeScopeHoldout({caseId:c.id,hypothesis:'gain',firstTest:'period',predictedHz:200});
 const result=gradeScopeHoldout({caseId:c.id,prior,measurements:['period','vertical','reference','source'],
  observedHz:c.hz,diagnosis:'gain',decisiveTest:'period',falsifier:SCOPE_HOLDOUT_FALSIFIERS.gain.answer,
  reasoning:'x',alternative:'y'});
 assert.equal(result.score,60);assert.equal(result.passed,false);
 assert.throws(()=>freezeScopeHoldout({caseId:c.id,hypothesis:'gain',firstTest:'invalid',predictedHz:200}),RangeError);
 assert.throws(()=>freezeScopeHoldout({caseId:c.id,hypothesis:'gain',firstTest:'period',predictedHz:0}),RangeError);
});
test('lesson 3: retry cycles real v1 case evidence, not unrelated or malformed reports',()=>{
 assert.equal(nextScopeHoldoutIndex(),0);
 assert.equal(nextScopeHoldoutIndex([{id:SCOPE_HOLDOUT_ID,report:'no json'}]),0);
 assert.equal(nextScopeHoldoutIndex([{id:'other',report:JSON.stringify({rubric:SCOPE_HOLDOUT_ID,caseId:'S04'})}]),0);
 for(let i=0;i<SCOPE_HOLDOUT_CASES.length;i++){
  const expected=(i+1)%SCOPE_HOLDOUT_CASES.length;
  assert.equal(nextScopeHoldoutIndex([{id:SCOPE_HOLDOUT_ID,
   report:JSON.stringify({rubric:SCOPE_HOLDOUT_ID,caseId:SCOPE_HOLDOUT_CASES[i].id})}]),expected);
 }
});

test('scope reserved intake stories do not announce the hidden physical or display adjustment',()=>{
 const terms=/período aumentado|período menor|sensibilidad vertical mayor|referencia de medición desplazada|ajuste de pantalla|fuente de banco con período/i;
 for(const c of SCOPE_HOLDOUT_CASES)assert.doesNotMatch(c.condition,terms);
});
