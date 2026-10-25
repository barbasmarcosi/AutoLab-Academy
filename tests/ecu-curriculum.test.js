import test from 'node:test';
import assert from 'node:assert/strict';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
const allL=[...lessons,...additionalLessons,...ecuLessons],allQ=[...questions,...additionalQuestions,...ecuQuestions];
test('26 lecciones y 80 preguntas con identificadores estables y únicos',()=>{
 assert.equal(allL.length,26);assert.equal(allQ.length,80);
 assert.equal(new Set(allL.map(l=>l.id)).size,26);
 assert.equal(new Set(allQ.map(q=>q.id)).size,80);
});
test('16 preguntas por especialidad y 2 nuevas lecciones por tema',()=>{
 assert.equal(ecuLessons.length,10);assert.equal(ecuQuestions.length,20);
 for(const t of tracks){
  assert.equal(allQ.filter(q=>q.topic===t.id).length,16);
  assert.equal(ecuLessons.filter(l=>l.topic===t.id).length,2);
  assert.equal(ecuQuestions.filter(q=>q.topic===t.id).length,4);
 }
});
test('contenidos ECU con casos, tres secciones, preguntas bien formadas y fuentes',()=>{
 for(const l of ecuLessons){assert(l.minutes>=30);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [head,text]of l.sections){assert(head.length>=10);assert(text.length>=95);}
 }
 for(const q of ecuQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>=70);assert.match(q.source,/^https:\/\//);
 }
});
