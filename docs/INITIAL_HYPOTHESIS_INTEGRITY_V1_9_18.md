# v1.9.18 — Integridad de hipótesis inicial en la rúbrica

## Hallazgo P1 (integridad de evaluación)

El evaluador de transferencia diagnóstica podía devolver **100/100 y aprobado** aunque el expediente no contuviera `initial`, o aunque contuviera un ID de hipótesis inventado. El flujo visual pide registrar la hipótesis antes de las pruebas, pero la función de evaluación no comprobaba ese requisito: un resultado final acertado podía parecer una investigación completa sin hipótesis previa registrada.

## Corrección

- La rúbrica valida que `initial` corresponda a una de las alternativas del caso. Una respuesta final correcta **sin hipótesis inicial válida** no recibe los 40 puntos de conclusión y no aprueba; conserva los puntos de evidencias realmente presentes (máximo 60/100).
- El resultado expone `initialRecorded` para que la revisión formativa explique la omisión sin inventar análisis semántico ni una secuencia temporal.
- Una hipótesis inicial incorrecta sigue siendo válida como planteo: no se exige acertar antes de observar. Los pronósticos confirmatorio y de descarte siguen siendo obligatorios y una maniobra insegura mantiene 0/100.
- Los historiales guardados no se reevalúan automáticamente. El formato JSON schema 1 y los borradores no cambian.

## Alcance y límites

La UI bloquea la hipótesis antes de revelar pruebas; **la función de evaluación aislada no puede certificar cuándo fue registrada**, ni juzgar la calidad del razonamiento escrito. No hay validación física, OEM ni revisión docente implícita.

## Evidencia exigida

Tests unitarios sobre 100 semillas y todas las familias con hipótesis ausentes, nulas, vacías e IDs inventados; hipótesis inicial acertada/equivocada; advertencia de revisión. El PR requiere `npm ci`, unitarios, auditorías y Playwright Chromium/WebKit/WebKit móvil exitosos en Actions. Publicación Pages solo se considera acreditada tras merge a main y ejecución exitosa del job deploy.
