# MA00 R8 — Estudio pareado del mecanismo de fragilidad (prerregistro)

**28/10/2026, antes de ejecutar la auditoría empírica R8.**
Este estudio NO usa ni lee las 100 trayectorias TEST ni etiquetas de vida remanente TEST de NASA FD001. **Los 100 motores TEST ya fueron consumidos en R6 y no deben convertirse en optimizador de decisiones.**

## Pregunta

R6: al agregar ruido de 10% de la dispersión normalizada a **todas las 24 variables no temporales**, MAE en 100 motores simulados TEST pasó de 21,951 a 222,766 ciclos. R7: aplicando 10% a **solo los sensores medidos que varían** sobre cortes 50/100/150 de motores TRAIN, MAE de CV aumentó de 31,623 a 31,680 ciclos. Estos experimentos NO son directamente comparables; cambiaron a la vez los motores, cortes y política de ruido.

R8 prueba, **con los mismos motores internos, mismos modelos y sorteos de ruido**, si la política de perturbación es la responsable de una parte de esa diferencia.

## Diseño congelado

Fuente: ZIP oficial NASA PCoE FD001, SHA-256 fijo c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2. El lector R8 abre **exclusivamente** el miembro train_FD001.txt, incluso si el ZIP contiene TEST y RUL. Prohíbe volver a procesar el TEST consumido.

- Solo motores TRAIN (100 unidades simuladas); cinco folds por motor completo.
- Mismo ajuste Ridge por fold, α=20 fijo, features de R6: ciclo y media de cinco últimas lecturas de tres parámetros operativos y 21 sensores. Ajuste con prefijos de TRAIN, peso total 1 por motor.
- Mismos cortes absolutos 50/100/150 ciclos siempre que el motor haya sobrevivido a cada corte. Sin usar vida terminal para seleccionar el momento de predicción; el valor futuro solo se emplea como etiqueta de TRAIN.
- Ruido 10% de sigma, cinco semillas fijas 7,29,53,83,107. **Se conserva el mismo vector de valores aleatorios gaussianos por motor/corte/semilla entre todas las políticas.** No reentrenar por política, no seleccionar según los resultados.
- Políticas pareadas, todas con la misma escala de error y el mismo conjunto de motores:
  1. clean — sin perturbación.
  2. r7_measured_variable — solo sensores medidos con sigma/amplitud de TRAIN mayor que 1e-8.
  3. r6_operating_only — únicamente las tres variables de operación, con sigma del normalizador R6.
  4. r6_measurements_all — los 21 sensores, **incluidos los casi constantes**, con sigma del normalizador R6.
  5. r6_all_channels — las 24 variables no temporales, lo más próximo a la política de ruido R6.
  6. r7_measured_plus_r6_operating — perturbar los 21 sensores variables de R7 y las tres variables de operación de R6.
- Cada política reporta MAE medio **por motor independiente**, mediana y peor media por motor, cobertura por corte y cantidad total de predicciones perturbadas. Las cinco semillas **no agregan cinco motores**.
- Para interpretar mecanismos se reporta por canal la magnitud esperada de la perturbación lineal antes de recortar RUL a cero: |coeficiente Ridge normalizado| multiplicado por 10% y razón de escalas. Es una **sensibilidad matemática**, no una calibración de error físico del sensor.
- La sensibilidad de la predicción final puede ser no aditiva por el truncamiento a RUL >=0. No descomponer el efecto como causal aunque haya diferencias pareadas.

## Limitaciones y decisión

Los cortes absolutos se condicionan a supervivencia hasta ese ciclo: no se transfiere sin cuidado a motores con ciclos truncados. El resultado puede explicar una diferencia de **instrumentación sintética**, nunca desgaste estructural real. Tampoco reproduce la evaluación TEST-last de R6: aísla solo el mecanismo de perturbación en TRAIN bajo cortes fijos.

Si r6_all_channels presenta una penalización grande y r7_measured_variable no, se corroborará **dentro de TRAIN** que la política de perturbación altera la robustez. Si ambos se comportan igual, no se habrá encontrado explicación. No elegir nuevos modelos ni hiperparámetros a partir de TEST. No generar "edad mecánica equivalente", salud porcentual ni vida útil de vehículos.

## Ejecutar

Test sintético en cada push:

    python3 -m unittest discover -s tests/science -p 'test_ma00_r8_stress_mechanism.py'
    python3 tools/audit_cmapss_stress_mechanism_r8.py --help

Empírico opt-in sobre el ZIP previamente fijado (publica JSON agregado únicamente):

    python3 tools/audit_cmapss_stress_mechanism_r8.py official-nasa.zip > r8-train-only.json

GitHub Actions solo habilita R8 empírico con [MA00 NASA mechanism once]. El job no debe ejecutar las tareas R5/R6 que leen etiquetas TEST durante esa corrida. Sin merge ni deploy.

## Ejecución empírica opt-in solicitada

El código, las seis políticas de estrés, las semillas, la potencia de perturbación, los cinco folds y los cortes fijos ya quedaron en commits anteriores. La CI ha aprobado los tests Python/R8 y la compilación antes de solicitar esta corrida. Se activa una sola auditoría contra el ZIP original NASA previamente fijado por digest; se conservarán todos los resultados, incluso si contradicen la hipótesis de la fragilidad R6. No se procesará NASA TEST ni se modificará el modelo según el resultado.
