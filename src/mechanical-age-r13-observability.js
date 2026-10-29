/**
 * MA00 R13 — explicitly declared powertrain/energy-source/operating regime.
 * Never infer technology from engineFamily strings, PIDs or a DTC.
 * Readable PIDs alone do NOT prove a physical mechanism, cause, or calibration.
 */
export const OBSERVABILITY_VERSION='ma00-r13-observability-v1';
export const POWERTRAINS=Object.freeze(['gasoline_ice','diesel_ice','hybrid','battery_electric','unknown']);
export const FUELS=Object.freeze(['gasoline','gnc','diesel','electric','mixed','unknown']);
export const CONTROLS=Object.freeze(['closed_loop_observed','open_loop_observed','unknown']);
const GAS_REQUIRED=Object.freeze(['010C','0105','0104','0106','0107']);
const PHYSICAL_MECHANISMS=Object.freeze([
 'air_leak_vs_low_fuel_pressure',
 'biased_oxygen_sensor_vs_actual_mixture',
 'ignition_misfire_vs_low_compression',
 'cooling_thermostat_vs_ect_sensor_bias',
 'mechanical_cylinder_wear',
 'remaining_useful_life'
]);
const uniq=xs=>[...new Set(xs)].sort();

export function assessMA00Observability({
 powertrain='unknown',fuel='unknown',control='unknown',availablePids=[]
}={}){
 if(!POWERTRAINS.includes(powertrain)||!FUELS.includes(fuel)||!CONTROLS.includes(control))
  throw RangeError('Tecnología, combustible o control no reconocido en contrato MA00');
 if(!Array.isArray(availablePids)||availablePids.length>64||
  availablePids.some(v=>typeof v!=='string'||!/^01[0-9A-F]{2}$/.test(v)))
  throw RangeError('PIDs de observabilidad inválidos');
 const present=uniq(availablePids);
 const missing=GAS_REQUIRED.filter(pid=>!present.includes(pid));
 const blockers=[];
 let mode='signals_only',status='abstain',required=[];
 const gasRegime=powertrain==='gasoline_ice'&&fuel==='gasoline'&&control==='closed_loop_observed';
 if(gasRegime){
  required=[...GAS_REQUIRED];
  if(missing.length)blockers.push('Faltan PIDs requeridos para comparar correcciones en ralentí caliente: '+missing.join(', '));
  else{status='descriptive_only';mode='warm_idle_gasoline_fuel_control_descriptive';}
 }else if(powertrain==='gasoline_ice'&&fuel==='gnc'){
  blockers.push('GNC: mezclas y correcciones dependen de configuración/conmutación; faltan referencias específicas validadas');
 }else if(powertrain==='diesel_ice'){
  blockers.push('Diésel: la metodología de STFT/LTFT de gasolina no se extrapola automáticamente');
 }else if(powertrain==='hybrid'){
  blockers.push('HEV: modo térmico, ciclos on/off y estrategia híbrida no documentados para este protocolo');
 }else if(powertrain==='battery_electric'){
  blockers.push('BEV: no existe ralentí de combustión ni equivalencia con correcciones de combustible');
 }else{
  blockers.push('Tecnología, combustible o estado de control no acreditados para interpretar trims');
 }
 if(gasRegime&&missing.length)status='abstain';
 return {
  version:OBSERVABILITY_VERSION,
  powertrain,fuel,control,status,mode,requiredPids:required,
  missingPids:gasRegime?missing:[],
  supportedPids:present,
  unobservableMechanisms:[...PHYSICAL_MECHANISMS],
  blockers,
  allowableInterpretation:status==='descriptive_only'
   ?'Comparar parámetros declarados bajo protocolo; no diagnosticar mecanismo ni inferir desgaste.'
   :'Lecturas digitales individuales, si existen; no aplicar criterios de gasolina a esta familia.',
  independentlyVerified:false
 };
}

/**
 * No exported "diagnosis" object without a competing mechanism and a
 * discriminatory observation/test. Currently there is NO confirmed diagnosis.
 */
export function explainConfoundedObservations(caseId){
 const cases={
  positive_fuel_trims:{
   hypothesis:'Aire no medido / posible desvío de admisión',
   alternative:'Presión/caudal de combustible bajo o señal lambda sesgada',
   discriminatingTest:'Comparar trims bajo dos condiciones de carga controladas y corroborar fugas y presión con instrumentos adecuados; no concluyente con solo Mode 01.',
   sameObservedPids:['0106','0107','010C','0104']
  },
  warm_idle_rpm_variability:{
   hypothesis:'Control inestable de admisión/ralentí',
   alternative:'Encendido o compresión desigual; también sesgo de captura',
   discriminatingTest:'Contrastar contribución por cilindro y medidas mecánicas independientes, con procedimiento seguro.',
   sameObservedPids:['010C','0104']
  },
  coolant_shift:{
   hypothesis:'Control térmico distinto o termostato',
   alternative:'Sensor ECT desviado, aire ambiente, ventilador o carga alterada',
   discriminatingTest:'Contrastar temperatura con termometría independiente y observar respuesta térmica bajo control seguro.',
   sameObservedPids:['0105']
  },
 };
 if(!Object.hasOwn(cases,caseId))throw RangeError('Observación fuera de la ontología R13');
 return {
  id:caseId,...cases[caseId],
  evidenceLevel:'E0',status:'hypothesis_not_diagnosis',
  identifiableFromCurrentMode01:false,confirmedDiagnosis:null,
  structuralWear:null,
  caveat:'Hipótesis alternativas educativas; no autorización para ejecutar intervenciones ni diagnóstico de un motor real.'
 };
}
