# MA00 R11 — Cobertura, calibración y utilidad selectiva (prerregistro)

**Protocolo fijado ANTES de abrir FD004 TEST, octubre de 2026.**
Esta fase utiliza **turbofanes SIMULADOS**, no motores de automóviles.

## Antecedentes

R9 encontró que el modelo FD001 de sensores no transfería a FD003 (MAE 67,413 vs 35,690 de una referencia simple). R10 se abstuvo en 259/259 motores FD002 por falta de soporte. Los TEST FD001/FD002/FD003 están consumidos y se excluyen explícitamente.

FD004, aún no utilizado en MA00, representa **seis condiciones operativas y dos modos de falla simulada**. El inventario publicado del archivo original es 249 motores TRAIN / 61.249 filas y 248 motores TEST / 41.214 filas, con 26 columnas por ciclo. Algunas descripciones secundarias invierten los números; la auditoría comprueba el archivo oficial en lugar de confiar en tablas. Fuente NASA https://catalog.data.gov/dataset/cmapss-jet-engine-simulated-data .

## Tres conjuntos independientes de motores FD004 TRAIN

- **Ajuste:** motores 1 a 199. Ridge con α=20 predefinida a partir de un control previamente ensayado solo en TRAIN de R7. Variables: ciclos observados y medias de últimos cinco ciclos de tres parámetros de operación + 21 señales de sensores. Checkpoints de entrenamiento con peso total uno por motor.
- **Calibración de dominio:** motores 200 a 224. Soporte operativo min/max calculado desde motores de ajuste; novedad máxima de 21 sensores normalizados por mediana y 1,4826 MAD de checkpoints del ajuste. Solo canales con MAD mayor que 1e-8. Cuantil 95% de **una observación por cada uno de los 25 motores de calibración**, rango matemático ceil(0,95*(n+1)). No leer etiquetas de fallo para calibrar el umbral de novedad.
- **Calibración de error:** motores 225 a 249. Una observación por motor, fijada en floor(65% de su vida terminal SIMULADA), mínimo 20 ciclos y antes del fallo. La etiqueta residual verdadera se deriva de la vida final conocida exclusivamente de TRAIN. Solo los motores aceptados por el detector de dominio participan en el cuantil conservador de residuo absoluto de 90% (rango ceil(0,90*(n+1))). Si hay pocos aceptados y el rango no existe, usar radio infinito => abstención.

Los tres subconjuntos no comparten motores. El predictor, soporte y dos umbrales se congelan antes de analizar FD004 TEST.

## Reglas fijas de cobertura y publicación

- Un motor FD004 TEST se resume con su último prefijo disponible, sin observar su futuro.
- Rechazar si cualquiera de las tres variables operativas queda fuera del soporte min/max de ajuste o la novedad de sensores supera el umbral de calibración.
- Rechazar también si el semiancho del intervalo residual global resulta infinito o excede **100 ciclos** (presupuesto preregistrado de utilidad). Un intervalo demasiado grande no merece presentarse como pronóstico específico.
- Para un caso aceptado, publicar intervalo igual a max(0, predicción - radio) hasta predicción + radio. No guardar ni publicar predicciones individualizadas.
- Leer RUL_FD004.txt SOLO DESPUÉS de fijar modelo, todos los scores, decisiones, predicciones e intervalos. Métricas agregadas: cobertura, motivos de abstención, MAE/bias e interval coverage de aceptados, audit MAE de todos y rechazados, y baseline derivado del TRAIN de ajuste únicamente.
- Cero aceptación implica MAE e interval coverage null, nunca una medición ficticia.
- No seleccionar hiperparámetros, modos ni thresholds mirando FD004 TEST. La cohorte queda consumida después de esta evaluación.

## Limitaciones

La construcción de pseudo-truncamientos al 65% usa duración total de las simulaciones TRAIN, no del TEST. El RUL en test se corta bajo otro mecanismo potencialmente diferente. El método se inspira en split conformal, pero **NO implica cobertura garantizada de 90%** sin intercambio estadístico entre calibración y aplicación; tampoco valida error predictivo para flotas de automóviles ni sostiene predicciones de edad/desgaste/km real.

Un modelo con cobertura cero sigue siendo inútil como predictor, aunque abstenerse puede ser más prudente que alucinar un número. Tampoco tenemos etiquetas individuales de modo de fallo, por lo que se prohíben comparativas por mecanismo. No merge ni deploy.

## Reproducción y CI

Código: tools/benchmark_cmapss_coverage_r11.py
Pruebas con datos sintéticos: tests/science/test_ma00_r11_coverage.py

Comandos:
    python3 -m unittest discover -s tests/science -p 'test_ma00_r11_coverage.py'
    python3 tools/benchmark_cmapss_coverage_r11.py --help

Solo el commit experimental marcado [MA00 NASA FD004 once] descarga el ZIP original ya fijado con SHA-256 y genera un artefacto de métricas agregadas.

## Ejecución oficial preregistrada

Las pruebas de las tres particiones disjuntas, abstención ante régimen desconocido, auditoría de etiquetas, rangos y CLI aprobaron en CI. El protocolo ya estaba documentado antes de solicitar la lectura de FD004 TEST. Este commit habilita una sola auditoría sobre la fuente oficial: se publicarán todos los resultados, incluidos posibles cero pronósticos o fallas de calibración, sin modificar α, umbrales, proporción pseudo-censurada ni límite de 100 ciclos según TEST.


## Resultado único observado — NASA FD004 TEST, 29/10/2026 UTC

Evidencia empírica de la fuente original NASA, ZIP SHA-256 c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2:
- https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40794004368
- https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40794004368/artifacts/12862444049

FD004 TRAIN: **249 motores / 61.249 filas**. FD004 TEST nunca antes examinado por MA00: **248 motores / 41.214 filas**. Ningún FD001/FD002/FD003 TEST ni RUL fue abierto en R11. Los modelos, calibraciones y decisiones quedaron congelados antes de leer FD004 RUL.

Calibración: 199 motores para FIT, 25 independientes para umbral OOD, 25 independientes para residuo/intervalo (25 aceptados). Ridge α20, corte pseudo-censurado al 65% de vida de TRAIN. Score MAD-z sobre 21 sensores variables: umbral **2,4597**. Semiancho de intervalo por residuo de TRAIN: **79,69 ciclos simulados**, menor que el presupuesto 100, por lo que no se rechazó ninguno por ancho. No es intervalo certificado de error en hardware ni garantía de conformal coverage.

| Estado | Motores FD004 TEST | MAE Ridge (ciclos) | MAE baseline (ciclos) |
| --- | ---: | ---: | ---: |
| Todos, para auditoría | 248 | 35,895 | 50,484 |
| Publicados | **239** | **35,484** | **49,473** |
| Abstenciones, auditoría únicamente | **9** | 46,800 | 77,333 |

Cobertura de publicación **239/248 = 96,371%**. Nueve motores fuera de soporte por señales de sensores, cero por variables operativas, cero por intervalo demasiado ancho. En los 239 publicados, el intervalo incluyó el RUL verdadero en **227/239 = 94,979%** (redondeado 0,94979), comparado con la calibración nominal del 90%. **Es cobertura observada en esta cohorte SIMULADA, NO garantía de cobertura futura ni de pronóstico sobre vehículos.**

**Corrección de presentación de métricas (sin volver a puntuar FD004):** el JSON histórico de la corrida original también contenía "intervalCoverageFraction=0.94979" en la fila de auditoría de TODOS LOS 248 motores, aunque los 9 abstenidos no tenían ningún intervalo. Esa cifra se calculaba únicamente entre los 239 que sí recibieron intervalo y estaba mal etiquetada para "wholeCohort". El código ahora exige intervalos definidos para todos los integrantes de la cohorte antes de publicar ese porcentaje global; por tanto el campo correcto de la cohorte completa es **null**. El porcentaje 94,979% **sigue siendo válido exclusivamente en los 239 publicados**. El artefacto empírico inicial permanece intacto y no se vuelve a leer el TEST consumido para ajustar nada.

**Interpretación con cautela:** a diferencia de R9 y R10, aquí se ENTRENÓ y CALIBRÓ sobre FD004 TRAIN, cuyos regímenes y mecanismos son semejantes a FD004 TEST. No es prueba de transferencia desde FD001 ni una flota física independiente. El filtro retuvo una mayoría y el error medio del modelo fue mejor que el prior, pero el intervalo de incertidumbre es amplio (casi 160 ciclos de ancho, salvo truncado a 0) y el filtro elimina solo nueve de 248 motores. No inferir control causal, edad en km, porcentaje de salud, seguridad de diagnóstico, ni RUL automotriz.

**Decisión:** FD004 TEST está consumido. No cambiar umbrales, α, ratio de pseudocensura ni presupuestos mirando ese TEST. Próxima prioridad científica: usar mediciones físicas con identidades de motor, cobertura de regímenes, incertidumbre instrumental calibrada y ground truth mecánico independiente, o una nueva fuente no relacionada con C-MAPSS.
