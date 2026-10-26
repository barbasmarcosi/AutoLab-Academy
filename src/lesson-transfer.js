/**
 * Second, held-out scenario for transfer of causal reasoning.
 * Unlike re-asking the three training decisions, these counterfactuals
 * require a conclusion under changed evidence. Fixed synthetic v2 catalog;
 * the choices are objective and never assess semantic correctness of prose.
 */
import{reasoningChallenge,gradeReasoning}from'./lesson-reasoning.js';
export const TRANSFER_MODEL='autolab-reasoning-transfer-v2';
const values=[
 ['volt-drop','Con el consumidor alimentado en un banco aislado, un retorno cae 0,02 V y el tramo positivo cae 1,80 V. ¿Qué hipótesis resiste?',[
  'Resistencia elevada del retorno','Resistencia elevada del tramo positivo','La medición en reposo confirma ambos tramos'],1,'La gran caída localizada en el positivo, con retorno prácticamente sin caída, orienta al tramo positivo, no al retorno.'],
 ['motor-data','Un ensayo independiente confirma aire no medido en admisión, y la señal del sensor reacciona plausiblemente al corregirlo. ¿Qué conclusión corresponde?',[
  'La mezcla pobre prueba sensor averiado','Reemplazar ECU sin más datos','La entrada de aire no medida explica mejor la corrección; no se demuestra sensor averiado'],2,'Una causa física independiente y respuesta plausible del sensor refutan su reemplazo automático.'],
 ['scope','El mismo osciloscopio mide correctamente una señal patrón; la sonda también está comprobada, pero no detecta pulsos en el pin de salida del banco. ¿Qué cambió?',[
  'Se redujo la sospecha de configuración instrumental y aumentó la hipótesis de falta de señal en origen','La prueba patrón demuestra que el módulo funciona','La traza plana siempre es solo un error de escala'],0,'Una referencia conocida reduce incertidumbre instrumental; no identifica todavía cuál componente o condición impide la señal.'],
 ['can','Otros nodos comunican y en el nodo silencioso se verifican 0 V de alimentación bajo condiciones declaradas, mientras el bus global sigue activo. ¿Qué investigás primero?',[
  'Terminación global con certeza','Alimentación y retorno local del nodo','Reescribir firmware del gateway'],1,'La ausencia local de alimentación explica mejor un único nodo inactivo; una red global operativa debilita la falla global.'],
 ['bms','Dos baterías del mismo modelo muestran el mismo voltaje, pero una entregó la mitad de Ah en un ensayo controlado de capacidad. ¿Qué afirmación resiste?',[
  'Su capacidad utilizable es idéntica','El voltaje asegura igual SOH','La medida de capacidad distingue su estado; el voltaje instantáneo no prueba igualdad'],2,'El SOC estimado y la capacidad/estado de salud son atributos distintos; el voltaje no sustituye un ensayo de capacidad.'],
 ['mc01-measurement-uncertainty','Una serie de medidas repite 4,999 V ±0,001 V, pero una referencia trazable indica 5,050 V para la misma magnitud. ¿Qué describe mejor el resultado?',[
  'Alta repetibilidad con sesgo frente a referencia','Excelente exactitud por baja dispersión','Sin incertidumbre porque el instrumento repite'],0,'La baja dispersión no elimina el sesgo sistemático de −0,051 V respecto de la referencia.'],
 ['mc06-dual-fault-instrumentation','Con 800 rpm ideales, un tacómetro independiente informa 752 rpm y la referencia revela un offset de −48 rpm. El indicador reporta 704 rpm. ¿Qué causa del banco corresponde?',[
  'Solo sesgo de sensor','Deslizamiento y sesgo simultáneos','Solo deslizamiento mecánico'],1,'La velocidad verdadera reducida y el desplazamiento negativo de la lectura aparecen a la vez: ambas anomalías.'],
 ['mc08-brakes-abs','La velocidad de un cuerpo se mantiene en 10 m/s, pero su masa se duplica de 1000 a 2000 kg. ¿Cómo cambia la energía cinética ideal?',[
  'Se cuadruplica','Permanece igual','Se duplica'],2,'A velocidad fija E=½mv² es proporcional a masa, no al cuadrado de masa.'],
 ['mc14-blackbox-identification','El modelo desconocido coincide con los baselines y entrega 2,20 V tanto con 3 V como con 4 V de entrada, en el mismo banco sintético. ¿Cuál es compatible?',[
  'Modelo con saturación','Modelo lineal','Modelo curvo del catálogo'],0,'La meseta a 2,20 V en ambas entradas corresponde a la saturación; una respuesta lineal seguiría creciendo.'],
 ['rw1-analytic-geometry-validation','Duplicás N en la aproximación poligonal y el error contra la integral de Green se hace muy pequeño. Sin embargo, los sellos reales difieren del flanco recto ideal. ¿Qué demostraste?',[
  'Exactitud geométrica de un motor real','Solo convergencia numérica sobre el modelo ideal','Cilindrada y estanqueidad certificadas'],1,'Convergencia respecto del modelo elegido no demuestra que su geometría represente la pieza real.'],
 ['rw6-aperture-area-study','Dos puertos presentan igual área final, pero a media apertura la máscara deja ver áreas distintas. ¿Qué supuesto quedó refutado?',[
  'Igual área máxima obliga a igual ley de apertura','El área parcial depende de contorno y máscara','Diferentes contornos siempre producen igual caudal'],0,'Se refuta la equivalencia de apertura parcial a partir de igualdad de área total, no se infiere caudal.'],
 ['rw8-robust-uncertainty','Un candidato pasa en el punto nominal, pero el extremo desfavorable de un indicador supera una restricción dura. ¿Qué conclusión corresponde?',[
  'Cumple robustez por estar nominalmente aprobado','La restricción puede ignorarse por promedios','No es robustamente factible en el dominio declarado'],2,'Una sola violación adversa refuta la hipótesis de robustez rectangular dentro del modelo.'],
 ['rw8-factorial-coupled-design','Al comprobar cuatro esquinas acopladas, una viola una restricción dura; no hay distribución de probabilidad para los factores. ¿Qué se justifica?',[
  'Confiabilidad física 75 %','El perfil no cumple las cuatro esquinas; no puede atribuirse una probabilidad','Aprobación probabilística garantizada por otras tres esquinas'],1,'El diseño factorial es determinista; una esquina violada refuta robustez sobre las cuatro sin medir probabilidades.']
];
export const TRANSFER_CASES=Object.freeze(values.map(([lessonId,context,options,answer,feedback])=>Object.freeze({
 lessonId,context,options:Object.freeze(options),answer,feedback
})));
const registry=new Map(TRANSFER_CASES.map(x=>[x.lessonId,x]));
export function transferCase(lessonId){return registry.get(lessonId)||null;}
export function transferCaseId(lessonId){return 'lab-reasoning-'+lessonId+'-v2';}
export function gradeReasoningTransfer({lessonId,answers,transferAnswer,reasoning,limitations}){
 const transfer=transferCase(lessonId);
 if(!reasoningChallenge(lessonId)||!transfer)throw RangeError('Lección sin prueba de transferencia');
 const original=gradeReasoning({lessonId,answers,reasoning,limitations});
 if(!Number.isInteger(transferAnswer)||transferAnswer<0||transferAnswer>=transfer.options.length)throw RangeError('Transferencia ausente o inválida');
 const transferCorrect=transferAnswer===transfer.answer;
 const score=original.correct*20+(transferCorrect?30:0)+(original.reasoningDocumented&&original.limitsDocumented?10:0);
 return {model:TRANSFER_MODEL,lessonId,score,passed:original.correct===3&&transferCorrect&&original.reasoningDocumented&&original.limitsDocumented,
  decisionsCorrect:original.correct,transferCorrect,reasoningDocumented:original.reasoningDocumented,limitsDocumented:original.limitsDocumented,
  original,transfer:{selected:transferAnswer,expected:transfer.answer,correct:transferCorrect,feedback:transfer.feedback},
  warning:'Rúbrica automática: 3 decisiones conceptuales y una transferencia contrafactual con respuestas objetivas. La extensión del texto no valida su significado; se requiere revisión humana antes de acreditar razonamiento profesional.'};
}
export function reasoningTransferReport({lessonId,answers,transferAnswer,reasoning,limitations},result){
 const original=reasoningChallenge(lessonId),transfer=transferCase(lessonId);
 if(!original||!transfer||result.model!==TRANSFER_MODEL||result.lessonId!==lessonId)throw RangeError('Reporte de transferencia incompatible');
 return [
 '# AutoLab — Hipótesis y transferencia contrafactual',
 'Modelo: '+TRANSFER_MODEL,'Lección: '+lessonId,'Escenario base: '+original.context,
 ...original.steps.map((s,i)=>'Paso '+(i+1)+' '+s.question+'\nPredicción congelada: '+s.options[answers[s.id]]+'\nResultado objetivo: '+(result.original.stepResults[i].correct?'compatible':'incompatible')+'\nCriterio: '+s.feedback),
 'Escenario reservado: '+transfer.context,'Transferencia congelada: '+transfer.options[transferAnswer],
 'Criterio de transferencia: '+transfer.feedback,
 'Transferencia compatible: '+result.transferCorrect,
 'Justificación original (sin evaluación semántica): '+reasoning,
 'Límites declarados: '+limitations,'Puntaje estructurado: '+result.score+'/100',
 'Aprobación del ejercicio v2: '+result.passed,result.warning
 ].join('\n');
}
export function transferProgress(progress,lessonId){
 if(!transferCase(lessonId))return {status:'unmapped',attempts:0,passed:false,legacy:false};
 const cases=Array.isArray(progress?.cases)?progress.cases:[];
 const modern=cases.filter(x=>x?.id===transferCaseId(lessonId));
 const legacy=cases.some(x=>x?.id==='lab-reasoning-'+lessonId+'-v1'&&x?.passed===true);
 const passed=modern.some(x=>x.passed===true);
 return {status:passed?'passed':modern.length?'attempted':legacy?'legacy-passed':'not-started',
  attempts:modern.length,passed,legacy};
}
