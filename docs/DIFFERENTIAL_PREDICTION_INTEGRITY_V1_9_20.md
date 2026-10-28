# Control P1 — Rúbrica de diagnóstico diferencial (2026-10-28)

## Hallazgo reproducible

En `gradeDifferential` una sesión sin hipótesis inicial podía alcanzar **100/100**: la interfaz exigía registrar una hipótesis antes de medir, pero la función de calificación no la comprobaba. Además, una predicción acertada sobre un instrumento **no discriminante** (idéntico bajo ambas causas) sumaba el crédito de predicción aunque el pronóstico de la prueba discriminante fuese erróneo. Esto confundía acertar una etiqueta común con razonar sobre evidencia que separa causas.

## Corrección acotada

- `initialRecorded` exige que `session.initial` sea una de las dos hipótesis del caso. Si falta o es inventada, no se otorgan los 50 puntos de conclusión ni se cumple la rúbrica estructurada.
- `predicted` exige acertar el resultado **de al menos una prueba discriminante observada**. No basta con predecir una observación ambigua ni una acción insegura.
- Se conservan los pesos de la rúbrica, las variantes sintéticas y el formato del informe. El texto libre sigue sin calificación semántica.

## Regresiones automatizadas

`tests/fault-discrimination.test.js` prueba ambas variantes de los tres casos, hipótesis inicial ausente/fabricada, pronóstico correcto solo para lectura ambigua, pronóstico discriminante incorrecto y recuperación del cumplimiento al corregirlo. Las pruebas previas de reproducibilidad, seguridad, trazabilidad y diferenciación siguen aplicando.

## Evidencia y límites

La CI del PR debe ejecutar `npm ci`, unitarios, auditorías, build y Playwright en Chromium, WebKit y móvil emulado. **No se declara verde ni desplegado hasta verificar Actions para el SHA correspondiente.** La interfaz impone orden de selección/revelación, pero la función pura no puede demostrar temporalidad externa; tampoco verifica la calidad de la explicación libre. No constituye validación física, OEM, ni revisión técnica externa.

Gate #28: mitiga un P1 de integridad de evaluación, pero no cierra la auditoría semántica integral, accesibilidad compleja, coherencia documental ni el candidato pre-final.
