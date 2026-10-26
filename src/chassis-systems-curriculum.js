/** Mechanics systems MC06-MC09: concept lessons and 16 objective items; no repair procedures or OEM specifications. */
export const chassisSystemsLessons=[
  {
    "id": "mc06-gears-powertrain",
    "topic": "motor",
    "title": "MC06 — Transmisiones, convertidores y diferencial",
    "minutes": 46,
    "url": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419",
    "sections": [
      [
        "Relación de transmisión y caudal de potencia",
        "La transmisión transforma velocidad y torque, pero no crea potencia: en un modelo estacionario, la potencia de salida es la potencia de entrada menos pérdidas mecánicas, hidráulicas y térmicas. En reducción, un eje de salida gira más lento y puede transmitir más par; las pérdidas dependen de carga y estado."
      ],
      [
        "Embrague y convertidor",
        "El embrague manual permite modular y desacoplar temporalmente el enlace motor-caja. Un convertidor hidráulico y su embrague de bloqueo presentan otros mecanismos de transferencia y deslizamiento; un aumento de rpm sin aceleración equivalente no basta para identificar una pieza fallada."
      ],
      [
        "Diferencial y transmisión final",
        "Durante una curva las ruedas izquierda y derecha recorren trayectos distintos, por lo que pueden necesitar diferentes velocidades angulares. Un diferencial abierto y uno de deslizamiento limitado no producen el mismo reparto bajo todas las condiciones, y la geometría de neumáticos y adherencia importa."
      ],
      [
        "Estrategia de diagnóstico",
        "Registrar relación solicitada y efectiva, régimen de eje, temperatura, condición de carga y posibles mensajes de control permite distinguir un deslizamiento real de una lectura incorrecta. No se sustituyen ni ajustan componentes internos sin procedimientos, herramientas y pares OEM."
      ]
    ]
  },
  {
    "id": "mc07-chassis-geometry",
    "topic": "motor",
    "title": "MC07 — Dirección, suspensión, neumáticos y alineación",
    "minutes": 46,
    "url": "https://www.nhtsa.gov/vehicle-safety/tires",
    "sections": [
      [
        "Cinemática y geometría",
        "Convergencia, caída y avance describen orientaciones de las ruedas y ejes de dirección. Interactúan con la geometría de suspensión, la flexibilidad de bujes, la altura de marcha y las cargas, por lo que un valor aislado no explica por sí solo el comportamiento dinámico."
      ],
      [
        "Neumático como elemento de control",
        "La adherencia surge de interacciones complejas del compuesto, dibujo, presión, carga, temperatura y suelo. Un indicador TPMS no equivale a una medición precisa de todas las ruedas; la presión recomendada corresponde a la placa del vehículo y condiciones de medición especificadas."
      ],
      [
        "Desgaste irregular y vibraciones",
        "Desbalanceo, alabeo, juego de rodamiento, neumático dañado, amortiguación y alineación pueden provocar síntomas semejantes. Debe verificarse condición, velocidad de aparición, localización y estado de seguridad antes de adjudicar causas a la geometría."
      ],
      [
        "Seguridad y límites",
        "Un vehículo que tira hacia un lado necesita revisión de frenos, neumáticos y alineación, entre otras hipótesis. No se realizan pruebas dinámicas riesgosas para confirmar hipótesis de suspensión; la inspección de ruedas exige levantamiento y soporte conforme a un procedimiento validado."
      ]
    ]
  },
  {
    "id": "mc08-brakes-abs",
    "topic": "motor",
    "title": "MC08 — Hidráulica de frenos, ABS/ESC y energía",
    "minutes": 52,
    "url": "https://saemobilus.sae.org/courses/introduction-brake-control-systems-abs-tcs-esc-pd730501",
    "sections": [
      [
        "Presión, fuerza y transferencia",
        "La fuerza en un pistón hidráulico ideal resulta de la presión multiplicada por el área efectiva. El sistema completo combina cilindro maestro, circuitos, válvulas, pinzas o cilindros de rueda y fricción; la presión por sí sola no determina adherencia neumático-suelo ni reparto dinámico de carga."
      ],
      [
        "Energía térmica del frenado",
        "La energía cinética aumenta con el cuadrado de la velocidad. Una frenada transforma energía en calor en elementos de fricción y parcialmente en otros caminos; temperatura, materiales y eventos repetidos afectan el desempeño. El laboratorio MC08 es ideal y no valida pérdida de rendimiento térmico."
      ],
      [
        "ABS y estabilidad",
        "ABS busca modular la presión para evitar deslizamiento excesivo; ESC integra velocidad de ruedas y movimiento del vehículo para intervenir selectivamente. Ningún controlador puede producir adherencia inexistente, y una luz o DTC no prueba por sí sola el estado hidráulico real."
      ],
      [
        "Criterio de intervención",
        "Frenos, flexibles, conexiones y líquido son componentes críticos. Si hay evidencia de pérdida de efectividad, no se continúa con una prueba de conducción. Un examen digital no habilita purgar un módulo ABS, modificar parámetros ESC ni diagnosticar seguridad sin ensayos validados."
      ]
    ]
  },
  {
    "id": "mc09-hvac-loop",
    "topic": "motor",
    "title": "MC09 — Climatización, ciclo frigorífico y seguridad",
    "minutes": 45,
    "url": "https://www.epa.gov/mvac/servicing-information-technicians",
    "sections": [
      [
        "Flujo de calor y refrigerante",
        "El sistema de compresión de vapor usa compresor, condensador, expansión y evaporador para trasladar calor desde cabina al ambiente. La presión y la temperatura están relacionadas con el refrigerante utilizado y su estado, por lo que un valor único sin identificación y contexto no diagnostica una carga."
      ],
      [
        "Compresor y control",
        "Compresores de desplazamiento variable, ventiladores, sensores térmicos y válvulas de expansión interactúan con el controlador. Un habitáculo poco frío puede reflejar restricciones de flujo de aire, transferencia térmica o mando, además del circuito de refrigerante."
      ],
      [
        "Compatibilidad y límites ambientales",
        "Los refrigerantes difieren en propiedades, inflamabilidad, impacto ambiental y conectores. No pueden mezclarse o sustituirse sin determinar compatibilidad, legislación local y procedimiento del fabricante. Los requisitos EPA 609 corresponden a Estados Unidos, no son una regla argentina universal."
      ],
      [
        "Seguridad de servicio",
        "La descarga intencional y manipulación improvisada son prácticas inaceptables. La apertura de circuito, recuperación y carga requieren equipamiento apropiado y competencia; la teoría del laboratorio no sustituye habilitación local ni procedimientos ambientales vigentes."
      ]
    ]
  }
];
export const chassisSystemsQuestions=[
  {
    "id": "mc06-v2-01",
    "topic": "motor",
    "question": "Un reductor ideal de relación 2:1 modifica el régimen de salida:",
    "options": [
      "Lo duplica",
      "Lo reduce a la mitad",
      "Lo triplica",
      "Lo deja idéntico"
    ],
    "answer": 1,
    "explanation": "Una relación 2:1 indica dos vueltas de entrada por una de salida.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc06-v2-02",
    "topic": "motor",
    "question": "El deslizamiento percibido en transmisión automática demuestra:",
    "options": [
      "Que el convertidor está fallando siempre",
      "Que no debe registrarse temperatura",
      "Que hace falta medir régimen, demanda y variables de control",
      "Que el sensor ABS está averiado"
    ],
    "answer": 2,
    "explanation": "Sin régimen de ejes y contexto de control no se individualiza el origen.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc06-v2-03",
    "topic": "motor",
    "question": "La función de un diferencial abierto incluye:",
    "options": [
      "Permitir distintas velocidades de rueda en curva",
      "Elevar potencia sin pérdidas",
      "Eliminar necesidad de neumáticos",
      "Crear energía mecánica"
    ],
    "answer": 0,
    "explanation": "Las ruedas trazan recorridos distintos al doblar.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc06-v2-04",
    "topic": "motor",
    "question": "Una transmisión real de eficiencia menor que 100 %:",
    "options": [
      "Produce más potencia que recibe",
      "Elimina pérdida térmica",
      "Solo tiene pérdida al frenar",
      "Entrega potencia menor que recibe a igual régimen estacionario"
    ],
    "answer": 3,
    "explanation": "Las pérdidas disipativas reducen potencia mecánica utilizable.",
    "source": "https://saemobilus.sae.org/courses/fundamentals-modern-vehicle-transmissions-pd730419"
  },
  {
    "id": "mc07-v2-01",
    "topic": "motor",
    "question": "Una advertencia TPMS apagada significa:",
    "options": [
      "Presión idéntica en todas las ruedas",
      "Que igual conviene comprobar presiones con instrumento apropiado",
      "Que no existe desgaste irregular",
      "Que la alineación está correcta"
    ],
    "answer": 1,
    "explanation": "TPMS no sustituye control de presión ni inspección de seguridad.",
    "source": "https://www.nhtsa.gov/vehicle-safety/tires"
  },
  {
    "id": "mc07-v2-02",
    "topic": "motor",
    "question": "La convergencia representa:",
    "options": [
      "Viscosidad del aceite",
      "Potencia de frenado",
      "Orientación relativa de ruedas observadas en planta",
      "Ángulo de válvulas"
    ],
    "answer": 2,
    "explanation": "Es uno de los parámetros de alineación del tren rodante.",
    "source": "https://www.nhtsa.gov/vehicle-safety/tires"
  },
  {
    "id": "mc07-v2-03",
    "topic": "motor",
    "question": "Vibración a cierta velocidad indica de modo concluyente:",
    "options": [
      "Rodamiento dañado",
      "Amortiguador dañado",
      "Frenos desajustados",
      "Se necesitan pruebas para neumático, rueda, rodamiento y otros orígenes"
    ],
    "answer": 3,
    "explanation": "Un síntoma de vibración por sí solo no identifica componente.",
    "source": "https://www.nhtsa.gov/vehicle-safety/tires"
  },
  {
    "id": "mc07-v2-04",
    "topic": "motor",
    "question": "¿De dónde obtener la presión de neumáticos aplicable?",
    "options": [
      "Placa y manual del vehículo en condiciones indicadas",
      "Presión máxima grabada en el lateral",
      "Cualquier valor sugerido por red social",
      "La presión de un automóvil parecido"
    ],
    "answer": 0,
    "explanation": "El valor operativo especificado no es necesariamente el máximo del neumático.",
    "source": "https://www.nhtsa.gov/vehicle-safety/tires"
  },
  {
    "id": "mc08-v2-01",
    "topic": "motor",
    "question": "Si la velocidad se duplica manteniendo masa, la energía cinética:",
    "options": [
      "Se duplica",
      "Se cuadruplica",
      "No cambia",
      "Se divide por cuatro"
    ],
    "answer": 1,
    "explanation": "La energía cinética es proporcional a v².",
    "source": "https://saemobilus.sae.org/courses/introduction-brake-control-systems-abs-tcs-esc-pd730501"
  },
  {
    "id": "mc08-v2-02",
    "topic": "motor",
    "question": "¿Qué puede hacer el ABS sobre la adherencia?",
    "options": [
      "Crear siempre μ=1",
      "Eliminar necesidad de neumáticos",
      "Controlar deslizamiento, no crear fricción física",
      "Garantizar distancias de frenado idénticas"
    ],
    "answer": 2,
    "explanation": "ABS modula presión y deslizamiento; no aumenta mágicamente la adherencia disponible.",
    "source": "https://saemobilus.sae.org/courses/introduction-brake-control-systems-abs-tcs-esc-pd730501"
  },
  {
    "id": "mc08-v2-03",
    "topic": "motor",
    "question": "Con frenado hidráulico ideal, para un pistón de área A sometido a presión P:",
    "options": [
      "F=P·A",
      "F=P/A²",
      "F=P+A",
      "F=A/P"
    ],
    "answer": 0,
    "explanation": "En el modelo hidráulico ideal, fuerza equivale a presión por área efectiva.",
    "source": "https://saemobilus.sae.org/courses/introduction-brake-control-systems-abs-tcs-esc-pd730501"
  },
  {
    "id": "mc08-v2-04",
    "topic": "motor",
    "question": "Si hay pérdida sospechada de eficiencia de frenos, el abordaje adecuado es:",
    "options": [
      "Seguir conduciendo hasta reproducir el problema",
      "Ignorar el síntoma si no hay DTC",
      "Cambiar ESP por software",
      "Detener la prueba dinámica e inspeccionar de forma segura"
    ],
    "answer": 3,
    "explanation": "La seguridad de frenado prevalece sobre la obtención de datos experimentales.",
    "source": "https://saemobilus.sae.org/courses/introduction-brake-control-systems-abs-tcs-esc-pd730501"
  },
  {
    "id": "mc09-v2-01",
    "topic": "motor",
    "question": "El evaporador del aire acondicionado sirve para:",
    "options": [
      "Liberar calor dentro de la cabina siempre",
      "Absorber calor de la corriente de aire de cabina",
      "Inflar los neumáticos",
      "Crear refrigerante químicamente"
    ],
    "answer": 1,
    "explanation": "El evaporador es el intercambiador que absorbe calor al evaporarse el fluido.",
    "source": "https://www.epa.gov/mvac/servicing-information-technicians"
  },
  {
    "id": "mc09-v2-02",
    "topic": "motor",
    "question": "Un manómetro aislado indica inequívocamente que falta refrigerante?",
    "options": [
      "Sí, sin importar la temperatura",
      "Sí, todos usan mismos rangos",
      "No: hay que identificar fluido y condiciones de operación",
      "Solo si falla el alternador"
    ],
    "answer": 2,
    "explanation": "La presión debe interpretarse con el refrigerante y el estado termodinámico.",
    "source": "https://www.epa.gov/mvac/servicing-information-technicians"
  },
  {
    "id": "mc09-v2-03",
    "topic": "motor",
    "question": "La certificación EPA 609 citada en materiales de Estados Unidos:",
    "options": [
      "No sustituye requisitos legales argentinos, que deben verificarse",
      "Se aplica automáticamente a cualquier país",
      "Permite ventear gases en todo el mundo",
      "Exime la manipulación con equipo adecuado"
    ],
    "answer": 0,
    "explanation": "Las obligaciones regulatorias dependen de jurisdicción, además de seguridad técnica.",
    "source": "https://www.epa.gov/mvac/servicing-information-technicians"
  },
  {
    "id": "mc09-v2-04",
    "topic": "motor",
    "question": "Antes de abrir un circuito frigorífico automotriz:",
    "options": [
      "Se puede liberar gas al aire para igualar presión",
      "No hace falta identificar refrigerante",
      "Se reemplaza refrigerante por agua",
      "Se necesitan procedimiento y recuperación apropiada por personal competente"
    ],
    "answer": 3,
    "explanation": "Evitar descargas y lesiones requiere procedimientos, equipos y habilitaciones aplicables.",
    "source": "https://www.epa.gov/mvac/servicing-information-technicians"
  }
];
