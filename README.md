# AutoLab Academy

PWA para estudiar y entrenar **diagnóstico electrónico automotriz, redes CAN y electromovilidad**.

## Qué está implementado

- Academia con 6 lecciones, 30 preguntas, repaso e historial de resultados.
- Taller virtual con 15 casos sintéticos, pruebas reproducibles, justificación e informes.
- Analizador CAN clásico: lectura local de archivos `candump` y captura de ejemplo.
- **Decodificación DBC:** importación local de un `.dbc`, interpretación de las primeras 400 tramas usando [Candied](https://github.com/bit-dream/candied), tabla de señales físicas y ejercicio de factor/offset. El ejemplo AutoLab usa únicamente identificadores y escalas ficticios.
- Laboratorio BMS con curvas, integración de corriente, importación/exportación CSV, estimación de SOC, cálculo ilustrativo SOH y desafíos sintéticos.
- Exportador complementario `tools/pybamm_export.py` para generar CSV mediante PyBaMM en computadora propia (no corre en Pages; ejecución científica pendiente de validación).
- CircuitJS original desde iframe externo bajo demanda; requiere Internet.
- IndexedDB y respaldos JSON, sin backend ni sincronización automática.

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
- El laboratorio BMS de la PWA usa integración trapezoidal educativa, **no** un solver científico. PyBaMM solo está disponible mediante script local sin validar en CI; datasets científicos y SocketCAN de escritorio continúan pendientes.
- CircuitJS no está distribuido en el origen de la PWA ni funciona offline.
- La QA completa de interfaz y respaldos en Safari/iPhone sigue pendiente.
- Falta generar y conservar un lockfile npm para asegurar reproducibilidad estricta del build.

Documentación: [plan general](docs/ROADMAP.md), [modelo de casos](docs/CASE_MODEL.md), [laboratorios CAN y circuitos](docs/LABS_E3.md), [laboratorio BMS](docs/LABS_E4.md).
