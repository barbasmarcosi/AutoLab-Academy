import test from 'node:test';
import assert from 'node:assert/strict';
import{tracks,lessons,questions}from'../src/content.js';
import{additionalLessons,additionalQuestions}from'../src/curriculum-advanced.js';
const allLessons=[...lessons,...additionalLessons];
const allQuestions=[...questions,...additionalQuestions];
test('el contenido crece a 16 lecciones y 60 preguntas, manteniendo IDs existentes',()=>{
 assert.equal(lessons.length,6);assert.equal(questions.length,30);
 assert.equal(additionalLessons.length,10);assert.equal(additionalQuestions.length,30);
 assert.equal(allLessons.length,16);assert.equal(allQuestions.length,60);
 assert.equal(new Set(allLessons.map(l=>l.id)).size,allLessons.length);
 assert.equal(new Set(allQuestions.map(q=>q.id)).size,allQuestions.length);
});
test('cinco dominios con al menos tres lecturas y 12 preguntas',()=>{
 for(const t of tracks){
  assert(allLessons.filter(l=>l.topic===t.id).length>=3);
  assert.equal(allQuestions.filter(q=>q.topic===t.id).length,12);
 }
});
test('lecciones aplicadas con evidencias contextuales y estructura consistente',()=>{
 for(const l of additionalLessons){
  assert(l.minutes>=20&&l.minutes<=60);
  assert.equal(l.sections.length,3);
  for(const [heading,body]of l.sections){assert(heading.length>=10);assert(body.length>=100);}
  assert.match(l.url,/^https:\/\//);
 }
});
test('banco editorial con 4 opciones, claves únicas y justificación verificable',()=>{
 for(const q of allQuestions){
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert(q.explanation.length>=40);
  assert.match(q.source,/^https:\/\//);
 }
});
