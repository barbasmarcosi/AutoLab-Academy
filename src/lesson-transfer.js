/**
 * Second, held-out scenario for transfer of causal reasoning.
 * Unlike re-asking the three training decisions, these counterfactuals
 * require a conclusion under changed evidence. Fixed synthetic v2 catalog;
 * the choices are objective and never assess semantic correctness of prose.
 */
import{reasoningChallenge,gradeReasoning}from'./lesson-reasoning.js';
export const TRANSFER_MODEL='autolab-reasoning-transfer-v2';

/** Human-only review; unrelated to the four objectively graded decisions. */
export const REASONING_HUMAN_REVIEW=Object.freeze([
 {id:'causal-model',name:'Mecanismo y alternativas',levels:['Afirma una pieza sin mecanismo','Propone una causa sin justificar síntomas','Explica un mecanismo y una causa alternativa','Predice resultados distintos para dos mecanismos bajo condiciones explícitas']},
 {id:'discriminator',name:'Prueba discriminante',levels:['No propone contraste','Nombra instrumento sin observable','Define observable, condición y predicción','Compara H1 y H2 con referencia independiente y control de confusores']},
 {id:'falsification',name:'Falsación y actualización',levels:['Rechaza toda refutación','Menciona una anomalía inespecífica','Establece hallazgo que debilita H1','Revisa su conclusión ante evidencia contraria y expone alternativas']},
 {id:'provenance',name:'Procedencia e incertidumbre',levels:['Confunde modelo con medida real','Registra dato sin fuente ni condiciones','Registra fuente, unidades, contexto y límites','Contrasta calibración, incertidumbre y seguridad antes de inferir causalidad']},
 {id:'transfer',name:'Transferencia contrafactual',levels:['Repite solución pese a nueva evidencia','Reconoce nuevos datos pero no ajusta criterio','Usa evidencia nueva para decidir','Justifica revisión/retención de la hipótesis con descartes y límites']}
].map(x=>Object.freeze({...x,levels:Object.freeze(x.levels)})));
export function reasoningHumanReviewGuide(){
 return ['## Rúbrica cualitativa para un revisor humano — SIN NOTA AUTOMÁTICA',
  'Por cada criterio se sugiere un anclaje de 0 a 3. AutoLab NO juzga el texto libre ni asigna estos niveles.',
  ...REASONING_HUMAN_REVIEW.map(x=>'### '+x.name+'\n'+x.levels.map((name,i)=>i+': '+name).join('\n')),
  'Resultado de revisión humana: PENDIENTE. No hay acreditación profesional ni promedio calculado.'].join('\n');
}

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
,
['ground-test','En banco aislado con carga, la caída en el retorno es 0,03 V mientras un conector del lado positivo cae 1,45 V. ¿Qué tramo merece prioridad?',[
  'Retorno por ser masa del circuito','Conector positivo con caída localizada','Batería por tensión nominal en vacío'],1,
  'La caída principal aparece en el tramo positivo; el retorno deja de ser la causa dominante bajo este ensayo.'],
 ['sensor-reference','Ambos sensores comparten referencia, pero una medición independiente muestra referencia normal y solo la salida del sensor A está fuera de plausibilidad. ¿Qué hipótesis resiste?',[
  'Referencia común defectuosa con certeza','Ambos sensores fallan simultáneamente','Investigar salida o circuito individual A antes de culpar la referencia'],2,
  'Una referencia comprobada y una sola señal anómala orientan a una causa local, no a desvío común.'],
 ['fuel-trims','Un motor ficticio mantiene corrección positiva bajo dos cargas, pero una prueba aislada de suministro encuentra presión artificial baja mientras las lecturas de aire son plausibles. ¿Qué priorizás?',[
  'Contrastar el suministro deficiente como causa posible','Reemplazar el MAF sin más pruebas','Atribuirlo a firmware con certeza'],0,
  'Una anomalía independiente de combustible altera el conjunto de hipótesis; no se deduce una reparación única.'],
 ['pwm-scope','Una salida PWM sintética usa 0–5 V y 50 % de ciclo; otra usa 0–10 V y 25 %. ¿Cuál comparación es válida?',[
  'La frecuencia es necesariamente igual','Las dos pueden promediar 2,5 V pese a ciclos y niveles distintos','Las dos formas de onda son idénticas'],1,
  'Para PWM ideal promedio = nivel bajo + duty × amplitud; igual promedio no asegura igual señal temporal.'],
 ['ckp-cmp','La captura CKP/CMP correlacionada muestra CKP regular, CMP pulsante y desplazamiento de fase reproducible respecto de referencia del banco. ¿Qué se investiga?',[
  'Sensor CMP ausente por lectura anterior','Sistema perfecto porque ambas señales existen','Hipótesis de fase/sincronización, con contexto y referencia del modelo'],2,
  'Una señal CMP existente refuta ausencia permanente; el desfase reproducible exige interpretación de sincronización, no un reemplazo automático.'],
 ['hv','El alumno terminó todas las preguntas de teoría HV, pero el vehículo real exige una intervención energizada sin profesional autorizado. ¿Cuál es la decisión correcta?',[
  'Realizarla porque aprobó el examen','No intervenir; obtener formación, autorización, procedimiento y supervisión específicos','Medir el pack directamente para ganar experiencia'],1,'La competencia digital no satisface las barreras obligatorias para intervenir sobre energía peligrosa.'],
 ['dtc-method','Una referencia compartida de un banco aislado cae cuando entra una carga, mientras el sensor reproduce valores correctos con referencia estable. ¿Qué causa toma prioridad?',[
  'El sensor debe reemplazarse','El DTC prueba falla de ECU','Investigar referencia o retorno bajo carga como mecanismo común'],2,'La evidencia independiente localiza el efecto aguas arriba y no en el sensor individual.'],
 ['physical-can','Un banco CAN muestra tramas correctas de otros dos nodos y la ECU silenciosa tiene 0 V de alimentación local. ¿Qué priorizás?',[
  'La alimentación y retorno del nodo antes de acusar caída global','Cambiar todos los terminadores','Reprogramar el gateway'],0,'Una ausencia local documentada explica mejor el silencio de una ECU que un colapso global no observado.'],
 ['uds-nrc','Tras un NRC 0x78, la traza del banco recibe la respuesta positiva correlacionada dentro del intervalo esperado. ¿Qué hipótesis resiste?',[
  'Toda la red estaba caída','La ECU seguía procesando y completó la transacción','La petición provocó avería de memoria'],1,'La secuencia distingue procesamiento diferido de pérdida de comunicación.'],
 ['bms-calibration','Con un offset ficticio +0,1 A durante 20 h, ¿qué error de carga acumula el integrador ideal sin corrección?',[
  '0,1 Ah','20 Ah','2 Ah'],2,'El error acumulado es 0,1 A × 20 h = 2 Ah, sin inferir SOC real ni SOH.'],
 ['hv-safety','Un diagrama HEV y sus flujos de potencia parecen completos. El aprendiz propone abrir conectores HV para validarlo. ¿Qué curso de acción corresponde?',[
  'Mantener el análisis virtual y no efectuar la intervención HV no autorizada','Deshabilitar los interlocks y repetir','Aceptar porque un buen diagrama equivale a formación'],0,'La descripción de arquitectura no reemplaza formación y control de energía peligrosa.'],
 ['ecu-feed','Durante el evento, batería 12,4 V, pin ECU 8,1 V y caída significativa sobre el relé virtual. ¿Qué hipótesis gana soporte?',[
  'Batería necesariamente descargada','Caída resistiva local de alimentación bajo demanda','Firmware defectuoso confirmado'],1,'La comparación simultánea revela una caída localizada en el suministro a la ECU.'],
 ['pullups','Un contacto de un banco se verifica cerrado, pero el pin con pull-up sigue alto y la prueba de continuidad detecta conductor abierto. ¿Qué conclusión corresponde?',[
  'Contacto abierto normal','Pin correcto porque hay pull-up','La interrupción del cable explica la lectura alta pese al contacto cerrado'],2,'El circuito interrumpido elimina la ruta de masa y deja el nodo alto, igual que un contacto abierto.']
,
 ['voltage-dividers','Una carga sintética de 10 kΩ se conecta en paralelo a la resistencia inferior de 10 kΩ de un divisor 5 V y 10 kΩ/10 kΩ. ¿Qué salida ideal resulta?',[
  '2,5 V sin importar la carga','Cerca de 1,67 V porque la rama inferior equivale a 5 kΩ','5 V porque hay tres resistencias'],1,'Al poner dos resistencias de 10 kΩ en paralelo se obtienen 5 kΩ y Vout=5×5/(10+5)≈1,67 V, sin inferir tolerancias reales.'],
 ['rc-input','En el mismo modelo RC aislado se duplica la resistencia a 2 kΩ y se mantiene 100 µF sin carga externa. ¿Qué cambia?',[
  'El tiempo característico se duplica a 0,2 s','τ permanece 0,1 s por conservar C','El circuito necesariamente oscila'],0,'τ=R·C crece proporcionalmente a R para la misma capacitancia ideal, sin describir una electrónica OEM con cargas no lineales.'],
 ['actuator-power','En banco LV, el PWM de control permanece normal, pero una captura simultánea confirma alimentación ausente en la carga y corriente 0 A. ¿Qué priorizás?',[
  'La carga desarrolla torque porque hay pulsos','El driver es mecánicamente perfecto','Investigar trayecto de alimentación/retorno antes de adjudicar la falla al actuador'],2,'La falta de tensión y corriente distingue una orden presente de energía realmente entregada, sin afirmar un reemplazo concreto.'],
 ['sensor-plausibility','Tras una noche apagado, el sensor ECT realista del banco sigue ambiente, pero el diagnóstico muestra un valor fijo programado por fallback de ECU. ¿Qué indica?',[
  'El motor se mantuvo caliente toda la noche','La lectura del diagnóstico es sustitutiva, no temperatura física medida','El TPS es la causa demostrada'],1,'Separar señal de sensor medida y parámetro de sustitución impide reemplazos basados en un valor congelado.'],
 ['dcdc-lv','En un modelo aislado de 12 V, la salida auxiliar DC/DC cae durante la demanda y la caída entre salida y carga resulta despreciable. ¿Dónde centrar la prueba siguiente?',[
  'Retorno LV con falla confirmada','Pack HV defectuoso con certeza','Regulación, capacidad o habilitación del DC/DC en el modelo LV'],2,'El defecto se manifiesta ya en la fuente LV y no en el trayecto hasta la carga; no autoriza ensayos HV.'],
 ['current-shunt','En banco protegido, un shunt medido a 20 mΩ produce 80 mV diferenciales bajo condición estable. ¿Cuál corriente ideal corresponde?',[
  '4 A, siempre aclarando incertidumbre del valor real del shunt','40 A sin control térmico','0,4 A y resistencia irrelevante'],0,'La relación I=0,080/0,020=4 A cambia al variar R, por lo que calibración y temperatura importan.']
,
 ['scope-reference','En un banco aislado, una forma de onda se conserva respecto a su masa local, mientras el desplazamiento aparente de 0,8 V desaparece al comparar las referencias con sonda diferencial. ¿Qué conclusión corresponde?',[
  'El offset de referencia explica el desplazamiento aparente; no se demostró fallo del sensor','La ECU necesariamente dejó de funcionar','Un nivel diferente prueba que el sensor ha envejecido'],0,'Corregir la referencia con control diferencial refuta atribuir el offset al sensor sin evidencia independiente.'],
 ['actuator-current','Un nuevo ensayo LV muestra PWM de mando y tensión adecuada en los bornes de un actuador, pero corriente nula en la ventana de excitación. ¿Dónde investigar?',[
  'En el código de diagnóstico únicamente','En continuidad de carga y su circuito de corriente, sin afirmar todavía fallo mecánico','La carga trabaja porque su tensión es correcta'],1,'Con suministro presente y corriente nula, la hipótesis cambia de falta de tensión hacia la ruta de corriente sin poder determinar una pieza exacta.'],
 ['can-isolation','En el escenario retenido, el nodo que no responde tiene alimentación y habilitación estables, mientras los demás generan tramas válidas; el transceptor local no refleja ninguna actividad de bus. ¿Cuál es el siguiente enfoque?',[
  'Declarar toda la red caída','Transmitir arbitrariamente a un vehículo real','Investigar enlace local del transceptor o conexión de ese módulo en banco, sin concluir colapso total'],2,'La alimentación local medida desplaza la hipótesis y la red activa refuta un apagón global.'],
 ['uds-session','Una documentación de banco indica que el DID pedido solo está implementado en otra versión de firmware autorizada; el sensor entrega una señal física plausible en ensayo independiente. ¿Qué cambia?',[
  'La negativa es compatible con DID no soportado y no acredita sensor averiado','El rechazo exige sustituir sensor','Toda respuesta negativa es una falla eléctrica'],0,'La trazabilidad de la versión y un control físico independiente separan limitación de protocolo de avería del sensor.']
,
 ['mosfet-control','En un módulo didáctico se mantiene gate 10 V con corriente LV, pero el voltaje drenador-fuente bajo carga permanece muy alto. ¿Qué revisión corresponde?',[
  'Investigar pérdida de conducción o trayecto de potencia sin dar por probado mando insuficiente','El umbral de gate demuestra que todo está normal','Reemplazar inmediatamente la batería HV'],0,
  'Una excitación de puerta controlada reduce la explicación por gate insuficiente; VDS bajo corriente aporta nueva evidencia sobre la ruta de potencia.'],
 ['inductive-load','Dos circuitos simulados parten de la misma L e I inicial. El clamp A da una caída rápida y el B una lenta, y sus curvas de tensión son diferentes. ¿Qué concluís?',[
  'La energía inicial forzó dinámicas iguales','La ruta de protección condiciona el apagado aunque la energía inicial sea la misma','Ambos sistemas se pueden apagar físicamente sin protección'],1,
  'Cambiar solo el clamp con condiciones iniciales constantes distingue energía almacenada de dinámica de liberación.'],
 ['ground-reference-network','La tensión positiva respecto de batería es estable. En el nodo ECU local, su retorno presenta caída que aumenta al activarse otra carga; un canal sensor parece desplazado. ¿Qué priorizás?',[
  'Sensor defectuoso demostrado','La red CAN completa cayó con certeza','Contrastar desplazamiento de referencia y señal diferencial local antes de condenar sensores'],2,
  'Correlacionar corriente y caída en retorno identifica una explicación común para el offset, sin afirmar reparación física.'],
 ['dcdc-switches','Un buck sintético con Vin=12 V y duty fijo al 50% pasa a carga más exigente: el modelo extendido predice Vout=4,8 V por límite de corriente. ¿Qué cambió?',[
  'La aproximación ideal Vout=D·Vin ya no explica esa condición; investigar límites y control LV','El cálculo de 6 V es ley incondicional y prevalece sobre cualquier observación','El resultado demuestra batería de tracción defectuosa'],0,
  'La limitación de corriente es una condición nueva y refuta usar una ecuación ideal como garantía universal.']

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
 'Aprobación del ejercicio v2: '+result.passed,result.warning,reasoningHumanReviewGuide()
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
