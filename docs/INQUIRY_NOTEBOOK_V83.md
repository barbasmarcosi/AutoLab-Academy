# Cuaderno científico v83 — integración educativa progresiva

## Alcance implementado

Las **94 lecciones** incluyen un cuaderno guiado anclado al título y al primer concepto de la teoría. El alumno formula H1 y H2 y las congela; diseña una prueba discriminante, registra predicciones distintas para cada una, especifica qué hallazgo refutaría H1 y declara factores de confusión. Luego puede guardar solo un diseño sin observación o registrar una observación autorreportada con su procedencia e interpretación. La aplicación no inventa lecturas ni juzga el texto semánticamente.

## Evidencia separada

| Registro | Cobertura | Consecuencia |
|---|---:|---|
| Lecturas | 94 | Registro de estudio, no habilidad |
| Cuadernos experimentales | 94 | Diseño documentado, sin calificación ni aprobación |
| Microcasos v2 y transferencia | 32 | Rúbrica conceptual objetiva limitada |
| Laboratorios embebidos | 4 | Evidencia simulada específica |
| Laboratorios externos vinculados | 12 | Banco relacionado, no aprueba automáticamente la lección |

**Pendientes:** 62 lecciones sin microcaso objetivo v2 y 78 sin laboratorio contextual o embebido. El cuaderno no se cuenta como simulador ni como práctica aprobada.

## Contrato técnico

- src/lesson-inquiry.js: validación fail-closed, predicciones congeladas antes del contraste, expediente sin nota.
- cases almacena lab-inquiry-{lessonId}-v1 con score:0 y passed:false. El cero es un campo de compatibilidad con el backup v1, no una calificación reprobatoria.
- Portafolio distingue inquiry de reasoning y lab; exporta informe completo sin inflar la cantidad de prácticas.
- El resumen de evidencia incluye la disponibilidad de cuadernos sin alterar los estados de competencia existentes.
- Caché PWA v83, JSON/IndexedDB schema 1 intacto, sin merge ni despliegue de producción.
- No habilita intervención física, trabajo HV, certificación ni validación experimental independiente.

## Verificación y continuidad

Pruebas unitarias: falta de datos, procedencia obligatoria, cobertura de 94 IDs, no acreditación y portabilidad. E2E: congelación, almacenamiento, recarga y separación de lectura/práctica.

**Siguiente bloque:** microcasos científicos individualizados, con observaciones sintéticas claramente declaradas y contrafactual retenido. Priorizar seguridad, ECU/alimentación, BMS, controles de motores, mecánica y RW2–RW7; registrar límites y datos externos verificables si hay equipamiento seguro.
