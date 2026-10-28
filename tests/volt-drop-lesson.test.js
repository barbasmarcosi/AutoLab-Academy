import test from "node:test";
import assert from "node:assert/strict";
import {VOLT_DROP_CASE_ID,VOLT_DROP_CHECKS,voltageDropModel,checkVoltageDropAnswer,diagnoseVoltageDrop,voltDropTheoryIllustration} from "../src/volt-drop-lesson.js";
import {lessonPractice,practiceProgress} from "../src/lesson-practice.js";

test("lesson-1 worked example obeys Ohm and Kirchhoff equations",()=>{
 const v=voltageDropModel();
 assert.equal(v.sourceV,12);
 assert.equal(v.currentA,4.8);
 assert.ok(Math.abs(v.positiveV-0.48)<1e-12);
 assert.ok(Math.abs(v.returnV-1.92)<1e-12);
 assert.ok(Math.abs(v.loadV-9.6)<1e-12);
 assert.ok(Math.abs(v.balanceV-v.sourceV)<1e-12);
 assert.equal(diagnoseVoltageDrop(v,"return").correct,true);
 assert.equal(diagnoseVoltageDrop(v,"positive").correct,false);
});
test("zero current hides resistive voltage drop but not source potential",()=>{
 const open=voltageDropModel({energized:false,returnOhm:1});
 assert.deepEqual([open.currentA,open.positiveV,open.returnV,open.loadV,open.sourceV],[0,0,0,0,12]);
});
test("controlled intervention changes measurements and the winning hypothesis",()=>{
 const pos=voltageDropModel({positiveOhm:0.8,returnOhm:0.04,loadOhm:2});
 assert.equal(diagnoseVoltageDrop(pos,"positive").correct,true);
 const close=voltageDropModel({positiveOhm:0.1,returnOhm:0.1,loadOhm:2});
 assert.equal(diagnoseVoltageDrop(close,"balanced").correct,true);
 const better=voltageDropModel({positiveOhm:0.1,returnOhm:0.04,loadOhm:2});
 assert.ok(better.loadV>voltageDropModel().loadV);
});
test("unsafe and nonfinite mathematical inputs are rejected",()=>{
 for(const props of [{sourceV:0},{sourceV:400},{loadOhm:0},{positiveOhm:-1},{returnOhm:NaN},{loadOhm:Infinity}]){
  assert.throws(()=>voltageDropModel(props),RangeError);
 }
 assert.throws(()=>diagnoseVoltageDrop(voltageDropModel(),"replace-battery"),RangeError);
});
test("all three formative checks provide immediate corrective explanations",()=>{
 assert.equal(VOLT_DROP_CHECKS.length,3);
 for(const q of VOLT_DROP_CHECKS){
  const answers=q.options.map((_,i)=>checkVoltageDropAnswer(q.id,i));
  assert.equal(answers.filter(x=>x.correct).length,1);
  assert.ok(answers.every(x=>x.why.length>25&&x.expected&&x.selected&&x.explanation.length>25));
  assert.ok(answers.some(x=>!x.correct));
 }
 assert.throws(()=>checkVoltageDropAnswer("units",200),RangeError);
 assert.throws(()=>checkVoltageDropAnswer("unknown",0),RangeError);
});
test("first lesson records instrument-model evidence without granting physical competence",()=>{
 const p=lessonPractice("volt-drop");
 assert.equal(p.page,"volt-drop");
 assert.equal(p.kind,"embedded");
 assert.equal(p.caseId,VOLT_DROP_CASE_ID);
 assert.equal(practiceProgress({cases:[]},"volt-drop").passed,false);
 assert.equal(practiceProgress({cases:[{id:VOLT_DROP_CASE_ID,passed:true}]},"volt-drop").passed,true);
 const theory=voltDropTheoryIllustration();
 assert.match(theory,/4,80 A/);
 assert.match(theory,/no acredita|no modela|no representa/i);
});
