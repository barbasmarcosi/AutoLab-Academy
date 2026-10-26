import test from'node:test';import assert from'node:assert/strict';
import{engineeringBridgeLessons,engineeringBridgeQuestions}from'../src/engineering-bridge-curriculum.js';
test('MC10–14: five researched technical bridge lessons and 20 objective questions',()=>{
 assert.equal(engineeringBridgeLessons.length,5);assert.equal(engineeringBridgeQuestions.length,20);
 assert.equal(new Set(engineeringBridgeLessons.map(x=>x.id)).size,5);
 assert.equal(new Set(engineeringBridgeQuestions.map(x=>x.id)).size,20);
 for(const l of engineeringBridgeLessons){assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.ok(l.sections.every(([t,b])=>t.length>10&&b.length>140));assert.match(l.url,/^https:\/\//);}
 for(const q of engineeringBridgeQuestions){assert.equal(q.topic,'motor');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
