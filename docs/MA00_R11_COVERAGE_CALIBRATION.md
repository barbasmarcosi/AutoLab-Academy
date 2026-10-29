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
