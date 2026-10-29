/**
 * MC01-R&D metrology experiment. Educational, seeded synthetic dimensions in mm.
 * A series is not a measured OEM component. Bias is shared across two measurements
 * performed with the same instrument; calibrated bias cancels in their difference.
 * Repeatability (Type A) and rectangular resolution (Type B) are illustrative.
 */
export const METROLOGY_VERSION='mc01-uncertainty-rd-v1';
export const METROLOGY_SOURCE='https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-5-combined-standard-uncertainty';
export const METROLOGY_INSTRUMENTS=Object.freeze([
 Object.freeze({id:'dial',name:'Comparador virtual',resolutionMm:0.01,biasMm:0.036,uCalMm:0.020,noiseMm:0.019}),
 Object.freeze({id:'micro',name:'Micrómetro virtual',resolutionMm:0.001,biasMm:0.007,uCalMm:0.004,noiseMm:0.006})
]);
const validateSeed=seed=>{if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647)throw RangeError('Semilla fuera de rango');return seed;};
const instrument=id=>{const i=METROLOGY_INSTRUMENTS.find(x=>x.id===id);if(!i)throw RangeError('Instrumento desconocido');return i;};
const rand=(seed,salt)=>{
 let x=(seed^salt)>>>0;
 x=Math.imul(x^(x>>>16),0x7feb352d);
 x=Math.imul(x^(x>>>15),0x846ca68b);
 return ((x^(x>>>16))>>>0)/4294967296;
};
export function publicMetrologyCase(seed){
 validateSeed(seed);
 return {seed,model:METROLOGY_VERSION,measurand:'Cambio en una dimensión ficticia en mm bajo condiciones constantes',
  environment:'Ambas series se simulan con idéntico instrumento, orientación y temperatura normalizada. Cinco repeticiones por condición.',
  instruments:METROLOGY_INSTRUMENTS.map(({id,name,resolutionMm,uCalMm})=>({id,name,resolutionMm,uCalMm})),
  warning:'No son datos reales, tolerancias OEM ni certificado de calibración. La incertidumbre de calibración es un valor simulado.'};
}
function stats(xs){
 const n=xs.length,mean=xs.reduce((s,v)=>s+v,0)/n;
 const variance=xs.reduce((s,v)=>s+(v-mean)**2,0)/(n-1);
 return {mean,s:Math.sqrt(variance),uA:Math.sqrt(variance/n),n};
}
export function simulateMetrology(seed,instrumentId){
 validateSeed(seed);const inst=instrument(instrumentId);
 const nominalA=2.000,nominalB=nominalA+(seed%2===0?0.016:0.075);
 const series=([nominal,salt])=>Array.from({length:5},(_,k)=>
  Number((Math.round((nominal+inst.biasMm+(rand(seed,salt+k*73)-.5)*2*inst.noiseMm)/inst.resolutionMm)*inst.resolutionMm).toFixed(4)));
 const a=series([nominalA,173]),b=series([nominalB,479]);
 const sa=stats(a),sb=stats(b);
 const uRes=inst.resolutionMm/Math.sqrt(12); // rectangular assumed ± half-unit, not traceable.
 const uSingleA=Math.hypot(sa.uA,uRes,inst.uCalMm);
 const uSingleB=Math.hypot(sb.uA,uRes,inst.uCalMm);
 // Shared calibration bias and correction are correlated and cancel for B-A.
 const difference=sb.mean-sa.mean;
 const uDifference=Math.hypot(sa.uA,sb.uA,uRes,uRes);
 const expanded=2*uDifference; // k=2 teaching criterion; not guaranteed 95% coverage at n=5.
 return {
  model:METROLOGY_VERSION,seed,instrumentId,unit:'mm',seriesA:a,seriesB:b,
  meanA:sa.mean,meanB:sb.mean,sA:sa.s,sB:sb.s,uAA:sa.uA,uAB:sb.uA,
  uResolution:uRes,uCalibration:inst.uCalMm,uSingleA,uSingleB,
  difference,uDifference,expanded,k:2,
  conclusion:Math.abs(difference)>expanded?'resolvable':'inconclusive',
  assumptions:'Mismo instrumento; sesgo y calibración comunes correlacionados se cancelan en B−A; cuantización independiente tipo rectangular; 5 repeticiones; ruido sintético; sin deriva.',
  limits:'k=2 es una regla educativa de decisión, no nivel de confianza validado. Las cinco lecturas no son trazables a patrón real.'
 };
}
export function evaluateMetrology({seed,instrumentId,prediction,decision,reasoning,limits}){
 if(!['resolvable','inconclusive'].includes(prediction)||!['resolvable','inconclusive'].includes(decision))throw RangeError('Declaraciones incompletas');
 const m=simulateMetrology(seed,instrumentId);
 const justified=typeof reasoning==='string'&&reasoning.trim().length>=80;
 const bounded=typeof limits==='string'&&limits.trim().length>=60;
 const correctDecision=decision===m.conclusion;
 return {model:m.model,score:(correctDecision?60:0)+(prediction===m.conclusion?20:0)+(justified?10:0)+(bounded?10:0),
  passed:correctDecision&&justified&&bounded,predictionCorrect:prediction===m.conclusion,decisionCorrect:correctDecision,
  provenance:'synthetic_measurement',expected:m.conclusion,
  warning:'Evaluación estructural y de regla de cálculo; el texto libre no se corrige semánticamente.'};
}
export function metrologyReport(session,result){
 const m=simulateMetrology(session.seed,session.instrumentId);
 return ['# AutoLab MC01 — Investigación de metrología reproducible','',
  'Modelo: '+m.model,'Semilla: '+m.seed,'Procedencia: synthetic_measurement; unidades mm',
  'Instrumento simulado: '+instrument(m.instrumentId).name,
  'Series A: '+m.seriesA.join(', '),'Series B: '+m.seriesB.join(', '),
  'Medias A/B: '+m.meanA.toFixed(5)+' / '+m.meanB.toFixed(5)+' mm',
  'Tipo A u(A), u(B): '+m.uAA.toFixed(5)+' / '+m.uAB.toFixed(5)+' mm',
  'Tipo B rectangular resolución: '+m.uResolution.toFixed(5)+' mm; calibración común sintética: '+m.uCalibration.toFixed(5)+' mm',
  'Incertidumbre estándar de lectura u(A), u(B): '+m.uSingleA.toFixed(5)+' / '+m.uSingleB.toFixed(5)+' mm',
  'B−A: '+m.difference.toFixed(5)+' mm; u diferencia '+m.uDifference.toFixed(5)+' mm; U(k=2)='+m.expanded.toFixed(5)+' mm',
  'Pronóstico previo: '+session.prediction,'Decisión final: '+session.decision,
  'Resultado por regla educativa: '+m.conclusion,'Puntaje objetivo: '+result.score+'/100',
  'Razonamiento sin evaluación semántica: '+session.reasoning,'Limitaciones del estudiante: '+session.limits,
  'Supuestos: '+m.assumptions,'Límites del modelo: '+m.limits,
  'Referencia metrológica conceptual: '+METROLOGY_SOURCE].join('\n');
}
