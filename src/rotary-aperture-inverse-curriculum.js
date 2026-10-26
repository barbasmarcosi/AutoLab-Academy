/** RW6++ mathematical inverse-problem literacy, not measured engine port data. */
const gum='https://www.bipm.org/en/web/guest/publications/guides';
const background='https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/';
export const rotaryInverseLessons=[{
 id:'rw6-inverse-area-metrology',topic:'motor',
 title:'RW6++ — Metrología inversa: recuperar apertura desde área con sesgo',
 minutes:57,url:gum,sections:[
 ['Problema directo contra problema inverso','El problema directo de RW6+ parte del avance conocido u de una máscara recta y calcula el área descubierta de un círculo ideal. Un problema inverso parte del área observada y busca qué apertura u podría haberla originado. La función de segmento circular es monótona en el intervalo cero a uno, por lo que su inversa se encuentra por bisección sin crear soluciones espurias.'],
 ['Tolerancia determinista frente a incertidumbre metrológica','En RW6++ el instrumento y el sesgo son artificiales. Una tolerancia ±T en mm² se traduce en un intervalo posible de área y por inversión en un intervalo de u. No es una incertidumbre estándar GUM, no define un nivel de confianza ni proporciona una probabilidad de cobertura. El marco JCGM/GUM establece cómo se describen modelos de medición e incertidumbres reales.'],
 ['Sensibilidad, extremos e identificabilidad','La derivada normalizada dF/du=8·sqrt(u·(1−u))/π tiende a cero al abrir o cerrar por completo el círculo. Cerca de esos extremos, una diferencia pequeña de área puede corresponder a un desplazamiento más grande del borde que en la mitad. El intervalo de u puede ser asimétrico y debe obtenerse invirtiendo ambas cotas, en vez de asumir un error lineal uniforme.'],
 ['Ensayo de sesgo y transferencia científica','Probá un sesgo ficticio de +0,04 de área total con tolerancia ±0,02: el área observada puede quedar fuera del intervalo que cubriría el valor simulado verdadero. Para trasladar el problema a un Wankel real harían falta geometría CAD, ubicación/calibración del sensor, incertidumbre trazable y cinemática de los sellos. La variable u del banco no equivale a grados de eje ni permite inferir caudal o eficiencia.']
 ]}];
const q=(id,question,options,answer,explanation,source)=>({id,topic:'motor',question,options,answer,explanation,source});
export const rotaryInverseQuestions=[
 q('rw6inverse-01','Un problema inverso de apertura parte de:',[
  'u conocido y calcula el área','Un mapa de chispa OEM','Área observada y busca la apertura compatible','La presión de escape del motor'],2,
  'Se recupera u desde A observada mediante la inversa de un modelo matemático de segmento circular.',gum),
 q('rw6inverse-02','Una tolerancia artificial ±0,02 de área total sin calibración demuestra:',[
  'Una probabilidad de cobertura del 95 %','Un margen determinista supuesto, no incertidumbre estadística GUM','Exactitud de un instrumento real','Una fase angular de rotor'],1,
  'La tolerancia didáctica no define una distribución ni el nivel de confianza de una medida real.',gum),
 q('rw6inverse-03','Con igual margen de área, cerca de u=0,05 el intervalo de u puede ser mayor que en u=0,50 porque:',[
  'La derivada del área respecto del avance es menor cerca del borde','El radio del círculo es diferente','El caudal compresible siempre aumenta','La fricción del motor se vuelve cero'],0,
  'El cociente dF/du es pequeño en los extremos; por ello la inversa es sensible a pequeñas variaciones de área.',gum),
 q('rw6inverse-04','Una lectura sintética sesgada +0,04 con tolerancia ±0,02 de área total:',[
  'Siempre acredita exactitud física','Demuestra fase de puerto de un Wankel','Permite omitir control de incertidumbre','Puede excluir el valor verdadero simulado del intervalo recuperado'],3,
  'Un sesgo mayor que la tolerancia supuesta puede dejar la verdad fuera del rango derivado.',background)
];
