# Automotive Mechanics Core — formación mecánica integral

> **Estado:** primer incremento MC00/MC01/MC03 disponible como cuatro lecciones y doce preguntas; MC02 y MC04–MC14 continúan planificados. No hay certificación de taller.
> **Articula con:** [ENGINEERING_MINDSET_RD_VISION.md](ENGINEERING_MINDSET_RD_VISION.md) y [ROTARY_ENGINEERING_LAB.md](ROTARY_ENGINEERING_LAB.md).
> **Objetivo:** que AutoLab no produzca únicamente usuarios de escáneres o programadores de ECUs, sino profesionales que entiendan el **vehículo completo** y puedan diagnosticar, intervenir con criterio, investigar y diseñar soluciones.

## 1. Filosofía de enseñanza

La mecánica es un lenguaje obligatorio de la electrónica automotriz. **Un sensor puede registrar un síntoma mecánico; un problema mecánico puede producir un DTC; una calibración puede ocultar una falla.** Por eso el proyecto necesita un tronco común de mecánica aplicada incluso para el especialista en control/diagnóstico.

La progresión propuesta parte de la formación existente en electromecánica e ingeniería del estudiante, pero **no supone** experiencia profesional automotriz ni saltea validaciones prácticas por tener conocimientos de software/electricidad.

Cada módulo debe contemplar: principios y fuerzas, componentes, función, modos de falla, diagnóstico diferencial, mediciones y tolerancias, procedimiento de reparación/ajuste, riesgos, interpretación de documentación OEM, simulación/estudio de caso, prueba objetiva y práctica física supervisada futura.

## 2. Mapa de contenidos: tronco común

| ID | Eje de formación | Capacidades y prácticas evaluables |
| --- | --- | --- |
| **MC00** | Seguridad y taller | EPP, elevación/puntos de apoyo, herramientas, llaves dinamométricas, fluidos, incendios, bloqueo/etiquetado, documentación de trabajo, límites de competencia y ambiental |
| **MC01** | Física y metrología automotriz | Unidades, fuerza, torque, potencia, transferencia térmica, hidráulica, neumática, fricción, tribología, tolerancias, incertidumbre, reloj comparador, calibración |
| **MC02** | Arquitectura del vehículo | Motor → embrague/convertidor → caja → diferencial → ruedas; estructuras monocasco, auxiliares, subsistemas, energía y señales |
| **MC03** | Motores alternativos nafteros | Cinemática biela-manivela, distribución, compresión, admisión, combustible, combustión, encendido, escape, rendimiento volumétrico, diagramas y desgaste |
| **MC04** | Mecánica de motores diésel | Compresión/autoencendido, inyección, alta presión, turbocompresión, postratamiento, emisiones, diagnóstico y peligros de alta presión |
| **MC05** | Lubricación, refrigeración y sellado | Bombas, termostatos, enfriadores, viscosidad, cojinetes, presión, pérdidas, cavitación, juntas y fallas combinadas |
| **MC06** | Transmisión y tren motriz | Embragues, convertidores, cajas manuales/automáticas, CVT, reductoras, diferenciales, semiejes, pares, pérdidas, lubricantes |
| **MC07** | Suspensión, dirección, ruedas | Geometría, alineación, neumáticos, rodamientos, amortiguación, fuerzas, desgaste y medición |
| **MC08** | Frenos y dinámica vehicular | Circuitos hidráulicos, energía térmica, discos, pastillas, ABS/ESC, adherencia, diagnóstico seguro y riesgos críticos |
| **MC09** | HVAC y sistemas auxiliares | Ciclo frigorífico, compresor, carga térmica, actuadores, confort, electrónica y manejo reglamentado de refrigerantes |
| **MC10** | Electricidad, electrónica y redes | Alternador, arranque, batería 12/24 V, potencia y drivers, sensores, CAN/LIN, caída bajo carga, osciloscopio, mediciones no invasivas |
| **MC11** | ECU, inyección y controles | MAF/MAP, lambda, trims, estrategias, lazo cerrado, diagnóstico de emisiones, adaptación, lectura de parámetros y pruebas independientes |
| **MC12** | Híbridos, EV y BMS | Arquitectura híbrida, inversores, motor eléctrico, regeneración, gestión térmica, seguridad HV, estimación SOC/SOH y límites de intervención |
| **MC13** | Método de diagnóstico integral | Quejas del cliente, reproducción, síntomas cruzados, árbol causal, hipótesis, costo informativo de pruebas, incertidumbre y reporte |
| **MC14** | Ingeniería, optimización e invención | Línea de base, métricas, trade-offs, diseño experimental, análisis de datos, herramientas propias y validación de cambios |

**Rotativos/Wankel** son una especialización de motores y R&D, no un sustituto del dominio del motor alternativo ni del vehículo completo. Véase [Rotary Engineering Lab](ROTARY_ENGINEERING_LAB.md).

### Trazabilidad externa

La cobertura propuesta se inspira en familias amplias de competencias descritas por el [INET argentino](https://catalogo-inet.educacion.gob.ar/informacion-sectorial/automotriz) y en las áreas [ASE A1–A9](https://www.ase.com/test-series/). **No implica alineación oficial validada**, aprobación ministerial, certificación ASE ni equivalencia educativa.

## 3. Progresión por niveles

### M0 — Fundamentos observables (taller y sistemas)

MC00–MC02, MC05 básico y MC10 básico. Objetivo: reconocer componentes, aplicar unidades, leer esquemas, nombrar riesgos, localizar información técnica y hacer mediciones virtuales correctas.

**Evaluación:** diagnóstico de falla elemental con restricción de seguridad + identificación de puntos de medición y orden de trabajo. Práctica física con equipos seguros y supervisión cuando exista.

### M1 — Mecánica funcional completa

MC03–MC09. Objetivo: comprender la cadena de transformación y entrega de energía, causas de pérdida de torque/eficiencia, fuerzas de suspensión/frenado y modos típicos de desgaste.

**Evaluación:** casos multicomponente (temperatura anómala, ruido, vibración, pérdida de frenado, consumo) que obligan a diferenciar causa mecánica vs. electrónica; procedimientos revisados contra documentación.

### M2 — Diagnóstico mecánico-electrónico de sistemas

MC10–MC13, complementados por motores de combustión y HEV/EV. Objetivo: correlacionar síntomas con señales, medir de modo no invasivo, justificar pruebas y reconocer cuándo detenerse.

**Evaluación:** expediente sintético con curvas y condición de carga, hipótesis competidoras, prueba de descarte, informe y límites.

### M3 — Ingeniero investigador e inventor

MC14 y rutas paralelas [Diagnostic Engineering / Automotive R&D](ENGINEERING_MINDSET_RD_VISION.md). Objetivo: diagnosticar causas raíz, modelar, optimizar, diseñar instrumento y validar resultados sin ignorar seguridad, emisiones ni fiabilidad.

**Evaluación:** proyecto abierto con baseline, método experimental, versión de artefactos, pruebas y revisión humana.

### Especialidades optativas con dependencias

- Wankel: [Rotary Engineering Lab](ROTARY_ENGINEERING_LAB.md) tras MC01/03/05/10/11.
- Calibración y control de motores: MC03/04/05/10/11/13/14; **simulación antes de banco real**.
- BMS y electromovilidad: MC00/01/05/10/12/13 y formación de seguridad eléctrica específica.
- Transmisiones y dinámica: MC01/02/06/07/08 y métodos de diagnóstico.
- Instrumentación e ingeniería inversa: MC01/10/13/14 con pruebas no invasivas.

## 4. Método de experiencia de aprendizaje

### De piezas aisladas a cadenas causales

Cada lección debe conectarse con al menos un escenario de vehículo (por ejemplo: «consumo alto» puede deberse a sensor, presión de neumático, resistencia de freno, termostato, mezcla, conducción o transmisión; no elegir culpable por intuición).

**Plantilla de lección:**
1. ¿Qué problema resuelve el componente? (modelo mental)
2. ¿Qué leyes físicas gobiernan su operación? (magnitudes/unidades)
3. ¿Cómo interactúa con otros sistemas? (arquitectura)
4. ¿Qué puede fallar? (mecanismos, no solo lista de síntomas)
5. ¿Cómo lo mediría? (prueba segura y documentación)
6. ¿Qué otra falla puede dar el mismo síntoma? (alternativas)
7. ¿Cómo demuestro reparación o mejora? (antes/después)
8. ¿Qué optimizaría y cuáles serían las consecuencias?

**Laboratorios propuestos:** despiece virtual etiquetado, medición de holguras sintéticas, diagramas presión–volumen, transmisión torque-rpm, balance térmico, fallas de lubricación, hidráulica de frenos ilustrativa, comparación de neumáticos, señales ECU y un expediente de diagnóstico cruzado.

### Evaluación con transferencia

- Memorizar una pieza o reconocer una imagen **no prueba** comprensión: incluir ejercicios variables con nueva configuración y evidencia previa a revelar la respuesta.
- Separar conocimiento conceptual, competencia de procedimiento en simulación y destreza física observada.
- Si falta fuente del fabricante, no proponer torques de apriete, tolerancias, presión, niveles de fluidos ni secuencias de intervención como valores universales.
- Seguridad en frenos, dirección, elevación, combustible a presión, refrigerantes y HV: **veto por conducta insegura**, sin compensación por nota.
- Explicaciones abiertas se archivan para evaluación humana: no afirmar que la plataforma juzga semántica sin dicha capacidad.

## 5. MVP de mecánica general para AutoLab

**No reescribir la academia actual.** Incorporar módulos pequeños que se apoyen en las funciones existentes (lecciones, preguntas, motor de casos, evidencia, portafolio, FSRS y persistencia offline).

### Primer incremento MC-P1

- MC00, MC01 y MC02 como lecciones **revisadas técnicamente**, con diagramas originales/licenciados y fuentes.
- Primer desafío integrado «Pérdida de rendimiento: ¿motor, frenos, sensor o transmisión?» con observaciones sintéticas, hipótesis alternas y pruebas discriminantes.
- Ejercicio «Torque y potencia a través de una transmisión»: los resultados verificables requieren declarar relación, unidades, eficiencia supuesta y régimen.
- Tarea de medición de holgura/tolerancia sintética con incertidumbre explícita.
- Banco de al menos 12 preguntas conceptuales de distintas complejidades y 3–5 variantes por escenario, con respuestas justificadas por fuentes revisadas.
- Exportes compatibles con IndexedDB y JSON existentes **sin afirmar evidencia de taller**, revisión del esquema antes de almacenar nuevos registros.
- QA unitario de unidades, fórmulas, etiquetas, fuentes y regresiones; E2E offline/teclado/WebKit y control de tamaño de caché; revisión física no implícita.

### Siguientes incrementos

| Incremento | Cobertura | Gate |
| --- | --- | --- |
| **MC-P2** | Motor alternativo, admisión/escape, lubricación, refrigeración, diésel | Modelos de primer principio, múltiple hipótesis, sin números OEM inventados |
| **MC-P3** | Transmisiones, suspensión, dirección, frenos, HVAC | Procedimientos y riesgos trazables; entradas inseguras no aprueban |
| **MC-P4** | Electricidad, ECU, control, redes, HEV/EV integrados al tronco mecánico | Casos multiárea, correlaciones causales, límites de alta tensión |
| **MC-P5** | Proyecto de optimización/instrumento + portafolio | Baseline, pruebas repetibles, efectos secundarios y revisión humana |

## 6. Práctica real y competencias profesionales

Para experiencia física, mantener la distinción clara entre **prácticas posibles de baja energía supervisadas** y prácticas que requieren formación, permisos, fabricante/equipamiento y taller apto.

- Prioridad práctica inicial: inspección segura, lectura de manuales, mediciones de baja tensión, montaje mecánico no crítico, instrumentos de metrología y documentación de hallazgos.
- Más adelante: medir sistemas automotrices sobre bancos supervisados, trabajar con vehículos de taller y registrar evidencia genuina y autorizada.
- Actividades críticas (frenos, dirección, elevación, combustible a alta presión, airbags y HV) **no** quedan habilitadas por exámenes web.

**Hitos verdaderos**: resolver problemas nuevos, distinguir fallas distintas, justificar intervenciones y aprender de resultados medidos. El «10/10» del producto nunca equivale a licencia ni destreza práctica certificada.

## 7. Criterios de calidad curricular

1. Exactitud y fuentes de ingeniería confiables; magnitudes y unidades revisadas.
2. Cobertura integral del vehículo con prerequisitos explícitos y sin módulos «decorativos».
3. Casos conectados a fallas plausibles, al menos dos hipótesis y controles de seguridad.
4. Evaluación de transferencia y retención, feedback basado en evidencia verificable.
5. Material accesible y disponible offline, progreso local confiable.
6. Revisión de especialistas en mecánica automotriz y contraste con documentación técnica.
7. Trazabilidad a referencias INET/ASE como *benchmark*, sin pretender aval oficial.

**Resultado deseado:** un profesional que, al ver una señal eléctrica anómala, también se pregunte por presión, temperatura, fricción, lubricación, holguras, esfuerzos y transmisión de energía antes de culpar a una ECU.
