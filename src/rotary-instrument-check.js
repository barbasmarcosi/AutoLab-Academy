/**
 * RW4-P4. Instrument verification challenge: three latent hypotheses cause
 * the same apparent 'low seal' index, including simultaneous failures. This is a logic exercise, not Wankel
 * engine pressure measurement. All values, thresholds and instruments are fictional.
 */
export const RW4_ADVERSARIAL_VERSION='rw4-instrument-adversarial-multicausal-synthetic-v2';
export const RW4_ALTERNATIVES=Object.freeze([
 {id:'sealing',label:'Pérdida de estanqueidad en el modelo'},
 {id:'instrument',label:'Desviación de referencia del instrumento virtual'},
 {id:'both',label:'Estanqueidad e instrumento virtual simultáneamente anómalos'}
]);
export const RW4_CROSSCHECKS=Object.freeze([
 {id:'independent',label:'Lectura en un segundo instrumento virtual',options:['bajo','normal']},
 {id:'zero',label:'Control de referencia de cero virtual',options:['correcto','desviado']}
]);
const seedOk=s=>{if(!Number.isSafeInteger(s)||s<1||s>2147483647)throw RangeError('Semilla no reproducible');return s;};
const jitter=(s,salt)=>{let n=Math.imul((s^salt)>>>0,1664525)+1013904223>>>0;return (n/4294967296-.5)*.028;};
export function buildAdversarialCase(seed){
 seedOk(seed);const cause=['sealing','instrument','both'][seed%3];
 const observed=Number((.32+jitter(seed,1)).toFixed(3));
 const checks=[
  {id:'independent',value:Number((((cause==='sealing'||cause==='both')?.33:.85)+jitter(seed,9)).toFixed(3)),classification:(cause==='sealing'||cause==='both')?'bajo':'normal'},
  {id:'zero',value:Number(((cause==='sealing'?.02:.30)+jitter(seed,19)).toFixed(3)),classification:cause==='sealing'?'correcto':'desviado'}
 ];
 return {model:RW4_ADVERSARIAL_VERSION,seed,cause,observed,checks,ignitionIndex:0.86,
  symptom:'Arranque difícil, marcha irregular e índice neumático original bajo — diagnóstico aún NO confirmado.'};
}
export function publicAdversarialCase(seed){
 const c=buildAdversarialCase(seed);
 return {model:c.model,seed,observed:c.observed,ignitionIndex:c.ignitionIndex,symptom:c.symptom,
  hypotheses:RW4_ALTERNATIVES.map(x=>({...x})),checks:RW4_CROSSCHECKS.map(x=>({...x}))};
}
export function revealCrosscheck(seed,id,prediction){
 const c=buildAdversarialCase(seed),cfg=RW4_CROSSCHECKS.find(x=>x.id===id);
 if(!cfg||!cfg.options.includes(prediction))throw RangeError('Predicción previa inválida');
 const found=c.checks.find(x=>x.id===id);
 return {id,prediction,value:found.value,classification:found.classification,correct:prediction===found.classification,
  unit:'índice sintético adimensional',provenance:'synthetic_model',model:c.model};
}
export function evaluateAdversarial({seed,initial,observations,final,reasoning,limits}){
 const c=buildAdversarialCase(seed);
 if(!RW4_ALTERNATIVES.some(x=>x.id===initial)||!RW4_ALTERNATIVES.some(x=>x.id===final))throw RangeError('Hipótesis desconocida');
 if(!Array.isArray(observations)||observations.length>RW4_CROSSCHECKS.length)throw RangeError('Verificaciones inválidas');
 const seen=new Set();let correct=0;
 for(const x of observations){
  if(!x||seen.has(x.id))throw RangeError('Verificación repetida');
  const r=revealCrosscheck(seed,x.id,x.prediction);seen.add(x.id);if(r.correct)correct++;
 }
 const all=RW4_CROSSCHECKS.every(x=>seen.has(x.id));
 const enough=typeof reasoning==='string'&&reasoning.trim().length>=90&&typeof limits==='string'&&limits.trim().length>=60;
 const cause=final===c.cause;
 return {model:c.model,provenance:'synthetic_model',
  score:(all?20:0)+(cause?40:0)+correct*10+(typeof reasoning==='string'&&reasoning.trim().length>=90?10:0)+(typeof limits==='string'&&limits.trim().length>=60?10:0),
  passed:all&&enough&&cause&&correct===2,correct,cause,expected:c.cause,
  warning:'Un índice bajo no acredita sellos dañados. El instrumento puede fallar por sí solo o junto al sistema sintético.'};
}
export function adversarialReport(s,result){
 const c=buildAdversarialCase(s.seed);
 const names=Object.fromEntries(RW4_ALTERNATIVES.map(x=>[x.id,x.label]));
 const lines=['# AutoLab RW4 — Instrumentación adversarial','',
  'Modelo: '+c.model,'Semilla: '+c.seed,'Origen: synthetic_model sin datos físicos ni OEM',
  'Síntoma común: '+c.symptom,
  'Lectura inicial simulada: '+c.observed+' índice adimensional; encendido nominal: '+c.ignitionIndex,
  'Hipótesis inicial: '+names[s.initial],'Conclusión: '+names[s.final],
  'Causa programada en modelo: '+names[result.expected]];
 for(const x of s.observations){const v=revealCrosscheck(s.seed,x.id,x.prediction);lines.push('- '+x.id+': antes='+x.prediction+'; observado='+v.value+'; clase='+v.classification);}
 lines.push('Interpretación sin evaluación semántica: '+s.reasoning,'Limitaciones: '+s.limits,
  'Nota automática: '+result.score+'/100','NO simula calibración, presiones, fugas ni estándares OEM. No demuestra un diagnóstico de taller.');
 return lines.join('\n');
}
