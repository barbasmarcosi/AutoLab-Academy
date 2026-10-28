/** MC10–MC14 initial systems/engineering research learning bridge: not a certification. */
export const engineeringBridgeLessons=[
  {
    "id": "mc10-electronic-architecture",
    "topic": "motor",
    "title": "MC10 — Arquitectura eléctrica, sensores, drivers y redes",
    "minutes": 51,
    "url": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/",
    "sections": [
      [
        "Energía, referencia y carga",
        "La alimentación eléctrica y la referencia de masa son condiciones para que una ECU opere de manera repetible. Medir tensión sin corriente ni carga puede ocultar resistencias de contacto; la caída bajo carga ofrece un experimento más discriminante que intercambiar componentes."
      ],
      [
        "Sensores y acondicionamiento",
        "Una lectura digital resulta de un fenómeno físico, sensor, excitación, cableado, filtrado, conversión y software. Una señal plausible fuera de contexto puede ser incorrecta; comparar canales independientes y condiciones de funcionamiento reduce falsos diagnósticos."
      ],
      [
        "Actuadores y potencia",
        "Inyectores, solenoides y motores combinan dinámica eléctrica y mecánica. Las formas de onda de control pueden mostrar mando, corriente y reacciones de carga, pero la presencia de comando no demuestra movimiento mecánico correcto ni caudal efectivo."
      ],
      [
        "Redes y aislamiento",
        "CAN y LIN intercambian mensajes entre nodos; una pérdida de comunicación puede deberse a alimentación, referencia, topología, fallas físicas o software. Un DTC de red no identifica automáticamente el ramal o módulo culpable. Solo se estudia lectura pasiva y banco simulado, sin escribir comandos en vehículos reales."
      ]
    ]
  },
  {
    "id": "mc11-engine-control",
    "topic": "motor",
    "title": "MC11 — ECU e inyección: control y observabilidad",
    "minutes": 54,
    "url": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/",
    "sections": [
      [
        "Medida, consigna y corrección",
        "Un lazo de control usa sensores, estimaciones, actuadores y consignas. Las correcciones de combustible son respuesta del sistema a discrepancias percibidas y no miden directamente fugas, presión o estado de los inyectores."
      ],
      [
        "Plausibilidad cruzada",
        "MAF, MAP, posición de acelerador, lambda, temperatura y régimen describen perspectivas distintas del motor. Contrastar variables bajo la misma carga permite distinguir errores de señal, límites del modelo y perturbaciones reales."
      ],
      [
        "Tránsito e intermitencia",
        "Un monitor puede registrar DTC después de una secuencia de condiciones, y no cuando ocurre la causa. Las capturas temporales multi-canal ayudan a separar simultaneidad y causalidad, conservando marcas de tiempo y procedencia."
      ],
      [
        "Calibración con restricciones",
        "Cambiar mapas de ECU para ganar potencia sin conocer límites mecánicos, temperaturas, emisiones y homologación no es experimentación responsable. AutoLab usa escenarios virtuales y criterios fail-closed; la habilidad de evaluar hipótesis no autoriza programar ECUs de producción."
      ]
    ]
  },
  {
    "id": "mc12-hybrid-energy",
    "topic": "motor",
    "title": "MC12 — Arquitecturas híbridas, EV, BMS y seguridad HV",
    "minutes": 57,
    "url": "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles",
    "sections": [
      [
        "Topologías y flujo de energía",
        "BEV, híbridos en serie, paralelo y combinados tienen rutas energéticas distintas. Un extensor de autonomía genera electricidad o sostiene demanda según arquitectura; no debe confundirse con motor auxiliar acoplado mecánicamente a las ruedas."
      ],
      [
        "Regeneración y freno mecánico",
        "La máquina eléctrica puede funcionar como generador y recuperar parte de energía durante desaceleración; límites de carga, temperatura, velocidad y adherencia condicionan la regeneración disponible. Los frenos de fricción siguen siendo necesarios en múltiples situaciones."
      ],
      [
        "Estimaciones de batería",
        "SOC es una estimación del estado de carga, SOH representa degradación en distintos criterios y SOP limita potencia disponible. Un voltaje aislado no determina estas variables sin modelo, temperatura, historia y medidas de corriente."
      ],
      [
        "Alta tensión y límites de competencia",
        "Contactores abiertos o un panel apagado no prueban ausencia de energía residual. La batería de tracción requiere capacitación específica, protección y equipos adecuados según OEM; un simulador web no habilita intervenir paquetes o inversores ni sustituye procedimientos de rescate."
      ]
    ]
  },
  {
    "id": "mc13-diagnostic-method",
    "topic": "motor",
    "title": "MC13 — Investigación causal y descarte de hipótesis",
    "minutes": 53,
    "url": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/",
    "sections": [
      [
        "Síntoma no es diagnóstico",
        "Un código DTC indica que un monitor detectó una condición conforme a su estrategia, no identifica por sí solo la pieza a sustituir. La investigación debe separar relato, reproducción, síntomas observados y explicaciones alternativas."
      ],
      [
        "Diseño de pruebas discriminantes",
        "Una prueba útil produce pronósticos distintos para dos hipótesis y posee procedencia, unidad, precisión y condición de ensayo. Si dos causas explican el mismo síntoma, una lectura compartida no aporta identificación adicional."
      ],
      [
        "Riesgo, costo e información",
        "Priorizá observaciones seguras, de bajo costo y alta capacidad discriminante antes de desarmar. Una prueba peligrosa que aumenta información teórica no necesariamente es permisible: la seguridad puede requerir detener el trabajo."
      ],
      [
        "Conclusión proporcional a evidencia",
        "El expediente profesional conserva hipótesis inicial, pruebas, resultados, descarte de alternativas, incertidumbre y verificación final. Si la información no distingue causas, la respuesta correcta es declarar el límite y proponer una prueba adicional."
      ]
    ]
  },
  {
    "id": "mc14-research-doe",
    "topic": "motor",
    "title": "MC14 — Diseño experimental, optimización y herramientas propias",
    "minutes": 60,
    "url": "https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm",
    "sections": [
      [
        "Pregunta de ingeniería medible",
        "Un proyecto de investigación comienza con una variable respuesta, una línea de base, factores candidatos, restricciones y criterios de éxito. La pregunta '¿mejoró?' no es evaluable sin definir cuánto, en qué condiciones y con qué incertidumbre."
      ],
      [
        "Control de variables y confusores",
        "Cambiar varios parámetros simultáneamente impide adjudicar resultados a uno solo. Aleatorización, bloqueo, réplicas y diseños factoriales sirven para estimar efectos e interacciones y controlar fuentes conocidas de variación."
      ],
      [
        "Instrumentación y validez",
        "Antes de fabricar un equipo de medición propio se especifican magnitud, rango, resolución, trazabilidad prevista, calibración y comparadores. Un prototipo que dibuja curvas atractivas sin referencias independientes no demuestra exactitud ni repetibilidad."
      ],
      [
        "Validación adversarial y límites",
        "El informe diferencia modelo ideal, simulación numérica, datos sintéticos y ensayo físico. Una mejora reproducible debe resistir factores de confusión, comparación independiente, pruebas negativas y criterios de seguridad; no se publica como optimización de motor por una ganancia calculada en un modelo simplificado."
      ]
    ]
  }
];
export const engineeringBridgeQuestions=[
  {
    "id": "mc10-v1-a",
    "topic": "motor",
    "question": "Una tensión de alimentación correcta sin carga demuestra que un circuito puede suministrar corriente?",
    "options": [
      "Sí, de forma concluyente",
      "Solo si un testigo está prendido",
      "No: comprobar caída bajo carga puede revelar resistencia serie",
      "Sí, si el conector tiene colores correctos"
    ],
    "answer": 2,
    "explanation": "La medida abierta no caracteriza pérdidas bajo corriente real.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc10-v1-b",
    "topic": "motor",
    "question": "Un actuador muestra pulso de comando: qué se demostró?",
    "options": [
      "Que existe una orden, no necesariamente movimiento mecánico",
      "Que pasó suficiente combustible",
      "Que no hay fricción",
      "Que el inyector funciona siempre"
    ],
    "answer": 0,
    "explanation": "Mando eléctrico y efecto mecánico deben evaluarse por separado.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc10-v1-c",
    "topic": "motor",
    "question": "Una ECU registra timeout CAN. Qué es correcto?",
    "options": [
      "Cambiar de inmediato gateway",
      "Desactivar la red",
      "Aumentar terminación sin medir",
      "Verificar alimentación, topología y señal física antes de atribuir módulo"
    ],
    "answer": 3,
    "explanation": "El timeout no distingue por sí solo entre red, fuente y participantes.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc10-v1-d",
    "topic": "motor",
    "question": "Un sensor plausible pero contradictorio con otra referencia indica:",
    "options": [
      "Que la referencia está siempre mal",
      "Que conviene comparar ambas fuentes con condiciones controladas",
      "Que todos los sensores se reemplazan",
      "Que no se puede investigar"
    ],
    "answer": 1,
    "explanation": "La plausibilidad cruzada es más fuerte que una sola lectura.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc11-v1-a",
    "topic": "motor",
    "question": "Los fuel trims representan principalmente:",
    "options": [
      "Corrección del control de mezcla, no diagnóstico único de una pieza",
      "Fuga mecánica medida directamente",
      "Presión exacta de combustible",
      "Potencia efectiva"
    ],
    "answer": 0,
    "explanation": "La ECU reacciona a mediciones/estimaciones y condiciones de control.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc11-v1-b",
    "topic": "motor",
    "question": "La presencia de DTC luego de una falla intermitente garantiza la hora exacta de inicio de la causa?",
    "options": [
      "Sí",
      "Depende de nivel de combustible solo",
      "No, hay condiciones de monitoreo y almacenamiento",
      "Siempre coincide con arranque"
    ],
    "answer": 2,
    "explanation": "Monitor y registro pueden ocurrir tiempo después del evento causal.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc11-v1-c",
    "topic": "motor",
    "question": "Para investigar una mezcla anómala se compara:",
    "options": [
      "Únicamente RPM",
      "Solo temperatura exterior",
      "Solo código OBD",
      "MAF, MAP, lambda, carga y condiciones de operación"
    ],
    "answer": 3,
    "explanation": "Las variables cruzadas discriminan causas diferentes.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc11-v1-d",
    "topic": "motor",
    "question": "Una calibración ECU con más potencia calculada y sin límites térmicos/emisiones:",
    "options": [
      "Ya está validada",
      "Es una propuesta incompleta que no debe aplicarse a un auto real",
      "Prueba eficiencia superior",
      "Puede escribirse sin autorización"
    ],
    "answer": 1,
    "explanation": "El control necesita restricciones físicas, ambientales y legales.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc12-v1-a",
    "topic": "motor",
    "question": "Un automóvil BEV usa de forma principal:",
    "options": [
      "Motor térmico para mover ruedas",
      "Volante de inercia puro",
      "Energía de batería y máquina eléctrica para propulsión",
      "Solo aire comprimido"
    ],
    "answer": 2,
    "explanation": "Un BEV obtiene energía de batería de tracción e impulsa motores eléctricos.",
    "source": "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles"
  },
  {
    "id": "mc12-v1-b",
    "topic": "motor",
    "question": "La regeneración de energía durante frenado:",
    "options": [
      "Está limitada por estado de batería, temperatura y otras condiciones",
      "Elimina frenos de fricción",
      "Puede recuperar más de toda la energía cinética",
      "Siempre opera al máximo"
    ],
    "answer": 0,
    "explanation": "La recuperación depende de potencia admisible y arquitectura híbrida.",
    "source": "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles"
  },
  {
    "id": "mc12-v1-c",
    "topic": "motor",
    "question": "Un pack HV con contacto principal abierto:",
    "options": [
      "No puede tener energía",
      "Es seguro tocarlo",
      "Queda con SOC necesariamente cero",
      "Puede conservar energía y necesita procedimiento profesional"
    ],
    "answer": 3,
    "explanation": "Un contacto abierto no equivale a ausencia de energía almacenada.",
    "source": "https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles"
  },
  {
    "id": "mc12-v1-d",
    "topic": "motor",
    "question": "Una lectura de voltaje única determina SOH?",
    "options": [
      "Sí, para cualquier química",
      "No, requiere historial, temperatura, capacidad/potencia y modelo",
      "Sí, si se carga completo",
      "Solo en una batería vieja"
    ],
    "answer": 1,
    "explanation": "SOH es un estado estimado y dependiente de definición y pruebas.",
    "source": "https://www.nature.com/articles/s44359-024-00020-2"
  },
  {
    "id": "mc13-v1-a",
    "topic": "motor",
    "question": "Un DTC que menciona un sensor permite:",
    "options": [
      "Reemplazarlo sin más evidencia",
      "Anular pruebas de cableado",
      "Empezar una hipótesis, no confirmar la pieza",
      "Descartar toda falla mecánica"
    ],
    "answer": 2,
    "explanation": "Código y causa no son equivalentes.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc13-v1-b",
    "topic": "motor",
    "question": "Una prueba discriminante ideal:",
    "options": [
      "Predice resultados diferentes para hipótesis alternativas",
      "Da siempre el mismo valor",
      "Requiere desmontaje obligatorio",
      "Se realiza sin riesgos evaluados"
    ],
    "answer": 0,
    "explanation": "El contraste entre predicciones convierte medición en información.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc13-v1-c",
    "topic": "motor",
    "question": "Con datos que no distinguen dos causas, corresponde:",
    "options": [
      "Declarar que ambas están rotas",
      "Seleccionar la reparación más cara",
      "Cambiar partes al azar",
      "Informar incertidumbre y proponer un ensayo seguro adicional"
    ],
    "answer": 3,
    "explanation": "La conclusión debe ser proporcional a la evidencia disponible.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc13-v1-d",
    "topic": "motor",
    "question": "Una prueba peligrosa pero muy informativa:",
    "options": [
      "Siempre debe ejecutarse",
      "Debe descartarse si no puede controlarse el riesgo",
      "Reemplaza habilitación HV",
      "Sirve para garantizar aprobación"
    ],
    "answer": 1,
    "explanation": "Seguridad condiciona el espacio de pruebas posibles.",
    "source": "https://ap.boschcarservice.com/in/en/car-services/car-diagnostics/"
  },
  {
    "id": "mc14-v1-a",
    "topic": "motor",
    "question": "En diseño experimental la variable respuesta es:",
    "options": [
      "Marca de automóvil",
      "El nombre del programador",
      "La magnitud cuyo cambio se pretende medir",
      "La fecha de la publicación"
    ],
    "answer": 2,
    "explanation": "La variable respuesta define la medida objetivo.",
    "source": "https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm"
  },
  {
    "id": "mc14-v1-b",
    "topic": "motor",
    "question": "Cambiar varios factores juntos sin diseño adecuado produce:",
    "options": [
      "Confusión que impide atribuir efectos individuales",
      "Causalidad perfecta",
      "Eliminación del sesgo de selección",
      "Trazabilidad metrológica automática"
    ],
    "answer": 0,
    "explanation": "Sin control o diseño factorial los efectos pueden confundirse.",
    "source": "https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm"
  },
  {
    "id": "mc14-v1-c",
    "topic": "motor",
    "question": "Una herramienta propia con lectura muy repetible pero sesgo desconocido:",
    "options": [
      "Está calibrada",
      "Tiene error cero",
      "Está certificada por el repositorio",
      "No acredita exactitud aunque repita valores"
    ],
    "answer": 3,
    "explanation": "Repetibilidad no garantiza ausencia de sesgo ni trazabilidad.",
    "source": "https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm"
  },
  {
    "id": "mc14-v1-d",
    "topic": "motor",
    "question": "Un resultado favorable en un modelo geométrico ideal permite concluir:",
    "options": [
      "Aumento real de eficiencia",
      "Solo una predicción del modelo, a validar con ensayos",
      "Homologación automática",
      "Reducción garantizada de emisiones"
    ],
    "answer": 1,
    "explanation": "Extrapolar de cálculo a comportamiento real requiere mediciones independientes.",
    "source": "https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm"
  }
];
