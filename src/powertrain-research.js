/**
 * MC06: stationary synthetic gear-train differential diagnosis.
 * Not a gearbox/torque converter physics predictor. Two independent virtual
 * probes separate a mechanical speed slip, speed-channel offset, or both.
 * Reported speed is deliberately identical across all causes.
 */
export const POWERTRAIN_MODEL='mc06-geartrain-dual-fault-synthetic-v1';
export const POWERTRAIN_CAUSES=Object.freeze([
 Object.freeze({id:'slip',label:'Deslizamiento mecánico simulado'}),
 Object.freeze({id:'sensor',label:'Sesgo del canal RPM simulado'}),
 Object.freeze({id:'both',label:'Deslizamiento y sesgo simultáneos'})
]);
export const POWERTRAIN_PROBES=Object.freeze([
 Object.freeze({id:'independent',label:'Tacómetro independiente virtual',classes:Object.freeze([
  {id:'low',label:'Régimen bajo, menor de 730 rpm'},
  {id:'middle',label:'Régimen intermedio, de 730 a 775 rpm'},
  {id:'normal',label:'Régimen nominal, mayor de 775 rpm'}])}),
 Object.freeze({id:'reference',label:'Chequeo independiente de offset del canal RPM',classes:Object.freeze([
  {id:'correct',label:'Cero dentro de tolerancia ficticia'},
  {id:'moderate',label:'Desvío moderado de −48 rpm'},
  {id:'large',label:'Desvío importante de −96 rpm'}])})
]);
const validateSeed=seed=>{if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647)throw RangeError('Semilla inválida');return seed;};
const jitter=(seed,salt)=>{let x=Math.imul(((seed^salt)>>>0),1664525)+1013904223>>>0;return (x/4294967296-.5)*1.6;};
export function buildPowertrainCase(seed){
 validateSeed(seed);
 const cause=POWERTRAIN_CAUSES[(seed-1)%3].id;
 const slipFraction=cause==='slip'?.12:cause==='both'?.06:0;
 const offsetRpm=cause==='sensor'?-96:cause==='both'?-48:0;
 const gearRatio=3,inputRpm=2400,inputTorqueNm=140,transmissionEfficiency=.92;
 const idealOutputRpm=inputRpm/gearRatio;
 const trueOutputRpm=idealOutputRpm*(1-slipFraction);
 const indicatedOutputRpm=trueOutputRpm+offsetRpm;
 const outputTorqueNm=inputTorqueNm*gearRatio*transmissionEfficiency;
 const powerInputKw=inputTorqueNm*inputRpm*(2*Math.PI)/60000;
 const powerOutputKw=outputTorqueNm*trueOutputRpm*(2*Math.PI)/60000;
 const powerLossKw=powerInputKw-powerOutputKw;
 const independentRpm=Number((trueOutputRpm+jitter(seed,811)).toFixed(2));
 const referenceOffsetRpm=Number((offsetRpm+jitter(seed,977)).toFixed(2));
 const probes=[
  {id:'independent',value:independentRpm,unit:'rpm',classification:independentRpm<730?'low':independentRpm<=775?'middle':'normal'},
  {id:'reference',value:referenceOffsetRpm,unit:'rpm de diferencia firmada',classification:referenceOffsetRpm>-3?'correct':referenceOffsetRpm<-70?'large':'moderate'}
 ];
 return {seed,model:POWERTRAIN_MODEL,cause,slipFraction,offsetRpm,
  gearRatio,inputRpm,inputTorqueNm,transmissionEfficiency,
  idealOutputRpm,trueOutputRpm,indicatedOutputRpm,
  outputTorqueNm,powerInputKw,powerOutputKw,powerLossKw,probes};
}
export function publicPowertrainCase(seed){
 const c=buildPowertrainCase(seed);
 return {seed,model:POWERTRAIN_MODEL,
  indicatedOutputRpm:c.indicatedOutputRpm,
  inputRpm:c.inputRpm,inputTorqueNm:c.inputTorqueNm,
  gearRatio:c.gearRatio,transmissionEfficiency:c.transmissionEfficiency,
  hypotheses:POWERTRAIN_CAUSES.map(({id,label})=>({id,label})),
  probes:POWERTRAIN_PROBES.map(p=>({id:p.id,label:p.label,classes:p.classes.map(v=>({...v}))})),
  warning:'Lectura inicial idéntica entre tres causas. El modelo es un banco de índices y potencias hipotéticas, no reproduce embragues, convertidores, CAN/OBD ni mediciones físicas; no permite concluir fallas reales.'};
}
export function revealPowertrainProbe(seed,id,prediction){
 const c=buildPowertrainCase(seed);
 const spec=POWERTRAIN_PROBES.find(x=>x.id===id);
 if(!spec||!spec.classes.some(x=>x.id===prediction))throw RangeError('Prueba o predicción inválida');
 const probe=c.probes.find(x=>x.id===id);
 return {...probe,prediction,correct:prediction===probe.classification,provenance:'synthetic_independent_check'};
}
export function gradePowertrainCase({seed,initial,observations,final,reasoning,limitations}){
 const c=buildPowertrainCase(seed);
 const valid=x=>POWERTRAIN_CAUSES.some(y=>y.id===x);
 if(!valid(initial)||!(valid(final)||final==='insufficient')||!Array.isArray(observations)||observations.length>2)throw RangeError('Expediente inválido');
 const seen=new Set();let correct=0;
 for(const obs of observations){
  if(!obs||seen.has(obs.id))throw RangeError('Prueba duplicada o inválida');
  if(revealPowertrainProbe(seed,obs.id,obs.prediction).correct)correct++;
  seen.add(obs.id);
 }
 const complete=POWERTRAIN_PROBES.every(p=>seen.has(p.id));
 const finalCorrect=final===c.cause;
 const explanation=typeof reasoning==='string'&&reasoning.trim().length>=100&&reasoning.length<=3000;
 const bounded=typeof limitations==='string'&&limitations.trim().length>=80&&limitations.length<=3000;
 const score=(complete?20:0)+correct*10+(finalCorrect?40:0)+(explanation?10:0)+(bounded?10:0);
 return {model:POWERTRAIN_MODEL,score,passed:complete&&correct===2&&finalCorrect&&explanation&&bounded,
  complete,correctPredictions:correct,finalCorrect,expected:c.cause,provenance:'synthetic_mechanics',
  warning:'El resultado evalúa solo reglas objetivas y extensión escrita; no revisa semántica ni acredita diagnóstico real.'};
}
export function powertrainReport(session,grade){
 const c=buildPowertrainCase(session.seed);
 return ['# AutoLab MC06 — Diagnóstico de transmisión e instrumentación (sintético)','',
 'Modelo: '+POWERTRAIN_MODEL,'Semilla: '+c.seed,'Procedencia: synthetic_mechanics',
 'Entrada: '+c.inputRpm+' rpm, '+c.inputTorqueNm+' Nm, reducción '+c.gearRatio+':1, eficiencia hipotética '+c.transmissionEfficiency,
 'Régimen de salida indicado inicialmente: '+c.indicatedOutputRpm+' rpm (ambiguo)',
 'Hipótesis provisional congelada: '+session.initial,
 ...session.observations.map(o=>{const p=revealPowertrainProbe(c.seed,o.id,o.prediction);return 'Prueba '+p.id+' predicción='+p.prediction+' resultado='+p.value+' '+p.unit+' clase='+p.classification;}),
 'Salida verdadera simulada: '+c.trueOutputRpm+' rpm; error instrumental: '+c.offsetRpm+' rpm',
 'Balance energético ficticio: P entrada='+c.powerInputKw.toFixed(4)+' kW; P salida='+c.powerOutputKw.toFixed(4)+' kW; P pérdida='+c.powerLossKw.toFixed(4)+' kW; torque salida='+c.outputTorqueNm.toFixed(3)+' Nm',
 'Pérdida de potencia adicional asignada al deslizamiento del propio modelo, no identificada a partir del indicador defectuoso.',
 'Conclusión: '+session.final+'; causa programada: '+grade.expected,
 'Nota objetiva: '+grade.score+'/100; aprobado='+grade.passed,
 'Justificación escrita sin corrección semántica: '+session.reasoning,
 'Límites declarados: '+session.limitations,
 'No describe comportamiento de convertidores reales, rendimiento OEM, cálculos para dimensionado o instrucciones de intervención física.'
 ].join('\n');
}
