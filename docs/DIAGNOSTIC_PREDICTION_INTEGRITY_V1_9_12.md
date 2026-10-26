# v1.9.12 — Dos pronósticos discriminantes, no un único acierto

## Error comprobado

El evaluador de transferencia diagnóstica entregaba cinco puntos y podía aprobar el caso si solo uno de los dos pronósticos sobre las pruebas de confirmación y descarte era correcto. La selección de una causa podía parecer coherente aun cuando el pronóstico de la hipótesis rival fallaba.

## Criterio corregido

Se exige pronosticar correctamente las observaciones de **ambas** pruebas independientes: confirmación y descarte. Se mantienen los pesos de la rúbrica (5 puntos por pronóstico estructurado completado), el conteo separado de resultados correctos y la regla de cero puntos para acciones inseguras. Un caso con uno de los dos pronósticos incorrectos no pasa y recibe como máximo 95/100. Las pruebas repetidas por ID no cuentan dos veces.

La guía formativa aclara que puede haber un acierto parcial y cuál es el paso siguiente. No evalúa semánticamente textos libres, no simula un vehículo real y no certifica competencias profesionales.

## Evidencia

Tests sobre 100 semillas, cinco familias y dos roles de evidencia, duplicados y retroalimentación. Se conserva el backup JSON schema 1 y la compatibilidad con progresos anteriores; los expedientes históricos no se reevalúan. CI completa en Chromium/WebKit y WebKit móvil emulado, con SW v33→v34, requerida antes del merge.
