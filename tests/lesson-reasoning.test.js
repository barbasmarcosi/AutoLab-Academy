import test from'node:test';import assert from'node:assert/strict';
import{REASONING_CHALLENGES,reasoningChallenge,reasoningCaseId,gradeReasoning,reasoningReport,reasoningProgress}from'../src/lesson-reasoning.js';
const reasoning='Antes de medir, esta evidencia no discrimina por sí sola todas las causas. Tomaría una segunda prueba independiente y revisaría la hipótesis si esa lectura contradice la predicción congelada.';
const limitations='La simulación no tiene sensores calibrados ni datos OEM; no acredita aptitud real y requiere verificación física supervisada.';
test('eight guided reasoning exercises: ambiguous cases, unique choices, feedback and outcomes',()=>{
 assert.equal(REASONING_CHALLENGES.length,8);
 assert.equal(new Set(REASONING_CHALLENGES.map(x=>x.id)).size,8);
 for(const scenario of REASONING_CHALLENGES){
  assert.equal(scenario.steps.length,3);
  const answers=Object.fromEntries(scenario.steps.map(step=>[step.id,step.answer]));
  const valid={lessonId:scenario.id,answers,reasoning,limitations};
  const grade=gradeReasoning(valid);
  assert.equal(grade.score,100);assert.equal(grade.correct,3);assert.equal(grade.passed,true);
  assert.match(reasoningReport(valid,grade),/Predicción congelada/);
  assert.match(reasoningReport(valid,grade),/sin revisión semántica/);
  const bad={...answers,hypothesis:(answers.hypothesis+1)%3};
  assert.equal(gradeReasoning({...valid,answers:bad}).passed,false);
  assert.equal(gradeReasoning({...valid,answers:bad}).score,70);
  assert.equal(gradeReasoning({...valid,reasoning:'corto'}).passed,false);
  assert.equal(gradeReasoning({...valid,limitations:'corto'}).passed,false);
  assert.throws(()=>gradeReasoning({...valid,answers:{...answers,falsifier:-1}}),RangeError);
  assert.throws(()=>gradeReasoning({...valid,answers:{...answers,falsifier:3}}),RangeError);
  assert.throws(()=>gradeReasoning({...valid,answers:{...answers,falsifier:'2'}}),RangeError);
  assert.equal(reasoningProgress({notes:{['lesson-'+scenario.id]:new Date().toISOString()}},scenario.id).passed,false);
  const id=reasoningCaseId(scenario.id);
  assert.equal(reasoningProgress({cases:[{id,passed:false}]},scenario.id).status,'attempted');
  assert.equal(reasoningProgress({cases:[{id,passed:true}]},scenario.id).status,'passed');
 }
 assert.equal(reasoningChallenge('unknown'),null);
 assert.equal(reasoningProgress({cases:[]},'unknown').status,'unmapped');
});
