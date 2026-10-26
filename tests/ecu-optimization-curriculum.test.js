import test from'node:test';import assert from'node:assert/strict';
import{ecuOptimizationLessons,ecuOptimizationQuestions}from'../src/ecu-optimization-curriculum.js';
test('RW8 curriculum two lessons and eight questions sourced to engine control and optimization',()=>{
 assert.deepEqual(ecuOptimizationLessons.map(x=>x.id),['rw8-controller-boundaries','rw8-constrained-experiment']);
 assert.equal(ecuOptimizationQuestions.length,8);assert.equal(new Set(ecuOptimizationQuestions.map(x=>x.id)).size,8);
 for(const l of ecuOptimizationLessons){assert.equal(l.topic,'motor');assert.equal(l.sections.length,4);assert.ok(l.sections.every(([h,b])=>h.length>12&&b.length>150));assert.match(l.url,/^https:\/\//);}
 for(const q of ecuOptimizationQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.match(q.source,/^https:\/\//);}
});
