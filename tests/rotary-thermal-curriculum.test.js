import test from'node:test';import assert from'node:assert/strict';
import{rotaryThermalLessons,rotaryThermalQuestions}from'../src/rotary-thermal-curriculum.js';
test('RW2/RW3: 2 lessons and 8 objective questions with traceable conceptual sources',()=>{
 assert.equal(rotaryThermalLessons.length,2);assert.equal(rotaryThermalQuestions.length,8);
 assert.equal(new Set(rotaryThermalLessons.map(x=>x.id)).size,2);
 assert.equal(new Set(rotaryThermalQuestions.map(x=>x.id)).size,8);
 for(const x of rotaryThermalLessons){
  assert.equal(x.topic,'motor');assert.ok(x.sections.length>=4);
  assert.ok(x.sections.every(([h,b])=>h.length>10&&b.length>120));
  assert.match(x.url,/^https:\/\//);
 }
 for(const q of rotaryThermalQuestions){
  assert.equal(q.topic,'motor');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert.ok(q.answer>=0&&q.answer<4);
  assert.match(q.source,/^https:\/\//);
 }
});
