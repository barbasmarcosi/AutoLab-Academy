/**
 * Auditable learning evidence. Does NOT infer competence, mastery, real-world
 * readiness, or specific lesson success from a generic topic exam.
 * A linked lab is context only, never completion evidence for another lesson.
 */
import{lessonPractice,practiceProgress}from'./lesson-practice.js';
import{transferCase,transferProgress}from'./lesson-transfer.js';
import{inquiryProgress}from'./lesson-inquiry.js';
import{VOLT_DROP_HOLDOUT_ID}from'./volt-drop-transfer.js';
import{DTC_HOLDOUT_ID}from'./dtc-transfer.js';
import{SCOPE_HOLDOUT_ID}from'./scope-transfer.js';
export const EVIDENCE_MODEL='lesson-evidence-structured-v1';
export function lessonEvidence(progress,lessonId){
 const read=Boolean(progress?.notes?.['lesson-'+lessonId]);
 // The first lesson has a dedicated independent holdout, not a mounted generic transfer.
 const practice=lessonPractice(lessonId),transfer=lessonId==='volt-drop'?null:transferCase(lessonId);
 const p=practiceProgress(progress,lessonId);
 const t=transferProgress(progress,lessonId);
 const reasoning=transfer?{available:true,status:t.status,passed:t.passed===true,attempts:t.attempts}:{
  available:false,status:'not-offered',passed:false,attempts:0};
 const lab=practice?.kind==='embedded'?
  {available:true,status:p.status,passed:p.passed===true,attempts:p.attempts}:
  {available:false,status:practice?.kind==='linked'?'related-only':'not-offered',
   passed:false,attempts:0};
 const linkedLab=practice?.kind==='linked'?{
  id:practice.caseId,status:p.status,attempts:p.attempts}:null;
 const holdout=(lessonId==='volt-drop'||lessonId==='motor-data'||lessonId==='scope')?(()=>{const holdoutId=lessonId==='volt-drop'?VOLT_DROP_HOLDOUT_ID:lessonId==='motor-data'?DTC_HOLDOUT_ID:SCOPE_HOLDOUT_ID;const attempts=(Array.isArray(progress?.cases)?progress.cases:[]).filter(x=>x?.id===holdoutId);return {available:true,attempts:attempts.length,passed:attempts.some(x=>x.passed===true),firstRecordedAttemptPassed:attempts.length?attempts[0].passed===true:null};})():null;
 const assessed=reasoning.available||lab.available||Boolean(holdout);
 const checks=[read,...(reasoning.available?[reasoning.passed]:[]),...(lab.available?[lab.passed]:[]),...(holdout?[holdout.passed]:[])];
 const documented=assessed&&checks.every(Boolean);
 const gaps=[...(!read?['reading']:[]),
  ...(reasoning.available&&!reasoning.passed?['reasoning-transfer']:[]),
  ...(lab.available&&!lab.passed?['embedded-lab']:[]),...(holdout&&!holdout.passed?['independent-holdout']:[])];
 return {model:EVIDENCE_MODEL,lessonId,read,reasoning,lab,holdout,linkedLab,inquiry:inquiryProgress(progress,lessonId),
  assessed,documented,phase:documented?'documented-training':assessed?'in-progress':'unassessed',
  gaps,disclaimer:'Evidencia de entrenamiento digital, no dominio técnico real ni certificación.'};
}
export function learningEvidenceOverview(progress,lessons,stages){
 const known=new Map(lessons.map(x=>[x.id,x]));
 const ordered=stages.flatMap(stage=>stage.lessons);
 if(known.size!==lessons.length||ordered.length!==lessons.length||new Set(ordered).size!==lessons.length||
  ordered.some(id=>!known.has(id)))throw Error('El itinerario de evidencia contiene IDs duplicados o incompletos');
 const byLesson=new Map(ordered.map(id=>[id,lessonEvidence(progress,id)]));
 const all=[...byLesson.values()];
 const totals={
  lessons:all.length,read:all.filter(x=>x.read).length,
  reasoningAvailable:all.filter(x=>x.reasoning.available).length,
  reasoningPassed:all.filter(x=>x.reasoning.passed).length,
  embeddedAvailable:all.filter(x=>x.lab.available).length,
  embeddedPassed:all.filter(x=>x.lab.passed).length,
  holdoutAvailable:all.filter(x=>x.holdout?.available).length,holdoutPassed:all.filter(x=>x.holdout?.passed).length,
  linkedOnly:all.filter(x=>x.linkedLab!==null).length,
  inquiryAvailable:all.length,inquiryRecorded:all.filter(x=>x.inquiry.attempts>0).length,
  notAssessed:all.filter(x=>!x.assessed).length,
  documentedTraining:all.filter(x=>x.documented).length
 };
 // Prioritize unfinished work in curriculum order. A linked-only lab may be
 // suggested as an optional field, but its outcome never certifies this lesson.
 const nextTask=ordered.reduce((found,id)=>{
  if(found)return found;
  const e=byLesson.get(id);
  if(!e.read)return {lessonId:id,kind:'reading',label:'Estudiar la teoría y sus límites'};
  if(id==='volt-drop'||id==='motor-data'||id==='scope'){
   if(!e.lab.passed)return {lessonId:id,kind:'embedded-lab',label:e.lab.attempts?'Repetir banco guiado':'Experimentar con voltímetro virtual'};
   if(!e.holdout.passed)return {lessonId:id,kind:'independent-holdout',label:e.holdout.attempts?'Revisar el caso independiente':'Resolver caso reservado sin ayudas'};
  }
  if(e.reasoning.available&&!e.reasoning.passed)return {lessonId:id,kind:'reasoning-transfer',
   label:e.reasoning.attempts?'Revisar hipótesis y transferencia':'Resolver hipótesis y transferencia'};
  if(e.lab.available&&!e.lab.passed)return {lessonId:id,kind:'embedded-lab',
   label:e.lab.attempts?'Repetir investigación con evidencia':'Realizar el laboratorio de esta lección'};
  return null;
 },null);
 const byStage=stages.map(stage=>{
  const events=stage.lessons.map(id=>byLesson.get(id));
  return {id:stage.id,total:events.length,read:events.filter(x=>x.read).length,
   reasoningAvailable:events.filter(x=>x.reasoning.available).length,
   reasoningPassed:events.filter(x=>x.reasoning.passed).length,
   labAvailable:events.filter(x=>x.lab.available).length,
   labPassed:events.filter(x=>x.lab.passed).length,
   documentedTraining:events.filter(x=>x.documented).length,
   inquiryRecorded:events.filter(x=>x.inquiry.attempts>0).length};
 });
 return {model:EVIDENCE_MODEL,totals,byLesson,byStage,nextTask,
  limits:'El cuaderno científico en las 94 lecciones no acredita dominio. La ausencia de una rúbrica en 54 lecciones no equivale ni a fracaso ni a aprobación. Tampoco se acreditan competencias físicas, seguridad HV ni razonamientos libres sin revisión humana.'};
}
