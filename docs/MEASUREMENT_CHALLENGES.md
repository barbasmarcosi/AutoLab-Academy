# E2 — Retos de medición y razonamiento cuantitativo (v0.6)

## Entregable

Nueva sección «Retos medidos» en AutoLab Academy, con 5 problemas sintéticos por sesión. Un problema por área: electricidad 12 V (caída de tensión), motor (duty de actuador idealizado), osciloscopía (frecuencia CKP a RPM), redes (ocupación media CAN bajo hipótesis dadas) y electromovilidad (estimación SOC por integración de corriente).

Las variables cambian en cada sesión. Una semilla entera se conserva en cada informe para reproducir exactamente los datos y valores esperados. La corrección se realiza de modo determinista, offline y sin servicios de IA.

## Rúbrica

- 70 puntos si el cálculo se encuentra dentro de la tolerancia indicada por problema.
- 30 puntos si la medición seleccionada es la que confirma el resultado del escenario.
- La justificación escrita es obligatoria (mínimo 70 caracteres); su presencia y longitud pueden verificarse automáticamente, pero **la calidad técnica del texto no**. Aun con 100/100 el criterio estructurado no constituye aprobación profesional.
- Se enseña el resultado esperado, fórmula, medición relevante, condiciones de validez y referencia contextual solo una vez terminada la sesión.
- El instrumento, procedimiento y las condiciones importan tanto como la cifra final. Nunca debe usarse la práctica como instrucción para intervenir alta tensión.

## Privacidad y trazabilidad

Se conservan por pregunta: identificador estable, resultado numérico, opción de evidencia, texto justificativo (máx. 2000 caracteres), calificación, fecha y marca de criterios estructurados. El historial utiliza el almacenamiento IndexedDB y el mismo respaldo JSON, sin backend. El informe completo de la sesión puede exportarse en Markdown con la semilla para réplica posterior.

El historial no guarda toda la formulación del problema ni la semilla en IndexedDB; **el informe descargable sí conserva la semilla y todas las condiciones**. Si se requiere auditoría por especialistas, conservar el archivo de informe exportado.

## Seguridad y alcance

Son únicamente ejercicios sintéticos de interpretación y matemáticas de ingeniería, no valores OEM reales. No hay transmisión a buses CAN, conexión OBD, apertura de baterías HV ni control sobre hardware. Los enlaces citados respaldan conceptos generales y **no** los números ficticios generados.

La PWA no valida semánticamente las justificaciones: una respuesta escrita con longitud suficiente puede ser técnicamente errónea. Un profesional debe evaluar transferibilidad y razonamiento. El objetivo es aumentar rigor sin afirmar una capacidad que no tenemos.

## Criterios de calidad

- Batería automatizada de 200 semillas con 5 áreas, unicidad, reproducibilidad y valores esperados dentro de tolerancias.
- Rechazo de entradas inválidas, infinity, notación científica ambigua, o número con separadores mixtos.
- Las respuestas correctas sin evidencia quedan en 70/100, y evidencia sin cifra correcta en 30/100.
- Debe haber justificación escrita para concluir la sesión.
- Importar/restaurar resultados usa el esquema de respaldo existente.
- Pendiente: QA real iPhone/Safari, expansión de banco, revisión técnica de contenidos y rúbrica de razonamiento por experto.
