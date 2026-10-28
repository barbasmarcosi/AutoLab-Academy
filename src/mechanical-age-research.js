/**
 * Mechanical age research v0: controlled-idle observational deviation only.
 * NO mechanical age, structural wear, remaining life or diagnostic certification.
 * All limits below are educational assay rules, not OEM tolerances.
 */
export const MECHANICAL_AGE_VERSION='ma-obd-controlled-idle-v0';
export const PROTOCOL='warm-idle-fixed-load-v0';
const bound=(x,min,max)=>Math.max(min,Math.min(max,x));
const median=xs=>{const a=[...xs].sort((a,b)=>a-b),k=a.length>>1;return a.length%2?a[k]:(a[k-1]+a[k])/2;};
const mad=xs=>{const center=median(xs);return median(xs.map(x=>Math.abs(x-center)));};
const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const fields={rpm:[0,7500],ectC:[-40,150],loadPct:[0,100],stftPct:[-100,100],ltftPct:[-100,100],iatC:[-40,125]};
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);

export function evaluateMechanicalSnapshot(record){
 if(!record||typeof record!=='object'||Array.isArray(record))throw TypeError('Se requiere un expediente');
 const {engineFamily,vehicleAlias,protocol,phase,source,samples}=record;
 if(typeof vehicleAlias!=='string'||vehicleAlias.trim().length<3||vehicleAlias.length>80)throw RangeError('Identificador anónimo de vehículo requerido');
 if(typeof engineFamily!=='string'||engineFamily.trim().length<3||engineFamily.length>100)throw RangeError('Familia de motor requerida');
 if(protocol!==PROTOCOL)throw RangeError('Protocolo de ensayo no reconocido');
 if(!['before_service','after_service'].includes(phase))throw RangeError('Fase de service inválida');
 if(!['synthetic','provided_obd_unverified'].includes(source))throw RangeError('Procedencia inválida');
 if(!Array.isArray(samples)||samples.length<20||samples.length>10000)throw RangeError('Se requieren entre 20 y 10000 muestras');
 const trims=samples.every(s=>s&&has(s,'stftPct')&&has(s,'ltftPct'));
 const anyTrims=samples.some(s=>s&&(has(s,'stftPct')||has(s,'ltftPct')));
 if(anyTrims&&!trims)throw RangeError('Correcciones incompletas: no se imputan datos ausentes');
 const hasIat=samples.every(s=>s&&has(s,'iatC'));
 const anyIat=samples.some(s=>s&&has(s,'iatC'));
 if(anyIat&&!hasIat)throw RangeError('IAT incompleta: no se imputan datos ausentes');
 let last=-Infinity;
 for(const [i,s] of samples.entries()){
  if(!s||typeof s!=='object'||Array.isArray(s)||!finite(s.timeMs,0,1e14)||s.timeMs<=last)throw RangeError('Tiempos inválidos, duplicados o desordenados en muestra '+i);
  last=s.timeMs;
  for(const name of ['rpm','ectC','loadPct',...(trims?['stftPct','ltftPct']:[]),...(hasIat?['iatC']:[])]){
   if(!finite(s[name],...fields[name]))throw RangeError('Lectura fuera de rango de '+name+' en muestra '+i);
  }
 }
 const values=name=>samples.map(s=>s[name]);
 const rpm=median(values('rpm')),ect=median(values('ectC')),load=median(values('loadPct'));
 const rpmRobustSigma=1.4826*mad(values('rpm'));
 const temperatureRange=Math.max(...values('ectC'))-Math.min(...values('ectC'));
 const loadRange=Math.max(...values('loadPct'))-Math.min(...values('loadPct'));
 const trim=trims?median(samples.map(s=>s.stftPct+s.ltftPct)):null;
 const iat=hasIat?median(values('iatC')):null;
 const elapsedSec=(samples.at(-1).timeMs-samples[0].timeMs)/1000;
 const intervals=samples.slice(1).map((row,i)=>row.timeMs-samples[i].timeMs);
 const medianIntervalMs=median(intervals),maxIntervalMs=Math.max(...intervals);
 const exclusion=[];
 if(elapsedSec<19)exclusion.push('Duración menor de 19 s');
 if(medianIntervalMs<100||medianIntervalMs>5000||maxIntervalMs>Math.max(5000,4*medianIntervalMs))exclusion.push('Muestreo irregular/no representativo: huecos o frecuencia fuera del protocolo educativo');
 if(ect<75||ect>110||temperatureRange>5)exclusion.push('Refrigerante fuera de condiciones térmicas v0');
 if(rpm<550||rpm>1150)exclusion.push('Régimen fuera de rango educativo de ralentí');
 if(load>35||loadRange>10)exclusion.push('Carga no comparable/estable');
 if(!trims)exclusion.push('Faltan STFT y LTFT: v0 no puntúa diésel ni señales parciales');
 const eligible=exclusion.length===0;
 const speedDeviation=bound((rpmRobustSigma-4)/55,0,1);
 const trimDeviation=trim===null?null:bound((Math.abs(trim)-5)/20,0,1);
 // An arbitrary weighted score must never be applied to externally supplied OBD as if it were calibrated.
 const deviationIndex=eligible&&source==='synthetic'?Math.round(100*(.4*speedDeviation+.6*trimDeviation)):null;
 return {
  model:MECHANICAL_AGE_VERSION,protocol,phase,source,engineFamily:engineFamily.trim(),
  sampleCount:samples.length,elapsedSec,medianIntervalMs,maxIntervalMs,
  status:eligible?'eligible':'inconclusive',exclusion,vehicleAlias:vehicleAlias.trim(),
  features:{medianRpm:rpm,rpmRobustSigma,medianEctC:ect,medianLoadPct:load,medianIatC:iat,medianCombinedTrimPct:trim,temperatureRange,loadRange},
  deviationIndex,scoringStatus:source==='synthetic'?'demonstration_only':'not_calibrated_external_data',
  structuralWear:null,mechanicalAgeEquivalentKm:null,remainingUsefulLife:null,
  indexMeaning:'Desviación exploratoria 0-100 en ralentí controlado, NO porcentaje de desgaste, salud o edad',
  thresholdsMeaning:'Umbrales educativos arbitrarios, sin calibración OEM ni validación clínica/mecánica',
  provenance:source,
  caveat:'Sin banco, compresión, leak-down ni evaluación longitudinal no puede inferirse desgaste permanente.'
 };
}
export function compareMechanicalSnapshots(before,after){
 const a=evaluateMechanicalSnapshot(before),b=evaluateMechanicalSnapshot(after);
 const blockers=[];
 if(a.phase!=='before_service'||b.phase!=='after_service')blockers.push('Orden antes/después inválido');
 if(a.engineFamily!==b.engineFamily)blockers.push('Familias de motor distintas');
 if(a.vehicleAlias!==b.vehicleAlias)blockers.push('No es el mismo vehículo');
 if(a.source!==b.source)blockers.push('Procedencia distinta');
 if(a.status!=='eligible'||b.status!=='eligible')blockers.push('Algún ensayo no cumple el protocolo');
 if(Math.abs(a.features.medianRpm-b.features.medianRpm)>80)blockers.push('Régimen de ralentí no comparable');
 if(Math.abs(a.features.medianEctC-b.features.medianEctC)>5)blockers.push('Temperatura de refrigerante no comparable');
 if(Math.abs(a.features.medianLoadPct-b.features.medianLoadPct)>5)blockers.push('Carga no comparable');
 if(a.features.medianIatC!==null&&b.features.medianIatC!==null&&Math.abs(a.features.medianIatC-b.features.medianIatC)>7)blockers.push('Temperatura de admisión no comparable');
 if((a.features.medianIatC===null)!==(b.features.medianIatC===null))blockers.push('IAT presente en un solo ensayo');
 const comparable=blockers.length===0;
 return {
  model:MECHANICAL_AGE_VERSION,comparable,blockers,before:a,after:b,
  deltaDeviationIndex:comparable&&a.deviationIndex!==null&&b.deviationIndex!==null?b.deviationIndex-a.deviationIndex:null,
  interpretation:comparable?(a.deviationIndex===null?'Variables observadas comparables, pero SIN puntuación de datos externos no calibrados':'Cambio observado en índice sintético; causalidad y desgaste NO identificados'):'No comparar índices bajo condiciones dispares',
  mechanicalAgeChangeKm:null,structuralRejuvenationClaim:false
 };
}
/** Dataset sintético sin observaciones de vehículos reales, para demostrar el contrato. */
export function syntheticServicePair(){
 const make=(phase)=>{
  const before=phase==='before_service';
  return {
   engineFamily:'demo-gasoline-inline4',vehicleAlias:'demo-unit-001',protocol:PROTOCOL,phase,source:'synthetic',
   samples:Array.from({length:40},(_,i)=>({
    timeMs:i*1000,rpm:800+(before?24:5)*Math.sin(i*1.37),
    ectC:89+Math.sin(i*.2),loadPct:18+Math.sin(i*.15),
    stftPct:(before?12:2)+Math.sin(i*.7),ltftPct:before?8:1,
    iatC:31+Math.sin(i*.1)
   }))
  };
 };
 return {before:make('before_service'),after:make('after_service')};
}
