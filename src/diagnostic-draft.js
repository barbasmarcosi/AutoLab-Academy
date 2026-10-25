import {buildDiagnosticTransfer} from './diagnostic-transfer.js';
/**
 * Backup-schema-v1 compatible draft: only seed, current index and user input.
 * Observations are validated against regenerated, seed-specific instruments.
 * No prerecorded measurements are transformed into "real" measurements.
 */
const allowedPredictions=new Set(['normal','anómala','contexto','peligrosa']);
const text=(value,n)=>typeof value==='string'?value.slice(0,n):'';
const option=(item,value)=>item.options.some(([id])=>id===value)?value:'';

export function sanitizeDiagnosticDraft(raw){
 if(raw==null)return null;
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||
  !Number.isSafeInteger(raw.seed)||raw.seed<0||
  !Number.isInteger(raw.index)||raw.index<0||raw.index>=5||
  !raw.answers||typeof raw.answers!=='object'||Array.isArray(raw.answers))return null;
 const scenario=buildDiagnosticTransfer(raw.seed),answers={};
 for(const item of scenario.cases){
  const src=raw.answers[item.id];if(!src||typeof src!=='object'||Array.isArray(src))continue;
  const initial=option(item,src.initial),locked=src.locked===true&&Boolean(initial);
  const seen=new Set();
  const observations=(locked&&Array.isArray(src.observations)?src.observations:[])
   .slice(0,8).filter(o=>{
    if(!o||typeof o!=='object'||typeof o.id!=='string'||seen.has(o.id)||
     !item.probes.some(p=>p.id===o.id)||!allowedPredictions.has(o.prediction))return false;
    seen.add(o.id);return true;
   }).map(o=>({id:o.id,prediction:o.prediction}));
  const pending=locked&&item.probes.some(p=>p.id===src.pending)&&
   !seen.has(src.pending)?src.pending:'';
  answers[item.id]={
   initial,locked,observations,pending,
   prediction:pending&&allowedPredictions.has(src.prediction)?src.prediction:'',
   final:locked?option(item,src.final):'',
   reasoning:locked?text(src.reasoning,2000):'',
   limits:locked?text(src.limits,1200):''
  };
 }
 return {seed:raw.seed,index:raw.index,answers};
}
export function captureDiagnosticDraft(session){
 if(!session?.scenario)return null;
 return sanitizeDiagnosticDraft({
  seed:session.scenario.seed,index:session.index,answers:session.answers
 });
}
export function restoreDiagnosticDraft(raw){
 const draft=sanitizeDiagnosticDraft(raw);
 if(!draft)return null;
 return {scenario:buildDiagnosticTransfer(draft.seed),index:draft.index,answers:draft.answers,finished:false};
}
