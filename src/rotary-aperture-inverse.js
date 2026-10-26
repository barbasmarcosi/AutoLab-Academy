/**
 * RW6++ — inverse identification from synthetic planar circular aperture area.
 * Uses the exact monotone circular segment relation from RW6+ and a guaranteed
 * bisection search, not any mechanical rotor or real measured data.
 * "tolerance" is an assumed absolute deterministic bound; NOT GUM standard
 * measurement uncertainty, confidence interval, coverage probability or OEM
 * specification. Quantities are areas in mm² and dimensionless sweep u.
 */
import{apertureArea,circularApertureFraction}from'./rotary-aperture.js';
export const APERTURE_INVERSE_MODEL='rw6-inverse-2d-aperture-bounded-v1';
export const APERTURE_INVERSE_REFERENCE='https://www.bipm.org/en/web/guest/publications/guides';
const finite=(x,lower,upper,label)=>{
 if(!Number.isFinite(x)||x<lower||x>upper)throw RangeError(label+' fuera de dominio');
 return x;
};
const clip=x=>Math.max(0,Math.min(1,x));
/** Recover u from F(u)=circularApertureFraction(u), F strictly increasing. */
export function inverseCircularApertureFraction(observedAreaFraction,iterations=64){
 const f=finite(observedAreaFraction,0,1,'Fracción de área');
 if(!Number.isInteger(iterations)||iterations<40||iterations>128)throw RangeError('Iteraciones inválidas');
 if(f===0||f===1)return f;
 let low=0,high=1;
 for(let i=0;i<iterations;i++){
  const mid=(low+high)/2;
  if(circularApertureFraction(mid)<f)low=mid;else high=mid;
 }
 return (low+high)/2;
}
/** Full-area observation and assumed ± bound -> possible sweep interval.
 * Clamping is explicit: physically impossible observed areas fail closed. */
export function recoverOpeningInterval({radiusMm,observedAreaMm2,toleranceMm2}){
 const r=finite(radiusMm,1,100,'Radio');
 const full=Math.PI*r*r;
 const area=finite(observedAreaMm2,0,full,'Área observada');
 const tol=finite(toleranceMm2,0,.10*full,'Tolerancia asumida');
 const fraction=area/full,lowerAreaFraction=clip((area-tol)/full),
  upperAreaFraction=clip((area+tol)/full);
 const low=inverseCircularApertureFraction(lowerAreaFraction),
  center=inverseCircularApertureFraction(fraction),
  high=inverseCircularApertureFraction(upperAreaFraction);
 return {radiusMm:r,fullAreaMm2:full,observedAreaMm2:area,toleranceMm2:tol,
  fractionObserved:fraction,lowerAreaFraction,upperAreaFraction,
  inferredFraction:center,lowerOpeningFraction:low,upperOpeningFraction:high,
  openingIntervalWidth:high-low,edgeMm:r*(1-2*center),
  model:APERTURE_INVERSE_MODEL,provenance:'synthetic_deterministic_inverse_interval',
  limitations:'2D inversa del segmento de círculo. ±tolerancia es un límite supuesto, no incertidumbre estándar, error medido, intervalo de confianza ni posición de sello Wankel.'};
}
/** Dimensionless derivative d(A/Amax)/du, mathematically zero at endpoints. */
export function normalizedApertureSensitivity(openFraction){
 const u=finite(openFraction,0,1,'Fracción de apertura');
 return 8*Math.sqrt(u*(1-u))/Math.PI;
}
export function inverseApertureStudy({radiusMm=20,trueOpeningFraction=.25,
 biasFraction=.01,toleranceFraction=.02}={}){
 const r=finite(radiusMm,1,100,'Radio');
 const u=finite(trueOpeningFraction,0,1,'Apertura verdadera sintética');
 const b=finite(biasFraction,-.1,.1,'Sesgo artificial');
 const tolerance=finite(toleranceFraction,0,.1,'Tolerancia adimensional');
 const trueArea=apertureArea({radiusMm:r,openFraction:u});
 const measuredFraction=clip(trueArea.areaFraction+b);
 const full=trueArea.fullAreaMm2;
 const result=recoverOpeningInterval({radiusMm:r,observedAreaMm2:measuredFraction*full,
  toleranceMm2:tolerance*full});
 const trueCovered=result.lowerOpeningFraction<=u+1e-12&&u<=result.upperOpeningFraction+1e-12;
 // An identical absolute measurement-area bound produces a wider inverse
 // interval near circular segment closure than near half-open.
 const nearEdge=recoverOpeningInterval({radiusMm:r,
  observedAreaMm2:circularApertureFraction(.05)*full,toleranceMm2:tolerance*full});
 const center=recoverOpeningInterval({radiusMm:r,
  observedAreaMm2:circularApertureFraction(.5)*full,toleranceMm2:tolerance*full});
 return {...result,trueOpeningFraction:u,trueAreaMm2:trueArea.openAreaMm2,
  syntheticBiasFraction:b,toleranceFraction:tolerance,coverage:trueCovered,
  nearEdgeIntervalWidth:nearEdge.openingIntervalWidth,
  centerIntervalWidth:center.openingIntervalWidth,
  openingSensitivity:normalizedApertureSensitivity(u),
  warning:'La cobertura depende de un sesgo y tolerancia elegidos artificialmente. Un intervalo de área no implica una probabilidad ni relaciona u con grados de rotor.'};
}
export function gradeInverseAperture({radiusMm,trueOpeningFraction,biasFraction,toleranceFraction,
 predictedCoverage,predictedSensitivity,predictedPhysical,reasoning,limits}){
 if(!['si','no'].includes(predictedCoverage)||!['borde','centro','igual'].includes(predictedSensitivity)||
    !['si','no'].includes(predictedPhysical))throw RangeError('Tres predicciones obligatorias');
 const x=inverseApertureStudy({radiusMm,trueOpeningFraction,biasFraction,toleranceFraction});
 const checks={coverage:predictedCoverage===(x.coverage?'si':'no'),
  sensitivity:predictedSensitivity==='borde',real:predictedPhysical==='no'};
 const explain=typeof reasoning==='string'&&reasoning.trim().length>=100;
 const caveat=typeof limits==='string'&&limits.trim().length>=75;
 return {score:Object.values(checks).filter(Boolean).length*25+(explain?10:0)+(caveat?15:0),
  passed:Object.values(checks).every(Boolean)&&explain&&caveat,checks,
  model:APERTURE_INVERSE_MODEL,provenance:'synthetic_deterministic_inverse_interval',
  warning:'Calificación de hipótesis y extensión de texto; no se evalúa semánticamente el texto libre ni se acredita metrología real.'};
}
export function inverseApertureReport(session,grade){
 const x=inverseApertureStudy(session);
 return ['# AutoLab RW6++ — Identificación inversa de apertura plana','',
  'Modelo: '+APERTURE_INVERSE_MODEL,'Proveniencia: synthetic_deterministic_inverse_interval',
  'Radio inventado '+x.radiusMm+' mm; área completa '+x.fullAreaMm2.toFixed(8)+' mm²',
  'Apertura sintética verdadera u='+x.trueOpeningFraction+', área verdadera '+x.trueAreaMm2.toFixed(8)+' mm²',
  'Sesgo artificial en fracción de área='+x.syntheticBiasFraction+
   '; tolerancia SUPUESTA en fracción de área='+x.toleranceFraction,
  'Área observada sintética='+x.observedAreaMm2.toFixed(8)+' mm² +/- '+x.toleranceMm2.toFixed(8)+' mm²',
  'Inversión por bisección: u estimado='+x.inferredFraction.toFixed(9)+
   '; intervalo u=['+x.lowerOpeningFraction.toFixed(9)+', '+x.upperOpeningFraction.toFixed(9)+']',
  '¿Incluye verdad simulada? '+x.coverage,
  'Ancho inverso cerca de borde u=.05='+x.nearEdgeIntervalWidth.toFixed(9)+
   ', cerca de centro u=.5='+x.centerIntervalWidth.toFixed(9),
  'Predicción alumno cobertura='+session.predictedCoverage+'; sensibilidad='+session.predictedSensitivity+
   '; aplicación real='+session.predictedPhysical,
  'Evaluación '+grade.score+'/100; aprobado='+grade.passed,
  'Justificación (sin corrección semántica): '+session.reasoning,
  'Límites declarados: '+session.limits,
  'Conceptos generales de incertidumbre: '+APERTURE_INVERSE_REFERENCE,
  'La tolerancia artificial no implementa presupuesto JCGM/GUM ni intervalo probabilístico. No hay inferencia de fase angular, flujo Wankel o medidas OEM.'].join('\n');
}
