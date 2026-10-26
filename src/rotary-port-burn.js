/**
 * RW6/RW7 conceptual research. PORTS: opening schedule of a single invented
 * chamber over 1080 shaft degrees; NOT rotor/port occlusion or intake flow CFD.
 * BURN: unit-normalized Wiebe-shaped heat release; NOT a Wankel combustion model.
 * The two clocks are deliberately INDEPENDENT: no inferred pressure, power,
 * emissions, BSFC, flame speed, heat losses, or OEM timing.
 *
 * Background: doi:10.1016/j.heliyon.2023.e21710; SAE 2020-01-0280.
 */
export const ROTARY_PORT_BURN_VERSION='rw6-rw7-disconnected-conceptual-v1';
export const PORT_RESEARCH_SOURCE='https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/';
export const PORT_OVERLAP_SOURCE='https://saemobilus.sae.org/articles/initial-investigations-benefits-challenges-eliminating-port-overlap-wankel-rotary-engines-2020-01-0280';
export const ROTARY_SHAFT_CYCLE_DEG=1080;
const finite=(n,label)=>{if(!Number.isFinite(n))throw RangeError(label+' debe ser finito');return n;};
const mod=(n,p)=>((n%p)+p)%p;
function validateSchedule(w){
 if(!w||!Number.isFinite(w.startDeg)||!Number.isFinite(w.durationDeg)||w.durationDeg<=0||w.durationDeg>ROTARY_SHAFT_CYCLE_DEG)throw RangeError('Ventana conceptual inválida');
 return w;
}
export function portOpenAt(window,shaftDeg){
 validateSchedule(window);finite(shaftDeg,'Ángulo');
 return mod(shaftDeg-window.startDeg,ROTARY_SHAFT_CYCLE_DEG)<window.durationDeg;
}
export function openingSegments(window){
 validateSchedule(window);
 const lo=mod(window.startDeg,ROTARY_SHAFT_CYCLE_DEG),hi=lo+window.durationDeg;
 if(hi<=ROTARY_SHAFT_CYCLE_DEG)return [[lo,hi]];
 return [[lo,ROTARY_SHAFT_CYCLE_DEG],[0,hi-ROTARY_SHAFT_CYCLE_DEG]];
}
export function exactPortOverlap(intake,exhaust){
 const a=openingSegments(intake),b=openingSegments(exhaust);
 return a.reduce((sum,[a0,a1])=>sum+b.reduce((part,[b0,b1])=>part+Math.max(0,Math.min(a1,b1)-Math.max(a0,b0)),0),0);
}
export function sampledPortOverlap(intake,exhaust,stepDeg=1){
 if(!Number.isInteger(stepDeg)||stepDeg<1||stepDeg>90||ROTARY_SHAFT_CYCLE_DEG%stepDeg!==0)throw RangeError('Paso de muestreo inválido');
 let n=0;
 for(let d=0;d<ROTARY_SHAFT_CYCLE_DEG;d+=stepDeg){
  const t=d+stepDeg/2;
  if(portOpenAt(intake,t)&&portOpenAt(exhaust,t))n++;
 }
 return n*stepDeg;
}
export const PORT_PRESETS=Object.freeze({
 baseline:Object.freeze({id:'baseline',label:'Base: solapamiento de apertura conceptual',intake:{startDeg:-40,durationDeg:340},exhaust:{startDeg:760,durationDeg:320}}),
 advance:Object.freeze({id:'advance',label:'Adelantar la apertura de admisión 40°',intake:{startDeg:-80,durationDeg:340},exhaust:{startDeg:760,durationDeg:320}}),
 delay:Object.freeze({id:'delay',label:'Retrasar la apertura de admisión 60°',intake:{startDeg:20,durationDeg:340},exhaust:{startDeg:760,durationDeg:320}})
});
export function portStudy(preset='delay'){
 const base=PORT_PRESETS.baseline,candidate=PORT_PRESETS[preset];
 if(!candidate||preset==='baseline')throw RangeError('Alternativa RW6 inválida');
 const b=exactPortOverlap(base.intake,base.exhaust);
 const c=exactPortOverlap(candidate.intake,candidate.exhaust);
 const measures=(item,overlapDeg)=>({
  id:item.id,intake:item.intake,exhaust:item.exhaust,overlapDeg,
  overlapFraction:overlapDeg/ROTARY_SHAFT_CYCLE_DEG,
  intakeOpportunityDeg:item.intake.durationDeg,exhaustOpportunityDeg:item.exhaust.durationDeg,
  scheduledOpenFraction:(item.intake.durationDeg+item.exhaust.durationDeg-overlapDeg)/ROTARY_SHAFT_CYCLE_DEG,
  samples:Array.from({length:37},(_,i)=>{
   const deg=i*30;
   return {shaftDeg:deg,intakeOpen:portOpenAt(item.intake,deg),exhaustOpen:portOpenAt(item.exhaust,deg)};
  })
 });
 return {version:ROTARY_PORT_BURN_VERSION,preset,base:measures(base,b),candidate:measures(candidate,c),
  deltaOverlapDeg:c-b,prediction:c>b?'aumenta':c<b?'disminuye':'igual',
  checkedExact:true,
  provenance:'derived_from_invented_port_schedule',
  limitations:'Solo ventanas rectangulares inventadas en el ciclo de UNA cámara ficticia. Ninguna relación con máscaras de los puertos, áreas efectivas, masa admitida, presiones, fuga de gases, VE, emisiones o grados OEM.'};
}
/** Fraction of a prescribed, normalized surrogate "heat release", independent
 * of port schedules, pressure, spark-plug position, combustion or fuel. */
export function normalizedHeatRelease({startDeg,durationDeg,shape=2,intensity=5},shaftDeg){
 const start=finite(startDeg,'Inicio'),duration=finite(durationDeg,'Duración');
 const exponent=finite(shape,'Forma'),a=finite(intensity,'Intensidad');
 const at=finite(shaftDeg,'Ángulo de observación');
 if(start<0||start>700||duration<=0||duration>500||exponent<0||exponent>5||a<.5||a>15)throw RangeError('Parámetros de curva normalizada fuera de rango');
 const u=Math.max(0,Math.min(1,(at-start)/duration));
 return -Math.expm1(-a*u**(exponent+1))/-Math.expm1(-a);
}
export const BURN_PRESETS=Object.freeze({
 baseline:Object.freeze({startDeg:100,durationDeg:240,shape:2,intensity:5}),
 later:Object.freeze({startDeg:140,durationDeg:240,shape:2,intensity:5}),
 shorter:Object.freeze({startDeg:100,durationDeg:160,shape:2,intensity:5})
});
export function heatReleaseStudy(preset='later',probeShaftDeg=220){
 if(!['later','shorter'].includes(preset))throw RangeError('Alternativa RW7 desconocida');
 const probe=finite(probeShaftDeg,'Ángulo de observación');
 if(probe<180||probe>280)throw RangeError('Ángulo de sonda fuera del rango didáctico');
 const base=normalizedHeatRelease(BURN_PRESETS.baseline,probe);
 const candidate=normalizedHeatRelease(BURN_PRESETS[preset],probe);
 return {version:ROTARY_PORT_BURN_VERSION,preset,probeShaftDeg:probe,
  baseline:{...BURN_PRESETS.baseline,fraction:base},
  candidate:{...BURN_PRESETS[preset],fraction:candidate},
  changeFraction:candidate-base,prediction:candidate>base?'aumenta':candidate<base?'disminuye':'igual',
  samples:Array.from({length:21},(_,i)=>{
   const shaftDeg=100+i*15;
   return {shaftDeg,baseline:normalizedHeatRelease(BURN_PRESETS.baseline,shaftDeg),
    candidate:normalizedHeatRelease(BURN_PRESETS[preset],shaftDeg)};
  }),
  provenance:'derived_from_assumed_wiebe_shape',
  limitations:'Fracción normalizada a uno de función de Wiebe ficticia; NO calor en joules, presión, torque, detonación, NOx, hidrocarburos, eficiencia, tiempo de chispa OEM ni curvas físicas Wankel.'};
}
export function evaluatePortBurn({portPreset,burnPreset,portPrediction,burnPrediction,
 realEnginePrediction,reasoning,limits}){
 const port=portStudy(portPreset),burn=heatReleaseStudy(burnPreset);
 if(!['aumenta','disminuye','igual'].includes(portPrediction)||!['aumenta','disminuye','igual'].includes(burnPrediction)||!['no','si'].includes(realEnginePrediction))throw RangeError('Pronósticos incompletos');
 const checks={port:portPrediction===port.prediction,burn:burnPrediction===burn.prediction,
  real:realEnginePrediction==='no'};
 const explained=typeof reasoning==='string'&&reasoning.trim().length>=100;
 const bounded=typeof limits==='string'&&limits.trim().length>=70;
 const score=Object.values(checks).filter(Boolean).length*20+(explained?20:0)+(bounded?20:0);
 return {version:ROTARY_PORT_BURN_VERSION,score,passed:Object.values(checks).every(Boolean)&&explained&&bounded,
  checks,provenance:'synthetic_ports_and_assumed_heat_release',
  warning:'Resultado objetivo y comprobación de longitud textual: no analiza semántica, no valida motores ni calibraciones.'};
}
export function portBurnReport(session,result){
 const ports=portStudy(session.portPreset),heat=heatReleaseStudy(session.burnPreset);
 return ['# AutoLab — RW6/RW7: Ventanas de puertos y curva de liberación normalizada','',
  'Versión: '+ROTARY_PORT_BURN_VERSION,'Procedencia: synthetic_ports_and_assumed_heat_release',
  'RW6 base: admisión inicio -40° duración 340°, escape inicio 760° duración 320°; solapamiento '+ports.base.overlapDeg+'°',
  'RW6 candidata '+ports.preset+': admisión inicio '+ports.candidate.intake.startDeg+'°, duración '+ports.candidate.intake.durationDeg+'°; solapamiento '+ports.candidate.overlapDeg+'°; cambio '+ports.deltaOverlapDeg+'°',
  'RW6 hipótesis: '+session.portPrediction+'; modelo: '+ports.prediction,
  'RW7 base Wiebe norm.: θinicio='+heat.baseline.startDeg+', Δθ='+heat.baseline.durationDeg+'; candidata '+session.burnPreset+' θinicio='+heat.candidate.startDeg+', Δθ='+heat.candidate.durationDeg,
  'RW7 fracción al ángulo '+heat.probeShaftDeg+'°: base '+heat.baseline.fraction.toFixed(6)+'; candidata '+heat.candidate.fraction.toFixed(6),
  'RW7 hipótesis: '+session.burnPrediction+'; modelo: '+heat.prediction,
  '¿Permite predecir potencia/emisiones?: '+session.realEnginePrediction,
  'Razonamiento sin evaluación semántica: '+session.reasoning,
  'Límites experimentales declarados: '+session.limits,
  'Criterio objetivo: '+result.score+'/100; completado='+result.passed,
  'Fuentes de conceptos: '+PORT_RESEARCH_SOURCE+'; '+PORT_OVERLAP_SOURCE,
  'Los dos modelos usan clocks separados y parámetros inventados: ninguna equivalencia con áreas efectivas, combustion física o datos Mazda/OEM.'].join('\n');
}
