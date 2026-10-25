import test from 'node:test';
import assert from 'node:assert/strict';
import{temporalLessons,temporalQuestions}from'../src/temporal-curriculum.js';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
import{differentialLessons,differentialQuestions}from'../src/differential-curriculum.js';
const L=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons];
const Q=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions,...temporalQuestions];
test('46 lecciones y 120 preguntas, IDs sin duplicados y cinco temas balanceados',()=>{
 assert.equal(L.length,46);assert.equal(Q.length,120);
 assert.equal(new Set(L.map(x=>x.id)).size,46);assert.equal(new Set(Q.map(x=>x.id)).size,120);
 for(const track of tracks){
  assert.equal(Q.filter(q=>q.topic===track.id).length,24);
  assert.equal(temporalLessons.filter(l=>l.topic===track.id).length,1);
  assert.equal(temporalQuestions.filter(q=>q.topic===track.id).length,2);
 }
});
test('contenido nuevo con 3 secciones, fuentes y claves de respuesta válidas',()=>{
 for(const l of temporalLessons){
  assert(l.minutes>=40);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [name,body]of l.sections){assert(name.length>=10);assert(body.length>=130);}
 }
 for(const q of temporalQuestions){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(q.answer>=0&&q.answer<4&&Number.isInteger(q.answer));assert(q.explanation.length>=80);
  assert.match(q.source,/^https:\/\//);
 }
});
