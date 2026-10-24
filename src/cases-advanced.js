// Scenarios are synthetic and educational; no real OEM specifications or HV interventions.
// Review each scenario before adding to a qualification program.
export const additionalCases = [
  {
    "id": "case-charge-drop",
    "title": "Carga presente en alternador, ausente en batería",
    "topic": "electricidad",
    "difficulty": "Intermedio",
    "symptom": "Con luces y ventilador conectados, la batería sigue descargándose pese a que el alternador gira.",
    "context": "Modelo sintético de 12 V con regulador convencional estabilizado. Los valores del caso no son especificaciones universales.",
    "solution": "positive",
    "reason": "El alternador entrega 14,2 V en B+ y la batería recibe 12,1 V en sus propios bornes con la misma carga. La diferencia bajo corriente identifica un tramo de alta resistencia entre B+ y la batería; localizarlo exige documentar cada punto.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "choices": [
      [
        "alternator",
        "Alternador incapaz de generar tensión"
      ],
      [
        "positive",
        "Alta resistencia en circuito positivo de carga"
      ],
      [
        "battery",
        "Batería como única causa"
      ]
    ],
    "probes": [
      {
        "id": "alternator",
        "label": "Comparar tensión en B+ y masa del alternador",
        "result": "El alternador entrega 14,2 V con consumo eléctrico estable.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "drop",
        "label": "Medir caída a lo largo del positivo de carga bajo la misma carga",
        "result": "Entre B+ del alternador y positivo de batería se registran 2,1 V.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "battery",
        "label": "Verificar tensión en bornes de batería",
        "result": "La batería muestra 12,1 V durante esa misma medición.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "override",
        "label": "Puente improvisado sin protección entre fuentes",
        "result": "Intervención no segura; no se realiza ninguna prueba.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-sleep-current",
    "title": "Consumo parásito al estacionar",
    "topic": "electricidad",
    "difficulty": "Intermedio",
    "symptom": "La batería se descarga por la noche y el vehículo arranca bien tras una recarga.",
    "context": "Banco simulado de 12 V; se define el estado de reposo tras 40 minutos de inactividad.",
    "solution": "accessory",
    "reason": "La corriente estabilizada de 0,65 A excede el valor de referencia dado para el caso (0,035 A). Al deshabilitar virtualmente el circuito de accesorios, el consumo desciende a 0,035 A. Esto localiza el circuito, no necesariamente una pieza individual.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "choices": [
      [
        "battery",
        "Falla confirmada de capacidad en la batería"
      ],
      [
        "accessory",
        "Consumo excesivo en circuito de accesorios"
      ],
      [
        "alternator",
        "Regulación de voltaje excesiva del alternador"
      ]
    ],
    "probes": [
      {
        "id": "rest",
        "label": "Observar corriente una vez alcanzado el reposo",
        "result": "Corriente residual del modelo: 0,65 A. Referencia de este vehículo: 0,035 A.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "isolate",
        "label": "Aislar virtualmente el circuito de accesorios",
        "result": "El consumo simulado cae de 0,65 A a 0,035 A; el resto queda estable.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "start",
        "label": "Evaluar corriente de arranque",
        "result": "No se observan anomalías en el arranque de este caso.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "fuse",
        "label": "Anular la protección de un circuito para acelerar la prueba",
        "result": "Procedimiento inseguro: no se realiza.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-ckp-wire",
    "title": "Motor gira sin señal de RPM",
    "topic": "senales",
    "difficulty": "Avanzado",
    "symptom": "El motor gira pero no enciende; el escáner presenta 0 RPM durante el arranque.",
    "context": "Vehículo sintético con sensor CKP inductivo y documentación de referencia del caso.",
    "solution": "harness",
    "reason": "Existe forma de onda CKP coherente en el sensor durante el arranque, pero no llega al conector de ECU. La continuidad simulada confirma circuito abierto de señal en el mazo.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "choices": [
      [
        "sensor",
        "Sensor CKP sin generación de señal"
      ],
      [
        "harness",
        "Circuito abierto del CKP entre sensor y ECU"
      ],
      [
        "ecu",
        "ECU incapaz de procesar una señal válida"
      ]
    ],
    "probes": [
      {
        "id": "sensor",
        "label": "Capturar CKP junto al sensor durante arranque",
        "result": "Se registra una señal alterna periódica de amplitud acorde con esta configuración.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "ecu",
        "label": "Comparar forma de onda en conector de ECU",
        "result": "La señal CKP no está presente; la alimentación general de ECU se conserva.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "continuity",
        "label": "Comprobar continuidad en mazo aislado del banco",
        "result": "El conductor de señal presenta circuito abierto entre ambos conectores.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "guess",
        "label": "Reemplazar ECU antes de confirmar señal",
        "result": "Reemplazo injustificado; se registraría una decisión insegura y costosa.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-intake-leak",
    "title": "Corrección de combustible alta en ralentí",
    "topic": "motor",
    "difficulty": "Intermedio",
    "symptom": "Ralentí irregular; STFT +22% en ralentí que baja cerca de 0% con mayor carga.",
    "context": "Motor sintético con medición MAF, control de mezcla cerrado y documentación explícita.",
    "solution": "air",
    "reason": "El aporte de aire no medido pesa más a ralentí que a carga elevada; una prueba de estanqueidad sintética localiza una fuga después del MAF. El trim positivo es un síntoma, no una prueba aislada.",
    "source": "https://www.csselectronics.com/pages/obd2-explained-simple-intro",
    "choices": [
      [
        "injector",
        "Inyector principal eléctricamente abierto"
      ],
      [
        "air",
        "Entrada de aire no medido aguas abajo del MAF"
      ],
      [
        "ecu",
        "Software de ECU corrupto"
      ]
    ],
    "probes": [
      {
        "id": "trims",
        "label": "Comparar trims en ralentí y carga",
        "result": "STFT +22% a ralentí, próximo a 0% al aumentar el caudal de aire.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "leak",
        "label": "Ensayo simulado de estanqueidad de admisión",
        "result": "El sistema detecta pérdida de estanqueidad aguas abajo del sensor MAF.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "pressure",
        "label": "Comprobar presión del combustible",
        "result": "La presión registrada se mantiene en el rango definido para este caso.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "spray",
        "label": "Aplicar líquido inflamable cerca del motor caliente",
        "result": "No se realiza: riesgo de ignición.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-app-signal",
    "title": "Pedal de acelerador con fallos esporádicos",
    "topic": "electricidad",
    "difficulty": "Avanzado",
    "symptom": "La respuesta al pedal queda limitada de forma intermitente; aparece discrepancia entre señales redundantes.",
    "context": "Señales sintéticas APP1/APP2; relaciones exactas dependen del vehículo y aquí están definidas para el laboratorio.",
    "solution": "connector",
    "reason": "Ambas señales son coherentes directamente en el pedal, pero APP2 se interrumpe al observarla del lado ECU durante vibración virtual del mazo. La causa localizada está en la conexión/cableado de APP2, no en el pedal.",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "choices": [
      [
        "pedal",
        "Transductor APP interno defectuoso"
      ],
      [
        "connector",
        "Intermitencia en la conexión de señal APP2"
      ],
      [
        "ecu",
        "Fallo de fuente interna de ECU"
      ]
    ],
    "probes": [
      {
        "id": "ref",
        "label": "Medir referencias y masas del pedal",
        "result": "Referencias y masas estables en condiciones del caso.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "compare",
        "label": "Comparar APP2 en terminal del pedal y en ECU",
        "result": "La señal es estable en el pedal; aparecen caídas a 0 V del lado ECU al mover el mazo simulado.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "correlate",
        "label": "Capturar ambas señales al accionar pedal",
        "result": "Ambas curvas son coherentes medidas junto al pedal.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "jumper",
        "label": "Cortar y puentear los cables sin identificar pines",
        "result": "No se realiza intervención sin esquema ni protección.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-can-termination",
    "title": "Terminación incorrecta en bus CAN de banco",
    "topic": "redes",
    "difficulty": "Avanzado",
    "symptom": "Comunicación errática entre tres nodos didácticos CAN durante el ejercicio.",
    "context": "Red de banco sin conectar a vehículo. Dos resistencias terminales de 120 Ω deberían formar 60 Ω nominales en paralelo, con todo apagado.",
    "solution": "terminal",
    "reason": "La medición conceptual de 120 Ω total es compatible con ausencia de una terminación de 120 Ω. Tras reponer virtualmente la resistencia ausente se recupera una red estable en este montaje.",
    "source": "https://kvaser.com/can-protocol-tutorial/",
    "choices": [
      [
        "terminal",
        "Falta una de las dos terminaciones de 120 Ω"
      ],
      [
        "ecusoft",
        "Todas las ECUs requieren nueva programación"
      ],
      [
        "short",
        "Cortocircuito de bus entre líneas CAN H y CAN L"
      ]
    ],
    "probes": [
      {
        "id": "wave",
        "label": "Examinar comunicación del banco con analizador",
        "result": "Se observan errores de trama durante tráfico de prueba.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "resistance",
        "label": "Medir resistencia entre CAN H y CAN L con banco apagado",
        "result": "Se miden 120 Ω. La topología didáctica requiere dos terminaciones de 120 Ω en paralelo.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "replace",
        "label": "Reponer virtualmente terminador faltante y repetir ensayo",
        "result": "La resistencia equivalente pasa a 60 Ω nominales y cesan errores.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "live",
        "label": "Medir resistencia con banco energizado",
        "result": "La prueba se bloquea por condiciones de medida incorrectas.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-can-node",
    "title": "Un nodo domina una red de prueba",
    "topic": "redes",
    "difficulty": "Avanzado",
    "symptom": "La comunicación del banco CAN queda dominada al conectar un módulo de práctica.",
    "context": "Laboratorio CAN de baja tensión, alimentación limitada y aislado de automóviles reales.",
    "solution": "node",
    "reason": "El bus funciona normalmente sin el nodo B. Cuando se lo incorpora se detecta estado dominante persistente; aislarlo restaura las tramas. En el modelo el transceptor de ese nodo permanece atascado.",
    "source": "https://kvaser.com/can-protocol-tutorial/",
    "choices": [
      [
        "termination",
        "Falta una terminación en un extremo"
      ],
      [
        "node",
        "Transceptor del nodo B atascado en dominante"
      ],
      [
        "software",
        "Error de un mensaje DBC exclusivamente"
      ]
    ],
    "probes": [
      {
        "id": "baseline",
        "label": "Capturar el bus con nodos A y C",
        "result": "Tramas y arbitraje normales; la topología mantiene terminaciones adecuadas.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "node",
        "label": "Incorporar nodo B y comparar diferencial simulado",
        "result": "El estado dominante persiste tras incorporar B y cesa al aislarlo del banco.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "power",
        "label": "Medir alimentación del nodo B",
        "result": "La alimentación regulada del nodo B está dentro del rango.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "unknown",
        "label": "Inyectar tramas al CAN de un vehículo desconocido",
        "result": "Acción no permitida; el laboratorio debe permanecer aislado.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-lin-supply",
    "title": "Actuador LIN sin respuesta",
    "topic": "redes",
    "difficulty": "Intermedio",
    "symptom": "Un actuador esclavo LIN no responde a las solicitudes del maestro.",
    "context": "Banco LIN simulado en baja tensión. No representa una topología OEM concreta.",
    "solution": "supply",
    "reason": "Las solicitudes del maestro se observan, pero la alimentación del esclavo está ausente. En el banco, restablecer su alimentación protegida recupera las respuestas.",
    "source": "https://www.csselectronics.com/pages/lin-bus-protocol-intro",
    "choices": [
      [
        "linwire",
        "El bus LIN está físicamente cortado"
      ],
      [
        "supply",
        "No llega alimentación al esclavo LIN"
      ],
      [
        "master",
        "Maestro LIN incapaz de enviar cabeceras"
      ]
    ],
    "probes": [
      {
        "id": "headers",
        "label": "Observar tramas del maestro en el banco",
        "result": "Las cabeceras llegan al conector del esclavo.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "voltage",
        "label": "Comprobar alimentación en el conector del esclavo",
        "result": "El pin de alimentación está a 0 V cuando el diagrama del banco requiere 12 V.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "restore",
        "label": "Restablecer virtualmente la alimentación mediante banco protegido",
        "result": "El esclavo vuelve a responder a las solicitudes.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "bridge",
        "label": "Puente libremente pines desconocidos",
        "result": "Prueba insegura bloqueada.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-uds-pending",
    "title": "La ECU responde con NRC 0x78",
    "topic": "redes",
    "difficulty": "Intermedio",
    "symptom": "El cliente UDS recibe una respuesta negativa temporal y el técnico interpreta que la ECU dejó de responder.",
    "context": "Intercambio UDS sintético de lectura de datos; no se envían solicitudes a equipos reales.",
    "solution": "pending",
    "reason": "En UDS, NRC 0x78 indica 'response pending': la solicitud fue recibida pero la operación todavía no completó. El registro posterior incluye una respuesta positiva dentro del tiempo esperado del banco.",
    "source": "https://www.csselectronics.com/pages/uds-protocol-tutorial-unified-diagnostic-services",
    "choices": [
      [
        "pending",
        "Operación en curso: response pending"
      ],
      [
        "timeout",
        "Ausencia total de comunicación física"
      ],
      [
        "firmware",
        "Firmware necesariamente corrupto"
      ]
    ],
    "probes": [
      {
        "id": "trace",
        "label": "Revisar el contenido de la respuesta UDS",
        "result": "Se observa una respuesta negativa 0x7F con código NRC 0x78.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "follow",
        "label": "Inspeccionar la siguiente respuesta en la captura sintética",
        "result": "A continuación se registra respuesta positiva al servicio solicitado.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "network",
        "label": "Analizar tramas físicas del banco",
        "result": "No hay errores físicos de comunicación registrados.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "flash",
        "label": "Reprogramar módulo por un NRC aislado",
        "result": "La acción está injustificada y no se realiza.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-cell-capacity",
    "title": "Capacidad útil reducida en datos BMS",
    "topic": "ev",
    "difficulty": "Avanzado",
    "symptom": "La autonomía de una batería virtual disminuyó en ensayos comparables.",
    "context": "Modelo de batería de baja tensión simulada con referencia nueva de 60 Ah; misma temperatura y ventana de ensayo. No hay paquete real.",
    "solution": "capacity",
    "reason": "Bajo el protocolo fijado, se integran 48 Ah útiles frente a 60 Ah de referencia: SOH basado en capacidad = 80%. Esto indica reducción de capacidad útil del modelo, sin identificar químicamente la causa.",
    "source": "https://pybamm.org/",
    "choices": [
      [
        "soc",
        "El pack está necesariamente a SOC del 80%"
      ],
      [
        "capacity",
        "Capacidad útil reducida: SOH por capacidad ≈80%"
      ],
      [
        "inverter",
        "Inversor con cortocircuito confirmado"
      ]
    ],
    "probes": [
      {
        "id": "curve",
        "label": "Comparar descarga a temperatura y corriente idénticas",
        "result": "Los ensayos emplean temperatura y corriente equivalentes a la referencia.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "integrate",
        "label": "Integrar corriente de descarga de la batería simulada",
        "result": "Carga útil de la prueba: 48 Ah, respecto de capacidad nueva de 60 Ah.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "sensor",
        "label": "Revisar calibración del sensor simulado",
        "result": "El sensor de corriente no presenta sesgo en esta prueba.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "open",
        "label": "Abrir un paquete HV de un vehículo para reproducir el caso",
        "result": "Acción no permitida: solo datos simulados.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-dcdc-inhibit",
    "title": "Bus auxiliar sin carga en vehículo virtual EV",
    "topic": "ev",
    "difficulty": "Avanzado",
    "symptom": "En el gemelo digital de un EV, el convertidor DC/DC no eleva la tensión del bus auxiliar durante el modo solicitado.",
    "context": "Simulación exclusivamente digital de lógica de habilitación; sin procedimientos sobre alta tensión.",
    "solution": "inhibit",
    "reason": "En el registro digital, la lógica impide habilitar el convertidor por una condición de interlock no satisfecha. No se concluye fallo físico del convertidor sin una orden válida de habilitación.",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm",
    "choices": [
      [
        "dcdc",
        "DC/DC internamente averiado"
      ],
      [
        "inhibit",
        "Convertidor inhibido por lógica de seguridad"
      ],
      [
        "auxbattery",
        "Batería auxiliar inevitablemente defectuosa"
      ]
    ],
    "probes": [
      {
        "id": "voltage",
        "label": "Leer variables sintéticas del bus auxiliar",
        "result": "El bus permanece en 12,1 V y no hay comando activo de carga.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "interlock",
        "label": "Revisar estados de habilitación del modelo",
        "result": "El flag de permiso DC/DC es falso por condición de interlock no satisfecha.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "physical",
        "label": "Verificar datos del sensor virtual de batería auxiliar",
        "result": "El modelo informa señales coherentes de batería auxiliar.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "bypass",
        "label": "Puente físico de interlock de alta tensión",
        "result": "Actividad prohibida: jamás simular como práctica de taller real.",
        "critical": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "case-resolver-model",
    "title": "Control de motor en simulador de tracción",
    "topic": "ev",
    "difficulty": "Avanzado",
    "symptom": "El controlador simulado limita el par por error de coherencia de posición de rotor.",
    "context": "Modelo matemático de inversor y sensor de posición; no existe conexión a motor real ni sistema HV.",
    "solution": "resolver",
    "reason": "El modelo muestra discrepancia entre la estimación cinemática y la señal sintetizada del resolver; la alimentación simulada permanece dentro del rango. La falla reside en la cadena de posición virtual.",
    "source": "https://www.mathworks.com/help/mcb/ug/resolver-position-sensing.html",
    "choices": [
      [
        "resolver",
        "Señal de posición de rotor incoherente"
      ],
      [
        "cooling",
        "Sobretemperatura térmica del inversor"
      ],
      [
        "bms",
        "Capacidad de celdas del BMS reducida"
      ]
    ],
    "probes": [
      {
        "id": "rpm",
        "label": "Contrastar velocidad mecánica simulada y posición medida",
        "result": "La velocidad modelo es constante, pero la posición obtenida presenta saltos.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "resolver",
        "label": "Examinar seno/coseno del resolver virtual",
        "result": "La pareja seno/coseno de referencia presenta discontinuidad sintética bajo giro regular.",
        "critical": true,
        "unsafe": false
      },
      {
        "id": "temps",
        "label": "Consultar temperaturas del modelo",
        "result": "Temperaturas del motor e inversor dentro de límites simulados.",
        "critical": false,
        "unsafe": false
      },
      {
        "id": "touch",
        "label": "Sondear un inversor real energizado para repetir el ensayo",
        "result": "Práctica prohibida sin entrenamiento HV y procedimiento OEM.",
        "critical": false,
        "unsafe": true
      }
    ]
  }
];
