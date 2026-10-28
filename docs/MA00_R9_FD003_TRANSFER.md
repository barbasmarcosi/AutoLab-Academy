# MA00 R9 — Transferencia de FD001 a FD003 (prerregistro)

**Diseño fijo de investigación, 28/10/2026; documento creado antes de acceder a RUL FD003.**

## Hipótesis y separación por cohortes

NASA C-MAPSS describe FD001 con una condición de operación y un modo de degradación (HPC), y FD003 con una condición operativa y **dos modos de falla simulada** (HPC y ventilador). Referencia: https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data

R9 investiga si los modelos congelados en FD001 TRAIN transfieren su capacidad predictiva al conjunto **FD003 TEST previamente no utilizado**. No se reabre FD001 TEST/RUL (consumido en R6), y tampoco se emplea FD003 TRAIN. FD003 TEST y su archivo RUL se abren una sola vez para calcular resultados. **No se reentrena, recalibra o selecciona basándose en FD003 TEST.**

## Protocolo registrado antes de examinar FD003 RUL

- Fuente exclusiva ZIP NASA PCoE, digest SHA-256 fijado de R5: c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2. El lector abre SOLO train_FD001.txt, test_FD003.txt y RUL_FD003.txt. No extrae archivos a disco ni exporta trayectorias.
- 100 unidades FD001 TRAIN (20.631 observaciones), 100 motores simulados FD003 TEST; rechazo automático si no hay esos inventarios. No se conoce un ID de modo de falla para cada motor FD003; jamás afirmar precisión por subtipo de falla.
- Se conservan el escalado y medias de cinco ciclos de R6, ajustados **solo** en FD001 TRAIN.
- Se usa exclusivamente Ridge con **α=1.0 fijo**, histórico del modelo combinado seleccionado mediante CV sobre FD001 TRAIN en R6. Por transparencia las mismas α y reglas se aplican también a tres familias preregistradas sin escoger ganador: solo ciclo, solo variables operativas + 21 sensores, ciclo + operaciones + sensores.
- Dos referencias ajustadas exclusivamente con FD001 TRAIN: mediana de RUL entre todas las filas TRAIN (predicción constante) y mediana de vida completa de motores TRAIN menos ciclos observados en FD003 TEST, truncada a cero. Los ciclos observados sí están disponibles en la cohorte externa, sin usar el RUL verdadero.
- **Métrica primaria predefinida:** MAE en ciclos por motor FD003 TEST del Ridge conjunto, comparada contra mediana de vida FD001 menos ciclos observados. El resultado puede ser negativo: reportarlo íntegro. Secundarias: otros modelos, RMSE, sesgo medio y errores por rangos de RUL FD003 reales: 0–49, 50–99, ≥100.
- **Incertidumbre descriptiva:** 1.000 remuestreos pareados completos por motor FD003 TEST, seed 20261028, intervalo central percentil 95 % de la diferencia en MAE del baseline menos el Ridge. No presenta confianza para motores físicos ni implica independencia de muestras en otros dominios.
- **Desplazamiento de dominio:** número de motores FD003 TEST cuyas variables de ciclo, operaciones o sensores al último punto quedan fuera de rangos mínimo-máximo de características observadas en FD001 TRAIN. Diagnóstico descriptivo de soporte, no una corrección ni un selector.
- El modelo y TODAS las predicciones se producen antes de parsear las etiquetas RUL FD003 para calcular métricas. Los resultados solo se registran como JSON agregado, sin predicciones o trayectorias individualizadas.

## Reglas irrevocables de interpretación

Si el conjunto sensores+ciclo gana a la referencia, la capacidad de transferencia es **solamente entre dos configuraciones del mismo simulador**. Si pierde, reportar resultado negativo sin tuning retrospectivo. FD003 es nuevo para el proyecto, pero **no una cohorte física independiente de la familia de simulación C-MAPSS**.

No se calculan edad mecánica en kilómetros, salud de un automóvil, vida remanente automotriz, o causalidad de desgaste. El benchmark FD003 TEST quedará agotado para futuras decisiones de hiperparámetros tras esta ejecución.

## Reproducción y QA

Las pruebas unitarias usan exclusivamente motores artificiales:

    python3 -m unittest discover -s tests/science -p 'test_ma00_r9_fd003_transfer.py'

Con ZIP NASA original ya validado:

    python3 tools/benchmark_cmapss_fd003_transfer_r9.py archivo-NASA-original.zip > ma00-r9-fd003-aggregate.json

La descarga en Actions es **opt-in con marcador de commit [MA00 NASA FD003 once]** y publica exclusivamente el resultado agregado. No hay merge ni deploy de producción.
