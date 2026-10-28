import test from'node:test';
import assert from'node:assert/strict';
import{DTC_HOLDOUT_ID,DTC_HOLDOUT_CASES,freezeDtcHoldout,dtcHoldoutReading,dtcHoldoutObservedClass,gradeDtcHoldout,nextDtcHoldoutIndex}from'../src/dtc-transfer.js';
import{DTC_FALSIFIERS}from'../src/dtc-lesson.js';

test('lesson 2 holdout has nine stable reserved examples covering three different mechanisms',()=>{
 assert.equal(DTC_HOLDOUT_CASES.length,9);
 assert.equal(new Set(DTC_HOLDOUT_CASES.map(x=>x.id)).size,9);
 assert.deepEqual(Object.groupBy(DTC_HOLDOUT_CASES,x=>x.cause).air.map(x=>x.id),['R01','R04','R07']);
 assert.deepEqual(Object.keys(DTC_FALSIFIERS).sort(),['air','fuel','sensor']);
 for(const x of DTC_HOLDOUT_CASES){
  assert.match(dtcHoldoutReading(x.id,'trims'),/no|requieren/i);
  assert.match(dtcHoldoutReading(x.id,'pressure'),/NO OEM/);
  assert.match(dtcHoldoutReading(x.id,'leak'),/admisión/);
  assert.match(dtcHoldoutReading(x.id,'sensor'),/referencia/i);
  assert.equal(dtcHoldoutObservedClass(x.id,'trims'),'uncertain');
  assert.equal(dtcHoldoutObservedClass(x.id,'pressure'),x.cause==='fuel'?'abnormal':'normal');
  assert.equal(dtcHoldoutObservedClass(x.id,'leak'),x.cause==='air'?'abnormal':'normal');
  assert.equal(dtcHoldoutObservedClass(x.id,'sensor'),x.cause==='sensor'?'abnormal':'normal');
  assert.equal(Object.isFrozen(x),true);
 }
 assert.throws(()=>dtcHoldoutReading('fake','pressure'),RangeError);
 assert.throws(()=>dtcHoldoutObservedClass('R01','fake'),RangeError);
});
test('initial uncertainty or incorrect hypothesis is not penalized when new evidence changes the conclusion',()=>{
 for(const c of DTC_HOLDOUT_CASES){
  const firstTest='pressure',prior=freezeDtcHoldout({caseId:c.id,hypothesis:'undetermined',firstTest,expectedObservation:'uncertain'});
  const measurements=['pressure','trims','leak','sensor'];
  const decisiveTest={air:'leak',fuel:'pressure',sensor:'sensor'}[c.cause];
  const g=gradeDtcHoldout({caseId:c.id,prior,measurements,diagnosis:c.cause,decisiveTest,
   falsifier:DTC_FALSIFIERS[c.cause].answer,reasoning:'Contrasté pruebas independientes',alternative:'Evalué al menos una causa alternativa'});
  assert.equal(g.score,100);assert.equal(g.passed,true);assert.equal(g.changed,true);
  assert.equal(g.qualitativeReview,'pending');
  assert.equal(g.predictionMatched,c.cause==='fuel'?false:false); // initial uncertainty differs from a concrete pressure reading
  assert.equal(gradeDtcHoldout({caseId:c.id,prior,measurements,diagnosis:c.cause,decisiveTest:'trims',
   falsifier:DTC_FALSIFIERS[c.cause].answer,reasoning:'x',alternative:'y'}).score,75);
  assert.equal(gradeDtcHoldout({caseId:c.id,prior,measurements,diagnosis:c.cause,decisiveTest,
   falsifier:(DTC_FALSIFIERS[c.cause].answer+1)%3,reasoning:'x',alternative:'y'}).score,75);
  assert.throws(()=>gradeDtcHoldout({caseId:c.id,prior,measurements:measurements.slice(1),
   diagnosis:c.cause,decisiveTest,falsifier:0,reasoning:'x',alternative:'y'}),RangeError);
  assert.throws(()=>gradeDtcHoldout({caseId:c.id,prior,measurements:['trims','trims','leak','sensor'],
   diagnosis:c.cause,decisiveTest,falsifier:0,reasoning:'x',alternative:'y'}),RangeError);
  assert.throws(()=>gradeDtcHoldout({caseId:c.id,prior,measurements,diagnosis:c.cause,
   decisiveTest,falsifier:0,reasoning:'',alternative:'y'}),RangeError);
  assert.throws(()=>gradeDtcHoldout({caseId:c.id,prior:{...prior,caseId:'R00'},
   measurements,diagnosis:c.cause,decisiveTest,falsifier:0,reasoning:'x',alternative:'y'}),RangeError);
 }
});
test('prediction classification is independent of scored diagnosis, and false positives do not pass',()=>{
 const c=DTC_HOLDOUT_CASES[0];
 const prior=freezeDtcHoldout({caseId:c.id,hypothesis:'fuel',firstTest:'leak',expectedObservation:'abnormal'});
 assert.equal(dtcHoldoutObservedClass(c.id,'leak'),'abnormal');
 const g=gradeDtcHoldout({caseId:c.id,prior,measurements:['leak','pressure','trims','sensor'],diagnosis:'sensor',
  decisiveTest:'leak',falsifier:DTC_FALSIFIERS.sensor.answer,reasoning:'detalle',alternative:'aire'});
 assert.equal(g.score,50);assert.equal(g.passed,false);assert.equal(g.predictionMatched,true);
 assert.throws(()=>freezeDtcHoldout({caseId:c.id,hypothesis:'air',firstTest:'false',expectedObservation:'normal'}),RangeError);
});
test('history rotation uses only validated v1 reports, skips old/malformed records',()=>{
 assert.equal(nextDtcHoldoutIndex(),0);
 assert.equal(nextDtcHoldoutIndex([{id:'other',report:JSON.stringify({rubric:DTC_HOLDOUT_ID,caseId:'R05'})}]),0);
 assert.equal(nextDtcHoldoutIndex([{id:DTC_HOLDOUT_ID,report:'not json'}]),0);
 assert.equal(nextDtcHoldoutIndex([{id:DTC_HOLDOUT_ID,report:JSON.stringify({rubric:'old-v0',caseId:'R09'})}]),0);
 assert.equal(nextDtcHoldoutIndex([{id:DTC_HOLDOUT_ID,report:JSON.stringify({rubric:DTC_HOLDOUT_ID,caseId:'R09'})}]),0);
 for(let i=0;i<DTC_HOLDOUT_CASES.length-1;i++)
  assert.equal(nextDtcHoldoutIndex([{id:DTC_HOLDOUT_ID,report:JSON.stringify({rubric:DTC_HOLDOUT_ID,caseId:DTC_HOLDOUT_CASES[i].id})}]),i+1);
});
