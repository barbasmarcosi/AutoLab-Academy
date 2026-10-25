// Lecciones y preguntas originales sobre control de combustible. Modelos y cifras de laboratorio ficticios.
export const fuelLessons=[
  {
    "id": "trim-patterns",
    "topic": "motor",
    "title": "STFT y LTFT: comprender la reacción, no adivinar la pieza",
    "minutes": 46,
    "sections": [
      [
        "Dos horizontes de corrección",
        "La corrección de combustible a corto plazo (STFT) responde de forma dinámica al control de mezcla cuando se cumplen las condiciones de lazo cerrado; LTFT aprende desviaciones a más largo plazo. Correcciones positivas suelen representar aporte adicional de combustible, y negativas una reducción. El signo no localiza por sí solo una pieza."
      ],
      [
        "Comparar condiciones estables",
        "Contrastá ralentí, crucero estabilizado y una demanda moderada, anotando temperatura, régimen, estado de lazo, cargas y si los datos pertenecen al mismo banco. Sumar simplemente STFT y LTFT sirve como aproximación informal, no como fórmula universal de inyección."
      ],
      [
        "Confirmar con una prueba independiente",
        "Si las correcciones cambian con carga, diseñá una medida que permita separar aire no registrado, combustible insuficiente y errores de medición. Las referencias y umbrales dependen del fabricante; el laboratorio solo presenta datos ficticios."
      ]
    ],
    "url": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "intake-versus-fuel",
    "topic": "motor",
    "title": "Aire no medido frente a falta de combustible",
    "minutes": 46,
    "sections": [
      [
        "Patrones que se parecen",
        "Una mezcla que exige corrección positiva puede originarse por múltiples factores. En algunos modelos una entrada de aire no registrada pesa relativamente más al ralentí, mientras una entrega de combustible limitada se hace más visible con alta demanda."
      ],
      [
        "No basta con los trims",
        "Una pauta que cambia entre regímenes orienta la primera hipótesis, pero no descarta sensores, transitorios o una estrategia distinta de cálculo de carga. La prueba útil debe comparar el comportamiento real del circuito con un valor de referencia adecuado y seguro."
      ],
      [
        "Prueba discriminante",
        "En AutoLab se usa un aislamiento ficticio de admisión y una medición sintética de presión bajo condiciones especificadas. No se enseña a abrir sistemas reales presurizados ni se presentan valores de presión como metas universales."
      ]
    ],
    "url": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "maf-plausibility-lambda",
    "topic": "senales",
    "title": "MAF, MAP y lambda: plausibilidad y referencias independientes",
    "minutes": 45,
    "sections": [
      [
        "Tres conceptos diferentes",
        "MAF representa flujo de masa de aire, MAP presión absoluta del múltiple y lambda la relación aire-combustible relativa a la mezcla estequiométrica. Ninguno sustituye automáticamente a los demás: su interpretación depende de la arquitectura y estrategia de la ECU."
      ],
      [
        "Lazo cerrado y lambda",
        "Si el controlador consigue compensar, la lambda medida puede mantenerse próxima al objetivo aunque las correcciones sean elevadas. Una lambda aparentemente normal no descarta compensaciones importantes. En lazo abierto, los ajustes y sus interpretaciones pueden no tener el mismo significado."
      ],
      [
        "Correlación contra otra medida",
        "Una señal MAF plausible en unidades no basta para demostrar precisión. El banco ficticio ofrece un medidor de flujo de referencia independiente para comparar bajo las mismas condiciones; el resultado no puede extrapolarse a sensores reales sin documentación."
      ]
    ],
    "url": "https://obd2pid.com/pids"
  },
  {
    "id": "fuel-pressure-isolated",
    "topic": "electricidad",
    "title": "Presión de combustible y prueba segura en banco virtual",
    "minutes": 42,
    "sections": [
      [
        "Presión no es un PID genérico garantizado",
        "No todos los vehículos exponen presión del riel en una consulta OBD-II genérica. En los ejercicios se trata como una medición de instrumento ficticio de banco, cuya referencia fue definida explícitamente y no refleja una especificación del fabricante."
      ],
      [
        "Carga y disponibilidad de combustible",
        "Un caudal limitado puede producir una caída de presión o una entrega insuficiente bajo mayor consumo en determinados sistemas. Para explicar un patrón de correcciones hace falta contrastar entrega, control, modelo y condiciones reproducibles."
      ],
      [
        "Seguridad fundamental",
        "Las líneas de combustible reales pueden conservar presión peligrosa y los procedimientos varían. AutoLab no ejecuta pruebas físicas, no instruye abrir conexiones presurizadas y bloquea opciones inseguras de los ejercicios."
      ]
    ],
    "url": "https://www.boschdiagnostics.com/sites/default/files/documents/fix_7803_manual.pdf"
  },
  {
    "id": "injector-leak-model",
    "topic": "motor",
    "title": "Mando eléctrico y estanqueidad mecánica del inyector",
    "minutes": 44,
    "sections": [
      [
        "Un pulso no demuestra cierre",
        "Una señal de mando aparentemente normal confirma un comando eléctrico bajo las condiciones de adquisición, pero no demuestra estanqueidad del elemento mecánico de inyección. Una carga defectuosa puede aportar combustible fuera de los pulsos solicitados."
      ],
      [
        "Separar respuesta rica de causa",
        "Correcciones negativas indican que el controlador intenta reducir el combustible en la estrategia descrita. Eso no demuestra fuga de inyector sin una verificación independiente del circuito, combustible y sensores de retroalimentación."
      ],
      [
        "Modelo virtual y límites",
        "El laboratorio compara una condición ficticia de inyectores aislados con comando desactivado. No representa una prueba de presión de vehículo, no admite la manipulación de combustible real y no habilita intervención de sistemas de inyección directa."
      ]
    ],
    "url": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  }
];
export const fuelQuestions=[
  {
    "id": "fuel-q-motor-1",
    "topic": "motor",
    "question": "¿Qué indica un STFT positivo en el modelo de control en lazo cerrado?",
    "options": [
      "La ECU está agregando combustible respecto de su cálculo base",
      "Un inyector está necesariamente roto",
      "El voltaje MAP es cero",
      "El sistema está en lazo abierto siempre"
    ],
    "answer": 0,
    "explanation": "Una corrección positiva suele representar combustible añadido por el controlador; por sí sola no identifica la causa física del desvío.",
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-q-motor-2",
    "topic": "motor",
    "question": "Corrección positiva mayor al ralentí que baja con más flujo puede orientar a:",
    "options": [
      "Aire adicional no registrado; se confirma independientemente",
      "Inyector con fuga confirmado",
      "Transceptor CAN dañado",
      "Batería de tracción con SOH bajo"
    ],
    "answer": 0,
    "explanation": "En algunos modelos una entrada de aire adicional pesa relativamente más al ralentí. La pauta es orientativa, no diagnóstica por sí sola.",
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-q-motor-3",
    "topic": "motor",
    "question": "¿Por qué una orden eléctrica de inyector correcta no demuestra estanqueidad?",
    "options": [
      "El cierre mecánico no queda demostrado por el pulso",
      "Porque toda ECU usa voltajes iguales",
      "Porque MAP es voltaje de bobina",
      "Porque un DTC mide presión directamente"
    ],
    "answer": 0,
    "explanation": "Un comando no demuestra cierre mecánico de la válvula; hay que separar actuación electrónica y funcionamiento hidráulico con una prueba apropiada.",
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-q-motor-4",
    "topic": "motor",
    "question": "Un LTFT negativo significa necesariamente un inyector con fuga:",
    "options": [
      "No; representa corrección de combustible y requiere discriminación",
      "Sí en cualquier sistema",
      "Sí cuando la lectura supera -5%",
      "Sí solo en CAN FD"
    ],
    "answer": 0,
    "explanation": "La corrección aprendida negativa representa una tendencia de reducción; distintas causas pueden provocar esa reacción del control.",
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-q-motor-5",
    "topic": "motor",
    "question": "Al comparar ralentí y crucero, ¿cuál es la práctica correcta?",
    "options": [
      "Registrar condiciones y estado de lazo para interpretar los valores",
      "Comparar lecturas tomadas en motores distintos",
      "Cambiar piezas sin prueba adicional",
      "Usar valores OEM que no se conocen"
    ],
    "answer": 0,
    "explanation": "El contexto de carga, temperatura y estrategia del controlador condiciona la lectura; los patrones requieren una prueba discriminante.",
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-q-electricidad-1",
    "topic": "electricidad",
    "question": "La presión del riel de combustible está siempre disponible como PID genérico OBD-II:",
    "options": [
      "No; depende del vehículo y de lo soportado por su ECU",
      "Sí en todos los motores",
      "Solo cuando hay ABS",
      "Nunca puede medirse"
    ],
    "answer": 0,
    "explanation": "El conjunto de parámetros soportados difiere entre ECUs; una medición de presión en el banco puede provenir de un instrumento independiente.",
    "source": "https://www.boschdiagnostics.com/sites/default/files/documents/fix_7803_manual.pdf"
  },
  {
    "id": "fuel-q-electricidad-2",
    "topic": "electricidad",
    "question": "Una caída bajo mayor demanda en un circuito de combustible requiere:",
    "options": [
      "Contrastar presión real con la referencia aplicable",
      "Asumir que la bomba está rota",
      "Abrir una línea presurizada para mirar",
      "Ignorar la carga"
    ],
    "answer": 0,
    "explanation": "La disponibilidad de combustible depende de condiciones y arquitectura; la lectura exige referencia y método seguro específicos.",
    "source": "https://www.boschdiagnostics.com/sites/default/files/documents/fix_7803_manual.pdf"
  },
  {
    "id": "fuel-q-senales-1",
    "topic": "senales",
    "question": "Una lambda próxima a uno con STFT positivo elevado puede significar:",
    "options": [
      "El control consiguió compensar parcialmente el desvío",
      "No hay posibilidad de ninguna anomalía",
      "La ECU está siempre en lazo abierto",
      "MAF es perfecto"
    ],
    "answer": 0,
    "explanation": "En lazo cerrado lambda cercana al objetivo puede coexistir con correcciones importantes, porque precisamente el controlador está compensando.",
    "source": "https://obd2pid.com/pids"
  },
  {
    "id": "fuel-q-senales-2",
    "topic": "senales",
    "question": "Para comprobar sublectura de MAF de forma independiente en el banco:",
    "options": [
      "Comparar con caudal de referencia medido en mismas condiciones",
      "Releer solo el número MAF",
      "Suponer flujo exacto desde MAP sin modelo",
      "Mirar el VIN"
    ],
    "answer": 0,
    "explanation": "Una referencia de flujo independiente y co-temporal ofrece más evidencia que comparar un sensor con su propia lectura.",
    "source": "https://obd2pid.com/pids"
  },
  {
    "id": "fuel-q-senales-3",
    "topic": "senales",
    "question": "MAF y MAP son parámetros intercambiables y tienen las mismas unidades:",
    "options": [
      "No, masa de aire por tiempo y presión absoluta son magnitudes distintas",
      "Sí, ambos expresan RPM",
      "Sí, si lambda es uno",
      "Sí, en todos los controladores"
    ],
    "answer": 0,
    "explanation": "MAF mide flujo másico, por ejemplo g/s; MAP mide presión absoluta, por ejemplo kPa, y requiere contexto para estimar carga.",
    "source": "https://obd2pid.com/pids"
  }
];
