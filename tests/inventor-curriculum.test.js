import test from'node:test';import assert from'node:assert/strict';
import{inventorLessons,inventorQuestions}from'../src/inventor-curriculum.js';
test('MC14 has a sourced lesson and four unique objective exam questions',()=>{
 assert.deepEqual(inventorLessons.map(x=>x.id),['mc14-blackbox-identification']);
 assert.equal(inventorLessons[0].sections.length,4);
 assert.ok(inventorLessons[0].sections.every(([a,b])=>a.length>=10&&b.length>=140));
 assert.equal(inventorQuestions.length,4);
 assert.equal(new Set(inventorQuestions.map(x=>x.id)).size,4);
 for(const q of inventorQuestions){
  assert.equal(q.topic,'senales');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert.match(q.source,/^https:\/\//);
 }
});
