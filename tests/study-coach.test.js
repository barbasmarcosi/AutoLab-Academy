import test from 'node:test';
import assert from 'node:assert/strict';
import{emptyProgress,parseBackup,serializeBackup}from'../src/core.js';
import{tracks}from'../src/content.js';
import{analyzeStudyEvidence,makeDailyStudyPlan,formatStudyPlan}from'../src/study-coach.js';
const questions=[{id:'e1',topic:'electricidad'},{id:'e2',topic:'electricidad'},{id:'m1',topic:'motor'},{id:'s1',topic:'senales'},{id:'r1',topic:'redes'},{id:'v1',topic:'ev'}];
const lessons=[{id:'lesson-e',topic:'electricidad',title:'Caídas de tensión'},{id:'lesson-m',topic:'motor',title:'Lazo cerrado'}];
const cases=[{id:'case-e',topic:'electricidad'},{id:'case-m',topic:'motor'},{id:'case-v',topic:'ev'}];
const now=new Date('2026-10-25T12:00:00.000Z');
const analyze=p=>analyzeStudyEvidence(p,questions,lessons,tracks,cases,now);
test('sin datos no inventa dominio, fallos ni horas; propone una evaluación',()=>{
 const a=analyze(emptyProgress()),e=a.topics[0];
 assert.equal(a.focus.id,'electricidad');assert.equal(a.dueTotal,0);
 assert.equal(e.noEvidence,true);assert.equal(e.latestExamPct,null);
 assert.equal(e.practiceCount,0);assert.equal(e.untested,2);assert.equal(e.incorrect,0);
 const plan=makeDailyStudyPlan(a,'auto',30);
 assert.deepEqual(plan.steps.map(x=>x.type),['lesson','exam']);
 assert.equal(plan.plannedMinutes,25);
});
test('exámenes acumulativos, review y global no inventan resultados por especialidad',()=>{
 const p=emptyProgress();
 p.attempts.push({id:'all',topic:'all',percentage:20,at:'2026-10-25T09:00:00Z'},
  {id:'cum',topic:'cumulative',percentage:100,at:'2026-10-25T10:00:00Z'},
  {id:'review',topic:'review',percentage:0,at:'2026-10-25T11:00:00Z'});
 const a=analyze(p);
 assert.equal(a.excludedAggregateExams,3);assert.equal(a.topics[0].latestExamPct,null);
 assert.equal(a.topics[0].noEvidence,true);
 p.attempts.push({id:'specific',topic:'electricidad',percentage:70,at:'2026-10-25T11:00:00Z'});
 assert.equal(analyze(p).topics[0].latestExamPct,70);
});
test('preguntas vencidas por ID existente y últimas respuestas incorrectas elevan prioridad',()=>{
 const p=emptyProgress();
 p.reviews.m1={due:'2026-10-24T12:00:00Z',correct:false,last:'2026-10-24T12:00:00Z'};
 p.reviews.bad={due:'2026-10-24T12:00:00Z',correct:false,last:'2026-10-24T12:00:00Z'};
 p.reviews.e1={due:'2026-10-27T12:00:00Z',correct:true,last:'2026-10-22T12:00:00Z'};
 const a=analyze(p);
 assert.equal(a.focus.id,'motor');assert.equal(a.dueTotal,1);
 assert.equal(a.topics.find(t=>t.id==='motor').incorrect,1);
 assert.equal(a.topics.find(t=>t.id==='electricidad').future,1);
 assert.equal(a.reviewedQuestions,2);
});
test('caso desconocido no se convierte en aptitud ni se atribuye a un área',()=>{
 const p=emptyProgress();
 p.cases.push({id:'case-v',at:'2026-10-24T10:00:00Z',score:100,passed:false},
  {id:'unknown',at:'2026-10-25T11:00:00Z',score:100,passed:true});
 const a=analyze(p),ev=a.topics.find(t=>t.id==='ev');
 assert.equal(ev.practiceCount,1);assert.equal(ev.latestPracticePassed,false);
 assert.equal(a.excludedCaseRecords,1);
 assert(ev.signals.some(s=>s.includes('sin criterios')));
});
test('planes de 15, 30 y 45 minutos nunca exceden presupuesto',()=>{
 const p=emptyProgress();p.reviews.e1={due:'2026-10-24T12:00:00Z',correct:true,last:'2026-10-23T12:00:00Z'};
 const a=analyze(p);
 for(const minutes of [15,30,45]){
  const plan=makeDailyStudyPlan(a,'electricidad',minutes);
  assert(plan.plannedMinutes<=minutes);
  assert.equal(plan.plannedMinutes,plan.steps.reduce((s,x)=>s+x.minutes,0));
  assert.equal(new Set(plan.steps.map(x=>x.type)).size,plan.steps.length);
 }
 assert.deepEqual(makeDailyStudyPlan(a,'electricidad',45).steps.map(x=>x.type),['review','lesson','exam']);
 assert.throws(()=>makeDailyStudyPlan(a,'inventado',30));assert.throws(()=>makeDailyStudyPlan(a,'auto',5));
});
test('lecturas y backup mantienen recomendaciones sin cambiar esquema',()=>{
 const p=emptyProgress();p.notes['lesson-lesson-e']='2026-10-24T00:00:00Z';
 p.attempts.push({id:'exam-1',topic:'electricidad',percentage:65,at:'2026-10-24T12:00:00Z'});
 const prior=analyze(p),restored=analyze(parseBackup(serializeBackup(p)));
 assert.deepEqual(restored,prior);assert.equal(prior.topics[0].nextLessonId,null);
 const report=formatStudyPlan(prior,makeDailyStudyPlan(prior,'electricidad',45),now);
 assert.match(report,/Caídas de tensión|Diagnóstico de 12 V/);
 assert.match(report,/no demuestran aptitud profesional/i);
});
