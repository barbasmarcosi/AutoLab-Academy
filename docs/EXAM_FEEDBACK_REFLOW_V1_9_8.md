# v1.9.8 — Revisión pedagógica posterior al examen y reflow

## Retroalimentación observable

Al terminar un examen se presenta un plan breve de estudio con los errores reales de **ese intento**, ordenados por área y cantidad de errores con confianza «Muy seguro». La aplicación no diagnostica conceptos mal aprendidos a partir de una selección, no asigna calificaciones nuevas, no evalúa las explicaciones del alumno y no transforma un examen teórico en una acreditación profesional.

El botón de reexamen apunta a la función de repaso focalizado ya existente. Por rigor, se etiqueta como revisión de *errores registrados* porque selecciona preguntas cuya última respuesta detallada es incorrecta del historial local, no estrictamente las 15 del intento recién concluido.

El encabezado del resultado recibe foco programático al completar el examen o la transferencia diagnóstica; la lectura por lector de pantalla depende además de su configuración y del navegador físico.

## Cobertura

Pruebas unitarias comprueban agrupación, alta confianza errónea, aprobaciones completas y descarte de IDs desconocidos. Prueba Playwright efectúa una evaluación acumulativa real de 15 preguntas, lee el detalle persistido en IndexedDB, comprueba el plan y audita el estado posterior con axe WCAG 2.1 A/AA.

Se añaden comprobaciones de desbordamiento del documento a anchos 320 y 640 CSS px sobre las rutas principales. No equivale a prueba física de zoom, orientación ni VoiceOver/iPhone; controles con desplazamiento **interno** de tablas o navegación siguen siendo compatibles con WCAG 1.4.10 cuando no ocultan contenido funcional.
