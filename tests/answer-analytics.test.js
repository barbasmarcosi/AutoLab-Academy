import test from 'node:test';
import assert from 'node:assert/strict';
import{emptyProgress,serializeBackup,parseBackup}from'../src/core.js';
import{questionConcept,summarizeAnswerEvidence,selectErrorRetake,exportErrorEvidence}from'../src/answer-analytics.js';
const bank=[
 {id:'fuel-q-motor-1',topic:'motor',question:'¿Cómo funciona STFT?',options:['a','b','c','d'],answer:1,explanation:'Corrección de combustible',source:'https://example.com'},
 {id:'integral-q-senales-1',topic:'senales',question:'¿Por qué correlacionar?',options:['a','b','c','d'],answer:2,explanation:'Contexto y señal',source:'https://example.com'},
 {id:'plain',topic:'ev',question:'¿Qué indica el indicador?',options:['a','b','c','d'],answer:0,explanation:'No hay etiqueta',source:'https://example.com'}
];
const at=(time,details)=>({id:'exam-'+time,topic:'cumulative',percentage:50,at:time,details});
const d=(id,selected,confidence='normal')=>({id,selected,correct:false,confidence});
test('historial antiguo no se fabrica ni se convierte en conceptos',()=>{
 const p=emptyProgress();p.attempts=[{id:'old',topic:'cumulative',percentage:20,at:'2026-01-01'}];
 const a=summarizeAnswerEvidence(p,bank);
 assert.equal(a.recordedAttempts,0);assert.equal(a.legacyAttempts,1);
 assert.equal(a.activeErrors,0);assert.equal(a.observedAnswers,0);
});
test('errores por pregunta cruzan exámenes acumulativos con temas reales sin inventar notas de área',()=>{
 const p=emptyProgress();p.attempts=[
  at('2026-01-01T00:00:00Z',[d('fuel-q-motor-1',0,'high'),d('integral-q-senales-1',2,'low')]),
  at('2026-01-02T00:00:00Z',[d('fuel-q-motor-1',3,'high'),d('plain',0,'low')])
 ];
 const a=summarizeAnswerEvidence(p,bank);
 assert.equal(a.recordedAttempts,2);assert.equal(a.observedAnswers,4);
 assert.equal(a.activeErrors,1);assert.equal(a.repeatedErrors,1);
 assert.equal(a.missed[0].id,'fuel-q-motor-1');assert.equal(a.missed[0].wrongCount,2);
 assert.equal(a.highConfidenceWrong,2);assert.equal(a.lowConfidenceCorrect,2);
 assert.equal(a.concepts[0].name,'Control de mezcla e inyección');
 assert.equal(questionConcept(bank[2]),'Fundamentos del área (sin etiqueta fina)');
});
test('un acierto posterior resuelve error activo pero mantiene su historial',()=>{
 const p=emptyProgress();
 p.attempts=[at('2026-01-01T00:00:00Z',[d('fuel-q-motor-1',0)]),
  at('2026-01-02T00:00:00Z',[d('fuel-q-motor-1',1,'low')])];
 const a=summarizeAnswerEvidence(p,bank);
 assert.equal(a.activeErrors,0);assert.equal(a.observedAnswers,2);
 assert.equal(a.hesitant.length,1);assert.equal(a.repeatedErrors,0);
});
test('no crea evidencia de respuesta omitida, desconocida ni duplicada en un mismo examen',()=>{
 const p=emptyProgress();p.attempts=[at('2026-01-02T00:00:00Z',
  [d('fuel-q-motor-1',null),d('fuel-q-motor-1',0),d('unknown',1),d('plain',0),d('plain',2)])];
 const a=summarizeAnswerEvidence(p,bank);
 assert.equal(a.observedAnswers,1);assert.equal(a.unknownQuestionRecords,1);
 assert.equal(a.activeErrors,0);
});
test('reentrena únicamente preguntas con última respuesta incorrecta y respeta límites',()=>{
 const p=emptyProgress();p.attempts=[at('2026-01-01T00:00:00Z',[d('fuel-q-motor-1',0),d('plain',0)])];
 const a=summarizeAnswerEvidence(p,bank);
 assert.deepEqual(selectErrorRetake(a,bank).map(q=>q.id),['fuel-q-motor-1']);
 assert.throws(()=>selectErrorRetake(a,bank,31));
 const text=exportErrorEvidence(a,new Date('2026-10-25T12:00:00Z'));
 assert.match(text,/análisis de respuestas observadas/i);
 assert.match(text,/No se reinterpretan los exámenes/);
});
test('los detalles sobreviven respaldo sin adjudicar puntajes históricos',()=>{
 const p=emptyProgress();p.attempts=[{id:'historical',topic:'all',percentage:70,at:'2025-02-01'},
  at('2026-01-01T00:00:00Z',[d('fuel-q-motor-1',0,'high')])];
 const before=summarizeAnswerEvidence(p,bank);
 const after=summarizeAnswerEvidence(parseBackup(serializeBackup(p)),bank);
 assert.deepEqual(after,before);
 assert.equal(after.legacyAttempts,1);
});
