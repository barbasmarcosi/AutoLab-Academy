/**
 * RW4-P2: synthetic differential diagnosis, not Wankel compression analysis.
 * Two alternative latent causes produce the same non-discriminating complaint.
 * Two independent DIMENSIONLESS simulated indicators distinguish them.
 * These indices are invented exercise variables, NOT compression pressure (kPa),
 * ignition specifications, OEM thresholds or evidence from any vehicle.
 */
export const SEAL_LAB_MODEL='rw4-differential-synthetic-v1';
export const RW4_CAUSES=Object.freeze([
 {id:'sealing',label:'Pérdida de estanqueidad simulada'},
 {id:'ignition',label:'Déficit de encendido simulado'}
]);
export const RW4_PROBES=Object.freeze([
 {id:'retention',label:'Índice relativo de retención neumática simulado',explanation:'Variable sintética normalizada, no es una presión de compresión ni una prueba OEM.'},
 {id:'primary',label:'Índice relativo de energía primaria simulado',explanation:'Variable sintética normalizada, no es una medición eléctrica real ni una referencia de bobina.'}
]);
function seedValue(seed){
 if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647)throw RangeError('Semilla inválida: entero de 1 a 2147483647');
 return seed;
}
const random=(seed,salt)=>{
 let n=(seed^salt)>>>0;
 n=Math.imul(n^(n>>>16),0x7feb352d);
 n=Math.imul(n^(n>>>15),0x846ca68b);
 return ((n^(n>>>16))>>>0)/4294967296;
};
export function buildSealInvestigation(seed){
 seedValue(seed);
 const cause=seed%2===0?'sealing':'ignition';
 return Object.freeze({
  model:SEAL_LAB_MODEL,seed,cause,
  complaint:'Arranque difícil y ralentí irregular: síntomas compartidos por las dos hipótesis del banco ficticio.',
  environment:'Mismo estado térmico normalizado, velocidad de arranque y referencia instrumental virtual para ambas hipótesis.',
  probes:Object.freeze(RW4_PROBES.map((p,i)=>{
   const nominal=((cause==='sealing')===(p.id==='retention'))?0.30:0.85;
   const value=Number((nominal+(random(seed, 1000+i*97)-.5)*.06).toFixed(3));
   return Object.freeze({id:p.id,value,unit:'índice adimensional sintético',predicted:value<.5?'bajo':'normal',tolerance:0.03});
  }))
 });
}
export function publicSealScenario(seed){
 const s=buildSealInvestigation(seed);
 return {model:s.model,seed:s.seed,complaint:s.complaint,environment:s.environment,
  hypotheses:RW4_CAUSES.map(({id,label})=>({id,label})),
  probes:RW4_PROBES.map(p=>({...p}))};
}
export function revealSealProbe(seed,probeId,prediction){
 const s=buildSealInvestigation(seed);
 if(!RW4_PROBES.some(p=>p.id===probeId))throw RangeError('Prueba desconocida');
 if(!['bajo','normal'].includes(prediction))throw RangeError('Predicción previa obligatoria');
 const p=s.probes.find(x=>x.id===probeId);
 return {probeId,prediction,value:p.value,unit:p.unit,tolerance:p.tolerance,classification:p.predicted,
  predictionCorrect:prediction===p.predicted,provenance:'synthetic_model',model:s.model};
}
export function evaluateSealInvestigation({seed,initial,observations,final,reasoning,uncertainty}){
 const s=buildSealInvestigation(seed);
 if(!RW4_CAUSES.some(x=>x.id===initial)||!RW4_CAUSES.some(x=>x.id===final))throw RangeError('Hipótesis no válida');
 if(!Array.isArray(observations)||observations.length>RW4_PROBES.length)throw RangeError('Pruebas inválidas');
 const ids=new Set();
 for(const o of observations){
  if(!o||ids.has(o.probeId)||!RW4_PROBES.some(p=>p.id===o.probeId)||
   !['bajo','normal'].includes(o.prediction))throw RangeError('Pruebas duplicadas o inválidas');
  ids.add(o.probeId);
 }
 const complete=RW4_PROBES.every(p=>ids.has(p.id));
 const justified=typeof reasoning==='string'&&reasoning.trim().length>=80;
 const limitations=typeof uncertainty==='string'&&uncertainty.trim().length>=60;
 const predictionsCorrect=observations.filter(o=>{
  return revealSealProbe(seed,o.probeId,o.prediction).predictionCorrect;
 }).length;
 const causeCorrect=final===s.cause;
 const passed=complete&&justified&&limitations&&causeCorrect&&predictionsCorrect===2;
 return {
  score:Math.round((complete?20:0)+(justified?10:0)+(limitations?10:0)+(causeCorrect?40:0)+20*predictionsCorrect/2),
  passed,complete,causeCorrect,predictionsCorrect,expected:s.cause,
  warning:'No certifica diagnóstico físico de sellos, compresión ni encendido. Las dos señales son índices inventados del modelo.',
  model:s.model,provenance:'synthetic_model'
 };
}
export function sealInvestigationReport(session,result){
 const s=buildSealInvestigation(session.seed);
 const names=Object.fromEntries(RW4_CAUSES.map(c=>[c.id,c.label]));
 const lines=[
  '# AutoLab RW4 — Investigación diagnóstica diferencial sintética','',
  'Modelo: '+SEAL_LAB_MODEL,'Semilla: '+s.seed,'Procedencia: synthetic_model — sin mediciones OEM ni físicas',
  'Observación inicial compartida: '+s.complaint,'Condiciones controladas: '+s.environment,
  'Hipótesis inicial: '+names[session.initial],'Hipótesis final: '+names[session.final],
  'Resultado del modelo revelado al cerrar: '+names[result.expected],
  'Predicciones acertadas: '+result.predictionsCorrect+'/2',
  'Pruebas observadas:'
 ];
 for(const o of session.observations){
  const p=revealSealProbe(session.seed,o.probeId,o.prediction);
  lines.push('- '+p.probeId+': predicho='+p.prediction+', modelo='+p.value+' '+p.unit+' (±'+p.tolerance+' perturbación máxima interna declarada), clasificado='+p.classification);
 }
 lines.push('Conclusión del estudiante: '+session.reasoning,
  'Limitaciones declaradas: '+session.uncertainty,
  'Aprobación estructural: '+result.passed+'; puntuación objetiva '+result.score+'/100.',
  'El texto libre no se evalúa semánticamente. El modelo no representa ni predice la condición de un motor real.');
 return lines.join('\n');
}
