import test from 'node:test';
import assert from 'node:assert/strict';
import{differentialLessons,differentialQuestions}from'../src/differential-curriculum.js';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
test('ampliación mantiene IDs y 41 lecciones / 110 preguntas',()=>{
 const L=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons];
 const Q=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions];
 assert.equal(L.length,41);assert.equal(Q.length,110);
 assert.equal(new Set(L.map(l=>l.id)).size,41);
 assert.equal(new Set(Q.map(q=>q.id)).size,110);
 for(const topic of tracks){assert.equal(differentialLessons.filter(l=>l.topic===topic.id).length,1);
  assert.equal(differentialQuestions.filter(q=>q.topic===topic.id).length,2);
  assert.equal(Q.filter(q=>q.topic===topic.id).length,22);}
});
test('fuentes, explicaciones y secciones mantienen trazabilidad',()=>{
 for(const l of differentialLessons){assert(l.minutes>=35);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [heading,body]of l.sections){assert(heading.length>=10);assert(body.length>=110);}
 }
 for(const q of differentialQuestions){assert(q.options.length===4&&new Set(q.options).size===4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>=70);assert.match(q.source,/^https:\/\//);}
});
