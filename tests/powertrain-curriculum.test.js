import test from'node:test';import assert from'node:assert/strict';
import{powertrainLessons,powertrainQuestions}from'../src/powertrain-curriculum.js';
test('MC06 provides a complete mechanical-diagnostic lesson with four unique assessed concepts',()=>{
 assert.deepEqual(powertrainLessons.map(l=>l.id),['mc06-dual-fault-instrumentation']);
 assert.equal(powertrainLessons[0].sections.length,4);
 assert.ok(powertrainLessons[0].sections.every(([title,body])=>title.length>14&&body.length>145));
 assert.equal(powertrainQuestions.length,4);
 assert.equal(new Set(powertrainQuestions.map(q=>q.id)).size,4);
 for(const q of powertrainQuestions){
  assert.equal(q.topic,'motor');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert.match(q.source,/^https:\/\//);
 }
});
