import test from'node:test';import assert from'node:assert/strict';
import{rotaryHeatLessons,rotaryHeatQuestions}from'../src/rotary-heat-curriculum.js';
test('RW5 lesson and four questions are sourced, non-OEM and structurally complete',()=>{
 assert.equal(rotaryHeatLessons.length,1);assert.equal(rotaryHeatQuestions.length,4);
 const l=rotaryHeatLessons[0];assert.equal(l.id,'rw5-convection-limits');assert.equal(l.sections.length,4);
 assert.ok(l.sections.every(([h,b])=>h.length>=12&&b.length>=120));assert.match(l.url,/^https:\/\//);
 for(const q of rotaryHeatQuestions){assert.equal(q.topic,'motor');assert.equal(q.options.length,4);assert.ok(q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
