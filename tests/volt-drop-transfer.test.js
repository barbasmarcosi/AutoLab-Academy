import test from"node:test";
import assert from"node:assert/strict";
import{VOLT_DROP_HOLDOUT_CASES,VOLT_DROP_HOLDOUT_ID,heldOutVoltageReading,gradeVoltageDropHoldout}from"../src/volt-drop-transfer.js";
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
  const good=gradeVoltageDropHoldout({caseId:c.id,measurements:measures,loadPrediction,diagnosis:c.id,falsifier:0});
  assert.equal(good.score,100);assert.equal(good.passed,true);
  const bad=gradeVoltageDropHoldout({caseId:c.id,measurements:measures,loadPrediction:Number(loadPrediction)+0.5,diagnosis:c.id==="positive"?"return":"positive",falsifier:1});
  assert.equal(bad.passed,false);assert.equal(bad.score,0);
  assert.throws(()=>gradeVoltageDropHoldout({caseId:c.id,measurements:["positive"],loadPrediction,diagnosis:c.id,falsifier:0}),RangeError);
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
 const p={...base,cases:[...base.cases,{id:VOLT_DROP_HOLDOUT_ID,passed:true,attempt:1}]};
 e=lessonEvidence(p,"volt-drop");
 assert.equal(e.holdout.passed,true);
 assert.equal(e.holdout.firstRecordedAttemptPassed,true);
 assert.equal(e.documented,true);
});
