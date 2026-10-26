import test from 'node:test';
import assert from 'node:assert/strict';
import{mechanicsLessons,mechanicsQuestions}from'../src/mechanics-curriculum.js';
test('MC00-MC01-MC03 ofrecen contenido técnico, fuente y 12 preguntas válidas',()=>{
 assert.equal(mechanicsLessons.length,4);
 assert.equal(mechanicsQuestions.length,12);
 assert.equal(new Set(mechanicsLessons.map(x=>x.id)).size,4);
 for(const l of mechanicsLessons){
  assert.ok(l.sections.length>=4);
  assert.ok(l.sections.every(([a,b])=>a.length>=4&&b.length>=100));
  assert.match(l.url,/^https:\/\//);
 }
 for(const q of mechanicsQuestions){
  assert.equal(q.topic,'motor');assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert.ok(q.answer>=0&&q.answer<4);
  assert.ok(q.explanation.length>30);
  assert.match(q.source,/^https:\/\//);
 }
});
