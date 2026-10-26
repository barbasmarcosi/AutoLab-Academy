# AutoLab Academy — Estado de implementación R&D

> Última actualización: 26/10/2026. Seguimiento de *código integrado*, no certificación profesional. Este documento se actualizará por incremento. Ninguna CI verde valida modelos físicos reales por sí sola.

| Bloque | Alcance | Estado al 26/10 | Gate siguiente |
| --- | --- | --- | --- |
| G0 | Asegurar CI, protección de main y retrocompatibilidad | CI previa `40270981241` y `40270365868` en verde. RW2/RW3/RW5 agregados con últimas CI completas pendientes de verificación | Build, auditorías, E2E Chromium/WebKit/móvil, IndexedDB y offline |
| G1 / RW1 | Epitrocoide y cinemática offline, predicción y evidencia | Implementación inicial + A/B geométrico | Validación independiente del modelo y sensibilidad numérica |
| G2 / MC-P1 | MC00 seguridad, MC01 metrología/torque y MC03 comparación de arquitecturas | MC00–MC14 cubre inicialmente 17 lecciones, 64 preguntas y cinco exámenes por nivel; MC01 metrología Tipo A/B y MC08 frenado ideal integrados, no acreditan práctica real | Nuevos casos aplicados, evaluación de medición e incertidumbre, revisión curricular experta |
| G3 / RW4-P2 | Diferenciar falla sintética de sellado vs. encendido | Modelo de dos hipótesis con dos pruebas más RW4+ adversarial de sesgo instrumental (400 semillas), UI, respaldo, accesibilidad y E2E integrados con CI previa verde | Revisar validez técnica del diseño de pruebas y sumar ruido adversarial/instrumental |
| G4 | MC02–MC14: automóvil completo | MC00–MC14: primer recorrido conceptual (17 lecciones, 64 preguntas), con laboratorios MC01/MC08. El tronco inicial está implementado, pero simuladores específicos por módulo, revisión técnica externa y práctica física continúan pendientes. | Lecciones, casos, simuladores necesarios y examen por módulo |
| G5 | RW2/3/5/6/7/8: respiración, térmica, combustión, ECU y eficiencia | RW2 ciclo Otto ideal, RW3 balance ficticio y RW5 convección lumped: tres lecciones, doce preguntas y dos laboratorios. RW6–RW8, CFD, portado real, combustión, sellado físico y pruebas OEM pendientes; CI final RW5 en verificación | Modelos revisados, balances/limitaciones, nunca datos OEM inventados |
| G6 | Diagnostic Engineering + ECU profiles ECO/DAILY/SPORT/DIAGNOSTIC | Base diagnóstica de v1.9; optimización nueva pendiente | Baselines, restricciones térmicas/emisiones fail-closed y pruebas adversariales |
| G7 | Herramientas/instrumentación propia y arquitectura híbrida generadora | Planificado | Prototipos simulados, licencia/software reutilizable, pruebas reproducibles |
| G8 | Proyectos integradores y validación 10/10 interna | Pendiente | CI repetible, recuperación completa, accesibilidad, trazabilidad, seguridad, revisión científica |

## Siguiente secuencia concreta

1. Cerrar CI de `rotary-science` RW2/RW3/RW5 (`npm run build`, Playwright Chromium/WebKit/móvil, offline, Axe y respaldos), corrigiendo cualquier fallo real.
2. Ampliar RW6/RW7 con hipótesis controladas sobre admisión/escape y pérdidas, distinguiendo teoría de CFD o mapas reales de puertos.
3. Crear investigaciones de optimización de control ECO/DAILY/SPORT/DIAGNOSTIC con restricciones explícitas y fallas cerradas, sin escritura ECU.
4. Reforzar MC02–MC14 con casos simulados y rúbricas de evidencia más profundas; revisar fuentes y errores conceptuales.
5. Repetir recuperación offline, regresiones y seguridad; documentar validación física/científica independiente como pendiente, no como realizada.

## Contratos de evidencias

El caso RW4 usa ID lab-rotary-sealing-v1, modelo rw4-differential-synthetic-v1, semilla entera, hipótesis inicial, dos predicciones congeladas, lecturas sintetizadas de índices adimensionales, hipótesis final, razonamiento e incertidumbre. El texto libre no es evaluado semánticamente. Registro por IndexedDB existente; JSON esquema 1, sin alteración destructiva. El modelo representa exclusivamente un problema ficticio de clasificación, no una función de diagnóstico real de sellos de ápice ni una medición de compresión.

Referencias conceptuales:
- NIST (metrología e incertidumbre): https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty
- NIST (calibración/trazabilidad): https://www.nist.gov/publications/traceability-considerations-characterization-and-use-measuring-systems-0
- HSE (precauciones vehículo electrificado): https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm
- NASA Glenn (ciclo Otto): https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/internal-combustion-engine-otto-cycle/
- Mazda, referencia histórica de causas que imitan compresión deficiente: manual histórico alojado por un tercero, revisar versión/licencia antes de usar valores OEM. En el banco no se incluyen umbrales físicos.

**Límite científico:** la correspondencia numérica entre el índice sintético y la compresión real del motor no existe ni está implícita. Evaluar correctamente estas preguntas no acredita competencia física de taller.

## Progresión MC00–MC14

El primer recorrido teórico de mecánica ahora se organiza en cinco niveles correlativos (seguridad/metrología, motores, chasis, control y R&D) dentro de los 14 niveles totales de AutoLab. Las lecturas y exámenes se contabilizan por separado; registrar una lectura no prueba destreza de taller.

La cobertura formal de MC00–MC14 no significa que existan 15 simuladores de nivel profesional: los laboratorios MC01 y MC08 son modelos ideales/sintéticos iniciales y quedan pendientes estudios específicos de los demás módulos.

### Exámenes por etapa MC

Ahora se puede iniciar una evaluación dedicada por cualquiera de los cinco niveles MC00–MC14: 6 preguntas seleccionadas del subconjunto correcto por bloque, historial y FSRS integrados. La calificación de conocimiento no certifica destreza física ni habilita tareas HV.

### RW2/RW3 — integración de currículo

Dos lecciones nuevas (`rw2-ideal-versus-architecture`, `rw3-energy-losses`) y ocho preguntas de fuente conceptual NASA Glenn / SAE se incorporaron a Academia, Exámenes y FSRS. Tienen un nivel de aprendizaje 15 (`rotary-science`) sin modificar notas previas ni el esquema IndexedDB. Las cifras del balance RW3 se generan por definición, no son datos físicos ni mediciones OEM.

### RW5 — Convección A/B

`src/rotary-heat-transfer.js` permite contrastar A=0,24→0,20 m² con h supuesto 250→200 o 400 W/(m²·K), y ΔT=150 K constante. La hipótesis previa, evaluación y expediente del nuevo laboratorio son reproducibles y offline. Solo se aplica Q̇=h·A·ΔT con valores inventados: no se estiman pérdidas, Nusselt, CFD ni eficiencia Wankel reales. Gate pendiente: validación de CI y revisión científica experta.

La etapa `rotary-science` ahora agrupa teoría RW2/RW3/RW5: tres lecciones y doce preguntas nuevas sobre eficiencia ideal, balance y convección. El marco termofluídico físicamente validado continúa pendiente: aprobar un cuestionario no avala cálculos de eficiencia real.
