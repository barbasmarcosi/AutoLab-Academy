/** RW5 — Introductory thermal transport learning bridge; not CFD or OEM repair data. */
const sae='https://saemobilus.sae.org/papers/investigation-surface-area-volume-ratio-wankel-rotary-engines-affects-heat-transfer-heat-losses-2025-01-8357';
const nasa='https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/engine-thermodynamic-analysis/';
export const rotaryHeatLessons=[{
 id:'rw5-convection-limits',topic:'motor',
 title:'RW5 — Convección, superficie/volumen y pérdidas térmicas: causalidad real',
 minutes:55,url:sae,
 sections:[
  ['Balance de transferencia de calor','El modelo uniforme Q̇=h·A·(Tgas−Tpared) aproxima una potencia térmica y permite estudiar sensibilidad algebraica: h en W/(m²·K), A en m² y la diferencia térmica en kelvin producen watts. No integra conducción, radiación ni condiciones espaciales o transitorias.'],
  ['Por qué el área no cuenta toda la historia','Si la superficie disminuye pero el coeficiente convectivo aumenta, el producto puede aumentar o disminuir. En una cámara Wankel, h depende del flujo, temperaturas, turbulencia, régimen y geometría; no debe tratarse como constante al modificar un diseño físico sin comprobarlo.'],
  ['Investigación publicada y límites','Trabajos sobre Wankel y relación superficie/volumen advierten que minimizar ese cociente no garantiza minimizar pérdidas térmicas. El intercambio convectivo también cambia; para inferir eficiencia real hace falta modelar temperaturas, velocidades de gas, transferencia y combustión, y contrastar con ensayos independientes.'],
  ['Diseño de experimento','Compará la hipótesis del laboratorio RW5 para dos coeficientes distintos, manteniendo ΔT supuesta. En investigación física, documentá área real, pared/carga térmica, referencia instrumental, incertidumbre, flujo y protocolo. No conviertas la nota del laboratorio en aprobación de piezas ni en calibración de un motor.']
 ]
}];
const item=(id,question,options,answer,explanation,source)=>({id,topic:'motor',question,options,answer,explanation,source});
export const rotaryHeatQuestions=[
 item('rw5-convection-01','En el modelo Q̇=h·A·ΔT, las unidades W/(m²·K) × m² × K dan:',['Watts','Pascales','Litros','Joules por metro'],0,'La expresión estima una potencia térmica, no temperatura ni energía almacenada.',sae),
 item('rw5-convection-02','Si se reduce A y simultáneamente aumenta h, ¿qué se puede concluir sobre Q̇?',['Siempre disminuye','Siempre sube','Es cero','Depende del producto h·A y ΔT'],3,'No es posible concluir a partir de solo una variable cuando cambian las demás.',sae),
 item('rw5-convection-03','¿Qué dato no produce automáticamente un experimento de h·A·ΔT uniforme?',['Sensibilidad dimensional','Cambio algebraico de potencia térmica','Pérdidas reales por combustión y eficiencia OEM de un Wankel','Tendencia ideal bajo parámetros fijados'],2,'El modelo lumped no resuelve CFD, combustión, coeficientes reales ni ensayos de motor.',sae),
 item('rw5-convection-04','Para comprobar que un rediseño Wankel perdió menos calor en condiciones equivalentes, se necesitan:',['Solo un dibujo CAD','Mediciones térmicas y de operación reproducibles con incertidumbre','Solo un área de cámara menor','Un video de ralentí'],1,'La validación física exige medidas independientes, condiciones repetibles y sus incertidumbres.',nasa)
];
