# AutoLab Academy — Estado de implementación R&D

> Última actualización: 26/10/2026. Seguimiento de *código integrado*, no certificación profesional. Este documento se actualizará por incremento. Ninguna CI verde valida modelos físicos reales por sí sola.

| Bloque | Alcance | Estado al 26/10 | Gate siguiente |
| --- | --- | --- | --- |
| G0 | Asegurar CI, protección de main y retrocompatibilidad | RW6/RW7, RW8 y RW8+ integrados: CI verificadas verdes #40274432465, #40275295198 y #40276446700 (249 E2E). Última integración RW8+ de rúbrica/currículo aún bajo CI | Build, auditorías, E2E Chromium/WebKit/móvil, IndexedDB y offline |
| G1 / RW1 | Epitrocoide y cinemática offline, predicción y evidencia | Implementación inicial + A/B geométrico | Validación independiente del modelo y sensibilidad numérica |
| G2 / MC-P1 | MC00 seguridad, MC01 metrología/torque y MC03 comparación de arquitecturas | MC00–MC14 cubre inicialmente 17 lecciones, 64 preguntas y cinco exámenes por nivel; MC01 metrología Tipo A/B y MC08 frenado ideal integrados, no acreditan práctica real | Nuevos casos aplicados, evaluación de medición e incertidumbre, revisión curricular experta |
| G3 / RW4-P2 | Diferenciar falla sintética de sellado vs. encendido | Modelo de dos hipótesis con dos pruebas más RW4+ adversarial de sesgo instrumental (400 semillas), UI, respaldo, accesibilidad y E2E integrados con CI previa verde | Revisar validez técnica del diseño de pruebas y sumar ruido adversarial/instrumental |
| G4 | MC02–MC14: automóvil completo | MC00–MC14: primer recorrido conceptual (17 lecciones, 64 preguntas), con laboratorios MC01/MC08. El tronco inicial está implementado, pero simuladores específicos por módulo, revisión técnica externa y práctica física continúan pendientes. | Lecciones, casos, simuladores necesarios y examen por módulo |
| G5 | RW2/3/5/6/7/8: respiración, térmica, combustión, ECU y eficiencia | RW2 ciclo Otto ideal, RW3 balance sintético, RW5 convección lumped, RW6 solapamiento exacto de ventanas inventadas, RW7 curva Wiebe normalizada ficticia y RW8 selección de perfiles virtuales. Iniciales implementados con tests/CI verdes; CFD, puertos reales, combustión calibrada y datos OEM siguen pendientes | Modelos revisados, balances/limitaciones, nunca datos OEM inventados |
| G6 | Diagnostic Engineering + ECU profiles ECO/DAILY/SPORT/DIAGNOSTIC | RW8 y RW8+: selección de perfiles, restricciones duras, Pareto robusto, sensibilidad térmica, casos adversariales, portafolio/offline. 249 E2E RW8+ inicial en verde; CI posterior de rúbrica y currículo pendiente | Modelos físicos calibrados, incertidumbre medida y validación experimental por expertos |
| G7 | Herramientas/instrumentación propia y arquitectura híbrida generadora | Planificado | Prototipos simulados, licencia/software reutilizable, pruebas reproducibles |
| G8 | Proyectos integradores y validación 10/10 interna | Pendiente | CI repetible, recuperación completa, accesibilidad, trazabilidad, seguridad, revisión científica |

## Siguiente secuencia concreta

1. Cerrar la CI HEAD RW8+ tras las mejoras de rúbrica y el currículo, incluyendo Chromium/WebKit/móvil, Axe, pruebas adversariales, exportación y offline.
2. Auditar las fuentes científicas e implementar un modelo progresivo y físicamente fundamentado de apertura efectiva de puertos Wankel (área descubierta vs ángulo, condiciones de frontera y parámetros explícitos); distinguir magnitud calculada de caudal medido y NO simular flujo CFD inventado.
3. Profundizar investigaciones RW8+ con perturbaciones correlacionadas basadas en datos trazables solo cuando existan; la versión actual usa intervalos rectangulares ficticios, no probabilidades ni garantías físicas.
4. Integrar casos aplicados de MC02–MC14 con pruebas discriminantes, observabilidad y evaluación de evidencias, separando práctica virtual de certificación de taller.
5. Verificar integridad de IndexedDB, recuperación offline, seguridad de importación y criterios de aceptación reproducibles; mantener pruebas físicas y revisión experta externa como entregables independientes.

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

### RW6/RW7 — Primer laboratorio de puertos y combustión conceptual

- RW6: ventanas de una cámara ficticia a lo largo de 1080° de eje excéntrico, admisión base -40° durante 340° y escape desde 760° durante 320°. Una alternativa mueve solo inicio de admisión, manteniendo duraciones y escape; se evalúa **únicamente** el solapamiento de ventanas en grados. No calcula geometría real de puertos ni flujo, VE o presión.
- RW7: curva de Wiebe **normalizada** ficticia, independiente de RW6, con escenarios de inicio/duración y fracción acumulada a 220°. No calcula calor real, presión, NOx, BSFC, potencia o encendido OEM.
- Gate: pruebas de propiedades matemáticas, hipótesis antes de revelar, explicación, respaldo/portfolio, Axe, E2E Chrome/WebKit/móvil y PWA completamente offline. Aún no se considera un modelo de combustión validado.
- Fuentes conceptuales verificadas: [Heliyon 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/) y [SAE 2020-01-0280](https://saemobilus.sae.org/articles/initial-investigations-benefits-challenges-eliminating-port-overlap-wankel-rotary-engines-2020-01-0280).

La etapa `rotary-science` incorpora ahora `rw6-port-phase-tradeoffs` y `rw7-burn-shape-literacy` (2 lecciones / 8 preguntas); el total inicial de la Academia asciende a **83 lecciones y 234 preguntas**, manteniendo cinco etapas específicas MC00–MC14 y quince niveles globales. La revisión académica experta de las fuentes y el modelo termofluídico cuantitativo siguen pendientes.

### RW8 — Restricciones de optimización ECU, sin calibraciones

Se incorporó un optimizador **discreto y sintético** sobre ECO/DAILY/SPORT/DIAGNOSTIC con cinco límites independientes. Si no hay perfil viable, devuelve `chosen=null` y `failClosed=true`; nunca relaja restricciones silenciosamente. Las métricas normalizadas no corresponden a torque, temperatura, emisiones, knock ni mediciones reales. El banco permite predicción previa, explicación y exportación de evidencia. Basado en la noción de control ECU y límites de calibración de [Bosch](https://www.bosch-mobility.com/en/solutions/control-units/engine-control-unit/) y [SAE 2021](https://saemobilus.sae.org/articles/engine-model-based-pre-calibration-optimization-mid-level-hierarchical-control-design-03-14-05-0039); las cifras son inventadas. Faltan modelos continuos validados, mapas físicos, datos de motor, emisiones y evaluación experta.

### RW8 — formación específica de optimización

`ecu-optimization-curriculum.js` aporta dos lecciones y ocho preguntas de gestión ECU, restricciones duras, factibilidad, límites y trazabilidad; crea el nivel 16 `rotary-control`, después de `rotary-science`. Recuento de primera cobertura: **85 lecciones y 242 preguntas**. Este programa desarrolla criterio técnico, no sustituye la certificación, calibración ni supervisión de un motor real.

### RW8+ — Robustez y frente de Pareto, primera versión

El módulo `ecu-robust-analysis.js` evalúa condiciones de factibilidad nominal y bajo intervalos adversos supuestos ±0,03, construye la frontera no dominada SOLO entre opciones que satisfacen las cinco restricciones en el peor caso, y barre el techo térmico ±0,04. Incluye escenario adversarial nominalmente elegible pero robustamente infactible (falla cerrada), y escenarios de una/cuatro alternativas. Todo es **adimensional, ficticio y determinista**: los intervalos NO son distribuciones estadísticas, probabilidades, cotas de sensores reales ni temperaturas OEM. Una frontera de Pareto no implica una opción única ni seguridad física. Interfaz, hipótesis congeladas, exportación/portafolio, CI y accesibilidad sujetos a gate de validación.

Fuentes del concepto matemático: [Pareto](https://pmc.ncbi.nlm.nih.gov/articles/PMC10164242/) y [NIST incertidumbre](https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty).

### Formación RW8+ y evaluación discriminante

Dos lecciones adicionales (`rw8-robust-uncertainty` y `rw8-pareto-frontier`) y ocho preguntas vinculan métodos de peor caso, límite nominal vs robusto y no dominancia con la investigación. Recuento inicial de AutoLab: **87 lecciones, 250 preguntas y 16 niveles**. La rúbrica RW8+ ahora requiere dos decisiones conceptuales específicas (mecanismo de fallo y frontera dentro del conjunto admisible), además de pronósticos, razonamiento y limitaciones; **no** pretende valorar semánticamente el texto libre ni validar un controlador físico.

### Revisión de calidad RW8+ (26/10/2026)

- CI #40276446700 en verde: **249 E2E** para la primera integración (PWA, portfolio, Axe y offline); revisiones posteriores de conceptos, lecciones y selector siguen bajo validación.
- La rúbrica estructural requiere cuatro predicciones previas, dos respuestas discriminantes sobre mecanismo y conjunto de Pareto, razonamiento y límites. Solo valida respuestas objetivas y longitud de texto, no su semántica profunda.
- Rango adversarial: los intervalos ±0,03 y barrido de techo ±0,04 son ficticios, acotados y deterministas. Una solución robusta no acredita una calibración válida ni un margen físico. En ausencia de alternativa viable se informa `failClosed=true`.
- Conteo de primera cobertura: **87 lecciones, 250 preguntas, 16 niveles**; mantiene IndexedDB respaldo JSON esquema 1 y actualización de service worker v60. No se fusionó `main`.

### RW6+ — Apertura efectiva geométrica, sin flujo físico (nuevo)

`rotary-aperture.js` y `rotary-aperture-view.js` incorporan área analítica exacta de segmento circular ante un borde móvil, comparada con un rectángulo de igual área nominal. Rango de estudio: radio 10/20/30 mm ficticio y coordenada normalizada u∈{0,25;0,50;0,75}, que **NO corresponde a grados del eje ni a la trayectoria de un rotor real**. Una cuadratura independiente de punto medio ofrece estudio de convergencia (N y 2N), con tests de unidades, simetría, monotonicidad y cierre de área. Se integra con hipótesis congeladas, evaluación estructural, informe/portafolio, recuperación JSON y PWA offline v61; la CI final queda sujeta a aceptación.

**No hay puertos CAD ni carcasa OEM; no se calcula área efectiva 3D, coeficientes de descarga, presión diferencial, flujo compresible, VE, potencia ni eficiencia.** La fuente contextual es un estudio de [puertos Wankel](https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/), no el origen de las dimensiones inventadas.

### Formación RW6+ vinculada al cálculo geométrico

La lección `rw6-aperture-area-study` agrega cuatro preguntas sobre apertura parcial, convergencia de integración, naturaleza adimensional de u y condiciones necesarias para convertir superficie en flujo. Se ubica después de RW6 en el nivel `rotary-science`, sin migraciones de progreso. Recuento de primera cobertura: **88 lecciones, 254 preguntas, 16 niveles**. [Heliyon 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/) diferencia fases de puerto, área efectiva y CFD; el ejercicio 2D de AutoLab es independiente y sintético.

### RW6++ — Identificación inversa y límites de instrumento ficticio

`src/rotary-aperture-inverse.js` implementa la inversa estrictamente monótona de área de segmento circular 2D mediante bisección, partiendo de un área observada sintética en mm² y un intervalo determinista ± tolerancia de área total. Recupera intervalo de avance adimensional u, sensibilidad local `d(A/Amax)/du` y contrasta el ancho de intervalos cerca del borde y del centro. Casos con sesgo instrumentado artificial mayor al margen exponen la falla de cobertura de la verdad simulada. Laboratorio separado RW6++ con predicción congelada, expediente y respaldo offline; **no constituye medición de Wankel, incertidumbre metrológica estándar ni probabilidad de cobertura**. Fuente conceptual de distinción: [BIPM/JCGM GUM](https://www.bipm.org/en/web/guest/publications/guides). CI final pendiente.

### RW6++ — Integración pedagógica de problemas inversos

La lección `rw6-inverse-area-metrology` y cuatro preguntas se ubican después de `rw6-aperture-area-study`, dentro del nivel rotativo 15. Enseñan inversión numérica por bisección, sensibilidad casi nula cerca de los extremos, límites deterministas vs incertidumbre GUM y sesgos artificiales. Nuevo recuento inicial: **89 lecciones, 258 preguntas y 16 niveles**. `sw.js` incluye precache v64; tests de estructura y lectura, E2E de inferencia, reporte y recuperación JSON. La CI debe confirmar estos últimos cambios antes de declararlos aceptados.

### RW6+++ — Radio desconocido y conjunto geométrico factible (26/10/2026)

Se incorporó `src/rotary-aperture-radius.js` al banco RW6++, con cota ficticia de radio ±0/5/15 %, cota absoluta de área, proyección matemática exacta de la región factible sobre el avance u, comparación de bandas y caso imposible que **falla cerrado** (sin saturar falsamente a u=1). Una sola observación de área no identifica conjuntamente radio y apertura; para desambiguar hacen falta observaciones independientes o nueva instrumentación. Nuevas pruebas por grilla adversarial, invariantes de inclusión/nesting, round-trip con radio conocido, PWA con precache v65 y examen teórico de cuatro preguntas. Recuento de primera cobertura **90 lecciones / 262 preguntas / 16 niveles**; respaldo IndexedDB JSON v1 sin migraciones.

**Fronteras científicas:** geometría circular 2D, radio y tolerancias inventados; no hay GUM, inferencia estadística, CAD Wankel, medición trazable, coeficiente de descarga, fase angular real ni validación de ECU. CI del nuevo HEAD debe confirmarse antes de acreditar esta implementación.

**Refuerzo de rúbrica RW6+++**: cuarta predicción pre-registrada sobre monotonía del conjunto factible ante un radio menos conocido. 20 puntos para cada una de cuatro decisiones objetivas, 10 para razonamiento y 10 para límites. Texto libre verificado solo estructuralmente, no semánticamente. Se actualizan pruebas unitarias, navegador, Axe y offline.

## RW6++++ — observación independiente del radio (2026-10-26)

Se incorpora `independentlyCalibratedOpening` al motor geométrico RW6: intersecta una banda inicial del radio con una segunda lectura independiente de radio y una tolerancia determinista declarada. Proyecta el conjunto factible resultante a un intervalo de apertura, conserva la propiedad de subconjunto del resultado previo y falla cerrado ante cotas contradictorias o área físicamente imposible. Nuevas pruebas unitarias de reducción de ambigüedad e inconsistencias. Es un motor reutilizable; todavía no se expone como control propio en la interfaz ni representa instrumentos calibrados reales.
