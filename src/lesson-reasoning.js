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

 freezeCase('volt-drop','Arranque lento: reposo versus carga',
  'Un circuito virtual marca 12,6 V en reposo pero un consumidor funciona débilmente bajo carga. Se sospecha resistencia parásita en un cable o retorno.',
  steps(
   {question:'¿Qué permite concluir 12,6 V en reposo?',
    options:['La fuente podrá entregar cualquier corriente','El circuito no tiene resistencias parásitas','La tensión sin carga, por sí sola, no explica su comportamiento bajo consumo'],
    answer:2,feedback:'Una lectura en vacío no cuantifica caídas bajo corriente y no identifica tramos defectuosos.'},
   {question:'¿Qué comparación de baja tensión discrimina una caída resistiva bajo carga?',
    options:['Medir la diferencia de potencial entre los extremos del tramo mientras circula una carga de ensayo segura','Cambiar la batería por sospecha','Medir únicamente tensión en reposo'],
    answer:0,feedback:'Una caída entre dos puntos del mismo conductor bajo carga apunta a resistencia de ese tramo, siempre dentro de un montaje seguro.'},
   {question:'¿Qué resultado refutaría que la mayor caída pertenece al retorno supuesto?',
    options:['El circuito entrega corriente','Se observa casi cero caída en ese retorno, pero gran caída en otro tramo aislado','El voltímetro muestra 12,6 V otra vez en reposo'],
    answer:1,feedback:'La evidencia de otro tramo con caída dominante obliga a cambiar la localización de la hipótesis inicial.'})),
 freezeCase('motor-data','DTC: una condición detectada no identifica la pieza',
  'En un caso ficticio aparece un código de mezcla pobre y correcciones de combustible positivas. El sensor de oxígeno es una hipótesis, pero también pueden existir entrada de aire no medida o combustible insuficiente.',
  steps(
   {question:'¿Qué justifica el código junto con la corrección positiva?',
    options:['Hay evidencia de un desequilibrio observado por el control, no de un componente culpable único','El sensor de oxígeno está averiado con certeza','La inyección debe sustituirse de inmediato'],
    answer:0,feedback:'DTC y corrección responden a condiciones detectadas por la ECU, sin localizar por sí solos una causa.'},
   {question:'¿Cuál es una prueba útil para separar causas alternativas?',
    options:['Borrar el código y asumir éxito','Sustituir el sensor sin contrastarlo','Comparar datos congelados, plausibilidad de sensores y pruebas independientes de admisión/combustible'],
    answer:2,feedback:'Contexto y medición independiente ayudan a discriminar una falla real de mezcla de un problema de lectura.'},
   {question:'¿Qué dato debilita la hipótesis de un sensor defectuoso como causa exclusiva?',
    options:['Otro código de un vehículo distinto','Un defecto de admisión confirmado independientemente y señal plausible bajo el mismo contexto','El color de una captura OBD'],
    answer:1,feedback:'Evidencia externa de aire no medido junto a respuesta plausible del sensor requiere revisar causalidad.'})),
 freezeCase('scope','Osciloscopio: una traza plana no siempre es señal ausente',
  'Un instrumento virtual muestra una línea plana. Podría existir ausencia de señal, una escala de tiempo inapropiada, una atenuación incorrecta o disparo mal seleccionado.',
  steps(
   {question:'¿Qué hipótesis es legítima ante la única captura plana?',
    options:['El sensor está cortado sin excepción','El canal es perfecto y la señal siempre es cero','La observación puede ser instrumental o del circuito y aún es ambigua'],
    answer:2,feedback:'Configuración y conexión afectan la forma de onda visualizada; una traza no acredita un defecto del componente.'},
   {question:'¿Qué prueba discriminante corresponde sobre una fuente virtual segura?',
    options:['Comprobar sonda, referencia, escala de tiempo y disparo con una señal conocida','Incrementar energía física del vehículo','Interpretar ausencia sin calibrar escala'],
    answer:0,feedback:'Una referencia conocida y configuración adecuada separan fallas del instrumento de la señal de origen.'},
   {question:'¿Qué observación refuta ausencia permanente de pulsos en la fuente?',
    options:['El instrumento sigue conectado','Con base de tiempo y disparo corregidos aparecen pulsos repetibles','La pantalla del osciloscopio cambia de brillo'],
    answer:1,feedback:'La aparición de pulsos tras corregir la medición exige abandonar la atribución de señal inexistente.'})),
 freezeCase('can','CAN sin comunicación: alimentación, red o ECU',
  'Un nodo virtual no responde a solicitudes, pero otras ECUs sí se comunican. Se sospecha un problema físico de bus, alimentación del nodo o un defecto del propio controlador.',
  steps(
   {question:'¿Qué inferencia permite la falta de respuesta de un nodo?',
    options:['No distingue todavía alimentación, red local, gateway o estado del nodo','Demuestra falta de terminación en todos los casos','La ECU está dañada sin otras posibilidades'],
    answer:0,feedback:'La ausencia de respuesta puede tener varias causas y requiere separar capa física, alimentación y comportamiento del nodo.'},
   {question:'¿Qué comprobaciones pasivas y seguras discriminan esas alternativas?',
    options:['Transmitir mensajes de control en un vehículo real','Comparar alimentación/masa del nodo y observables físicos de comunicación en un banco aislado','Desconectar componentes HV energizados'],
    answer:1,feedback:'Verificar condiciones de alimentación y observabilidad de red en un entorno aislado separa hipótesis sin emitir comandos a vehículos.'},
   {question:'¿Qué debilita la hipótesis de una red global completamente caída?',
    options:['Un reloj sin sincronizar','Una etiqueta CAN en el manual','Comunicación válida entre otros nodos a la vez que solo uno no responde'],
    answer:2,feedback:'El funcionamiento de otros nodos refuta una caída global universal, aunque no descarta una falla local de red.'})),
 freezeCase('bms','SOC: estimar no es medir directamente',
  'Dos baterías virtuales ofrecen un mismo voltaje en una lectura instantánea, pero difieren en temperatura, historial de corriente y capacidad disponible.',
  steps(
   {question:'¿Podés inferir que tienen necesariamente igual SOC?',
    options:['Sí, el voltaje fija un SOC absoluto','No: el voltaje aislado puede ser insuficiente','Sí, especialmente bajo cualquier carga'],
    answer:1,feedback:'Química, relajación, temperatura, histéresis y corriente pueden afectar la relación entre voltaje y SOC.'},
   {question:'¿Qué evidencia mejora una estimación SOC en un modelo declarado?',
    options:['Historial integrado de corriente, capacidad de referencia, temperatura y observaciones bajo condiciones conocidas','Solo el color de celda','Una medición de voltaje sin contexto'],
    answer:0,feedback:'Los estimadores necesitan observables complementarios y calibraciones adecuadas al modelo de batería.'},
   {question:'¿Qué evidencia refuta que voltajes iguales implican capacidades utilizables idénticas?',
    options:['El mismo color de batería','Un código de parte coincidente','Ensayos sintéticos de capacidad controlados muestran diferente carga disponible'],
    answer:2,feedback:'Capacidad y SOC son magnitudes distintas; voltajes similares no prueban salud ni carga utilizable idénticas.'})),

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
    answer:2,feedback:'Las restricciones son duras en este modelo; una violación falsifica la hipótesis de robustez global.'})),
 freezeCase('mc01-measurement-uncertainty','MC01: precisión no equivale a exactitud',
  'Un multímetro virtual repite cinco veces un valor muy parecido. Se desconoce la desviación común de su escala frente a una referencia independiente.',
  steps(
   {question:'¿Qué podés inferir de las lecturas muy similares?',
    options:['Hay buena repetibilidad, pero no está acreditada la exactitud','La calibración de fábrica es perfecta','No existen errores sistemáticos'],
    answer:0,feedback:'Baja dispersión indica repetibilidad; el sesgo compartido entre mediciones no desaparece.'},
   {question:'¿Qué prueba discrimina precisión de un sesgo común?',
    options:['Repetir el mismo instrumento cien veces','Comparar con referencia independiente de incertidumbre conocida','Redondear todas las lecturas a entero'],
    answer:1,feedback:'Una referencia externa permite observar error sistemático que las repeticiones del mismo equipo ocultan.'},
   {question:'¿Qué observación refuta que menor dispersión garantiza exactitud?',
    options:['Lecturas consecutivas que coinciden','Cambiar el color de los datos','Un error constante frente a referencia externa aunque todas las medidas coincidan'],
    answer:2,feedback:'Un instrumento puede repetir sistemáticamente una medida sesgada.'})),
 freezeCase('mc08-brakes-abs','MC08: energía de frenado y velocidad',
  'Un modelo ideal de 1000 kg se mueve a 10 m/s. Sin cambiar la masa, se analiza qué ocurre al duplicar a 20 m/s.',
  steps(
   {question:'¿Cómo cambia la energía cinética modelada al duplicar velocidad?',
    options:['Se duplica','Se cuadruplica','Permanece igual'],answer:1,
    feedback:'E=½mv²: con masa constante, el doble de velocidad cuadruplica la energía.'},
   {question:'¿Qué comparación numérica prueba la hipótesis dentro del modelo?',
    options:['Calcular E en 10 m/s y 20 m/s a la misma masa','Comparar solo el color de frenos','Observar un valor de ABS sin condiciones'],
    answer:0,feedback:'Comparar 50 kJ y 200 kJ a la misma masa permite comprobar el factor cuatro.'},
   {question:'¿Qué evidencia contradice un modelo que predice E proporcional a velocidad para masa fija?',
    options:['Un ABS disponible','Otra captura sin velocidad','Un cálculo independiente muestra cuatro veces la energía al duplicarla'],
    answer:2,feedback:'La ley cuadrática refuta el escalamiento lineal supuesto, pero no calcula distancia real de frenado.'})),
 freezeCase('rw6-aperture-area-study','RW6: superficies iguales, aperturas distintas',
  'Un puerto circular y otro rectangular presentan idéntica área máxima, pero una máscara recta avanza hasta u=0,25 del recorrido ficticio.',
  steps(
   {question:'¿Alcanza igual área máxima para deducir igual área expuesta parcialmente?',
    options:['Sí, siempre','No; la forma del contorno puede cambiar el área expuesta','Sí, si el motor tiene dos bujías'],
    answer:1,feedback:'El área máxima común no determina la función área abierta frente a desplazamiento parcial.'},
   {question:'¿Qué contraste puede evaluar el modelo sin medir un motor real?',
    options:['Comparar fórmulas geométricas y cuadratura de franjas al refinar N','Inferir flujo másico OEM solo con área','Observar emisiones sin caudal ni presión'],
    answer:0,feedback:'Fórmula circular analítica y aproximación independiente por bandas contrastan el cálculo, no caudal.'},
   {question:'¿Qué hallazgo invalida que una cuadratura numérica esté convergiendo a la fórmula ideal?',
    options:['Un color diferente del gráfico','Mayor tamaño de pantalla','El error contra la fórmula analítica crece sistemáticamente al refinar bajo parámetros fijos'],
    answer:2,feedback:'Un resultado divergente exige revisar discretización, integración y supuestos del modelo.'})),
 freezeCase('rw8-robust-uncertainty','RW8: nominal viable no significa robusto',
  'Una ECU ficticia supera las cinco restricciones con índices nominales, pero cada índice tiene una banda determinista de perturbación.',
  steps(
   {question:'¿Qué afirma correctamente un resultado nominal admisible?',
    options:['La ECU es segura para un motor real','El perfil supera restricciones solo en el punto nominal','Supera cualquier perturbación adversa'],
    answer:1,feedback:'La factibilidad nominal no garantiza superar las restricciones en extremos desfavorables.'},
   {question:'¿Qué prueba virtual corresponde antes de afirmar robustez rectangular?',
    options:['Verificar el valor más desfavorable de cada índice frente a las cinco restricciones','Promediar resultados nominales','Seleccionar solo la alternativa de mayor respuesta'],
    answer:0,feedback:'La robustez de caja requiere todas las restricciones en sus extremos pertinentes.'},
   {question:'¿Qué falsifica la robustez frente a toda la caja rectangular?',
    options:['Un único extremo desfavorable que viole una restricción dura','Un perfil nominal con margen positivo','Un número de escenario grande'],
    answer:0,feedback:'Una restricción incumplida basta para rechazar factibilidad robusta bajo el modelo declarado.'}))

,
freezeCase('ground-test','Retorno eléctrico: dónde cae la tensión',
  'Una carga virtual de 12 V funciona de forma intermitente. El voltaje en reposo es normal, pero se sospecha un retorno resistivo bajo consumo.',
  steps(
   {question:'¿Qué informa una tensión nominal medida solo en reposo?',options:['Que todo retorno está bien','Que no caracteriza por sí sola las caídas cuando circula corriente','Que la carga nunca pierde potencia'],answer:1,feedback:'La resistencia serie provoca caída bajo corriente; el reposo no demuestra su estado.'},
   {question:'¿Qué contraste puede discriminar la caída del retorno sin cambiar componentes?',options:['Medir entre extremos del retorno bajo una carga de banco conocida','Cambiar todas las masas preventivamente','Observar el voltaje a circuito abierto otra vez'],answer:0,feedback:'La caída entre los extremos de un tramo bajo carga permite localizar resistencia en ese trayecto.'},
   {question:'¿Qué dato obliga a abandonar la hipótesis de retorno dominante?',options:['Un código sin contexto','Una etiqueta de batería diferente','Retorno con caída despreciable y caída importante en la línea positiva del mismo montaje'],answer:2,feedback:'Si otro segmento presenta la caída dominante, la atribución inicial al retorno pierde soporte.'})),
 freezeCase('sensor-reference','Referencia compartida y dos canales sesgados',
  'Dos sensores analógicos virtuales parecen desplazados a la vez, y ambos usan la misma referencia de baja tensión.',
  steps(
   {question:'¿La coincidencia de desvíos prueba que fallaron los dos sensores?',options:['Sí, dos componentes averiados siempre','No: una referencia común alterada también podría explicar ambos','Sí, incluso sin contrastar alimentación'],answer:1,feedback:'Un error de causa común puede sesgar múltiples señales; correlación no demuestra dos fallas independientes.'},
   {question:'¿Qué medida virtual separarías primero de cada salida?',options:['Reemplazar sensores','Medir solo el promedio de ambos','Comprobar la referencia y masa compartidas bajo condición reproducible'],answer:2,feedback:'Una referencia independiente comprueba si la causa común está fuera de sus límites declarados.'},
   {question:'¿Qué resultado debilita la hipótesis de fallo en referencia común?',options:['Referencia/masa normal verificadas y un canal individual fuera de plausibilidad','Dos canales desplazan su salida igual','Medición nueva con idéntico instrumento no comprobado'],answer:0,feedback:'Si la causa común está contrastada, es razonable investigar el canal individual desviado.'})),
 freezeCase('fuel-trims','Correcciones de combustible: patrón no es causa única',
  'En un motor ficticio las correcciones de combustible son positivas al ralentí y menores con carga. Los datos aún no identifican una pieza.',
  steps(
   {question:'¿Qué conclusión es válida a partir de ese patrón aislado?',options:['El MAF debe reemplazarse','Existen varias hipótesis: aire no medido, suministro o lectura; faltan pruebas','La ECU está averiada'],answer:1,feedback:'Las correcciones son reacción del sistema de control, no identificación directa del componente culpable.'},
   {question:'¿Qué secuencia conceptual discrimina alternativas?',options:['Borrar el DTC y cambiar piezas','Concluir a partir del ralentí','Cruzar congelación de contexto, plausibilidad de aire y combustible y pruebas independientes'],answer:2,feedback:'Contrastar condiciones y observables de distintas fuentes separa una lectura sesgada de un fenómeno real.'},
   {question:'¿Qué refuta concluir que el sensor de aire es la única causa?',options:['Una fuga de admisión virtual confirmada externamente con sensor que reacciona de forma plausible','Otra captura del mismo ajuste sin datos','Que el motor tiene más de una bujía'],answer:0,feedback:'Una entrada de aire no medida corroborada desplaza la sospecha de sensor como explicación exclusiva.'})),
 freezeCase('pwm-scope','PWM: promedio no describe toda la señal',
  'Dos modulaciones PWM de banco presentan igual voltaje promedio en un multímetro, aunque sus períodos y ciclos de trabajo son diferentes.',
  steps(
   {question:'¿Qué prueba la igualdad del promedio de tensión?',options:['El comportamiento dinámico es idéntico','El ancho de pulso y frecuencia son iguales','El promedio coincide, pero las formas temporales pueden diferir'],answer:2,feedback:'El promedio pierde información temporal; señales diferentes pueden tener igual tensión media.'},
   {question:'¿Qué evidencia distingue sus formas de onda?',options:['Medir el nivel DC solamente','Comparar período, ancho de pulso y disparo adecuado en osciloscopio virtual','Cambiar actuadores antes de medir'],answer:1,feedback:'La representación temporal permite discriminar frecuencia, ciclo útil, niveles y transiciones.'},
   {question:'¿Qué refuta que igual voltaje medio implica igual ciclo de trabajo para toda condición?',options:['Dos señales con igual promedio pero distinto par de niveles alto/bajo y distinto ciclo útil','Un voltímetro digital estable','Un PWM de amplitud constante y fija con igual promedio'],answer:0,feedback:'El promedio depende de niveles y ciclo; sin niveles fijados no determina un ciclo único.'})),
 freezeCase('ckp-cmp','Sincronización CKP/CMP: ausencia de señal o captura',
  'Un banco presenta arranque sin sincronización aparente. Una captura CKP muestra pulsos, pero la traza CMP permanece plana.',
  steps(
   {question:'¿Qué puede concluirse sobre CMP con una sola captura plana?',options:['No diferencia aún sensor, configuración del instrumento o condición del cableado','El sensor CMP está dañado con certeza','La ECU tiene que ser reemplazada'],answer:0,feedback:'Una línea plana aislada no separa falta de señal, modo de disparo, referencia ni condiciones de captura.'},
   {question:'¿Qué verificación conceptual permite contrastar sincronización?',options:['Desconectar todo sin documentación','Verificar referencia y disparo del canal y capturar CKP/CMP de manera correlacionada en banco aislado','Reemplazar la distribución inmediatamente'],answer:1,feedback:'La simultaneidad y una señal patrón de instrumento permiten diferenciar fase de ausencia aparente.'},
   {question:'¿Qué dato refutaría ausencia permanente de CMP en ese montaje?',options:['Un DTC sin forma de onda','Un valor promedio de CKP','Pulsos CMP estables detectados al corregir escala y disparo'],answer:2,feedback:'Aparecer pulsos al corregir la captura demuestra que la conclusión anterior estaba mal fundada.'}))

,
freezeCase('hv','Alta tensión: reconocer una frontera de competencia',
 'Un vehículo electrificado queda inmovilizado. Un estudiante conoce el diagrama, pero no dispone de acreditación ni de procedimiento OEM supervisado.',
 steps(
  {question:'¿Qué inferencia permite haber aprobado teoría de sistemas HV?',options:['Autoriza desconectar el pack','Confirma que ya puede intervenir en vivo','Comprensión conceptual, no aptitud para manipular tensión de tracción'],answer:2,feedback:'La aptitud para intervenir requiere procedimientos, competencias y equipamiento verificables, no solo lectura.'},
  {question:'¿Cuál es una actividad didáctica discriminante segura para estudiar la arquitectura?',options:['Comparar esquemas y trazas sintéticas en entorno desenergizado o virtual','Medir con cualquier multímetro el bus de tracción','Abrir un paquete HV para mirar módulos'],answer:0,feedback:'El entorno virtual permite razonar topologías sin exponer al estudiante a energía peligrosa.'},
  {question:'¿Qué hecho refutaría la afirmación de que un curso web habilita trabajo HV físico?',options:['Una nota excelente en teoría','Que la intervención exige habilitación, autorización y procedimientos supervisados independientes','El color naranja del cableado'],answer:1,feedback:'La competencia supervisada y el control de riesgos no se sustituyen con contenidos digitales.'})),
freezeCase('dtc-method','Diagnóstico causal: DTC frente a causa raíz',
 'Un monitor guarda un DTC de señal fuera de rango. El componente nombrado puede estar bien y el error originarse en una referencia compartida o conector.',
 steps(
  {question:'¿Qué demuestra el DTC por sí solo?',options:['Una condición detectada en las reglas del monitor','El sensor indicado es necesariamente la causa','La reparación concreta ya está seleccionada'],answer:0,feedback:'La condición disparadora no establece por sí sola causa raíz ni solución.'},
  {question:'¿Qué prueba separa referencia común de sensor individual?',options:['Borrar memoria y concluir','Cambiar el sensor por precaución','Contrastar referencia, retorno y salida con medición independiente bajo la misma condición'],answer:2,feedback:'Comparaciones independientes permiten detectar causas comunes sin reemplazos innecesarios.'},
  {question:'¿Qué evidencia invalida atribuir el fallo exclusivamente al sensor?',options:['El mismo DTC tras reiniciar','Referencia anómala documentada en varios canales y sensor plausible con referencia controlada','La descripción textual del DTC'],answer:1,feedback:'Una causa común corroborada cambia el diagnóstico hacia suministro o retorno.'})),
freezeCase('physical-can','CAN físico: una ECU silenciosa no es una red caída',
 'En un banco CAN simulado, una ECU no responde pero dos nodos intercambian tramas válidas. Se sospecha falta local de alimentación o rotura global del bus.',
 steps(
  {question:'¿Cuál es la hipótesis justificable?',options:['La terminación global ha fallado necesariamente','La ECU está rota con certeza','El silencio del nodo requiere separar energía local, enlace y estado del controlador'],answer:2,feedback:'Otras tramas activas debilitan una caída total de red, pero no excluyen un defecto local.'},
  {question:'¿Qué contraste seguro discrimina esas causas?',options:['Revisar alimentación de banco y captura pasiva del enlace al nodo','Inyectar comandos activos a un automóvil en circulación','Sustituir indiscriminadamente terminadores'],answer:0,feedback:'En un banco aislado las medidas locales de tensión y comunicación dan información independiente.'},
  {question:'¿Qué hallazgo refuta una caída completa del bus?',options:['Un conector desconectado sin verificar','Tramas válidas entre otros dos nodos simultáneamente','El número nominal de terminadores'],answer:1,feedback:'Una comunicación observada refuta la ausencia total de comunicación bajo la misma condición.'})),
freezeCase('uds-nrc','UDS NRC 0x78: procesamiento no es pérdida de enlace',
 'En una traza UDS ficticia aparece una respuesta negativa con NRC 0x78 tras una solicitud autorizada de solo lectura.',
 steps(
  {question:'¿Cuál es la interpretación mínima?',options:['La ECU informó que el procesamiento aún está pendiente','El cable CAN está cortado','La ECU rechazó permanentemente todo servicio'],answer:0,feedback:'ResponsePending distingue procesamiento aún en curso de pérdida de comunicación.'},
  {question:'¿Qué prueba documental diferencia espera válida de fallo de sesión?',options:['Intentar flashear la ECU real','Ignorar la solicitud anterior','Analizar la secuencia temporal de traza y respuesta final dentro del contrato del banco'],answer:2,feedback:'La secuencia y el plazo permiten entender la transacción sin realizar operaciones privilegiadas.'},
  {question:'¿Qué hallazgo invalida concluir pérdida total de comunicación a partir de NRC 0x78?',options:['Que cambió un reloj','Una respuesta final válida de la misma transacción en la traza sintética','No conocer el hardware OEM'],answer:1,feedback:'Una respuesta final correlacionada acredita continuidad de diálogo en el escenario.'})),
freezeCase('bms-calibration','SOC: deriva de integración por sesgo de corriente',
 'Un contador de Coulomb sintético integra una corriente medida que presenta un offset +0,2 A respecto de referencia durante 10 h. No hay mediciones de celda real.',
 steps(
  {question:'¿Qué puede provocar un offset constante de sensor?',options:['Una deriva acumulada de carga estimada aun con estado físico estable','SOH idéntico al SOC','La capacidad real de cualquier paquete queda determinada'],answer:0,feedback:'El sesgo se integra con el tiempo y puede mover la estimación sin que exista carga física equivalente.'},
  {question:'¿Qué verificación separa deriva del estimador de un cambio de carga real?',options:['Concluir por la tensión instantánea','Cambiar celdas reales','Comparar corriente contra referencia independiente y calcular el error integrado en el modelo'],answer:2,feedback:'Corriente con referencia y un intervalo conocido permiten estimar el sesgo matemático.'},
  {question:'¿Qué dato refutaría la idea de que el offset +0,2 A no tiene efecto integrado?',options:['Una etiqueta de batería','La integración de 0,2 A por 10 h produce 2 Ah de error acumulado en el contador','La pantalla muestra un número de SOC'],answer:1,feedback:'El resultado 2 Ah es una deducción de integración del modelo, no una medida de capacidad o salud física.'})),
freezeCase('hv-safety','Arquitectura HEV/EV y límites seguros de aprendizaje',
 'Un alumno identifica en un esquema BMS, inversor, DC/DC y batería de tracción, pero carece de práctica supervisada y autorización del fabricante.',
 steps(
  {question:'¿Qué acredita reconocer estos bloques en un diagrama?',options:['Dominio de arquitectura conceptual, no habilitación física HV','Autorización para verificar ausencia de tensión en cualquier pack','Aislamiento comprobado en el automóvil real'],answer:0,feedback:'El esquema describe funciones; el control de energía peligrosa requiere procedimientos específicos.'},
  {question:'¿Qué actividad permite contrastar rutas de energía sin intervención real?',options:['Desconectar conectores HV','Usar esquemas, variables y simulaciones desenergizadas de transferencia energética','Bypass de interlocks para diagnosticar'],answer:1,feedback:'Las herramientas virtuales evitan exposición a tensión de tracción y distinguen arquitectura de habilitación.'},
  {question:'¿Qué hecho refuta que un aprobado de teoría implica aptitud para un trabajo real?',options:['La existencia de un motor eléctrico','Que el diagrama sea nítido','Ausencia de acreditación, autorización o entrenamiento procedimental para la tarea HV'],answer:2,feedback:'Las barreras de seguridad y capacitación son independientes de la evaluación digital.'})),
freezeCase('ecu-feed','Reinicio ECU: batería correcta no garantiza alimentación local',
 'En un banco sintético la batería permanece en 12,4 V, pero la ECU indica reinicios intermitentes bajo demanda y un relé o retorno podría añadir resistencia.',
 steps(
  {question:'¿Qué conclusión es legítima con solo tensión de batería estable?',options:['La ECU está dañada','No se conoce aún la tensión real en pines de la ECU bajo carga','Todos los relés funcionan correctamente'],answer:1,feedback:'La tensión de fuente no describe caídas en alimentación o retorno bajo carga.'},
  {question:'¿Qué prueba discrimina batería frente a caída local de alimentación?',options:['Registrar simultáneamente tensión en batería y pines de la ECU del banco durante el reinicio','Reemplazar ECU sin medir','Medir batería solamente en reposo'],answer:0,feedback:'Las dos mediciones bajo la misma condición temporal localizan dónde cambia el potencial.'},
  {question:'¿Qué hallazgo refuta la hipótesis de batería descargada como única causa?',options:['La batería tiene etiqueta nominal','El relé tiene un código impreso','Batería estable y caída transitoria localizada entre salida de relé y ECU durante el evento'],answer:2,feedback:'La caída local demostrada desplaza la explicación principal del origen de energía al circuito de entrega.'})),
freezeCase('pullups','Entrada pull-up: alto no distingue abierto de interrupción',
 'En un circuito digital sintético un contacto normalmente lleva a masa un nodo con resistencia pull-up; la lectura del pin permanece alta.',
 steps(
  {question:'¿Qué significa observar solo el nivel alto?',options:['El conductor está interrumpido con certeza','El contacto está cerrado con certeza','Puede ser contacto abierto normal o interrupción; faltan condiciones contrastadas'],answer:2,feedback:'Una entrada con pull-up está alta cuando no dispone de ruta a masa, sea esperado o por falla.'},
  {question:'¿Qué prueba discrimina esas posibilidades en un banco protegido?',options:['Verificar estado del contacto y continuidad del cable por separado con fuente controlada','Aplicar tensión externa a un pin ECU desconocido','Sustituir controlador por leer alto'],answer:0,feedback:'La condición de contacto conocida y ruta medida permiten separar apertura normal de cable cortado.'},
  {question:'¿Qué hallazgo contradice que un nivel alto equivale necesariamente a contacto abierto sano?',options:['El pin tiene nombre digital','Con contacto cerrado confirmado, una interrupción aislada conserva nivel alto','La resistencia pull-up existe'],answer:1,feedback:'Un circuito abierto accidental produce la misma lectura; observar contacto y cable discrimina.'}))
,
freezeCase('voltage-dividers','Divisor resistivo: salida ideal no garantiza lectura bajo carga',
 'Una fuente virtual de 5 V alimenta un divisor formado por R1=10 kΩ y R2=10 kΩ. La salida sin carga debería ser 2,5 V, pero una entrada conectada podría cargar el nodo.',
 steps(
  {question:'¿Qué predice el modelo sin carga y con componentes ideales?',options:['5 V en la salida','2,5 V en la salida','0 V en todo caso'],answer:1,feedback:'El divisor ideal entrega 5 × 10/(10+10) = 2,5 V medidos respecto del retorno común.'},
  {question:'¿Qué contraste separa carga externa de defecto de la fuente?',options:['Comparar salida del divisor con y sin carga manteniendo entrada y retorno conocidos','Reemplazar la ECU real','Ignorar la impedancia de entrada del instrumento'],answer:0,feedback:'Una impedancia de carga puede modificar la resistencia equivalente de la rama inferior y reducir Vout.'},
  {question:'¿Qué resultado invalida atribuir la caída solo a la fuente de 5 V?',options:['La fuente tiene etiqueta nominal','Solo una medición sin carga','Fuente estable a 5 V, pero salida cambia al conectar una carga conocida'],answer:2,feedback:'La modificación bajo carga con fuente constante demuestra sensibilidad del divisor al circuito conectado.'})),
freezeCase('rc-input','Filtro RC: tiempo de respuesta y muestras no equivalen',
 'Un banco aislado presenta una entrada RC ideal de 1 kΩ y 100 µF inicialmente descargada. Una señal de escalón de 5 V tarda en aproximarse al valor final.',
 steps(
  {question:'¿Cuál es la constante de tiempo ideal de esa combinación?',options:['0,1 s','100 s','0,001 s'],answer:0,feedback:'La constante τ = R×C = 1000 Ω × 100·10⁻⁶ F = 0,1 s, asumiendo modelo ideal.'},
  {question:'¿Qué prueba discrimina retardo del filtro frente a error de escala del osciloscopio?',options:['Concluir que el sensor no responde','Comparar escalón de entrada y curva de salida con base de tiempos validada','Desconectar protecciones del circuito real'],answer:1,feedback:'Una captura correlacionada, con tiempo de referencia conocido, comprueba la evolución del nodo en el modelo.'},
  {question:'¿Qué observación contradice que el RC ideal sea la única causa del retardo?',options:['La etiqueta de un capacitor','Una sola salida sin traza de entrada','Salida retardada sin constante RC correspondiente después de medir componentes y señal de entrada'],answer:2,feedback:'La discrepancia reproducible con τ calculada exige investigar carga, protecciones u otras dinámicas no modeladas.'})),
freezeCase('actuator-power','Actuador: forma de mando PWM no demuestra trabajo de carga',
 'En un banco didáctico de baja tensión la ECU virtual entrega PWM correcto, pero un actuador no responde. La carga podría no tener alimentación ni corriente.',
 steps(
  {question:'¿Qué prueba por sí misma una salida PWM visible?',options:['Que el driver presenta una señal de mando, no corriente ni movimiento comprobados','Que el actuador entregó torque real','Que el circuito de retorno es perfecto'],answer:0,feedback:'Una forma de onda de mando no acredita energía efectiva transferida ni acción mecánica.'},
  {question:'¿Qué observaciones independientes discriminan circuito abierto de carga trabada?',options:['Cambiar actuador sin probar','Correlacionar mando, alimentación en la carga y corriente de banco durante el pulso','Confiar exclusivamente en la frecuencia PWM'],answer:1,feedback:'Corriente y tensión simultáneas separan orden de mando, continuidad eléctrica y trabajo físico.'},
  {question:'¿Qué hallazgo invalida la hipótesis de carga alimentada correctamente?',options:['Frecuencia nominal correcta','DTC sin condiciones','Mando presente y cero voltios medidos sobre la carga durante la orden'],answer:2,feedback:'Sin diferencia de potencial disponible en la carga, el PWM de comando no demuestra excitación eléctrica adecuada.'}))
,
freezeCase('sensor-plausibility','Plausibilidad MAP/TPS/ECT: contexto antes de declarar sensor fallado',
 'En un motor virtual, la lectura de temperatura queda fija y no coincide con ambiente después de una noche apagado. El monitor aún no discrimina sensor, cable ni valor sustitutivo.',
 steps(
  {question:'¿Qué hipótesis justifica una lectura fija aislada?',options:['Sensor defectuoso con certeza','La temperatura física cambió sin intervención','Podría existir sustitución de ECU, error de señal o referencia; faltan controles'],answer:2,feedback:'Una lectura incongruente es síntoma del sistema de observación y puede proceder de distintas rutas.'},
  {question:'¿Qué comparación causal usarías?',options:['Correlacionar temperatura ambiente y de motor, tensión de sensor y parámetros simultáneos en el banco','Cambiar TPS y ECT por precaución','Borrar datos y dar por reparado'],answer:0,feedback:'Contrastar medida física independiente, circuito y valor diagnóstico separa las causas posibles.'},
  {question:'¿Qué hallazgo refuta que el motor está realmente a la temperatura fija indicada?',options:['DTC pendiente','Referencia física controlada y sensor medido mostrando valor distinto al parámetro sustitutivo','Una captura adicional sin condiciones'],answer:1,feedback:'La divergencia entre lectura física y valor de sustitución cuestiona inferir estado termodinámico desde el parámetro reportado.'})),
freezeCase('dcdc-lv','HEV/EV DC/DC: caída de auxiliar no identifica falla de tracción',
 'En un banco virtual de arquitectura híbrida, una carga auxiliar de baja tensión se reinicia. Se desconoce tensión en el punto de carga frente a la salida del convertidor DC/DC.',
 steps(
  {question:'¿Qué evidencia aporta por sí sola el reinicio de la carga auxiliar?',options:['Deterioro confirmado de celdas HV','Una condición de alimentación LV no localizada','Avería comprobada del inversor de tracción'],answer:1,feedback:'El comportamiento del lado auxiliar no identifica por sí solo qué segmento entregó voltaje insuficiente.'},
  {question:'¿Qué contraste permitido discrimina fuente de distribución LV?',options:['Comparar en banco simulado tensión de salida DC/DC y tensión en la carga bajo igual demanda','Abrir batería HV para medir celdas','Alterar interlocks físicos'],answer:0,feedback:'La comparación simultánea permite distinguir caída en la fuente auxiliar de caída en cableado/retorno local.'},
  {question:'¿Qué refutaría que el convertidor DC/DC fue el origen de la caída?',options:['Un número de parte del convertidor','Un DTC genérico','Salida DC/DC virtual estable y gran caída localizada en el retorno de la carga LV'],answer:2,feedback:'La medición evidencia que la anomalía aparece aguas abajo de la salida, no necesariamente en el convertidor.'})),
freezeCase('current-shunt','Shunt: medir milivoltios requiere resistencia conocida',
 'Un ensayo de baja tensión aislado usa una resistencia de 10 mΩ nominal para medir corriente. El multímetro observa 50 mV diferenciales, pero no se ha validado tolerancia ni calentamiento.',
 steps(
  {question:'¿Cuál es la estimación ideal si R realmente vale 0,010 Ω?',options:['50 A','0,5 A','5 A'],answer:2,feedback:'Por ley de Ohm I=0,050 V / 0,010 Ω = 5 A dentro del modelo ideal.'},
  {question:'¿Qué contrastarías antes de reportar corriente real confiable?',options:['Resistencia efectiva del shunt, conexión diferencial y temperatura en banco protegido','Usar la lectura de un solo terminal a tierra desconocida','Ignorar calibración porque la tensión es pequeña'],answer:0,feedback:'El sensor resistivo introduce carga y un cambio térmico altera la relación V/I.'},
  {question:'¿Qué hecho falsaría que la corriente real es exactamente 5 A?',options:['Un shunt etiquetado 10 mΩ','Medición independiente de R efectiva 0,0125 Ω bajo ensayo y 50 mV presentes','Una lectura de 50 mV sin instrumento contrastado'],answer:1,feedback:'Si R real es 12,5 mΩ, la misma caída corresponde idealmente a 4 A, no 5 A.'}))
,
 freezeCase('scope-reference','Referencias de medida: punto de masa no es neutro universal',
  'En un banco aislado de baja tensión, dos canales comparten un punto de referencia. Una onda parece desplazada cuando se compara contra otra masa con caída de tensión.',
  steps(
   {question:'¿Qué permite inferir el cambio de nivel entre dos referencias?',options:['Podría ser offset de referencia y no defecto del sensor','El sensor necesariamente entrega una señal falsa','La ECU perdió memoria'],answer:0,feedback:'El potencial es siempre relativo a un punto de referencia; dos masas bajo carga pueden tener diferencias medibles.'},
   {question:'¿Qué prueba ayuda a separar señal real de error de referencia en un banco seguro?',options:['Poner la pinza a tierra en cualquier conductor','Repetir la señal sin registrar condiciones','Comparar puntos de referencia con instrumento diferencial apropiado y condiciones de carga estables'],answer:2,feedback:'Una medición diferencial controlada identifica diferencias de potencial sin crear cortocircuitos con tierras externas.'},
   {question:'¿Qué refuta que el nivel aparente provenga del sensor?',options:['El sensor figura en el manual','Desaparece el desplazamiento al usar referencia correcta mientras la señal relativa al sensor no cambia','El canal se visualiza con color distinto'],answer:1,feedback:'La dependencia de una referencia equivocada desacredita inferir un fallo en la salida del transductor.'})),
 freezeCase('actuator-current','Mando de actuador: tensión PWM no verifica corriente ni fuerza',
  'Un driver virtual emite PWM de mando correcto pero la carga no actúa. Puede existir interrupción, falta de suministro o atasco mecánico modelado.',
  steps(
   {question:'¿Qué demuestra PWM correctamente capturado en la salida lógica?',options:['Movimiento de carga confirmado','Solamente señal de mando, no energía entregada ni trabajo mecánico','Integridad de cualquier fusible'],answer:1,feedback:'Una forma de onda en el controlador no asegura flujo de corriente por un actuador ni movimiento.'},
   {question:'¿Qué par de observables discrimina falta de alimentación y carga mecánica?',options:['Registrar tensión en bornes de carga y corriente de banco simultáneamente a la orden','Cambiar el módulo por sospecha','Solo leer la frecuencia de PWM'],answer:0,feedback:'Cruzar diferencia de potencial con corriente y demanda aporta información distinta al comando.'},
   {question:'¿Qué hallazgo contradice que la carga está correctamente excitada?',options:['La orden mantiene período fijo','El nombre del actuador coincide con el DTC','Cero tensión sobre la carga y corriente cero mientras el PWM lógico continúa'],answer:2,feedback:'No hay energía en la carga: el dato lógica PWM no basta para demostrar excitación eléctrica.'})),
 freezeCase('can-isolation','Nodo CAN silencioso: distinguir red parcialmente activa de falla local',
  'En una red virtual, varios nodos envían tramas válidas y un tercero permanece silencioso. Se dispone de ensayo pasivo y alimentación controlada.',
  steps(
   {question:'¿Qué explicación mantiene abierta el tráfico de otros módulos?',options:['La red entera está inutilizable','Puede existir una condición local del módulo o su interfaz','Toda la terminación está necesariamente abierta'],answer:1,feedback:'Tráfico de otros nodos demuestra actividad parcial y descarta afirmar colapso completo sin más pruebas.'},
   {question:'¿Qué contraste es más discriminante y seguro para el banco?',options:['Verificar alimentación local, habilitación y observación pasiva de tramas sin inyectar mensajes','Enviar tramas arbitrarias a una red de vehículo real','Reemplazar el gateway antes de medir'],answer:0,feedback:'Los controles locales y captura pasiva separan alimentación, habilitación y transceptor.'},
   {question:'¿Qué observación refuta una pérdida global de comunicación CAN?',options:['DTC histórico sin marca temporal','Un cable está rotulado CAN-H','Dos nodos continúan intercambiando tramas válidas en el instante estudiado'],answer:2,feedback:'La actividad contemporánea refuta que toda la red haya dejado de transmitir.'})),
 freezeCase('uds-session','UDS: una respuesta negativa no certifica sensor roto',
  'Un cliente de diagnóstico autorizado pide un identificador DID. La ECU virtual responde con mensaje negativo por rango o contexto de sesión.',
  steps(
   {question:'¿Qué se puede concluir de una negativa UDS a un DID?',options:['Es fallo físico confirmado del sensor','Se debe forzar una sesión privilegiada','La petición no se atiende en ese contexto; faltan DID, versión, sesión y autorización'],answer:2,feedback:'La respuesta describe condiciones de protocolo y soporte, no una avería física sin observación independiente.'},
   {question:'¿Qué comprobación legítima discrimina contexto de protocolo de falla de sensor?',options:['Revisar documentación de DID permitidos, sesión y mensaje completo en un simulador autorizado','Probar claves desconocidas o eludir accesos','Reemplazar el sensor de inmediato'],answer:0,feedback:'Identificar soporte y contexto evita confundir rechazo de servicio con un dato físico incorrecto.'},
   {question:'¿Qué refuta que la negativa implique daño físico del sensor?',options:['Se muestra 0x7F en la traza','El mismo sensor opera según un observable independiente mientras ese DID es no compatible en la sesión','El programa de PC tiene una versión nueva'],answer:1,feedback:'La capacidad de lectura está separada de la salud del componente: un DID no soportado no acredita su fallo.'}))
,
 freezeCase('mosfet-control','MOSFET low-side: umbral de puerta no prueba baja pérdida',
  'En un modelo LV, el gate recibe un nivel suficiente para iniciar conducción, pero el actuador se alimenta débilmente. No se han medido VDS ni corriente de carga.',
  steps(
   {question:'¿Qué demuestra por sí sola una tensión de puerta cercana a VGS(th)?',
    options:['Conducción plena y RDS(on) mínima garantizada','Solo proximidad al umbral bajo condiciones de referencia; no certifica conducción plena','Cortocircuito del MOSFET comprobado'],answer:1,
    feedback:'El umbral no equivale a las condiciones de RDS(on) publicadas para una puerta plenamente excitada.'},
   {question:'¿Qué par de observables ayuda a discriminar mando insuficiente y trayecto de potencia resistivo?',
    options:['Número de parte sin condición térmica','Temperatura ambiente únicamente','VGS y caída VDS durante demanda junto a corriente LV del banco'],answer:2,
    feedback:'La caída durante conducción y el nivel real de excitación deben interpretarse simultáneamente con la corriente.'},
   {question:'¿Qué refutaría adjudicar la pérdida exclusivamente a excitación insuficiente?',
    options:['Gate excitado según especificación de banco pero VDS bajo carga anormalmente alta y corriente medida','Una traza PWM de comando aislada','La etiqueta nominal del driver'],answer:0,
    feedback:'Excitación contrastada desplaza la investigación a trayecto de potencia, RDS efectiva y límites de modelo.'})),
 freezeCase('inductive-load','Solenoide: la energía almacenada exige camino de descarga',
  'En un banco de simulación ideal una bobina transporta corriente. El controlador detiene el mando; se desconoce el camino permitido para la energía magnética.',
  steps(
   {question:'¿Qué permite afirmar E=½LI² sobre el apagado?',
    options:['La máxima sobretensión real queda determinada','La desmagnetización siempre es instantánea','Calcula energía ideal almacenada, pero no el pico de tensión ni el tiempo de descarga'],answer:2,
    feedback:'El pico y la duración dependen del circuito de descarga, protección, pérdidas y condiciones de conmutación.'},
   {question:'¿Qué contraste de simulación ayuda a discriminar rutas de desmagnetización?',
    options:['Comparar forma de onda I(t) y tensión de bobina bajo dos clamps idealizados con los mismos L e I iniciales','Desconectar una bobina real sin protección','Suponer que toda topología flyback da igual caída'],answer:0,
    feedback:'Con energía inicial y carga iguales, cambiar solo el circuito de protección permite atribuir una diferencia dinámica.'},
   {question:'¿Qué refutaría que ambos clamps poseen idéntica dinámica?',
    options:['Los dos comparten número de parte nominal','Tiempos de caída y formas de onda distintos bajo idénticas condiciones iniciales del modelo','Ambos almacenan energía inicial'],answer:1,
    feedback:'La observación controlada de trayectorias diferentes falsaría equivalencia de dinámica de apagado.'})),
 freezeCase('ground-reference-network','Masa de ECU: igual positivo no significa igual voltaje útil',
  'Dos módulos ficticios comparten batería de 12 V; uno cambia su referencia local cuando otra carga toma corriente por un retorno resistivo.',
  steps(
   {question:'¿Qué inferencia admite que el positivo de ambos módulos sea 12 V respecto a batería?',
    options:['Que la tensión útil local debe ser idéntica','Que el retorno no transporta corriente','No descarta desplazamiento de masa ni caída de alimentación efectiva en uno de los módulos'],answer:2,
    feedback:'Una fuente nominal igual no asegura el mismo potencial entre los bornes de cada módulo bajo demanda.'},
   {question:'¿Qué comparación causal separa retorno resistivo y defecto intrínseco del sensor?',
    options:['Sustituir todos los sensores del nodo','Correlacionar diferencia entre masas, corriente de retorno y señal local con referencia segura y definida','Cambiar arbitrariamente la masa de un osciloscopio conectado a red'],answer:1,
    feedback:'Un cambio correlacionado de I·R y referencia permite evaluar causa común sin confundir canales con piezas averiadas.'},
   {question:'¿Qué refutaría la hipótesis de que la masa es totalmente equipotencial?',
    options:['Caída reproducible I·R entre retornos que crece con carga en un banco controlado','Un DTC histórico sin datos temporales','Mismo nombre de señal en dos módulos'],answer:0,
    feedback:'Una diferencia de potencial bajo corriente contradice el supuesto de masa única ideal.'})),
 freezeCase('dcdc-switches','Buck LV: calcular duty no acredita regulación física',
  'Un buck virtual convierte 12 V en una salida auxiliar teórica. La aproximación Vout=D·Vin supone régimen continuo ideal; la carga nueva introduce un comportamiento diferente.',
  steps(
   {question:'¿Qué implica calcular 6 V para D=0,5 y Vin=12 V?',
    options:['Toda salida real será siempre 6 V','Es una predicción bajo hipótesis ideales, no garantía de regulación, rizado ni eficiencia','El convertidor puede trabajar sobre HV sin procedimientos'],answer:1,
    feedback:'El promedio ideal deja fuera conducción discontinua, pérdidas, límites de corriente y lazo de control.'},
   {question:'¿Qué prueba discriminante aporta información de regulación LV?',
    options:['Observar Vin, Vout, corriente de salida y rizado ante escalones de carga simulados, conservando duty y condiciones declaradas','Suponer que duty reemplaza una medición','Intervenir físicamente el paquete de tracción HV'],answer:0,
    feedback:'El cambio de carga controlado y variables simultáneas distinguen una ecuación ideal de una respuesta regulada.'},
   {question:'¿Qué observación refuta equiparar salida ideal con salida real bajo demanda?',
    options:['Etiquetar el convertidor como buck','El PWM conserva el mismo valor nominal','Vout cae o presenta rizado no modelado bajo carga mientras el duty permanece igual'],answer:2,
    feedback:'La desviación bajo demanda falsaría el modelo ideal completo para ese escenario, no atribuye una avería exacta.'}))

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
 // The prose is recorded but receives no score for character count.
  const reasoningDocumented=reasoning.trim().length>0;
 const limitsDocumented=limitations.trim().length>0;
 const score=Math.round(correct/3*100);
 return {model:REASONING_MODEL,lessonId,score,passed:correct===3&&reasoningDocumented&&limitsDocumented,
  correct,reasoningDocumented,limitsDocumented,
  stepResults:scenario.steps.map((step,i)=>({id:step.id,selected:answers[step.id],correct:answers[step.id]===step.answer,
    expected:step.answer,feedback:step.feedback})),
  qualitativeReview:'pending',warning:'Los puntos proceden solo de tres decisiones objetivas. El texto y sus límites deben estar registrados, pero no reciben puntos por longitud y esperan revisión humana. Aprobación = decisiones correctas con evidencia escrita presente, NO dominio profesional.'};
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
