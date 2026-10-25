# AutoLab Academy v0.8 — Diagnóstico multifalla y portafolio

## E2: casos con dos causas independientes

Se agregan tres escenarios sintéticos al taller de quince casos preexistentes:
- Sistema 12 V: caída positiva durante carga y consumo parásito con vehículo estacionado.
- Arranque lento: alta resistencia de masa y conductor CKP abierto hacia ECU.
- CAN aislado: nodo sin alimentación y resistencia terminal ausente.

Cada caso distingue síntomas, hipótesis iniciales, pruebas y conclusiones finales. La hipótesis se registra **antes** de habilitar las mediciones. Posteriormente es posible corregir la selección final sin perder la hipótesis previa.

**Reglas de puntuación**: 50 puntos por identificar exactamente ambas causas; 20 puntos por prueba confirmatoria independiente de cada una; 10 puntos por registrar al menos 80 caracteres de explicación. Solo supera la rúbrica cuando se identifican ambas causas y se recogen evidencias independientes. Cualquier prueba marcada como insegura puntúa 0 y desaprueba. **El sistema no interpreta semánticamente la explicación**: la redacción necesita evaluación humana.

Los resultados guardan las dos hipótesis iniciales, conclusión final, IDs de mediciones, justificación y calificación en el mismo arreglo de prácticas y respaldo JSON. Exporta informe Markdown con los resultados observados y la explicación del modelo. Son valores sintéticos, no procedimientos OEM ni mediciones reales.

## E6: portafolio local

Nueva pestaña Portafolio con indicadores de intentos, prácticas, lecturas registradas y tarjetas/repasos FSRS. Lista hasta 40 registros recientes por filtro (exámenes, diagnóstico/retos, laboratorio o todos). Incluye fechas y, cuando se registraron, las evidencias y justificaciones. La exportación Markdown reúne el historial reciente hasta 500 registros y todas las lecturas reconocidas.

Este portafolio se **deriva** del progreso guardado: no añade servicios, cuentas ni base de datos remota. Los respaldos JSON existentes no cambian de formato. No representa certificación, experiencia práctica supervisada ni evaluación humana de explicaciones; además, las notas de distintas rúbricas no son directamente comparables.

## Privacidad y seguridad

Los registros permanecen en IndexedDB local, con descarga manual. El usuario debería resguardar sus informes fuera del dispositivo antes de eliminar la aplicación. La descarga Markdown puede incluir información privada que el propio usuario escribió.

Las pruebas simulan solamente bancos virtuales aislados; no se habilita inyección CAN, conexión a terminal HV ni manipulación de un vehículo circulando.

## Verificación y pendientes

Tests Node comprueban estructura y unicidad de casos, cobertura independiente de dos fallas, rechazo de una única causa, bloqueo de acciones inseguras y consistencia del informe. Portafolio: cero datos, orden cronológico, agrupación y recuperación desde backup. Pendientes: QA interactivo Safari/iPhone, revisión de contenido por especialistas, auditoría supervisada y adjuntar mediciones reales con consentimiento y trazabilidad.
