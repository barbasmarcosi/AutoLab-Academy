/**
 * Nine-stage learning itinerary. Reading and objective exams are shown separately:
 * neither demonstrates competence on a real vehicle.
 */
export const learningStages=[
 {id:'base',order:1,name:'Fundamentos',subtitle:'Construí criterio de medición y seguridad',
  lessons:['volt-drop','motor-data','scope','can','bms','hv'],
  goal:'Explicar tensión, DTC, señales, redes y límites de seguridad. Examinar conceptos antes de experimentar.'},
 {id:'applied',order:2,name:'Diagnóstico aplicado',subtitle:'Compará parámetros e hipótesis reproducibles',
  lessons:['ground-test','sensor-reference','fuel-trims','dtc-method','pwm-scope','ckp-cmp','physical-can','uds-nrc','bms-calibration','hv-safety'],
  goal:'Elegir pruebas que discriminen hipótesis, explicar resultados y reconocer errores habituales.'},
 {id:'ecu',order:3,name:'Electrónica y ECUs',subtitle:'Alimentación, sensores, actuadores, gateway y DC/DC',
  lessons:['ecu-feed','pullups','sensor-plausibility','actuator-power','scope-reference','actuator-current','can-isolation','uds-session','dcdc-lv','bms-uncertainty'],
  goal:'Interpretar alimentación y señales del controlador; anticipar resultados en el banco ECU virtual.'},
 {id:'components',order:4,name:'Componentes y drivers',subtitle:'Circuitos, electrónica de potencia básica y energía almacenada',
  lessons:['voltage-dividers','resistive-loss','mosfet-control','inductive-load','current-shunt','rc-input','transceiver-edges','ground-reference-network','dcdc-switches','hv-boundaries'],
  goal:'Calcular, interpretar y contrastar tensión y corriente en modelos ideales de baja tensión sin inferir diagnósticos OEM.'},
 {id:'differential',order:5,name:'Diagnóstico diferencial',subtitle:'Distinguir causas que producen el mismo síntoma u oscilograma',
  lessons:['same-symptom','power-driver','wave-identifiability','can-physical-differential','bms-observability'],
  goal:'Escoger pruebas discriminantes, anticipar resultados y distinguir observaciones idénticas de causas comprobadas.'},
 {id:'temporal',order:6,name:'Señales y fallas intermitentes',subtitle:'Correlación multicanal y revisión de buffers temporales',
  lessons:['transient-supply','injector-dual-channel','ckp-cmp-correlation-buffer','can-intermittent-events','bms-intermittent-sensors'],
  goal:'Comparar capturas normales con el evento, seleccionar dos señales y distinguir coincidencia temporal de causa demostrada.'},
 {id:'fuel',order:7,name:'Inyección y diagnóstico OBD',subtitle:'Correcciones de combustible, plausibilidad MAF/MAP y pruebas independientes',
  lessons:['trim-patterns','intake-versus-fuel','maf-plausibility-lambda','fuel-pressure-isolated','injector-leak-model'],
  goal:'Interpretar las correcciones como respuesta del controlador y corroborar hipótesis con mediciones independientes, sin usar rangos OEM inventados.'},
 {id:'misfire',order:8,name:'Combustión y correlación de cilindros',subtitle:'Distinguir encendido, inyección, mecánica y mezcla',
  lessons:['misfire-evidence','ignition-command-current','relative-compression-limits','network-misfire-context','hev-misfire-context'],
  goal:'Separar monitor P030x, patrón por cilindro y evidencia instrumental confirmatoria, sin adjudicar culpables por un solo dato.'},
 {id:'integrative',order:9,name:'Taller Integrador',subtitle:'Cruzar OBD, oscilogramas, circuitos y condiciones de funcionamiento',
  lessons:['chain-of-evidence','obd-context-provenance','multichannel-crosschecks','mixture-closed-loop-inference','professional-diagnostic-report'],
  goal:'Documentar procedencia, confirmación, descarte e incertidumbres con un expediente reproducible; jamás equiparar la nota con una certificación de taller.'}
];
export function evaluateLearningPath(progress,lessons){
 const exists=new Set(lessons.map(l=>l.id));
 for(const stage of learningStages)if(stage.lessons.some(id=>!exists.has(id)))throw Error('Itinerario contiene una lección ausente');
 const approvedByTopic=new Set((progress.attempts||[]).filter(a=>a.percentage>=85&&
  ['electricidad','motor','senales','redes','ev'].includes(a.topic)).map(a=>a.topic));
 const completed=new Set(lessons.filter(l=>Boolean(progress.notes?.['lesson-'+l.id])).map(l=>l.id));
 const stages=learningStages.map(stage=>{
  const read=stage.lessons.filter(id=>completed.has(id)).length;
  return {...stage,read,total:stage.lessons.length,finishedReading:read===stage.lessons.length,
   nextLesson:stage.lessons.find(id=>!completed.has(id))||null};
 });
 const next=stages.find(stage=>stage.nextLesson)||null;
 return {stages,nextStage:next?.id||null,nextLesson:next?.nextLesson||null,read:completed.size,
  total:lessons.length,approvedTopics:approvedByTopic.size,
  theoryGoal:5,allRead:stages.every(s=>s.finishedReading)};
}
