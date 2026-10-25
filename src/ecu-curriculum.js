// Material original educativo orientado a ECU. Fuentes apoyan conceptos, no cifras sintéticas.
export const ecuLessons=[
  {
    "id": "ecu-feed",
    "topic": "electricidad",
    "title": "Fuentes, relés y reinicios intermitentes",
    "minutes": 35,
    "sections": [
      [
        "Concepto y modelo",
        "Diferenciá tensión de batería, alimentación a la ECU y retorno bajo la misma demanda: una caída localizada puede reiniciar la lógica digital sin fallar la batería."
      ],
      [
        "Qué evidencia buscar",
        "Una lectura en vacío no reproduce las condiciones de operación. Documentá instante de reinicio, corriente, tensión en pines del banco y estado de protección."
      ],
      [
        "Límite práctico y criterio",
        "Un síntoma no identifica el componente. Verificá qué etapa presenta caída antes de reemplazar ECU, relé, conectores o fuente."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "pullups",
    "topic": "electricidad",
    "title": "Entradas digitales, pull-up y circuitos abiertos",
    "minutes": 34,
    "sections": [
      [
        "Concepto y modelo",
        "Una entrada digital con resistencia pull-up tiende a nivel alto si el contacto abierto no une el nodo a masa. El valor depende del diseño y umbral lógico."
      ],
      [
        "Qué evidencia buscar",
        "Compará el estado esperado, la entrada real y el contexto de activación. Una lectura alta no distingue por sí sola un contacto abierto de un conductor interrumpido."
      ],
      [
        "Límite práctico y criterio",
        "No apliques voltaje externo a pines ECU desconocidos: el laboratorio trabaja únicamente con lógica sintética y fuentes protegidas."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "sensor-plausibility",
    "topic": "motor",
    "title": "Correlaciones MAP, TPS y ECT para encontrar contradicciones",
    "minutes": 40,
    "sections": [
      [
        "Concepto y modelo",
        "Una ECU compara señales con condiciones físicas y expectativas de plausibilidad. Un parámetro congelado puede deberse al circuito, la señal, la lectura o al modo de sustitución."
      ],
      [
        "Qué evidencia buscar",
        "Registrá múltiples parámetros en un mismo instante y no interpretes el valor aislado. Temperatura del motor y ambiente, condición de carga y referencia compartida aportan contexto."
      ],
      [
        "Límite práctico y criterio",
        "Una prueba útil intenta discriminar el sensor del entorno y del cableado; nunca reemplaces piezas a partir de un único DTC."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "actuator-power",
    "topic": "motor",
    "title": "Driver, actuador y carga: mando no es funcionamiento",
    "minutes": 38,
    "sections": [
      [
        "Concepto y modelo",
        "Que el osciloscopio muestre PWM en la salida del módulo no demuestra que exista corriente en la carga ni que el actuador haga trabajo físico."
      ],
      [
        "Qué evidencia buscar",
        "En un banco diseñado para ello, correlacioná mando, suministro y corriente: esa secuencia diferencia falla de control, de alimentación y de carga."
      ],
      [
        "Límite práctico y criterio",
        "Una bobina abierta y un driver averiado pueden compartir síntoma; diseñá una prueba de baja intrusión que produzca resultados distintos."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "scope-reference",
    "topic": "senales",
    "title": "Masas de osciloscopio y errores de referencia",
    "minutes": 40,
    "sections": [
      [
        "Concepto y modelo",
        "Una señal puede parecer defectuosa si la referencia del instrumento no coincide con el retorno real. Un equipo referido a tierra puede crear un camino no deseado."
      ],
      [
        "Qué evidencia buscar",
        "Las capturas comparables registran referencia usada, base de tiempo, escala, atenuación, condiciones del banco y ubicación de las sondas."
      ],
      [
        "Límite práctico y criterio",
        "En HV o circuitos desconocidos no improvises conexiones. Usá formación y equipo apropiado para aplicaciones reales; aquí solo se interpretan imágenes sintéticas."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "actuator-current",
    "topic": "senales",
    "title": "Correlación de corriente y voltaje en cargas",
    "minutes": 36,
    "sections": [
      [
        "Concepto y modelo",
        "La tensión de comando puede verse normal cuando no circula corriente. La corriente, observada con una pinza compatible y segura, aporta evidencia del circuito de carga."
      ],
      [
        "Qué evidencia buscar",
        "Una curva de corriente puede revelar respuesta progresiva o ausencia de carga. Sin datos de fabricante no hay un patrón único para todos los actuadores."
      ],
      [
        "Límite práctico y criterio",
        "Explicá qué medición contradice tu hipótesis, en lugar de buscar únicamente la que la favorece."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "can-isolation",
    "topic": "redes",
    "title": "Gateway, ECUs sin alimentación y bus saludable",
    "minutes": 38,
    "sections": [
      [
        "Concepto y modelo",
        "Un módulo ausente puede estar sin alimentación local; la actividad correcta de otros nodos indica que al menos parte de la red funciona."
      ],
      [
        "Qué evidencia buscar",
        "Compará energía del nodo, referencia, actividad pasiva y topología. La resistencia terminal depende de la configuración real y debe medirse conforme a procedimiento."
      ],
      [
        "Límite práctico y criterio",
        "Un DBC erróneo puede malinterpretar tramas existentes, pero no demuestra que el bus físico esté apagado."
      ]
    ],
    "url": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "uds-session",
    "topic": "redes",
    "title": "UDS: sesiones diagnósticas y respuestas negativas",
    "minutes": 38,
    "sections": [
      [
        "Concepto y modelo",
        "La respuesta de un servicio puede depender de sesión, tiempo, condiciones y permisos. Un NRC no equivale automáticamente a una ECU rota."
      ],
      [
        "Qué evidencia buscar",
        "Registrar el servicio solicitado, sesión, marca temporal y respuesta permite diferenciar falta de soporte, espera y comunicación interrumpida."
      ],
      [
        "Límite práctico y criterio",
        "No se implementan aquí comandos de seguridad, desbloqueo, escritura ni reprogramación de vehículos: se estudian trazas ficticias."
      ]
    ],
    "url": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "dcdc-lv",
    "topic": "ev",
    "title": "Convertidor DC/DC: interpretar solo el lado auxiliar",
    "minutes": 42,
    "sections": [
      [
        "Concepto y modelo",
        "Un sistema HEV/EV suele tener alimentación auxiliar de baja tensión además de energía de tracción. La baja tensión local no demuestra por sí sola una celda HV deteriorada."
      ],
      [
        "Qué evidencia buscar",
        "Diferenciá la salida auxiliar del convertidor, el retorno de la carga y la condición de demanda; el diseño exacto depende del vehículo."
      ],
      [
        "Límite práctico y criterio",
        "Los ensayos de alta tensión deben reservarse a personal calificado con los procedimientos del fabricante. Las prácticas AutoLab son simuladas."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "bms-uncertainty",
    "topic": "ev",
    "title": "Incertidumbre de SOC, sensores y estimación de capacidad",
    "minutes": 42,
    "sections": [
      [
        "Concepto y modelo",
        "El conteo de culombios acumula error por offset de corriente, SOC inicial y capacidad asumida. Un número muy preciso no necesariamente es verdadero."
      ],
      [
        "Qué evidencia buscar",
        "Separá observación, estimación y referencia experimental, registrando tiempo y temperatura. SOH por capacidad requiere ensayos comparables."
      ],
      [
        "Límite práctico y criterio",
        "El aprendizaje con PyBaMM y datos virtuales no autoriza a diagnosticar o reparar baterías de tracción reales."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
export const ecuQuestions=[
  {
    "id": "ecu-q-electricidad-1",
    "topic": "electricidad",
    "question": "Si la batería marca 12,3 V bajo carga y el pin ECU cae a 8,7 V, ¿qué hipótesis es prioritaria?",
    "options": [
      "Caída en la alimentación local de ECU",
      "Pack HV necesariamente degradado",
      "DBC incorrecta como causa de voltaje",
      "Falla de motor mecánico"
    ],
    "answer": 0,
    "explanation": "La fuente está estable y la tensión disminuye en el pin; hay que localizar la caída en el trayecto de alimentación.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-electricidad-2",
    "topic": "electricidad",
    "question": "En un contacto pull-up, el interruptor abierto puede producir:",
    "options": [
      "Nivel bajo asegurado",
      "Nivel alto de la entrada, según diseño",
      "Corriente de motor extrema",
      "Reset de ECU siempre"
    ],
    "answer": 1,
    "explanation": "La resistencia pull-up lleva el nodo a nivel alto sin un contacto que lo conecte a masa; el circuito particular define umbrales.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-electricidad-3",
    "topic": "electricidad",
    "question": "¿Por qué documentar tensión durante el reinicio en lugar de solo tensión en reposo?",
    "options": [
      "La anomalía puede manifestarse únicamente bajo demanda",
      "Porque el reposo mide la fase CAN",
      "Porque el osciloscopio cambia el SOH",
      "Porque un DTC elimina fallas de masa"
    ],
    "answer": 0,
    "explanation": "Una resistencia localizada bajo corriente ocasiona una caída que puede no verse cuando el circuito está en reposo.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-electricidad-4",
    "topic": "electricidad",
    "question": "Una línea digital en alto no permite deducir por sí sola:",
    "options": [
      "Si el contacto está abierto o el conductor está interrumpido",
      "Si la ECU tiene un pull-up",
      "Si la lectura es lógica alta",
      "Que es necesaria una prueba discriminante"
    ],
    "answer": 0,
    "explanation": "Distintos estados físicos pueden producir el mismo nivel lógico, de modo que se precisa correlación con circuito y contexto.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-motor-1",
    "topic": "motor",
    "question": "Si dos sensores analógicos muestran incoherencias simultáneas, ¿qué conviene revisar primero?",
    "options": [
      "Únicamente sus números de pieza",
      "Referencias y retornos compartidos",
      "Que el vehículo tenga NFC",
      "El valor de SOH"
    ],
    "answer": 1,
    "explanation": "La simultaneidad orienta hacia factores compartidos como referencia, alimentación, masa o condiciones del modelo.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-motor-2",
    "topic": "motor",
    "question": "PWM correcto de la ECU pero corriente de actuador nula sugiere investigar:",
    "options": [
      "Carga abierta y trayecto de potencia",
      "Un fallo confirmado de software",
      "Necesariamente batería HV",
      "Un error de presentación de DBC"
    ],
    "answer": 0,
    "explanation": "La orden de mando no demuestra corriente; hay que distinguir el camino de potencia y la carga.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-motor-3",
    "topic": "motor",
    "question": "¿Qué hace una hipótesis diagnóstica falsable?",
    "options": [
      "Ofrece una medición cuyo resultado podría descartarla",
      "Nombra la pieza más costosa",
      "Coincide con el código DTC",
      "Evita probar bajo carga"
    ],
    "answer": 0,
    "explanation": "La prueba es útil cuando permite distinguir explicaciones y también descartar la inicialmente preferida.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-motor-4",
    "topic": "motor",
    "question": "Un dato de ECU congelado puede ser debido a:",
    "options": [
      "Sensor, circuito o estrategia de sustitución",
      "Solo avería del procesador",
      "Siempre ausencia de terminación CAN",
      "Siempre temperatura real constante"
    ],
    "answer": 0,
    "explanation": "Plausibilidad exige comparar variables e identificar qué ecuación o estrategia puede sostener la lectura.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-senales-1",
    "topic": "senales",
    "question": "Si la tensión de mando es normal, ¿qué variable adicional ayuda a verificar la carga?",
    "options": [
      "Color del conector",
      "Corriente durante el pulso",
      "Versión de Bluetooth",
      "Número de VIN"
    ],
    "answer": 1,
    "explanation": "La corriente aporta una observación diferente al mando de voltaje y puede revelar un circuito abierto.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-senales-2",
    "topic": "senales",
    "question": "¿Qué es importante registrar junto al oscilograma?",
    "options": [
      "Escala temporal, referencia, sonda y condiciones",
      "Solo el color de la forma de onda",
      "Precio del osciloscopio",
      "Una calificación genérica del vehículo"
    ],
    "answer": 0,
    "explanation": "Una captura sin escala, referencia y estado del sistema es difícil de comparar o interpretar con rigor.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-senales-3",
    "topic": "senales",
    "question": "Una masa de osciloscopio de banco mal conectada puede:",
    "options": [
      "Crear cortocircuitos y mediciones incorrectas",
      "Mejorar cualquier señal",
      "Cambiar la capacidad real de una batería",
      "Eliminar el ruido sin condiciones"
    ],
    "answer": 0,
    "explanation": "Un osciloscopio referenciado a tierra requiere prácticas seguras de conexión y referencia apropiada.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-senales-4",
    "topic": "senales",
    "question": "¿Qué diferencia existe entre PWM de mando y respuesta de un actuador?",
    "options": [
      "Mando es instrucción; corriente y efecto validan respuesta",
      "Son siempre la misma variable",
      "La respuesta no depende de carga",
      "PWM define automáticamente SOH"
    ],
    "answer": 0,
    "explanation": "La señal de comando no prueba que una bobina reciba corriente ni que opere mecánicamente.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ecu-q-redes-1",
    "topic": "redes",
    "question": "El gateway no comunica, pero A y C intercambian tramas. ¿Qué medición discrimina más?",
    "options": [
      "Alimentación del gateway",
      "Color del DBC",
      "Aceite de motor",
      "Precio del escáner"
    ],
    "answer": 0,
    "explanation": "La red activa no demuestra que todos los nodos reciban energía; medir alimentación local permite orientar la falla.",
    "source": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "ecu-q-redes-2",
    "topic": "redes",
    "question": "¿Qué permite un DBC correcto sobre tramas CAN registradas?",
    "options": [
      "Interpretar señales conforme a su definición",
      "Demostrar que un cable CAN está intacto",
      "Certificar alimentación de todas las ECUs",
      "Desbloquear cualquier ECU"
    ],
    "answer": 0,
    "explanation": "DBC describe campos, escala y significado para los IDs definidos; no sustituye medir la red física.",
    "source": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "ecu-q-redes-3",
    "topic": "redes",
    "question": "En CAN HS de dos terminadores nominales de 120 Ω, se esperan aproximadamente:",
    "options": [
      "240 Ω",
      "60 Ω",
      "12 Ω",
      "5 Ω"
    ],
    "answer": 1,
    "explanation": "Dos terminaciones de 120 Ω en paralelo equivalen a 60 Ω solo para esa topología prevista y banco apagado.",
    "source": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "ecu-q-redes-4",
    "topic": "redes",
    "question": "Un NRC en una traza UDS debe leerse junto con:",
    "options": [
      "Sesión, servicio y contexto de solicitud",
      "Tamaño de neumáticos",
      "SOH de batería",
      "Temperatura exterior solamente"
    ],
    "answer": 0,
    "explanation": "La interpretación de la respuesta depende del servicio, sesión y condiciones de ejecución del diálogo.",
    "source": "https://kvaser.com/knowledge-base/get-error-frames/"
  },
  {
    "id": "ecu-q-ev-1",
    "topic": "ev",
    "question": "Una caída de 1,6 V en retorno LV con 13,8 V en salida DC/DC demuestra directamente:",
    "options": [
      "Defecto de retorno LV bajo la condición dada",
      "Degradación real del pack HV",
      "Celda HV abierta",
      "Inversor destruido"
    ],
    "answer": 0,
    "explanation": "El modelo localiza pérdida de tensión en baja tensión, sin información para afirmar fallas de tracción.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "ecu-q-ev-2",
    "topic": "ev",
    "question": "Un sensor con sesgo estable de 0,4 A en una hora implica error integrado de:",
    "options": [
      "0,04 Ah",
      "0,4 Ah",
      "4 Ah",
      "40 Ah"
    ],
    "answer": 1,
    "explanation": "La corriente de error integrada durante 1 h equivale a 0,4 Ah; el error SOC depende de la capacidad asumida.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "ecu-q-ev-3",
    "topic": "ev",
    "question": "¿Qué evidencia falta para certificar un SOH real a partir de una curva ficticia?",
    "options": [
      "Medición reproducible y referencia experimental validada",
      "Solo una captura de pantalla",
      "Un número de voltaje aislado",
      "Una respuesta correcta del examen"
    ],
    "answer": 0,
    "explanation": "Un modelo sintético no proporciona parámetros ni calibración suficientes para inferir la capacidad útil real.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "ecu-q-ev-4",
    "topic": "ev",
    "question": "¿Qué regla debe respetar un estudiante sin entrenamiento HV para aprender sistemas eléctricos?",
    "options": [
      "Trabajar solo con simulación y bancos apropiados de baja tensión",
      "Abrir paquetes de tracción",
      "Manipular terminales energizados",
      "Improvisar ausencia de tensión"
    ],
    "answer": 0,
    "explanation": "La formación online permite aprender conceptos, pero la intervención HV real requiere certificación y procedimientos específicos.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
