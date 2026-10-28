# Lección 02 — DTC y parámetros: revisión crítica

**Estado:** CANDIDATA, pendiente de CI exacta del commit del hito. El umbral exigido es **≥9/10 en diseño interno** y cero fallos críticos; la aceptación NO implica retención demostrada en novatos ni destreza física.

## Alcance verificable

1. **Entrada sin nota:** preguntas sobre qué representa P0171, correcciones positivas y contraste de causas. No guarda historial, no atribuye puntaje.
2. **Teoría y ejemplos resueltos:** se separa condición del monitor, maniobra del control y mecanismo causal; se explicitan escenarios contrastivos y por qué un dato aislado no autoriza cambiar una pieza. Valores de presión exclusivamente didácticos, NO OEM.
3. **Práctica guiada:** se congelan hipótesis y primera prueba, se registran cuatro lecturas sintéticas, se exige falsador coherente y justificación escrita sin nota semántica. El contraste causal posterior se ofrece **solo después** de entregar.
4. **Transferencia reservada:** nueve casos distintos de la práctica guiada, con tres mecanismos causales, valores y condiciones sintéticas variadas; se congela una predicción previa y el primer ensayo antes de conocer resultados. Cuatro pruebas, decisión causal, selección de la evidencia más discriminante, falsación de la hipótesis elegida, justificación y alternativa obligatorias.
5. **Nota objetiva:** 50/100 por identificar causa modelada, 25/100 por prueba discriminante, 25/100 por falsador respecto de la hipótesis final. La hipótesis inicialmente errónea y su calibración **no restan puntos**. Las explicaciones abiertas se conservan para revisión humana, jamás se califican automáticamente.
6. **Evidencia independiente:** `lab-dtc-guided-v1` y `lab-dtc-holdout-v1` son registros separados, persistidos y exportables, con revisión cualitativa pendiente y rotación de casos; las observaciones no constituyen mediciones físicas.
7. **Control de calidad:** tests de hipótesis/pronóstico, guardias de secuencia, nueve variantes, metamorfismo de causas, falsadores relativos, corrupción de históricos, exportación e importación de evidencia en el modelo general, E2E por navegador real, accesibilidad móvil WCAG AA.

## Riesgos y límites no resueltos

- **No es evaluación antifraude:** los casos están en el código JS público para que funcionen offline. El objetivo es la transferencia conceptual, no secreto criptográfico.
- **Solo un modelo idealizado:** no representa todas las estrategias ECU, adaptativos de largo/corto plazo, falsos positivos, fallas simultáneas, variabilidad instrumental, ni límites OEM. No se infiere causalidad en vehículos reales.
- **Motivación auténtica:** los textos abiertos pueden contener cualquier texto y permanecen pendientes de revisión cualitativa.
- **Estudio de novatos, comprensión diferida, lecturas por lectores de pantalla y prácticas instrumentales**: pendientes de observación humana externa.

## Puerta de aceptación

| Criterio | Máximo | Diseño previsto |
|---|---:|---:|
| Corrección conceptual, límites y no atribución OEM | 2,0 | 1,9 |
| Prerrequisitos y ejemplos contrastados | 2,0 | 1,9 |
| Prácticas con hipótesis antes de observación y contraste | 2,0 | 1,9 |
| Transferencia independiente y falsación | 2,0 | 1,9 |
| Trazabilidad, persistencia y accesibilidad verificadas | 2,0 | 1,6 |
| **Total condicionado a CI completa** | **10** | **9,2** |

**9,2 es una proyección de la rúbrica de diseño, no una calificación observada**. Solo se convertirá en aceptación cuando la CI completa del SHA publicado pase y no haya defectos críticos; se actualiza este documento con la ejecución reproducible. Si falla, corregir antes de comenzar lección 03.

## Siguiente lección
La lección 03 corresponde a `scope`: lectura de señales de osciloscopio. Debe tener chequeo de escala/tiempo/trigger/referencia, experimento de señales, comparación de hipótesis, errores comunes, transferencia independiente y evidencia versionada antes de superar la puerta ≥9/10.
