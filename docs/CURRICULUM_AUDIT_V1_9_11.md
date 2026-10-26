# v1.9.11 — Auditoría estructural del currículo

La CI importa todos los módulos de currículo, casos comunes y etapas. Comprueba referencias, identidad, duración, secciones, respuestas correctas según estructura, opciones duplicadas y URLs HTTPS. El informe muestra conteos de lecciones, preguntas, casos y fuentes. No visita las fuentes, no confirma su pertinencia, exactitud científica, licencias o seguridad eléctrica. Las mediciones siguen siendo sintéticas.

El motor de corrección ahora exige un entero realmente seleccionado: null, cadena vacía, false o la cadena '0' no deben aprobar la opción índice cero. No modifica puntuaciones ya persistidas ni el schema de backups. CI y Playwright deben quedar verdes antes del merge.

Restan auditorías editoriales de afirmaciones concretas, magnitudes y contextos de laboratorio, pruebas de transferencia con casos nuevos y evaluación experta sin afirmar certificación.
