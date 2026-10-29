# MA00 R13 — Observabilidad, límites y causas alternativas

Documento de ingeniería, NO guía para diagnosticar una avería real. La fuente normativa SAE J1979/ISO 15031-5 define servicios/PIDs; la disponibilidad del PID depende de ECU, vehículo, estado operacional y adaptador. La documentación de AutoLab Academy **no** sustituye manuales de taller, calibración independiente ni autorización del vehículo.

## Matriz de tecnología y condiciones

| Tipo y combustible declarados | Señales Mode 01 que pueden observarse | Reglas de interpretación actualmente habilitadas | Qué NO podemos afirmar |
| --- | --- | --- | --- |
| Gasolina ICE, gasolina, lazo cerrado declarado, ralentí caliente | 010C RPM, 0105 ECT, 0104 carga, 0106 STFT, 0107 LTFT, opcional 010F IAT; 0103 estado de combustible si serial | Descripción y comparación controlada **solo** si todos los PIDs requeridos están disponibles y se cumple calidad documental | Sensor auténtico, causalidad de trims, falla confirmada, compresión, desgaste, vida |
| Gasolina con GNC | Pueden observarse RPM, ECT, carga y trims si ECU los informa | **Señales individuales solamente**: sin perfil por combustible/estrategia gas no habilitamos el criterio gasoline-only | Que trims sean iguales entre gasolina y gas o distingan falla de ajuste GNC |
| Diésel ICE | RPM, temperaturas, carga y otros PIDs donde ECU los publica | **Señales individuales solamente**: no aplicar lógica STFT/LTFT de gasolina | Estado de inyectores/compresión desde trims de gasolina |
| HEV | Según estado ICE on/off y arquitectura eléctrica; algunos PIDs genéricos | **Señales individuales solamente** hasta segmentar estado ICE/carga/regeneración | Que 19 s a ralentí indiquen condición equivalente a un ICE convencional |
| BEV | PIDs genéricos eventualmente parciales, o diagnóstico específico no implementado | **Señales individuales solamente**, sin protocolo de combustión | Ralentí térmico, correcciones combustible, salud HV/batería o vida RUL |
| Desconocido / mixed | Lo explícitamente recibido | **Abstención** de interpretación de trims o desgaste | Tipo de motor por nombre, VIN inventado o presencia de un PID |

La detección de soporte es **declarativa**, no autentica combustible, motor, CAN/UDS ni firmware. Reglas implementadas en \`src/mechanical-age-r13-observability.js\`, y reportes protegidos por \`src/mechanical-age-r13-claims.js\`.

## Mapa de mecanismos indistinguibles

| Observación | Hipótesis A | Hipótesis B igualmente posible | Prueba teórica discriminante | Capacidad MA00 actual |
| --- | --- | --- | --- | --- |
| STFT/LTFT elevados | Aire no medido en admisión | Presión/caudal de combustible alterado o sonda lambda sesgada | Contrastar trims bajo cargas controladas y corroborar fugas/presión/lambda con instrumentos externos | No identifica causa |
| RPM de ralentí variables | Estrategia de control de aire inestable | Encendido, compresión, carga eléctrica o sensor defectuoso | Medidas de contribución por cilindro y prueba mecánica independiente | No identifica causa |
| ECT diferente entre sesiones | Termostato/control térmico | Sensor ECT sesgado, ambiente, ventilador | Corroborar temperatura físicamente con instrumento adecuado | No identifica causa |
| STFT+LTFT aparentemente compensados | Cambios reales cancelados | Modificaciones opuestas en control/medición sin desgaste | Separar ambos trims, revisar régimen y medir fenómeno por vía independiente | Suma oculta información |
| Ralentí repetible | Estabilidad de control bajo condiciones ensayadas | Sensores estables/fijos/cuantizados pueden simular repetibilidad | Observación independiente del mismo fenómeno | No prueba salud ni ausencia de desgaste |

**Identificabilidad:** con un solo conjunto de PIDs muchas causas inducen observaciones equivalentes. En ese caso, cualquier informe debe devolver \`no_identificable\` o \`hypothesis_not_diagnosis\`. No se publican probabilidades de falla sin distribuciones previas y likelihoods contrastadas externamente.

## Jerarquía de expedientes de evidencia

- \`ObservedSignal\`: PID, unidad, byte raw opcional, tiempo de petición y recepción **HOST**, precisión digital, origen declarado. Adquisición ECU real = desconocida.
- \`ObservationContext\`: tecnología y combustible **declarados**, estado de lazo, sesión, régimen, ambiente, carga y adaptador. No se rellenan con el nombre de una familia de motor.
- \`EvidenceClaim\`: categoría, nivel E0–E5, sourceIds y contenido; hipótesis exigen alternativa y predicción/prueba falsable; bloqueos físicos solo valores \`null\`.
- \`Hypothesis\`: mecanismo alternativo, causas competidoras, condiciones de falsación y pruebas seguras propuestas, no pasos de intervención automática.
- \`AbstentionReason\`: señal faltante, régimen incompatible, datos de calidad insuficiente, canal no identificado, fenómeno no observable y ausencia de validación física.

El registro de los campos de los cinco **informes principales** se guarda como JSON en \`docs/ma00/claims.json\`. El módulo de ejecución mantiene una whitelist que rechaza campos agregados sin clasificación. Los reportes de modelos de investigación NASA, módulos auxiliares antiguos, campos arbitrarios en \`channels\` y metadatos de terceros requieren auditorías adicionales antes de declarar el **gate de 100% de R13** completamente satisfecho.

## Pruebas adversariales de R13

1. Inyectar \`healthScore:99\`, \`structuralWear:12\`, \`mechanicalAgeKm\` o un claim nuevo sin registro: debe fallar cerrado.
2. Inyectar un subcampo de un informe como \`secretWearProbability\`: debe fallar en la frontera del contrato.
3. Cambiar la tecnología de una demo gasolina hacia diésel/GNC/HEV/BEV preservando sus números: **no** mantiene la interpretación de trims.
4. Omitir 0106/0107 o declarar lazo abierto: abstención de interpretación gasolina.
5. Pasar fuente externa con índice sintético ≠ null: rechazo.
6. Emitir hipótesis sin alternativa y predicción falsable: rechazo.
7. Mantener datos RAW sin autenticación física y E4/E5 no disponibles.

No reabrir los TEST NASA FD001–FD004, no presentar un algoritmo como diagnóstico de un vehículo y no mezclar calidad de código con validación física.
