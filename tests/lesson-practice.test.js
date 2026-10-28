import test from'node:test';
import assert from'node:assert/strict';
import{LESSON_PRACTICES,lessonPractice,practiceProgress,practiceCoverage}from'../src/lesson-practice.js';
import{learningStages}from'../src/learning-path.js';
import{NUMERIC_BENCHES}from'../src/numeric-inquiry.js';
import{WAVE_INQUIRIES}from'../src/waveform-inquiry.js';
test('all practice bridges are unique, target genuine stages and use known labs',()=>{
 const catalog=learningStages.flatMap(s=>s.lessons).map(id=>({id}));
 const coverage=practiceCoverage(catalog);
 assert.equal(catalog.length,94);
 assert.equal(coverage.total,94);
 assert.equal(coverage.mapped,35);
 assert.equal(coverage.embedded,23);
 assert.equal(coverage.linked,12);
 assert.equal(coverage.unmapped,59);
 assert.deepEqual(coverage.invalid,[]);
 assert.equal(new Set(LESSON_PRACTICES.map(p=>p.lessonId)).size,35);
 const supported=new Set(['rotary','rotary-thermal','rotary-heat','rotary-ports','rotary-aperture','rotary-inverse','ecu-robust','metrology','inventor','brakes','powertrain','numeric-bench','wave-inquiry','volt-drop','dtc-guided']);
 assert.ok(LESSON_PRACTICES.every(p=>supported.has(p.page)&&['embedded','linked'].includes(p.kind)&&p.title.length>12&&p.prompt.length>35));
 assert.equal(lessonPractice('not-a-lesson'),null);
});
test('all thirteen numeric models are embedded in exactly their own lesson, with distinct evidence IDs',()=>{
 assert.equal(NUMERIC_BENCHES.length,13);
 const curriculumIds=new Set(learningStages.flatMap(stage=>stage.lessons));
 for(const model of NUMERIC_BENCHES){
  assert.ok(curriculumIds.has(model.lessonId));
  const entry=lessonPractice(model.lessonId);
  assert.equal(entry?.kind,'embedded');
  assert.equal(entry?.page,'numeric-bench');
  assert.equal(entry?.caseId,model.caseId);
  assert.equal(practiceProgress({cases:[]},model.lessonId).passed,false);
  const evidence=practiceProgress({cases:[{id:model.caseId,passed:true}]},model.lessonId);
  assert.equal(evidence.passed,true);
 }
});
test('four wave lab bridges point to their specific lessons and never other evidence',()=>{
 assert.equal(WAVE_INQUIRIES.length,4);
 for(const w of WAVE_INQUIRIES){
  const p=lessonPractice(w.lessonId);
  assert.equal(p?.kind,'embedded');
  assert.equal(p?.page,'wave-inquiry');
  assert.equal(p?.caseId,w.caseId);
  assert.equal(practiceProgress({cases:[]},w.lessonId).passed,false);
  assert.equal(practiceProgress({cases:[{id:w.caseId,passed:true}]},w.lessonId).passed,true);
 }
});
test('reading progress never masquerades as a passed practice or vice versa',()=>{
 const id='mc06-dual-fault-instrumentation',p=lessonPractice(id);
 assert.equal(p.caseId,'lab-powertrain-mc06-v1');
 assert.deepEqual(practiceProgress({notes:{['lesson-'+id]:'2026-10-26'}},id),{status:'not-started',attempts:0,passed:false});
 assert.deepEqual(practiceProgress({cases:[{id:p.caseId,passed:false}]},id),{status:'attempted',attempts:1,passed:false});
 const passed=practiceProgress({cases:[{id:p.caseId,passed:false},{id:p.caseId,passed:true}]},id);
 assert.deepEqual(passed,{status:'passed',attempts:2,passed:true});
 assert.equal(practiceProgress({cases:[{id:'lab-inventor-blackbox-v1',passed:true}]},id).status,'not-started');
 assert.equal(practiceProgress({cases:[{id:p.caseId,passed:'true'}]},id).passed,false);
 assert.deepEqual(practiceProgress({cases:[{id:p.caseId,passed:true}]},'volt-drop'),{status:'not-started',attempts:0,passed:false});
});

test('related lab evidence does not certify a separate linked lesson',()=>{
 const related=practiceProgress({cases:[{id:'lab-powertrain-mc06-v1',passed:true}]},'mc06-gears-powertrain');
 assert.equal(related.status,'related-passed');
 assert.equal(related.passed,false);
 assert.equal(related.attempts,1);
 const attempt=practiceProgress({cases:[{id:'lab-powertrain-mc06-v1',passed:false}]},'mc06-gears-powertrain');
 assert.equal(attempt.status,'related-attempted');
 assert.equal(attempt.passed,false);
});
