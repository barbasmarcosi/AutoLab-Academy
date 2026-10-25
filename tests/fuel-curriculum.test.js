import test from 'node:test';
import assert from 'node:assert/strict';
import{fuelLessons,fuelQuestions}from'../src/fuel-curriculum.js';
import{lessons,questions}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
import{differentialLessons,differentialQuestions}from'../src/differential-curriculum.js';
import{temporalLessons,temporalQuestions}from'../src/temporal-curriculum.js';
test('51 lecciones y 130 preguntas sin pérdida de IDs anteriores',()=>{
 const L=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons];
 const Q=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions,...temporalQuestions,...fuelQuestions];
 assert.equal(L.length,51);assert.equal(Q.length,130);
 assert.equal(new Set(L.map(l=>l.id)).size,L.length);
 assert.equal(new Set(Q.map(q=>q.id)).size,Q.length);
});
test('cinco nuevas lecturas contextualizadas y diez preguntas con respuesta verificable',()=>{
 assert.equal(fuelLessons.length,5);assert.equal(fuelQuestions.length,10);
 for(const l of fuelLessons){
  assert(l.minutes>=40);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [title,text] of l.sections){assert(title.length>10);assert(text.length>130);}
 }
 for(const q of fuelQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(q.answer>=0&&q.answer<4&&Number.isInteger(q.answer));assert(q.explanation.length>=90);assert.match(q.source,/^https:\/\//);
 }
});
