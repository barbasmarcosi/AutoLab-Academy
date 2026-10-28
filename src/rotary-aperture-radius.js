/**
 * RW6+++ — joint interval study with an UNKNOWN radius, not calibration data.
 * A single aperture area does not uniquely identify both radius and opening.
 * The feasible set is {(r,u) : r in [r-,r+], A- <= pi*r*r*F(u) <= A+}.
 * Monotonicity in r and u makes the projected u interval exact.
 * No statistical confidence, GUM budget, CAD geometry or Wankel phases.
 */
import{inverseCircularApertureFraction,inverseApertureStudy}from'./rotary-aperture-inverse.js';
export const RADIUS_MODEL='rw6-radius-opening-feasible-set-v1';
const bounded=(v,min,max,label)=>{
 if(!Number.isFinite(v)||v<min||v>max)throw RangeError(label+' fuera de dominio');
 return v;
};
const clamp=x=>Math.max(0,Math.min(1,x));
export function radiusOpeningEnvelope({radiusMm,relativeRadiusBound,observedAreaMm2,toleranceMm2}){
 const r=bounded(radiusMm,1,100,'Radio nominal');
 const band=bounded(relativeRadiusBound,0,.2,'Banda relativa de radio');
 const observed=bounded(observedAreaMm2,0,1e6,'Área observada');
 const tol=bounded(toleranceMm2,0,.1*Math.PI*r*r,'Cota absoluta de área');
 const radiusLow=r*(1-band),radiusHigh=r*(1+band);
 const lowerArea=Math.max(0,observed-tol),upperArea=observed+tol;
 const maximumArea=Math.PI*radiusHigh*radiusHigh;
 const common={model:RADIUS_MODEL,radiusLowMm:radiusLow,radiusHighMm:radiusHigh,
  observedAreaMm2:observed,toleranceMm2:tol,lowerAreaMm2:lowerArea,upperAreaMm2:upperArea,
  assumptions:'Radio dentro de una banda cerrada y error de área dentro de una cota absoluta ficticia, sin distribución probabilística.'};
 // If even the largest allowable circle is too small, do not clamp to an
 // apparently valid opening estimate: the measurement is inconsistent.
 if(lowerArea>maximumArea*(1+1e-14)){
  return {...common,failClosed:true,feasible:false,lowerOpeningFraction:null,
   upperOpeningFraction:null,openingIntervalWidth:null,feasibleRadiusLowMm:null,
   reason:'El área mínima compatible excede el área total del mayor radio permitido.'};
 }
 const feasibleRadiusLow=Math.max(radiusLow,Math.sqrt(lowerArea/Math.PI));
 const lowerFraction=clamp(lowerArea/maximumArea);
 const upperFraction=clamp(upperArea/(Math.PI*feasibleRadiusLow*feasibleRadiusLow));
 const lower=inverseCircularApertureFraction(lowerFraction);
 const upper=inverseCircularApertureFraction(upperFraction);
 return {...common,failClosed:false,feasible:true,feasibleRadiusLowMm:feasibleRadiusLow,
  lowerOpeningFraction:lower,upperOpeningFraction:upper,openingIntervalWidth:Math.max(0,upper-lower),
  reason:'Proyección exacta de la región factible bajo modelo circular 2D monotónico; no identifica un par (radio, apertura) único.'};
}
/** RW6++++: independent radius-gauge interval intersects the prior radius band.
 * A genuinely independent geometric observable restricts the ambiguity, but
 * cannot turn synthetic tolerance bounds into a metrological confidence level.
 * Contradictory gauge intervals must fail closed, not silently choose a radius.
 */
export function independentlyCalibratedOpening({radiusMm,relativeRadiusBound,observedAreaMm2,toleranceMm2,measuredRadiusMm,radiusToleranceMm}){
 const base=radiusOpeningEnvelope({radiusMm,relativeRadiusBound,observedAreaMm2,toleranceMm2});
 const measured=bounded(measuredRadiusMm,0,200,'Radio medido independiente');
 const tolerance=bounded(radiusToleranceMm,0,50,'Cota independiente de radio');
 const low=Math.max(base.radiusLowMm,measured-tolerance);
 const high=Math.min(base.radiusHighMm,measured+tolerance);
 const metadata={independentRadiusMeasurementMm:measured,independentRadiusToleranceMm:tolerance,
  independentlyCalibrated:true,limitations:'Intervalos geométricos deterministas sintéticos; la medición independiente no es calibración trazable ni incertidumbre GUM.'};
 if(low>high)return {...base,...metadata,feasible:false,failClosed:true,feasibleRadiusLowMm:null,
  lowerOpeningFraction:null,upperOpeningFraction:null,openingIntervalWidth:null,
  radiusLowMm:low,radiusHighMm:high,
  reason:'La medición independiente de radio contradice la banda radial inicial.'};
 const minArea=Math.max(0,observedAreaMm2-toleranceMm2);
 if(minArea>Math.PI*high*high*(1+1e-14))return {...base,...metadata,feasible:false,failClosed:true,
  feasibleRadiusLowMm:null,lowerOpeningFraction:null,upperOpeningFraction:null,openingIntervalWidth:null,
  radiusLowMm:low,radiusHighMm:high,
  reason:'La menor área compatible excede el círculo de radio máximo tras la medición independiente.'};
 const feasibleLow=Math.max(low,Math.sqrt(minArea/Math.PI));
 const lower=inverseCircularApertureFraction(clamp(minArea/(Math.PI*high*high)));
 const upper=inverseCircularApertureFraction(clamp((observedAreaMm2+toleranceMm2)/(Math.PI*feasibleLow*feasibleLow)));
 return {...base,...metadata,feasible:true,failClosed:false,radiusLowMm:low,radiusHighMm:high,
  feasibleRadiusLowMm:feasibleLow,lowerOpeningFraction:lower,upperOpeningFraction:upper,
  openingIntervalWidth:Math.max(0,upper-lower),
  reason:'Intersección explícita de dos cotas de radio independientes y proyección exacta sobre apertura.'};
}
export function radiusAmbiguityStudy({radiusMm=20,trueOpeningFraction=.25,biasFraction=.04,
 toleranceFraction=.02,radiusBandFraction=.05}={}){
 const band=bounded(radiusBandFraction,0,.2,'Cota relativa de radio');
 const initial=inverseApertureStudy({radiusMm,trueOpeningFraction,biasFraction,toleranceFraction});
 const common={radiusMm:initial.radiusMm,observedAreaMm2:initial.observedAreaMm2,toleranceMm2:initial.toleranceMm2};
 const fixed=radiusOpeningEnvelope({...common,relativeRadiusBound:0});
 const boundedRadius=radiusOpeningEnvelope({...common,relativeRadiusBound:band});
 const widened=radiusOpeningEnvelope({...common,relativeRadiusBound:Math.min(.2,band+.05)});
 const contradict=radiusOpeningEnvelope({...common,relativeRadiusBound:band,
  observedAreaMm2:Math.PI*(radiusMm*(1+band))**2+initial.toleranceMm2+1});
 const covered=boundedRadius.feasible&&boundedRadius.lowerOpeningFraction<=trueOpeningFraction+1e-12&&
  trueOpeningFraction<=boundedRadius.upperOpeningFraction+1e-12;
 return {fixed,boundedRadius,widened,contradict,truthCovered:covered,radiusBandFraction:band,
  model:RADIUS_MODEL,provenance:'synthetic_joint_deterministic_feasible_set',
  limitation:'Una lectura de área no identifica conjuntamente radio y apertura. La banda geométrica y el margen de área son supuestos, no calibraciones GUM ni datos de un Wankel real.'};
}
export function radiusAmbiguityReport(session){
 const s=radiusAmbiguityStudy(session),b=s.boundedRadius;
 return ['## RW6+++ — Identificabilidad de radio y apertura','Modelo: '+RADIUS_MODEL,
  'Procedencia: '+s.provenance,'Radio nominal '+session.radiusMm+' mm; banda relativa ficticia ±'+s.radiusBandFraction,
  'Cota de área inventada: ±'+b.toleranceMm2.toFixed(7)+' mm²',
  'Intervalo de radios: ['+b.radiusLowMm.toFixed(6)+', '+b.radiusHighMm.toFixed(6)+'] mm',
  'Área observada: '+b.observedAreaMm2.toFixed(7)+' mm²',
  'u con radio fijo: ['+s.fixed.lowerOpeningFraction.toFixed(8)+', '+s.fixed.upperOpeningFraction.toFixed(8)+']',
  'u con radio acotado: ['+b.lowerOpeningFraction.toFixed(8)+', '+b.upperOpeningFraction.toFixed(8)+']',
  '¿Incluye u verdadero artificial? '+s.truthCovered,
  'Prueba adversarial: cota inferior mayor al área máxima; failClosed='+s.contradict.failClosed,
  s.limitation].join('\n');
}
