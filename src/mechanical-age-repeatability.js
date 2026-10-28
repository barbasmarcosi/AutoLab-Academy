/**
 * MA00 replicated measurements: sessions, NOT OBD rows, are experimental units.
 * This only reports descriptive within-phase variability. Never a causal test.
 */
import {evaluateMechanicalSnapshot,syntheticServicePair} from './mechanical-age-research.js';
import {compareMeasurementEvidence} from './mechanical-age-evidence.js';
export const REPLICATES_VERSION='ma00-replicated-observations-v1';
const median=x=>{const a=[...x].sort((p,q)=>p-q),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;};
const range=x=>Math.max(...x)-Math.min(...x);
const phaseSummary=group=>{
 const metric=k=>group.map(x=>x.features[k]).filter(x=>x!==null);
 return {
  sessions:group.length,
  rpm:{median:median(metric('medianRpm')),range:range(metric('medianRpm'))},
  rpmRobustSigma:{median:median(metric('rpmRobustSigma')),range:range(metric('rpmRobustSigma'))},
  combinedFuelTrim:metric('medianCombinedTrimPct').length===group.length?
   {median:median(metric('medianCombinedTrimPct')),range:range(metric('medianCombinedTrimPct'))}:null,
  experimentalDeviationIndex:group.every(x=>x.deviationIndex!==null)?
   {median:median(group.map(x=>x.deviationIndex)),range:range(group.map(x=>x.deviationIndex))}:null
 };
};
export function evaluateReplicatedMeasurements(sessions){
 if(!Array.isArray(sessions)||sessions.length<4||sessions.length>20)throw RangeError('Se requieren de 4 a 20 sesiones independientes (2 por fase como mínimo)');
 const seenIds=new Set(),seenSamples=new Set(),blockers=[],results=[];
 for(const item of sessions){
  if(!item||typeof item.sessionId!=='string'||item.sessionId.trim().length<3||item.sessionId.length>100)throw RangeError('Identificador de sesión inválido');
  if(seenIds.has(item.sessionId))throw RangeError('Sesión duplicada');
  seenIds.add(item.sessionId);
  // A shifted timestamp does not make the same measured signal sequence an independent capture.
  const key=JSON.stringify(item.snapshot?.samples?.map(({timeMs,...channels})=>channels));
  if(seenSamples.has(key))throw RangeError('Dos sesiones repiten idénticas señales (incluso con otros timestamps); no son replicaciones independientes');
  seenSamples.add(key);
  results.push({...evaluateMechanicalSnapshot(item.snapshot),sessionId:item.sessionId});
 }
 const before=results.filter(x=>x.phase==='before_service'),after=results.filter(x=>x.phase==='after_service');
 if(before.length<2||after.length<2)blockers.push('Se necesitan al menos dos sesiones por fase');
 if(new Set(results.map(x=>x.vehicleAlias)).size!==1)blockers.push('Múltiples vehículos');
 if(new Set(results.map(x=>x.engineFamily)).size!==1)blockers.push('Múltiples familias');
 if(new Set(results.map(x=>x.protocol)).size!==1)blockers.push('Protocolos incompatibles');
 if(new Set(results.map(x=>x.source)).size!==1)blockers.push('Procedencia incompatible');
 if(results.some(x=>x.status!=='eligible'))blockers.push('Ventana fuera del protocolo de medición');
 if(results.some(x=>x.source!=='synthetic')){
  if(results.some((x,i)=>x.measurementEvidence?.documented!==true||sessions[i].snapshot.measurementContext?.sessionId!==sessions[i].sessionId))blockers.push('Faltan contextos de adquisición y/o IDs de sesión consistentes');
  const early=sessions.filter(x=>x.snapshot.phase==='before_service'),late=sessions.filter(x=>x.snapshot.phase==='after_service');
  for(const x of early)for(const y of late){
   const audit=compareMeasurementEvidence(x.snapshot,y.snapshot);
   if(!audit.documented)blockers.push(...audit.blockers);
  }
  if(new Set(sessions.map(x=>x.snapshot.measurementContext?.sessionId)).size!==sessions.length)blockers.push('IDs de captura duplicados');
 }
 const fields=[['medianRpm',80],['medianEctC',5],['medianLoadPct',5]];
 for(const [field,tolerance] of fields)if(range(results.map(x=>x.features[field]))>tolerance)blockers.push('Diferencia de condiciones excesiva: '+field);
 const iats=results.map(x=>x.features.medianIatC);
 if(iats.some(x=>x===null)!==iats.every(x=>x===null))blockers.push('Falta IAT en algunas sesiones');
 else if(iats.every(x=>x!==null)&&range(iats)>7)blockers.push('Temperatura de admisión no comparable');
 const comparable=blockers.length===0;
 const baseline=comparable?phaseSummary(before):null,post=comparable?phaseSummary(after):null;
 const difference=(field)=>baseline&&post&&baseline[field]&&post[field]?post[field].median-baseline[field].median:null;
 return {
  version:REPLICATES_VERSION,
  comparable,blockers,sessionUnitCount:results.length,phases:{before:before.length,after:after.length},
  baseline,after:post,
  observedDifferences:comparable?{
   medianRpm:difference('rpm'),
   rpmRobustSigma:difference('rpmRobustSigma'),
   medianCombinedFuelTrim:difference('combinedFuelTrim'),
   syntheticDeviationIndex:difference('experimentalDeviationIndex')
  }:null,
  confidenceInterval:null,causalMaintenanceEffect:null,structuralWear:null,mechanicalAgeEquivalentKm:null,
  evidenceLevel:results.every(x=>x.source==='synthetic')?'synthetic_demonstration':'operator_assertions_only',
  verdict:comparable?'Descriptivo: la diferencia entre medianas NO prueba causalidad ni supera por sí sola un umbral inferencial':'Inconcluso: los ensayos no son comparables'
 };
}
/** Distinct but still synthetic sessions: illustrative of a repeated assay, not biological replicates. */
export function syntheticReplicatedServiceCase(){
 const pair=syntheticServicePair(),result=[];
 for(const phase of ['before_service','after_service']){
  for(let k=0;k<2;k++){
   const snapshot=structuredClone(pair[phase==='before_service'?'before':'after']);
   snapshot.samples.forEach((r,i)=>{
    r.rpm+= (k===0?-1:1)*(1.6+Math.cos(i*.63)*.8);
    r.stftPct+=(k===0?-.3:.3);
    r.ectC+=(k===0?-.1:.1);
   });
   result.push({sessionId:phase+'-replicate-'+(k+1),snapshot});
  }
 }
 return result;
}
