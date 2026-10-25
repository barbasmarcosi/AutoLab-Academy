// Lecciones y preguntas originales para enseñanza de componentes, no normas OEM.
export const componentLessons=[
  {
    "id": "voltage-dividers",
    "topic": "electricidad",
    "title": "Divisores resistivos y entradas analógicas",
    "minutes": 38,
    "sections": [
      [
        "Principio eléctrico",
        "Un divisor ideal reparte una tensión de referencia según la proporción entre las dos resistencias. La impedancia de la entrada puede modificar esa relación si no es suficientemente alta."
      ],
      [
        "Cómo interpretar evidencia",
        "Para interpretar una lectura, diferenciá Vref, resistencias, retorno, resistencia de entrada y el estado del nodo cuando una rama se abre."
      ],
      [
        "Límites y seguridad",
        "En una entrada OEM no se aplican fuentes de prueba improvisadas: los ejemplos son divisores de escritorio de baja tensión simulados."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "resistive-loss",
    "topic": "electricidad",
    "title": "Pérdidas resistivas y temperatura de conectores",
    "minutes": 37,
    "sections": [
      [
        "Principio eléctrico",
        "En el modelo resistivo la caída de un contacto depende de corriente y resistencia. La potencia I²R crece rápidamente si aumenta la corriente."
      ],
      [
        "Cómo interpretar evidencia",
        "Compará caída de cable o terminal en condiciones de carga definidas. Un medidor de continuidad sin corriente significativa puede ocultar el defecto."
      ],
      [
        "Límites y seguridad",
        "No uses conexiones improvisadas para provocar calentamiento: el laboratorio calcula pérdidas sin alimentar hardware."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "mosfet-control",
    "topic": "motor",
    "title": "Conmutación low-side: MOSFET, puerta y carga",
    "minutes": 42,
    "sections": [
      [
        "Principio eléctrico",
        "Un MOSFET puede conmutar una carga a masa mediante su puerta, pero VGS(th) no significa baja resistencia plena de conducción."
      ],
      [
        "Cómo interpretar evidencia",
        "Separá VGS, VDS y corriente de carga. Su relación en distintas condiciones permite discriminar mando, transistor y circuito de potencia."
      ],
      [
        "Límites y seguridad",
        "El modelo de la academia utiliza RDS equivalente resistivo fijo; no modela temperatura, carga de puerta ni transitorios."
      ]
    ],
    "url": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "inductive-load",
    "topic": "motor",
    "title": "Actuadores inductivos: energía y apagado controlado",
    "minutes": 42,
    "sections": [
      [
        "Principio eléctrico",
        "Bobinas de relés o solenoides almacenan energía proporcional a inductancia y al cuadrado de la corriente. Al desconectar requieren un camino de disipación diseñado."
      ],
      [
        "Cómo interpretar evidencia",
        "No confundas protección simple con estrategia universal: flyback, clamps y tiempos de desmagnetización modifican el comportamiento de cada actuador."
      ],
      [
        "Límites y seguridad",
        "No se ensaya desconexión de inductores físicos ni se anulan protecciones. Los cálculos se basan en una inductancia ideal."
      ]
    ],
    "url": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "current-shunt",
    "topic": "senales",
    "title": "Medición de corriente: shunt y diferencial",
    "minutes": 40,
    "sections": [
      [
        "Principio eléctrico",
        "Una resistencia shunt pequeña convierte corriente en diferencia de potencial. Su propia resistencia también altera el circuito y puede variar por temperatura."
      ],
      [
        "Cómo interpretar evidencia",
        "Para estimar corriente tenés que conocer el valor real del shunt y medir en forma diferencial entre sus extremos con un equipo apto."
      ],
      [
        "Límites y seguridad",
        "Nunca conectes la masa de un osciloscopio referido a tierra a nodos de potencial desconocido; aquí solo se simula."
      ]
    ],
    "url": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "rc-input",
    "topic": "senales",
    "title": "Filtro RC: constante de tiempo y respuesta a escalón",
    "minutes": 42,
    "sections": [
      [
        "Principio eléctrico",
        "La tensión de un capacitor inicialmente descargado aumenta exponencialmente ante un escalón de tensión en un circuito RC ideal."
      ],
      [
        "Cómo interpretar evidencia",
        "La constante de tiempo es R por C, y al cabo de una constante Vc alcanza aproximadamente el 63,2% del valor final ideal."
      ],
      [
        "Límites y seguridad",
        "La curva didáctica no describe entradas reales con protección, histéresis, impedancia adicional o tolerancias de fabricante."
      ]
    ],
    "url": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "transceiver-edges",
    "topic": "redes",
    "title": "Capas eléctricas CAN: transceptor y acondicionamiento",
    "minutes": 38,
    "sections": [
      [
        "Principio eléctrico",
        "El transceptor convierte niveles digitales del controlador en señales diferenciales. La forma de onda depende de topología, carga, terminación e interferencia."
      ],
      [
        "Cómo interpretar evidencia",
        "Separá información de bits, interpretación de DBC y observación analógica. Los efectos de cable, impedancia y rebotes no se resuelven por un archivo de mensajes."
      ],
      [
        "Límites y seguridad",
        "No experimentes conectando cargas o tramas en el vehículo real. El laboratorio CAN de AutoLab es de lectura y banco virtual."
      ]
    ],
    "url": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "ground-reference-network",
    "topic": "redes",
    "title": "Referencias compartidas, alimentación y nodos CAN",
    "minutes": 38,
    "sections": [
      [
        "Principio eléctrico",
        "Un módulo con comunicación intermitente puede perder su alimentación o referencia sin que el resto de la red se detenga."
      ],
      [
        "Cómo interpretar evidencia",
        "Correlacioná actividad pasiva, alimentación y retorno del nodo. Una sola lectura de resistencia H/L no explica todos los errores de comunicación."
      ],
      [
        "Límites y seguridad",
        "Las mediciones físicas deben realizarse según topología y procedimiento OEM; en la academia se usan datos sintéticos."
      ]
    ],
    "url": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "dcdc-switches",
    "topic": "ev",
    "title": "MOSFETs, conmutación y DC/DC: conceptos de potencia",
    "minutes": 43,
    "sections": [
      [
        "Principio eléctrico",
        "Los convertidores usan elementos de conmutación y almacenamiento de energía para trasladar potencia entre niveles de tensión."
      ],
      [
        "Cómo interpretar evidencia",
        "Comprender pérdidas de conducción no equivale a simular por completo un DC/DC: también intervienen magnetismo, control, térmica y protecciones."
      ],
      [
        "Límites y seguridad",
        "El aprendizaje en este módulo se restringe al lado de baja tensión y ecuaciones ideales. No incluye intervención de tracción HV."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "hv-boundaries",
    "topic": "ev",
    "title": "Semiconductores de potencia y límites de seguridad HV",
    "minutes": 43,
    "sections": [
      [
        "Principio eléctrico",
        "IGBT, MOSFET y otros dispositivos pueden intervenir en trenes de potencia, con tensiones y energías peligrosas incluso tras desconexión."
      ],
      [
        "Cómo interpretar evidencia",
        "Estudiá diagramas funcionales sin suponer que un software calcula aislamiento, ausencia de tensión o un procedimiento seguro de trabajo."
      ],
      [
        "Límites y seguridad",
        "Un examen digital no habilita mediciones en inversor o batería de tracción; se requiere capacitación especializada, equipos y protocolos."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
export const componentQuestions=[
  {
    "id": "comp-electricidad-1",
    "topic": "electricidad",
    "question": "Divisor ideal con 5 V, Rsuperior=3 kΩ y Rinferior=2 kΩ: tensión del nodo:",
    "options": [
      "2 V",
      "3 V",
      "5 V",
      "0 V"
    ],
    "answer": 0,
    "explanation": "La relación ideal es Vnodo=5×2/(3+2)=2 V siempre que la carga del nodo sea despreciable.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "comp-electricidad-2",
    "topic": "electricidad",
    "question": "Si se abre la resistencia inferior de un divisor conectado a 5 V por la superior, el nodo ideal tiende a:",
    "options": [
      "0 V",
      "2 V",
      "5 V",
      "12 V"
    ],
    "answer": 2,
    "explanation": "Con rama inferior abierta y entrada de muy alta impedancia, el nodo queda referenciado a los 5 V por la rama superior.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "comp-electricidad-3",
    "topic": "electricidad",
    "question": "Una conexión con 2 A y 0,5 Ω disipa aproximadamente:",
    "options": [
      "0,25 W",
      "1 W",
      "2 W",
      "4 W"
    ],
    "answer": 2,
    "explanation": "El contacto disipa P=I²×R=4×0,5=2 W bajo las condiciones resistivas supuestas.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "comp-electricidad-4",
    "topic": "electricidad",
    "question": "¿Por qué hay que medir una caída con corriente circulando?",
    "options": [
      "La caída depende de I por R y puede ser pequeña en reposo",
      "La continuidad anula la resistencia",
      "El cable cambia su longitud automáticamente",
      "Un multímetro solo lee AC"
    ],
    "answer": 0,
    "explanation": "Un cable resistivo puede mostrar continuidad sin carga y aun así causar una caída apreciable con demanda.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "comp-motor-1",
    "topic": "motor",
    "question": "¿Qué afirmación sobre VGS(th) de un MOSFET es correcta?",
    "options": [
      "Garantiza corriente nominal",
      "No garantiza conducción con RDS(on) baja",
      "Equivale a tensión de drenador",
      "Es la corriente de bobina"
    ],
    "answer": 1,
    "explanation": "El umbral de puerta indica un criterio de conducción parcial de ficha y no equivale a la condición de baja pérdida requerida.",
    "source": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "comp-motor-2",
    "topic": "motor",
    "question": "En un MOSFET ideal resistivo la potencia de conducción se aproxima por:",
    "options": [
      "I² × RDS",
      "VGS / frecuencia",
      "1/RDS sin corriente",
      "I/C"
    ],
    "answer": 0,
    "explanation": "La pérdida por conducción del modelo resistivo es P=I² RDS; conmutación y temperatura pueden añadir pérdidas.",
    "source": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "comp-motor-3",
    "topic": "motor",
    "question": "Si corriente de una bobina ideal se duplica con L constante, la energía:",
    "options": [
      "Se duplica",
      "No cambia",
      "Se cuadruplica",
      "Disminuye a la mitad"
    ],
    "answer": 2,
    "explanation": "E=0,5×L×I²; por depender del cuadrado de I, duplicar corriente multiplica energía por cuatro.",
    "source": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "comp-motor-4",
    "topic": "motor",
    "question": "Al desactivar una carga inductiva, ¿qué afirmación es apropiada?",
    "options": [
      "La energía desaparece instantáneamente",
      "Debe existir una estrategia de disipación y protección",
      "Siempre se debe quitar el diodo",
      "La bobina se vuelve resistiva pura"
    ],
    "answer": 1,
    "explanation": "La energía almacenada necesita un camino de disipación. La protección adecuada depende del circuito y fabricante.",
    "source": "https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html"
  },
  {
    "id": "comp-senales-1",
    "topic": "senales",
    "question": "Un shunt de 0,1 Ω con 2 A genera una diferencia ideal de:",
    "options": [
      "20 V",
      "0,2 V",
      "2 V",
      "0,02 V"
    ],
    "answer": 1,
    "explanation": "La caída ideal es V=I R=2×0,1=0,2 V, asumiendo resistencia conocida y sin efectos de temperatura.",
    "source": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "comp-senales-2",
    "topic": "senales",
    "question": "¿Por qué una medición shunt debe interpretarse diferencialmente?",
    "options": [
      "Porque observa diferencia entre extremos",
      "Porque reemplaza el osciloscopio",
      "Porque mide el SOH",
      "Porque siempre debe medirse con masa del equipo en cualquier nodo"
    ],
    "answer": 0,
    "explanation": "El observable es Vextremo1−Vextremo2; la referencia y seguridad de instrumentación importan.",
    "source": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "comp-senales-3",
    "topic": "senales",
    "question": "En un circuito RC ideal, tras una constante de tiempo desde un escalón, Vc alcanza cerca de:",
    "options": [
      "20%",
      "37%",
      "63%",
      "100%"
    ],
    "answer": 2,
    "explanation": "Con entrada escalón y capacitor inicialmente descargado, Vc=V×(1−e⁻¹)≈63,2% del valor final.",
    "source": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "comp-senales-4",
    "topic": "senales",
    "question": "Si la capacidad se reduce a una quinta parte con R constante, la constante de tiempo:",
    "options": [
      "Aumenta cinco veces",
      "Se mantiene",
      "Se reduce cinco veces",
      "Se anula"
    ],
    "answer": 2,
    "explanation": "Tau=R×C. Si C cae a 20% de su valor original, tau también se reduce a 20%.",
    "source": "https://www.nexperia.com/applications/automotive"
  },
  {
    "id": "comp-redes-1",
    "topic": "redes",
    "question": "¿Qué función corresponde al transceptor CAN?",
    "options": [
      "Convertir entre niveles de controlador y señal física diferencial",
      "Definir todas las unidades de DBC",
      "Calcular SOH automáticamente",
      "Reprogramar ECUs siempre"
    ],
    "answer": 0,
    "explanation": "El transceptor implementa la interfaz eléctrica entre controlador lógico y medio diferencial; el DBC describe señales.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "comp-redes-2",
    "topic": "redes",
    "question": "Una DBC correcta demuestra que la terminación física está correcta:",
    "options": [
      "Sí, siempre",
      "Solo en vehículos nuevos",
      "No, la DBC no mide la red eléctrica",
      "Solo con UDS"
    ],
    "answer": 2,
    "explanation": "Una descripción de señales y factores no sustituye medir la capa física y alimentación de la red.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "comp-redes-3",
    "topic": "redes",
    "question": "Una ECU desaparece pero otras envían tramas CAN con normalidad. Se debe evaluar:",
    "options": [
      "Alimentación y retorno local del nodo ausente",
      "Cambiar todas las ECUs",
      "Modificar el VIN",
      "Ignorar la falla"
    ],
    "answer": 0,
    "explanation": "La actividad del resto de la red no garantiza que todos los nodos estén energizados.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "comp-redes-4",
    "topic": "redes",
    "question": "¿Qué condición importa para comparar resistencia de terminación H/L?",
    "options": [
      "Topología prevista y procedimiento con equipo apagado",
      "Color de los conectores",
      "Motor a máxima carga",
      "Voltaje en paquete HV"
    ],
    "answer": 0,
    "explanation": "La resistencia global depende de la topología y la medición debe realizarse sin energizar el bus conforme a los procedimientos.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "comp-ev-1",
    "topic": "ev",
    "question": "Las pérdidas de conducción de un semiconductor son suficientes para modelar todo un DC/DC:",
    "options": [
      "Sí",
      "No, faltan conmutación, magnetismo, control y térmica",
      "Solo si es CAN FD",
      "Solo con DBC"
    ],
    "answer": 1,
    "explanation": "Un convertidor involucra fenómenos dinámicos, control y protecciones que exceden la pérdida resistiva de un MOSFET.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "comp-ev-2",
    "topic": "ev",
    "question": "Un equipo educativo que calcula E=0,5LI² demuestra seguridad de un pack de tracción:",
    "options": [
      "Sí",
      "Únicamente con osciloscopio",
      "No, no evalúa seguridad ni aislamiento HV",
      "Solo con 12 V"
    ],
    "answer": 2,
    "explanation": "Una ecuación de energía no sustituye procedimientos, evaluación de riesgos ni habilitación para alta tensión.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "comp-ev-3",
    "topic": "ev",
    "question": "¿Qué acción es prudente para estudiar semiconductores HV sin capacitación acreditada?",
    "options": [
      "Abrir inversor real",
      "Usar simulaciones y teoría sin intervenir HV real",
      "Cortar interlocks",
      "Improvisar desenergización"
    ],
    "answer": 1,
    "explanation": "Aprender conceptos con simulaciones no requiere manipular componentes energizados ni aplicar procedimientos HV sin formación.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "comp-ev-4",
    "topic": "ev",
    "question": "Al interpretar un DC/DC auxiliar de vehículo eléctrico, ¿qué conclusión evita confundir síntomas?",
    "options": [
      "La baja tensión por sí sola demuestra degradación HV",
      "Los lados LV y HV deben diferenciarse en arquitectura",
      "Toda caída tiene origen en motor",
      "CAN define corriente de transistores"
    ],
    "answer": 1,
    "explanation": "Una caída en baja tensión puede provenir de cableado o retorno auxiliar, sin evidencia suficiente sobre el pack de tracción.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
