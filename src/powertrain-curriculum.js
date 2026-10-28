/** MC06: constrained mechanical/measurement reasoning; no OEM diagnosis. */
const source='https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419';
export const powertrainLessons=[{
 id:'mc06-dual-fault-instrumentation',topic:'motor',title:'MC06+ — Deslizamiento, sensor y balance energético del tren motriz',minutes:58,url:source,sections:[
 ['Reducción y conservación de potencia','En el modelo estacionario, una reducción ideal de tres a uno lleva 2400 rpm de entrada a 800 rpm de salida. La energía no aparece de la nada: para par y velocidades de eje, P=Tω. El rendimiento mecánico hipotético reduce la potencia de salida y el resto se considera disipación.'],
 ['El mismo síntoma puede tener causas distintas','En el laboratorio una salida de 704 rpm indicadas puede producirse por deslizamiento ficticio, por un sensor con error de −96 rpm o por deslizamiento acompañado de −48 rpm de sesgo. No es correcto diagnosticar un convertidor, embrague o transmisión a partir de esa lectura aislada.'],
 ['Dos comprobaciones con distinta finalidad','El tacómetro virtual independiente contrasta el régimen verdadero de salida. Una referencia del canal de medición contrasta su offset firmado. Es necesario combinar ambas pruebas, registrar predicciones antes de revelar valores y conservar el contexto de carga y régimen. Los instrumentos reales introducen incertidumbre adicional.'],
 ['Potencia real del modelo frente a RPM indicada','Un indicador incorrecto no cambia la energía realmente transmitida por el modelo. El cálculo de potencia de salida debe basarse en un régimen consistente con el eje físico simulado, no multiplicarse por RPM sesgadas. Incluso un balance perfecto del banco no prueba eficiencia, pérdidas térmicas o seguridad de un tren motriz real.']
 ]}];
const question=(id,question,options,answer,explanation)=>({id,topic:'motor',question,options,answer,explanation,source});
export const powertrainQuestions=[
 question('mc06dual-01','Un reductor estacionario ideal 3:1 con 2400 rpm de entrada tiene una salida de:',[
  '7200 rpm','800 rpm','2400 rpm','704 rpm siempre'],1,'Por definición de relación 3:1, el régimen ideal de salida es 2400/3=800 rpm.'),
 question('mc06dual-02','Se observan 704 rpm indicadas con la relación nominal 3:1. ¿Cuál es la conclusión justificada?',[
  'El embrague patina siempre','El sensor está mal siempre','Puede haber deslizamiento, sesgo de sensor o ambas causas; faltan pruebas independientes','La caja transmite potencia extra'],2,'Una misma señal no identifica el origen sin comprobar la velocidad con instrumento independiente y la referencia del canal.'),
 question('mc06dual-03','Para calcular potencia mecánica de salida en un eje modelado se necesita:',[
  'Par efectivo y velocidad angular verdadera del eje','La RPM indicada aunque se conozca sesgo','Solo un DTC sin mediciones','Un porcentaje de precisión supuesto'],0,'P=Tω requiere magnitudes correspondientes al mismo eje físico.'),
 question('mc06dual-04','Una comprobación de referencia arroja −48 rpm de sesgo y el tacómetro independiente muestra régimen intermedio. ¿Qué hipótesis ficticia conserva el banco?',[
  'Sensor completamente sano','No existe pérdida mecánica posible','El aceite está incorrectamente especificado','Deslizamiento mecánico y sesgo de RPM simultáneos'],3,'Ambas observaciones programadas corresponden al caso dual del laboratorio, pero no acreditan fallas físicas reales.')
];
