# AutoLab Academy v1.3 — Inyección y correcciones de combustible

## Propósito y límites

Cuatro investigaciones educativas de inyección multipunto de gasolina en lazo cerrado. Se examinan STFT, LTFT, RPM, carga, MAP, MAF y una lambda ilustrativa en tres condiciones: ralentí, crucero y demanda moderada.

**No son mediciones reales, simulación calibrada de combustión ni tablas OEM.** Las presiones y los caudales de referencia pertenecen exclusivamente al banco ficticio. No todos los vehículos permiten consultar presión de combustible mediante un PID OBD-II genérico.

## Casos

| Caso | Pauta orientativa | Prueba independiente del modelo |
|---|---|---|
| Aire adicional no medido | Ajuste positivo alto a ralentí que cede a crucero | Aislamiento de ramal ficticio devuelve STFT hacia referencia |
| Presión insuficiente | Ajuste positivo crece con demanda | Presión virtual 265 kPa frente a 380 kPa de referencia de este banco |
| Sublectura MAF | Ajustes aumentan con caudal y MAF no coincide con flujo externo | Caudalómetro ficticio independiente: 25 g/s frente a MAF de 12 g/s |
| Inyector sin estanqueidad | Correcciones negativas mayores a ralentí | Ensayo aislado virtual de estanqueidad diferencia una carga ficticia |

Los números no pueden trasladarse a vehículos reales. El signo de la corrección muestra la reacción del controlador, no identifica una pieza. Lambda ilustrativa próxima a 1 puede coexistir con trims altos cuando la ECU consigue compensar.

## Experiencia y rúbrica

1. Elegir hipótesis antes de abrir estados de funcionamiento.
2. Inspeccionar ralentí/crucero/carga; al menos ralentí y crucero para acreditar comparación.
3. Elegir prueba del banco y anticipar resultado normal/anormal/peligrosa antes de revelarlo.
4. Justificar el diagnóstico final en al menos 90 caracteres.
5. Revisar corrección e informe Markdown con condiciones y mediciones observadas.

Puntuación: 45 causa, 25 prueba confirmatoria, 15 comparación idle-cruise, 5 pronóstico acertado y 10 justificación presente. **Prueba insegura = cero puntos.** El texto no se evalúa semánticamente, por lo que la validez del razonamiento requiere un especialista.

Los resultados permanecen en el arreglo de prácticas IndexedDB existente, el Portafolio y el respaldo JSON con esquema compatible. No hay servidor ni conexión a vehículo.

## Formación

Cinco lecciones y diez preguntas originales adicionales, séptima etapa «Inyección y diagnóstico OBD». Total: **51 lecciones, 130 preguntas y siete etapas**, conservando IDs anteriores para FSRS.

## Bibliografía conceptual, no fuentes de las cifras simuladas

- [Honda: correcciones en P0171](https://downloads.laboratoryb.org/insight/other_manuals/HONDA_DTC.pdf)
- [Pearson: Short-term and long-term fuel trim values](https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf)
- [Standard OBD PIDs y disponibilidad](https://obd2pid.com/pids)
- [Bosch: instrumentación y diagnóstico](https://www.boschdiagnostics.com/sites/default/files/documents/fix_7803_manual.pdf)

## Validación y pendientes

Tests de coherencia de los cuatro bancos, signos de ajustes, control en lazo cerrado, comparación de estados, evidencia confirmatoria, pronóstico, bloqueo de acciones inseguras, informe, total de IDs, portafolio y recuperación JSON. Los nuevos archivos entran en caché offline.

Pendientes: QA interactiva Safari/iPhone y VoiceOver, revisión editorial por técnico automotor, datasets instrumentales reales con procedencia y licencias y rúbrica profesional de razonamiento. Ninguna práctica acredita competencia real ni habilita manipular líneas de combustible o alta tensión.
