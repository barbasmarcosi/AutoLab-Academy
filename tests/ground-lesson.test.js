import test from'node:test';import assert from'node:assert/strict';
import{GROUND_BASELINE,GROUND_HOLDOUT_CASES,GROUND_PROBES,GROUND_FALSIFIERS,
 evaluateGroundBaseline,groundLabModel,groundObservation,freezeGroundPlan,gradeGroundHoldout,groundTheoryIllustration}from'../src/ground-lesson.js';
import{nextGroundHoldoutIndex}from'../src/ground-lesson-ui.js';
test('lesson 7: misconception baseline distinguishes continuity, loaded drop, resistance and safe limits',()=>{
 assert.equal(GROUND_BASELINE.length,4);
 const good=Object.fromEntries(GROUND_BASELINE.map(q=>[q.id,q.answer]));
 assert.equal(evaluateGroundBaseline(good).filter(x=>x.correct).length,4);
 const poor=Object.fromEntries(GROUND_BASELINE.map(q=>[q.id,(q.answer+1)%3]));
 assert.equal(evaluateGroundBaseline(poor).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateGroundBaseline({}),RangeError);
 assert.match(groundTheoryIllustration(),/continuidad no es caída bajo carga/i);
});
test('lesson 7: voltage-drop solver is reused and its energy balance holds across all nine cases',()=>{
 const nominal=groundLabModel(),off=groundLabModel({energized:false,returnOhm:0.4});
 assert.equal(nominal.sourceV,12);
 assert.equal(off.currentA,0);assert.equal(off.returnV,0);
 assert.equal(GROUND_HOLDOUT_CASES.length,9);
 assert.equal(new Set(GROUND_HOLDOUT_CASES.map(c=>c.id)).size,9);
 for(const c of GROUND_HOLDOUT_CASES){
  const m=groundLabModel(c);
  assert.equal(Object.isFrozen(m),true);
  assert.ok(Math.abs(m.balanceV-m.sourceV)<1e-9);
  assert.ok(m.currentA>0);
  assert.ok(Math.abs(m.returnV-m.returnOhm*m.currentA)<1e-9);
  assert.ok(Math.abs(m.positiveV-m.positiveOhm*m.currentA)<1e-9);
  for(const [id]of GROUND_PROBES)assert.match(groundObservation(c.id,id),/V|A/);
 }
 for(const cause of ['return','positive','load'])
  assert.equal(GROUND_HOLDOUT_CASES.filter(c=>c.cause===cause).length,3);
 assert.throws(()=>groundObservation('invalid','return'),RangeError);
 assert.throws(()=>groundObservation('R01','invalid'),RangeError);
});
test('lesson 7: nine holdouts require calibrated return voltage, causal mechanism and falsation',()=>{
 const discriminator={return:'return',positive:'positive',load:'current'};
 for(const c of GROUND_HOLDOUT_CASES){
  const prior=freezeGroundPlan({caseId:c.id,hypothesis:'unknown',firstProbe:'current',predictedReturnV:0});
  const observations=GROUND_PROBES.map(p=>p[0]),m=groundLabModel(c);
  const base={caseId:c.id,prior,observations,returnV:m.returnV,cause:c.cause,decisiveProbe:discriminator[c.cause],
   falsifier:GROUND_FALSIFIERS[c.cause].answer,
   reasoning:'Hay cuatro observables independientes que permiten discriminar tramos.',
   alternative:'Consideré un cambio de demanda o del conductor opuesto.'};
  const good=gradeGroundHoldout(base);
  assert.equal(good.score,100);assert.equal(good.passed,true);
  assert.equal(good.changed,true);assert.equal(good.qualitativeReview,'pending');
  assert.equal(gradeGroundHoldout({...base,returnV:m.returnV+0.5}).score,70);
  assert.equal(gradeGroundHoldout({...base,decisiveProbe:GROUND_PROBES.find(p=>p[0]!==discriminator[c.cause])[0]}).score,80);
  assert.equal(gradeGroundHoldout({...base,falsifier:(base.falsifier+1)%3}).score,90);
  assert.throws(()=>gradeGroundHoldout({...base,observations:observations.slice(1)}),RangeError);
  assert.throws(()=>gradeGroundHoldout({...base,observations:['current','current','return','load']}),RangeError);
  assert.throws(()=>gradeGroundHoldout({...base,prior:{...prior,caseId:'BAD'}}),RangeError);
  assert.throws(()=>gradeGroundHoldout({...base,reasoning:'bad'}),RangeError);
  assert.throws(()=>gradeGroundHoldout({...base,alternative:'x'}),RangeError);
 }
});
test('lesson 7: guard negative inputs and old progress history',()=>{
 assert.throws(()=>freezeGroundPlan({caseId:'R01',hypothesis:'return',firstProbe:'current',predictedReturnV:NaN}),RangeError);
 assert.throws(()=>freezeGroundPlan({caseId:'R01',hypothesis:'return',firstProbe:'bad',predictedReturnV:0}),RangeError);
 assert.equal(nextGroundHoldoutIndex(),0);
 assert.equal(nextGroundHoldoutIndex([{id:'lab-ground-test-holdout-v1',report:'bad-json'}]),0);
 for(let i=0;i<GROUND_HOLDOUT_CASES.length;i++)
  assert.equal(nextGroundHoldoutIndex([{id:'lab-ground-test-holdout-v1',
   report:JSON.stringify({rubric:'lab-ground-test-holdout-v1',caseId:GROUND_HOLDOUT_CASES[i].id})}]),(i+1)%9);
});
