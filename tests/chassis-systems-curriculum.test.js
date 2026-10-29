import test from'node:test';import assert from'node:assert/strict';
import{chassisSystemsLessons,chassisSystemsQuestions}from'../src/chassis-systems-curriculum.js';
test('MC06–MC09: four deep lessons and 16 questions with unique IDs and provenance',()=>{
 assert.equal(chassisSystemsLessons.length,4);assert.equal(chassisSystemsQuestions.length,16);
 assert.equal(new Set(chassisSystemsLessons.map(x=>x.id)).size,4);
 assert.equal(new Set(chassisSystemsQuestions.map(x=>x.id)).size,16);
 for(const x of chassisSystemsLessons){assert.equal(x.topic,'motor');assert.equal(x.sections.length,4);assert.ok(x.sections.every(s=>s[1].length>=130));assert.match(x.url,/^https:\/\//);}
 for(const x of chassisSystemsQuestions){assert.equal(x.options.length,4);assert.equal(new Set(x.options).size,4);assert.ok(x.answer>=0&&x.answer<4);assert.match(x.source,/^https:\/\//);}
});
