# MA00 — Edad mecánica: investigación exploratoria OBD v0

**Estado (2026-10-28):** prototipo sintético, NO calibrado, integrado en el menú «Edad mecánica R&D» de esta rama. Aún no se ha probado con vehículos reales ni auditado filas de datasets externos. NO mide edad real, desgaste permanente ni vida remanente.

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

## Inventario de datos públicos (documentación verificada; archivos todavía NO descargados ni perfilados)

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
