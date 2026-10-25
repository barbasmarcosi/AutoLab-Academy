# E1 — FSRS, exámenes acumulativos y persistencia (incremento v0.5)

## Objetivo

Aprender, recuperar de memoria y volver a practicar conocimientos de diagnóstico automotriz sin confundir preguntas de opción múltiple con capacidades de taller.

## Librería reutilizada

[ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) 5.4.2 (MIT), incorporada como dependencia local del bundle para GitHub Pages. No se reinventó el algoritmo de intervalos. Configuración inicial: retención deseada 90%, enable_fuzz=false para estabilidad de pruebas y resultados reproducibles. No se entrenaron parámetros personales: los valores predeterminados del paquete siguen siendo orientativos.

## Integración

- Un intento de examen es práctica de recuperación. Al finalizar, se programa cada pregunta respondida usando la respuesta objetiva y la confianza previa.
- Incorrecta siempre => FSRS Again, aun si declaró alta confianza.
- Correcta con duda => Hard; correcta normal => Good; correcta muy segura => Easy.
- Se guarda la tarjeta real de ts-fsrs con due, estado, estabilidad, dificultad y fechas ISO, además de hasta 30 registros auditables.
- Las tarjetas vencidas se presentan en el modo repaso; además se muestran las próximas para 7 días y las aún sin historial.
- Evaluación acumulativa: 15 preguntas, garantizando 3 por cada uno de los 5 dominios en el banco actual. La corrección y la explicación se muestran solo después del examen. El 85% es objetivo interno, no acreditación profesional.
- Todos los exámenes mantienen la calificación objetiva independiente de la autopercepción; la confianza cambia el calendario de repaso, no los puntos obtenidos.

## Migración segura

El sistema anterior guardaba nivel, fecha futura, fecha última y correcto; se conserva el esquema general de backup 1 para no bloquear restauraciones antiguas.

- El respaldo inicial, la carga desde IndexedDB y la exportación siguen admitiendo registros legacy sin modificar sus fechas.
- No se inventa estabilidad, dificultad, repeticiones ni tarjetas previas. La próxima respuesta real de una tarjeta antigua inicia su historial FSRS.
- Un registro FSRS inconsistente o con fecha inválida rechaza todo el respaldo antes de sustituir el progreso activo.
- La serialización limita tarjetas y logs por pregunta; el tamaño total del respaldo permanece limitado a 2 MB.
- No hay almacenamiento en nube ni telemetría de respuestas.

## Limitaciones y validación pendiente

- El banco actual solo tiene 30 preguntas. Un buen resultado puede reflejar memorización; se necesitan variantes, casos nuevos y explicación oral/práctica supervisada.
- No se ejecutó análisis estadístico de retención ni optimización de parámetros personalizados; FSRS utiliza configuración predeterminada.
- Cada respuesta correcta se interpreta como recuperación positiva aunque hubiera azar entre opciones.
- QA visual/interactivo en Safari/iPhone, carga de datos con storage agotado y restore en dispositivo todavía requieren evaluación.
- Para alcanzar nivel experto se necesitan observaciones de diagnóstico real, instrumental, resultados y supervisión profesional.
