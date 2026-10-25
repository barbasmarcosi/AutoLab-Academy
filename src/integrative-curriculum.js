// Material original para Taller Integrador: evidencia trazable, límites y seguridad.
export const integrativeLessons=[
  {
    "id": "chain-of-evidence",
    "topic": "electricidad",
    "title": "Trazabilidad diagnóstica: de una caída de tensión a una conclusión",
    "minutes": 48,
    "sections": [
      [
        "Un expediente tiene fuentes, no solamente números",
        "Una conclusión reproducible debe vincular cada observación con su punto de medida, instante, condición de carga, instrumento y referencia. Un fallo con tensión baja en un pin de ECU mientras los bornes permanecen estables permite orientar una búsqueda local, pero no identificar por sí solo el conector exacto."
      ],
      [
        "Registrar confirmaciones y exclusiones",
        "Una medición confirmatoria se elige porque las hipótesis producen lecturas diferentes. La lectura normal de un subsistema alternativo puede descartar una explicación dentro de los supuestos del banco; no demuestra que en el mundo físico no existan averías concurrentes ni condiciones cambiantes."
      ],
      [
        "Limitar la validez de la evidencia",
        "En la academia todos los números proceden de modelos ficticios. No se hacen conexiones físicas ni se pretende calibración OEM. Un documento técnico útil declara qué parte se observó, qué inferencia se hizo y qué incertidumbre seguirá sin resolverse hasta ejecutar pruebas autorizadas."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "obd-context-provenance",
    "topic": "redes",
    "title": "OBD, freeze-frame y el contexto que un DTC no proporciona",
    "minutes": 46,
    "sections": [
      [
        "Un monitor publica una inferencia",
        "Los DTC y los PIDs son resultados del controlador, no equivalentes a mediciones directas de presión, corriente o chispa. Cada parámetro tiene disponibilidad, actualización y definición dependientes del vehículo, y una captura de congelación puede no coincidir con el instante de una oscilografía externa."
      ],
      [
        "Ejes de tiempo y condiciones",
        "Para comparar OBD y otros instrumentos registrá RPM, carga, temperatura, estado operativo y marcas temporales. Una discrepancia entre relojes puede hacer aparecer dos eventos como simultáneos cuando ocurrieron separados, por eso hay que explicitar fuente y incertidumbre."
      ],
      [
        "La referencia debe quedar declarada",
        "Los expedientes ficticios contienen tramas y monitores pedagógicos, no registros OBD reales. Una lectura desconocida exige buscar definición y referencia propias del sistema antes de interpretar un valor como correcto o incorrecto."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/"
  },
  {
    "id": "multichannel-crosschecks",
    "topic": "senales",
    "title": "Cruzar oscilogramas con alimentación y señales de sensor",
    "minutes": 50,
    "sections": [
      [
        "La correlación temporal reduce ambigüedad",
        "Una omisión de mando puede coexistir con una caída de alimentación, una pérdida de referencia CKP o un comando deliberadamente inhibido. El trazado de un canal aislado identifica cuándo faltó el pulso, pero no informa necesariamente qué condición o circuito generó su ausencia."
      ],
      [
        "Separar referencia y respuesta",
        "Comparar CKP con CMP y, por otra parte, el pin de alimentación con el retorno de ECU dentro de la misma ventana ayuda a discriminar qué hipótesis del modelo es compatible con cada dato. No se deduce punto muerto superior ni sincronización mecánica OEM desde un gráfico inventado."
      ],
      [
        "Evitar conclusiones causales absolutas",
        "Dos señales que cambian a la vez no demuestran por sí solas que una provoque la otra. Es útil documentar pruebas que podrían falsar la hipótesis y preguntar qué evidencia independiente falta, sin improvisar conexión de instrumentos a buses o pines desconocidos."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/sensors/"
  },
  {
    "id": "mixture-closed-loop-inference",
    "topic": "motor",
    "title": "Correcciones de combustible y verificaciones independientes",
    "minutes": 48,
    "sections": [
      [
        "Control en lazo cerrado y síntomas parecidos",
        "Las correcciones positivas muestran una respuesta del control de mezcla en el modelo, pero pueden ser compatibles con aire no contabilizado, suministro de combustible insuficiente o sublectura de caudal. Una lectura lambda cercana al objetivo puede coexistir con compensaciones elevadas."
      ],
      [
        "No inventar valores universales",
        "La presión en un instrumento de banco se compara con la referencia declarada de ese modelo concreto. No debe convertirse a una regla general de presión OEM ni darse por sentado que todos los vehículos publican ese dato como PID OBD genérico."
      ],
      [
        "Elegir datos negativos útiles",
        "La presencia de corriente en un inyector no prueba su estanqueidad, pero en una hipótesis de circuito abierto puede servir como prueba de contraste. Un reporte profesional distingue qué posibilidad concreta se descarta y cuáles continúan pendientes."
      ]
    ],
    "url": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "professional-diagnostic-report",
    "topic": "ev",
    "title": "El informe técnico: incertidumbres, límites y seguridad",
    "minutes": 47,
    "sections": [
      [
        "Conservar la cadena de razonamiento",
        "Un informe debe distinguir síntomas aportados, observaciones directas, instrumentos, hipótesis inicial, pruebas efectuadas, resultados y conclusión alcanzada. También debe conservar el orden de consulta de datos para que otro técnico pueda revisar qué información condicionó cada decisión."
      ],
      [
        "Cuantificar o declarar lo desconocido",
        "Si no se dispone de tolerancia del fabricante, esquema eléctrico, calibración de sonda o trazas originales, debe constar como limitación. La incertidumbre explícita evita presentar como verdad absoluta un resultado limitado a una simulación o a un contexto parcial."
      ],
      [
        "La formación digital no habilita intervenciones",
        "Ni un expediente completo ni una nota perfecta verifican seguridad en HV, combustible presurizado o circuitos de encendido. Los procedimientos de taller requieren entrenamiento específico, EPP, documentación de fabricante y supervisión cuando corresponda."
      ]
    ],
    "url": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
export const integrativeQuestions=[
  {
    "id": "integral-q-electricidad-1",
    "topic": "electricidad",
    "question": "La caída localizada en el pin ECU mientras los bornes permanecen estables demuestra automáticamente un conector averiado:",
    "options": [
      "No; identifica una caída de la rama que requiere aislamiento adicional",
      "Sí, siempre",
      "Sí, si supera 3 V",
      "Depende de la DBC, no de mediciones"
    ],
    "answer": 0,
    "explanation": "La diferencia entre dos puntos ayuda a localizar una caída en la rama, pero no identifica por sí sola el elemento físico que la causa.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "integral-q-electricidad-2",
    "topic": "electricidad",
    "question": "¿Qué metadatos hacen útil una lectura en un informe técnico?",
    "options": [
      "Punto medido, condición de carga, hora y referencia",
      "Únicamente el color de la captura",
      "Solo el código de avería",
      "El nombre del usuario"
    ],
    "answer": 0,
    "explanation": "La lectura necesita su procedencia y contexto para ser interpretada, reproducida y revisada por otra persona.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "integral-q-redes-1",
    "topic": "redes",
    "question": "Un DTC es equivalente a una medición instrumental directa de presión de combustión:",
    "options": [
      "No, es una inferencia del monitor de la ECU",
      "Sí, en todos los modelos",
      "Sí, con P0300",
      "Sí, con un archivo DBC"
    ],
    "answer": 0,
    "explanation": "Un código del controlador comunica una condición interpretada por software, que requiere contrastarse con señales y mediciones independientes.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/"
  },
  {
    "id": "integral-q-redes-2",
    "topic": "redes",
    "question": "Para correlacionar freeze-frame y oscilografía, hay que prestar atención a:",
    "options": [
      "Condiciones operativas y sincronización de relojes",
      "Tamaño del ícono de CAN",
      "Color de los conectores",
      "Cantidad de preguntas aprobadas"
    ],
    "answer": 0,
    "explanation": "Las capturas pueden pertenecer a instantes o estados distintos; sus marcas temporales y condiciones son esenciales para sostener una correlación.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/system-tests/"
  },
  {
    "id": "integral-q-senales-1",
    "topic": "senales",
    "question": "Una omisión de pulso de mando de bobina permite asegurar que el CKP está abierto:",
    "options": [
      "No, también hay causas de alimentación o inhibición de mando",
      "Sí, sin otras pruebas",
      "Sí, si el pulso es de 5 V",
      "Sí, si el vehículo es híbrido"
    ],
    "answer": 0,
    "explanation": "Una salida ausente no demuestra por sí sola que la entrada CKP falló; hay que cruzar señales y alimentación en el mismo evento.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/sensors/"
  },
  {
    "id": "integral-q-senales-2",
    "topic": "senales",
    "question": "¿Por qué una captura CKP/CMP simultánea puede ser más informativa que un canal solo?",
    "options": [
      "Ofrece referencia temporal independiente para comprobar continuidad y fase",
      "Permite inferir presión de combustible directamente",
      "Elimina toda necesidad de datos OEM",
      "Mide compresión absoluta"
    ],
    "answer": 0,
    "explanation": "Al observar dos señales en el mismo eje temporal se pueden detectar diferencias de continuidad o correlación que un solo canal no revela.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/sensors/"
  },
  {
    "id": "integral-q-motor-1",
    "topic": "motor",
    "question": "STFT positivo alto prueba que la bomba de combustible está averiada:",
    "options": [
      "No, el controlador compensa una condición que necesita prueba discriminante",
      "Sí en todos los sistemas",
      "Solo con STFT +20%",
      "Sí si lambda es uno"
    ],
    "answer": 0,
    "explanation": "Los trims reflejan respuesta de la ECU y múltiples factores pueden justificarla; hace falta evidencia independiente para discriminar suministro, aire y sensores.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "integral-q-motor-2",
    "topic": "motor",
    "question": "Si un inyector presenta corriente durante el mando, ¿qué conclusión es razonable?",
    "options": [
      "No parece abierto eléctricamente en esa captura; su mecánica puede seguir sin comprobarse",
      "Está mecánicamente estanco con certeza",
      "El motor tiene presión correcta",
      "La batería HV está aislada"
    ],
    "answer": 0,
    "explanation": "La corriente discrimina algunas fallas del circuito eléctrico, pero no comprueba por sí sola funcionamiento hidráulico o estanqueidad.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/"
  },
  {
    "id": "integral-q-ev-1",
    "topic": "ev",
    "question": "¿Cuál es una incertidumbre legítima en un informe basado en oscilogramas sintéticos?",
    "options": [
      "No conocemos tolerancias OEM ni se verificaron señales con instrumental calibrado",
      "El dato ficticio garantiza seguridad HV",
      "Toda captura representa un motor real",
      "No hay incertidumbres si la nota es 100"
    ],
    "answer": 0,
    "explanation": "Los ejercicios ficticios no representan tolerancias ni ensayos reales; la calidad del informe exige hacer explícitos esos límites.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  },
  {
    "id": "integral-q-ev-2",
    "topic": "ev",
    "question": "Una calificación automática del Taller Integrador habilita mediciones de alta tensión:",
    "options": [
      "No; requiere formación, procedimientos y equipos especializados",
      "Sí, con cuatro fuentes revisadas",
      "Sí, si el informe incluye pruebas negativas",
      "Sí, si se exportó Markdown"
    ],
    "answer": 0,
    "explanation": "Un trabajo evaluado con datos ficticios no acredita seguridad ni aptitud para manipular sistemas HV reales.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm"
  }
];
