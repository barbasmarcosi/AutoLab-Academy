# MA00 R6 — Sensor vs antigüedad simulada: pre-registro FD001

**Diseño fijado antes de ejecutar la fuente oficial** (28/10/2026). Esta investigación se limita a simulaciones de turbofán de NASA C-MAPSS FD001, con 100 motores train y 100 test. **Nunca convierte ciclos a km, salud % ni vida real de automóvil.**

## Hipótesis y baselines

¿Aportan los 21 sensores y tres variables operacionales información predictiva de RUL por motor **por encima** de la referencia que utiliza únicamente los ciclos ya observados?

Referencia R5 con el mismo FD001: mediana de RUL train constante (MAE test 39,080 ciclos) y mediana de duración completa train menos ciclos test (MAE 31,050 ciclos). El modelo R6 debe compararse explícitamente con **31,050 ciclos**. Si no supera la referencia, informar el fracaso y no buscar una combinación de parámetros que favorezca los 100 motores test.

## Diseño preregistrado

- **Fuente:** mismo ZIP oficial de NASA PCoE, SHA-256 fijado tras auditoría R5: c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2. Si cambia un byte, la corrida no puntúa.
- **Split:** FD001 train motores 1–100, FD001 test motores 1–100, identificadores exclusivos *dentro de cada split*. No son las mismas unidades entre splits.
- **Features:** para cada prefijo observado (sin observar el futuro), ciclos transcurridos, medias de los últimos 5 ciclos de las 3 variables de operación y 21 señales de sensores. Normalización media/desviación exclusivamente en el ajuste train. Ningún input de RUL test.
- **Targets TRAIN:** ciclo terminal conocido del motor simulado menos ciclo actual. Prefijos TRAIN muestreados cada 10 ciclos a partir del ciclo 20, más último ciclo. Cada motor recibe **peso total 1** para que una trayectoria larga no simule más motores independientes.
- **Familias de modelo:** (a) ciclos solamente; (b) variables operacionales+sensores solamente; (c) ciclos + variables operacionales + sensores. Regresión lineal ridge transparente con intercept no penalizado y regularizaciones preseleccionadas 1, 20, 200.
- **Validación y selección:** 5 folds determinados por ID de motor TRAIN, sin mezclar prefijos del mismo motor. Cada fold evalúa el error medio entre los prefijos retenidos, primero por motor y después entre motores. Cada familia de modelo elige su regularización usando solamente esta CV train. No utilizar error test para seleccionar familia ni parámetros.
- **Evaluación final una única vez:** congelar tres modelos entrenados sobre todos los motores TRAIN. Calcular MAE y RMSE en **100 predicciones**: último prefijo disponible de cada motor test, etiqueta RUL solo para puntuar. Comparar con baselines anteriores.
- **Estrés de ruido predefinido:** para el modelo ciclos+sensores, ruido gaussiano independiente y determinista de desviación 10 % de la desviación estándar calculada en TRAIN para cada sensor, con seed 20261028. Sin reentrenar, sin seleccionar según este resultado. Su finalidad es medir fragilidad, no calibrar ruido del ELM327.
- **Nulos/abstenciones:** diferencias entre medios de validación train y test deben reportarse, no corregirse mirando test; no crear intervalos de confianza por fila ni fingir datos clínicos/mecánicos.

## Límite decisivo

FD001 es una simulación específica de turbofanes aeronáuticos con envejecimiento simulado. Un descenso de MAE no demuestra desgaste automotriz identificable ni permite pronóstico de cualquier motor OBD-II. El primer ensayo de datos reales necesitará controles operacionales, historial, identificación por motor y referencia independiente de compresión/leak-down/blow-by/lubricación.

**Implementación:** tools/benchmark_cmapss_sensors.py. **Controles:** tests/science/test_ma00_cmapss_sensors.py. Se ejecutarán las pruebas sintéticas en toda CI; descarga y evaluación del dataset original exclusivamente en un commit marcado y sobre digest fijado. Sólo se publica el JSON agregado; no el dataset completo.
