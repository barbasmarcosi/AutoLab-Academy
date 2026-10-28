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

## Ejecución oficial única (solicitud)

Las pruebas de aislamiento de cohortes, el lector ZIP, la invocación CLI y los controles de transferencia ya pasaron en CI antes de abrir etiquetas reales FD003. Los parámetros, referencias, intervalos y bandas de RUL quedaron fijados. Este commit activa una única evaluación del ZIP de NASA, publicando las métricas aunque demuestren falta de generalización. FD001 TEST y FD003 TRAIN permanecen sin utilizar.


## Resultado observado — evaluación única FD003 TEST (28/10/2026)

- Evidencia: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40789923931
- Artefacto agregado: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40789923931/artifacts/12861735037
- ZIP NASA original: SHA-256 c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2.
- 100 motores simulados FD001 TRAIN (20.631 filas) -> 100 motores simulados FD003 TEST; NO se abrió FD001 TEST/RUL ni FD003 TRAIN, ni se usó FD003 RUL antes de congelar las predicciones.

| Método congelado previamente | MAE FD003 TEST, ciclos | RMSE FD003 TEST, ciclos |
| --- | ---: | ---: |
| Mediana constante RUL FD001 TRAIN | 41,220 | 49,797 |
| Mediana vida FD001 TRAIN - ciclos FD003 vistos | 35,690 | 47,796 |
| Ridge ciclos α=1 | **32,136** | **42,819** |
| Ridge sensores+operaciones α=1 | **119,598** | 184,281 |
| Ridge ciclo+sensores+operaciones α=1 (primario) | **67,413** | 97,253 |

**Resultado negativo preregistrado:** la diferencia MAE (prior mediana vida - Ridge combinado) = **−31,723 ciclos**, es decir que el modelo combinado empeora 31,723 ciclos respecto del baseline. Intervalo descriptivo bootstrap pareado de motores FD003, 1.000 remuestreos seed 20261028: **[−49,156; −16,191]**. No refleja incertidumbre sobre transporte a autos reales.

**Cambio de dominio:** motores FD003 con al menos un valor fuera del rango observado en FD001 TRAIN: ciclo=4/100, operaciones=0/100, sensores=46/100. No equivale a confirmar qué sensores provocaron los errores ni identifica su causalidad. FD003 cambia los MODOS simulados de falla (HPC + fan), pero no hay etiqueta individual por tipo que autorice análisis de MAE por falla.

**Decisión irrevocable de R9:** no seleccionar "solo ciclos" retrospectivamente como nuevo campeón basándose en FD003 TEST; su mejor MAE solo es observación secundaria. El modelo combinado falla la transferencia especificada, y el FD003 TEST queda también **consumido** para nuevos ajustes. Antes de aplicaciones reales se requieren detección de cambio de dominio y una nueva cohorte independiente, junto con evidencia mecánica física. No inferir edad equivalente en km, salud mecánica porcentual ni vida automotriz.

La auditoría oficial de datos terminó SUCCESS. El estado de CI general debe verificarse por separado en el run final de la rama; E2E no modifica la conclusión científica.
