import test from'node:test';import assert from'node:assert/strict';
import{HV_MODEL,HV_GUIDED_ID,HV_HOLDOUT_ID,HV_BASELINE,HV_GUIDED_CASES,HV_HOLDOUT_CASES,HV_PROBES,
 HV_DECISIONS,HV_RISKS,evaluateHvBaseline,freezeHvPlan,hvObservation,gradeHvCase,nextHvHoldoutIndex,hvTheoryIllustration}from'../src/hv-lesson.js';
test('lesson 6 prerequisite safety awareness covers quiet vehicles, orange wires, emergency, quiz limits',()=>{
 assert.equal(HV_BASELINE.length,4);
 const good=Object.fromEntries(HV_BASELINE.map(q=>[q.id,q.answer]));
 assert.equal(evaluateHvBaseline(good).filter(x=>x.correct).length,4);
 const wrong=Object.fromEntries(HV_BASELINE.map(q=>[q.id,(q.answer+1)%3]));
 assert.equal(evaluateHvBaseline(wrong).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateHvBaseline({}),RangeError);
 assert.match(hvTheoryIllustration(),/NO|no equivale|no se inicia/i);
 assert.match(hvTheoryIllustration(),/https:\/\/www.hse.gov.uk/);
 assert.equal(HV_GUIDED_CASES.length,3);
 assert.deepEqual(HV_GUIDED_CASES.map(c=>c.decision),['emergency','refer','inform']);
});
test('lesson 6 nine held-out reports do not reveal resolutions in their intake stories',()=>{
 assert.equal(HV_HOLDOUT_CASES.length,9);
 assert.equal(new Set(HV_HOLDOUT_CASES.map(c=>c.id)).size,9);
 for(const d of ['emergency','refer','inform'])assert.equal(HV_HOLDOUT_CASES.filter(c=>c.decision===d).length,3);
 for(const c of HV_HOLDOUT_CASES){
  assert.equal(Object.isFrozen(c),true);
  assert.doesNotMatch(c.story,/abrir paquete|emisión de vapores|humo|llamas|terminar intervención|solo documento/i);
  for(const [id]of HV_PROBES)assert.ok(hvObservation(c.id,id).length>45);
 }
 assert.throws(()=>hvObservation('H99','incident'),RangeError);
 assert.throws(()=>hvObservation('H01','invalid'),RangeError);
 assert.equal(HV_MODEL,'autolab-hv-awareness-v1');
 assert.equal(HV_GUIDED_ID,'lab-hv-safety-guided-v1');
});
test('lesson 6 rubric uses risk evidence, authority limits, and does not penalize revised initial hypothesis',()=>{
 for(const c of HV_HOLDOUT_CASES){
  const prior=freezeHvPlan({caseId:c.id,hypothesis:'unsafe',firstProbe:'incident'});
  const base={caseId:c.id,prior,observations:HV_PROBES.map(p=>p[0]),decision:c.decision,risk:c.risk,
   authority:'no_authority',reasoning:'No intervengo y derivo porque las evidencias no permiten declarar seguridad.',
   alternative:'Podría existir otro mecanismo, pero no debo comprobarlo físicamente.'};
  const good=gradeHvCase(base);
  assert.equal(good.score,100);assert.equal(good.passed,true);
  assert.equal(good.changed,true);assert.equal(good.qualitativeReview,'pending');
  assert.equal(good.expected.decision,c.decision);
  assert.equal(gradeHvCase({...base,risk:HV_RISKS.find(x=>x[0]!==c.risk)[0]}).score,70);
  assert.equal(gradeHvCase({...base,authority:'qualified_required'}).score,0);
  const bad=gradeHvCase({...base,decision:'unsafe'});
  assert.equal(bad.score,0);assert.equal(bad.passed,false);assert.equal(bad.criticalFailure,true);
  const cert=gradeHvCase({...base,authority:'quiz_certifies'});
  assert.equal(cert.score,0);assert.equal(cert.criticalFailure,true);
  if(c.decision==='emergency'){
   const delay=gradeHvCase({...base,decision:'refer'});
   assert.equal(delay.criticalFailure,true,'Fail closed when emergency response delayed');
   assert.equal(delay.score,0);
  }
  assert.throws(()=>gradeHvCase({...base,observations:base.observations.slice(1)}),RangeError);
  assert.throws(()=>gradeHvCase({...base,observations:['incident','incident','authority','limits']}),RangeError);
  assert.throws(()=>gradeHvCase({...base,prior:{...prior,caseId:'H98'}}),RangeError);
  assert.throws(()=>gradeHvCase({...base,reasoning:'x'}),RangeError);
  assert.throws(()=>gradeHvCase({...base,alternative:'no'}),RangeError);
 }
});
test('lesson 6 blocked shortcuts: no plan, missing first evidence, suspicious credential claim or unknown decision',()=>{
 const prior=freezeHvPlan({caseId:'H01',hypothesis:'refer',firstProbe:'authority'});
 const valid={caseId:'H01',prior,observations:['authority','incident','documentation','limits'],decision:'emergency',
  risk:'thermal',authority:'no_authority',reasoning:'Las emanaciones y el calor son peligros inmediatos. No intervenir.',
  alternative:'Podría tratarse de otra condición, pero no debo averiguarlo acercándome.'};
 assert.equal(gradeHvCase(valid).passed,true);
 for(const [part,change]of [['decision','attempt_probe'],['authority','approved'],['risk','none_unrecognized']]){
  assert.throws(()=>gradeHvCase({...valid,[part]:change}),RangeError);
 }
 assert.throws(()=>freezeHvPlan({caseId:'H01',hypothesis:'emergency',firstProbe:'invalid'}),RangeError);
 assert.throws(()=>gradeHvCase({...valid,observations:['incident','authority','documentation','limits']}),RangeError);
});
test('lesson 6 rotation uses only recorded valid scenario IDs with matching rubric',()=>{
 assert.equal(nextHvHoldoutIndex(),0);
 assert.equal(nextHvHoldoutIndex([{id:HV_HOLDOUT_ID,report:'broken'}]),0);
 assert.equal(nextHvHoldoutIndex([{id:'other',report:JSON.stringify({rubric:HV_HOLDOUT_ID,caseId:'H04'})}]),0);
 for(let i=0;i<HV_HOLDOUT_CASES.length;i++)
  assert.equal(nextHvHoldoutIndex([{id:HV_HOLDOUT_ID,report:JSON.stringify({
   rubric:HV_HOLDOUT_ID,caseId:HV_HOLDOUT_CASES[i].id})}]),(i+1)%9);
});
