// Enseñanza de misfire por cilindro: contenido original, casos y contadores sintéticos.
export const misfireLessons=[
  {
    "id": "misfire-evidence",
    "topic": "motor",
    "title": "P030x: de un monitor de fallo de encendido a una hipótesis comprobable",
    "minutes": 47,
    "sections": [
      [
        "Un código de monitor no identifica una pieza",
        "El conjunto P030x identifica eventos de combustión irregular detectados por estrategias de monitorización, no la falla física que los produce. Los contadores de fallo por cilindro y su disponibilidad, granularidad y límites dependen del fabricante y del equipo; una lectura cero no siempre descarta eventos ocasionales."
      ],
      [
        "Correlación por cilindro y régimen",
        "Compará condiciones reproducibles y un patrón de referencia del mismo sistema. El monitor del ejercicio informa números arbitrarios por cilindro y un índice de aporte sin unidades reales; esos índices no representan un método de diagnóstico OEM ni permiten deducir ángulo o compresión."
      ],
      [
        "Diseñar una secuencia de descarte",
        "Antes de señalar bobina, inyector o válvula, combiná una medición confirmatoria con otra de exclusión. Un circuito de bobina sin corriente y un inyector que sí funciona apuntan en una dirección distinta de un problema de compresión, pero la prueba física debe respetar la arquitectura del fabricante."
      ]
    ],
    "url": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "ignition-command-current",
    "topic": "electricidad",
    "title": "Encendido: orden de ECU, corriente primaria y energía secundaria",
    "minutes": 46,
    "sections": [
      [
        "Orden y corriente son distintos observables",
        "Una ECU puede producir un comando de conmutación de bobina sin que circule la corriente prevista, por ejemplo si no llega alimentación a la rama o está abierto el circuito primario. La observación de la señal lógica sola no demuestra que exista descarga secundaria ni combustión."
      ],
      [
        "Comparar contra referencia válida",
        "La interpretación de corriente primaria requiere conocer topología, polaridad, tiempo de carga y condiciones del banco. Un patrón diferente entre cilindros permite orientar la búsqueda, pero el fallo en la rama primaria no identifica por sí mismo cuál terminal o componente se alteró."
      ],
      [
        "Evitar maniobras sobre alta tensión",
        "Un sistema de encendido puede generar tensiones muy elevadas, por lo que no corresponde tocar conductores ni sondar puntos desconocidos energizados. Las prácticas de esta lección se limitan a señales ficticias y descripción conceptual, sin intervención física."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/primary-ignition-timing-vs.-injector-current/AGT-391-injector-current-vs-primary-ignition/"
  },
  {
    "id": "relative-compression-limits",
    "topic": "senales",
    "title": "Compresión relativa: índice de arranque y sincronización de cilindros",
    "minutes": 48,
    "sections": [
      [
        "Una prueba comparativa no mide presión absoluta",
        "La comparación de corriente del motor de arranque bajo un ciclo de compresión permite detectar diferencias relativas de carga entre cilindros. No mide por sí sola bar o psi ni identifica una válvula, junta o segmento defectuoso."
      ],
      [
        "La identificación requiere fase de referencia",
        "La corriente relativa repetida en un motor multicilíndrico no identifica automáticamente cuál pico pertenece al cilindro uno sin sincronización adecuada, por ejemplo con una referencia de encendido o presión. La etiqueta de un índice arbitrario debe separarse de una medición calibrada real."
      ],
      [
        "Confirmar con metodología apropiada",
        "Un índice bajo orienta hacia investigación mecánica, mientras la verificación de causa y magnitud puede requerir otras pruebas especializadas. El banco AutoLab utiliza números sintéticos y no enseña manipulación del arranque de motores reales."
      ]
    ],
    "url": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "network-misfire-context",
    "topic": "redes",
    "title": "Monitorización y datos: interpretar P0300, freeze frame y condiciones",
    "minutes": 43,
    "sections": [
      [
        "Los datos de diagnóstico tienen contexto",
        "Un DTC y un monitor de cilindro sin información de régimen, carga, temperatura, estado del motor y momento de aparición pueden llevar a hipótesis erróneas. Algunas ECUs registran datos de congelación o contadores por cilindro, pero ni los nombres ni los parámetros están garantizados en todos los escáneres."
      ],
      [
        "La red no confirma combustión",
        "Leer tramas de diagnóstico o señales desde CAN describe información publicada por el controlador, no ofrece una medición directa de presión o chispa. Corroborar una anomalía mecánica o eléctrica exige evidencia independiente de instrumentación y especificaciones aplicables."
      ],
      [
        "Procedimientos sin perturbación",
        "Los ejercicios se basan en capturas ficticias de lectura. No implementan acciones que desactiven cilindros, escriban calibraciones, liberen seguridades o transmitan mensajes a vehículos reales. La lectura de un monitor nunca certifica una reparación."
      ]
    ],
    "url": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "hev-misfire-context",
    "topic": "ev",
    "title": "Vehículos híbridos: estados del motor térmico y monitorización",
    "minutes": 44,
    "sections": [
      [
        "Motor apagado no equivale a fallo de combustión",
        "En un sistema híbrido puede detenerse voluntariamente el motor de combustión por la estrategia de operación. Un período sin pulsos de inyección o sin contribución cuando el motor está detenido no debe interpretarse automáticamente como misfire o avería."
      ],
      [
        "Separar estados operativos",
        "Diferenciá motor parado, arranque, ralentí y carga con marcas temporales y condiciones de habilitación del monitor. Una falla de combustión debe investigarse durante el estado en que el controlador realmente espera combustión y dispone de un monitor aplicable."
      ],
      [
        "No usar el tren HV para explicar señales sin evidencia",
        "Una práctica de misfire sintético no autoriza acceso a batería de tracción o inversor. Los procedimientos HV requieren capacitación, instrumentos y reglas del fabricante; el aprendizaje se realiza con bancos y datos sin energía peligrosa."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
export const misfireQuestions=[
  {
    "id": "misfire-q-motor-1",
    "topic": "motor",
    "question": "Un registro P0302 demuestra que la bobina del cilindro 2 está averiada:",
    "options": [
      "No, solo orienta a un monitor de fallas asociado al cilindro",
      "Sí, siempre",
      "Sí, si hay cuatro cilindros",
      "Solo si el auto es híbrido"
    ],
    "answer": 0,
    "explanation": "Un código del monitor no discrimina entre encendido, suministro, problemas mecánicos y otros orígenes. Son necesarias pruebas independientes.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "misfire-q-motor-2",
    "topic": "motor",
    "question": "¿Qué aporta una prueba de descarte adicional después de confirmar un circuito de bobina sin corriente?",
    "options": [
      "Reducir la ambigüedad frente a otra hipótesis",
      "Eliminar la necesidad de contexto",
      "Hacer que el monitor sea OEM",
      "Garantizar estado mecánico completo"
    ],
    "answer": 0,
    "explanation": "Una comparación independiente, por ejemplo con el circuito del inyector, ayuda a limitar alternativas sin presuponer que hay una sola falla posible.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "misfire-q-electricidad-1",
    "topic": "electricidad",
    "question": "Un pulso lógico de mando de bobina sin corriente primaria demuestra necesariamente chispa:",
    "options": [
      "No; una orden no garantiza flujo de corriente ni descarga secundaria",
      "Sí, siempre",
      "Sí, si dura 1 ms",
      "Solo si el DTC es P0300"
    ],
    "answer": 0,
    "explanation": "La corriente primaria y la descarga secundaria son fenómenos distintos de un comando lógico. El esquema y las condiciones definen su interpretación.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/primary-ignition-timing-vs.-injector-current/AGT-391-injector-current-vs-primary-ignition/"
  },
  {
    "id": "misfire-q-electricidad-2",
    "topic": "electricidad",
    "question": "Para comparar circuitos primarios de dos cilindros, lo importante es:",
    "options": [
      "Utilizar misma referencia temporal, polaridad, topología y condición de prueba",
      "Ignorar tensión de alimentación",
      "Conectar una masa del instrumento a HV sin autorización",
      "Cambiar el equipo para que coincida el resultado"
    ],
    "answer": 0,
    "explanation": "Las comparaciones requieren referencias y condiciones equivalentes. No se improvisa la instrumentación de sistemas de encendido.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/primary-ignition-timing-vs.-injector-current/AGT-391-injector-current-vs-primary-ignition/"
  },
  {
    "id": "misfire-q-senales-1",
    "topic": "senales",
    "question": "Una compresión relativa baja identifica automáticamente la presión real en psi:",
    "options": [
      "No, refleja una diferencia relativa que necesita confirmación",
      "Sí, basta con multiplicar por RPM",
      "Sí, si la corriente es alta",
      "Solo si el monitor es P0301"
    ],
    "answer": 0,
    "explanation": "La corriente del motor de arranque sirve como indicador comparativo de carga; no equivale a una medición calibrada de presión en cilindro.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "misfire-q-senales-2",
    "topic": "senales",
    "question": "¿Qué falta para atribuir correctamente un pico de corriente de arranque a un cilindro específico?",
    "options": [
      "Sincronización o referencia de fase válida",
      "Un PID genérico de presión",
      "Un sensor Bluetooth",
      "La versión del VIN"
    ],
    "answer": 0,
    "explanation": "Sin referencia sincronizada, la secuencia comparativa de picos puede desplazarse entre cilindros y no determinar la numeración con fiabilidad.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "misfire-q-redes-1",
    "topic": "redes",
    "question": "¿Por qué no basta con leer contadores P030x?",
    "options": [
      "El controlador publica inferencias, no mediciones independientes de combustión",
      "Todos los módulos transmiten presión interna",
      "CAN determina la causa física sin sensores",
      "Los DTC solo aparecen con batería HV"
    ],
    "answer": 0,
    "explanation": "El resultado de un monitor es una inferencia de la ECU. Para discriminar causas hacen falta contexto, información del fabricante y mediciones adicionales.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "misfire-q-redes-2",
    "topic": "redes",
    "question": "Un freeze frame es útil porque suele aportar:",
    "options": [
      "Condiciones de operación en las que se registró un evento",
      "Una bobina nueva",
      "La presión mecánica real medida por CAN",
      "Un procedimiento universal de reparación"
    ],
    "answer": 0,
    "explanation": "La instantánea de diagnóstico puede registrar parámetros y condiciones, aunque disponibilidad y contenido dependen del sistema.",
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test"
  },
  {
    "id": "misfire-q-ev-1",
    "topic": "ev",
    "question": "Un motor térmico detenido voluntariamente en un HEV debe interpretarse como misfire:",
    "options": [
      "No: primero se identifica el estado operativo previsto del vehículo",
      "Sí, siempre",
      "Sí, si no hay pulsos de inyección",
      "Sí, cuando el SOC es alto"
    ],
    "answer": 0,
    "explanation": "Una estrategia híbrida puede apagar el motor deliberadamente. La evaluación de combustión requiere condiciones en que se espere combustión y el monitor esté habilitado.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "misfire-q-ev-2",
    "topic": "ev",
    "question": "Estudiar P0300 en un banco virtual habilita a intervenir el inversor HV:",
    "options": [
      "No, la intervención HV requiere formación y procedimientos específicos",
      "Sí, con examen teórico aprobado",
      "Sí, si se desconecta el cable naranja",
      "Solo si el monitor tiene datos de RPM"
    ],
    "answer": 0,
    "explanation": "La interpretación de datos del motor de combustión no valida ausencia de tensión, aislamiento ni capacitación para trabajo HV.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
