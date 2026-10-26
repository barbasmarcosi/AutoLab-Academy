/** MC02–MC05 mechanical core, stage II; references are learning resources, not OEM specifications. */
export const mechanicsSystemsLessons=[
  {
    "id": "mc02-energy-path",
    "topic": "motor",
    "title": "MC02 — Cadena cinemática y flujo energético del vehículo",
    "minutes": 42,
    "url": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419",
    "sections": [
      [
        "Desde el motor hasta el neumático",
        "El par del eje motor atraviesa acoplamiento, relación de transmisión, diferencial, semiejes y ruedas antes de transformarse en esfuerzo tractivo. Los diseños eléctricos pueden prescindir de embrague convencional, pero no del control del flujo energético."
      ],
      [
        "Relaciones y eficiencia",
        "En el modelo ideal, la reducción i=n_entrada/n_salida multiplica el par en la salida según T_salida≈η·i·T_entrada, mientras reduce su velocidad de giro. La eficiencia η exige datos y depende de carga y lubricación, por lo que no debe fijarse sin evidencias."
      ],
      [
        "Diferencial y geometría de giro",
        "Al circular en una curva, las ruedas de un eje trazan distancias distintas. Un diferencial abierto permite distintas velocidades; la pérdida de tracción de una rueda puede limitar el par transmisible, pero no se soluciona por cambiar sensores al azar."
      ],
      [
        "Diagnóstico transversal",
        "Un tirón durante cambios puede provenir de mando, fluido, embrague o soporte. Antes de sustituir piezas, registrar régimen, carga, relación seleccionada, velocidad de rueda y respuesta en condiciones controladas."
      ]
    ]
  },
  {
    "id": "mc03-piston-cinematics",
    "topic": "motor",
    "title": "MC03 — Biela-manivela, distribución y compresión",
    "minutes": 47,
    "url": "https://www.educ.ar/recursos/50644/funcionamiento-del-motor",
    "sections": [
      [
        "Carrera y cilindrada geométrica",
        "La carrera de un motor con biela-manivela ordinaria es dos veces el radio de la manivela. La cilindrada geométrica de N cilindros idénticos es Vd=N·π·D²·S/4; no es masa de aire aspirada ni volumen de la cámara en PMS."
      ],
      [
        "Relación de compresión estática",
        "Para volumen de cilindrada Vd y volumen de cámara residual Vc, r=(Vd+Vc)/Vc. La presión medida durante una prueba depende también de distribución, fugas, giro de arranque, temperatura y procedimiento; una relación geométrica no es una lectura de compresómetro."
      ],
      [
        "Distribución y sincronización",
        "Admisión y escape se gobiernan con válvulas y tren de distribución. Los eventos reales pueden adelantar o retrasarse respecto de puntos muertos; la cinemática del pistón no permite inferir el cruce exacto sin especificaciones del árbol de levas."
      ],
      [
        "Criterio causal",
        "Una desviación de correlación CKP/CMP no prueba automáticamente cadena estirada: además de distribución, revisar referencias, circuitos, ruedas fónicas y método de captura. Intervenciones de sincronismo son potencialmente destructivas y requieren documentación OEM."
      ]
    ]
  },
  {
    "id": "mc04-diesel-commonrail",
    "topic": "motor",
    "title": "MC04 — Diésel: autoencendido, common rail y seguridad",
    "minutes": 48,
    "url": "https://training.gov.au/Training/Details/AURETR024",
    "sections": [
      [
        "Autoencendido por compresión",
        "En un diésel convencional el aire se comprime y el combustible se inyecta hacia el final de la compresión; la combustión se inicia por condiciones termodinámicas de la carga. No es correcto describirlo como Otto simplemente por tener cuatro carreras."
      ],
      [
        "Baja y alta presión",
        "En common rail, circuito de suministro, bomba de alta presión, riel, reguladores/sensores e inyectores interactúan. La presión del riel es una variable controlada por la ECU que no identifica por sí sola cuál componente falló."
      ],
      [
        "Peligros de intervención",
        "El combustible a elevada presión puede penetrar tejidos y provocar lesiones graves. No se aflojan conductos ni se busca una fuga con la mano; aislamiento, despresurización, protección y procedimientos específicos requieren formación y documentación del fabricante."
      ],
      [
        "Pruebas discriminantes",
        "Ante bajo desempeño, contrastar presión solicitada/real, suministro de baja, comando de actuadores, restricciones de admisión/escape y condiciones operativas. Un monitor genérico no reemplaza mediciones independientes, evidencia OEM ni pruebas seguras."
      ]
    ]
  },
  {
    "id": "mc05-cooling-lubrication",
    "topic": "motor",
    "title": "MC05 — Lubricación, refrigeración y fallas acopladas",
    "minutes": 50,
    "url": "https://www.law.cornell.edu/cfr/text/40/1065.122",
    "sections": [
      [
        "Camino del calor",
        "El motor transforma solo parte de la energía del combustible en potencia útil; el resto sale por escape, circuito de refrigeración y pérdidas. Para comparar ensayos, deben declararse temperaturas de aceite, refrigerante y admisión y régimen de carga."
      ],
      [
        "Aceite y película lubricante",
        "La presión de aceite refleja restricciones, caudal, viscosidad, velocidad de bomba y temperaturas. Presión en un punto no garantiza película adecuada en cada cojinete; la selección de viscosidad y especificación se rige por fabricante."
      ],
      [
        "Refrigeración y termostato",
        "Un termostato regula el camino del refrigerante y un ventilador modifica el flujo de aire. Temperatura aparente normal no descarta gradientes internos, cavitación, aire atrapado o errores de sensado. El circuito caliente puede estar presurizado: no abrirlo sin procedimiento seguro."
      ],
      [
        "Hipótesis competidoras",
        "Una temperatura alta junto con caída de presión de aceite puede deberse a carga, refrigeración, degradación del aceite o indicación eléctrica errónea. Registrar temperaturas en distintos puntos, señal de sensor, condiciones de carga y estado físico antes de atribuir causa."
      ]
    ]
  }
];
export const mechanicsSystemsQuestions=[
  {
    "id": "mc02-01",
    "topic": "motor",
    "question": "En un reductor ideal de relación 4:1 con eficiencia 100 %, la salida gira: ",
    "options": [
      "Cuatro veces más rápido",
      "A la misma velocidad",
      "Cuatro veces más lento",
      "Con el mismo par"
    ],
    "answer": 2,
    "explanation": "El reductor disminuye rpm y multiplica par idealmente por cuatro.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc02-02",
    "topic": "motor",
    "question": "¿Qué descripción del diferencial abierto es correcta?",
    "options": [
      "Bloquea siempre ambas ruedas",
      "Permite diferencias de velocidad en curva",
      "Aumenta potencia desde cero",
      "Solo trabaja con motor diésel"
    ],
    "answer": 1,
    "explanation": "Las ruedas recorren caminos distintos al doblar y deben poder diferenciar velocidades.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc02-03",
    "topic": "motor",
    "question": "Un tirón durante un cambio automático confirma: ",
    "options": [
      "Falla mecánica irreversible",
      "Sensor ABS defectuoso",
      "Baja compresión",
      "Ninguna causa sin pruebas adicionales"
    ],
    "answer": 3,
    "explanation": "El síntoma debe separarse en mando, hidráulica, embragues, soportes y condiciones de carga.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc02-04",
    "topic": "motor",
    "question": "Si un tren motriz entrega 80 N·m con reducción 3:1 y η=0,9, el par idealizado de salida es: ",
    "options": [
      "216 N·m",
      "240 N·m",
      "27 N·m",
      "72 N·m"
    ],
    "answer": 0,
    "explanation": "Tsal=Tin×i×η=80×3×0,9=216 N·m; no incluye neumático ni tracción.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc03-01",
    "topic": "motor",
    "question": "En un motor alternativo común, la carrera S respecto del radio de manivela r es: ",
    "options": [
      "S=r/2",
      "S=πr",
      "S=2r",
      "S=r²"
    ],
    "answer": 2,
    "explanation": "Los extremos del desplazamiento axial están separados por dos radios de manivela.",
    "source": "https://www.educ.ar/recursos/50644/funcionamiento-del-motor"
  },
  {
    "id": "mc03-02",
    "topic": "motor",
    "question": "¿Qué representa la fórmula r=(Vd+Vc)/Vc?",
    "options": [
      "Relación de compresión geométrica",
      "Presión en kPa",
      "Rendimiento volumétrico",
      "Potencia en kW"
    ],
    "answer": 0,
    "explanation": "Es la relación de volúmenes geométricos; no equivale a presión de arranque.",
    "source": "https://www.educ.ar/recursos/50644/funcionamiento-del-motor"
  },
  {
    "id": "mc03-03",
    "topic": "motor",
    "question": "Una relación de compresión alta determina por sí sola la lectura de compresómetro?",
    "options": [
      "Sí, siempre",
      "Solo con turbo",
      "Sí, si está frío",
      "No: influyen fugas, distribución, temperatura y giro"
    ],
    "answer": 3,
    "explanation": "Se necesita procedimiento de ensayo y especificación; la geometría no define una presión estática medida.",
    "source": "https://www.educ.ar/recursos/50644/funcionamiento-del-motor"
  },
  {
    "id": "mc03-04",
    "topic": "motor",
    "question": "Un patrón anómalo CKP/CMP indica de forma concluyente: ",
    "options": [
      "Que hay que reemplazar la cadena",
      "Que la mezcla es pobre",
      "Que hace falta verificar distribución, referencias y circuitos",
      "Que todos los sensores están sanos"
    ],
    "answer": 2,
    "explanation": "La correlación anómala puede tener origen mecánico o instrumental.",
    "source": "https://www.educ.ar/recursos/50645/la-distribucion"
  },
  {
    "id": "mc04-01",
    "topic": "motor",
    "question": "La combustión diésel convencional comienza principalmente por: ",
    "options": [
      "Chispa de bujía",
      "Autoencendido de combustible en aire caliente comprimido",
      "Inyección solo en escape",
      "Ignición mecánica del árbol de levas"
    ],
    "answer": 1,
    "explanation": "El combustible pulverizado entra a una carga comprimida caliente que permite autoencendido.",
    "source": "https://training.gov.au/Training/Details/AURETR024"
  },
  {
    "id": "mc04-02",
    "topic": "motor",
    "question": "Una presión de riel inferior a la solicitada permite concluir: ",
    "options": [
      "Bomba averiada de inmediato",
      "Inyector abierto siempre",
      "Sensor de temperatura siempre defectuoso",
      "Hay que discriminar suministro, control, fuga y medición"
    ],
    "answer": 3,
    "explanation": "Una variable fuera de objetivo no individualiza un componente sin pruebas adicionales.",
    "source": "https://training.gov.au/Training/Details/AURETR024"
  },
  {
    "id": "mc04-03",
    "topic": "motor",
    "question": "¿Qué acción es incorrecta en un circuito common rail de alta presión?",
    "options": [
      "Buscar fuga con la mano mientras está presurizado",
      "Consultar procedimiento OEM de despresurización",
      "Interrumpir el trabajo sin equipo adecuado",
      "Evaluar riesgos antes de intervenir"
    ],
    "answer": 0,
    "explanation": "La inyección de fluido a alta presión es una lesión grave; nunca probar fugas con la mano.",
    "source": "https://training.gov.au/Training/Details/AURETR024"
  },
  {
    "id": "mc04-04",
    "topic": "motor",
    "question": "Ante falla de encendido diésel y baja presión real, una secuencia de diagnóstico debe: ",
    "options": [
      "Sustituir todos los inyectores",
      "Eludir protecciones",
      "Registrar condiciones, comparar consignas y medir suministro seguro",
      "Aumentar presión sin instrumentación"
    ],
    "answer": 2,
    "explanation": "Es preferible contrastar subsistemas y variables controladas antes de intervenir.",
    "source": "https://training.gov.au/Training/Details/AURETR024"
  },
  {
    "id": "mc05-01",
    "topic": "motor",
    "question": "Una presión de aceite normal en un sensor: ",
    "options": [
      "Garantiza película en todos los cojinetes",
      "No demuestra lubricación adecuada en todos los puntos",
      "Prueba aceite nuevo",
      "Excluye fallas de temperatura"
    ],
    "answer": 1,
    "explanation": "Una señal local no caracteriza por sí sola caudal, holguras y película lubricante.",
    "source": "https://www.law.cornell.edu/cfr/text/40/1065.122"
  },
  {
    "id": "mc05-02",
    "topic": "motor",
    "question": "Comparar rendimiento de refrigeración entre ensayos requiere: ",
    "options": [
      "Solo comparar color de refrigerante",
      "Ignorar régimen",
      "Medir una temperatura sin carga",
      "Controlar carga, caudales y temperaturas relevantes"
    ],
    "answer": 3,
    "explanation": "Las temperaturas de operación y condiciones de prueba deben ser comparables.",
    "source": "https://www.law.cornell.edu/cfr/text/40/1065.122"
  },
  {
    "id": "mc05-03",
    "topic": "motor",
    "question": "¿Qué riesgo existe al abrir un circuito de refrigeración caliente?",
    "options": [
      "Expulsión de líquido y vapor presurizados",
      "Nada, si está apagado",
      "Solo perder la radio",
      "Aumentar la cilindrada"
    ],
    "answer": 0,
    "explanation": "El sistema caliente puede retener presión y energía térmica aunque el motor esté apagado.",
    "source": "https://www.law.cornell.edu/cfr/text/40/1065.122"
  },
  {
    "id": "mc05-04",
    "topic": "motor",
    "question": "Temperatura aparente alta y caída de presión de aceite: ",
    "options": [
      "Prueban termostato clavado",
      "Excluyen un sensor defectuoso",
      "Exigen contrastar variables térmicas, mecánicas y eléctricas",
      "Siempre se corrigen cambiando la viscosidad"
    ],
    "answer": 2,
    "explanation": "Una falla combinada requiere medir y descartar hipótesis con contexto de carga y estado instrumental.",
    "source": "https://www.law.cornell.edu/cfr/text/40/1065.122"
  }
];
