# AutoLab Academy v1.8 — Problemas parametrizados de transferencia

## Propósito

En lugar de volver a preguntar exactamente lo estudiado, cada especialidad presenta **dos formulaciones algebraicas relacionadas**: primero un ejercicio guiado y después una situación distinta cuyo enunciado pide calcular **otra magnitud**. Cada sesión cambia los parámetros mediante una semilla reproducible; el orden de los cinco pares y las opciones de medición también varía de manera determinista.

**Esto es transferencia cercana dentro de familias matemáticas conocidas**, no una prueba de generalización a un vehículo real, un síntoma de taller ni una acreditación profesional. La segunda situación no es revelada mientras se responde la primera.

## Cinco parejas

| Área | Primer ejercicio | Transferencia: incógnita diferente |
|---|---|---|
| Electricidad | Calcular caída de tensión con corriente y resistencia | Calcular resistencia máxima a partir de caída admisible y corriente |
| Motor | Determinar duty a partir de tiempo activo y período | Determinar ancho de pulso en ms con duty y frecuencia |
| Señales CKP | Calcular RPM desde pulsos/s y pulsos/vuelta | Calcular pulsos/s desde RPM y pulsos/vuelta |
| Redes CAN | Calcular ocupación desde bitrate, tramas/s y bits/trama | Calcular tasa máxima teórica para un objetivo porcentual |
| Electromovilidad | Determinar SOC ideal tras descarga | Determinar minutos ideales restantes hasta un piso SOC |

En todos los problemas las magnitudes, supuestos y tolerancias se declaran; la evidencia es ficticia y las opciones de instrumento son didácticas. No se simulan errores de bus, dinámica electroquímica ni calibraciones OEM.

## Experiencia

1. Se genera la sesión con una semilla numérica segura y cinco pares.
2. El alumno ingresa un número con coma o punto decimal, escoge una medición para contrastarlo y documenta una justificación de al menos 70 caracteres.
3. El motor corrige **numéricamente** (70 puntos con tolerancia declarada) y la elección de instrumento (30 puntos), muestra fórmula y resultado de referencia del primer ejercicio.
4. Se abre la situación de transferencia, con parámetros y magnitud requerida distintos. Su respuesta se califica por separado.
5. Al finalizar, la pantalla informa cuántos de los cinco ejercicios guiados y transferidos cumplen criterios estructurados. **Solo la segunda fase** se registra como puntuación de transferencia por área en Portafolio e IndexedDB.
6. El informe Markdown completo contiene semilla, enunciados, suposiciones, elecciones, justificaciones, fórmulas y resultados. El Portafolio conserva un informe por especialidad y el respaldo JSON existente lo incluye como campo opcional `report`, sin migración.

No se permite aprobar una transferencia por haber aprobado el ejercicio guiado. La ausencia de evidencia relevante o de justificación impide dar por completos los criterios objetivos, aunque el cálculo numérico sea correcto. **La semántica de la justificación no se evalúa**, y los 70 caracteres no demuestran calidad del razonamiento.

## Validaciones

- 200 semillas, reproducibilidad y variación efectiva de resultados.
- Cinco especialidades y diez tareas por sesión, con magnitudes y unidades distintas entre fases.
- Respuestas correctas y tolerancias, comma/punto, rechazo de `NaN`, infinitos, texto y notación múltiple.
- Confirmación de que aprobar una fase guiada no aprueba la fase nueva.
- Exportación trazable a Markdown y recuperación completa desde un backup JSON hacia Portafolio.
- Precache para PWA, pruebas Node y compilación por GitHub Actions.

## Limitaciones pendientes

QA manual en Safari/iPhone, VoiceOver, actualización offline después del cambio de service worker, revisión pedagógica de nuevas incógnitas, evaluación de razonamiento por docente y ejercicios de **transferencia lejana**, con modelos de fallas diferentes, instrumentos físicos supervisados y datos de origen verificable. El resultado **no** constituye certificación, diagnóstico OEM, permiso de manipular circuitos energizados, combustible presurizado o alta tensión.
