/** MC14: virtual system identification. No calibration, OEM or hardware. */
const source='https://www.mathworks.com/help/ident/ug/specifying-estimation-and-validation-data.html';
export const inventorLessons=[{id:'mc14-blackbox-identification',topic:'senales',title:'MC14 — Identificación de caja negra y conjunto de validación',minutes:55,url:source,sections:[
 ['La misma lectura admite modelos diferentes','Que una función lineal, otra saturada y otra curva compartan las lecturas en dos entradas iniciales no permite afirmar que son idénticas. Es necesario proponer nuevas entradas cuyo resultado esperado sea diferente bajo cada hipótesis; ese contraste se diseña antes de observar los números.'],
 ['Congelar hipótesis antes de revelar una medición','Un pronóstico escrito después de ver un resultado no permite discriminar entre anticipación y explicación retrospectiva. Primero se documenta lo esperado y sus alternativas, luego se ejecuta la prueba simulada y finalmente se registra cuál hipótesis fue refutada o sigue siendo viable.'],
 ['Conjunto de estimación versus conjunto retenido','En este ejemplo se usa una entrada a 3 V para identificar el modelo y otra a 4 V como verificación retenida. MathWorks recomienda separar datos de estimación y validación en identificación de sistemas para reducir el riesgo de sobreajuste. Las funciones, el ruido y los umbrales del ejercicio son inventados por AutoLab.'],
 ['Rigor, instrumental y límites de seguridad','Estos valores son lecturas virtuales y no proceden de una fuente conectada, de un sensor real ni de una ECU OEM. No se extraen probabilidades, incertidumbre calibrada o desempeño físico. La rúbrica controla hipótesis, predicciones y contenido mínimo escrito, pero no interpreta semánticamente la justificación del alumno.']
 ]}];
const q=(id,question,options,answer,explanation)=>({id,topic:'senales',question,options,answer,explanation,source});
export const inventorQuestions=[
 q('mc14blackbox-01','Si tres modelos coinciden en sus dos lecturas iniciales, ¿qué se necesita para identificarlos?',[
  'Afirmar que los tres son iguales','Entradas adicionales cuyas predicciones diverjan','Suponer calibración de fábrica','Reemplazar componentes de inmediato'],1,'Dos lecturas compartidas no distinguen las tres funciones alternativas.'),
 q('mc14blackbox-02','¿Cuándo debe registrarse la predicción del nuevo ensayo discriminante?',[
  'Después de revelar la lectura','Antes de revelar la lectura','Luego de cerrar el expediente','Solo después de cambiar de instrumento'],1,'La predicción previa hace falsable el contraste entre las hipótesis.'),
 q('mc14blackbox-03','¿Para qué sirve conservar una entrada distinta como dato de validación retenido?',[
  'Para falsificar datos de calibración','Para mostrar más colores','Para contrastar un modelo sin usar ese dato al elegirlo','Para eliminar la necesidad de controles'],2,'El conjunto retenido ayuda a verificar la generalización fuera del ajuste inicial.'),
 q('mc14blackbox-04','¿Qué acredita una evaluación perfecta del banco MC14 de caja negra?',[
  'Solo resolver un desafío matemático virtual bajo supuestos declarados','Autorización para programar ECU','Trazabilidad real de mediciones','Certificación de seguridad en alta tensión'],0,'No hay instrumentos físicos ni evaluación técnica profesional, solo datos sintéticos.')
];
