# AutoLab Academy — Plan de implementación

## Estado real al 24/10/2026

- E0 (base): iniciado con banco trazable de 30 preguntas, seis lecciones, tres casos sintéticos y documentos de arquitectura.
- E1 (PWA): implementación MVP en GitHub Pages por Actions, exámenes, repaso con intervalos de implementación inicial, progreso local IndexedDB y backup JSON.
- E2 (taller virtual): primera versión ampliada con 15 casos deterministas, hipótesis inicial, pruebas, razonamiento escrito, informes Markdown, nota con reglas y tests. **Faltan revisión externa de expertos, instrumentación calibrada, múltiples fallas y QA E2E. No hay motor físico automotriz, telemetría real ni DTC OEM.**
- E3 (simuladores): **primer incremento implementado**: analizador candump offline de CAN clásico, muestra sintética con práctica guiada y CircuitJS externo bajo demanda. **Pendientes:** integración real same-origin/offline y revisión de licencia GPL CircuitJS; decodificación DBC mediante librería; laboratorios con SocketCAN/cantools en escritorio. Ver docs/LABS_E3.md.
- E4 (HEV/EV): contenido introductorio conceptual; PyBaMM y BMS científico pendientes.
- E5 (tutor IA): pendiente, opcional, sin API keys en frontend.
- E6 (portafolio y experiencia real): pendiente.

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
