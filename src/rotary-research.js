/** Rotary Research Bench P1b: model sensitivity, NOT real engine optimization.
 * Independent variable: eccentricity e (mm). Controlled R, virtual width,
 * chamber polygon, sampling grid. Response: proxy swept-volume swing. */
import{ROTARY_MODEL,chamberAreas,validateGeometry}from'./rotary-geometry.js';
export const RESEARCH_BENCH_VERSION='rw-geometry-sensitivity-v1';
export function geometrySweep(eMm,segments=ROTARY_MODEL.segments){
 const params=validateGeometry({...ROTARY_MODEL,emm:eMm,segments});
 const samples=Array.from({length:73},(_,i)=>({
  shaftDeg:i*15,proxyCm3:chamberAreas(i*15,params)[0].volumeProxyCm3
 }));
 const values=samples.map(x=>x.proxyCm3);
 const minCm3=Math.min(...values),maxCm3=Math.max(...values);
 return {eMm,minCm3,maxCm3,swingCm3:maxCm3-minCm3,samples};
}
export function geometryResearch(candidateE){
 if(![10,18].includes(candidateE))throw RangeError('Elegí una alternativa documentada de 10 o 18 mm');
 const baseline=geometrySweep(ROTARY_MODEL.emm),candidate=geometrySweep(candidateE);
 // A discretization consistency check, NOT a physical uncertainty bound.
 const fine=geometrySweep(candidateE,192),coarse=geometrySweep(candidateE,48);
 const discretizationPct=100*Math.abs(fine.swingCm3-coarse.swingCm3)/fine.swingCm3;
 const deltaCm3=candidate.swingCm3-baseline.swingCm3;
 return {model:RESEARCH_BENCH_VERSION,baseline,candidate,deltaCm3,
  changePct:deltaCm3/baseline.swingCm3*100,
  direction:Math.abs(deltaCm3)<1e-8?'igual':deltaCm3>0?'aumenta':'disminuye',
  numericalConvergencePct:discretizationPct,
  controlled:{Rmm:ROTARY_MODEL.Rmm,widthMm:ROTARY_MODEL.widthMm,segments:ROTARY_MODEL.segments,stepDeg:15},
  origin:'derived_from_geometry',limitations:'Solo proxy geométrico con flancos rectos, sin sellos, tolerancias, combustión, rendimiento o mediciones OEM.'};
}
