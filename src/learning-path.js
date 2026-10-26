/**
 * Sixteen-stage learning itinerary. Reading and objective exams are shown separately:
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
  goal:'Documentar procedencia, confirmación, descarte e incertidumbres con un expediente reproducible; jamás equiparar la nota con una certificación de taller.'},
 {id:'mechanics',order:10,name:'Mecánica integral — fundamentos',subtitle:'MC00–MC01 · Seguridad de taller, física y metrología',
  lessons:['mc00-risk-assessment','mc01-measurement-uncertainty','mc01-torque-preload'],
  goal:'Identificar riesgos, evaluar límites de competencia y justificar mediciones e incertidumbre antes de diagnosticar.'},
 {id:'engine-core',order:11,name:'Arquitectura y motores',subtitle:'MC02–MC05 · Tren motriz, motores, diésel, lubricación y térmica',
  lessons:['mc02-energy-path','mc03-cycle-vs-architecture','mc03-piston-cinematics','mc04-diesel-commonrail','mc05-cooling-lubrication'],
  goal:'Distinguir arquitecturas mecánicas, ciclos, relación de compresión y síntomas mecánicos de lecturas indirectas.'},
 {id:'chassis-core',order:12,name:'Chasis, transmisión y seguridad',subtitle:'MC06–MC09 · Caja, dirección, ruedas, frenos y climatización',
  lessons:['mc06-gears-powertrain','mc06-dual-fault-instrumentation','mc07-chassis-geometry','mc08-brakes-abs','mc09-hvac-loop'],
  goal:'Interpretar tren motriz, adherencia, controles de estabilidad y climatización sin atribuirle al modelo capacidades físicas que no tiene.'},
 {id:'control-core',order:13,name:'Control e híbridos',subtitle:'MC10–MC12 · Señales, ECUs y seguridad eléctrica',
  lessons:['mc10-electronic-architecture','mc11-engine-control','mc12-hybrid-energy'],
  goal:'Relacionar mediciones y control con la mecánica, conservar límites HV y contrastar arquitecturas energéticas.'},
 {id:'research-core',order:14,name:'Diagnóstico e investigación',subtitle:'MC13–MC14 · Hipótesis, diseño experimental e invención',
  lessons:['mc13-diagnostic-method','mc14-research-doe','mc14-blackbox-identification'],
  goal:'Formular hipótesis alternativas, diseñar pruebas discriminantes, estimar incertidumbre y entregar evidencia reproducible.'},
 {id:'rotary-science',order:15,name:'Ingeniería rotativa: termodinámica',subtitle:'RW1–RW7 · Geometría, energía, puertos, metrología y combustión conceptual',
  lessons:['rw1-analytic-geometry-validation','rw2-ideal-versus-architecture','rw3-energy-losses','rw5-convection-limits','rw6-port-phase-tradeoffs','rw6-aperture-area-study','rw6-inverse-area-metrology','rw6-radius-identifiability','rw7-burn-shape-literacy'],
  goal:'Distinguir ciclo termodinámico de arquitectura mecánica y exigir ensayos antes de inferir rendimiento Wankel.'},
 {id:'rotary-control',order:16,name:'Ingeniería rotativa: control y optimización',subtitle:'RW8/RW8+ · Restricciones, incertidumbre y Pareto',
  lessons:['rw8-controller-boundaries','rw8-constrained-experiment','rw8-robust-uncertainty','rw8-pareto-frontier','rw8-factorial-coupled-design'],
  goal:'Elegir estrategias solo entre alternativas factibles, documentar descartes y rechazar extrapolación a calibraciones OEM.'}
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
