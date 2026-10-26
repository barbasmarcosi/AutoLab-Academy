import test from'node:test';import assert from'node:assert/strict';
import{REASONING_CHALLENGES}from'../src/lesson-reasoning.js';
import{TRANSFER_MODEL,TRANSFER_CASES,transferCase,transferCaseId,gradeReasoningTransfer,reasoningTransferReport,transferProgress}from'../src/lesson-transfer.js';
const reasoning='Una medición aislada no demuestra causalidad; contrastaré un observable independiente y abandonaré mi hipótesis original si contradice una predicción falsable. El caso debe investigarse antes de reemplazar componentes.';
const limitations='Estos datos provienen de un banco sintético. Requieren instrumentos calibrados, condiciones reproducibles y supervisión antes de concluir sobre un vehículo real.';
test('18 counterfactuals test transfer rather than repeating the original answer key',()=>{
 assert.equal(TRANSFER_CASES.length,REASONING_CHALLENGES.length);
 assert.equal(new Set(TRANSFER_CASES.map(x=>x.lessonId)).size,18);
 for(const challenge of REASONING_CHALLENGES){
  const transfer=transferCase(challenge.id);assert.ok(transfer);
  assert.equal(transfer.options.length,3);assert.equal(new Set(transfer.options).size,3);
  assert.ok(transfer.context.length>85&&transfer.feedback.length>65);
  const answers=Object.fromEntries(challenge.steps.map(s=>[s.id,s.answer]));
  const base={lessonId:challenge.id,answers,transferAnswer:transfer.answer,reasoning,limitations};
  const full=gradeReasoningTransfer(base);
  assert.equal(full.model,TRANSFER_MODEL);assert.equal(full.score,100);assert.equal(full.passed,true);
  assert.equal(full.transferCorrect,true);
  assert.match(reasoningTransferReport(base,full),/Escenario reservado/);
  assert.match(reasoningTransferReport(base,full),/sin evaluación semántica/);
  const mistaken=(transfer.answer+1)%3;
  const fail=gradeReasoningTransfer({...base,transferAnswer:mistaken});
  assert.equal(fail.score,70);assert.equal(fail.passed,false);
  const failFirst=gradeReasoningTransfer({...base,answers:{...answers,hypothesis:(answers.hypothesis+1)%3}});
  assert.equal(failFirst.score,80);assert.equal(failFirst.passed,false);
  assert.throws(()=>gradeReasoningTransfer({...base,transferAnswer:null}),RangeError);
  assert.throws(()=>gradeReasoningTransfer({...base,transferAnswer:3}),RangeError);
  assert.equal(transferProgress({cases:[]},challenge.id).status,'not-started');
  const legacy=transferProgress({cases:[{id:'lab-reasoning-'+challenge.id+'-v1',passed:true}]},challenge.id);
  assert.equal(legacy.status,'legacy-passed');assert.equal(legacy.passed,false);
  assert.deepEqual(transferProgress({cases:[{id:transferCaseId(challenge.id),passed:true}]},challenge.id),{status:'passed',attempts:1,passed:true,legacy:false});
 }
});
