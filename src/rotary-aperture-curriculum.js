/**
 * RW6+ geometric area-learning bridge. Port geometry is intentionally
 * idealized and does not represent measured rotor-flank opening vs shaft angle.
 */
const study='https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/';
export const rotaryApertureLessons=[{
 id:'rw6-aperture-area-study',topic:'motor',
 title:'RW6+ — Apertura de lumbreras: área nominal, máscara móvil y convergencia',
 minutes:58,url:study,
 sections:[
  ['De la fase angular al área que puede descubrirse','La existencia de una fase de apertura no informa cuánto puerto queda realmente visible en cada instante. Para estudiar admisión y escape es necesario distinguir comienzo de apertura, apertura completa, comienzo de cierre y cierre completo, y obtener la forma de la máscara y la lumbrera en la geometría del motor.'],
  ['Un modelo geométrico calculable y limitado','El laboratorio RW6+ utiliza una circunferencia de radio R y un rectángulo de igual superficie máxima. Ambos quedan ocultos parcialmente por un borde recto ficticio cuyo avance se describe mediante u de cero a uno. La sección circular abierta es un segmento calculable exactamente; la rectangular tiene crecimiento lineal con u.'],
  ['Predicción frente a comprobación independiente','Antes de revelar números, se predice qué figura expone más área cuando u=0,25, 0,5 o 0,75. Una integral numérica por bandas verticales aproxima el segmento circular de manera independiente. Al duplicar bandas se puede comprobar convergencia, detectar errores discretos y verificar unidades de superficie en mm².'],
  ['La geometría real exige más evidencia','En un Wankel real, la silueta del flanco y los contornos de las lumbreras cambian de exposición durante el giro. El estudio de modelado paramétrico utiliza fases PSO/PFO/PSC/PFC y construye áreas con transformaciones de flancos y CFD. RW6+ no reproduce esas máscaras, no enlaza u con grados físicos y no predice presión, caudal, eficiencia volumétrica, potencia ni emisiones.']
 ]
}];
const item=(id,question,options,answer,explanation,source)=>({id,topic:'motor',question,options,answer,explanation,source});
export const rotaryApertureQuestions=[
 item('rw6aperture-01','Dos puertos tienen igual superficie máxima. Ante una máscara que se desplaza, su área abierta:',[
 'Siempre es idéntica a igual avance','Puede diferir por la forma geométrica','Depende solo de la cantidad de bujías','Prueba igual masa admitida'],1,
 'El mismo tamaño máximo no fija el área expuesta en aperturas parciales; la geometría y el borde importan.',study),
 item('rw6aperture-02','Para el círculo ideal RW6+, la integración independiente por bandas permite:',[
 'Demostrar potencia real','Calcular el coeficiente de descarga OEM','Comprobar convergencia y el área de la fórmula analítica','Encontrar detonación'],2,
 'Una cuadratura numérica puede contrastarse con la expresión exacta del segmento circular.',study),
 item('rw6aperture-03','La variable u de RW6+ entre cero y uno representa:',[
 'Avance adimensional de una máscara recta ficticia','Grados de eje Mazda normalizados','Presión de admisión','Tensión del inyector'],0,
 'No hay una transformación validada entre esa coordenada de barrido y la cinemática de un Wankel real.',study),
 item('rw6aperture-04','Para extrapolar área de puerto a caudal real faltaría, entre otras cosas:',[
 'El color del gráfico','Más preguntas de examen','Una tabla de calificaciones','Contorno CAD, máscara real, Δp, estado termodinámico y modelo de flujo'],3,
 'La superficie geométrica por sí sola no define masa de gas, pérdidas o intercambio compresible.',study)
];
