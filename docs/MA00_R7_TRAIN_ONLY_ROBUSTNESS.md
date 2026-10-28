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
