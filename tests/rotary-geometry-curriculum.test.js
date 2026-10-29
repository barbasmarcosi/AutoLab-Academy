import test from 'node:test';
import assert from 'node:assert/strict';
import{rotaryGeometryLessons,rotaryGeometryQuestions}from'../src/rotary-geometry-curriculum.js';
test('RW1+ one complete Green-integral lesson and four unique objective questions',()=>{
 assert.deepEqual(rotaryGeometryLessons.map(x=>x.id),['rw1-analytic-geometry-validation']);
 assert.equal(rotaryGeometryLessons[0].sections.length,4);
 assert.ok(rotaryGeometryLessons[0].sections.every(([heading,body])=>heading.length>=12&&body.length>=140));
 assert.equal(rotaryGeometryQuestions.length,4);
 assert.equal(new Set(rotaryGeometryQuestions.map(x=>x.id)).size,4);
 for(const q of rotaryGeometryQuestions){
  assert.equal(q.topic,'motor');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert.ok(q.answer>=0&&q.answer<4&&Number.isInteger(q.answer));
  assert.match(q.source,/^https:\/\//);
 }
});
