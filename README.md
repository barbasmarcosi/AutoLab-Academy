# AutoLab Academy

PWA para estudiar y entrenar **diagnóstico electrónico automotriz, redes CAN y electromovilidad**.

## Qué está implementado

- Academia con 51 lecciones, 130 preguntas, exámenes acumulativos equilibrados (15 preguntas de todas las áreas), y calendario de repaso adaptativo FSRS mediante librería ts-fsrs.
- Itinerario de siete niveles (fundamentos, diagnóstico aplicado y ECUs), progreso de lectura y evaluación separados, con siguiente lección recomendada.
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

Documentación: [inyección y trims](docs/FUEL_V1_3.md), [fallas intermitentes y buffer](docs/TEMPORAL_V1_2.md), [diagnóstico diferencial](docs/DIFFERENTIAL_V1_1.md), [componentes y drivers](docs/COMPONENTS_V1.md), [banco ECU e itinerarios](docs/ECU_PATHS.md), [multifallas y portafolio](docs/MULTIFAULT_PORTFOLIO.md), [contenido y osciloscopio](docs/CURRICULUM_WAVEFORMS.md), [retos cuantitativos](docs/MEASUREMENT_CHALLENGES.md), [retención FSRS y migración](docs/FSRS_E1.md), [plan general](docs/ROADMAP.md), [modelo de casos](docs/CASE_MODEL.md), [laboratorios CAN y circuitos](docs/LABS_E3.md), [laboratorio BMS](docs/LABS_E4.md).
