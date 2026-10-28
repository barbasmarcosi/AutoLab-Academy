# MA00 R5 — Benchmarks longitudinal y pronóstico previos a ensayos físicos

Fecha: 28/10/2026. Ningún estudio aquí mide desgaste real, edad mecánica o RUL automotriz.

## LEVIN: series de autos reales, acceso externo no verificado

Repositorio de origen: https://github.com/YunSolutions/levin-openData
Commit consultado: c3c550654d37823b2a5ae7ab23a120dcae759cc4.

El README anuncia cerca de 30 vehículos, cuatro meses y muestras OBD cerca de 1 Hz. Los archivos CSV y SQLite completos NO están incluidos en el repositorio GitHub: los enlaces apuntan a MEGA y Google Drive. Por tanto, no hemos analizado aún sus datos observacionales. El README declara licencia CC BY-NC-SA para los datos y el archivo LICENSE contiene MIT para el código; los permisos de redistribución de los datos deben revisarse por separado.

Se implementó tools/audit_levin_longitudinal.py, que recibe un CSV local con deviceID, tripID, timestamp, rpm, speed, cTemp, eLoad o variantes documentadas. Detecta duplicados, relojes hacia atrás, vacíos y ventanas de ralentí controlado de por lo menos 20 observaciones y 19 segundos. Acepta velocidad <=1 km/h, RPM 550–1150, ECT 75–110 °C, carga 0–35 %, intervalos <=2 s y oscilación de ECT <=5 °C y carga <=10 puntos. Estos límites son EDUCATIVOS y deben rediseñarse para un vehículo específico.

Sólo cuenta UNA ventana por viaje en las comparaciones de viajes y nunca infiere independencia mecánica. Informa variación descriptiva de RPM entre primera y última ventana por dispositivo, sin inferir desgaste. Tampoco atribuye un huso horario a fechas ingenuas del origen.

El auditor trabaja sin conexión y exporta solamente sumarios: no escribe ID originales de dispositivos/viajes, coordenadas, fechas concretas, ruta o datos crudos. Los tests usan CSV inventados; la salida real depende de conseguir legítimamente los archivos.

Para ejecutar:

    python3 tools/audit_levin_longitudinal.py archivo-local.csv > inventario-privado.json

Sin datos reales, no hay estimaciones longitudinales observadas.

## NASA FD001: trayectoria hasta falla de turbofán SIMULADO

Referencia primaria NASA PCoE, dataset 6:
https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/

Archivo público:
https://phm-datasets.s3.amazonaws.com/NASA/6.+Turbofan+Engine+Degradation+Simulation+Data+Set.zip

El benchmark FD001 utiliza 100 unidades simuladas de entrenamiento completas hasta fallo y 100 unidades simuladas de prueba con RUL en ciclos. Los IDs 1..100 son LOCAL al split y no identifican motores compartidos. La unidad estadística para evaluar son motores, no las numerosas filas del archivo.

Implementación: tools/benchmark_cmapss_fd001.py, solo librería estándar; el ZIP se inspecciona en memoria, con límites de bytes, miembros, columnas y orden de ciclos, sin extraer archivos a disco. En el estudio real se comprueba el inventario esperado de 20.631 filas train y 13.096 test.

Se preregistraron dos predictores de control entrenados exclusivamente sobre train:
- mediana de RUL de las observaciones de entrenamiento, usada como predicción constante;
- mediana del total de ciclos de vida de los motores de entrenamiento MENOS los ciclos observados de cada motor test, con límite inferior cero.

Se calcula MAE y RMSE en ciclos por motor test. Ambos baselines son independientes de las señales de degradación: el segundo conoce la antigüedad en ciclos del test, no su RUL verdadero. Las etiquetas test solo se usan para puntuar, nunca para ajustar los parámetros o seleccionar el método. No hay tuning sobre test, p-valores por fila, modelos de sensor, ni comparación entre autos.

La ejecución de descarga es opt-in por workflow_dispatch o un único commit identificado con [MA00 NASA once]; sin descarga repetida en pushes normales. El ZIP se obtiene desde el enlace de origen NASA; se registra SHA256 de los bytes recibidos, pero NO existía hash público fijado previamente en el repositorio: no prometer autenticidad criptográfica histórica. Solo se publica JSON agregado. La disponibilidad actual del enlace debe verificarse durante la propia ejecución.

Ejecución local con ZIP ya descargado:

    python3 tools/benchmark_cmapss_fd001.py archivo-NASA-original.zip > reporte-agregado.json

No presentar estos errores como predicción de vida útil automotriz ni extrapolar ciclos simulados a kilómetros reales.

## QA y límites estrictos

Pruebas sin fuentes externas:

    python3 -m unittest discover -s tests/science -p 'test_ma00_levin_longitudinal.py'
    python3 -m unittest discover -s tests/science -p 'test_ma00_cmapss_fd001.py'

No activar score de edad, porcentaje de salud ni RUL de autos reales. El próximo benchmark de NASA deberá comparar futuros modelos de sensores contra los dos baselines sobre el mismo split de motores y medir generalización. Para LEVIN se deberá conseguir y auditar el archivo auténtico, permisos, huso horario, frecuencia y condiciones de operación. Finalmente, se requieren referencias mecánicas independientes por motor antes de validar desgaste real.

## Solicitud controlada de auditoría externa

La implementación y los tests sintéticos se fijaron antes de la ejecución. Esta revisión solicita **una única lectura del archivo oficial NASA** para comparar las dos baselines preregistradas, sin entrenamiento sobre las etiquetas test ni publicación de las trayectorias originales. La evidencia empírica deberá provenir del artefacto agregado de CI y conservar su digest SHA-256.

## Diagnóstico de empaquetado (sin inferencia)

Primer intento de descargar NASA item 6: conexión y transferencia correctas, pero la estructura del ZIP no exponía directamente los miembros FD001; la auditoría se abortó sin publicar métricas. Se añadió soporte para un ZIP anidado de un solo nivel (sin extraer a disco), límites de tamaño, detección de miembros duplicados y prueba adversarial. El segundo intento solo será válido si el inventario real corresponde a FD001.


## Resultado empírico FD001 — auditoría ejecutada (28/10/2026)

Ejecución de referencia: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40740567370
Artefacto agregado (sin datos originales): https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40740567370/artifacts/12839626193

El archivo oficial descargado tenía SHA-256:
c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2

El paquete de NASA tiene un ZIP anidado. Hubo un primer intento abortado por estructura inesperada, seguido de un cambio que valida el ZIP externo y el ZIP interior sin extraerlos al filesystem. El job de auditoría empírica finalizó en SUCCESS, sin afirmar que su CI general fuese verde (una aserción de test esperaba otra cadena para el rechazo de entradas duplicadas).

Inventario observado: FD001 train = 100 motores, 20.631 filas; FD001 test = 100 motores, 13.096 filas. Mediana de vida total de los motores TRAIN = 199 ciclos; mediana de RUL sobre filas TRAIN = 103 ciclos.

| Baseline preregistrada | MAE por motor TEST (ciclos) | RMSE por motor TEST (ciclos) |
| --- | ---: | ---: |
| Mediana constante TRAIN | 39,080 | 49,820 |
| Mediana duración total TRAIN - ciclos TEST | 31,050 | 39,849 |

La segunda baseline reduce MAE en aproximadamente **20,5 %**. Este beneficio está determinado principalmente por conocer cuántos ciclos ya observamos de cada motor simulado: **no representa detección de desgaste mediante sensores**. Un futuro modelo de sensores deberá superar estas referencias sobre motores completos, sin tuning sobre TEST.

**No transferir:** estos errores son de trayectorias simuladas de turbofanes; NASA no demuestra ni autoriza que se puedan convertir a km, salud %, RUL de motores automotrices o envejecimiento estructural real. LEVIN no se ha descargado ni auditado empíricamente.
