import test from'node:test';
import assert from'node:assert/strict';
import{LESSON_PRACTICES,lessonPractice,practiceProgress,practiceCoverage}from'../src/lesson-practice.js';
import{learningStages}from'../src/learning-path.js';
test('all practice bridges are unique, target genuine stages and use known labs',()=>{
 const catalog=learningStages.flatMap(s=>s.lessons).map(id=>({id}));
 const coverage=practiceCoverage(catalog);
 assert.equal(catalog.length,94);
 assert.equal(coverage.total,94);
 assert.equal(coverage.mapped,16);
 assert.equal(coverage.embedded,4);
 assert.equal(coverage.linked,12);
 assert.equal(coverage.unmapped,78);
 assert.deepEqual(coverage.invalid,[]);
 assert.equal(new Set(LESSON_PRACTICES.map(p=>p.lessonId)).size,16);
 const supported=new Set(['rotary','rotary-thermal','rotary-heat','rotary-ports','rotary-aperture','rotary-inverse','ecu-robust','metrology','inventor','brakes','powertrain']);
 assert.ok(LESSON_PRACTICES.every(p=>supported.has(p.page)&&['embedded','linked'].includes(p.kind)&&p.title.length>12&&p.prompt.length>35));
 assert.equal(lessonPractice('not-a-lesson'),null);
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
 assert.deepEqual(practiceProgress({cases:[{id:p.caseId,passed:true}]},'volt-drop'),{status:'unmapped',attempts:0,passed:false});
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
