import {sanitizeDiagnosticDraft} from './diagnostic-draft.js';
// Size ceilings cover a full 500-expedient portfolio without removing input guards.
export const MAX_BACKUP_PAYLOAD_CHARS=12_000_000;
export const MAX_BACKUP_IMPORT_CHARS=16_000_000;
export const MAX_BACKUP_FILE_BYTES=24_000_000;
export const SCHEMA_VERSION=1;
export function emptyProgress(){return {schema:SCHEMA_VERSION,attempts:[],cases:[],reviews:{},notes:{},studyMinutes:0,diagnosticDraft:null};}
export function gradeQuestion(question,selected){return Number.isInteger(selected)&&selected===question.answer;}
export function scoreExam(questions,answers){let correct=0;const details=questions.map((question,index)=>{const chosen=answers[index];const ok=gradeQuestion(question,chosen);if(ok)correct++;return {id:question.id,selected:chosen,correct:ok};});return {correct,total:questions.length,percentage:questions.length?Math.round(correct/questions.length*100):0,details};}
export function scheduleReview(previous,correct,now=new Date()){const level=correct?Math.min((previous?.level??0)+1,5):0;const delays=[1,2,4,7,14,30];const due=new Date(now.getTime()+delays[level]*86400000).toISOString();return {level,due,last:now.toISOString(),correct};}
export function dueReviews(progress,now=new Date()){return Object.entries(progress.reviews||{}).filter(([,r])=>Date.parse(r.due)<=now.getTime()).map(([id])=>id);}
export function completedTopics(progress,questions){const byTopic={};for(const attempt of progress.attempts){if(!byTopic[attempt.topic])byTopic[attempt.topic]={attempts:0,passed:0};byTopic[attempt.topic].attempts++;if(attempt.percentage>=85)byTopic[attempt.topic].passed++;}return [...new Set(questions.map(q=>q.topic))].map(topic=>({topic,...(byTopic[topic]||{attempts:0,passed:0})}));}
export function validateBackup(raw){if(!raw||typeof raw!=='object'||raw.schema!==SCHEMA_VERSION||!Array.isArray(raw.attempts)||!Array.isArray(raw.cases)||typeof raw.reviews!=='object'||!raw.reviews||Array.isArray(raw.reviews)||typeof raw.notes!=='object'||!raw.notes||Array.isArray(raw.notes))throw Error('Archivo incompatible o inválido. No se modificaron tus datos.');if(raw.attempts.length>20000||raw.cases.length>20000||JSON.stringify(raw).length>MAX_BACKUP_PAYLOAD_CHARS)throw Error('El respaldo supera los límites de seguridad.');const safe=emptyProgress();if(raw.diagnosticDraft!=null){const draft=sanitizeDiagnosticDraft(raw.diagnosticDraft);if(!draft)throw Error('El respaldo contiene un borrador diagnóstico incompatible. No se modificaron tus datos.');safe.diagnosticDraft=draft;}safe.attempts=raw.attempts.filter(a=>a&&typeof a.id==='string'&&typeof a.topic==='string'&&Number.isInteger(a.percentage)&&a.percentage>=0&&a.percentage<=100).map(a=>({id:a.id.slice(0,100),topic:a.topic.slice(0,80),percentage:a.percentage,at:String(a.at||'').slice(0,40),
 ...(Array.isArray(a.details)?{details:a.details.slice(0,40).filter(d=>d&&typeof d.id==='string'&&/^[a-z0-9-]+$/i.test(d.id)&&d.id.length<=100).map(d=>({
 id:d.id,selected:Number.isInteger(d.selected)&&d.selected>=0&&d.selected<=3?d.selected:null,
 correct:Boolean(d.correct),confidence:['low','normal','high'].includes(d.confidence)?d.confidence:'normal'
 }))}:{})}));safe.cases=raw.cases.filter(c=>c&&typeof c.id==='string'&&Number.isInteger(c.score)&&c.score>=0&&c.score<=100).map(c=>({id:c.id.slice(0,80),score:c.score,at:String(c.at||'').slice(0,40),conclusion:String(c.conclusion||'').slice(0,2000),hypothesis:String(c.hypothesis||'').slice(0,80),used:Array.isArray(c.used)?c.used.filter(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id)).slice(0,20):[],reasoning:String(c.reasoning||'').slice(0,3000),passed:!!c.passed,
 ...(typeof c.report==='string'?{report:c.report.slice(0,10000)}:{})}));for(const [key,value] of Object.entries(raw.reviews).slice(0,1000)){
 if(!/^[a-z0-9-]+$/i.test(key)||!value||typeof value!=='object')continue;
 if(value.algorithm==='ts-fsrs-5'){
  const card=value.card;
  const nums=['stability','difficulty','elapsed_days','scheduled_days','learning_steps','reps','lapses','state'];
  if(!card||typeof card!=='object'||nums.some(k=>!Number.isFinite(card[k])||card[k]<0)
   ||!['reps','lapses','learning_steps','scheduled_days','elapsed_days','state'].every(k=>Number.isInteger(card[k]))
   ||card.state>3||!Number.isFinite(Date.parse(card.due))
   ||(card.last_review!=null&&!Number.isFinite(Date.parse(card.last_review))))
   throw Error('El respaldo contiene un registro FSRS incompatible para '+key+'. Se conservan los datos actuales.');
  const safeCard=Object.fromEntries(nums.map(k=>[k,card[k]]));
  safeCard.due=new Date(card.due).toISOString();
  safeCard.last_review=card.last_review?new Date(card.last_review).toISOString():null;
  const history=Array.isArray(value.history)?value.history.slice(-30).filter(h=>h&&[1,2,3,4].includes(h.rating)&&Number.isFinite(Date.parse(h.at))&&Number.isFinite(Date.parse(h.due))).map(h=>({at:new Date(h.at).toISOString(),due:new Date(h.due).toISOString(),rating:h.rating,correct:Boolean(h.correct),confidence:['low','normal','high'].includes(h.confidence)?h.confidence:'normal'})):[];
  safe.reviews[key]={algorithm:'ts-fsrs-5',card:safeCard,due:safeCard.due,last:String(value.last||safeCard.last_review||'').slice(0,40),correct:Boolean(value.correct),history};
 }else if(Number.isInteger(value.level)&&value.level>=0&&value.level<=5&&Number.isFinite(Date.parse(value.due))){
  safe.reviews[key]={level:value.level,due:new Date(value.due).toISOString(),last:String(value.last||'').slice(0,40),correct:Boolean(value.correct)};
 }
}
for(const [key,value] of Object.entries(raw.notes).slice(0,100)){if(/^[a-z0-9-]+$/i.test(key)&&typeof value==='string')safe.notes[key]=value.slice(0,10000);}safe.studyMinutes=Number.isSafeInteger(raw.studyMinutes)&&raw.studyMinutes>=0?Math.min(raw.studyMinutes,1000000):0;return safe;}
export function calculateCase(caseData,used,diagnosis){const options=used.map(id=>caseData.probes.find(p=>p.id===id)).filter(Boolean);const hasConfirm=options.some(p=>p.critical);const accurate=diagnosis===caseData.solution;const reckless=options.some(p=>p.unsafe);const score=reckless?0:Math.max(0,(accurate?65:0)+(hasConfirm?25:0)-Math.max(0,options.length-3)*5);return {score:Math.min(score,100),accurate,hasConfirm,unsafe:reckless};}
function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('autolab-academy',1);request.onupgradeneeded=()=>{request.result.createObjectStore('data')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});}
async function dbOperation(mode,fn){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('data',mode);const store=tx.objectStore('data');const r=fn(store);let value;r.onsuccess=()=>{value=r.result;};r.onerror=()=>reject(r.error);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export async function loadProgress(){try{const raw=await dbOperation('readonly',s=>s.get('progress'));return raw?validateBackup(raw):emptyProgress();}catch(error){console.warn('No se pudo abrir progreso:',error);throw Error('No fue posible abrir el almacenamiento local. Revisá el modo privado o los permisos del navegador.');}}
// All writes, including restores, share one FIFO queue. Failed operations do not
// poison subsequent writes; caller still receives the original rejection.
let writeQueue=Promise.resolve();
export function saveProgress(progress){
 const snapshot=validateBackup(progress);
 const operation=writeQueue.then(()=>dbOperation('readwrite',s=>s.put(snapshot,'progress')));
 writeQueue=operation.catch(()=>{});
 return operation;
}
export function serializeBackup(progress){return JSON.stringify({format:'autolab-academy-backup',exportedAt:new Date().toISOString(),payload:validateBackup(progress)},null,2);}
export function parseBackup(text){if(text.length>MAX_BACKUP_IMPORT_CHARS)throw Error('Archivo demasiado grande');const outer=JSON.parse(text);if(outer.format!=='autolab-academy-backup')throw Error('Formato de respaldo desconocido');return validateBackup(outer.payload);}
