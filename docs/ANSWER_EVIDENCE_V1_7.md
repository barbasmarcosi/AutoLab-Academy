# AutoLab Academy v1.7 — Evidencia por pregunta y análisis de errores

## Objetivo

Los resultados agregados de exámenes permiten medir aciertos globales, pero no identificar **qué concepto** resultó difícil. La v1.7 incorpora trazabilidad **solo hacia adelante** para nuevas respuestas en exámenes normales, acumulativos, de repaso FSRS y reentrenamientos focalizados, sin modificar los datos históricos previos.

Ningún indicador nuevo significa un diagnóstico cognitivo automático, una validación semántica o una acreditación profesional.

## Formato de datos retrocompatible

Se mantiene `SCHEMA_VERSION = 1` y las tablas de IndexedDB existentes.

Cada elemento de `attempts` puede tener opcionalmente `details`, un arreglo de hasta 40 registros con:

- `id`: identificador de pregunta del banco, válido y acotado.
- `selected`: índice entero de la respuesta elegida entre 0 y 3, o `null` si no es válido.
- `correct`: resultado observado al corregir.
- `confidence`: `low`, `normal` o `high`, declarada por el alumno.

Los exámenes anteriores **no tienen el campo `details`**. La validación de backup conserva su estado sin rellenar respuestas, conceptos, aciertos o errores imaginarios. El límite actual del respaldo completo sigue en 2 MB; cada intento conserva como máximo 40 respuestas detalladas.

## Algoritmo observable

1. Leer únicamente intentos con `details`, ordenados del más reciente al más antiguo.
2. Ignorar IDs que no figuran en el banco actual, respuestas omitidas o índices de opción inválidos.
3. Evitar contar dos veces una misma pregunta dentro de un mismo examen.
4. Para cada pregunta identificar su **última respuesta detallada registrada**. Si fue incorrecta, pertenece a los errores pendientes de reentrenamiento; si luego fue correcta, deja de figurar como error activo.
5. Contar errores repetidos, errores con confianza alta y aciertos con confianza baja. Esta diferencia permite reflexionar sobre exceso de confianza o dudas, sin diagnosticar sesgos psicológicos.
6. Etiquetar conceptos por prefijo curricular editorial conocido. Por ejemplo: `fuel-q-` = Control de mezcla e inyección, `misfire-q-` = Fallas de combustión, `integral-q-` = Trazabilidad y evidencias. El resto queda como **fundamentos del área sin etiqueta fina**, sin clasificación semántica inventada.
7. El botón *Reexaminar errores* selecciona hasta diez preguntas cuya última respuesta fue incorrecta, priorizando las falladas en múltiples ocasiones. Responder la misma pregunta puede reforzar la memoria de la opción y no necesariamente la comprensión de un problema nuevo.

Se muestra el texto y la explicación **actual del banco de preguntas**, por lo que los IDs y las claves deben conservarse coherentes al editar materiales; hay que revisar cualquier edición futura que cambie significativamente la respuesta esperada.

## Orientador de estudio actualizado

El plan de estudio ahora reconoce que una respuesta detallada de una pregunta de un examen global **sí evidencia esa pregunta y su especialidad**. Eso no autoriza convertir el **porcentaje total** del examen en porcentaje de dominio del área.

Para priorizar estudios, agrega 4 puntos por error activo de pregunta en cada especialidad, con tope de tres errores. La señal de la interfaz lo declara expresamente. Las áreas con respuestas detalladas correctas, pero sin exámenes específicos previos, dejan de figurar automáticamente como «sin datos».

## Funcionalidades visibles

- Nueva página **Errores por pregunta** desde la navegación principal y desde los exámenes.
- Tarjetas de errores activos con opción elegida, respuesta correcta, fuente, explicación y repetición.
- Conteos de preguntas falladas más de una vez, aciertos con dudas y errores con seguridad alta.
- Reexamen focalizado de hasta 10 preguntas, que registra nuevos resultados y actualiza FSRS.
- Exportación Markdown del análisis y enlace al plan de estudio.

## Pruebas y límites

Se prueban intentos históricos sin detalles, resultados por pregunta en exámenes acumulativos, respuestas duplicadas, IDs desconocidos, errores repetidos y resueltos posteriormente, reentrenamiento focalizado, respaldo JSON, estado de confianza y presupuesto del orientador.

**Pendientes**: QA Safari/iPhone, VoiceOver, actualización offline real, revisión pedagógica experta y preguntas *nuevas* de transferencia que evalúen un razonamiento análogo con otro contexto. No se valida la calidad técnica de una explicación escrita ni aptitud para diagnóstico físico o intervención HV.
