import test from'node:test';import assert from'node:assert/strict';
import{rotaryPortBurnLessons,rotaryPortBurnQuestions}from'../src/rotary-port-burn-curriculum.js';
test('RW6/7 lessons and source-backed question bank are nonduplicated and structurally complete',()=>{
 assert.deepEqual(rotaryPortBurnLessons.map(x=>x.id),['rw6-port-phase-tradeoffs','rw7-burn-shape-literacy']);
 assert.equal(rotaryPortBurnQuestions.length,8);
 assert.equal(new Set(rotaryPortBurnQuestions.map(x=>x.id)).size,8);
 for(const l of rotaryPortBurnLessons){
  assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.match(l.url,/^https:\/\//);
  assert.ok(l.sections.every(([h,b])=>h.length>=12&&b.length>140));
 }
 for(const q of rotaryPortBurnQuestions){
  assert.equal(q.topic,'motor');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);
  assert.ok(q.explanation.length>45);assert.match(q.source,/^https:\/\//);
 }
});
