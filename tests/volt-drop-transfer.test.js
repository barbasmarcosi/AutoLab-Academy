import test from"node:test";
import assert from"node:assert/strict";
import{VOLT_DROP_HOLDOUT_CASES,VOLT_DROP_HOLDOUT_ID,heldOutVoltageReading,gradeVoltageDropHoldout,freezeVoltageDropHypothesis,compareVoltageDropHypotheses,VOLT_DROP_FALSIFIERS,nextVoltageDropHoldoutIndex}from"../src/volt-drop-transfer.js";
import{lessonEvidence,learningEvidenceOverview}from"../src/learning-evidence.js";
import{learningStages}from"../src/learning-path.js";

test("independent cases have disjoint causal localizations and consistent Kirchhoff balance",()=>{
 assert.equal(VOLT_DROP_HOLDOUT_CASES.length,3);
 assert.ok(VOLT_DROP_HOLDOUT_ID.startsWith("lab-volt-drop-holdout-"));
 assert.equal(new Set(VOLT_DROP_HOLDOUT_CASES.map(x=>x.id)).size,3);
 for(const c of VOLT_DROP_HOLDOUT_CASES){
  const p=heldOutVoltageReading(c.id,"positive"),r=heldOutVoltageReading(c.id,"return"),l=heldOutVoltageReading(c.id,"load");
  assert.ok(Math.abs(p+r+l-12)<1e-9);
  assert.ok(p>=0&&r>=0&&l>0);
 }
 assert.ok(heldOutVoltageReading("positive","positive")>heldOutVoltageReading("positive","return"));
 assert.ok(heldOutVoltageReading("return","return")>heldOutVoltageReading("return","positive"));
 assert.ok(Math.abs(heldOutVoltageReading("balanced","return")-heldOutVoltageReading("balanced","positive"))<0.1);
});
test("full measurement, causal choice and falsifier are necessary; numeric uncertainty is explicit",()=>{
 for(const c of VOLT_DROP_HOLDOUT_CASES){
  const measures=["positive","return"],loadPrediction=heldOutVoltageReading(c.id,"load").toFixed(2);
  // A wrong pre-data hypothesis does not penalize a justified revision.
  const initial=c.id==="positive"?"return":"positive";
  const prior=freezeVoltageDropHypothesis({caseId:c.id,hypothesis:initial,prediction:initial,firstProbe:"positive",confidence:"low"});
  const good=gradeVoltageDropHoldout({caseId:c.id,measurements:measures,loadPrediction,diagnosis:c.id,falsifier:VOLT_DROP_FALSIFIERS[c.id].answer,prior});
  assert.equal(good.score,100);assert.equal(good.passed,true);
  assert.equal(good.prior.hypothesis,initial);
  assert.equal(good.evolution.changed,true);
  const wrongDiagnosis=c.id==="positive"?"return":"positive";
  const bad=gradeVoltageDropHoldout({caseId:c.id,measurements:measures,loadPrediction:Number(loadPrediction)+0.5,diagnosis:wrongDiagnosis,falsifier:(VOLT_DROP_FALSIFIERS[wrongDiagnosis].answer+1)%3,prior});
  assert.equal(bad.passed,false);assert.equal(bad.score,0);
  assert.throws(()=>gradeVoltageDropHoldout({caseId:c.id,measurements:["positive"],loadPrediction,diagnosis:c.id,falsifier:VOLT_DROP_FALSIFIERS[c.id].answer,prior}),RangeError);
  assert.throws(()=>gradeVoltageDropHoldout({caseId:c.id,measurements:["return","positive"],loadPrediction,diagnosis:c.id,falsifier:VOLT_DROP_FALSIFIERS[c.id].answer,prior}),RangeError);
  assert.throws(()=>gradeVoltageDropHoldout({caseId:c.id,measurements:measures,loadPrediction,diagnosis:c.id,falsifier:VOLT_DROP_FALSIFIERS[c.id].answer}),RangeError);
 }
 assert.throws(()=>heldOutVoltageReading("missing","load"),RangeError);
 assert.throws(()=>heldOutVoltageReading("positive","nonsense"),RangeError);
});
test("reserved case evidence is not mistaken for guided bank or conceptual reasoning",()=>{
 const base={notes:{"lesson-volt-drop":"2026-10-28"},cases:[
  {id:"lab-volt-drop-guided-v1",passed:true},{id:"lab-reasoning-volt-drop-v2",passed:true}]};
 let e=lessonEvidence(base,"volt-drop");
 assert.equal(e.read,true);
 assert.equal(e.lab.passed,true);
 assert.equal(e.reasoning.passed,true);
 assert.equal(e.holdout.passed,false);
 assert.equal(e.documented,false);
 const previousRubric={...base,cases:[...base.cases,{id:"lab-volt-drop-holdout-v1",passed:true}]};
 assert.equal(lessonEvidence(previousRubric,"volt-drop").holdout.passed,false,
  "An earlier attempt without a frozen prior must not earn the stronger v2 accreditation");
 const p={...base,cases:[...base.cases,{id:VOLT_DROP_HOLDOUT_ID,passed:true,attempt:1}]};
 e=lessonEvidence(p,"volt-drop");
 assert.equal(e.holdout.passed,true);
 assert.equal(e.holdout.firstRecordedAttemptPassed,true);
 assert.equal(e.documented,true);
});

test("hypothesis lock rejects invented cases, inconsistent predictions, and unsupported instruments",()=>{
 assert.throws(()=>freezeVoltageDropHypothesis({caseId:"missing",hypothesis:"positive",prediction:"positive",firstProbe:"positive"}),RangeError);
 assert.throws(()=>freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"positive",prediction:"return",firstProbe:"positive"}),RangeError);
 assert.throws(()=>freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"undetermined",prediction:"balanced",firstProbe:"positive"}),RangeError);
 assert.throws(()=>freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"positive",prediction:"positive",firstProbe:"load"}),RangeError);
 assert.throws(()=>freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"positive",prediction:"positive",firstProbe:"positive",confidence:"certain"}),RangeError);
 const frozen=freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"undetermined",prediction:"need-evidence",firstProbe:"return",confidence:"medium"});
 assert.equal(Object.isFrozen(frozen),true);
 assert.equal(frozen.hypothesis,"undetermined");
 assert.equal(frozen.firstProbe,"return");
 const evolution=compareVoltageDropHypotheses(frozen,"balanced");
 assert.equal(evolution.changed,true);
 assert.match(evolution.interpretation,/incertidumbre/);
 assert.equal(Object.isFrozen(evolution),true);
 const fromFrozen=gradeVoltageDropHoldout({caseId:"balanced",measurements:["return","positive"],
  loadPrediction:heldOutVoltageReading("balanced","load"),diagnosis:"balanced",falsifier:VOLT_DROP_FALSIFIERS.balanced.answer,prior:frozen});
 assert.equal(fromFrozen.score,100);
 assert.equal(fromFrozen.evolution.initial,"undetermined");
 assert.equal(fromFrozen.evolution.final,"balanced");
 assert.throws(()=>gradeVoltageDropHoldout({caseId:"return",measurements:["return","positive"],
  loadPrediction:10,diagnosis:"balanced",falsifier:0,prior:frozen}),RangeError);
});
test("no reward for guessing the frozen hypothesis, and no penalty for revising it",()=>{
 const prior=freezeVoltageDropHypothesis({caseId:"positive",hypothesis:"positive",prediction:"positive",firstProbe:"return",confidence:"high"});
 const stable=gradeVoltageDropHoldout({caseId:"positive",measurements:["return","positive"],
  loadPrediction:heldOutVoltageReading("positive","load"),diagnosis:"positive",falsifier:VOLT_DROP_FALSIFIERS.positive.answer,prior});
 assert.equal(stable.evolution.changed,false);
 assert.match(stable.evolution.interpretation,/compatible/);
 assert.equal(stable.score,100);
});

test("feedback never calls an incorrect final diagnosis evidence-supported",()=>{
 const prior=freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"positive",prediction:"positive",firstProbe:"positive"});
 const outcome=gradeVoltageDropHoldout({caseId:"balanced",measurements:["positive","return"],
  loadPrediction:heldOutVoltageReading("balanced","load"),diagnosis:"positive",falsifier:VOLT_DROP_FALSIFIERS.balanced.answer,prior});
 assert.equal(outcome.causal,false);
 assert.equal(outcome.evolution.evidenceSupported,false);
 assert.match(outcome.evolution.interpretation,/no coincide con las mediciones/);
 assert.doesNotMatch(outcome.evolution.interpretation,/fue compatible/);
 const revisedWrong=compareVoltageDropHypotheses(prior,"return",{supported:false});
 assert.equal(revisedWrong.changed,true);
 assert.match(revisedWrong.interpretation,/todavía insuficiente/);
});

test("falsifier options vary by case and only contradictory evidence earns falsification credit",()=>{
 const cases=["balanced","positive","return"];
 assert.deepEqual(cases.map(id=>VOLT_DROP_FALSIFIERS[id].answer),[2,0,1]);
 for(const id of cases){
  const p=freezeVoltageDropHypothesis({caseId:id,hypothesis:"undetermined",prediction:"need-evidence",firstProbe:"positive"});
  const d={caseId:id,measurements:["positive","return"],loadPrediction:heldOutVoltageReading(id,"load"),diagnosis:id,prior:p};
  const good=gradeVoltageDropHoldout({...d,falsifier:VOLT_DROP_FALSIFIERS[id].answer});
  assert.equal(good.falsified,true);
  assert.equal(good.expected.falsifier,VOLT_DROP_FALSIFIERS[id].answer);
  for(let option=0;option<3;option++)if(option!==VOLT_DROP_FALSIFIERS[id].answer){
   const incorrect=gradeVoltageDropHoldout({...d,falsifier:option});
   assert.equal(incorrect.falsified,false);
   assert.equal(incorrect.score,70);
   assert.equal(incorrect.passed,false);
  }
 }
});

test("a falsifier is objectively relative to the selected conclusion, even if that conclusion is wrong",()=>{
 const prior=freezeVoltageDropHypothesis({caseId:"balanced",hypothesis:"undetermined",prediction:"need-evidence",firstProbe:"positive"});
 const base={caseId:"balanced",measurements:["positive","return"],loadPrediction:heldOutVoltageReading("balanced","load"),diagnosis:"positive",prior};
 const proper=gradeVoltageDropHoldout({...base,falsifier:VOLT_DROP_FALSIFIERS.positive.answer});
 assert.equal(proper.causal,false);
 assert.equal(proper.falsified,true);
 assert.equal(proper.score,70);
 assert.equal(proper.expected.falsifier,VOLT_DROP_FALSIFIERS.positive.answer);
 const wrong=gradeVoltageDropHoldout({...base,falsifier:VOLT_DROP_FALSIFIERS.balanced.answer});
 assert.equal(wrong.falsified,false);
 assert.equal(wrong.score,40);
});

test("offline reopening rotates to the next retained unseen scenario without trusting v1 or malformed records",()=>{
 const record=(caseId,id=VOLT_DROP_HOLDOUT_ID)=>({id,report:JSON.stringify({caseId})});
 assert.equal(nextVoltageDropHoldoutIndex(),0);
 assert.equal(nextVoltageDropHoldoutIndex([record("balanced")]),1);
 assert.equal(nextVoltageDropHoldoutIndex([record("balanced"),record("positive")]),2);
 assert.equal(nextVoltageDropHoldoutIndex([record("return")]),0);
 assert.equal(nextVoltageDropHoldoutIndex([record("return"),{id:VOLT_DROP_HOLDOUT_ID,report:"{broken"}]),0);
 assert.equal(nextVoltageDropHoldoutIndex([record("return"),record("positive","lab-volt-drop-holdout-v1")]),0);
 assert.equal(nextVoltageDropHoldoutIndex([{id:VOLT_DROP_HOLDOUT_ID,report:JSON.stringify({caseId:"invalid"})}]),0);
 assert.equal(nextVoltageDropHoldoutIndex({notAnArray:true}),0);
});
