import test from'node:test';import assert from'node:assert/strict';
import{CAN_HOLDOUT_ID,CAN_HOLDOUT_CASES,CAN_HOLDOUT_TESTS,CAN_HOLDOUT_FALSIFIERS,
 canHoldoutReading,freezeCanHoldout,gradeCanHoldout,nextCanHoldoutIndex}from'../src/can-transfer.js';
test('nine reserved CAN cases separate termination, node supply and legitimate arbitration',()=>{
 assert.equal(CAN_HOLDOUT_CASES.length,9);
 assert.equal(new Set(CAN_HOLDOUT_CASES.map(c=>c.id)).size,9);
 for(const cause of ['termination','supply','arbitration']){
  assert.equal(CAN_HOLDOUT_CASES.filter(c=>c.cause===cause).length,3);
 }
 for(const c of CAN_HOLDOUT_CASES){
  for(const t of CAN_HOLDOUT_TESTS)assert.ok(canHoldoutReading(c.id,t.id).length>50);
  assert.equal(c.resistanceOhm,c.cause==='termination'?120:60);
  assert.equal(c.nodeSupplyV,c.cause==='supply'?0:12);
  assert.equal(Object.isFrozen(c),true);
 }
 assert.match(canHoldoutReading('N03','traffic'),/reintenta con éxito/);
 assert.match(canHoldoutReading('N02','traffic'),/no prueba un transceptor roto/);
 assert.throws(()=>canHoldoutReading('bad','termination'),RangeError);
 assert.throws(()=>canHoldoutReading('N01','bad'),RangeError);
});
test('case frozen plan and four evidence entries are necessary, prior may be wrong without penalty',()=>{
 const decisive={termination:'termination',supply:'supply',arbitration:'traffic'};
 for(const c of CAN_HOLDOUT_CASES){
  const prior=freezeCanHoldout({caseId:c.id,hypothesis:'unknown',firstTest:'supply',predictedEnds:3});
  const measurements=['supply','termination','differential','traffic'];
  const answer={caseId:c.id,prior,measurements,finalEnds:120/c.resistanceOhm,
   diagnosis:c.cause,decisiveTest:decisive[c.cause],falsifier:CAN_HOLDOUT_FALSIFIERS[c.cause].answer,
   reasoning:'Contraste independiente entre alimentación, terminadores y tráfico',alternative:'Consideré otra causa no probada'};
  const result=gradeCanHoldout(answer);
  assert.equal(result.score,100);assert.equal(result.passed,true);
  assert.equal(result.changed,true);assert.equal(result.qualitativeReview,'pending');
  assert.equal(gradeCanHoldout({...answer,finalEnds:3}).score,75);
  assert.equal(gradeCanHoldout({...answer,decisiveTest:'differential'}).score,85);
  assert.equal(gradeCanHoldout({...answer,falsifier:(answer.falsifier+1)%3}).score,90);
  assert.throws(()=>gradeCanHoldout({...answer,measurements:measurements.slice(1)}),RangeError);
  assert.throws(()=>gradeCanHoldout({...answer,measurements:['supply','supply','traffic','differential']}),RangeError);
  assert.throws(()=>gradeCanHoldout({...answer,prior:{...prior,caseId:'NXX'}}),RangeError);
  assert.throws(()=>gradeCanHoldout({...answer,reasoning:''}),RangeError);
  assert.throws(()=>gradeCanHoldout({...answer,finalEnds:NaN}),RangeError);
 }
});
test('a normal arbitration case must not award diagnosis credit for guessing a transceiver fault',()=>{
 const prior=freezeCanHoldout({caseId:'N03',hypothesis:'termination',firstTest:'termination',predictedEnds:1});
 const r=gradeCanHoldout({caseId:'N03',prior,measurements:['termination','supply','traffic','differential'],finalEnds:2,
  diagnosis:'termination',decisiveTest:'termination',falsifier:CAN_HOLDOUT_FALSIFIERS.termination.answer,
  reasoning:'Alternativa elegida',alternative:'No asumir salud de transceptor'});
 assert.equal(r.score,50);assert.equal(r.passed,false);
 assert.throws(()=>freezeCanHoldout({caseId:'N03',hypothesis:'termination',firstTest:'unknown',predictedEnds:2}),RangeError);
});
test('reserved-case index rotates only valid v1 entries, ignores corrupt history',()=>{
 assert.equal(nextCanHoldoutIndex(),0);
 assert.equal(nextCanHoldoutIndex([{id:CAN_HOLDOUT_ID,report:'corrupt'}]),0);
 assert.equal(nextCanHoldoutIndex([{id:'unrelated',report:JSON.stringify({rubric:CAN_HOLDOUT_ID,caseId:'N04'})}]),0);
 for(let i=0;i<CAN_HOLDOUT_CASES.length;i++){
  assert.equal(nextCanHoldoutIndex([{id:CAN_HOLDOUT_ID,
   report:JSON.stringify({rubric:CAN_HOLDOUT_ID,caseId:CAN_HOLDOUT_CASES[i].id})}]),(i+1)%9);
 }
});
