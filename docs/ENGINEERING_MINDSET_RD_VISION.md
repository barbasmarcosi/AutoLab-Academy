# AutoLab Academy — Visión: diagnóstico, ingeniería inversa e innovación aplicada

> **Estado:** visión y plan propuesto; **no implementado** en esta rama.
> **Fecha:** 2026-10-25. **Origen:** conversación sobre el perfil profesional buscado.
> **Relación:** amplía [ROADMAP.md](ROADMAP.md) y complementa, **no sustituye**, la v1.9 de transferencia diagnóstica y el trabajo de robustez/QA.

## 1. Norte profesional

**Formar un profesional capaz de comprender por qué y cómo funciona un vehículo completo —mecánica y electrónica—, diagnosticar problemas que otros no resuelven, optimizar sistemas mediante evidencia y desarrollar sus propias herramientas cuando las existentes no alcanzan.**

El objetivo no es aprender botones de un escáner, memorizar DTC ni limitarse a ser preparador de motores. Es integrar cuatro capacidades que se alimentan mutuamente:

1. **Investigar:** comprender principios físicos, arquitectura, señales, restricciones, tolerancias y decisiones de diseño; ingeniería inversa ética y legal.
2. **Diagnosticar:** formular hipótesis competidoras, escoger pruebas discriminantes, interpretar evidencia y explicar incertidumbre y causas raíz.
3. **Optimizar:** establecer una línea de base, definir funciones objetivo y restricciones, comparar alternativas y demostrar mejoras reproducibles.
4. **Inventar:** crear, probar y mantener instrumentos, adaptadores, firmware, software y automatizaciones propios para resolver limitaciones reales — o como ejercicio creativo explícito.

**Principio rector:** «No dar por inevitables los límites de una solución conocida; cuestionarlos con método, respetando los límites físicos y de seguridad».

### Lo que NO perseguimos

- Un ranking que confunda completar ejercicios con competencia de taller real.
- Una máquina de adivinar averías con supuestas certezas sin mediciones.
- Remapear una ECU sin modelo, identificación y validación específicos.
- Promesas universales de ahorro, potencia, reducción de emisiones o durabilidad.
- Desactivar protecciones, manipular emisiones, adulterar odómetros, intervenir sistemas de seguridad ni promover pruebas en vía pública.
- Reinventar solvers, parsers, simuladores o firmware sólidos que se puedan integrar legalmente.

## 2. Identidad pedagógica: «ingeniero de laboratorio»

El alumno trabaja como investigador técnico. Cada desafío avanza por un ciclo explícito, con libertad para equivocarse y contrastar alternativas:

`OBSERVAR → MODELAR → HIPÓTESIS → PREDICCIÓN → MEDIR → REFUTAR/CONFIRMAR → DISEÑAR → VALIDAR → DOCUMENTAR → ITERAR`

Los errores útiles forman parte del aprendizaje. Recompensar **calidad del procedimiento y evidencia**, no solo coincidencia de respuesta, velocidad ni audacia. Dos soluciones técnicamente distintas pueden aprobar si cumplen requisitos y se sostienen con pruebas.

### Resultados de aprendizaje verificables

Al completar un itinerario avanzado, el estudiante debería poder, **en simulación y bajo evaluación**, realizar lo siguiente:

- Derivar un modelo causal de sensores → actuadores → ECU → planta y sus observaciones.
- Distinguir correlación, causalidad, artefactos de medición y variables de confusión.
- Planear pruebas que maximicen información minimizando costo, riesgo y tiempo.
- Argumentar con incertidumbre, tolerancias, errores instrumentales, perturbaciones y trazabilidad.
- Diseñar métricas objetivas, tests A/B reproducibles, controles y condiciones de parada.
- Seleccionar cuándo usar instrumentación/computación existente y cuándo construir una herramienta nueva.
- Implementar un prototipo acotado con pruebas automatizadas, documentación, revisión de riesgos y versionado.
- Reconocer cuándo **no intervenir** por falta de datos, autorización, equipamiento o competencia.

Ninguna simulación otorga por sí sola habilitación para operar con alta tensión, calibrar vehículos reales ni certificar oficio.

## 3. Una base mecánica integral y dos caminos que transcurren en paralelo

### Tronco común obligatorio — Automotive Mechanics Core

La excelencia diagnóstica o de I+D requiere comprender **cómo funciona mecánicamente un vehículo completo**, no solo leer los parámetros de una ECU. El [currículo integral de mecánica automotriz](AUTOMOTIVE_MECHANICS_CURRICULUM.md) propone 15 módulos (MC00–MC14) de seguridad de taller, física y metrología, motores nafteros y diésel, lubricación, refrigeración, transmisiones, suspensión/dirección, frenos, HVAC, electrónica, redes, ECU, híbridos/EV, diagnóstico e ingeniería aplicada. Progresión M0–M3, prácticas concretas, prerrequisitos, rúbricas y referentes curriculares INET/ASE **sin equiparar la PWA con una certificación**.

La mecánica y la electrónica se enseñan como causas y efectos de un mismo sistema. Ninguna especialización en motores o ecu optimizada sustituye este tronco común.

### A. Diagnostic Engineering — «¿Qué le pasa y por qué?»

1. Arquitectura funcional: electricidad, electrónica, redes, sensores, drivers, actuadores, combustión, postratamiento, motor eléctrico, BMS y potencia.
2. Pruebas diagnósticas: OBD/UDS **de lectura** donde sea pertinente, multímetro, osciloscopio, curvas, alimentación, corrientes, trazas CAN y correlación multicanal.
3. Hipótesis alternativas: un mismo síntoma con distintas causas, dos fallas simultáneas, defectos intermitentes y contextos engañosos.
4. Estrategia de pruebas: costo/beneficio informativo, falsos positivos, perturbaciones, mediciones redundantes, contrapruebas y fallas de instrumento.
5. Investigación causal: ¿qué componente falló?, ¿por qué?, ¿cómo se reproduce?, ¿qué evidencia lo demuestra?, ¿cómo evito recurrencia?
6. Herramientas propias: decodificadores, capturadores de datos, analizadores de oscilogramas, generadores de informes y bancos de prueba seguros.

### B. Automotive R&D — «¿Podría funcionar mejor?»

1. Modelado: plantas físicas simplificadas, señales, restricciones térmicas, eficiencia, incertidumbre y costo de intervención.
2. Optimización multiobjetivo: consumo, respuesta, emisiones, temperatura, fiabilidad, mantenibilidad y costo; fronteras de Pareto en lugar de un único “mejor” absoluto.
3. Control y calibración: lazo cerrado, estimación, filtros, mapas/lookup tables, gestión de par, estrategias de transición y protecciones.
4. Ingeniería inversa: especificación basada en observaciones, comparación de versiones, abstracción de protocolos y validación de hipótesis, **sin vulnerar seguridad ni propiedad intelectual**.
5. Desarrollo de prototipos: sensores, interfaces de adquisición, circuitos de baja tensión aislados, herramientas de análisis, simuladores, firmware en placas educativas.
6. Validación: casos adversariales, regresión, baseline, repetibilidad, trazabilidad, limitaciones y decisión de no desplegar cuando no se cumple el umbral.

**Ambas vías confluyen** en proyectos integradores: un diagnóstico revela una limitación; la ingeniería desarrolla una mejora; el diagnóstico verifica que la mejora funciona y no introduce fallas nuevas.

### Laboratorio insignia — Rotary Engineering Lab

El [Rotary Engineering Lab](ROTARY_ENGINEERING_LAB.md) es la primera gran especialización de investigación mecánica: geometría y cinemática Wankel, respiración/puertos, sellos de ápice, lubricación, termodinámica, refrigeración, combustión, ECU, fiabilidad, emisiones, generación eléctrica y optimización bajo restricciones. Propone RW0–RW10 y entregas RW-P0–RW-P5, con un primer **Rotary Geometry Explorer offline**. No está implementado.

El alumno deberá contrastar Wankel con motores alternativos sin confundir el **ciclo termodinámico Otto** con la **arquitectura mecánica** de un motor; el Wankel de encendido provocado puede operar bajo el principio de cuatro tiempos. Premiar el análisis de ventajas **y** desventajas, no el favoritismo tecnológico.

## 4. Familias de desafíos que debería ofrecer AutoLab

### D1 — Diagnóstico de máxima información
Síntoma ambiguo, presupuesto limitado de mediciones y varias hipótesis. Elegir una secuencia que discrimine con mínima intervención y sin inventar lecturas. Debe existir la opción «evidencia insuficiente».

### D2 — Ingeniería inversa de una caja negra
Se entrega un sistema simulado con entradas y salidas conocidas, ruido y condiciones variables. Formular un modelo, predecir respuestas a entradas nuevas y contrastarlo contra un conjunto de prueba oculto. No es decodificar software OEM ni eludir protecciones.

### D3 — Taller de instrumentación
Construir un pequeño instrumento *virtual* o de baja tensión aislada: capturador de PWM, analizador lógico, registrador de corriente o conversor de datos. Entregar esquema, tolerancias, test unitario, test de ruido y guía de seguridad. Evaluar antes de proponer cualquier conexión física.

### D4 — Competencia de optimización responsable
Objetivo cuantitativo, restricciones simultáneas y escenarios distintos al de entrenamiento. El alumno puede elegir algoritmos o configuraciones diferentes. Ganar no significa maximizar potencia a cualquier precio; **soluciones que violen restricciones no son válidas**.

### D5 — Fallas provocadas por tu propio invento
El prototipo mejora una métrica pero degrada otra o falla fuera de las condiciones nominales. Investigar regresiones, optimizar y demostrar que la solución corregida es robusta. Este es un desafío clave para pasar de “idea ingeniosa” a ingeniería.

### D6 — Investigación abierta reproducible
Pregunta, hipótesis, instrumentos/datos, metodología, bitácora, resultados, límites, conclusiones y réplica de un segundo caso. Exportación a portafolio con procedencia *sintética* o *medida* explícita.

### D7 — Mecánica integral y estudio de arquitecturas
Desmontaje conceptual seguro, relaciones fuerza-torque, transmisión, fricción, refrigeración, mantenimiento y fallas mecánicas que imitan averías eléctricas. Contraste Wankel vs. alternativo con unidades, condiciones, simuladores reproducibles y opción «no hay datos suficientes». Especialización: [Rotary Engineering Lab](ROTARY_ENGINEERING_LAB.md).

## 5. Proyecto faro: modos de ECU y consumo — solo banco/simulación primero

**Pregunta de investigación:** «¿Se puede mejorar la eficiencia energética o la respuesta percibida respecto de una calibración de referencia, bajo distintas condiciones, sin comprometer controles de seguridad, fiabilidad ni emisiones?»

Se parte de una **ECU y un motor simulados**, no de un archivo real de un vehículo. La futura experiencia debe contener:

1. **Diagnóstico antes de optimizar:** verificar sensores y actuadores, trims y plausibilidad; no “calibrar” para esconder una avería.
2. **Baseline reproducible:** mismo ciclo de carga, temperatura inicial, masa/condiciones y perturbaciones; guardar versión, semilla y datasets.
3. **Modelo simplificado y claramente etiquetado:** par, combustible, aire, respuesta transitoria, temperatura, emisiones ilustrativas y restricciones. Nunca inferir especificaciones OEM ni equiparar un modelo educativo a homologación.
4. **Perfiles propuestos:** ECO (eficiencia), DAILY (compromiso), SPORT (respuesta) y DIAGNOSTIC (observabilidad); son **estrategias conceptuales**, no archivos de remapeo universales.
5. **Optimización multiobjetivo:** registrar métricas por perfil, comparar contra baseline y presentar trade-offs; permitir que el «óptimo» dependa del uso.
6. **Pruebas adversariales:** cambios de carga, temperatura, ruido de sensores, variabilidad entre unidades, transición entre modos y degradaciones simuladas.
7. **Criterios de rechazo:** invalidar cualquier propuesta que exceda límites definidos de temperatura, emisiones simuladas, presión/combustión, diagnóstico, seguridad o confiabilidad. Nunca permitir eliminar salvaguardas para pasar.
8. **Informe reproducible:** hipótesis, parametrización, resultados, gráficos, conjunto de validación separado y limitaciones explícitas.

**Distinción técnica importante:** variaciones de mezcla, avance, presión, flujo o inyección **no implican** ahorro por sí mismas; intervienen régimen, carga, combustión, control de emisiones y durabilidad. Se exige prueba sobre datos, no afirmaciones.

**Salida real a taller, fuera del alcance inicial:** solo con autorización del propietario, documentación/modelo específico, equipo competente, instalaciones adecuadas, normativa aplicable y validaciones profesionales. No se implementarán en la PWA funciones de escritura a ECU, bypass de emisiones o desactivación de protecciones.

## 6. Plataforma y arquitectura: ampliar sin romper lo existente

### Hoy — base comprobable en el repo

PWA estática con JS modular, IndexedDB, respaldo JSON, aprendizaje y evaluación offline, casos sintéticos de diagnóstico/ECU/inyección, CAN clásico + DBC de lectura, osciloscopio educativo, ejercicios de componentes, BMS ilustrativo y PyBaMM externo. **No existe aún un motor de optimización de ECU, banco real de calibración ni hardware conectado.**

### Diseño objetivo

- **Núcleo de experimentos versionado y determinista**: escenarios, semilla, baseline, modelo, restricciones, decisiones, observaciones, provenance, evidencias y resultados.
- **Motor de evaluación explícito**: separación entre decisiones objetivas comprobables, explicación escrita no evaluable automáticamente y revisión humana; no simular evaluación semántica inexistente.
- **Workspace de investigación**: hipótesis y pronósticos *antes* de revelar mediciones; bitácora causal; comparador de experimentos A/B, gráficos y exportación de informes.
- **Catálogo de modelos/adaptadores**: con interfaz para modelos JS ligeros offline; solvers pesados en ejecución local/desktop/CI opcional, sin pretender que corran en Pages.
- **Portafolio**: conservar intentos, resultados, versiones, advertencias y pruebas, sin acreditar habilidades de campo no verificadas.
- **Mecanismo de compatibilidad**: revisar límites de cuota y schema antes de persistir nuevas entidades; migraciones comprobadas, respaldo/restore viejo y nuevo, corrupción y falla de escritura visibles.
- **Offline-first y accesibilidad**: escenarios y rúbricas esenciales sin Internet, datos locales, navegación teclado/touch/lector de pantalla, sin claves privadas ni backend obligatorio.
- **Lectura y simulación por defecto**: ninguna práctica educativa transmite CAN, flashea ECU ni conmuta sistemas HV.

### Reutilización obligatoria antes de desarrollar

Inventariar licencia, API, soporte offline, exactitud, tamaño, mantenimiento y riesgos de integrar herramientas existentes. Candidatas **a evaluar**, no dependencias aprobadas:

- Modelos eléctricos: CircuitJS/alternativas SPICE con licencia compatible y ejecución local.
- CAN: `python-can`, `cantools`, herramientas de decodificación y el adaptador DBC existente.
- Baterías: conservar PyBaMM en pipeline científico reproducible, no reinventar su física en JS.
- ECU educativa: estudiar ecosistemas abiertos como Speeduino/rusEFI, formatos y documentación; **sin acoplarse a hardware, firmware o mapas OEM reales** en la fase inicial.
- Optimización: métodos deterministas, búsqueda acotada, análisis de sensibilidad y visualización existentes antes de crear solvers ad hoc.

Una comparación documentada **usar / adaptar / construir** es obligatoria en cada iniciativa nueva.

## 7. Ruta de implementación propuesta (NO ejecutada)

| Fase | Entregables incrementales | Prueba de aceptación |
| --- | --- | --- |
| **R0 — Diseño verificable** | Contrato de experimento; rúbricas; datasets y 3 desafíos redactados; matriz de herramientas/licencias; threat model educativo | Revisión de consistencia, alcance y seguridad; casos de éxito y rechazo definidos |
| **R1 — Investigación causal** | Una caja negra sintética y una investigación diagnóstica ambigua parametrizada; decisiones y evidencias persistibles | Semillas repetibles; pruebas de falsos positivos, evidencia insuficiente y alternativas viables |
| **R2 — Optimización virtual** | Modelo ligero offline y comparador de perfiles ECO/DAILY/SPORT/DIAGNOSTIC bajo baseline y restricciones | Comparaciones sin cambiar condiciones; rechaza límites vulnerados; prueba con dataset no visto |
| **R3 — Inventor's bench** | Desafíos de instrumentos virtuales y adaptadores de datos, API pluggable; plantilla de diseño/test | Pruebas unitarias, de integración y regresión; datos corruptos no generan conclusiones |
| **R4 — Proyecto integrado** | Investigar falla → proponer mejora → construir prototipo digital → validarlo → documentarlo | Evidencia completa, revisión de incertidumbre, reproducibilidad, comparación A/B |
| **R5 — Camino profesional supervisado** | Guías de trabajo real, checklist de autorización, instrumentación, fuentes técnicas y portafolio con evidencia humana | Validación externa; nunca convertir una simulación en licencia profesional |

Las fases son objetivos de producto, **no versiones ya prometidas ni fechas**. Priorizar R0/R1 sin bloquear la actual agenda de confiabilidad v1.9; dividir trabajo en PRs revisables.

**Carriles curriculares adicionales, también propuestos:** [Mecánica MC-P1–MC-P5](AUTOMOTIVE_MECHANICS_CURRICULUM.md) y [Wankel RW-P0–RW-P5](ROTARY_ENGINEERING_LAB.md). Orden inicial sugerido: revisar fuentes/licencias/prerrequisitos de MC-P1 y RW-P0; luego construir **un** desafío transversal de mecánica y **un** explorador geométrico Wankel offline que pasen pruebas. No duplicar el motor de evaluación y portafolio existente.

### Primer backlog concreto para implementar después de aprobar el concepto

- [ ] `experiment-schema`: IDs/semilla/dataset/modelo/versión, métricas, restricciones, procedencia y estados; rechazo de NaN, resultados inalcanzables y entradas malformadas.
- [ ] `experiment-evaluator`: evalúa evidencia objetiva y condiciones de rechazo; informe transparente.
- [ ] `black-box-lab`: al menos dos modelos alternativos compatibles con observaciones iniciales; pruebas que los distingan.
- [ ] `ecu-profiles-sim`: baseline + cuatro perfiles virtuales + temperatura/carga/ruido, con funciones objetivo reproducibles.
- [ ] `experiment-report`: hipótesis previa, datos, algoritmos, parámetros y consecuencias no deseadas.
- [ ] Pruebas automáticas: mismos resultados con misma semilla, entradas corruptas, restricciones adversariales, retrocompatibilidad IndexedDB/JSON, offline Pages, seguridad y accesibilidad.
- [ ] Revisión externa de contenido físico/automotriz antes de atribuir resultados reales a modelos.

## 8. Rúbrica de ingeniería (propuesta inicial, revisar con especialistas)

| Eje | Peso | Evidencia exigida |
| --- | ---: | --- |
| Modelo y comprensión | 15% | Variables, hipótesis, relación causal y supuestos explícitos |
| Estrategia experimental | 20% | Baseline, control, prueba discriminante y pronóstico anterior al resultado |
| Interpretación de evidencia | 20% | Datos trazables, incertidumbre, explicaciones alternativas, limitaciones |
| Optimización/solución | 15% | Métrica de mejora verificable en casos de validación, trade-offs honestos |
| Validación y robustez | 20% | Repetibilidad, pruebas adversariales, efectos secundarios y fallas esperadas |
| Comunicación y reproducibilidad | 10% | Informe claro, versión, semilla, insumos, resultados y decisiones |

**Veto independiente del puntaje:** propuesta insegura, manipulación de emisiones, falsa procedencia, mediciones inventadas o superación de límites esenciales => experimento no aprobado. No confundir creatividad con riesgo.

## 9. Definición de «10/10» en este eje

No se anuncia por porcentaje de funcionalidades ni por cantidad de ejercicios. Se requiere evidencia separada de:

1. **Correctitud técnica:** modelos con supuestos visibles, validación de unidades, fórmulas contrastadas y revisión experta; sin aseveraciones OEM falsas.
2. **Aprendizaje genuino:** tareas nuevas, transferencia entre escenarios, decisiones previas a medición, evaluación de incertidumbre y rúbricas transparentes.
3. **Ingeniería reproducible:** inputs/semillas/versiones, baselines consistentes, métricas verificadas, regresiones y pruebas de casos adversariales.
4. **Seguridad y ética:** límites *fail-closed*, no intervención de ECU/HV en navegador, autenticidad de evidencia y contexto de uso legal.
5. **Fiabilidad de producto:** offline de verdad, IndexedDB/restore, accesibilidad, tests unitarios/E2E y CI verde; pruebas físicas se informan aparte.
6. **Realismo de validación:** experiencia de simulador claramente separada de competencia de taller y de resultados experimentales supervisados.

El «10/10» interno del software puede alcanzarse sin que el alumno haya hecho aún validaciones físicas; jamás debe presentarse eso como aprobación profesional externa.

## 10. Decisiones y preguntas abiertas

- **Decidido conceptualmente:** tronco común de mecánica automotriz + diagnóstico + innovación en paralelo; Wankel como laboratorio insignia, sin tratarlo como arquitectura superior por definición; aprendizaje basado en ciencia aplicada; creatividad con evidencia; offline-first; reutilizar herramientas existentes; no funciones de escritura real.
- **Pendiente de investigación:** primer modelo físico, licencia/integración del simulador, tamaño de datasets y límites de IndexedDB, hardware de banco de baja tensión, formato de interoperabilidad y evaluación especializada.
- **Pendiente de priorización:** si R1 empieza con inyección/motor, señales de ECU, CAN o BMS. La elección no altera la visión.
- **Pendiente de validación externa:** exactitud física y pedagógica de los retos e interpretación de resultados medidos.

---

**Criterio final:** el éxito no es que AutoLab enseñe solamente a *reparar lo que existe*, sino que entrene para **entenderlo, demostrar qué falla, descubrir cómo mejorarlo y crear algo nuevo cuando haga falta**.
