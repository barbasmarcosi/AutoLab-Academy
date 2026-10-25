import test from 'node:test';
import assert from 'node:assert/strict';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
test('currículo crece de 26/80 a 36/100 sin cambiar IDs anteriores',()=>{
 const L=[...lessons,...additionalLessons,...ecuLessons,...componentLessons];
 const Q=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions];
 assert.equal(L.length,36);assert.equal(Q.length,100);
 assert.equal(new Set(L.map(l=>l.id)).size,36);
 assert.equal(new Set(Q.map(q=>q.id)).size,100);
 assert.equal(componentLessons.length,10);assert.equal(componentQuestions.length,20);
 for(const t of tracks){assert.equal(L.filter(x=>x.topic===t.id).length>=5,true);assert.equal(Q.filter(x=>x.topic===t.id).length,20);}
});
test('contenido nuevo con secciones técnicas y fuentes públicas',()=>{
 for(const l of componentLessons){assert(l.minutes>=30);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [heading,body]of l.sections){assert(heading.length>12);assert(body.length>=80);}
 }
 for(const q of componentQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=3);assert(q.explanation.length>=65);assert.match(q.source,/^https:\/\//);}
});
