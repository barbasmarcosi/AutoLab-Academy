# Modelo de entrenamiento de casos — AutoLab Academy E2

## Propósito y alcance

Un caso es **sintético y determinista**, no una indicación de reparación real ni un gemelo digital validado. Entrena formular hipótesis, elegir mediciones, comparar evidencia y documentar una conclusión.

La simulación nunca habilita intervención sobre alta tensión, bypass de interlocks, manipulación de inmovilizadores ni transmisiones a redes de vehículos reales.

## Contrato de casos

- id: identificador único, estable para historial.
- topic: electricidad | motor | senales | redes | ev.
- title, difficulty, symptom, context: escenario con supuestos explícitos.
- probes: pruebas con id, label, result (determinista), critical (confirmatoria), unsafe (acción improcedente).
- choices: causas candidatas plausibles, no ambigüedad deliberada.
- solution: ID de una opción cuya causa explica el escenario.
- reason: explicación de la evidencia que permite cerrar el caso.
- source: recurso de contexto, cuando exista; no se considera prueba documental de los datos ficticios.

Los valores sintéticos se declaran en el propio escenario. No deben presentarse como especificaciones OEM generales.

## Flujo

1. Registrar hipótesis inicial antes de solicitar pruebas.
2. Seleccionar pruebas virtuales. El resultado se registra exactamente como define el caso.
3. Elegir causa final, pudiendo corregir hipótesis inicial.
4. Justificar por escrito cómo las mediciones apoyan y descartan alternativas.
5. Generar informe exportable en Markdown.

## Rúbrica automática (máximo 100)

| Dimensión | Puntos |
| --- | ---: |
| Causa raíz correcta | 45 |
| Al menos una prueba confirmatoria | 30 |
| Hipótesis previa registrada | 5 |
| Justificación escrita de 60 caracteres o más | 15 |
| Disciplina de pruebas (tres pruebas o menos) | 5 |

- Ninguna justificación escrita se evalúa semánticamente en esta versión.
- Respuesta correcta sin prueba confirmatoria no aprueba.
- Respuesta correcta sin explicación no aprueba.
- Seleccionar una acción insegura resulta en 0, sin excepciones.
- Criterio de superación interno: 85 puntos o más y todas las condiciones anteriores.
- Incluso superado, el informe indica revisión humana pendiente.
- Las pruebas no tienen costos calibrados ni consumos de tiempo medidos; la penalización por exceso de pruebas es pedagógica.

## Seguridad y trazabilidad

- Datos guardados en IndexedDB, exportables e importables mediante JSON. No hay sincronización remota.
- Se guardan IDs de pruebas, hipótesis inicial, diagnóstico final, justificación, puntuación y estado de cumplimiento; restauraciones antiguas sin esos campos siguen siendo válidas.
- Nunca introducir datos de vehículos de clientes sin consentimiento.
- No usar el puntaje para emitir certificaciones legales o acreditaciones profesionales.
- Los escenarios necesitan revisión de un especialista en la materia antes de convertirse en exámenes oficiales.

## Calidad y evoluciones

La suite tests/workshop.test.js valida cantidad, unicidad, consistencia de opciones y pruebas, controles de evidencia e invariantes de seguridad. Falta QA E2E sobre móvil, revisión técnica especializada externa, calibración de rúbricas e instrumentación virtual calibrada.

Siguientes mejoras: predicción cuantitativa previa a cada prueba; pruebas con dependencias/condiciones; múltiples hipótesis y evidencias contradictorias; variación de parámetros; informes integrados al portafolio.
