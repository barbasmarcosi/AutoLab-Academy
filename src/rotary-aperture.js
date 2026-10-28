/**
 * RW6+ — planar aperture occlusion, exactly integrable geometry.
 *
 * Circular port: radius R and an ideal straight-edge occluder moving across
 * its diameter. OPEN region x >= d, d=R*(1-2u), u∈[0,1].
 * Equal-full-area rectangular port: width 2R, height pi*R/2.
 *
 * This is an educational 2-D mathematical model, NOT a rotary-housing port,
 * seal trajectory, angle-to-edge calibration, gas flow, pressure or efficiency.
 * No claim about Wankel real mass transfer without port CAD and boundary data.
 */
export const APERTURE_MODEL='rw6-planar-port-aperture-ideal-v1';
export const APERTURE_REFERENCE='https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/';
const finite=(v,a,b,name)=>{
 if(!Number.isFinite(v)||v<a||v>b)throw RangeError(name+' fuera de dominio');
 return v;
};
const normalize=(r,u)=>{
 finite(r,1,100,'Radio mm');finite(u,0,1,'Apertura adimensional');
 return {radiusMm:r,openFraction:u,edgeMm:r*(1-2*u)};
};
/** Exact fraction of circular disk x >= edge, nonnegative and bounded by 1. */
export function circularApertureFraction(openFraction){
 const u=finite(openFraction,0,1,'Apertura adimensional');
 if(u===0)return 0;
 if(u===1)return 1;
 const x=1-2*u; // d/R
 return (Math.acos(x)-x*Math.sqrt(Math.max(0,1-x*x)))/Math.PI;
}
export function apertureArea({radiusMm,openFraction,shape='circular'}){
 const {radiusMm:r,openFraction:u,edgeMm}=normalize(radiusMm,openFraction);
 if(!['circular','rectangular'].includes(shape))throw RangeError('Forma desconocida');
 const fullAreaMm2=Math.PI*r*r;
 const fraction=shape==='circular'?circularApertureFraction(u):u;
 return {shape,radiusMm:r,openFraction:u,edgeMm,
  widthMm:2*r,heightMm:shape==='rectangular'?Math.PI*r/2:2*r,
  fullAreaMm2,openAreaMm2:fullAreaMm2*fraction,closedAreaMm2:fullAreaMm2*(1-fraction),
  areaFraction:fraction,model:APERTURE_MODEL,
  provenance:'analytical_2d_occlusion_geometry',
  limitations:'2D port circle and equal-area rectangle behind a fictitious straight sliding edge. No mapping to rotor/housing coordinates, effective 3D area, Wankel shaft angle, flow coefficient, mass flux or real port timing.'};
}
/** Independent midpoint quadrature for exposed vertical slices of the circle. */
export function circularAreaMidpoint({radiusMm,openFraction,steps=512}){
 const {radiusMm:r,edgeMm}=normalize(radiusMm,openFraction);
 if(!Number.isInteger(steps)||steps<8||steps>32768)throw RangeError('Pasos de integración inválidos');
 const lower=Math.max(-r,Math.min(r,edgeMm));
 const width=r-lower;
 if(width===0)return 0;
 const dx=width/steps;
 let sum=0;
 for(let i=0;i<steps;i++){
  const x=lower+(i+.5)*dx;
  sum+=2*Math.sqrt(Math.max(0,r*r-x*x))*dx;
 }
 return sum;
}
/** Area opening profile sampled in an artificial sweep coordinate, not theta. */
export function apertureStudy({radiusMm=20,openFraction=.25,steps=512}={}){
 const circle=apertureArea({radiusMm,openFraction,shape:'circular'});
 const rectangle=apertureArea({radiusMm,openFraction,shape:'rectangular'});
 const numericalMm2=circularAreaMidpoint({radiusMm,openFraction,steps});
 const nextSteps=Math.min(32768,2*steps);
 const refinedMm2=circularAreaMidpoint({radiusMm,openFraction,steps:nextSteps});
 const signedDifferenceMm2=circle.openAreaMm2-rectangle.openAreaMm2;
 const samples=Array.from({length:21},(_,i)=>{
  const u=i/20;
  return {fraction:u,circular:circularApertureFraction(u),rectangular:u};
 });
 return {model:APERTURE_MODEL,provenance:'analytical_2d_occlusion_geometry',
  circular:circle,rectangle,atFraction:openFraction,
  numericalMm2,refinedMm2,steps,
  absoluteErrorMm2:Math.abs(circle.openAreaMm2-numericalMm2),
  refinedErrorMm2:Math.abs(circle.openAreaMm2-refinedMm2),
  signedDifferenceMm2,prediction:signedDifferenceMm2>1e-9?'circular':signedDifferenceMm2 < -1e-9?'rectangular':'igual',
  samples,
  warning:'Las dos formas tienen IGUAL área máxima; el área parcialmente descubierta puede variar. El borde se mueve en una coordenada u adimensional, NO grados de eje. No calcula caudal ni rendimiento Wankel.'};
}
export function gradeAperture({radiusMm,openFraction,steps,predictedArea,predictedPhysical,reasoning,limits}){
 if(!['circular','rectangular','igual'].includes(predictedArea)||!['no','si'].includes(predictedPhysical))throw RangeError('Hipótesis incompletas');
 const data=apertureStudy({radiusMm,openFraction,steps});
 const checks={area:predictedArea===data.prediction,physical:predictedPhysical==='no'};
 const explain=typeof reasoning==='string'&&reasoning.trim().length>=100;
 const caveat=typeof limits==='string'&&limits.trim().length>=75;
 const score=(checks.area?35:0)+(checks.physical?35:0)+(explain?15:0)+(caveat?15:0);
 return {model:APERTURE_MODEL,score,passed:Object.values(checks).every(Boolean)&&explain&&caveat,
  checks,provenance:data.provenance,warning:'Puntaje algebraico + longitud de texto, no evaluación semántica de la explicación ni acreditación de experimentos físicos.'};
}
export function apertureReport(session,assessment){
 const data=apertureStudy(session),c=data.circular,q=data.rectangle;
 return ['# AutoLab RW6+ — Apertura efectiva de puerto plano','',
  'Modelo: '+APERTURE_MODEL,'Procedencia: analytical_2d_occlusion_geometry',
  'Geometría nominal: círculo R='+c.radiusMm+' mm, rectángulo ancho '+q.widthMm+' mm por alto '+q.heightMm.toFixed(6)+' mm',
  'Área TOTAL común: '+c.fullAreaMm2.toFixed(8)+' mm2',
  'Coordenada de barrido no angular u='+data.atFraction+'; borde x='+c.edgeMm.toFixed(6)+' mm',
  'Área abierta circular exacta='+c.openAreaMm2.toFixed(8)+' mm2, rectangular='+q.openAreaMm2.toFixed(8)+' mm2',
  'Integración independiente midpoint='+data.numericalMm2.toFixed(8)+' mm2; refinada='+data.refinedMm2.toFixed(8)+' mm2; error refinado='+data.refinedErrorMm2.toFixed(8)+' mm2',
  'Pronóstico de mayor apertura='+session.predictedArea+', aplicabilidad OEM='+session.predictedPhysical,
  'Comparativa completa de apertura (adimensional): '+JSON.stringify(data.samples),
  'Nota='+assessment.score+'/100; cumple='+assessment.passed,
  'Razonamiento no corregido semánticamente: '+session.reasoning,'Limitaciones declaradas: '+session.limits,
  'Referencia de contexto geométrico Wankel: '+APERTURE_REFERENCE,
  'No existe rotor real, sello, área efectiva tridimensional, desplazamiento angular físico, tasa de flujo, CFD, coeficiente de descarga ni presión OEM.'].join('\n');
}
