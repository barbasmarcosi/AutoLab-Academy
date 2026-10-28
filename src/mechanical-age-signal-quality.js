/**
 * Diagnostic observability flags, NOT faults. This module never cleans, excludes,
 * interpolates, mutates or scores sensor data; frozen/quantized/stable are ambiguous.
 * Shared row timestamps do NOT establish synchronization of individually polled PIDs.
 */
export const SIGNAL_AUDIT_VERSION='ma00-signal-observability-v1';
const CHANNELS=['rpm','stftPct','ltftPct','loadPct','ectC','iatC'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function auditObdSignalObservability(samples){
 if(!Array.isArray(samples)||samples.length===0)throw RangeError('Se requieren muestras');
 const signals={},warnings=[];
 for(const key of CHANNELS){
  const xs=samples.map(s=>s?.[key]);
  const present=xs.filter(finite);
  if(present.length!==samples.length){
   signals[key]={available:false,observedSamples:present.length,totalSamples:samples.length};
   continue;
  }
  let longestRun=1,currentRun=1,successiveUnchanged=0;
  for(let i=1;i<xs.length;i++){
   if(Object.is(xs[i],xs[i-1])){currentRun++;successiveUnchanged++;}
   else currentRun=1;
   longestRun=Math.max(longestRun,currentRun);
  }
  const distinctValues=new Set(xs).size;
  const unchangedFraction=xs.length>1?successiveUnchanged/(xs.length-1):1;
  const plateauFraction=longestRun/xs.length;
  const ambiguousPlateau=xs.length>=20&&plateauFraction>=0.8;
  signals[key]={available:true,observedSamples:xs.length,distinctValues,
   longestIdenticalRun:longestRun,unchangedFraction,plateauFraction,
   possibleQuantizedStaleOrStable:ambiguousPlateau};
  if(ambiguousPlateau)warnings.push(key+': ≥80% de lecturas consecutivas idénticas; compatible con cuantización, canal detenido o magnitud realmente estable. Corroborar externamente.');
 }
 return {version:SIGNAL_AUDIT_VERSION,signals,warnings,
  perPidTimestampPresent:false,synchronizationVerified:false,
  independentSampleCount:null,wearInferenceAllowed:false,
  caveat:'Las muestras OBD por fila pueden corresponder a interrogaciones secuenciales. Este detector no diagnostica fallo de sensor ni acredita estabilidad física.'};
}
