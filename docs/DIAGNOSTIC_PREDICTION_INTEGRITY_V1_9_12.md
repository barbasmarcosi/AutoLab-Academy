# v1.9.12 — Exigencia de dos pronósticos discriminantes

## Hallazgo

El modelo de evaluación de transferencia diagnóstica entregaba cinco puntos por predicción y podía aprobar la investigación si **una sola** de las predicciones sobre la prueba confirmatoria o de descarte era correcta. Un estudiante podía fallar la expectativa de la hipótesis rival y aun así aprobar con 100 puntos.

## Regla corregida

El requisito `predicted` exige dos instrumentos distintos, uno de rol confirmatorio y otro de descarte, con ambos resultados pronosticados correctamente antes de revelar la lectura en la interfaz. La regla no concede crédito por repetir un ID, usar pruebas de contexto o incorporar registros inventados. Se conserva la bandera `predictionsCorrect` con conteo informativo y los pesos existentes; cuando falta una predicción correcta, el total máximo queda en 95 y `passed` es falso. La puntuación sigue siendo exclusivamente sobre elecciones estructuradas y longitud de texto, sin evaluar semántica, experiencia real ni competencias HV.

## Evidencia y compatibilidad

Las pruebas unitarias recorren 100 semillas × cinco familias × dos roles y comprueban ausencia de aprobación injustificada con una sola predicción correcta. Incluyen regresión de IDs repetidos. No cambia schema de respaldo ni se reescriben expedientes anteriores; la regla se aplica a evaluaciones futuras y a la visualización de sesiones actuales.
