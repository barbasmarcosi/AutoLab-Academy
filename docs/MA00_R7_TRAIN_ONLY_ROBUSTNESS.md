# MA00 R7 — Robustez de sensores: estudio solo TRAIN (prerregistro)

**28 de octubre de 2026 — definido antes del análisis empírico R7.**

Los 100 motores de evaluación FD001 fueron utilizados en R6. **R7 NO debe volver a usar las etiquetas RUL de TEST para entrenar, seleccionar ni evaluar nuevos candidatos**. Se limita a los 100 motores simulados TRAIN.

## Problema

En R6, el modelo combinado obtuvo 21,951 ciclos de MAE en TEST sin ruido, pero 222,766 con un estrés artificial de 10 % de la dispersión de TRAIN. El estrés anterior también podía aplicar ruido a señales constantes porque un normalizador reemplazaba σ=0 por 1. Esto NO es una calibración física del ELM327.

## Diseño preregistrado

Origen: ZIP NASA PCoE C-MAPSS FD001 de digest SHA-256 c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2.

- **Variables:** número de ciclo y medias de los últimos 5 registros disponibles de 3 variables operacionales y 21 sensores. Sin acceso a observaciones futuras.
- **Cuatro modos fijos de ablación:** cycle (solo ciclos), cycle_operating (ciclos más 3 variables operacionales), cycle_measurements (ciclos más 21 mediciones) y cycle_sensors (todos).
- **Ridge:** α = 20, 200, 2000. Se informa toda la grilla, sin seleccionar ganador retrospectivo.
- **Partición:** 5 folds por motor TRAIN entero según resto de dividir (ID-1) entre 5. Sin contaminación de checkpoints del mismo motor entre fit y evaluación.
- **Puntos de evaluación:** ciclos 50, 100 y 150, siempre que el motor haya sobrevivido a ese ciclo. Esto tiene sesgo de supervivencia: informar cobertura por checkpoint.
- **Unidad estadística:** motor simulado, no fila. Se promedia el error absoluto entre checkpoints dentro de cada motor y luego entre motores. Los prefijos de ajuste reciben peso total uno por motor.
- **Estrés:** solo 21 canales de sensores que VARÍAN en TRAIN, no las tres variables operativas, ni el ciclo, ni los canales constantes. Escalas 0 %, 2 %, 5 %, 10 % de la sigma calculada exclusivamente con datos de ajuste del fold. Semillas predefinidas 7, 29, 53, 83, 107.
- **Pseudorreplicación:** cinco perturbaciones del mismo motor no son cinco motores independientes. Informar por separado número de motores únicos, checkpoints únicos y cantidad de predicciones con ruido.
- **Diagnóstico:** mediciones casi constantes y parejas de sensores con correlación absoluta >= 0,995, calculadas solo sobre TRAIN. Registrar magnitud L1 de coeficientes normalizados como indicio de sensibilidad, no como explicación causal.

## Reglas de interpretación

Una mejora en CV interna con sensores acompañada de mayor error bajo ruido obliga a destacar fragilidad. Si la mejora depende de variables operacionales, no interpretar el resultado como prueba de degradación. La presencia de sensores colineales junto con coeficientes grandes no establece causalidad. Ningún resultado valida edad mecánica, kilometraje equivalente, salud % ni vida remanente de automóviles.

**Validación interna solamente.** La prueba oficial no debe leer las etiquetas RUL TEST ni sus trayectorias numéricas. El archivo ZIP conserva otros miembros que se inspeccionan estructuralmente; su contenido no participa en R7.

## Reproducción

Pruebas sintéticas en CI:

    python3 -m unittest discover -s tests/science -p 'test_ma00_r7_robustness.py'

Auditoría original opt-in, solo agregados:

    python3 tools/audit_cmapss_robustness_r7.py archivo-nasa.zip > informe-r7.json

La ejecución original se activa SOLO con el marcador de commit [MA00 NASA robustness once]. El código fuente, ensayos, parámetros y semillas quedaron fijados en esta rama antes de la corrida. Sin merge ni despliegue de producción.

## Ejecución empírica única — protocolo congelado

La CI ya validó los controles de formato e independencia por motor y la invocación CLI. Este commit habilita una sola auditoría sobre el ZIP NASA previamente fijado por SHA-256. **No se cambiarán grillas, semillas ni resultados según los errores obtenidos**; los resultados se publicarán aunque no respalden ninguna mejora. La ejecución se limita a TRAIN y genera agregados sin datos individuales.


## Resultado real R7 — TRAIN only (28/10/2026)

Auditoría con fuente NASA fijada, completada correctamente en la rama:

- Run: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40746113659
- JSON agregado: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40746113659/artifacts/12842066810
- SHA-256 de origen coincidente con R5/R6: c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2.
- **Solo TRAIN**: 100 motores, sin procesar sus pares de evaluación FD001 ni etiquetas RUL TEST. Todos los MAE que siguen son CV interna y **no son comparables directamente** con el MAE TEST 21,951 de R6.
- Seis canales de los 21 sensores presentaron amplitud/desviación casi constante: S1, S5, S10, S16, S18 y S19. Ningún par de sensores variables superó |r|≥0,995 en este conjunto de checkpoints; **no demuestra ausencia de colinealidad por debajo del umbral**.

| Ablación | α | MAE sin ruido, ciclos | MAE con 10% de sigma TRAIN por canal medido | L1 media coef. normalizados |
| --- | ---: | ---: | ---: | ---: |
| Solo ciclos | 20 | 36,983 | 36,983 | 37,284 |
| Solo ciclos | 200 | 43,449 | 43,449 | 13,316 |
| Solo ciclos | 2000 | 47,986 | 47,986 | 1,793 |
| Ciclos + operaciones | 20 | 37,071 | 37,071 | 38,811 |
| Ciclos + operaciones | 200 | 43,456 | 43,456 | 13,741 |
| Ciclos + operaciones | 2000 | 47,986 | 47,986 | 1,846 |
| Ciclos + mediciones | 20 | 31,568 | 31,621 | 58,456 |
| Ciclos + mediciones | 200 | 33,536 | 33,576 | 48,222 |
| Ciclos + mediciones | 2000 | 41,466 | 41,467 | 18,265 |
| Ciclos + operaciones + mediciones | 20 | 31,623 | 31,680 | 59,575 |
| Ciclos + operaciones + mediciones | 200 | 33,561 | 33,605 | 48,617 |
| Ciclos + operaciones + mediciones | 2000 | 41,468 | 41,469 | 18,310 |

**Interpretación científicamente limitada:** con los checkpoints 50/100/150 en CV de TRAIN, agregar mediciones reduce MAE para α=20 de 36,983 a 31,568 ciclos. Agregar solo variables operacionales NO muestra mejoría. Aumentar la penalización reduce L1 pero puede aumentar mucho el error (subajuste). Bajo el protocolo nuevo, el estrés artificial de 10% en canales medidos variables apenas cambia MAE. **No equivale a invalidar el resultado R6: el estrés R6 perturbaba más columnas, incluidos canales de operación/casi constantes y evaluaba motores TEST en un solo ciclo final; R7 difiere tanto en perturbación como población y checkpoints.** No comparar ambas métricas como si fueran una misma prueba.

Hipótesis pendiente: analizar ablation del mecanismo de R6 sin reexaminar TEST, sobre un fold interno, para identificar cuál de los cambios de protocolo reduce la sensibilidad. La magnitud 10% de sigma TRAIN no corresponde necesariamente a un error físico del escáner o sensor. No hay todavía validación en un automóvil ni indicadores de edad/desgaste real.
