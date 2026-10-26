import test from'node:test';import assert from'node:assert/strict';
import{rotaryInverseLessons,rotaryInverseQuestions}from'../src/rotary-aperture-inverse-curriculum.js';
test('RW6++ inverse problem curriculum and four questions are traceable and complete',()=>{
 assert.deepEqual(rotaryInverseLessons.map(l=>l.id),['rw6-inverse-area-metrology']);
 assert.equal(rotaryInverseQuestions.length,4);
 const l=rotaryInverseLessons[0];assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);
 assert.ok(l.sections.every(([title,body])=>title.length>=15&&body.length>=140));
 assert.match(l.url,/^https:\/\//);
 assert.equal(new Set(rotaryInverseQuestions.map(q=>q.id)).size,4);
 for(const q of rotaryInverseQuestions){assert.equal(q.topic,'motor');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
