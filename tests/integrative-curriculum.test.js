import test from 'node:test';
import assert from 'node:assert/strict';
import{integrativeLessons,integrativeQuestions}from'../src/integrative-curriculum.js';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
import{differentialLessons,differentialQuestions}from'../src/differential-curriculum.js';
import{temporalLessons,temporalQuestions}from'../src/temporal-curriculum.js';
import{fuelLessons,fuelQuestions}from'../src/fuel-curriculum.js';
import{misfireLessons,misfireQuestions}from'../src/misfire-curriculum.js';
const earlierL=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons,...misfireLessons];
const earlierQ=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions,...temporalQuestions,...fuelQuestions,...misfireQuestions];
test('61 lecciones y 150 preguntas únicas, añadiendo exactamente 2 por especialidad',()=>{
 const L=[...earlierL,...integrativeLessons],Q=[...earlierQ,...integrativeQuestions];
 assert.equal(L.length,61);assert.equal(Q.length,150);
 assert.equal(new Set(L.map(x=>x.id)).size,L.length);assert.equal(new Set(Q.map(x=>x.id)).size,Q.length);
 for(const t of tracks){
  assert.equal(integrativeLessons.filter(l=>l.topic===t.id).length,1);
  assert.equal(integrativeQuestions.filter(q=>q.topic===t.id).length,2);
  assert.equal(Q.filter(q=>q.topic===t.id).length,earlierQ.filter(q=>q.topic===t.id).length+2);
 }
});
test('lecciones con tres secciones sólidas; preguntas con fuentes, cuatro opciones y explicación',()=>{
 for(const l of integrativeLessons){
  assert(l.minutes>=40);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [title,body]of l.sections){assert(title.length>=12);assert(body.length>=175);}
 }
 for(const q of integrativeQuestions){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>=95);assert.match(q.source,/^https:\/\//);
 }
});
