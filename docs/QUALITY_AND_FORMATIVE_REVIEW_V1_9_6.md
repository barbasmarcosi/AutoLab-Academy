# v1.9.6 — Accesibilidad transversal y retroalimentación verificable

## Auditoría automatizada ampliada

La CI ejecuta axe-core WCAG 2.1 A/AA sobre las pantallas principales, 17 secciones que antes no estaban cubiertas, cinco modos de laboratorios (CAN, osciloscopio, componentes, BMS, CircuitJS sin abrir el tercero), un examen activo y un diagnóstico con formularios. La matriz incluye Chromium, WebKit desktop y WebKit iPhone emulado; este último **no** es una prueba con hardware real. Los casos examinan el bundle publicado en GitHub Pages bajo su subruta.

## Retroalimentación sin fingir comprensión

`src/diagnostic-review.js` genera un plan de revisión por **banderas estructurales** de la puntuación: hipótesis incorrecta, falta de confirmación, falta de descarte, omisión de contexto, ausencia de predicción correcta y selección insegura. Una puntuación perfecta sigue mostrando la necesidad de revisión humana. La retroalimentación es informativa y **no modifica las notas, los expedientes ni el schema de respaldos**.

La libre explicación se conserva como texto del alumno. No se interpretan ni evalúan su precisión, su razonamiento ni su aptitud profesional. Las pruebas no utilizan ECUs, sensores ni voltajes físicos; tampoco sustituyen procedimientos OEM o supervisión HV.

## Pendientes

Auditoría manual con teclado, VoiceOver/iPhone físico, zoom 200/400 %, orientación, lectores de pantalla, gráficos complejos y contenido. Validación por especialistas del currículo y de la rúbrica. 
