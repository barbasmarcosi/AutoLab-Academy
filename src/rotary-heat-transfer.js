/**
 * RW5-P1 — Lumped heat-transfer toy experiment.
 * Qdot = h*A*(Tgas-Twall), SI W/m2K * m2 * K = W.
 * Fixed assumed h and temperatures; this DOES NOT predict Wankel engine
 * wall heat losses, flow state, actual surfaces, Nusselt numbers or efficiency.
 */
export const HEAT_TRANSFER_MODEL='rw5-lumped-convection-sensitivity-v1';
export const HEAT_TRANSFER_SOURCE='https://saemobilus.sae.org/papers/investigation-surface-area-volume-ratio-wankel-rotary-engines-affects-heat-transfer-heat-losses-2025-01-8357';
const between=(x,lo,hi,key)=>{if(!Number.isFinite(x)||x<lo||x>hi)throw RangeError(key+' inválido');return x;};
export function convectiveHeatRate({surfaceM2,coefficientWm2K,deltaKelvin}){
 const A=between(surfaceM2,.001,4,'Superficie');
 const h=between(coefficientWm2K,1,5000,'Coeficiente convectivo');
 const dT=between(deltaKelvin,0,1000,'Diferencia de temperatura');
 return {surfaceM2:A,coefficientWm2K:h,deltaKelvin:dT,
  heatWatts:h*A*dT,heatKw:h*A*dT/1000,
  model:HEAT_TRANSFER_MODEL,provenance:'derived_from_lumped_heat_transfer',
  limitations:'Valores supuestos, no medidos; sin CFD ni correlaciones Nusselt, variación espacial/transitoria, conducción o radiación. No es eficiencia del motor.'};
}
export function compareConvectiveSurfaces(candidateCoefficient){
 if(![200,400].includes(candidateCoefficient))throw RangeError('Solo alternativas didácticas 200 o 400 W/m²K');
 const baseline=convectiveHeatRate({surfaceM2:.24,coefficientWm2K:250,deltaKelvin:150});
 const candidate=convectiveHeatRate({surfaceM2:.20,coefficientWm2K:candidateCoefficient,deltaKelvin:150});
 const deltaKw=candidate.heatKw-baseline.heatKw;
 return {model:HEAT_TRANSFER_MODEL,baseline,candidate,deltaKw,
  changePct:deltaKw/baseline.heatKw*100,
  direction:deltaKw>0?'aumenta':deltaKw<0?'disminuye':'igual',
  areaChangePct:(candidate.surfaceM2/baseline.surfaceM2-1)*100,
  coefficientChangePct:(candidate.coefficientWm2K/baseline.coefficientWm2K-1)*100,
  constraints:'ΔT=150 K igual; ninguna configuración es un motor real; h es hipotético e independiente.',
  warning:'Menos superficie por sí sola no demuestra menores pérdidas térmicas ni mayor eficiencia. El coeficiente cambia con el flujo y la geometría.'};
}
export function gradeConvection({candidateCoefficient,prediction,realEnginePrediction,reasoning,limits}){
 if(!['aumenta','disminuye','igual'].includes(prediction)||!['no','si'].includes(realEnginePrediction))throw RangeError('Pronósticos obligatorios');
 const exp=compareConvectiveSurfaces(candidateCoefficient);
 const correct=prediction===exp.direction,realBounded=realEnginePrediction==='no';
 const rationale=typeof reasoning==='string'&&reasoning.trim().length>=80;
 const caveat=typeof limits==='string'&&limits.trim().length>=60;
 return {model:HEAT_TRANSFER_MODEL,score:(correct?40:0)+(realBounded?30:0)+(rationale?15:0)+(caveat?15:0),
  passed:correct&&realBounded&&rationale&&caveat,correct,realBounded,
  provenance:'derived_from_lumped_heat_transfer',
  warning:'El texto libre solo se verifica por presencia/longitud; las cifras son hipótesis, no mediciones de motor rotativo.'};
}
export function convectionReport(session,grade){
 const exp=compareConvectiveSurfaces(session.candidateCoefficient);
 return ['# RW5 — Sensibilidad de transferencia convectiva','',
 'Modelo: '+HEAT_TRANSFER_MODEL,'Procedencia: derived_from_lumped_heat_transfer',
 'Ley adoptada: Qdot = h*A*DeltaT, modelo espacial uniforme sin radiación',
 'Base: A='+exp.baseline.surfaceM2+' m2, h='+exp.baseline.coefficientWm2K+' W/m2K, ΔT='+exp.baseline.deltaKelvin+' K, Q='+exp.baseline.heatKw.toFixed(4)+' kW',
 'Alternativa: A='+exp.candidate.surfaceM2+' m2, h='+exp.candidate.coefficientWm2K+' W/m2K, ΔT='+exp.candidate.deltaKelvin+' K, Q='+exp.candidate.heatKw.toFixed(4)+' kW',
 'Cambio de área: '+exp.areaChangePct.toFixed(3)+'%, cambio h: '+exp.coefficientChangePct.toFixed(3)+'%, cambio calor: '+exp.changePct.toFixed(3)+'%',
 'Predicción previa: '+session.prediction,'Validación real predecida: '+session.realEnginePrediction,
 'Explicación sin corrección semántica: '+session.reasoning,'Límites declarados: '+session.limits,
 'Aprobación estructural: '+grade.passed+'; puntaje '+grade.score+'/100',
 'Este ensayo es hipotético; no infiere pérdidas, temperaturas de pared, eficiencia, emisiones, CFD ni geometría de un Wankel real.',
 'Fuente conceptual de sensibilidad Wankel: '+HEAT_TRANSFER_SOURCE].join('\n');
}
