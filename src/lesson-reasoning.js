/**
 * Guided hypothesis reasoning BEFORE launching a simulated lab.
 * Each decision is frozen before the next stage; answer keys are only shown
 * after all decisions and written limitations are submitted.
 * Evaluation checks structured conceptual choices, not natural-language truth.
 */
export const REASONING_MODEL='autolab-lesson-reasoning-v1';
const steps=(hypothesis,measurement,falsifier)=>[
 Object.freeze({id:'hypothesis',title:'1. ¿Qué podés inferir?',...hypothesis}),
 Object.freeze({id:'measurement',title:'2. ¿Qué prueba discrimina?',...measurement}),
 Object.freeze({id:'falsifier',title:'3. ¿Qué observación cambiaría tu criterio?',...falsifier})
];
const freezeCase=(id,title,context,arr)=>Object.freeze({
 id,title,context,steps:Object.freeze(arr.map(s=>Object.freeze({...s,options:Object.freeze(s.options)})))
});
export const REASONING_CHALLENGES=Object.freeze([
 freezeCase('mc06-dual-fault-instrumentation','RPM bajo: ¿falla mecánica o error de medición?',
  'Caja virtual con entrada de 2400 RPM, reducción 3:1 y salida indicada de 704 RPM. Hay tres causas posibles: deslizamiento, error instrumental o ambas.',
  steps(
   {question:'¿Qué hipótesis podés sostener con la única lectura de 704 RPM?',
    options:['El embrague patina con certeza','El sensor de RPM falla con certeza','Todavía no es identificable: hay causas alternativas'],
    answer:2,feedback:'Una misma lectura indicada no separa tres mecanismos. La primera hipótesis debe incluir la incertidumbre causal.'},
   {question:'¿Qué conjunto de pruebas tiene poder discriminante entre estas tres causas?',
    options:['Repetir la misma lectura en el mismo canal','Medir RPM con referencia independiente y verificar el offset del canal','Cambiar preventivamente la transmisión'],
    answer:1,feedback:'Tacómetro independiente y referencia de sensor aportan observables diferentes; repetir el canal defectuoso no los distingue.'},
   {question:'Si proponías únicamente un sensor sesgado, ¿qué hallazgo la refutaría?',
    options:['Una RPM independiente baja con referencia del sensor correcta','Un código de avería genérico sin condiciones','La lectura original de 704 RPM repetida'],
    answer:0,feedback:'Una referencia correcta excluye el sesgo modelado; una salida verdadera baja aporta evidencia mecánica.'})),
 freezeCase('mc14-blackbox-identification','Caja negra: modelos indistinguibles al inicio',
  'Tres transferencias ficticias (lineal, saturada y curva) entregan exactamente 1,0 V a entrada 0 V y 1,5 V a entrada 1 V.',
  steps(
   {question:'¿Qué se sabe de la función de transferencia con estos dos puntos?',
    options:['Demostraron linealidad para cualquier entrada','Los tres modelos todavía son compatibles','El modelo de saturación es imposible'],
    answer:1,feedback:'Dos coincidencias de un conjunto finito no identifican una función global.'},
   {question:'¿Cómo contrastar modelos sin ajustar la validación al mismo dato?',
    options:['Predecir la salida a 3 V y luego reservar 4 V para validarla','Elegir el modelo después de mirar toda la curva','Repetir indefinidamente 1 V'],
    answer:0,feedback:'Separar identificación y contraste retenido reduce la circularidad de ajustar y validar con el mismo dato.'},
   {question:'La hipótesis lineal predice 2,5 V a 3 V. ¿Qué lectura la contradice en el modelo?',
    options:['2,50 V','Otra observación del par inicial','2,20 V bajo condiciones idénticas'],
    answer:2,feedback:'2,20 V queda fuera de la predicción lineal sintética; requiere reconsiderar la hipótesis bajo los supuestos del ejercicio.'})),
 freezeCase('rw1-analytic-geometry-validation','RW1: error numérico no es error físico',
  'Un cálculo poligonal de áreas de tres cámaras se contrasta con una integral de Green exacta para la MISMA geometría plana ficticia.',
  steps(
   {question:'¿Qué demuestra que ambos métodos converjan al refinar los segmentos?',
    options:['Consistencia numérica de la geometría simplificada','Que los sellos Wankel reales son estancos','La eficiencia volumétrica OEM'],
    answer:0,feedback:'Dos métodos sobre una misma idealización contrastan matemática, no su fidelidad física.'},
   {question:'¿Qué experimento matemático detectaría errores de discretización?',
    options:['Aumentar los colores del gráfico','Comparar N y 2N contra el área analítica y el cierre de las tres cámaras','Cambiar bujías sin medir'],
    answer:1,feedback:'Un refinamiento, referencia exacta independiente y conservación geométrica comprueban invariantes.'},
   {question:'Si el área analítica TOTAL de las tres cámaras cambia con el ángulo bajo parámetros fijos, ¿qué implica?',
    options:['Confirmación de un motor más potente','Un coeficiente de fuga medido','Posible error de fórmula, parametrización o implementación'],
    answer:2,feedback:'El área total de la construcción cerrada debe permanecer constante en el modelo ideal, salvo falla del cálculo.'})),
 freezeCase('rw8-factorial-coupled-design','RW8: robustez y cuatro escenarios',
  'Cuatro esquinas sintéticas de dos factores acoplados son ensayos deterministas, no muestras de campo. Un perfil cumple tres de cuatro.',
  steps(
   {question:'¿Qué interpretación tiene cumplir tres de las cuatro esquinas?',
    options:['Una confiabilidad física del 75 %','Cumple tres escenarios hipotéticos y falla en uno','Probabilidad de homologación del 75 %'],
    answer:1,feedback:'El conteo es una frecuencia de escenarios elegidos, no una distribución estadística de fallos.'},
   {question:'¿Qué verificación corresponde antes de declarar robustez en el modelo afín?',
    options:['Comprobar restricciones en todas las cuatro esquinas','Mirar solo el perfil nominal','Priorizar el mayor índice de potencia'],
    answer:0,feedback:'Una única restricción violada en una esquina invalida robustez para todo el dominio de factores.'},
   {question:'¿Qué evidencia invalida afirmar que ese perfil es robusto ante todas las esquinas?',
    options:['Un gráfico con barras de distinto color','Cumplir solamente una esquina favorable','Una esquina que supera una restricción dura'],
    answer:2,feedback:'Las restricciones son duras en este modelo; una violación falsifica la hipótesis de robustez global.'}))
]);
const lookup=new Map(REASONING_CHALLENGES.map(x=>[x.id,x]));
export function reasoningChallenge(lessonId){return lookup.get(lessonId)||null;}
export function reasoningCaseId(lessonId){return 'lab-reasoning-'+lessonId+'-v1';}
const answerKeys=['hypothesis','measurement','falsifier'];
export function gradeReasoning({lessonId,answers,reasoning,limitations}){
 const scenario=reasoningChallenge(lessonId);
 if(!scenario)throw RangeError('No existe este desafío de razonamiento');
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||answerKeys.some(k=>!Number.isInteger(answers[k])||answers[k]<0||answers[k]>=3))throw RangeError('Faltan decisiones congeladas');
 if(typeof reasoning!=='string'||reasoning.length>3000||typeof limitations!=='string'||limitations.length>3000)throw RangeError('Justificación o límites inválidos');
 const correct=answerKeys.filter((k,i)=>answers[k]===scenario.steps[i].answer).length;
 const reasoningDocumented=reasoning.trim().length>=100;
 const limitsDocumented=limitations.trim().length>=60;
 const score=correct*30+(reasoningDocumented&&limitsDocumented?10:0);
 return {model:REASONING_MODEL,lessonId,score,passed:correct===3&&reasoningDocumented&&limitsDocumented,
  correct,reasoningDocumented,limitsDocumented,
  stepResults:scenario.steps.map((step,i)=>({id:step.id,selected:answers[step.id],correct:answers[step.id]===step.answer,
    expected:step.answer,feedback:step.feedback})),
  warning:'Solo se califican tres decisiones objetivas y la presencia/longitud del argumento y límites; NO se evalúa semánticamente el texto ni se certifica dominio profesional.'};
}
export function reasoningReport({lessonId,answers,reasoning,limitations},result){
 const scenario=reasoningChallenge(lessonId);
 if(!scenario||result.lessonId!==lessonId)throw RangeError('Reporte inconsistente');
 return ['# AutoLab — razonamiento guiado por hipótesis','Modelo: '+REASONING_MODEL,
 'Lección: '+lessonId,'Escenario: '+scenario.context,'',
 ...result.stepResults.map((r,i)=>scenario.steps[i].title+': '+scenario.steps[i].question+
 '\\nPredicción congelada: '+scenario.steps[i].options[r.selected]+
 '\\nEvidencia conceptual: '+r.feedback+'\\nResultado: '+(r.correct?'compatible':'requiere revisión')),
 'Justificación escrita (sin revisión semántica): '+reasoning,
 'Límites: '+limitations,'Puntaje objetivo: '+result.score+'/100',
 'Aprobación conceptual en el contrato virtual: '+result.passed,
 result.warning].join('\n');
}
export function reasoningProgress(progress,lessonId){
 if(!reasoningChallenge(lessonId))return {status:'unmapped',attempts:0,passed:false};
 const cases=Array.isArray(progress?.cases)?progress.cases.filter(x=>x?.id===reasoningCaseId(lessonId)):[];
 const passed=cases.some(x=>x.passed===true);
 return {status:passed?'passed':cases.length?'attempted':'not-started',attempts:cases.length,passed};
}
