/**
 * MA00 acquisition evidence gate.
 *
 * Metadata is only an OPERATOR ASSERTION, never independently verified.
 * Successful gates permit descriptive comparisons, NOT diagnoses, age,
 * service causality, health percentages, RUL or wear measurements.
 */
export const EVIDENCE_VERSION='ma00-operator-metadata-v1';
const named=x=>typeof x==='string'&&x.trim().length>=3&&x.length<=96;
const id=x=>named(x)&&/^[a-zA-Z0-9][\w.-]{2,95}$/.test(x);
const enumOf=(v,choices)=>choices.includes(v);
const timestamp=v=>{
 if(typeof v!=='string')return false;
 const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(v);
 if(!match)return false;
 const [,y,mo,d,h,mi,s,zone]=match;
 const year=Number(y),month=Number(mo),day=Number(d);
 const leap=year%4===0&&(year%100!==0||year%400===0);
 const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 if(month<1||month>12||day<1||day>days[month-1]||Number(h)>23||Number(mi)>59||Number(s)>59)return false;
 if(zone!=='Z'){
  const zh=Number(zone.slice(1,3)),zm=Number(zone.slice(4,6));
  if(zh>14||zm>59||(zh===14&&zm!==0))return false;
 }
 return Number.isFinite(Date.parse(v));
};
const finiteAmbient=v=>typeof v==='number'&&Number.isFinite(v)&&v>=-40&&v<=60;

export function auditMeasurementEvidence(snapshot){
 if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw TypeError('Expediente inválido');
 if(snapshot.source==='synthetic')return {
  version:EVIDENCE_VERSION,completeness:'synthetic_demo_only',documented:true,
  missing:[],unfavorable:[],provenance:'synthetic',independentlyVerified:false,allowedToInferWear:false
 };
 const m=snapshot.measurementContext;
 const missing=[],unfavorable=[];
 if(!m||typeof m!=='object'||Array.isArray(m)){
  return {version:EVIDENCE_VERSION,completeness:'missing_metadata',documented:false,
   missing:['measurementContext'],unfavorable:[],provenance:'operator_asserted',
   independentlyVerified:false,allowedToInferWear:false};
 }
 if(!id(m.sessionId))missing.push('sessionId');
 if(!timestamp(m.capturedAt))missing.push('capturedAt con zona horaria');
 if(!named(m.adapterModel))missing.push('adapterModel');
 if(!named(m.softwareVersion))missing.push('softwareVersion');
 if(!id(m.serviceEventId))missing.push('serviceEventId');
 if(!finiteAmbient(m.ambientC))missing.push('ambientC');
 if(!enumOf(m.clock,['monotonic_observed','unknown']))missing.push('clock');
 if(!enumOf(m.fuelControl,['closed_loop_observed','open_loop_observed','unknown']))missing.push('fuelControl');
 if(!enumOf(m.ac,['off_observed','on_observed','unknown']))missing.push('ac');
 if(!enumOf(m.coolingFan,['stable_observed','cycling_observed','unknown']))missing.push('coolingFan');
 if(!enumOf(m.electricalLoads,['stable_observed','changing_observed','unknown']))missing.push('electricalLoads');
 if(m.clock==='unknown')unfavorable.push('Reloj de adquisición sin confirmación monotónica');
 if(m.fuelControl==='unknown'||m.fuelControl==='open_loop_observed')unfavorable.push('Correcciones STFT/LTFT sin lazo cerrado documentado');
 if(m.ac!=='off_observed'&&enumOf(m.ac,['on_observed','unknown']))unfavorable.push('Aire acondicionado no constatado apagado');
 if(m.coolingFan!=='stable_observed'&&enumOf(m.coolingFan,['cycling_observed','unknown']))unfavorable.push('Ventilador con ciclo no controlado');
 if(m.electricalLoads!=='stable_observed'&&enumOf(m.electricalLoads,['changing_observed','unknown']))unfavorable.push('Carga eléctrica variable/desconocida');
 const documented=missing.length===0&&unfavorable.length===0;
 return {version:EVIDENCE_VERSION,completeness:documented?'documented_operator_claims':'insufficient_or_uncontrolled',
  documented,missing,unfavorable,provenance:'operator_asserted',
  independentlyVerified:false,allowedToInferWear:false};
}
export function compareMeasurementEvidence(before,after){
 const a=auditMeasurementEvidence(before),b=auditMeasurementEvidence(after);
 if(before.source==='synthetic'&&after.source==='synthetic'){
  return {version:EVIDENCE_VERSION,documented:true,blockers:[],independentlyVerified:false,
   label:'Comparación únicamente sintética. No existe observación física.'};
 }
 const blockers=[];
 if(before.source!==after.source)blockers.push('Procedencia de capturas diferente');
 if(!a.documented)blockers.push('Metadatos anteriores incompletos o condiciones no controladas: '+[...a.missing,...a.unfavorable].join(', '));
 if(!b.documented)blockers.push('Metadatos posteriores incompletos o condiciones no controladas: '+[...b.missing,...b.unfavorable].join(', '));
 const x=before.measurementContext,y=after.measurementContext;
 if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)&&!Array.isArray(y)){
  if(id(x.sessionId)&&id(y.sessionId)&&x.sessionId===y.sessionId)blockers.push('Identidad de sesión reutilizada');
  if(timestamp(x.capturedAt)&&timestamp(y.capturedAt)&&Date.parse(y.capturedAt)<=Date.parse(x.capturedAt))blockers.push('Orden cronológico de sesiones inválido');
  if(id(x.serviceEventId)&&id(y.serviceEventId)&&x.serviceEventId!==y.serviceEventId)blockers.push('Intervenciones distintas');
  if(named(x.adapterModel)&&named(y.adapterModel)&&x.adapterModel!==y.adapterModel)blockers.push('Adaptadores diferentes sin estudio de equivalencia');
  if(named(x.softwareVersion)&&named(y.softwareVersion)&&x.softwareVersion!==y.softwareVersion)blockers.push('Versiones de adquisición diferentes');
  if(finiteAmbient(x.ambientC)&&finiteAmbient(y.ambientC)&&Math.abs(y.ambientC-x.ambientC)>5)blockers.push('Diferencia ambiente >5 °C; umbral educativo');
 }
 return {version:EVIDENCE_VERSION,documented:blockers.length===0,blockers,independentlyVerified:false,
  label:blockers.length===0?'Contexto declarado compatible; no existe validación instrumental independiente':'Comparación documental insuficiente'};
}
