import test from 'node:test';
import assert from 'node:assert/strict';
import{misfireLessons,misfireQuestions}from'../src/misfire-curriculum.js';
import{lessons,questions,tracks}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'../src/ecu-curriculum.js';
import{componentLessons,componentQuestions}from'../src/components-curriculum.js';
import{differentialLessons,differentialQuestions}from'../src/differential-curriculum.js';
import{temporalLessons,temporalQuestions}from'../src/temporal-curriculum.js';
import{fuelLessons,fuelQuestions}from'../src/fuel-curriculum.js';
const allLessons=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons,...misfireLessons];
const allQuestions=[...questions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions,...temporalQuestions,...fuelQuestions,...misfireQuestions];
test('56 lecturas y 140 preguntas sin duplicar identificadores ni alterar IDs anteriores',()=>{
 assert.equal(allLessons.length,56);assert.equal(allQuestions.length,140);
 assert.equal(new Set(allLessons.map(x=>x.id)).size,56);
 assert.equal(new Set(allQuestions.map(x=>x.id)).size,140);
 for(const t of tracks){assert.equal(misfireLessons.filter(l=>l.topic===t.id).length,1);
  assert.equal(misfireQuestions.filter(q=>q.topic===t.id).length,2);
  const previousCount=allQuestions.filter(q=>q.topic===t.id&&!q.id.startsWith('misfire-q-')).length;
  assert.equal(allQuestions.filter(q=>q.topic===t.id).length,previousCount+2);}
});
test('cinco lecciones con 3 secciones y diez preguntas verificables y referenciadas',()=>{
 for(const l of misfireLessons){assert(l.minutes>=40);assert.equal(l.sections.length,3);assert.match(l.url,/^https:\/\//);
  for(const [title,body]of l.sections){assert(title.length>=10);assert(body.length>=130);}
 }
 for(const q of misfireQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>=100);assert.match(q.source,/^https:\/\//);
 }
});
