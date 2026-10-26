/**
 * RW8+ — Robust, bounded and multiobjective research on existing fictional ECU
 * profiles. Worst-case rectangular index intervals are NOT measurement
 * uncertainty distributions, real thermal margins or OEM calibrations.
 */
import {ECU_PROFILES,checkProfile} from './ecu-optimization.js';
export const ROBUST_MODEL='rw8-robust-pareto-fictitious-indices-v1';
export const PARETO_REFERENCE='https://pmc.ncbi.nlm.nih.gov/articles/PMC10164242/';
export const UNCERTAINTY_REFERENCE='https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty';
const impactKeys=['response','thermalProxy','emissionsProxy','knockProxy','observability'];
const objectives={response:1,observability:1,fuelProxy:-1,thermalProxy:-1,emissionsProxy:-1,knockProxy:-1};
export const RW8_ROBUST_SCENARIOS=Object.freeze([
 Object.freeze({id:'safe',title:'Escenario nominal con margen',description:'DAILY conserva factibilidad aun aplicando el intervalo inventado ±0,03 a los cinco indicadores de restricciones.',limits:Object.freeze({minResponse:.60,maxThermal:.65,maxEmissions:.55,maxKnock:.30,minObservability:0})}),
 Object.freeze({id:'edge',title:'El riesgo del límite ajustado',description:'DAILY pasa las restricciones nominales, pero deja de ser admisible si el índice térmico pudiera ser 0,03 mayor.',limits:Object.freeze({minResponse:.65,maxThermal:.50,maxEmissions:.47,maxKnock:.25,minObservability:.40})}),
 Object.freeze({id:'open',title:'Frontera multiobjetivo abierta',description:'Cuatro perfiles satisfacen un conjunto amplio de límites. Ninguno domina a los otros en todas las métricas.',limits:Object.freeze({minResponse:0,maxThermal:.95,maxEmissions:.85,maxKnock:.60,minObservability:0})})
]);
export const RW8_EXPLANATORY_EVIDENCE=Object.freeze({safe:'margin',edge:'thermal',open:'tradeoffs'});
export const RW8_PARETO_EVIDENCE='feasible-set';
export const RW8_INDEX_HALF_WIDTH=Object.freeze({response:.03,thermalProxy:.03,emissionsProxy:.03,knockProxy:.03,observability:.03});
const between=(v,min,max,name)=>{
 if(!Number.isFinite(v)||v<min||v>max)throw RangeError(name+' inválido');
 return v;
};
function validateLimits(l){
 if(!l||!['minResponse','maxThermal','maxEmissions','maxKnock','minObservability'].every(k=>Number.isFinite(l[k])&&l[k]>=0&&l[k]<=1))throw RangeError('Restricciones fuera del dominio');
 return l;
}
function validateHalfWidths(u){
 if(!u||!impactKeys.every(k=>Number.isFinite(u[k])&&u[k]>=0&&u[k]<=.1))throw RangeError('Semianchos de intervalo inválidos');
 return u;
}
const pick=id=>{const p=RW8_ROBUST_SCENARIOS.find(x=>x.id===id);if(!p)throw RangeError('Escenario RW8+ inválido');return p;};
function worstCase(p,u){
 return {
  response:Math.max(0,p.response-u.response),
  thermalProxy:Math.min(1,p.thermalProxy+u.thermalProxy),
  emissionsProxy:Math.min(1,p.emissionsProxy+u.emissionsProxy),
  knockProxy:Math.min(1,p.knockProxy+u.knockProxy),
  observability:Math.max(0,p.observability-u.observability)
 };
}
export function robustCheck(profile,limits,halfWidths=RW8_INDEX_HALF_WIDTH){
 validateLimits(limits);validateHalfWidths(halfWidths);
 // Verify catalog identity through the existing fail-closed implementation.
 checkProfile(profile,limits);
 const wc=worstCase(profile,halfWidths);
 const violations=[];
 if(wc.response<limits.minResponse-1e-12)violations.push('response_worst_below_min');
 if(wc.thermalProxy>limits.maxThermal+1e-12)violations.push('thermal_worst_above_max');
 if(wc.emissionsProxy>limits.maxEmissions+1e-12)violations.push('emissions_worst_above_max');
 if(wc.knockProxy>limits.maxKnock+1e-12)violations.push('knock_worst_above_max');
 if(wc.observability<limits.minObservability-1e-12)violations.push('observability_worst_below_min');
 return {id:profile.id,feasible:violations.length===0,violations,worstCase:wc};
}
export function dominates(a,b){
 const x=ECU_PROFILES.find(p=>p.id===a?.id);
 const y=ECU_PROFILES.find(p=>p.id===b?.id);
 if(!x||!y||x!==a||y!==b)throw RangeError('Perfil no catalogado');
 let strict=false;
 for(const [key,direction] of Object.entries(objectives)){
  if(direction*x[key]<direction*y[key])return false;
  if(direction*x[key]>direction*y[key])strict=true;
 }
 return strict;
}
export function paretoFront(profileIds){
 if(!Array.isArray(profileIds)||new Set(profileIds).size!==profileIds.length||
  profileIds.some(id=>!ECU_PROFILES.some(p=>p.id===id)))throw RangeError('Conjunto de perfiles inválido');
 const included=ECU_PROFILES.filter(p=>profileIds.includes(p.id));
 return included.filter(p=>!included.some(other=>other!==p&&dominates(other,p))).map(p=>p.id);
}
export function robustAnalysis(id,halfWidths=RW8_INDEX_HALF_WIDTH,thermalShift=0){
 const sc=pick(id);validateHalfWidths(halfWidths);
 const shift=between(thermalShift,-.05,.05,'Sensibilidad térmica');
 const rawLimits={...sc.limits,maxThermal:sc.limits.maxThermal+shift};
 validateLimits(rawLimits);
 const rows=ECU_PROFILES.map(p=>{
  const nominal=checkProfile(p,rawLimits);
  const robust=robustCheck(p,rawLimits,halfWidths);
  return {id:p.id,nominal,robust};
 });
 const nominalIds=rows.filter(x=>x.nominal.feasible).map(x=>x.id);
 const robustIds=rows.filter(x=>x.robust.feasible).map(x=>x.id);
 const frontierIds=paretoFront(robustIds);
 return {model:ROBUST_MODEL,scenarioId:sc.id,title:sc.title,description:sc.description,
  limits:rawLimits,halfWidths:{...halfWidths},thermalShift:shift,rows,
  nominalIds,robustIds,frontierIds,nominalCount:nominalIds.length,
  robustCount:robustIds.length,frontierCount:frontierIds.length,
  failClosed:robustIds.length===0,
  provenance:'synthetic_bounded_indices_not_probabilities',
  limitations:'Cinco semianchos ±0,03 adimensionales inventados; no son intervalos de confianza, errores calibrados ni probabilidades. Solo se aplica incertidumbre a restricciones, NO a la dominancia de objetivos. Ningún mapa ECU, señal CAN/UDS, emisiones o knock real.'};
}
/** RW8++ — deterministic 2^2 factorial corner design.
 * Two coupled fictional factors, each in [-1,+1]. Coefficients of each
 * metric sum in absolute value to 1, so every corner is contained inside
 * the previous rectangular uncertainty enclosure. Corner frequency is
 * a design count, NEVER probability or statistical calibration.
 */
export const FACTORIAL_MODEL='rw8-two-factor-corners-synthetic-v1';
export const FACTORIAL_COUPLINGS=Object.freeze({
 response:Object.freeze([-.6,.4]),thermalProxy:Object.freeze([.6,-.4]),
 emissionsProxy:Object.freeze([.5,.5]),knockProxy:Object.freeze([-.5,.5]),
 observability:Object.freeze([.5,-.5])
});
export function factorialStressStudy(id,halfWidths=RW8_INDEX_HALF_WIDTH){
 const base=robustAnalysis(id,halfWidths);
 const signs=[[-1,-1],[-1,1],[1,-1],[1,1]];
 const corners=signs.map(([loadFactor,controlFactor])=>{
  const rows=ECU_PROFILES.map(p=>{
   const indices=Object.fromEntries(impactKeys.map(key=>{
    const [a,b]=FACTORIAL_COUPLINGS[key];
    const value=p[key]+halfWidths[key]*(a*loadFactor+b*controlFactor);
    return [key,Math.max(0,Math.min(1,value))];
   }));
   const violations=[];
   if(indices.response<base.limits.minResponse-1e-12)violations.push('response_below_min');
   if(indices.thermalProxy>base.limits.maxThermal+1e-12)violations.push('thermal_above_max');
   if(indices.emissionsProxy>base.limits.maxEmissions+1e-12)violations.push('emissions_above_max');
   if(indices.knockProxy>base.limits.maxKnock+1e-12)violations.push('knock_above_max');
   if(indices.observability<base.limits.minObservability-1e-12)violations.push('observability_below_min');
   return {id:p.id,indices,feasible:violations.length===0,violations};
  });
  return {loadFactor,controlFactor,rows,feasibleIds:rows.filter(x=>x.feasible).map(x=>x.id)};
 });
 const feasibleCornerCounts=Object.fromEntries(ECU_PROFILES.map(p=>[p.id,corners.filter(c=>c.feasibleIds.includes(p.id)).length]));
 const survivorIds=ECU_PROFILES.filter(p=>feasibleCornerCounts[p.id]===corners.length).map(p=>p.id);
 return {model:FACTORIAL_MODEL,scenarioId:id,halfWidths:{...halfWidths},limits:{...base.limits},
  factors:['carga artificial','compensación artificial'],corners,feasibleCornerCounts,
  dailyPassedCorners:feasibleCornerCounts.DAILY,survivorIds,
  failClosed:survivorIds.length===0,
  provenance:'synthetic_two_factor_affine_corners_not_probabilities',
  limitations:'Cuatro vértices deterministas de dos factores acoplados. Cada índice queda dentro del intervalo rectangular RW8+; su frecuencia 0/4 a 4/4 NO es probabilidad, tasa de fallo ni validación de una ECU. Es un experimento virtual, sin datos de sensores, mapas OEM ni causalidad física.'};
}
export function thermalSensitivity(id){
 return [-.04,0,.04].map(shift=>{
  const analysis=robustAnalysis(id,RW8_INDEX_HALF_WIDTH,shift);
  return {thermalShift:shift,nominalCount:analysis.nominalCount,
   robustCount:analysis.robustCount,frontierCount:analysis.frontierCount,
   robustIds:analysis.robustIds};
 });
}
export function gradeRobustExercise({scenarioId,predictedNominal,predictedRobust,
 predictedFrontier,predictedDailyCorners,realWorldPrediction,criticalEvidence,paretoEvidence,reasoning,limits}){
 for(const prediction of [predictedNominal,predictedRobust,predictedFrontier,predictedDailyCorners]){
  if(!Number.isInteger(prediction)||prediction<0||prediction>4)throw RangeError('Predicción de cardinalidad inválida');
 }
 if(!['no','si'].includes(realWorldPrediction))throw RangeError('Aplicabilidad sin declarar');
 const analysis=robustAnalysis(scenarioId);
 const factorial=factorialStressStudy(scenarioId);
 const checks={factorial:predictedDailyCorners===factorial.dailyPassedCorners,nominal:predictedNominal===analysis.nominalCount,
  robust:predictedRobust===analysis.robustCount,
  pareto:predictedFrontier===analysis.frontierCount,
  real:realWorldPrediction==='no'};
 const explanation=typeof reasoning==='string'&&reasoning.trim().length>=100;
 const bounds=typeof limits==='string'&&limits.trim().length>=75;
 if(!['margin','thermal','tradeoffs'].includes(criticalEvidence)||!['feasible-set','best-response','full-catalog'].includes(paretoEvidence))throw RangeError('Evidencias conceptuales obligatorias');
 const evidenceChecks={mechanism:criticalEvidence===RW8_EXPLANATORY_EVIDENCE[scenarioId],pareto:paretoEvidence===RW8_PARETO_EVIDENCE};
 const score=Object.values(checks).filter(Boolean).length*8+Object.values(evidenceChecks).filter(Boolean).length*20+(explanation?10:0)+(bounds?10:0);
 return {model:ROBUST_MODEL,score,passed:Object.values(checks).every(Boolean)&&Object.values(evidenceChecks).every(Boolean)&&explanation&&bounds,
  checks,evidenceChecks,provenance:analysis.provenance,
  warning:'No se evalúa el sentido de texto libre: se comprueban predicciones y extensión, nunca aptitud de calibración real.'};
}
export function robustResearchReport(session,result){
 const study=robustAnalysis(session.scenarioId);
 const sensitivity=thermalSensitivity(session.scenarioId);
 const factorial=factorialStressStudy(session.scenarioId);
 return ['# AutoLab RW8+ — Investigación robusta multiobjetivo','',
  'Modelo: '+ROBUST_MODEL,'Origen: synthetic_bounded_indices_not_probabilities',
  'Escenario: '+study.scenarioId,'Restricciones supuestas: '+JSON.stringify(study.limits),
  'Semianchos de intervalos supuestos (sin valor estadístico): '+JSON.stringify(study.halfWidths),
  'Hipótesis congeladas: nominal='+session.predictedNominal+', robusta='+session.predictedRobust+
   ', frontera='+session.predictedFrontier+', ECU real='+session.realWorldPrediction,
  'Pronóstico RW8++: DAILY cumple '+session.predictedDailyCorners+' de 4 esquinas factoriales',
  'Matriz de perturbaciones factoriales sintéticas: '+JSON.stringify(factorial),
  'Prueba conceptual del alumno: mecanismo='+session.criticalEvidence+'; significado de Pareto='+session.paretoEvidence,
  'Nominal: '+study.nominalIds.join(', ')+'; robusta: '+study.robustIds.join(', ')+
   '; frontera de Pareto (criterios nominales entre robustamente elegibles): '+study.frontierIds.join(', '),
  'Sensibilidad de techo térmico: '+JSON.stringify(sensitivity),
  'Filas y violaciones: '+JSON.stringify(study.rows),
  'Calificación estructural: '+result.score+'/100; aprobado='+result.passed,
  'Razonamiento sin evaluación semántica: '+session.reasoning,
  'Limitaciones declaradas: '+session.limits,
  'Referencias de concepto: '+PARETO_REFERENCE+'; '+UNCERTAINTY_REFERENCE,
  'Esta actividad NO permite cambiar mapas ECU ni inferir valores térmicos o ambientales físicos.'].join('\n');
}
