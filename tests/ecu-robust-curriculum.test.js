import test from'node:test';import assert from'node:assert/strict';
import{ecuRobustLessons,ecuRobustQuestions}from'../src/ecu-robust-curriculum.js';
test('RW8++ three theory blocks and twelve questions have valid IDs, answers and sources',()=>{
 assert.deepEqual(ecuRobustLessons.map(x=>x.id),['rw8-robust-uncertainty','rw8-pareto-frontier','rw8-factorial-coupled-design']);
 assert.equal(ecuRobustQuestions.length,12);
 assert.equal(new Set(ecuRobustQuestions.map(x=>x.id)).size,12);
 for(const l of ecuRobustLessons){assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.match(l.url,/^https:\/\//);assert.ok(l.sections.every(([a,b])=>a.length>10&&b.length>140));}
 for(const q of ecuRobustQuestions){assert.equal(q.topic,'motor');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
