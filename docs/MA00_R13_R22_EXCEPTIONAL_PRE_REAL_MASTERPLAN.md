# MA00 — Programa de replanteo excepcional antes de pruebas físicas (R13–R22)

**Estado: planificación técnica, no implementación de R13–R22.**
**Rama:** research/mechanical-age-obd-v0. Independiente de producción. No fusionar ni desplegar sin nueva autorización.
**Corte:** octubre de 2026.

## 1. Replanteo central: tres productos científicos, nunca uno mezclado

**A — Integridad instrumental y del dato.** Identificar lo realmente recibido, cuándo, por qué canal, versión de decodificador, soporte de protocolo, régimen y calidad. Señalar incertidumbres o abstenerse.

**B — Diagnóstico funcional razonado.** Proponer hipótesis alternativas, mecanismos, predicciones observables, pruebas discriminantes y criterios de falsación. No atribuir causa cuando los sensores disponibles no distinguen hipótesis.

**C — Investigación de desgaste estructural / vida útil.** Línea independiente y **bloqueada para afirmaciones cuantitativas reales** hasta disponer de verdad terreno mecánica (compresión, leak-down, otras mediciones según mecanismo), metrología y validación prospectiva entre motores.

**Nueva misión de MA00:** pasar de "edad mecánica vía OBD" a "laboratorio de evidencia diagnóstica automotriz". Aprender a razonar y medir con excelencia, no fabricar un número de kilómetros o salud para llenar una pantalla.

## 2. Línea de base y límites comprobados

- R12 tiene captura local ELM327 Mode 01 solo lectura, recibos host por PID, contraste A–A, integridad interna de bytes, flujo de 4 sesiones de referencia + 2–8 posteriores, demos sintéticas PWA offline y CI verde en SHA a940bbacc07227f13318e3fb35c5c0d2cab5fbed (run 40796931361). No hay validación de hardware ni sensor físico.
- FD001 TEST original dio mejoras en simulación, pero comportamiento frágil en una prueba de ruido. El mecanismo exacto de esa fragilidad no quedó resuelto por R8.
- R9 FD001→FD003: modelo combinado de sensores MAE 67,413 ciclos simulados frente a baseline 35,690. Transferencia fallida.
- R10 FD001→FD002: 0/259 predicciones publicables por cambio de dominio; evita extrapolación, pero cobertura cero.
- R11 FD004 TRAIN→TEST: 239/248 publicados; MAE de los aceptados 35,484 ciclos y referencia 49,473. Intervalos de ±79,69 ciclos incluyeron la verdad en 227/239; misma familia de simulador, **no validación de vehículos**.
- Los TEST FD001, FD002, FD003 y FD004 están consumidos para selección de decisiones. Prohibido reutilizarlos para modificar modelos, umbrales, hipótesis o validar mejoras.
- DieselOBD, EngineFaultDB y LEVIN tienen límites de etiquetas, alcance y procedencia; ninguno acredita automáticamente desgaste estructural.
- No existe todavía una cohorte física automotriz comparable de seis sesiones, ni verdad-terreno mecánica independiente.

## 3. Escalera obligatoria de evidencia

| Nivel | Evidencia | Afirmación permitida | Nunca implica |
| --- | --- | --- | --- |
| E0 | Datos generados por el mismo test | Funciona contrato, cálculo y UI | Exactitud física |
| E1 | Replay y emulador externo fijado | Interoperabilidad y robustez de protocolo | ECU real validada |
| E2 | Dos generadores/oráculos independientes con fallas inyectadas | Eficacia **en el banco** y límites de identificabilidad | Diagnóstico de fallas reales |
| E3 | Datasets automotrices publicados, licencia/etiquetas/grano auditados | Estadística y benchmarking limitado a esa población | Desgaste si no hay ground truth |
| E4 | Muestras físicas controladas, replicadas e instrumentación verificada | Repetibilidad física local | Generalización a flotas |
| E5 | Verdad terreno mecánica independiente, cohortes externas prospectivas | Evaluación de desgaste en el dominio medido | Universalidad |

**R13–R22 pueden aspirar a un excelente nivel E0–E3 y dejar el protocolo E4/E5 preparado, pero nunca declarar E4/E5 realizado.** En toda UI/report se representa explícitamente la evidencia que sustenta cada campo.

## 4. Arquitectura objetivo

Fuente (serial real / replay / emulador / dataset)
→ adaptador aislado y whitelist solo lectura
→ registro de bytes RAW, procedencia, versión, solicitud y recepción host
→ decodificación con oráculo independiente
→ calidad, observabilidad, comparabilidad y cambio de dominio
→ **abstención explicada** si no se cumple
→ características por sesión, con PIDs y unidades auditables
→ mapa de mecanismos alternativos + hipótesis falsables
→ pruebas discriminantes seguras según riesgos y utilidad
→ explicación, límites, seguimiento y rúbrica
→ PWA offline / AutoLab Academy.

Contratos separados: ObservedSignal, AcquisitionContext, EvidenceClaim, Mechanism, Hypothesis, DiscriminatingTest, SessionGroup, AbstentionReason, DatasetManifest y Report. Las vistas **no** elevan el grado de evidencia. Se minimizan datos privados; sin VIN, patente, ubicación o identidad del cliente en reportes por defecto.

## 5. Etapas R13–R22 y gates concretos

### R13. Auditoría de afirmaciones, ontología y observabilidad — PRIMERA

**Trabajo:** inventariar toda salida MA00 visible en UI/JSON/código y clasificar cada afirmación E0–E5; separar observado, derivado, supuesto, hipótesis, no identificable y bloqueado. Matriz motor/combustible/regímenes (gasolina cerrado, diésel, GNC, híbrido, eléctrico). Relación PID→mecanismo→confusores→prueba alternativa. Distinguir una corrección de combustible de un sensor erróneo, una falla reversible y desgaste físico.

**Entregables:** catálogo de claims con esquema machine-readable, matriz de observabilidad y DAG causal inicial, tests negativos de no atribución física, ADR de fronteras entre tres productos.

**GATE R13:** 100% de campos mostrados MA00 trazados a su fuente/tipo de inferencia; 0 rutas con edad/km, health%, desgaste o RUL reales; la ausencia de señal/régimen soportado produce abstención explícita. Ninguna afirmación diagnóstica sin alternativa y condiciones observacionales declaradas.

### R14. Compatibilidad OBD y pruebas diferenciales del transporte

**Trabajo:** usar Ircama/ELM327-emulator como ECU/adaptador virtual; reproducir tramas con pseudo-terminales y decodificador de referencia independiente. Testear ELM, modo 01, bitmap, multi-ECU, protocolos, timeouts, STFT/LTFT, eco, reintentos limitados, NO DATA, errores parciales, frames múltiples, contaminación de sesión, latencia y límites de buffers. Preparar frontera distinta para OBDonUDS sin prometer compatibilidad formal.

**Entregables:** banco diferencial versionado, corpus golden y adversarial, CI ejecutable sin automóvil.

**GATE R14:** 100% de vectores de referencia y escenarios negativos definidos pasan; 0 tramas ambiguas se aceptan como válidas; 0 comandos de ECU de escritura/reprogramación salen del adaptador bajo tests; todo caso no soportado se abstiene. "100%" refiere al corpus, no a todos los vehículos del mundo.

### R15. Calidad temporal, metrología digital y perfil de condiciones

**Trabajo:** reconocer que requestAtMs y receivedAtMs son marcas HOST; jamás inventar simultaneidad ECU. Presupuestos documentales de latencia, muestreo, cuantización, eventos perdidos, reloj desordenado y sesgos; distinguir error de decodificación, calidad instrumental desconocida y incertidumbre de proceso. Experimentos de perturbación en ralentí y cambios de carga/combustible bajo modelos simulados.

**Entregables:** contratos MeasurementEvidence y TimeQuality, estrés temporal reproducible, perfiles de condición de operación por tecnología.

**GATE R15:** toda corrupción temporal/unidad/cadencia de corpus adversarial se rechaza o documenta sin reparar datos en silencio; ninguna desviación digital se traduce en incertidumbre física sin patrón de referencia.

### R16. Modelos mecánicos y causalidad identificable

**Trabajo:** mapas de fallas alternativas por combustible, admisión, encendido, compresión, refrigeración, electricidad, sensores, actuadores, emisiones. Enseñar a diferenciar fuga de admisión y baja presión de combustible, fallas de sensor y fenómeno real, termostato y ECT sesgado, gasolina y GNC. DTC = observación/código de falla, **no** causa final.

**Entregables:** biblioteca de Hypothesis y DiscriminatingTest, precondiciones, indicadores a favor/en contra, condiciones indistinguibles, riesgos de prueba y casos de falsación.

**GATE R16:** 100% de hipótesis publicables tienen mecanismo, al menos una alternativa, señal esperada, prueba falsable y límites; fallas no identificables con PIDs disponibles llevan a "no concluyente", no a falsa certeza.

### R17. Laboratorio virtual independiente y falsable

**Trabajo:** reutilizar emulación ELM como transporte, y construir/usar por separado modelos simplificados de motor, control en lazo cerrado y sensores (regímenes térmicos/carga/combustible/trims), con condiciones de validez. Evitar que generador y evaluador compartan el mismo algoritmo como única fuente de verificación. Inyectar ruido, sensores congelados, sesgo, latencias, confusores y fallas simultáneas. No afirmar que un simulador 0D representa desgaste tribológico completo.

**Entregables:** al menos 30 familias de escenario predefinidas, oráculos físicos/eléctricos independientes, semillas registradas, invariantes y anti-ejemplos.

**GATE R17:** se demuestran casos en que dos mecanismos producen las mismas señales y fuerzan abstención; 100% de invariantes declaradas del banco se verifican; resultados etiquetados simulados. La cantidad 30 es cobertura de ingeniería deseada, no datos reales.

### R18. Auditoría de fuentes automotrices y corpus de evidencia

**Trabajo:** examinar EngineFaultDB, DieselOBD, LEVIN y nuevas fuentes únicamente si existen enlaces/licencias legítimos. Inventario de filas, canal, unidad, timestamps, motor, sesiones, procedencia, faltantes, etiquetas y condiciones. Separaciones por motor y vehículo, no por fila; benchmarks base y negative controls; fuente sin metadatos o ground truth no se usa para inferir desgaste.

**Entregables:** dataset manifest con hash, licencia, alcance, restricciones, checks de calidad y no reutilización de TEST. Mantener PWA local-first y exports anónimos.

**GATE R18:** 100% de fuentes usadas con licencia y procedencia documentadas; ninguna validación entre motores sin identidades/splits adecuados; si faltan datasets, publicar esa limitación sin inventar puntuaciones.

### R19. Motor de hipótesis y elección de pruebas

**Trabajo:** priorizar reglas/razonamiento transparentes; explicar qué hipótesis sobreviven a cada medición y cuál prueba segura separaría posibilidades, con ventaja de información. Probabilidades solo cuando existan priors y likelihoods calibradas, no números de certeza decorativos. Diferenciar observación, sospecha, simulación y confirmación mecánica externa.

**Entregables:** escenarios de investigación, resultados interpretables PID→mecanismo→prueba→evidencia, comparación de hipótesis y rúbricas pedagógicas.

**GATE R19:** en casos sintéticos ciegos e identificables, meta preregistrada de >=90% inclusión de mecanismo verdadero entre tres hipótesis principales; en controles deliberadamente no identificables, meta >=95% abstención. Métricas por motor/caso, nunca por trama. **No representan sensibilidad clínica ni mecánica real.**

### R20. Robustez, cambio de dominio y abstención

**Trabajo:** validación cruzada entre fuentes y generadores, escenarios adversariales, drift de sensores, operación fuera de dominio, fallo de instrumento, política de abstención y risk–coverage. Calibración por motor en corpus de entrenamiento, test externo reservado, nunca reciclar los TEST NASA consumidos.

**Entregables:** scorecard reproducible con cobertura, MAE solo donde exista etiqueta pertinente, falsos positivos de inferencia, abstenciones justificadas y sensibilidad a perturbaciones.

**GATE R20:** 0 afirmaciones de error garantizado fuera de condiciones de intercambio estadístico; fallos de transferencia quedan visibles; resultados rechazados no se cuentan como éxitos, y coberturas selectivas no se atribuyen a toda la cohorte.

### R21. Aprendizaje de excelencia integrado en AutoLab Academy

**Trabajo:** insertar teoría junto a práctica en lecciones, hipótesis antes de observar, pruebas discriminantes, simulador, resultado, revisión de inferencias, contraejemplos y feedback. UX mobile/offline accesible, buscadores, historial local y privacidad, export/backup seguro. Sin reescribir 94 lecciones de una vez ni introducir contenido superficial.

**Entregables:** laboratorios interactivos, simuladores referenciados desde las lecciones, rúbricas, pruebas E2E desktop/móvil/offline y casos no identificables.

**GATE R21:** 100% de laboratorios activados explican hipótesis alternativas y limitaciones, tienen feedback comprobable y no presentan puntuaciones físicas sin evidencia. Ninguna lección migrada queda por debajo de su estándar pedagógico.

### R22. Pre-final: auditoría red team y preparación de validación física FUTURA

**Trabajo:** revisión independiente donde sea posible (ingeniería, estadística, QA, seguridad, pedagogía); pruebas de fuzz, fallos de energía, recuperación, datos enormes, offline, malware de input, XSS, test de cero comandos de escritura y no fugas personales. Escribir protocolo de operador para seis o más sesiones reales, criterios de inclusión, seguridad de conexión y equipo, pruebas externas de compresión/leak-down/presión aceite según necesidad y límites. **No ejecutar todavía pruebas en autos.**

**Entregables:** candidato independiente etiquetado pre-real/research-only; paquete de aceptación reproducible; matriz de evidencia, riesgos abiertos, procedimientos de captura y futura verdad-terreno.

**GATE R22:** 100% tests críticos de integridad/safety en verde, 0 defectos críticos abiertos, evidencia de E2E y recuperación, 100% de claims trazados y protocolo físico completo. **No debe etiquetarse físicamente validado** mientras falten E4/E5.

## 6. Rubrica de aceptación 10/10 PRE-REAL (sin confundir con exactitud física)

| Eje | Peso | Qué se verifica |
| --- | ---: | --- |
| Veracidad científica, observabilidad y límites | 20 | 0 afirmaciones de desgaste no validadas |
| Diagnóstico falsable y alternativas | 20 | Pruebas discriminantes, no-identificabilidad |
| Protocolo y datos íntegros | 15 | Tramas, tiempos, unidades, faltantes, whitelist |
| Robustez de banco y extrapolación | 15 | Shift, perturbaciones, abstención y risk–coverage |
| Arquitectura, reproducibilidad y privacidad | 10 | CI/digests/seeds, local-first, anti-leakage |
| Pedagogía, accesibilidad y UX offline | 10 | Práctica inmediata y devolución |
| Preparación metrológica y física | 10 | Procedimiento operable, seguridad, instrumentos |
| **TOTAL** | **100** | RC pre-real requiere >=90/100 y >=8/10 en cada eje |

**VETO independientemente del puntaje:** edad/km/salud/RUL sin ground truth; sensor falso interpretado como falla estructural; comandos de escritura desde ruta de solo lectura; datos externos promocionados como físicos; falsificar origen; usar TEST consumido para seleccionar; mezclar vehículos o regímenes sin avisar; afirmar 90% cobertura conformal sin supuestos; exponer VIN/patente/identificadores; no mostrar abstención.

## 7. Riesgos prioritarios a refutar

1. STFT/LTFT y RPM muestran compensación reversible, no necesariamente desgaste (crítico).
2. Sensor sesgado imita proceso real, o dos fallas generan las mismas señales (crítico).
3. Generador y evaluador usan los mismos supuestos: circularidad del banco (crítico).
4. Diferencias de GNC, diésel, híbrido y EV invalida heurísticas de gasolina (alto).
5. Host timestamp no equivale a adquisición ECU y el scanner multiplexa PIDs (alto).
6. Un único adaptador emulado no certifica interoperabilidad con hardware (alto).
7. R9/R10 demostraron fallos de transferencia y falta de cobertura (crítico).
8. Múltiples PIDs y filas del mismo auto no son múltiples motores independientes (alto).
9. Banda digital de variación no es incertidumbre física del instrumento (crítico).
10. Sin etiquetas de desgaste ninguna curva de ML identifica edad estructural (crítico).

## 8. Reusar herramientas y normas: no reinventar la rueda

- ELM327-emulator de Ircama: https://github.com/Ircama/ELM327-emulator — emula multi-ECU, serial virtual, respuestas OBD y anomalías; revisar licencia, fijar versión y comprobar compatibilidad.
- SAE J1979 clásico, versión 202505: https://saemobilus.sae.org/standards/j1979_202505-e-e-diagnostic-test-modes
- SAE J1979-2 OBDonUDS, versión 202604: https://store.accuristech.com/standards/sae-j1979-2_202604?product_id=3095291
- ASAM ODX / MCD-2 D para definiciones diagnósticas: https://www.asam.net/standards/detail/mcd-2-d/
- ASAM MDF 4.3.0 para interoperabilidad de registros (opcional, evaluar librería existente): https://www.asam.net/standards/detail/mdf/
- NIST sobre incertidumbre metrológica: https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty
- NIST sobre medición independiente y validación de sistemas: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/

Las normas son referencias: **no afirmar cumplimiento total** sin estudiar textos normativos completos y realizar ensayos de conformidad. Licencias y versiones deben verificarse antes de integrar dependencias.

## 9. Trabajo siguiente exacto y gestión del programa

**El primer ciclo práctico debe ser R13, no R17 ni volver a un modelo predictivo.**

1. Auditar todo campo/report/vista MA00 y fijar lista de claims posibles e imposibles.
2. Crear contratos versionados de EvidenceClaim, ObservedSignal, Context, Hypothesis y AbstentionReason.
3. Implementar matriz de observabilidad por fuente, familia de motor y régimen con casos negativos GNC/diésel/HEV.
4. Integrar pruebas automáticas que impidan mostrar un diagnóstico/edad superior al nivel de evidencia.
5. Ejecutar CI, reportar fallos adversos y no declarar R13 completo sin pasar todos sus gates.

**Regla de ejecución:** una etapa terminada solo si existe código/artefacto, pruebas, resultados adversariales, evidencia verificable de CI y acta crítica de sus limitaciones. No avanzar de una etapa que no alcanza su gate. El issue #55 registra los hitos y decisiones.

**Definición de excepcional:** una plataforma que sabe medir, razonar, distinguir mecanismos, guiar pruebas y decir «todavía no sabemos», incluso sin un auto disponible. La validez física de desgaste queda pendiente de futuros ensayos, independientemente del puntaje de software.
