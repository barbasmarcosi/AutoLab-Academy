/**
 * Metacognitive calibration for the four frozen v2 choices.
 * A stated confidence is a SUBJECTIVE degree of certainty for one choice,
 * NOT a calibrated probability of competence, safety, or diagnosis.
 * Brier-like descriptive squared error is provided ONLY on complete sets.
 */
export const CONFIDENCE_MODEL='autolab-four-decisions-subjective-confidence-v1';
export const CONFIDENCE_LEVELS=Object.freeze([
 Object.freeze({value:0.5,label:'Incierto (50 %)'}),
 Object.freeze({value:0.75,label:'Moderado (75 %)'}),
 Object.freeze({value:0.95,label:'Muy seguro (95 %)'})
]);
const valid=new Set(CONFIDENCE_LEVELS.map(x=>x.value));
export function auditDecisionConfidence(choices){
 if(!Array.isArray(choices)||choices.length!==4)throw RangeError('Se requieren cuatro decisiones v2');
 const rows=choices.map((c,index)=>{
  if(!c||typeof c.correct!=='boolean'||!(c.confidence===null||valid.has(c.confidence)))throw RangeError('Confianza o corrección inválida');
  return {step:index+1,correct:c.correct,confidence:c.confidence,
   squaredError:c.confidence===null?null:Number((c.confidence-(c.correct?1:0))**2)};
 });
 const declared=rows.filter(x=>x.confidence!==null);
 const complete=declared.length===4;
 const meanSquaredError=complete?declared.reduce((sum,x)=>sum+x.squaredError,0)/4:null;
 return {model:CONFIDENCE_MODEL,rows,declared:declared.length,complete,
  meanSquaredError,overconfidentErrors:declared.filter(x=>!x.correct&&x.confidence>=.95).length,
  limitations:'Índice descriptivo para cuatro respuestas objetivas, no una estimación fiable de calibración estadística ni un indicador de habilidad o seguridad. Las declaraciones son voluntarias y se congelan antes de mostrar devoluciones.'};
}
export function confidenceReport(audit){
 if(!audit||audit.model!==CONFIDENCE_MODEL)throw RangeError('Auditoría incompatible');
 return ['## Autoevaluación de seguridad en las hipótesis',
  'Modelo: '+audit.model,
  ...audit.rows.map(x=>'Decisión '+x.step+': confianza declarada '+(x.confidence===null?'NO INFORMADA':Math.round(x.confidence*100)+' %')+'; resultado objetivo '+(x.correct?'compatible':'incompatible')),
  'Declaraciones: '+audit.declared+'/4',
  audit.complete?'Error cuadrático medio descriptivo: '+audit.meanSquaredError.toFixed(4):'Error cuadrático medio: NO CALCULADO (faltan declaraciones)',
  'Errores con confianza muy alta (95 %): '+audit.overconfidentErrors,
  audit.limitations].join('\n');
}
