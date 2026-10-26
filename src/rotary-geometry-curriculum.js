/** RW1+ independent analytical verification training; never an OEM model. */
const green='https://mathworld.wolfram.com/GreensTheorem.html';
const port='https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/';
export const rotaryGeometryLessons=[
 {id:'rw1-analytic-geometry-validation',topic:'motor',title:'RW1+ — Validar geometría Wankel idealizada con una integral independiente',minutes:58,url:green,sections:[
  ['Definir cuidadosamente el objeto matemático','AutoLab RW1 dibuja una curva epitrocoidal en dos dimensiones y cierra sus tres cámaras mediante cuerdas rectas entre vértices. No representa curvaturas reales de flancos, sellos, holguras, volumen atrapado ni una carcasa CAD del fabricante. Una magnitud derivada del dibujo no debe etiquetarse como cilindrada física.'],
  ['Contrastar dos algoritmos, no dos fuentes físicas','El polígono aproxima el contorno muestreando una cantidad finita de puntos y sumando productos cruzados. Una segunda derivación usa la integral de Green sobre la curva paramétrica y la contribución exacta de la cuerda de cierre. La independencia de discretización permite detectar errores numéricos, no verificar el parecido del dibujo con un motor real.'],
  ['Conservación y refinamiento de malla','Para el modelo ideal la suma de tres cámaras equivale a área interior de epitrocoide menos el triángulo rotor ideal, sin dependencia del ángulo del eje. Refinar N=96 a N=192 segmentos reduce el error de aproximación en los casos del laboratorio. Un cambio en el valor calculado con el refinamiento no es una distribución estadística ni un error de medición.'],
  ['Volumen proxy, periodicidad y falsación','El área plana se convierte a una cifra en centímetros cúbicos multiplicándola por un ancho inventado y dividiendo por 1000. La figura se repite tras 1080 grados de eje excéntrico en el ejemplo y al permutar las cámaras se observan simetrías entre fases. No se deben inferir compresión, caudal, torque ni rendimiento de esta fórmula sin modelo 3D y datos de operación.']
 ]},
];
const item=(id,question,options,answer,explanation,source)=>({id,topic:'motor',question,options,answer,explanation,source});
export const rotaryGeometryQuestions=[
 item('rw1analytic-01','¿Qué verifica comparar el área poligonal RW1 con la integral exacta independiente?',[
  'La cilindrada física de un Wankel real','La coherencia matemática de dos procedimientos para la misma geometría ficticia','La presión de compresión OEM','La ausencia de fugas en los sellos'],1,'La derivación independiente contrasta dos métodos matemáticos, no valida la geometría real ni las condiciones termodinámicas.',green),
 item('rw1analytic-02','Si el error de discretización baja al pasar de 96 a 192 segmentos, ¿qué conclusión corresponde?',[
  'Se calibró un instrumento real','Se certificó la tolerancia de fabricación','La aproximación numérica converge para la construcción geométrica definida','Se conoce el volumen atrapado por el motor'],2,'La convergencia de malla es una propiedad del método de cálculo; no constituye una medición física.',green),
 item('rw1analytic-03','En el RW1 plano ideal con flancos rectos, la suma de las tres áreas de cámaras:',[
  'Es constante con el giro de eje para parámetros fijos','Debe ser cero siempre','Define directamente la eficiencia térmica','Depende de la temperatura de refrigerante'],0,'La geometría cerrada contiene un área total constante; la redistribución por cámaras no crea ni destruye superficie.',green),
 item('rw1analytic-04','¿Qué falta para pasar del volumen proxy de RW1 a datos de desempeño físico del motor?',[
  'Un gráfico con más colores','Únicamente multiplicar por tres','Renombrar la unidad a cm³ reales','Geometría tridimensional y holguras verificadas, puertos, condiciones de operación y ensayos'],3,'La extrusión de un área 2D con ancho arbitrario no predice masa atrapada, combustión ni prestaciones reales.',port)
];
