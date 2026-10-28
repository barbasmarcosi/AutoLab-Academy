import test from'node:test';import assert from'node:assert/strict';
import{mechanicsExamStages,mechanicsStageQuestions}from'../src/mechanics-exams.js';
import{mechanicsQuestions}from'../src/mechanics-curriculum.js';
import{mechanicsSystemsQuestions}from'../src/mechanics-systems-curriculum.js';
import{chassisSystemsQuestions}from'../src/chassis-systems-curriculum.js';
import{engineeringBridgeQuestions}from'../src/engineering-bridge-curriculum.js';
const qs=[...mechanicsQuestions,...mechanicsSystemsQuestions,...chassisSystemsQuestions,...engineeringBridgeQuestions];
test('64 MC questions assigned uniquely across five module exams',()=>{
 assert.equal(qs.length,64);assert.equal(mechanicsExamStages.length,5);
 const all=mechanicsExamStages.flatMap(s=>mechanicsStageQuestions(qs,s.id));
 assert.equal(all.length,64);assert.equal(new Set(all.map(q=>q.id)).size,64);
 for(const s of mechanicsExamStages)assert.ok(mechanicsStageQuestions(qs,s.id).length>=6);
 assert.throws(()=>mechanicsStageQuestions(qs,'unknown'),RangeError);
});
test('MC03 alternate historical ids remain assigned to engine stage',()=>{
 const ids=mechanicsStageQuestions(qs,'engine-core').map(x=>x.id);
 assert.ok(ids.some(id=>id.startsWith('mc03sys-')));
 assert.ok(ids.some(id=>id.startsWith('mc03-')));
});
