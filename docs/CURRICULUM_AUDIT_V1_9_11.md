# v1.9.11 — Auditoría estructural del currículo

La CI importa todos los módulos de currículo, casos comunes y etapas. Comprueba referencias, identidad, duración, secciones, respuestas correctas según estructura, opciones duplicadas y URLs HTTPS. El informe muestra conteos de lecciones, preguntas, casos y fuentes. No visita las fuentes, no confirma su pertinencia, exactitud científica, licencias o seguridad eléctrica. Las mediciones siguen siendo sintéticas.

El motor de corrección ahora exige un entero realmente seleccionado: null, cadena vacía, false o la cadena '0' no deben aprobar la opción índice cero. No modifica puntuaciones ya persistidas ni el schema de backups. CI y Playwright deben quedar verdes antes del merge.

Restan auditorías editoriales de afirmaciones concretas, magnitudes y contextos de laboratorio, pruebas de transferencia con casos nuevos y evaluación experta sin afirmar certificación.

## Hallazgo corregido en la primera auditoría

Los tres casos iniciales carecían del campo source y el auditor emitía advertencias. Se incorporaron referencias conceptuales preexistentes sobre caída de tensión (Pico), fundamentos CAN (Kvaser) y modelos BMS (PyBaMM), sin afirmar que sean evidencia empírica de las cifras del ejemplo. La ausencia de fuente HTTPS ahora interrumpe la CI para cualquier caso del catálogo auditado.
