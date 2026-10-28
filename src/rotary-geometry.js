/** RW1 simplified 2D Wankel teaching model, NOT engine CAD or thermodynamics.
 * Geometry: https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/ */
export const ROTARY_MODEL=Object.freeze({id:'rw1-epitrochoid-straight-flanks',version:1,Rmm:90,emm:14,widthMm:50,segments:96});
const TAU=2*Math.PI, RAD=Math.PI/180;
export function validateGeometry(p=ROTARY_MODEL){
 const {Rmm,emm,widthMm,segments}=p||{};
 if(![Rmm,emm,widthMm,segments].every(Number.isFinite)||Rmm<=3*emm||emm<=0||Rmm>1000||widthMm<=0||widthMm>1000||!Number.isInteger(segments)||segments<24||segments>720)throw RangeError('Parámetros geométricos inválidos');
 return p;
}
export function normalizedAngle(deg){if(!Number.isFinite(deg))throw RangeError('Ángulo inválido');return ((deg%1080)+1080)%1080;}
export function housingPoint(a,p=ROTARY_MODEL){
 validateGeometry(p);if(!Number.isFinite(a))throw RangeError('Parámetro angular inválido');
 return{x:p.emm*Math.cos(3*a)+p.Rmm*Math.cos(a),y:p.emm*Math.sin(3*a)+p.Rmm*Math.sin(a)};
}
export function rotorAt(deg,p=ROTARY_MODEL){
 validateGeometry(p);const theta=normalizedAngle(deg)*RAD,phase=theta/3;
 return{center:{x:p.emm*Math.cos(theta),y:p.emm*Math.sin(theta)},phaseRad:phase,
  apexes:[0,1,2].map(k=>housingPoint(phase+TAU*k/3,p))};
}
export function chamberBoundary(deg,index,p=ROTARY_MODEL){
 validateGeometry(p);if(!Number.isInteger(index)||index<0||index>2)throw RangeError('Cámara inválida');
 const start=normalizedAngle(deg)*RAD/3+TAU*index/3;
 return Array.from({length:p.segments+1},(_,i)=>housingPoint(start+TAU*i/(3*p.segments),p));
}
export function signedArea(points){
 if(!Array.isArray(points)||points.length<3)throw RangeError('Polígono inválido');
 let sum=0;
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  if(![a?.x,a?.y,b?.x,b?.y].every(Number.isFinite))throw RangeError('Coordenadas inválidas');
  sum+=a.x*b.y-b.x*a.y;
 }
 return sum/2;
}
export function chamberAreas(deg,p=ROTARY_MODEL){
 validateGeometry(p);
 const areas=[0,1,2].map(k=>signedArea(chamberBoundary(deg,k,p)));
 if(areas.some(a=>!Number.isFinite(a)||a<=0))throw RangeError('Recinto no válido');
 const total=areas.reduce((a,b)=>a+b,0);
 return areas.map((areaMm2,chamber)=>({chamber,areaMm2,share:areaMm2/total,volumeProxyCm3:areaMm2*p.widthMm/1000}));
}
// Phase labels are a conceptual sequence; NOT port or ignition timing.
export function conceptualPhase(deg,index){
 if(!Number.isInteger(index)||index<0||index>2)throw RangeError('Cámara inválida');
 const phase=normalizedAngle(deg-[90,810,450][index]);
 return ['admisión','compresión','expansión','escape'][Math.floor(phase/270)]+' (conceptual)';
}
export function trendNext(deg,index,delta=30,p=ROTARY_MODEL){
 if(!Number.isFinite(delta)||delta<=0||delta>90)throw RangeError('Intervalo inválido');
 const a=chamberAreas(deg,p)[index]?.areaMm2,b=chamberAreas(deg+delta,p)[index]?.areaMm2;
 if(a===undefined||b===undefined)throw RangeError('Cámara inválida');
 return Math.abs(b-a)<1e-7?'igual':b>a?'aumenta':'disminuye';
}
export function mechanicalPowerKw(torqueNm,rpm){
 if(![torqueNm,rpm].every(Number.isFinite)||torqueNm<0||rpm<0||torqueNm>100000||rpm>100000)throw RangeError('Par o régimen inválido');
 return torqueNm*TAU*rpm/60000;
}
