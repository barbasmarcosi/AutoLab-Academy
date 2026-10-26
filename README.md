# AutoLab Academy

PWA para estudiar y entrenar **diagnóstico electrónico automotriz, redes CAN y electromovilidad**.

## Seguimiento de implementación

El avance real, criterios de cierre y próximas etapas están en [**Estado de implementación de Automotive R&D**](docs/IMPLEMENTATION_STATUS_RD.md). Este documento distingue funciones implementadas, validación automatizada pendiente y ensayos físicos externos.

## Visión de evolución (propuesta)

Además del diagnóstico basado en evidencias, aspiramos a formar profesionales capaces de **entender la mecánica del vehículo completo, investigar sistemas, optimizarlos y crear herramientas propias**. El plan [Diagnostic Engineering + Automotive R&D](docs/ENGINEERING_MINDSET_RD_VISION.md) conecta tres ejes:
 
- [**Automotive Mechanics Core**](docs/AUTOMOTIVE_MECHANICS_CURRICULUM.md): formación integral sobre motores, transmisiones, suspensión, dirección, frenos, HVAC, electricidad, electrónica e híbridos/EV.
- [**Rotary Engineering Lab**](docs/ROTARY_ENGINEERING_LAB.md): investigación del motor Wankel, geometría, sellos, puertos, combustión, ECU, fiabilidad y optimización; incluye un primer explorador geométrico offline RW0/RW1.
- **Diagnostic Engineering + Automotive R&D**: experimentos comparativos, ingeniería inversa, herramientas propias, perfiles de ECU **simulados** y validación reproducible.

**Estado actual:** MC00–MC14 dispone de un recorrido conceptual y varios laboratorios; Rotary Engineering incluye RW1, RW2/RW3, RW4/RW4+, RW5, RW6/RW6+/RW6++, RW7 y RW8/RW8+ en distintos niveles de modelización sintética. Esto no equivale a competencias físicas certificadas ni a validar motores reales. Consultá el estado de implementación para identificar las partes pendientes.

El laboratorio **RW0/RW1 (Rotary Geometry Explorer)** ahora tiene cinemática Wankel simplificada, animación offline, cámaras y predicciones con evidencia persistida. El primer Rotary Research Bench compara la sensibilidad geométrica A/B frente a cambios sintéticos de excentricidad, sin atribuir mejoras de rendimiento. El RW1 no simula combustión ni representa volúmenes OEM. Otros laboratorios sí modelan conceptos simplificados de energía, puertos y control, pero no calculan rendimiento ni combustión real de un Wankel. [Modelo, fuentes y limitaciones](docs/ROTARY_GEOMETRY_MODEL.md).

**Incremento MC-P1 / RW-P2 inicial:** cuatro lecciones de seguridad, metrología, torque y ciclos (MC00/MC01/MC03), doce preguntas incorporadas a los exámenes y al repaso. RW4 ofrece diagnóstico diferencial sintético entre pérdidas de estanqueidad e ignición, con semillas reproducibles, predicción de dos pruebas, incertidumbre e informe en portafolio. No corresponde a mediciones reales de compresión o calibraciones OEM.

## Qué está implementado

- **Transferencia diagnóstica:** cinco familias con causas y síntomas alternativos: ECU/CKP, presión/MAF, CKP/CMP, CAN terminación/saturación y HEV auxiliar/interlock virtual. Exige hipótesis previa, prueba confirmatoria, descarte, contexto, pronóstico y límites; 20 combinaciones de casos ficticios reproducibles.
- **Transferencia entre problemas:** cinco pares parametrizados con solución guiada seguida de una situación distinta (ley de Ohm inversa, PWM, CKP, carga CAN y SOC). Los resultados de la segunda situación se registran independientemente y se exportan; no demuestran generalización profesional.
- **Errores por pregunta y reentrenamiento:** a partir de v1.7 cada nuevo examen guarda opción elegida, corrección y confianza; detecta últimas respuestas incorrectas, errores repetidos y exceso de confianza, permite repasar preguntas falladas y exportar evidencia. Nunca reconstruye artificialmente exámenes antiguos.
- **Plan de estudio personalizable y local:** detecta repaso FSRS vencido, últimos exámenes por área, prácticas ficticias pendientes y lecciones no leídas. Permite sesiones de 15/30/45 minutos, acceso a la actividad y exportación Markdown; no inventa dominio o califica texto libre.
- Academia con 91 lecciones, 266 preguntas, exámenes acumulativos equilibrados (15 preguntas de todas las áreas), y calendario de repaso adaptativo FSRS mediante librería ts-fsrs.
- Itinerario de dieciséis niveles (diagnóstico, mecánica e investigación rotativa), progreso de lectura y evaluación separados, con siguiente lección recomendada.
- **Taller Integrador:** tres expedientes multifuente (OBD, oscilogramas, circuitos y contexto) con hipótesis inicial, confirmación y descarte, incertidumbres, cadena auditada de evidencias e informes completos persistidos en backup/Portafolio. Solo datos sintéticos.
- **Balance de cilindros:** 4 investigaciones de monitor P030x sintético: bobina primaria sin corriente, inyector abierto, compresión comparativa baja y aporte irregular por mezcla. Requiere comparar regímenes y obtener medición confirmatoria más prueba de contraste, sin algoritmos OEM.
- **Inyección OBD:** 4 investigaciones MPI ficticias con comparación STFT/LTFT por ralentí/crucero/carga, plausibilidad MAF/MAP, lambda ilustrativa y pruebas independientes para aire adicional, presión insuficiente, MAF y estanqueidad de inyector. Informe Markdown; no es una calibración OEM.
- **Capturas temporales:** cuatro casos de correlación multicanal (CKP, CMP, inyector mando/corriente y alimentación ECU) en un buffer de seis ventanas; la falla intermitente aparece una vez. Exige observar dos canales en una ventana sana y otra anómala, elegir causa y exportar informe.
- **Diagnóstico diferencial:** tres investigaciones con dos posibles fallas cada una, observaciones/curvas idénticas que requieren pruebas discriminantes, pronósticos previos e informe reproducible, sin diagnósticos OEM.
- **Banco ECU** con cinco casos sintéticos, pronóstico antes de observar, elección de pruebas confirmatorias, justificación e informe descargable.
- Taller virtual con 15 casos de una falla y 3 escenarios de **dos fallas simultáneas**; hipótesis previas, evidencias independientes, corrección y exportación de informes. Las cifras son educativas y requieren revisión técnica externa.
- **Retos de medición:** cinco ejercicios parametrizados, uno por área, con resultados numéricos, elección de mediciones y argumentación técnica; rúbrica objetiva, exportación Markdown e historial en los respaldos. La explicación escrita **no** se evalúa semánticamente.
- Analizador CAN clásico: lectura local de archivos `candump` y captura de ejemplo.
- **Decodificación DBC:** importación local de un `.dbc`, interpretación de las primeras 400 tramas usando [Candied](https://github.com/bit-dream/candied), tabla de señales físicas y ejercicio de factor/offset. El ejemplo AutoLab usa únicamente identificadores y escalas ficticios.
- **Banco de componentes:** seis circuitos ideales de baja tensión (divisor, cable, MOSFET, shunt, RC, bobina) con esquemas SVG, fallas simuladas, respuestas numéricas, evidencias y exportación de informe. No es un solver SPICE; CircuitJS permanece como herramienta externa.
- Laboratorio de osciloscopio con cuatro señales sintéticas (PWM, CKP, CAN diferencial y senoidal), visualización SVG y desafíos de cálculo. No conecta instrumentos reales.
- Laboratorio BMS con curvas, integración de corriente, importación/exportación CSV, estimación de SOC, cálculo ilustrativo SOH y desafíos sintéticos.
- Exportador científico complementario `tools/pybamm_export.py` para generar CSV con PyBaMM real en computadora propia, con metadatos de modelo, versión y SHA-256; los modelos SPM y DFN se validan en una [CI científica separada](.github/workflows/science-pybamm.yml) y producen CSV descargables. No se ejecuta el solver en Pages.
- CircuitJS original desde iframe externo bajo demanda; requiere Internet.
- **Portafolio offline** de exámenes, laboratorios, prácticas y lecturas con filtro y descarga Markdown, derivado del historial en IndexedDB. No representa experiencia profesional acreditada.
- IndexedDB y respaldos JSON, sin backend ni sincronización automática. La migración de los antiguos intervalos conserva sus fechas, sin reconstruir un historial ficticio.

La aplicación no transmite datos CAN, no se conecta a ECUs, no realiza intervenciones HV y **no acredita competencia práctica**.

## Ejecutar en local

Requiere Node.js 20+ y Python 3 (solo para el servidor estático):

```bash
npm install
npm run build
mkdir -p preview
cp index.html manifest.webmanifest sw.js preview/
cp -R src icons samples preview/
./node_modules/.bin/esbuild src/app.js --bundle --format=esm --target=es2020 --outfile=preview/src/app.js
python3 -m http.server 8080 --directory preview
```

Abrir `http://localhost:8080/`. No abrir `index.html` desde `file://` porque la PWA utiliza módulos web, service worker e IndexedDB. Los archivos fuente se conservan en `src/`, y la versión compilada se publica como `site/src/app.js` desde Actions.

## Despliegue

El workflow `.github/workflows/pages.yml` valida el código y construye el bundle antes de publicar. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente de despliegue.

**PWA:** https://barbasmarcosi.github.io/AutoLab-Academy/

## Privacidad y seguridad

Capturas CAN y bases DBC importadas se procesan exclusivamente en memoria del navegador; no se suben ni guardan en respaldos. Resultados y notas se almacenan en IndexedDB local, con exportación e importación manual. No introducir información sensible de clientes sin autorización.

Los escenarios son sintéticos y las mediciones no representan especificaciones OEM. Los cursos y simulaciones no habilitan trabajos sobre sistemas de alta tensión.

## Limitaciones y pendientes

- El parser DBC externo admite muchos formatos, pero aún no se validaron exhaustivamente multiplexado, big-endian complejo, CAN FD ni matrices OEM grandes. El adaptador trabaja con CAN clásico, en este incremento.
- El laboratorio BMS de la PWA usa integración trapezoidal educativa, **no** un solver científico. El script externo sí se ejecuta con PyBaMM SPM/DFN en Actions y exporta resultados con proveniencia; faltan validación experimental, datasets permanentes y SocketCAN de escritorio.
- CircuitJS no está distribuido en el origen de la PWA ni funciona offline.
- La QA completa de interfaz y respaldos en Safari/iPhone sigue pendiente.
- Falta generar y conservar un lockfile npm para reproducibilidad estricta del build. La versión científica directa está fijada; las dependencias transitivas quedan registradas por ejecución y aún requieren lockfile/constraints reproducibles.

Documentación: [transferencia diagnóstica](docs/DIAGNOSTIC_TRANSFER_V1_9.md), [problemas de transferencia](docs/TRANSFER_V1_8.md), [evaluación por pregunta](docs/ANSWER_EVIDENCE_V1_7.md), [orientador de estudio basado en evidencias](docs/STUDY_COACH_V1_6.md), [taller integrador](docs/INTEGRATIVE_V1_5.md), [combustión y balance de cilindros](docs/MISFIRE_V1_4.md), [inyección y trims](docs/FUEL_V1_3.md), [fallas intermitentes y buffer](docs/TEMPORAL_V1_2.md), [diagnóstico diferencial](docs/DIFFERENTIAL_V1_1.md), [componentes y drivers](docs/COMPONENTS_V1.md), [banco ECU e itinerarios](docs/ECU_PATHS.md), [multifallas y portafolio](docs/MULTIFAULT_PORTFOLIO.md), [contenido y osciloscopio](docs/CURRICULUM_WAVEFORMS.md), [retos cuantitativos](docs/MEASUREMENT_CHALLENGES.md), [retención FSRS y migración](docs/FSRS_E1.md), [plan general](docs/ROADMAP.md), [modelo de casos](docs/CASE_MODEL.md), [laboratorios CAN y circuitos](docs/LABS_E3.md), [laboratorio BMS](docs/LABS_E4.md).
