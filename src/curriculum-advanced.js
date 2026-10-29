// Additional original educational material. Contextual sources support concepts, not synthetic scenarios.
export const additionalLessons=[
  {
    "id": "ground-test",
    "topic": "electricidad",
    "title": "Masas, terminales y resistencia de contacto",
    "minutes": 28,
    "sections": [
      [
        "La falla bajo carga",
        "Un contacto con resistencia adicional puede mostrar caída casi nula cuando no circula corriente; en el circuito ficticio de 12 V la caída es ΔV = I × R, comparando los dos extremos del mismo tramo y una condición de demanda estable. Esto no demuestra por sí solo sulfato, ni identifica componente físico."
      ],
      [
        "Localización progresiva",
        "Compará tramos positivo, retorno y carga, sin asumir que una lectura aislada identifica la falla. Una resistencia de contacto y una demanda de carga distinta pueden cambiar voltajes similares; las predicciones discriminantes requieren misma condición de fuente y referencia."
      ],
      [
        "Informe reproducible",
        "En el simulador de baja tensión documentá modelo, extremos identificados, corriente, condición y observables que refutan la hipótesis. Nunca desconectes masas críticas durante funcionamiento, ni puentes protecciones; estos valores sintéticos no constituyen un ensayo vehicular."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "sensor-reference",
    "topic": "electricidad",
    "title": "Alimentación de sensores, referencia y masa",
    "minutes": 30,
    "sections": [
      [
        "Separar las tres variables",
        "Un sensor analógico suele requerir alimentación o referencia, retorno de masa y salida. Una señal incoherente no prueba un sensor averiado: una caída de masa desplaza la lectura observada."
      ],
      [
        "Comparar con una referencia",
        "Comprobá tensión en el conector frente a una referencia confiable, con el circuito en condiciones definidas y según manual del sistema. No asumás que todos los sensores tienen exactamente 5 V."
      ],
      [
        "Prueba antes de reemplazo",
        "Contrastá salida, alimentación y retorno mientras simulás condiciones permitidas de funcionamiento. La documentación OEM debe definir rangos y configuración del sensor."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "fuel-trims",
    "topic": "motor",
    "title": "STFT y LTFT: corrección no equivale a causa",
    "minutes": 32,
    "sections": [
      [
        "Lectura de los ajustes",
        "En un sistema con control de mezcla en lazo cerrado, corrección positiva suele indicar que la ECU añade combustible al cálculo base. El ajuste describe una reacción del control; no demuestra si existe una fuga, restricción, sensor o presión incorrecta."
      ],
      [
        "Patrones comparativos",
        "Compará condiciones de ralentí, carga y temperatura. Una corrección elevada a ralentí que se reduce con más flujo puede orientar a aire no medido; no reemplaza una prueba de estanqueidad."
      ],
      [
        "Confirmación",
        "Registrá freeze-frame, combustible, temperatura, MAP/MAF y la respuesta del sensor de oxígeno o lambda. Documentá la prueba que falsaría cada hipótesis."
      ]
    ],
    "url": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "dtc-method",
    "topic": "motor",
    "title": "Método de diagnóstico: DTC, hipótesis y causa raíz",
    "minutes": 30,
    "sections": [
      [
        "El código es un disparador",
        "El DTC registra que el monitor cumplió una condición. Puede almacenarse por fallas eléctricas, mecánicas o por consecuencias de otro subsistema; cambiar el componente nombrado no es un diagnóstico."
      ],
      [
        "Armar hipótesis",
        "Ordená síntomas, circunstancias, fallas activas e históricas, valores de parámetros y documentación. Diseñá una prueba de bajo riesgo que permita discriminar entre las causas probables."
      ],
      [
        "Cerrar el caso",
        "Realizá una corrección justificada y volvé a verificar bajo las condiciones que provocaban la anomalía. Un código borrado sin prueba de resolución no es evidencia suficiente."
      ]
    ],
    "url": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "pwm-scope",
    "topic": "senales",
    "title": "PWM y disparo: leer amplitud, período y duty",
    "minutes": 28,
    "sections": [
      [
        "Tres variables distintas",
        "En una forma de onda cuadrada diferenciá amplitud, período y fracción de tiempo activo. Un PWM de 2 ms de activación dentro de 5 ms de período tiene 40% de duty, independientemente de la frecuencia de actualización."
      ],
      [
        "Elegir escalas",
        "Usá base de tiempos que muestre varios ciclos y disparo estable. La conexión de sondas y sus límites depende del equipo: los osciloscopios de mesa referidos a tierra no admiten puntos arbitrarios del vehículo."
      ],
      [
        "Interpretación",
        "Compará duty solicitado y medido, alimentación del actuador y condiciones de carga. La amplitud normal no garantiza un actuador funcional; la curva informa sobre la señal, no sobre todas las consecuencias mecánicas."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "ckp-cmp",
    "topic": "senales",
    "title": "CKP, CMP y sincronización del motor",
    "minutes": 35,
    "sections": [
      [
        "Señales complementarias",
        "El CKP permite inferir posición y velocidad del cigüeñal; CMP ayuda a identificar fase de árbol de levas. Su relación depende del motor y del patrón de rueda fónica."
      ],
      [
        "Ruedas con dientes ausentes",
        "Una rueda de 60 posiciones con 2 ausentes genera 58 eventos por vuelta; la pausa es intencional. Contá eventos y verificá configuración antes de convertir frecuencia a RPM."
      ],
      [
        "Diagnóstico por correlación",
        "Una captura de CKP y CMP debe incluir RPM, condición de arranque y referencias OEM. Un desplazamiento aparente puede deberse a la adquisición, al cableado o a la distribución mecánica y exige confirmación."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "physical-can",
    "topic": "redes",
    "title": "CAN físico: terminación y alimentación de nodos",
    "minutes": 35,
    "sections": [
      [
        "La red es un sistema",
        "Una ECU que no responde puede estar sin alimentación aunque el bus esté eléctricamente correcto. Revisar fusibles, masas y topología evita sustituciones injustificadas."
      ],
      [
        "Terminación nominal",
        "En un montaje de alta velocidad típico con dos resistencias de 120 Ω en paralelo, la resistencia resultante es alrededor de 60 Ω con el sistema apagado y aislado conforme al procedimiento. No todas las redes tienen esa topología."
      ],
      [
        "Captura segura",
        "Usá escuchas pasivas en entornos autorizados. La calidad de trama, errores y temporización requieren analizador adecuado, esquema y condiciones conocidas. No enviar tramas arbitrarias a un vehículo en servicio."
      ]
    ],
    "url": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "uds-nrc",
    "topic": "redes",
    "title": "UDS, sesiones y respuestas negativas",
    "minutes": 32,
    "sections": [
      [
        "Diagnóstico por servicios",
        "UDS define intercambios de petición/respuesta entre cliente y ECU; la disponibilidad depende de la sesión, seguridad y fabricante. Un código OBD genérico y un identificador UDS no son intercambiables."
      ],
      [
        "Interpretar un NRC",
        "La respuesta negativa con NRC 0x78 significa que la ECU informa que sigue procesando la petición; no demuestra pérdida de comunicación. Otros NRC identifican condiciones distintas."
      ],
      [
        "Práctica en archivos",
        "Analizá trazas o mensajes sintéticos. Operaciones de escritura, flasheo, acceso protegido y seguridad funcional requieren autorización y conocimiento OEM: la academia no las ejecuta."
      ]
    ],
    "url": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "bms-calibration",
    "topic": "ev",
    "title": "SOC, observabilidad y errores acumulados",
    "minutes": 36,
    "sections": [
      [
        "La corriente integrada deriva",
        "Integrar corriente equivale a sumar carga entrante o saliente. Si existe un offset estable en el sensor, su error se integra durante el tiempo, incluso con una batería físicamente estable."
      ],
      [
        "No hay lectura perfecta",
        "El SOC inicial es una condición de partida y la capacidad efectiva puede cambiar por temperatura, edad y corriente. Un estimador de coulomb counting necesita correcciones con información complementaria."
      ],
      [
        "Separar medida y estimación",
        "Registrá supuestos, polaridad, intervalo de integración y curva de referencia. SOC calculado sin química, calibración o modelo comprobado es un resultado matemático, no un diagnóstico HV."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "hv-safety",
    "topic": "ev",
    "title": "Arquitectura HEV/EV y límites de intervención HV",
    "minutes": 35,
    "sections": [
      [
        "Componentes principales",
        "Una arquitectura eléctrica puede incluir batería de tracción, BMS, inversor, motor, convertidor DC/DC, cargador a bordo y circuitos auxiliares. Sus relaciones difieren entre vehículos híbridos y eléctricos."
      ],
      [
        "La seguridad es procedimental",
        "Bloqueo, identificación, aislamiento y ausencia de tensión exigen entrenamiento, equipo y procedimientos específicos. Un diagrama o un examen online no habilitan manipulación de partes de alta tensión."
      ],
      [
        "Práctica permitida",
        "Aprendé con datos simulados, diagramas desenergizados y software de análisis. Reservá la intervención real de sistemas HV para formación acreditada y trabajo supervisado según normativa local y fabricante."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
export const additionalQuestions=[
  {
    "id": "adv-electricidad-01",
    "topic": "electricidad",
    "question": "¿Por qué puede ser engañoso medir continuidad en una masa sin carga?",
    "options": [
      "La resistencia de contacto puede manifestarse al circular corriente",
      "El multímetro convierte CC en CA",
      "La ECU anula la ley de Ohm",
      "La batería siempre compensa cualquier resistencia"
    ],
    "answer": 0,
    "explanation": "Un conductor de resistencia anormal puede mostrar continuidad y, sin embargo, perder tensión bajo una carga significativa.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-electricidad-02",
    "topic": "electricidad",
    "question": "¿Qué se necesita para cuantificar una caída de tensión de un conector?",
    "options": [
      "Solo medir la batería en reposo",
      "Medir ambos extremos del tramo durante la circulación de corriente",
      "Leer únicamente el DTC",
      "Desconectar toda referencia de masa en funcionamiento"
    ],
    "answer": 1,
    "explanation": "La caída es la diferencia de potencial entre extremos del componente mientras conduce corriente.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-electricidad-03",
    "topic": "electricidad",
    "question": "Un circuito tiene 20 A y una resistencia parásita de 0,05 Ω. ¿Qué caída corresponde?",
    "options": [
      "0,1 V",
      "1 V",
      "10 V",
      "20 V"
    ],
    "answer": 1,
    "explanation": "Por la ley de Ohm: 20 A × 0,05 Ω = 1 V de caída en ese tramo cuando circula la corriente indicada.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-electricidad-04",
    "topic": "electricidad",
    "question": "Si la señal de un sensor es anómala, ¿qué conviene verificar antes de reemplazarlo?",
    "options": [
      "Referencia, masa, señal y condiciones de funcionamiento",
      "Únicamente la pintura del cable",
      "Solo el estado de neumáticos",
      "Que el escáner tenga Bluetooth"
    ],
    "answer": 0,
    "explanation": "Alimentación y retorno alterados pueden explicar una señal incoherente.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-electricidad-05",
    "topic": "electricidad",
    "question": "¿Por qué no debe aumentarse el calibre de un fusible para evitar disparos?",
    "options": [
      "Porque cambiará la frecuencia CAN",
      "Porque se elimina parte de la protección contra sobrecorriente",
      "Porque disminuye el octanaje",
      "Porque altera la química de batería"
    ],
    "answer": 1,
    "explanation": "El fusible protege conductores y cargas; aumentar el calibre sin rediseño autorizado introduce riesgo.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-electricidad-06",
    "topic": "electricidad",
    "question": "¿Qué significa encontrar voltaje en una conexión resistiva bajo carga?",
    "options": [
      "Que necesariamente falla el sensor CKP",
      "Que circula corriente y existe una caída asociada al tramo",
      "Que la frecuencia del alternador es cero",
      "Que es imposible una mala masa"
    ],
    "answer": 1,
    "explanation": "Una resistencia atravesada por corriente produce una diferencia de potencial.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-motor-01",
    "topic": "motor",
    "question": "Un STFT positivo sostenido suele representar:",
    "options": [
      "Corrección hacia la adición de combustible",
      "Desconexión de la ECU",
      "Velocidad del motor constante",
      "Reparación certificada del inyector"
    ],
    "answer": 0,
    "explanation": "En control de mezcla de lazo cerrado, el ajuste positivo representa una corrección de combustible.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-motor-02",
    "topic": "motor",
    "question": "Una corrección elevada en ralentí que cae con carga puede orientar primero a:",
    "options": [
      "Entrada de aire no medida; debe confirmarse",
      "Falla comprobada del inversor HV",
      "Cable CAN necesariamente cortado",
      "Error inevitable del software OEM"
    ],
    "answer": 0,
    "explanation": "La influencia relativa de aire no medido puede disminuir al aumentar el flujo, pero requiere una prueba específica.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-motor-03",
    "topic": "motor",
    "question": "¿Qué describe un DTC por sí mismo?",
    "options": [
      "La pieza exacta para comprar",
      "La condición que activó el monitor diagnóstico",
      "El torque del tornillo",
      "Un procedimiento completo de reparación"
    ],
    "answer": 1,
    "explanation": "El código identifica una condición supervisada, no toda la cadena causal.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-motor-04",
    "topic": "motor",
    "question": "¿Qué registro ayuda a reconstruir las condiciones del momento del DTC?",
    "options": [
      "Freeze frame",
      "Capacidad nominal del tanque exclusivamente",
      "Color de carrocería",
      "Modelo del teléfono"
    ],
    "answer": 0,
    "explanation": "La instantánea de parámetros ayuda a situar cuándo y bajo qué condiciones se detectó la anomalía.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-motor-05",
    "topic": "motor",
    "question": "Al reemplazar una pieza, ¿qué permite sostener que la falla fue resuelta?",
    "options": [
      "Borrar el código",
      "Repetir la condición y verificar parámetros/monitores",
      "Desconectar la batería y dar por cerrado",
      "Afirmar que es probable"
    ],
    "answer": 1,
    "explanation": "La reparación se valida reproduciendo y controlando el comportamiento bajo condiciones relevantes.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-motor-06",
    "topic": "motor",
    "question": "¿Por qué conviene verificar presión de combustible ante una mezcla anómala?",
    "options": [
      "Porque una condición hidráulica puede explicar correcciones de mezcla",
      "Porque regula los bits CAN",
      "Porque mide resistencia HV",
      "Porque programa el inmovilizador"
    ],
    "answer": 0,
    "explanation": "El sistema de combustible puede afectar las condiciones que el control de mezcla intenta corregir.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro"
  },
  {
    "id": "adv-senales-01",
    "topic": "senales",
    "question": "Un pulso está activo 2 ms en un período de 8 ms. Duty:",
    "options": [
      "15%",
      "25%",
      "50%",
      "75%"
    ],
    "answer": 1,
    "explanation": "El duty representa la fracción activa del período: 2 ms / 8 ms × 100 = 25%, independientemente de la amplitud.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-senales-02",
    "topic": "senales",
    "question": "Un período de 5 ms corresponde aproximadamente a:",
    "options": [
      "20 Hz",
      "200 Hz",
      "2000 Hz",
      "5 Hz"
    ],
    "answer": 1,
    "explanation": "5 ms = 0,005 s; frecuencia = 1/0,005 = 200 Hz.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-senales-03",
    "topic": "senales",
    "question": "¿Qué aporta un trigger estable al osciloscopio?",
    "options": [
      "Sincroniza visualización con un evento elegido",
      "Eleva el SOC",
      "Ajusta la viscosidad del aceite",
      "Aísla físicamente la batería HV"
    ],
    "answer": 0,
    "explanation": "El disparo determina la condición temporal de inicio de adquisición/visualización.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-senales-04",
    "topic": "senales",
    "question": "Una rueda de 60 posiciones con 2 ausentes produce por vuelta:",
    "options": [
      "60 eventos físicos",
      "58 eventos físicos",
      "30 eventos",
      "2 eventos"
    ],
    "answer": 1,
    "explanation": "Existen 58 dientes presentes por vuelta; el hueco es un marcador de sincronización.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-senales-05",
    "topic": "senales",
    "question": "¿Por qué una captura de CKP sin RPM de referencia puede ser insuficiente?",
    "options": [
      "Porque la periodicidad cambia con la velocidad del motor",
      "Porque CKP solo se usa en neumáticos",
      "Porque todas las ECUs producen la misma onda",
      "Porque el tiempo no importa"
    ],
    "answer": 0,
    "explanation": "La relación frecuencia/posición debe interpretarse junto con régimen y patrón de rueda.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-senales-06",
    "topic": "senales",
    "question": "¿Qué riesgo tiene unir la masa de un osciloscopio de mesa a un punto arbitrario?",
    "options": [
      "Ninguno",
      "Puede crear un camino a tierra peligroso o un cortocircuito",
      "Mejora la precisión en todos los casos",
      "Corrige el DTC automáticamente"
    ],
    "answer": 1,
    "explanation": "Instrumentos referidos a tierra requieren evaluación de la conexión y las sondas.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "adv-redes-01",
    "topic": "redes",
    "question": "Dos resistencias terminales de 120 Ω en paralelo equivalen nominalmente a:",
    "options": [
      "240 Ω",
      "120 Ω",
      "60 Ω",
      "30 Ω"
    ],
    "answer": 2,
    "explanation": "Resistencias iguales en paralelo: 120/2 = 60 Ω.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-redes-02",
    "topic": "redes",
    "question": "¿Puede un nodo sin alimentación generar un DTC de pérdida de comunicación en otro módulo?",
    "options": [
      "Sí, la alimentación del nodo es una hipótesis",
      "No, siempre es terminación",
      "No, siempre es seguridad UDS",
      "Solo cuando el motor está apagado"
    ],
    "answer": 0,
    "explanation": "Una ECU apagada puede desaparecer de la red aun si otros nodos intercambian mensajes.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-redes-03",
    "topic": "redes",
    "question": "UDS NRC 0x78 suele indicar:",
    "options": [
      "Respuesta pendiente",
      "Mensaje CAN necesariamente corrupto",
      "Batería sobrecargada",
      "Trama LIN como respuesta positiva"
    ],
    "answer": 0,
    "explanation": "El código informa que el servidor continúa procesando la solicitud.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-redes-04",
    "topic": "redes",
    "question": "Una trama CAN en un archivo candump sin DBC permite deducir:",
    "options": [
      "La función exacta de cada señal OEM",
      "ID, bytes y tiempo si está disponible; no semántica OEM garantizada",
      "El número de VIN siempre",
      "El SOH real del vehículo"
    ],
    "answer": 1,
    "explanation": "Sin base de datos y contexto, los bytes no tienen interpretación física asegurada.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-redes-05",
    "topic": "redes",
    "question": "Un error de interpretación de DBC puede deberse a:",
    "options": [
      "Factor, offset o endianness incorrectos",
      "Color de carrocería",
      "Altura del neumático siempre",
      "Tipo de fusible de cabina"
    ],
    "answer": 0,
    "explanation": "La extracción y conversión de bits necesita configuración real de la señal.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-redes-06",
    "topic": "redes",
    "question": "¿Qué práctica es más prudente al investigar CAN?",
    "options": [
      "Escucha pasiva y comparación contra topología/documentación",
      "Inyectar comandos arbitrarios en marcha",
      "Reprogramar cualquier ECU como primer paso",
      "Desconectar masas durante circulación"
    ],
    "answer": 0,
    "explanation": "Registrar y analizar sin inyectar reduce riesgo de perturbar sistemas del vehículo.",
    "source": "https://kvaser.com/can-protocol-tutorial/"
  },
  {
    "id": "adv-ev-01",
    "topic": "ev",
    "question": "Un sensor con sesgo de +0,5 A durante 2 h acumula qué error de carga integrada?",
    "options": [
      "0,25 Ah",
      "1 Ah",
      "2 Ah",
      "5 Ah"
    ],
    "answer": 1,
    "explanation": "Un sesgo sostenido se integra con el tiempo: 0,5 A × 2 h = 1 Ah de error acumulado en la estimación.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "adv-ev-02",
    "topic": "ev",
    "question": "Un pack simulado de 50 Ah entrega 10 Ah desde 100% con capacidad constante. SOC estimado:",
    "options": [
      "10%",
      "20%",
      "80%",
      "90%"
    ],
    "answer": 2,
    "explanation": "La descarga de 10 Ah representa el 20% de una capacidad supuesta de 50 Ah: SOC final = 100% − 20% = 80%.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "adv-ev-03",
    "topic": "ev",
    "question": "Una capacidad útil medida de 45 Ah respecto de 60 Ah da SOH por capacidad:",
    "options": [
      "45%",
      "60%",
      "75%",
      "90%"
    ],
    "answer": 2,
    "explanation": "45/60 × 100 = 75% para esta definición concreta de SOH.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "adv-ev-04",
    "topic": "ev",
    "question": "¿Qué relación es correcta entre conocimiento teórico e intervención HV?",
    "options": [
      "Un examen digital habilita cualquier reparación",
      "La intervención requiere entrenamiento y procedimientos especializados",
      "La electrónica básica basta siempre",
      "El color naranja elimina todo riesgo"
    ],
    "answer": 1,
    "explanation": "La competencia HV y los controles de seguridad no se demuestran con un quiz.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "adv-ev-05",
    "topic": "ev",
    "question": "¿Qué función cumple comúnmente el convertidor DC/DC en un EV?",
    "options": [
      "Relacionar el bus de tracción y el sistema auxiliar de baja tensión",
      "Calcular exclusivamente la presión de neumáticos",
      "Cambiar combustible",
      "Sustituir el sistema de ABS"
    ],
    "answer": 0,
    "explanation": "El DC/DC convierte energía entre niveles de tensión, con configuración según vehículo.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "adv-ev-06",
    "topic": "ev",
    "question": "¿Qué información es insuficiente para certificar SOH de batería real?",
    "options": [
      "Un voltaje instantáneo aislado",
      "Un ensayo completo trazable con condiciones medidas",
      "Comparación de capacidad bajo protocolo validado",
      "Registros coherentes de temperatura y corriente"
    ],
    "answer": 0,
    "explanation": "La tensión instantánea depende de estado, carga, temperatura y química, y no determina sola el estado de salud.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
