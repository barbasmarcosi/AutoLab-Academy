import test from'node:test';import assert from'node:assert/strict';
import{BMS_BASELINE,evaluateBmsBaseline,bmsGuidedOutcome,gradeBmsGuided,BMS_HOLDOUT_CASES,BMS_HOLDOUT_TESTS,
 BMS_HOLDOUT_FALSIFIERS,bmsHoldoutModel,bmsHoldoutReading,freezeBmsHoldout,gradeBmsHoldout,nextBmsHoldoutIndex,
 BMS_HOLDOUT_ID,bmsTheoryIllustration}from'../src/bms-lesson.js';
test('lesson 5 pre-reading baseline explicitly distinguishes charge state from capacity health',()=>{
 assert.equal(BMS_BASELINE.length,4);
 const answers=Object.fromEntries(BMS_BASELINE.map(x=>[x.id,x.answer]));
 assert.equal(evaluateBmsBaseline(answers).filter(x=>x.correct).length,4);
 assert.equal(evaluateBmsBaseline(Object.fromEntries(BMS_BASELINE.map(x=>[x.id,(x.answer+1)%3]))).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateBmsBaseline({}),RangeError);
 assert.throws(()=>evaluateBmsBaseline({...answers,soc:5}),RangeError);
 assert.match(bmsTheoryIllustration(),/12 Ah/);
 assert.match(bmsTheoryIllustration(),/80%/);
 assert.match(bmsTheoryIllustration(),/PyBaMM/);
});
test('guided BMS cases reuse existing generator/counter with independently declared error',()=>{
 const expectations=[['nominal','nominal',80,80,0],['bias','bias',79,80,-1],['aged','capacity',80,75,5]];
 for(const [id,cause,estimate,reference,gap] of expectations){
  const x=bmsGuidedOutcome(id);
  assert.equal(x.cause,cause);assert.equal(x.estimatedSoc,estimate);assert.equal(x.referenceSoc,reference);
  assert.equal(x.gapPp,gap);assert.equal(x.dischargeAh,id==='bias'?12.6:12);
  const good=gradeBmsGuided({scenarioId:id,plannedGap:gap,finalCause:cause,reasoning:'Modelo',alternative:'Alternativa'});
  assert.equal(good.score,100);assert.equal(good.passed,true);assert.equal(good.qualitativeReview,'pending');
  assert.equal(gradeBmsGuided({scenarioId:id,plannedGap:gap+3,finalCause:cause,reasoning:'a',alternative:'b'}).score,50);
  assert.throws(()=>gradeBmsGuided({scenarioId:id,plannedGap:gap,finalCause:cause,reasoning:'',alternative:'b'}),RangeError);
 }
});
test('reserved BMS cases are novel and span bias, effective capacity and initial SOC error',()=>{
 assert.equal(BMS_HOLDOUT_CASES.length,9);assert.equal(new Set(BMS_HOLDOUT_CASES.map(x=>x.id)).size,9);
 for(const cause of ['bias','capacity','initial'])assert.equal(BMS_HOLDOUT_CASES.filter(x=>x.cause===cause).length,3);
 for(const c of BMS_HOLDOUT_CASES){
  assert.equal(Object.isFrozen(c),true);
  const m=bmsHoldoutModel(c.id);
  assert.ok(Number.isFinite(m.gapPp));assert.ok(Number.isFinite(m.sohPct));
  assert.equal(m.estimatedSoc,80-100*c.biasA/60);
  assert.equal(m.referenceSoc,c.trueInitialSoc-1200/c.capacityAh);
  for(const t of BMS_HOLDOUT_TESTS)assert.ok(bmsHoldoutReading(c.id,t.id).length>65);
  assert.doesNotMatch(c.condition,/sesgo de corriente|capacidad útil reducida|soc inicial supuesto/i);
 }
 assert.ok(bmsHoldoutModel('B01').gapPp<0);
 assert.equal(bmsHoldoutModel('B02').gapPp,5);
 assert.equal(bmsHoldoutModel('B03').gapPp,5);
 assert.equal(bmsHoldoutModel('B07').gapPp,1);
 assert.throws(()=>bmsHoldoutModel('missing'),RangeError);
 assert.throws(()=>bmsHoldoutReading('B01','bad'),RangeError);
});
test('holdout scoring requires complete independent measurements, numeric gap and a falsifier',()=>{
 const decisive={bias:'sensor',capacity:'capacity',initial:'initial'};
 for(const c of BMS_HOLDOUT_CASES){
  const prior=freezeBmsHoldout({caseId:c.id,hypothesis:'unknown',firstTest:'capacity',predictedGapPp:0});
  const measurements=['capacity','sensor','initial','trajectory'];
  const params={caseId:c.id,prior,measurements,observedGapPp:bmsHoldoutModel(c.id).gapPp,diagnosis:c.cause,
   decisiveTest:decisive[c.cause],falsifier:BMS_HOLDOUT_FALSIFIERS[c.cause].answer,
   reasoning:'Comparé contra referencias sintéticas independientes',alternative:'También consideré error inicial'};
  const good=gradeBmsHoldout(params);
  assert.equal(good.score,100);assert.equal(good.passed,true);assert.equal(good.changed,true);
  assert.equal(good.qualitativeReview,'pending');
  assert.equal(gradeBmsHoldout({...params,observedGapPp:params.observedGapPp+1}).score,65);
  assert.equal(gradeBmsHoldout({...params,decisiveTest:'trajectory'}).score,90);
  assert.equal(gradeBmsHoldout({...params,falsifier:(params.falsifier+1)%3}).score,90);
  assert.throws(()=>gradeBmsHoldout({...params,measurements:measurements.slice(1)}),RangeError);
  assert.throws(()=>gradeBmsHoldout({...params,measurements:['capacity','capacity','sensor','trajectory']}),RangeError);
  assert.throws(()=>gradeBmsHoldout({...params,prior:{...prior,caseId:'BXX'}}),RangeError);
  assert.throws(()=>gradeBmsHoldout({...params,observedGapPp:NaN}),RangeError);
  assert.throws(()=>gradeBmsHoldout({...params,reasoning:''}),RangeError);
 }
 assert.throws(()=>freezeBmsHoldout({caseId:'B01',hypothesis:'bias',firstTest:'unknown',predictedGapPp:0}),RangeError);
});
test('held-out BMS wrong diagnosis never passes even if numeric gap was calculated correctly',()=>{
 const p=freezeBmsHoldout({caseId:'B01',hypothesis:'capacity',firstTest:'sensor',predictedGapPp:5});
 const g=gradeBmsHoldout({caseId:'B01',prior:p,measurements:['sensor','capacity','initial','trajectory'],observedGapPp:-1,
 diagnosis:'capacity',decisiveTest:'sensor',falsifier:BMS_HOLDOUT_FALSIFIERS.capacity.answer,reasoning:'Texto',alternative:'Otra'});
 assert.equal(g.score,45);assert.equal(g.causal,false);assert.equal(g.discriminated,false);assert.equal(g.passed,false);
});
test('BMS reserved sequence rotates and skips unrelated or corrupted history',()=>{
 assert.equal(nextBmsHoldoutIndex(),0);
 assert.equal(nextBmsHoldoutIndex([{id:BMS_HOLDOUT_ID,report:'broken'}]),0);
 assert.equal(nextBmsHoldoutIndex([{id:'unrelated',report:JSON.stringify({rubric:BMS_HOLDOUT_ID,caseId:'B04'})}]),0);
 for(let i=0;i<BMS_HOLDOUT_CASES.length;i++)
  assert.equal(nextBmsHoldoutIndex([{id:BMS_HOLDOUT_ID,report:JSON.stringify({rubric:BMS_HOLDOUT_ID,caseId:BMS_HOLDOUT_CASES[i].id})}]),(i+1)%9);
});
