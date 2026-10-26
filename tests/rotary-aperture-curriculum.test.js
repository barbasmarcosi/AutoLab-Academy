import test from'node:test';import assert from'node:assert/strict';
import{rotaryApertureLessons,rotaryApertureQuestions}from'../src/rotary-aperture-curriculum.js';
test('RW6+ one evidence-limited lesson and four sourced questions',()=>{
 assert.deepEqual(rotaryApertureLessons.map(x=>x.id),['rw6-aperture-area-study']);
 assert.equal(rotaryApertureQuestions.length,4);
 for(const l of rotaryApertureLessons){assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.match(l.url,/^https:\/\//);
  assert.ok(l.sections.every(([h,b])=>h.length>=10&&b.length>120));}
 assert.equal(new Set(rotaryApertureQuestions.map(x=>x.id)).size,4);
 for(const q of rotaryApertureQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
