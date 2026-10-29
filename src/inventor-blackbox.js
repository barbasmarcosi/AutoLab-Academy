/**
 * MC14/D2 — offline black-box identification with synthetic low-voltage
 * transfer functions. It is not a physical sensor, CAN/ECU device or real
 * instrument. Baselines x=0 and x=1 are exactly identical for all models;
 * held-out x=3 and x=4 distinguish all three latent transfer functions.
 */
export const INVENTOR_MODEL='mc14-blackbox-identification-synthetic-v1';
export const INVENTOR_HYPOTHESES=Object.freeze([
 Object.freeze({id:'linear',label:'Acondicionador lineal',description:'Salida creciente con ganancia constante'}),
 Object.freeze({id:'clip',label:'Etapa con saturación',description:'La salida deja de aumentar al alcanzar un techo'}),
 Object.freeze({id:'curved',label:'Respuesta no lineal',description:'La ganancia incremental cambia con la entrada'})
]);
export const INVENTOR_PROBES=Object.freeze([
 Object.freeze({id:'training',inputV:3,label:'Barrido discriminante a 3 V'}),
 Object.freeze({id:'holdout',inputV:4,label:'Validación retenida a 4 V'})
]);
export const INVENTOR_CLASSES=Object.freeze([
 Object.freeze({id:'low',label:'Lectura menor que 2,05 V'}),
 Object.freeze({id:'middle',label:'Lectura entre 2,05 y 2,35 V'}),
 Object.freeze({id:'high',label:'Lectura mayor que 2,35 V'})
]);
const okSeed=seed=>{if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647)throw RangeError('Semilla fuera de rango');return seed;};
const cause=seed=>INVENTOR_HYPOTHESES[(okSeed(seed)-1)%3].id;
const response=(kind,x)=>kind==='linear'?1+.5*x:kind==='clip'?Math.min(2.2,1+.5*x):1+.5*x-.1*x*(x-1);
const jitter=(seed,id)=>{let n=Math.imul((seed^(id==='training'?931:1793))>>>0,1664525)+1013904223>>>0;return (n/4294967296-.5)*.01;};
const classify=value=>value<2.05?'low':value<=2.35?'middle':'high';
export function buildInventorCase(seed){
 const kind=cause(seed);
 return {seed,model:INVENTOR_MODEL,cause:kind,
  baseline:[{inputV:0,outputV:1},{inputV:1,outputV:1.5}],
  probes:INVENTOR_PROBES.map(p=>{
   const value=Number((response(kind,p.inputV)+jitter(seed,p.id)).toFixed(3));
   return {id:p.id,inputV:p.inputV,outputV:value,classification:classify(value)};
  })};
}
export function publicInventorCase(seed){
 const c=buildInventorCase(seed);
 return {model:c.model,seed,baseline:c.baseline.map(x=>({...x})),
  hypotheses:INVENTOR_HYPOTHESES.map(x=>({...x})),
  probes:INVENTOR_PROBES.map(x=>({...x})),
  limits:'Dos lecturas iniciales idénticas para tres modelos alternativos. Solo 2 ensayos virtuales de 0 a 5 V, sin equipo ni conexión física. Los datos son inventados, sin calibración, tolerancias OEM ni inferencia probabilística.'};
}
export function revealInventorProbe(seed,probeId,prediction){
 const c=buildInventorCase(seed),p=c.probes.find(x=>x.id===probeId);
 if(!p||!INVENTOR_CLASSES.some(x=>x.id===prediction))throw RangeError('Ensayo o predicción inválidos');
 return {id:p.id,inputV:p.inputV,outputV:p.outputV,classification:p.classification,
  prediction,predictionCorrect:prediction===p.classification,unit:'V sintético',
  model:INVENTOR_MODEL,provenance:'synthetic_virtual_blackbox'};
}
export function evaluateInventor({seed,initial,final,observations,reasoning,limitations}){
 const c=buildInventorCase(seed),valid=INVENTOR_HYPOTHESES.some(x=>x.id===initial)&&
  (INVENTOR_HYPOTHESES.some(x=>x.id===final)||final==='insufficient');
 if(!valid||!Array.isArray(observations)||observations.length>2)throw RangeError('Expediente inválido');
 const seen=new Set();let correct=0;
 for(const obs of observations){
  if(!obs||seen.has(obs.id))throw RangeError('Prueba duplicada o incompleta');
  const measured=revealInventorProbe(seed,obs.id,obs.prediction);
  seen.add(obs.id);if(measured.predictionCorrect)correct++;
 }
 const complete=INVENTOR_PROBES.every(x=>seen.has(x.id));
 const explanation=typeof reasoning==='string'&&reasoning.trim().length>=100&&reasoning.length<=3000;
 const bounded=typeof limitations==='string'&&limitations.trim().length>=80&&limitations.length<=3000;
 const correctCause=final===c.cause;
 const score=(complete?20:0)+(correct*10)+(correctCause?40:0)+(explanation?10:0)+(bounded?10:0);
 return {model:INVENTOR_MODEL,score,passed:complete&&correct===2&&correctCause&&explanation&&bounded,
  complete,predictionsCorrect:correct,correctCause,expected:c.cause,
  provenance:'synthetic_virtual_blackbox',
  warning:'El sistema califica decisiones y longitud del texto, NO comprensión semántica ni aptitud para conectar instrumentos reales.'};
}
export function inventorReport(session,result){
 const c=buildInventorCase(session.seed);
 return ['# AutoLab MC14 — Ingeniería inversa de caja negra virtual','',
  'Modelo: '+INVENTOR_MODEL,'Procedencia: synthetic_virtual_blackbox',
  'Semilla reproducible: '+session.seed,
  'Dos baselines no discriminantes: '+JSON.stringify(c.baseline),
  'Hipótesis inicial congelada: '+session.initial,
  'Presupuesto: exactamente dos ensayos (entrenamiento y validación retenida)',
  ...session.observations.map(o=>{
   const r=revealInventorProbe(session.seed,o.id,o.prediction);
   return 'Ensayo '+r.id+': entrada '+r.inputV+' V; predicho='+r.prediction+
    '; observación='+r.outputV+' '+r.unit+'; clasificación='+r.classification;
  }),
  'Hipótesis final: '+session.final,'Causa programada del modelo: '+result.expected,
  'Nota objetiva: '+result.score+'/100; aprobado='+result.passed,
  'Justificación escrita sin análisis semántico: '+session.reasoning,
  'Límites: '+session.limitations,
  'Son funciones inventadas de 0 a 5 V, sin tolerancias OEM, datos reales, intervención física ni garantía estadística.'
 ].join('\n');
}
