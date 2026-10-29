# MA00 R12 — Calidad OBD y repetibilidad multisesión sin ensayos físicos

**29/10/2026 UTC; fase de desarrollo de plataforma, sin datos de vehículos físicos aportados.**

## Propósito y alcance

R9 y R10 evidenciaron que un predictor de RUL sobre simulaciones NASA podía colapsar en una cohorte nueva. R11 evaluó una calibración dentro del mismo dominio de FD004, pero **ninguno de estos resultados contiene sensores físicos OBD automotrices ni desgaste mecánico independiente**. Los cuatro TEST FD001/2/3/4 están consumidos para selección de modelos y permanecen fuera del desarrollo R12.

R12 transforma esas lecciones en **un módulo de calidad previo a cualquier inferencia** usando lecturas OBD-II Mode 01 ya soportadas en AutoLab Academy. R12 no pronostica RUL, no atribuye averías, no calcula edad equivalente ni modifica una ECU. Opera offline en la PWA.

**Código:** src/mechanical-age-r12-quality.js. **Interfaz existente:** src/mechanical-age-aa-view.js. **Pruebas:** tests/mechanical-age-r12-quality.test.js, tests/mechanical-age-r12-view.test.js y tests/e2e/mechanical-age.spec.js.

## Contrato del experimento, antes de observar datos físicos

- **Unidad experimental: sesión**, no respuesta, fila, segundo, transacción ELM ni ruido repetido artificialmente.
- Requiere **seis a doce sesiones** con identificadores distintos y tiempos host declarados crecientes, al menos cinco minutos entre inicios (tampoco demuestra independencia física).
- **Primeras cuatro sesiones:** calibración estrictamente descriptiva de un valor central de referencia por PID y la variación observada **entre sesiones**.
- **Siguientes dos a ocho sesiones:** prueba del valor mediano de cada PID contra el centro y la banda descrita a continuación. Estas sesiones no modifican el centro ni la banda.
- Cada sesión debe superar primero la auditoría existente de \`evaluateAAWithoutService\`: mismo vehículo/familia/instrumento/software declarados, sin intervención, ralentí caliente, controles documentados, mínimo 19 segundos de recepción host, 10+ lecturas por PID, fallas ≤20%, cadencia de capturas y condiciones operativas comparables. Se prohíben capturas abortadas, secuencias de señales duplicadas con timestamps alterados y ausencia de intervalos petición-respuesta.
- Para fuentes externas, se exige la **estructura serial y su integridad interna de bytes** del capturador ELM MA00, no solo valores numéricos tipeados en un JSON. Esos bytes tampoco autentican sensor/ECU/vehículo ni prueban calibración metrológica. El exportador puede operar en equipos Windows o Linux con pySerial; no se ejecuta en CI ni en PWA.
- PIDs numéricos requeridos: RPM 010C, refrigerante ECT 0105, carga 0104, STFT 0106, LTFT 0107. IAT 010F es opcional pero solo puede incluirse si se observa en **todas** las sesiones; no se imputan faltantes. El estado de combustible 0103 se valida por la auditoría de tramas originales, no se usa como valor continuo de envejecimiento.
- Banda puramente descriptiva, por PID: **máximo entre (max−min de las cuatro medianas de referencia) y (dos pasos nominales de cuantización del PID)**. Los pasos nominales según los decodificadores internos MA00 son RPM 0,25; ECT/IAT 1 °C; carga 100/255 puntos; STFT/LTFT 100/128 puntos. Esa banda NO equivale a error de calibración de ECU, incertidumbre de un sensor, límite de falla, intervalo de confianza o umbral de desgaste.
- Comparar la mediana de cada sesión posterior contra la mediana de las cuatro sesiones iniciales. Mostrar cuántas exceden la banda observada; **nunca transformar excedencia en diagnóstico**.
- Si faltan sesiones, hay incompatibilidad de regímenes, pérdida de PID, baja integridad serial o procedencia insuficiente, R12 retorna **abstain** con razones. No publicar cambios parciales por PID ni completar canales faltantes.
- Resultado \`descriptive_only\` nunca autoriza "salud %", "edad mecánica", "vida útil remanente", desgaste, señal de falla causal o precisión de medición física. Evidencia sintética/externa se etiqueta siempre y la independencia física permanece explícitamente no verificada.

## Evidencia disponible y limitada

Los tests y la demostración interactiva generan **seis secuencias sintéticas**, deliberadamente diferentes entre sí. Comprueban ejecución, integridad de esquema, separación de calibración y comprobación, calidad de PIDs, rechazo de datos importados que fingían ser sintéticos, escapes de HTML, compatibilidad offline y nulidad de conclusiones mecánicas.

**NO se capturó una sesión real, no se verificó un equipo ELM327 y no hay n=6 real con que estimar repetibilidad física, sensibilidad de diagnóstico ni un umbral de desgaste.** Los datos de LEVIN están hospedados en archivos externos de terceros y siguen sin auditarse; no se sustituyen por datos sintéticos.

## Protocolo físico mínimo futuro (requiere operador presente)

1. Registrar alias no identificatorio del automóvil y familia de motor declarada; no almacenar VIN, patente, GPS ni datos personales. Verificar permisos sobre el vehículo y seguridad antes de conectar hardware.
2. Con motor de combustión en un lugar ventilado, condiciones térmicas y cargas controladas, mismo adaptador y firmware, capturar **Mode 01 solo lectura**. No realizar trabajos con alta tensión HEV/EV, ni provocar condiciones de peligro para un ensayo de software.
3. Registrar observaciones de ambiente, ventilador, A/C, carga eléctrica, estado de combustible cerrado, combustible y reparaciones/variaciones entre sesiones. El JSON conserva tiempos host de solicitud/recepción, **no tiempos reales de adquisición ECU**.
4. Repetir en días o arranques diferentes y tener un plan preestablecido de sesiones completas sin intervención; el intervalo de cinco minutos es un filtro mínimo de la PWA, no un sustituto del control experimental.
5. Verificar el expediente serial, cobertura, cadencia, mesetas ambiguas y regimen. Recién después revisar diferencias descriptivas con otros controles físicos. Para desgaste estructural, se requieren comparadores externos como leak-down/compresión/inspección/lubricación, con incertidumbre, fabricante y familia definidos.

## Puertas de avance

- **Pasa como software R12:** tests unitarios, CI general, compilación, E2E online/offline y ausencia explícita de estimaciones físicas.
- **No pasa aún como ciencia aplicada:** falta dataset OBD automotriz multisesión, independencia física demostrable, validación de errores por sensor y un objetivo de desgaste físico independiente.

No merge, no deploy a producción ni benchmark contra TEST NASA ya consumidos.
