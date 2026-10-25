// Estudios de identificabilidad y diagnóstico diferencial: datos sintéticos, fuentes contextuales.
export const differentialLessons=[
  {
    "id": "same-symptom",
    "topic": "electricidad",
    "title": "Síntomas idénticos y causas distintas",
    "minutes": 42,
    "url": "https://www.picoauto.com/library/automotive-guided-tests/",
    "sections": [
      [
        "El síntoma es un dato incompleto",
        "Dos circuitos resistivos con diferentes combinaciones de resistencia de cable y carga pueden producir la misma tensión en el consumidor. Un voltaje anormal no identifica por sí solo qué componente está alterado; para discriminar debemos observar una segunda variable que responda distinto a cada hipótesis."
      ],
      [
        "Comparar corrientes y caídas",
        "En un banco de 5 V, cable de 10 Ω y carga de 60 Ω, la carga recibe aproximadamente 4,286 V con 0,0714 A. Otro banco con cable de 1 Ω y carga de 6 Ω arroja el mismo voltaje pero 0,7143 A. La corriente permite distinguir ambas combinaciones bajo los supuestos declarados."
      ],
      [
        "Diseñar una prueba falsable",
        "Antes de medir, escribí una predicción concreta para cada causa: cuánto esperás y en qué punto. Priorizá medidas que tengan resultados diferentes según cuál hipótesis sea cierta, sin puentear protecciones ni extrapolar valores sintéticos a vehículos reales."
      ]
    ]
  },
  {
    "id": "power-driver",
    "topic": "motor",
    "title": "Driver MOSFET, carga abierta y corriente",
    "minutes": 44,
    "url": "https://www.picoauto.com/library/automotive-guided-tests/",
    "sections": [
      [
        "Mando no es entrega de potencia",
        "Una forma de onda PWM correcta en la puerta de un MOSFET low-side confirma presencia de señal lógica pero no demuestra corriente de carga. Una bobina o carga abierta y un transistor con resistencia de conducción elevada pueden dejar al actuador sin fuerza suficiente por mecanismos diferentes."
      ],
      [
        "Variables con poder discriminante",
        "Separá tensión de alimentación, VGS, VDS y corriente durante el estado de conducción. En un modelo puramente resistivo, una carga abierta no consume corriente; la resistencia aumentada del transistor permite una corriente reducida y aumenta su propia caída de tensión."
      ],
      [
        "Límites del modelo ideal",
        "El ejercicio simplifica una carga a resistencia pura y no contempla ruido, inductancia, protección de flyback, carga de puerta ni térmica. Las pruebas sobre vehículos requieren esquemas y procedimientos específicos; no se autorizan puentes, desconexiones peligrosas ni reparaciones de ECU a partir de esta simulación."
      ]
    ]
  },
  {
    "id": "wave-identifiability",
    "topic": "senales",
    "title": "Identificabilidad: la misma onda admite varios circuitos",
    "minutes": 45,
    "url": "https://www.picoauto.com/library/automotive-guided-tests/",
    "sections": [
      [
        "La constante de tiempo no revela dos incógnitas",
        "Una curva exponencial de un RC ideal depende del producto tau=R×C. Si tau es 20 ms, tanto R=1 kΩ con C=20 µF como R=200 Ω con C=100 µF generan la misma respuesta a un escalón, suponiendo ausencia de carga adicional."
      ],
      [
        "Medir otra magnitud",
        "Cuando la forma de onda es idéntica en ambas hipótesis, capturarla con mayor resolución no elimina la ambigüedad. Una medida independiente de resistencia o capacitancia del banco aislado sí permite distinguir cuál parámetro se modificó."
      ],
      [
        "Observación y certeza",
        "En un sistema real, fuentes, sondas, temperatura, fugas y tolerancias agregan incertidumbre. Registrá el modelo, configuración del instrumento y evidencia primaria. La academia solo compara curvas matemáticas y no verifica la seguridad eléctrica de una intervención física."
      ]
    ]
  },
  {
    "id": "can-physical-differential",
    "topic": "redes",
    "title": "Aislar fallas de nodo frente a fallas de medio CAN",
    "minutes": 43,
    "url": "https://kvaser.com/can-protocol-tutorial/",
    "sections": [
      [
        "Una ausencia no define la causa",
        "La falta de respuesta de una ECU puede deberse a alimentación local, reinicio del controlador, transceptor o infraestructura de red. Un mismo DTC de pérdida de comunicación es compatible con varios mecanismos y no prueba por sí solo un terminador defectuoso."
      ],
      [
        "Pruebas independientes",
        "Compará alimentación del nodo, estado de masa, tráfico pasivo y, con el banco apagado según procedimiento, resistencia global de terminación. Si otros nodos siguen transmitiendo normalmente, comprobá antes la energía local del módulo ausente."
      ],
      [
        "Interpretación prudente",
        "Una DBC define cómo traducir señales conocidas, pero no mide integridad de cable ni demuestra que una ECU esté alimentada. AutoLab utiliza trazas sintéticas aisladas; no realiza inyección, desbloqueo de seguridad ni escritura de firmware."
      ]
    ]
  },
  {
    "id": "bms-observability",
    "topic": "ev",
    "title": "BMS y observabilidad: medición no equivale a estado",
    "minutes": 45,
    "url": "https://docs.pybamm.org/",
    "sections": [
      [
        "Qué revela y qué no revela la tensión",
        "Dos baterías pueden mostrar tensiones similares con SOC o SOH distintos según química, historial térmico, corriente y reposo. Una sola medida de tensión o una curva matemática sintética no determina capacidad remanente real ni condición de seguridad."
      ],
      [
        "Hacer visibles los supuestos",
        "La integración de corriente necesita calibración y estado inicial. Un sensor con offset acumula error; una capacidad asumida incorrecta también desplaza el SOC. Contrastar con referencias independientes y registrar el protocolo es imprescindible para valorar incertidumbre."
      ],
      [
        "Seguridad del entrenamiento",
        "PyBaMM resuelve modelos físicos bajo parámetros supuestos, pero no reemplaza ensayos experimentales específicos de celda o pack. Todos los ejercicios se limitan a datos y simulación; medir alta tensión real requiere formación, equipos y procedimientos de seguridad profesionales."
      ]
    ]
  }
];
export const differentialQuestions=[
  {
    "id": "diff-q-electricidad-1",
    "topic": "electricidad",
    "question": "Dos circuitos muestran 4,286 V en la carga. ¿Qué segunda medición puede diferenciarlos?",
    "options": [
      "Color del cable",
      "Corriente de la rama",
      "El mismo voltaje otra vez",
      "Número de ECU"
    ],
    "answer": 1,
    "explanation": "La corriente cambia al modificar proporcionalmente resistencias de cable y carga aunque el cociente de tensión permanezca igual.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-electricidad-2",
    "topic": "electricidad",
    "question": "Si una hipótesis no puede ser refutada por ningún resultado de la prueba elegida, esa prueba es:",
    "options": [
      "Siempre la mejor",
      "Insuficiente para discriminar",
      "Una verificación definitiva",
      "Equivalente a dos pruebas independientes"
    ],
    "answer": 1,
    "explanation": "Una medida que entrega el mismo resultado bajo ambas causas no discrimina cuál está presente en el circuito.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-motor-1",
    "topic": "motor",
    "question": "PWM correcto en puerta pero 0 A de carga indica necesariamente una ECU rota:",
    "options": [
      "Sí",
      "No, debe examinarse carga y trayectoria de potencia",
      "Solo si el duty es 30%",
      "Solo en sensores CAN"
    ],
    "answer": 1,
    "explanation": "El PWM de mando no implica continuidad de carga; corriente nula puede corresponder a una apertura del camino de potencia.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-motor-2",
    "topic": "motor",
    "question": "Entre carga abierta y resistencia del MOSFET aumentada, ¿qué observación aporta contraste?",
    "options": [
      "Repetir solo la frecuencia de puerta",
      "Comparar corriente de carga en estado ON",
      "Ver otra vez el mismo DTC",
      "Medir el color del encapsulado"
    ],
    "answer": 1,
    "explanation": "La carga abierta ideal tiene corriente nula; un MOSFET con resistencia elevada puede mantener corriente reducida y caída VDS.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-senales-1",
    "topic": "senales",
    "question": "Un RC con R=1 kΩ y C=20 µF tiene la misma tau que:",
    "options": [
      "R=200 Ω, C=100 µF",
      "R=2 kΩ, C=100 µF",
      "R=1 kΩ, C=200 µF",
      "R=20 Ω, C=20 µF"
    ],
    "answer": 0,
    "explanation": "Ambos productos R×C equivalen a 0,020 s. La misma tau no identifica qué componente está alterado.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-senales-2",
    "topic": "senales",
    "question": "¿Por qué mayor frecuencia de muestreo no distingue dos RC ideales con igual tau?",
    "options": [
      "Porque ambas curvas matemáticas son idénticas",
      "Porque se rompe la sonda",
      "Porque tau deja de existir",
      "Porque cambia el valor de CAN"
    ],
    "answer": 0,
    "explanation": "Si la salida modelada coincide exactamente para cualquier tiempo, ningún muestreo de esa misma variable separa los parámetros R y C.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "diff-q-redes-1",
    "topic": "redes",
    "question": "Un gateway no responde aunque dos nodos comuniquen. Prioridad razonable:",
    "options": [
      "Actualizar firmware de todos los módulos",
      "Verificar alimentación y retorno local del gateway",
      "Borrar toda DBC",
      "Inyectar tramas aleatorias"
    ],
    "answer": 1,
    "explanation": "La actividad de otros módulos demuestra que parte de la red funciona, pero no garantiza energía en el gateway ausente.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "diff-q-redes-2",
    "topic": "redes",
    "question": "¿Qué mide realmente una DBC al importarla?",
    "options": [
      "Resistencia H-L del bus",
      "Nada: describe interpretación de campos de tramas",
      "Temperatura del transceptor",
      "Voltaje de alimentación ECU"
    ],
    "answer": 1,
    "explanation": "La DBC es una definición de señales y escalas; la integridad eléctrica se evalúa con instrumentos y contexto.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "diff-q-ev-1",
    "topic": "ev",
    "question": "Una tensión instantánea prueba por sí sola SOH real:",
    "options": [
      "Sí",
      "No, faltan química, capacidad, condiciones y referencia",
      "Solo si el display muestra un porcentaje",
      "Solo al medir desde CAN"
    ],
    "answer": 1,
    "explanation": "El SOH no se determina con una tensión aislada: se necesitan ensayos y modelos calibrados para el sistema específico.",
    "source": "https://docs.pybamm.org/"
  },
  {
    "id": "diff-q-ev-2",
    "topic": "ev",
    "question": "Un offset de corriente durante dos horas produce error acumulativo porque:",
    "options": [
      "El sensor se vuelve CAN FD",
      "El error se integra con el tiempo",
      "El voltaje cancela automáticamente el error",
      "No afecta al SOC"
    ],
    "answer": 1,
    "explanation": "La carga eléctrica se calcula integrando corriente en el tiempo; un sesgo estable añade o resta una cantidad proporcional a su duración.",
    "source": "https://docs.pybamm.org/"
  }
];
