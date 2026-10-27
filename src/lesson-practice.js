/**
 * Explicit, auditable links between theory and *existing* practical engines.
 * Never invent a lab for a lesson or infer mastery from simply reading.
 * mode=embedded mounts the real simulator in the lesson; linked opens its
 * existing lab, while preserving the learner's theory reading marker.
 */
export const LESSON_PRACTICES=Object.freeze([
 {lessonId:'sensor-plausibility',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-sensor-fallback-v1',
  title:'ECT: valor sustitutivo frente a temperatura de referencia',prompt:'Estimá la diferencia entre un valor diagnóstico congelado por fallback y una referencia física sintética. Discriminá lectura de ECU de estado real.'},
 {lessonId:'scope-reference',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-scope-ground-v1',
  title:'Osciloscopio: offset por referencia y retorno',prompt:'Predecí cómo se desplaza el potencial aparente al variar la referencia. No conectes masas de equipos reales a puntos desconocidos.'},
 {lessonId:'resistive-loss',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-resistive-loss-v1',
  title:'Potencia I²R de una conexión: predicción y refutación',prompt:'Calculá la pérdida resistiva variando corriente sin generar calor real. Contrastá por qué una continuidad sin carga puede ocultar el comportamiento bajo consumo.'},
 {lessonId:'mosfet-control',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-mosfet-v1',
  title:'MOSFET low-side: pérdidas por resistencia de conducción',prompt:'Anticipá P=I²·RDS(on) bajo condición de excitación completa y aclarando por qué el voltaje umbral no garantiza un driver sano.'},
 {lessonId:'inductive-load',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-inductor-energy-v1',
  title:'Energía de bobina ficticia: análisis de límites',prompt:'Estimá E=½LI² en una bobina ideal antes de revelar cálculos. No extrapoles el resultado a tensiones de desconexión sin modelo de protección.'},
 {lessonId:'ground-reference-network',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-shared-return-v1',
  title:'Desplazamiento de potencial en masa compartida',prompt:'Predecí ΔV=I·R de un retorno LV de impedancia conocida y distinguí el modelo de un diagnóstico confirmado de CAN o ECU.'},
 {lessonId:'dcdc-switches',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-buck-v1',
  title:'Buck LV: teoría y cálculo de duty',prompt:'Contrastá la aproximación ideal Vout≈D·Vin de un buck de 12 V sin equiparar el cálculo a regulación real o sistemas HV.'},
 {lessonId:'scope',page:'wave-inquiry',kind:'embedded',caseId:'lab-scope-waveform-v1',
  title:'Osciloscopía: contrastá período y frecuencia',prompt:'Definí una predicción de frecuencia antes de conocer la onda sintética. Contrastá escala temporal y amplitud.'},
 {lessonId:'pwm-scope',page:'wave-inquiry',kind:'embedded',caseId:'lab-pwm-waveform-v1',
  title:'PWM: reconocé qué cambia el duty',prompt:'Antes de revelar el oscilograma, predecí fracción de tiempo alto, hipótesis y evidencia incompatible.'},
 {lessonId:'ckp-cmp',page:'wave-inquiry',kind:'embedded',caseId:'lab-ckp-waveform-v1',
  title:'CKP: separá referencia de rueda y velocidad',prompt:'Anticipá RPM para una vuelta completa de duración conocida sin confundir huecos de referencia con falla confirmada.'},
 {lessonId:'physical-can',page:'wave-inquiry',kind:'embedded',caseId:'lab-can-differential-waveform-v1',
  title:'CAN: calculá el diferencial dominante',prompt:'Predecí la diferencia entre CAN-H y CAN-L en una trama sintética antes de observar ambos canales.'},
 {lessonId:'pullups',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-pullup-v1',
  title:'Pull-up con retorno resistivo en banco',prompt:'Anticipá la tensión de una entrada conectada a masa por diferentes resistencias; contrastá circuito abierto, contacto ideal y divisor real.'},
 {lessonId:'actuator-power',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-pwm-v1',
  title:'Mando PWM: promedio frente a corriente real',prompt:'Predecí el promedio de una señal cuadrada antes de calcularlo; diferenciá orden de control, energía entregada y respuesta del actuador.'},
 {lessonId:'can',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-can-termination-v1',
  title:'CAN: terminaciones equivalentes en un modelo sin energía',prompt:'Predice la resistencia equivalente de resistores paralelos sin confundir un resultado numérico con diagnóstico concluyente del bus físico.'},
 {lessonId:'voltage-dividers',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-divider-v1',
  title:'Divisor con carga: contrastá tu cálculo',prompt:'Antes de conocer la salida matemática, predecí cómo cambia Vout al poner una resistencia de carga en paralelo con la inferior.'},
 {lessonId:'rc-input',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-rc-v1',
  title:'Respuesta RC: predecí una constante de tiempo',prompt:'Elegí una resistencia, anticipá τ=RC y describí cómo falsarías el modelo manteniendo fija la capacidad.'},
 {lessonId:'current-shunt',page:'numeric-bench',kind:'embedded',caseId:'lab-numeric-shunt-v1',
  title:'Shunt: del milivoltio al amperio calculado',prompt:'Con ΔV constante, predecí qué corriente ideal corresponde a una resistencia real distinta de la nominal y qué la refutaría.'},
 {lessonId:'mc06-dual-fault-instrumentation',page:'powertrain',kind:'embedded',caseId:'lab-powertrain-mc06-v1',
  title:'Investigá las tres causas de una misma RPM',prompt:'Antes de revelar la lectura, planteá una causa alternativa y anticipá qué pasaría en un tacómetro independiente y en una referencia de sensor.'},
 {lessonId:'mc14-blackbox-identification',page:'inventor',kind:'embedded',caseId:'lab-inventor-blackbox-v1',
  title:'Identificá un modelo con datos retenidos',prompt:'Predecí qué entrada separará los modelos indistinguibles y comprobá tu hipótesis con otra entrada que no hayas usado para elegirla.'},
 {lessonId:'rw1-analytic-geometry-validation',page:'rotary',kind:'embedded',caseId:'lab-rotary-geometry-v1',
  title:'Contrastá integral exacta y polígono',prompt:'Antes de aumentar la resolución, estimá si el error de aproximación debería disminuir y verificá la conservación de área sin confundir precisión numérica con validez física.'},
 {lessonId:'rw8-factorial-coupled-design',page:'ecu-robust',kind:'embedded',caseId:'lab-ecu-robust-v1',
  title:'Contrastá cuatro esquinas factoriales',prompt:'Formulá una predicción sobre qué perfiles pasarán todas las esquinas y luego intentá refutarla; cuatro ensayos sintéticos no son una probabilidad.'},
 {lessonId:'mc06-gears-powertrain',page:'powertrain',kind:'linked',caseId:'lab-powertrain-mc06-v1',title:'Causas mecánicas y medición independiente',prompt:'Una sola lectura de RPM no alcanza. Contrastá pérdida mecánica con un canal sesgado.'},
 {lessonId:'mc01-measurement-uncertainty',page:'metrology',kind:'linked',caseId:'lab-metrology-uncertainty-v1',title:'Presupuesto de incertidumbre',prompt:'Antes de medir, diferenciá variación de lecturas, resolución y sesgo de calibración común.'},
 {lessonId:'mc08-brakes-abs',page:'brakes',kind:'linked',caseId:'lab-brake-energy-v1',title:'Energía y límites de adherencia',prompt:'Predecí cómo cambia la energía al duplicar la velocidad y explicá por qué no resulta una distancia de frenado real.'},
 {lessonId:'rw3-energy-losses',page:'rotary-thermal',kind:'linked',caseId:'lab-rotary-thermal-v1',title:'Balance de pérdidas',prompt:'Anticipá qué ocurre al cambiar las pérdidas modeladas y distinguí balances ideales de observaciones físicas.'},
 {lessonId:'rw5-convection-limits',page:'rotary-heat',kind:'linked',caseId:'lab-rotary-convection-v1',title:'Transferencia térmica ficticia',prompt:'Contrastá sensibilidad a parámetros térmicos sin inferir coeficientes físicos medidos.'},
 {lessonId:'rw6-port-phase-tradeoffs',page:'rotary-ports',kind:'linked',caseId:'lab-rotary-port-burn-v1',title:'Fases de puertos y combustión conceptual',prompt:'Planteá hipótesis sobre el efecto de cambiar fases de apertura y distinguilas de caudal físico real.'},
 {lessonId:'rw7-burn-shape-literacy',page:'rotary-ports',kind:'linked',caseId:'lab-rotary-port-burn-v1',title:'Interpretar perfiles de liberación de calor',prompt:'Anticipá un cambio de forma de combustión del modelo sin confundirlo con emisiones o knock medidos.'},
 {lessonId:'rw6-aperture-area-study',page:'rotary-aperture',kind:'linked',caseId:'lab-rotary-aperture-v1',title:'Geometría de apertura',prompt:'Predecí la apertura de dos figuras a igual desplazamiento de máscara.'},
 {lessonId:'rw6-inverse-area-metrology',page:'rotary-inverse',kind:'linked',caseId:'lab-rotary-aperture-inverse-v1',title:'Inversión geométrica de área',prompt:'Estudiá qué geometrías podrían producir el mismo dato y cómo discriminarlas.'},
 {lessonId:'rw6-radius-identifiability',page:'rotary-inverse',kind:'linked',caseId:'lab-rotary-aperture-inverse-v1',title:'Identificabilidad del radio',prompt:'Proponé una medición adicional de radio antes de concluir una apertura única.'},
 {lessonId:'rw8-robust-uncertainty',page:'ecu-robust',kind:'linked',caseId:'lab-ecu-robust-v1',title:'Robustez frente a incertidumbre',prompt:'Diferenciá factibilidad nominal, robustez de caja y perturbaciones acopladas.'},
 {lessonId:'rw8-pareto-frontier',page:'ecu-robust',kind:'linked',caseId:'lab-ecu-robust-v1',title:'Optimización bajo restricciones',prompt:'Antes de mirar el conjunto de Pareto, compará factibilidad y preferencias.'}
].map(x=>Object.freeze(x)));
const byLesson=new Map(LESSON_PRACTICES.map(x=>[x.lessonId,x]));
export function lessonPractice(lessonId){return byLesson.get(lessonId)??null;}
export function practiceProgress(progress,lessonId){
 const p=lessonPractice(lessonId);
 if(!p)return {status:'unmapped',attempts:0,passed:false};
 const cases=Array.isArray(progress?.cases)?progress.cases.filter(x=>x&&x.id===p.caseId):[];
 const passed=cases.some(x=>x.passed===true);
 if(p.kind==='linked')return {status:passed?'related-passed':cases.length?'related-attempted':'not-started',
  attempts:cases.length,passed:false};
 return {status:passed?'passed':cases.length?'attempted':'not-started',
  attempts:cases.length,passed};
}
export function practiceCoverage(lessons){
 const known=new Set(lessons.map(x=>x.id)),duplicate=new Set(),unknown=[];
 for(const p of LESSON_PRACTICES){
  if(!known.has(p.lessonId)||duplicate.has(p.lessonId))unknown.push(p.lessonId);
  duplicate.add(p.lessonId);
 }
 return {total:known.size,mapped:LESSON_PRACTICES.length,embedded:LESSON_PRACTICES.filter(x=>x.kind==='embedded').length,
  linked:LESSON_PRACTICES.filter(x=>x.kind==='linked').length,unmapped:known.size-LESSON_PRACTICES.length,invalid:unknown};
}
