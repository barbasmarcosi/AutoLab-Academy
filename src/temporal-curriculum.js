// Lecciones originales de correlación temporal y fallas intermitentes. Referencias contextuales; datos ficticios.
export const temporalLessons=[
  {
    "id": "transient-supply",
    "topic": "electricidad",
    "title": "Caídas breves de alimentación y captura previa al evento",
    "minutes": 42,
    "url": "https://www.picoauto.com/library/automotive-guided-tests/",
    "sections": [
      [
        "Por qué el valor promedio engaña",
        "Un suministro que parece estable al medirlo durante varios segundos puede caer brevemente bajo demanda. La captura con referencia temporal permite observar si el cambio coincide con una pérdida de mando o un reinicio simulado, sin demostrar por sí sola qué componente físico produjo la caída."
      ],
      [
        "Captura y comparación reproducibles",
        "Al revisar ventanas anteriores y posteriores al síntoma, anotá el disparo, la duración, el retorno de masa, el voltaje de alimentación y la misma condición de carga. Una medición estacionaria que no incluye el instante de falla puede generar una conclusión equivocada."
      ],
      [
        "Límites instrumentales",
        "En la academia la alimentación de la ECU y los otros canales son señales matemáticas; sus valores no constituyen especificaciones de ninguna marca. En taller, los puntos de medida, sondas, aislamiento y el instrumental apropiado requieren procedimiento y documentación aplicables."
      ]
    ]
  },
  {
    "id": "injector-dual-channel",
    "topic": "motor",
    "title": "Mando y corriente del inyector: dos señales complementarias",
    "minutes": 46,
    "url": "https://www.picoauto.com/library/automotive-guided-tests/actuators/injector-%28gasoline%29/AGT-382-mpi-injector-voltage/",
    "sections": [
      [
        "La orden no equivale a acción",
        "La ECU puede generar un mando de activación mientras una carga abierta impide que circule corriente. Un canal de tensión o comando y otro de corriente ayudan a distinguir orden ausente de camino eléctrico interrumpido, siempre con modelo y condiciones declaradas."
      ],
      [
        "Capturar en el mismo eje temporal",
        "Una comparación válida registra comando, corriente y momento del síntoma dentro de la misma ventana temporal. Un pulso de corriente puede presentar una rampa por inductancia, pero su forma depende del tipo de inyector, driver, control y arquitectura OEM; una curva simplificada no es patrón universal."
      ],
      [
        "No extrapolar a sistemas de potencia",
        "Inyección indirecta, inyección directa y sistemas piezoeléctricos emplean estrategias eléctricas diferentes. Las prácticas de AutoLab son ficticias y de baja tensión idealizada, sin mandar inyectores reales ni evaluar rampas de seguridad."
      ]
    ]
  },
  {
    "id": "ckp-cmp-correlation-buffer",
    "topic": "senales",
    "title": "CKP/CMP: correlación, dientes ausentes y fallas intermitentes",
    "minutes": 48,
    "url": "https://www.picoauto.com/library/application-notes/cam-and-crank-correlation",
    "sections": [
      [
        "Dos canales y un patrón de referencia",
        "El CKP representa giro del cigüeñal y un marcador de rueda; el CMP aporta información de fase. Comparar los flancos respecto de un patrón común permite reconocer un desplazamiento del canal CMP o una interrupción CKP en un banco de pruebas sintético."
      ],
      [
        "La ventana importa",
        "Una falla que aparece en una sola ventana se oculta si revisás únicamente un ciclo normal. Registrar un buffer de varias capturas y compararlas permite revisar el instante de anomalía, su duración y la relación entre las señales sin atribuir automáticamente un defecto mecánico."
      ],
      [
        "No convertir el hueco en TDC universal",
        "Los dientes faltantes sirven como referencia del patrón, pero no necesariamente representan punto muerto superior del cilindro uno. Las comparaciones reales deben seguir especificaciones del fabricante, condición de RPM y estado del sistema de distribución."
      ]
    ]
  },
  {
    "id": "can-intermittent-events",
    "topic": "redes",
    "title": "Eventos de red CAN y simultaneidad con pérdida de alimentación",
    "minutes": 44,
    "url": "https://kvaser.com/can-protocol-tutorial/",
    "sections": [
      [
        "Una ausencia temporal no dice por qué ocurrió",
        "Perder respuestas de una ECU durante unos instantes puede coincidir con un reinicio local o una anomalía del medio, pero el silencio del nodo no identifica automáticamente cuál explicación es verdadera. Necesitás más de una variable observada bajo el mismo reloj o una correlación justificada."
      ],
      [
        "Correlación sin inyección",
        "Un analizador pasivo puede mostrar marcas de tiempo y tramas de nodos que continúan activos. Cruzar esos datos con alimentación del módulo y síntomas registrados puede orientar pruebas futuras, siempre considerando sincronización de instrumentos, precisión del reloj y topología."
      ],
      [
        "Privacidad y límites",
        "Los ejercicios de red de AutoLab leen archivos locales o generan eventos sintéticos, nunca mandan mensajes a vehículos en marcha. No se deducen señales propietarias sin definición DBC apropiada ni se asume que todos los buses tienen igual bitrate y terminación."
      ]
    ]
  },
  {
    "id": "bms-intermittent-sensors",
    "topic": "ev",
    "title": "Sensores y BMS: detectar anomalías transitorias sin extrapolar a HV",
    "minutes": 46,
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm",
    "sections": [
      [
        "Separar dato y estimación",
        "En un sistema de batería, corriente, voltaje, temperatura y SOC se relacionan mediante modelos y estimadores. Un salto aparente del SOC no demuestra en sí mismo una celda deteriorada; un sensor con ruido, offset o un cambio de estado del sistema puede explicar parte de la observación."
      ],
      [
        "Importancia de la marca temporal",
        "Para correlacionar corriente con voltaje o eventos del BMS, las mediciones deben tener relojes comparables y resolución suficiente. Promedios o datos de un solo canal pueden esconder eventos breves y confundir causalidad con coincidencia."
      ],
      [
        "Nunca intervenir el paquete de tracción",
        "Un laboratorio de datos no verifica aislamiento, ausencia de tensión ni seguridad de un pack HV. La manipulación real de sistemas HV requiere capacitación especializada, protocolos del fabricante y elementos de protección adecuados."
      ]
    ]
  }
];
export const temporalQuestions=[
  {
    "id": "time-q-electricidad-1",
    "topic": "electricidad",
    "question": "Una caída de ECU de 100 ms puede perderse al leer solamente:",
    "options": [
      "Un promedio de varios segundos",
      "Una captura con pre-trigger",
      "La tensión mínima dentro de la ventana",
      "Un oscilograma de alta resolución"
    ],
    "answer": 0,
    "explanation": "Un promedio temporal puede suavizar una caída breve; conviene conservar la ventana que incluye el evento y su referencia de tiempo.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "time-q-electricidad-2",
    "topic": "electricidad",
    "question": "¿Qué información permite correlacionar baja alimentación con un mando faltante?",
    "options": [
      "Registro de ambos canales en la misma ventana",
      "Dos valores tomados en fechas distintas",
      "Solo tensión de batería en reposo",
      "Un DTC sin condiciones"
    ],
    "answer": 0,
    "explanation": "La simultaneidad se comprueba registrando alimentación y salida con un eje temporal compartido, sin asumir causalidad automática.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "time-q-motor-1",
    "topic": "motor",
    "question": "Si hay pulso de mando pero corriente del inyector cero en el modelo, investigarías primero:",
    "options": [
      "Continuidad de la carga y su circuito",
      "Cambiar batería HV",
      "Modificar DBC",
      "Condenar la ECU sin más medidas"
    ],
    "answer": 0,
    "explanation": "La tensión de comando no asegura circulación de corriente: un circuito abierto de la carga puede producir ese patrón simulado.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/actuators/injector-%28gasoline%29/AGT-382-mpi-injector-voltage/"
  },
  {
    "id": "time-q-motor-2",
    "topic": "motor",
    "question": "¿Por qué una rampa de corriente no debe tratarse como patrón universal de inyectores?",
    "options": [
      "Los drivers y arquitecturas varían entre sistemas",
      "Todos los inyectores tienen 5 V",
      "El tiempo no importa",
      "La frecuencia CKP determina siempre el pico"
    ],
    "answer": 0,
    "explanation": "Los diseños de inyección indirecta, directa y piezoeléctrica pueden usar mandos y corrientes muy diferentes y precisan referencias OEM.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/actuators/injector-%28gasoline%29/AGT-382-mpi-injector-voltage/"
  },
  {
    "id": "time-q-senales-1",
    "topic": "senales",
    "question": "Si CMP cambia su flanco relativo a CKP en una sola ventana, el siguiente paso razonable es:",
    "options": [
      "Comparar con capturas de referencia equivalentes",
      "Reemplazar cadena de distribución sin pruebas",
      "Asumir TDC en el primer diente faltante",
      "Ignorar el estado de RPM"
    ],
    "answer": 0,
    "explanation": "La correlación exige patrón de referencia, estado de giro y repetición; una desviación sintética no localiza causa física exacta.",
    "source": "https://www.picoauto.com/library/application-notes/cam-and-crank-correlation"
  },
  {
    "id": "time-q-senales-2",
    "topic": "senales",
    "question": "Una pérdida de CKP que ocurre solo en una ventana puede detectarse mejor mediante:",
    "options": [
      "Buffer temporal de varias ventanas",
      "Una captura aislada fuera del síntoma",
      "Promedio de señal durante horas sin eventos",
      "Medición del color del conector"
    ],
    "answer": 0,
    "explanation": "El buffer conserva el contexto previo y posterior a la interrupción; revisar solo una captura sana puede ocultar la anomalía.",
    "source": "https://www.picoauto.com/library/application-notes/cam-and-crank-correlation"
  },
  {
    "id": "time-q-redes-1",
    "topic": "redes",
    "question": "Cuando faltan tramas de un nodo CAN, ¿qué hipótesis sigue siendo válida?",
    "options": [
      "Nodo sin alimentación local",
      "La DBC debe estar dañada necesariamente",
      "Todas las ECU comparten fallo de procesador",
      "El bus completo está roto sin excepción"
    ],
    "answer": 0,
    "explanation": "La falta de alimentación puede explicar silencio de un nodo aun con otros módulos comunicando; hay que contrastar con pruebas de energía y red.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "time-q-redes-2",
    "topic": "redes",
    "question": "Correlacionar tramas y voltajes tomados con instrumentos diferentes exige especialmente:",
    "options": [
      "Verificar alineación y precisión de relojes",
      "Usar solamente el último mensaje",
      "Asumir retardos cero siempre",
      "Elevar tensión del bus"
    ],
    "answer": 0,
    "explanation": "Sin base temporal comparable una coincidencia aparente puede ser un desfase entre registros y no un evento eléctrico compartido.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "time-q-ev-1",
    "topic": "ev",
    "question": "Un salto de SOC en un registro aislado demuestra daño de celda:",
    "options": [
      "No, requiere contrastar sensores, modelo y condiciones",
      "Sí, sin condiciones",
      "Solo cuando la pantalla es digital",
      "Solo si las tramas son CAN"
    ],
    "answer": 0,
    "explanation": "SOC es una estimación dependiente de referencia y modelo; una observación temporal aislada no acredita capacidad ni salud real.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "time-q-ev-2",
    "topic": "ev",
    "question": "¿Qué distingue el análisis temporal de BMS de una intervención profesional HV?",
    "options": [
      "Analizar series sintéticas no habilita mediciones energizadas",
      "Los gráficos validan ausencia de tensión",
      "Un examen digital certifica aislamiento",
      "Ninguna diferencia"
    ],
    "answer": 0,
    "explanation": "El estudio de series de tiempo no sustituye capacitación, protocolos, instrumentación ni autorización para intervenir paquetes de alta tensión.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
