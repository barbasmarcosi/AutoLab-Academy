/**
 * RW1+ exact 2D Green-integral solution, independently derived from the
 * epicyclic curve and the straight rotor chord. No polygon/shape sampling.
 * Mathematical validation of this IDEALISED planar construction only:
 * never engine displacement, combustion chamber CAD, trapped mass or OEM data.
 *
 * Curve: z(t)=R exp(i t)+e exp(3i t), adjacent vertices separated by 2pi/3.
 * 1/2 integral(x dy-y dx)=(R²+3e²)Delta/2+Re[sin(2b)-sin(2a)].
 * Straight return chord contributes cross(P(b),P(a))/2.
 * After simplification:
 * A=(R²+3e²)pi/3-sqrt(3)R²/4
 *   -(3sqrt(3)/2)Re cos(2a-pi/3).
 */
import {ROTARY_MODEL,validateGeometry,normalizedAngle,chamberAreas} from './rotary-geometry.js';
export const ANALYTIC_GEOMETRY_MODEL='rw1-independent-green-integral-straight-flanks-v1';
const PI=Math.PI,SQRT3=Math.sqrt(3);
const chamberIndex=i=>{if(!Number.isInteger(i)||i<0||i>2)throw RangeError('Cámara inválida');return i;};
export function analyticChamberAreaMm2(deg,index,p=ROTARY_MODEL){
 validateGeometry(p);chamberIndex(index);
 const a=normalizedAngle(deg)*PI/540+2*PI*index/3;
 const {Rmm:R,emm:e}=p;
 const area=(R*R+3*e*e)*PI/3-SQRT3*R*R/4-(3*SQRT3/2)*R*e*Math.cos(2*a-PI/3);
 if(!Number.isFinite(area)||area<=0)throw RangeError('Área analítica no física para el modelo');
 return area;
}
export function analyticHousingMinusRotorAreaMm2(p=ROTARY_MODEL){
 validateGeometry(p);
 const {Rmm:R,emm:e}=p;
 return PI*(R*R+3*e*e)-3*SQRT3*R*R/4;
}
export function independentGeometryAudit(deg,p=ROTARY_MODEL){
 validateGeometry(p);
 if(p.segments>360)throw RangeError('La comparación independiente requiere 2N <= 720 segmentos');
 const theta=normalizedAngle(deg);
 const fineParams={...p,segments:p.segments*2};
 const coarse=chamberAreas(theta,p),fine=chamberAreas(theta,fineParams);
 const exactTotal=analyticHousingMinusRotorAreaMm2(p);
 const rows=[0,1,2].map(index=>{
  const exactMm2=analyticChamberAreaMm2(theta,index,p);
  const coarseMm2=coarse[index].areaMm2,fineMm2=fine[index].areaMm2;
  return {chamber:index,exactMm2,polygonMm2:coarseMm2,refinedPolygonMm2:fineMm2,
   absoluteErrorMm2:Math.abs(coarseMm2-exactMm2),
   refinedAbsoluteErrorMm2:Math.abs(fineMm2-exactMm2),
   relativeErrorPct:100*Math.abs(coarseMm2-exactMm2)/exactMm2,
   refinedRelativeErrorPct:100*Math.abs(fineMm2-exactMm2)/exactMm2};
 });
 const exactSum=rows.reduce((sum,x)=>sum+x.exactMm2,0);
 return {model:ANALYTIC_GEOMETRY_MODEL,angleDeg:theta,segments:p.segments,refinedSegments:fineParams.segments,rows,
  analyticTotalMm2:exactTotal,exactSumMm2:exactSum,
  areaClosureErrorMm2:Math.abs(exactTotal-exactSum),
  maxRelativeErrorPct:Math.max(...rows.map(x=>x.relativeErrorPct)),
  maxRefinedRelativeErrorPct:Math.max(...rows.map(x=>x.refinedRelativeErrorPct)),
  provenance:'exact_green_integral_vs_independent_polygon_discretization',
  limitations:'Validación matemática solo de epitrocoide plana con flancos rectos. Error de discretización NO es incertidumbre de fabricación ni evidencia de desplazamiento o rendimiento Wankel.'};
}
