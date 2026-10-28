# MA00 — Edad mecánica: investigación exploratoria OBD v0

**Estado (2026-10-28):** prototipo no calibrado integrado en «Edad mecánica R&D». Se ejecutaron auditorías de archivos reales de EngineFaultDB y DieselOBD (véase evidencia más abajo), pero **no hay mediciones físicas de motores para validar envejecimiento ni muestras OBD instrumentadas propias**. NO mide edad real, desgaste permanente ni vida remanente. Para el contrato de evidencia y las limitaciones temporales por PID, ver [protocolo de adquisición MA00 v1](MECHANICAL_AGE_ACQUISITION_PROTOCOL_V1.md).

## Hipótesis falsable

Bajo idéntico protocolo y en el mismo vehículo, las señales OBD permiten cuantificar cambios reproducibles de funcionamiento tras el mantenimiento. Reducir anomalías no demuestra rejuvenecimiento estructural: las correcciones de inyección o RPM pueden variar con temperatura, combustible, ECU, sensores y accesorios.

H0: las variaciones intersesión no superan la repetibilidad y las condiciones operativas. H1: los indicadores controlados discriminan cambios funcionales de la variación normal. Hipótesis futura, NO probada: indicadores funcionales permiten estimar desgaste físico o supervivencia cuando se calibren contra pruebas mecánicas independientes.

## Contrato implementado

Expediente JSON: vehicleAlias anónimo (no VIN/patente), engineFamily, protocol=warm-idle-fixed-load-v0, phase=before_service/after_service, source=synthetic/provided_obd_unverified y muestras ordenadas por timeMs, rpm, ectC, loadPct, stftPct, ltftPct, iatC opcional. Las lecturas manualmente introducidas se declaran no verificadas.

Condiciones educativas: 20–10000 muestras, ≥19 s, ECT mediana 75–110 °C y amplitud ≤5 °C, RPM mediana 550–1150, carga mediana ≤35 % y amplitud ≤10 puntos. Antes/después exige mismo vehículo/familia, procedencia, protocolo, diferencias de mediana RPM ≤80, ECT ≤5 °C, carga ≤5 puntos e IAT ≤7 °C (si disponible). Límites ilustrativos, NO tolerancias del fabricante ni aplicables a todos los motores.

Magnitudes exploratorias (sin respaldo empírico de envejecimiento):
- r = 1.4826 × MAD(RPM), dispersión robusta de ralentí.
- t = mediana(STFT + LTFT), sólo si existen ambas señales.
- D = redondear(100 × (0.4 × clip((r−4)/55,0,1) + 0.6 × clip((|t|−5)/20,0,1))).

D mide una desviación funcional artificial de 0 a 100, NO salud %, edad, desgaste, pronóstico ni diagnóstico. Pesos y umbrales son decisiones didácticas que deberán retirarse/calibrarse. Si faltan trims (p.ej. diésel) el índice queda inconcluso: no imputar señales inexistentes. Desgaste estructural, edad equivalente y RUL: siempre null. Las mediciones no se guardan; todo queda en RAM de la vista hasta navegar o recargar. El ejemplo se genera con syntheticServicePair() y no usa coches reales.

## Inventario de fuentes (catálogo inicial; EngineFaultDB y DieselOBD auditados posteriormente)

| Fuente | Para qué sirve | Brecha principal |
| --- | --- | --- |
| [DieselOBD, Lounis et al. 2025](https://github.com/AbouAbdallah-Lounis/OBD-Dataset), 8 diésel, PIDs LOAD/ECT/MAP/RPM/VSS/IAT/MAF/FRP/BARO/VPWR/AAT y DTC, CC BY 4.0 declarada | Anomalías y generalización entre unidades | No STFT/LTFT ni etiqueta independiente de desgaste; ciertas clases se concentran en un vehículo; XLSX/CBF requieren adaptación |
| [EngineFaultDB (2023)](https://github.com/leoxthomas/EngineFaultDB), 55.999 lecturas de motor C14NE con fallas de laboratorio | Distinguir funcionamiento normal/falla en condiciones de laboratorio | Un solo motor, no historias de desgaste ni dos sesiones antes/después; verificar derechos de reutilización: repositorio incluye LICENSE GPL-3.0, publicación menciona uso académico |
| [LEVIN Open Data](https://github.com/YunSolutions/levin-openData), aprox. 30 autos y cuatro meses, OBD 1 Hz/acelerómetro 25 Hz, CC BY-NC-SA | Condiciones de uso longitudinal y muestreo | Sin mediciones independientes de deterioro; fuentes alojadas en servicios externos; restricción no comercial |
| [Vibraciones de cojinetes (2024)](https://data.mendeley.com/datasets/3fcrrdjjvk/5), >500 archivos sanos/defectuosos, CC BY 4.0 | Falla por instrumentación adicional | No cuantifica envejecimiento longitudinal |
| [NASA C-MAPSS](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/) | Métodos de pronóstico run-to-failure | Turbinas aeronáuticas simuladas; no validar edad automotriz |

**Regla de integridad:** miles de filas procedentes de ocho vehículos NO equivalen a miles de motores. Separar entrenamiento y prueba por vehículo/sesión; prohibir mezcla temporal de un mismo vehículo; reservar flota/familia externa y comparar contra baseline kilometraje + DTC. No interpretar exactitud sobre filas correlacionadas como generalización. Los ocho diésel no contienen las variables necesarias para aplicar directamente D v0.

## Fases de evaluación

1. Ingesta: checksum/versión/licencia, columnas, unidades, filas, timestamps, distribución por vehículo, faltantes, rangos físicos, duplicados y leakage.
2. Referencia operacional: mismo vehículo y combustible, temperatura estable, ventiladores/A-C/cargas controlados, estado de lazo cuando aplique. Nunca hacer service innecesario como requisito metodológico.
3. Repetibilidad sin intervención: varias sesiones independientes para cuantificar variación natural antes de juzgar cambio de service.
4. Validar desviación funcional con DTC y pruebas independientes; falsos positivos y capacidad de abstención.
5. Desgaste físico: compresión, fugas, presión de lubricación, análisis de aceite, blow-by y banco instrumentado; contrastar hipótesis.
6. Edad mecánica equivalente: sólo con una cohorte suficientemente grande, verdad-terreno independiente, estimación de incertidumbre y grupos no vistos.

## Verificación y límites

Ejecutar: node --test tests/mechanical-age-research.test.js tests/service-worker.test.js ; npm run build ; npm run build:site (con npm ci previamente).

El workflow mechanical-age-research.yml valida esta rama solamente, sin deploy ni merge. La investigación sintética no puede certificar mecánica ni justificar intervenciones de riesgo.


## Evidencia empírica ejecutada (2026-10-28)

Estos números proceden de los **archivos originales** recuperados por las Actions en esta rama, fijados a commits y blobs Git inmutables. El workflow **no añade las bases de terceros al repositorio**, únicamente artefactos agregados de auditoría.

### EngineFaultDB, fuente inspeccionada

- Commit de origen c63f23ba048761d9c2a2c95d8fb4c0392a3c63d3; blob del CSV f68678f7e08a6902ac2955d18d7fbb2624ae6b8a; 5.334.236 bytes.
- 55.999 filas, 15 columnas (14 variables más Fault).
- Clases: Fault=0 16.000; Fault=1 10.998; Fault=2 15.000; Fault=3 14.001.
- Un registro completo duplicado exactamente. Las cuatro clases están en **cuatro bloques consecutivos**, de modo que el orden de filas tampoco constituye un eje de tiempo verificable.
- AFR es casi determinísticamente 14,7 × Lambda, con error absoluto medio de redondeo ~0,003678 y máximo ~0,0078; no se deben contar como dos observaciones independientes.
- No hay columna VIN/unidad, timestamp, odómetro, intervención de mantenimiento ni deterioro estructural verificado. El propio estudio reporta ensayos sobre un mismo motor C14NE. **No puede evaluar generalización entre vehículos ni edad mecánica**.
- Script ejecutable: tools/audit-enginefaultdb.mjs. Verifica byte count y SHA Git blob antes de emitir el JSON de auditoría; la CI descarga de un commit fijo y solo publica agregados.

### DieselOBD, dos libros XLSX originales inspeccionados

- Commit de origen a9c96dc146aeeb62ef75d3b453c238f5379ccff5; blobs MASTER_TRAIN_X.xlsx=ca5fcf99ae8d2edc7c04b5636a1b18839df7dd52, MASTER_TEST_X.xlsx=f76b794fac48ee3f2ad74214757272e7ab2cd9e6.
- MASTER_TRAIN_X.xlsx: **118.477 filas de datos, 27 columnas**; MASTER_TEST_X.xlsx: **33.838 filas de datos, 27 columnas**; total 152.315 filas.
- Cada libro muestra 11 PIDs documentados y 14 columnas DTC. **No aparece un campo explícito de identidad de vehículo reconocido por la auditoría**; el número de vehículos independientes es *desconocido* para estos archivos transformados, **NO cero vehículos**. La descripción pública menciona ocho vehículos pero no restituye la agrupación de cada fila.
- Por tanto, no se puede demostrar separación vehículo-a-vehículo entre training y test, aunque los nombres indiquen que están separados. **No presentar sus métricas de filas como validación de generalización**.
- Script tools/audit_dieselobd_workbooks.py usa openpyxl para leer los XLSX originales y valida blob Git/bytes antes de contar; no reimplementa XLSX y no inventa ID o edad.

### Gates no negociables descubiertos al auditar

1. **Edad/vida/desgaste físico:** siempre "no determinado" hasta contar con una verdad-terreno independiente. Ninguno de los dos conjuntos tiene etiquetas de vida útil.
2. **Modelos supervisados por vehículo:** no entrenar/declarar resultados de generalización con train/test sin ID de vehículo. Reunir datos con ID anónimo y sesiones identificadas o fuente alternativa.
3. **Pseudorreplicación:** las muestras OBD correlacionadas no son motores independientes; las clases de EngineFaultDB están en bloques, y las 152.315 filas de DieselOBD NO representan 152.315 unidades.
4. **Calibración de scores:** los parámetros 0,4/0,6 y umbrales del indicador D se ejecutan **exclusivamente para el ejemplo sintético**. Datos OBD externos: características y condiciones, sin score.
5. **Repetibilidad:** nuevo src/mechanical-age-repeatability.js exige al menos dos sesiones distintas antes y dos después, confronta condiciones y muestra rangos entre sesiones sin fabricar p-value, intervalo de confianza ni efecto causal.

## Balance crítico de MA00

**Resultado obtenido:** pipeline y evidencias reproducibles, calidad estructural de dos bases públicas, captura y normalización básica, abstención ante falta de inferencia, laboratorio sintético con replicación. **No obtenido:** predicción de desgaste real, modelo calibrado por familia, capacidad de comparar motores reales, pronóstico de vida/edad mecánica. **Riesgo decisivo:** incluso un clasificador de fallas muy preciso puede ser incapaz de estimar la degradación. El trabajo prioritario siguiente es conseguir cohortes longitudinales con identidad por vehículo y medidas físicas, no subir la complejidad del modelo.


## MA00 — Falsación adversarial (tanda 2026-10-28)

La rutina \`src/mechanical-age-falsification.js\` genera cinco controles **100 % sintéticos** y los expone en la PWA con «Intentar refutar el índice». El propósito es documentar la **no identificabilidad** de desgaste a partir de una combinación de RPM y correcciones de combustible, incluso en condiciones de medición que el validador considera comparables.

| Control experimental | Alteración programada (motor físico no simulado) | Resultado esperado |
| --- | --- | --- |
| Nulo | Los canales operativos son idénticos, solo se desplaza el reloj | Delta de índice cero |
| Sesgo de STFT | Añadir +11 puntos porcentuales a STFT, sin alterar mecanismo alguno | El índice puede cambiar sin existir desgaste real |
| Trims opuestos | Añadir +14 puntos a STFT y -14 puntos a LTFT | La suma queda idéntica y el índice no ve la alteración |
| Térmico | Subir ECT 8 °C | Bloqueo por falta de comparabilidad |
| Carga | Subir carga OBD 7 puntos | Bloqueo por falta de comparabilidad |

**Lectura crítica:** cumplir las pruebas automáticas de este harness valida que los ejemplos adversariales exhiben exactamente los puntos débiles predefinidos; **no valida el método**, ni demuestra cuánto desgaste físico detectaría. Los valores +11/+14/-14 son perturbaciones artificiales ilustrativas, no errores típicos inferidos de un taller. Distinguir sensor degradado de motor degradado requiere sensores redundantes, instrumentos calibrados, pruebas físicas y modelado causal. La estructura actual no controla estado cerrado de mezcla, banco de inyección, refrigeración por ventilador, software/adaptaciones ECU o posición de accesorios, por lo que **no se autoriza puntuar vehículos reales**, aunque un operador declare condiciones equivalentes.

### Criterios de falsación pre-registrados para la futura fase con datos reales

1. **A–A sin intervención:** repetir el protocolo en días y operadores diferentes. Si el modelo detecta sistemáticamente «mejora» en ausencia de intervención, rechazar el índice.
2. **A–B intervenido:** medir al menos dos sesiones antes/después, registrar fecha, trabajo efectivamente realizado, aceite, combustible, carga eléctrica, temperatura ambiente y calibración del lector. Comparar contra el A–A y controlar regresión a la media.
3. **Prueba instrumental ciega:** introducir errores conocidos de un sensor o comparar con referencia independiente, sin revelar al algoritmo la condición hasta cerrar su predicción.
4. **Prueba mecánica ciega:** contraste contra compresión/leak-down, blow-by, lubricación y verificaciones de componentes; no utilizar la propia telemetría OBD como etiqueta de desgaste.
5. **Validación externa:** separación por ID de motor, taller, marca/familia, entorno, y cohorte temporal; reportar abstenciones, falsos positivos, incertidumbre por motor (no por fila) y calibración bajo cambio de dominio.
6. **Regla de parada:** sin verdad-terreno de desgaste no entrenar ni publicar equivalencia kilométrica, edad, porcentaje de salud o RUL.

## Nuevos candidatos para el catálogo de evidencias

Estas fuentes se localizaron en sus fichas públicas; **no se han descargado ni inspeccionado sus registros**. No son sustitutos de una cohorte con OBD, identificación por motor y desgaste medido.

| Fuente | Qué podría aportar | Advertencia |
| --- | --- | --- |
| [Aceites de pick-ups diésel 2,5 L, Palacio 2021](https://data.mendeley.com/datasets/49v4wjwp5n/1) | Composición elemental por XRF en lubricantes usados; posible biomarcador físico complementario | El metal en el aceite depende también de kilómetros desde el cambio, filtro, aporte externo, rellenados, laboratorio y materiales; sin trazabilidad unidad/servicio no significa edad física |
| [DLR Turbofan Sensor FDI benchmark v1.1](https://doi.org/10.5281/zenodo.20053482) | Señales sintéticas con desgaste de turbina, fallas de sensor, deriva y variabilidad operativa; sirve para refutar la confusión sensor/activo | No es un motor automotriz ni datos reales; no validar edad de automóvil |
| [Lenze-GD geared motor run-to-failure](https://zenodo.org/records/11162448) | Tres repeticiones hasta fallo con condiciones de carga documentadas | Motorreductor industrial no equiparable a motor de combustión en uso |
| [Marine Engine Fault 2026](https://zenodo.org/records/19857425) | Datos reales de banco de un motor marino con cinco fallas inducidas y referencia nominal | Falla inducida y carga controlada, no envejecimiento longitudinal de automóviles |

### Consecuencia para diseño de base de datos

El registro de estudio futuro deberá guardar, además de lecturas: \`anonymizedEngineId\`, \`independentSessionId\`, \`captureTime\`, \`prePostServicePhase\`, \`serviceEventId\`, \`engineFamily\`, \`sensorSource\`, \`closedLoopEvidence\`, \`ambientAndAccessoryContext\`, \`instrumentCalibration\` y \`independentMechanicalReference\`. No introducir VIN, patente, propietario ni otros identificadores personales en artefactos de CI. La ausencia de estos metadatos bloqueará inferencias sobre edad, incluso si existen cientos de miles de filas.


**Ejecución y costos de CI (28/10/2026):** los cambios de rama ejecutan validación del módulo, tests unitarios, compilación y E2E; las descargas de EngineFaultDB y DieselOBD quedaron bajo `workflow_dispatch` manual para evitar rehacer auditorías idénticas en cada commit. La verificación de procedencia sigue fijada por commit/blob y los informes anteriores no cambian. Pushes superados se cancelan para no gastar minutos innecesarios; ninguna ejecución despliega producción.


## Puerta documental MA00 v1

Se agregó src/mechanical-age-evidence.js: las capturas externas sin metadatos documentados de sesión, reloj, adaptador, estado de lazo, A/C, ventilación, carga y ambiente **no se declaran comparables**. Una declaración completa es solo información aportada por el operador, no evidencia de calibración o autenticidad. El score sintético nunca se aplica a datos externos. Las fechas de captura con calendario imposible o sin zona horaria se rechazan; un replay con timestamps alterados no cuenta como sesión independiente. Ver [protocolo detallado](MECHANICAL_AGE_ACQUISITION_PROTOCOL_V1.md). Las evaluaciones por fila no se consideran unidades estadísticas independientes y el OBD interrogado secuencialmente no acredita sincronía entre PIDs.
