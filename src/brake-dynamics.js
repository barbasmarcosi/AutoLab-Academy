/**
 * MC08 ideal kinetic-energy and friction-envelope teaching model (SI units).
 * This model is NOT a validated stopping distance estimator or safety planner.
 * Uniform deceleration a = mu*g, no aerodynamic drag, rolling resistance,
 * brake bias, load transfer, temperature, ABS dynamics, grade or driver variation.
 */
export const BRAKE_MODEL='mc08-energy-friction-ideal-v1';
export const G=9.80665;
export function idealBrakeCase({massKg,speedKmh,mu,reactionSeconds}){
 if(![massKg,speedKmh,mu,reactionSeconds].every(Number.isFinite))throw RangeError('Valores no finitos');
 if(massKg<600||massKg>3500||speedKmh<10||speedKmh>180||mu<.15||mu>1.2||reactionSeconds<0||reactionSeconds>3)throw RangeError('Entrada fuera del rango didáctico');
 const v=speedKmh/3.6,forceN=massKg*G*mu,accel=mu*G;
 return {model:BRAKE_MODEL,massKg,speedKmh,mu,reactionSeconds,
  speedMs:v,energyJ:.5*massKg*v*v,forceN,idealDecelerationMs2:accel,
  idealBrakingM:v*v/(2*accel),reactionM:v*reactionSeconds,
  conceptualTotalM:v*reactionSeconds+v*v/(2*accel),
  provenance:'derived_from_ideal_physics',
  limitations:'Modelo idealizado, NO distancia de frenado real ni recomendación de seguridad. Sin ABS, pendiente, variación de fricción, transferencia de carga, resistencia al avance, fatiga térmica ni comportamiento humano real.'};
}
export function compareIdealBraking(params){
 const baseline=idealBrakeCase(params);
 if(params.speedKmh>90)throw RangeError('El ejercicio de doble velocidad requiere velocidad inicial de 10 a 90 km/h');
 const doubled=idealBrakeCase({...params,speedKmh:params.speedKmh*2});
 return {baseline,doubled,energyRatio:doubled.energyJ/baseline.energyJ,
  idealBrakingRatio:doubled.idealBrakingM/baseline.idealBrakingM,
  reactionRatio:baseline.reactionM===0?null:doubled.reactionM/baseline.reactionM,
  warning:'Los cocientes solo corresponden a este supuesto de aceleración uniforme y μ constante.'};
}
export function gradeBrakeInvestigation({params,energyPrediction,distancePrediction,massPrediction,reasoning,limitations}){
 const c=compareIdealBraking(params);
 const valid=(p,options)=>options.includes(p);
 if(!valid(energyPrediction,['double','quadruple','same'])||
  !valid(distancePrediction,['double','quadruple','same'])||
  !valid(massPrediction,['changes','same']))throw RangeError('Predicciones incompletas');
 const results={
  energy:energyPrediction==='quadruple',
  distance:distancePrediction==='quadruple',
  mass:massPrediction==='same'
 };
 const reasoningComplete=typeof reasoning==='string'&&reasoning.trim().length>=80;
 const limitationsComplete=typeof limitations==='string'&&limitations.trim().length>=60;
 const correctCount=Object.values(results).filter(Boolean).length;
 const score=correctCount*20+(reasoningComplete?20:0)+(limitationsComplete?20:0);
 return {model:BRAKE_MODEL,provenance:'derived_from_ideal_physics',results,correctCount,score,
  passed:correctCount===3&&reasoningComplete&&limitationsComplete,
  expected:{energy:'quadruple',distance:'quadruple',mass:'same'},
  caveat:c.warning};
}
export function brakeResearchReport(s,r){
 const a=compareIdealBraking(s.params);
 return ['# AutoLab MC08 — Energía cinética y límite de adherencia','',
  'Modelo: '+BRAKE_MODEL,'Procedencia: derived_from_ideal_physics',
  'Masa '+a.baseline.massKg+' kg; velocidad inicial '+a.baseline.speedKmh+' km/h; μ hipotético '+a.baseline.mu+'; tiempo de reacción convencional '+a.baseline.reactionSeconds+' s',
  'Caso inicial: E='+a.baseline.energyJ.toFixed(2)+' J; frenado ideal='+a.baseline.idealBrakingM.toFixed(2)+' m; reacción='+a.baseline.reactionM.toFixed(2)+' m',
  'Caso doble velocidad: E='+a.doubled.energyJ.toFixed(2)+' J; frenado ideal='+a.doubled.idealBrakingM.toFixed(2)+' m; reacción='+a.doubled.reactionM.toFixed(2)+' m',
  'Predicciones: E='+s.energyPrediction+', d='+s.distancePrediction+', masa-d='+s.massPrediction,
  'Nota educativa: '+r.score+'/100','Razonamiento sin evaluación semántica: '+s.reasoning,
  'Limitaciones declaradas: '+s.limitations,'Limitaciones del modelo: '+a.baseline.limitations,
  'Prohibido usar estas cifras para estimar distancias reales de seguridad o validar un sistema de frenos.'].join('\n');
}
