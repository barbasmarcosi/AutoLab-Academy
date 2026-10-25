# AutoLab Academy v0.9 — Itinerario y banco ECU virtual

## Itinerario por tres etapas

1. **Fundamentos**: seis lecturas ya existentes de electricidad, motor, osciloscopía, CAN, BMS y seguridad.
2. **Diagnóstico aplicado**: diez lecciones ya existentes de interpretación bajo carga, síntomas, hipótesis y protocolos.
3. **Electrónica de ECU**: diez nuevas lecciones sobre alimentación de controlador, entradas digitales y referencias, plausibilidad, actuadores, corriente, osciloscopía, gateways y sistemas auxiliares LV.

La pestaña **Itinerario** muestra lecturas realizadas sobre 26, metas por etapa y próxima lectura, sin bloqueo rígido. Los exámenes aprobados por área (≥85%) se cuentan por separado y jamás equivalen a habilitación de taller. No se modificó el esquema de backup ni se perdió el estado de FSRS de preguntas existentes.

## Banco ECU: cinco investigaciones sintéticas

Los cinco problemas recorren electricidad, motor, osciloscopía, CAN y electromovilidad. Cada caso conserva hipótesis inicial **antes de medir**, ofrece pruebas que pueden confirmar o contradecir, y exige una predicción normal/anómalo **antes de revelar el resultado virtual**.

Rúbrica objetiva: 45 puntos por seleccionar la causa correcta, 30 por incluir una medición confirmatoria, 15 por al menos un pronóstico correcto y 10 por documentar una explicación de 80 a 3000 caracteres. La práctica solo se aprueba al cumplir todos los criterios; seleccionar una intervención insegura la invalida y asigna cero puntos. La redacción se almacena, pero **no se analiza semánticamente** y sigue requiriendo evaluación profesional.

Las prácticas quedan en el historial y portafolio existente, con hipótesis previa, conclusión, IDs de pruebas, puntuación y explicación. Es posible descargar un informe Markdown con las predicciones y observaciones de la sesión.

## Contenido nuevo y fuentes

Se suman diez lecciones y veinte preguntas de selección múltiple (cuatro nuevas preguntas por cada una de cinco áreas). Total: **26 lecciones y 80 preguntas**. Las explicaciones y conceptos se apoyan en material público técnico contextual:
- Pico Automotive Guided Tests: https://www.picoauto.com/library/automotive-guided-tests/
- Kvaser troubleshooting: https://kvaser.com/knowledge-base/get-error-frames/
- HSE seguridad HEV/EV: https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm

Los valores de las prácticas son ficticios y no se presentan como especificaciones de fabricantes.

## Calidad y límites

Los tests de Node verifican integridad del banco, cinco áreas, medición confirmatoria, predicción, bloqueo de unsafe y contenido editorial. También verifican que las lecciones de las tres etapas cubran los 26 IDs y no dupliquen contenido. El service worker precachea el nuevo código.

Sigue pendiente QA interactiva real en Safari/iPhone, revisión por un técnico experto, más situaciones con datos experimentales medidos y mejoras de accesibilidad. El sistema **no conecta instrumentos físicos**, envía comandos a ECUs ni enseña procedimientos de intervención HV.
