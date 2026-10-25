# AutoLab Academy — Plan de implementación

## Estado real al 24/10/2026

- E0 (base): 16 lecciones estructuradas y 60 preguntas con fuentes contextuales distribuidas en cinco especialidades (incremento v0.7); quedan pendientes revisión experta y ampliar progresión a itinerarios profesionales completos.
- E1 (PWA): implementación MVP en GitHub Pages por Actions, exámenes, repaso con FSRS (ts-fsrs 5.4.2) basado en respuesta objetiva + confianza, evaluación acumulativa por cinco áreas, progreso local IndexedDB y backup JSON compatible con los intervalos anteriores. **Pendiente QA E2E iOS y revisión de calidad editorial de preguntas.** Ver docs/FSRS_E1.md.
- E2 (taller virtual): **incremento v0.8:** 3 casos multifalla adicionales (18 casos en total), exigen dos causas con evidencia confirmatoria independiente para cada una; bloquean acciones inseguras y exportan informe. Razonamiento libre no evaluado semánticamente. Incremento cuantitativo v0.6: cinco retos nuevos con valores variables, mediciones justificadas, puntuación determinista y exportación de resultados; argumentos registrados para revisión humana. El banco actual aún requiere revisión de expertos. Primera versión ampliada con 15 casos deterministas, hipótesis inicial, pruebas, razonamiento escrito, informes Markdown, nota con reglas y tests. **Faltan revisión externa de expertos, instrumentación calibrada, múltiples fallas y QA E2E. No hay motor físico automotriz, telemetría real ni DTC OEM.**
- E3 (simuladores): **incremento v0.7**: osciloscopio virtual de cuatro señales didácticas (PWM, CKP, CAN diferencial y senoidal) con ejercicios de cálculo y registro de resultados; no se afirma conexión a instrumentos reales. **Primer incremento implementado**: analizador candump offline de CAN clásico, muestra sintética con práctica guiada y CircuitJS externo bajo demanda. **Incremento 2:** importación y decodificación DBC con Candied mediante bundle local; ejemplo didáctico con 0x120/0x220. **Pendientes:** integración real same-origin/offline y revisión de licencia GPL CircuitJS; validación DBC extendida, laboratorios con SocketCAN/cantools en escritorio. Ver docs/LABS_E3.md.
- E4 (HEV/EV): **incremento 1 implementado**: análisis BMS educativo con integración de corriente, 3 escenarios sintéticos, curvas, CSV, SOC/SOH ilustrativo y ejercicios. Script PyBaMM validado en workflow científico separado: modelos SPM/DFN, compatibilidad de CSV con el parser JS y proveniencia con SHA-256. **La validación es de ejecución y consistencia, no experimental ni de vehículos reales**. Quedan pendientes datasets científicos/experimentales verificados, validación visual iPhone, estimadores avanzados y evaluación experta. Ver docs/LABS_E4.md.
- E5 (tutor IA): pendiente, opcional, sin API keys en frontend.
- E6 (portafolio y experiencia real): **incremento inicial v0.8** disponible en PWA: vista offline de exámenes, prácticas, tarjetas FSRS y lecciones, con exportación Markdown y filtros. No afirma experiencia real, certificación HV ni informes auditados por profesionales. Pendientes: revisión externa de evidencia, portafolio supervisado, anexos de instrumentos y calificaciones de taller.

## Prioridades de producto

1. Persistencia robusta, exportar/restaurar, soporte iPhone y accesibilidad.
2. Examinar dominios con variantes de preguntas, claves auditadas y comprensión, no repetición memorística.
3. Casos con instrumentos ficticios calibrados, fallas múltiples y rúbricas que exijan evidencias.
4. Incorporar recursos abiertos existentes, sin desarrollar nuevos motores de física, CAN o baterías.
5. Escalar a horas supervisadas, portafolio y validación externa de competencias.

## Requisitos de salida de E1

- Tests de contenido y motor de evaluación pasan en Actions.
- Las seis lecciones, 30 preguntas y tres casos están realmente disponibles.
- App shell precargado mediante SW en origen Pages (comprobar offline en dispositivo).
- Exportar, importar y restaurar exactamente los datos de progreso (comprobar en iPhone).
- No se muestra ninguna certificación oficial interna ni se habilitan maniobras de HV.
- Documentar limitaciones y riesgos de almacenamiento local.

## Seguridad

- Los datos están en IndexedDB local al origen, no sincronizados. El sistema no cifra el respaldo; conservarlo de forma privada.
- Los casos son sintéticos; no deben interpretarse como especificaciones de marca ni autorizaciones de reparaciones.
- No conectar un adaptador CAN de escritura ni intervenir HV desde ninguna práctica de la PWA.
- Antes de integrar contenidos, revisar licencia y derecho de redistribución de cada fuente.

## Arquitectura actual

PWA estática sin backend: HTML, CSS y JS modular ESM, service worker y IndexedDB.
La propuesta original React/TypeScript, Dexie y FSRS queda como evaluación de evolución después de validar el MVP; **no se afirma implementada**. Esta elección reduce el riesgo de despliegue y mantiene el proyecto funcional sin servicios de terceros. El repaso actual utiliza intervalos sencillos documentados, no FSRS.

## Deploy GitHub Pages

Settings → Pages → Build and deployment → GitHub Actions.

Workflow: .github/workflows/pages.yml
- verify: node --check, node --test y consistencia de archivos.
- deploy: actions/upload-pages-artifact + actions/deploy-pages.
- URL esperada una vez configurado y desplegado: https://barbasmarcosi.github.io/AutoLab-Academy/

La URL no implica que el deploy haya sido comprobado.
