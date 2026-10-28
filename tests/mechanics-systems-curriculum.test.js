import test from'node:test';import assert from'node:assert/strict';
import{mechanicsSystemsLessons,mechanicsSystemsQuestions}from'../src/mechanics-systems-curriculum.js';
test('MC02-05: four units and 16 objective assessments, unique IDs, HTTPS provenance',()=>{
 assert.equal(mechanicsSystemsLessons.length,4);assert.equal(mechanicsSystemsQuestions.length,16);
 assert.equal(new Set(mechanicsSystemsLessons.map(x=>x.id)).size,4);
 assert.equal(new Set(mechanicsSystemsQuestions.map(x=>x.id)).size,16);
 for(const l of mechanicsSystemsLessons){
  assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.match(l.url,/^https:\/\//);
  assert.ok(l.sections.every(([title,body])=>title.length>=10&&body.length>=120));
 }
 for(const q of mechanicsSystemsQuestions){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert.ok(q.explanation.length>=35);assert.match(q.source,/^https:\/\//);
 }
});
