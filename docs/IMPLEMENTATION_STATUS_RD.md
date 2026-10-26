# AutoLab Academy — Estado de implementación R&D

> Última actualización: 26/10/2026. Seguimiento de *código integrado*, no certificación profesional. Este documento se actualizará por incremento. Ninguna CI verde valida modelos físicos reales por sí sola.

| Bloque | Alcance | Estado al 26/10 | Gate siguiente |
| --- | --- | --- | --- |
| G0 | Asegurar CI, protección de main y retrocompatibilidad | CI RW1 afcc704, integrados ebfce966, E2E ff9ba8fb (165 pruebas) y fe45d0b verificadas en verde | Build, auditorías, E2E Chromium/WebKit/móvil, IndexedDB y offline |
| G1 / RW1 | Epitrocoide y cinemática offline, predicción y evidencia | Implementación inicial + A/B geométrico | Validación independiente del modelo y sensibilidad numérica |
| G2 / MC-P1 | MC00 seguridad, MC01 metrología/torque y MC03 comparación de arquitecturas | Cuatro lecciones y doce preguntas incorporadas en Academia/Exámenes/FSRS; laboratorio de metrología MC01 con hipótesis, dos instrumentos, componentes Tipo A/B y reporte (CI pendiente); no acredita práctica real | Nuevos casos aplicados, evaluación de medición e incertidumbre, revisión curricular experta |
| G3 / RW4-P2 | Diferenciar falla sintética de sellado vs. encendido | Modelo de 2 hipótesis y 2 pruebas + RW4+ adversarial instrumentación contra sellado con crosschecks y 400 semillas (integración CI pendiente); UI, reporte y backup | Revisar validez técnica del diseño de pruebas y sumar ruido adversarial/instrumental |
| G4 | MC02–MC14: automóvil completo | MC02–MC09: ocho lecciones y 32 preguntas implementadas; MC08 incorpora experimento ideal de energía de frenado; MC10–MC14 pendientes | Lecciones, casos, simuladores necesarios y examen por módulo |
| G5 | RW2/3/5/6/7/8: respiración, térmica, combustión, ECU y eficiencia | Planificado | Modelos revisados, balances/limitaciones, nunca datos OEM inventados |
| G6 | Diagnostic Engineering + ECU profiles ECO/DAILY/SPORT/DIAGNOSTIC | Base diagnóstica de v1.9; optimización nueva pendiente | Baselines, restricciones térmicas/emisiones fail-closed y pruebas adversariales |
| G7 | Herramientas/instrumentación propia y arquitectura híbrida generadora | Planificado | Prototipos simulados, licencia/software reutilizable, pruebas reproducibles |
| G8 | Proyectos integradores y validación 10/10 interna | Pendiente | CI repetible, recuperación completa, accesibilidad, trazabilidad, seguridad, revisión científica |

## Siguiente secuencia concreta

1. Validar CI del banco MC01 nuevo: cálculos, E2E Chromium/WebKit/móvil, respaldos, accesibilidad y funcionamiento offline.
2. Agregar un laboratorio de metrología con incertidumbre explícita y múltiples instrumentos, más seguridad de taller MC00 con decisiones de detener intervención.
3. Verificar RW4+ adversarial con fallas instrumentales sintéticas, E2E, portafolio y controles contra conclusiones prematuras, sin transformar índices en presiones reales.
4. Abordar MC02–MC05 en profundidad; después RW2/RW3 y controles.
5. Registrar pruebas físicas por separado cuando existan recursos; no usar su ausencia para bloquear desarrollo seguro en PWA.

## Contratos de evidencias

El caso RW4 usa ID lab-rotary-sealing-v1, modelo rw4-differential-synthetic-v1, semilla entera, hipótesis inicial, dos predicciones congeladas, lecturas sintetizadas de índices adimensionales, hipótesis final, razonamiento e incertidumbre. El texto libre no es evaluado semánticamente. Registro por IndexedDB existente; JSON esquema 1, sin alteración destructiva. El modelo representa exclusivamente un problema ficticio de clasificación, no una función de diagnóstico real de sellos de ápice ni una medición de compresión.

Referencias conceptuales:
- NIST (metrología e incertidumbre): https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty
- NIST (calibración/trazabilidad): https://www.nist.gov/publications/traceability-considerations-characterization-and-use-measuring-systems-0
- HSE (precauciones vehículo electrificado): https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm
- NASA Glenn (ciclo Otto): https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/internal-combustion-engine-otto-cycle/
- Mazda, referencia histórica de causas que imitan compresión deficiente: manual histórico alojado por un tercero, revisar versión/licencia antes de usar valores OEM. En el banco no se incluyen umbrales físicos.

**Límite científico:** la correspondencia numérica entre el índice sintético y la compresión real del motor no existe ni está implícita. Evaluar correctamente estas preguntas no acredita competencia física de taller.
