# MA00 R10 — Detector de cambio de dominio y abstención (prerregistro)

**Protocolo congelado 28/10/2026, ANTES de abrir el primer RUL de FD002.**
R10 es exclusivamente un experimento con turbofanes **simulados** NASA C-MAPSS. No mide desgaste, edad equivalente ni RUL automotriz.

## Contexto y pregunta

R9 demostró que el modelo Ridge de FD001 con ciclos+sensores falla al transferirse a FD003: 67,413 ciclos de MAE frente a 35,690 del baseline de vida mediana. También observó 46/100 motores FD003 con al menos una señal fuera del rango de FD001 TRAIN. **FD001 TEST y FD003 TEST ya fueron consumidos:** no se reabren ni utilizan para elegir parámetros.

FD002 es una cohorte simulada aun no utilizada por MA00; mantiene un modo de falla de compresor HPC, pero tiene **seis condiciones operativas**, frente a una en FD001. NASA reporta 259 motores FD002 TEST. Se utiliza para una prueba de distribución distinta en la que debemos aprender a **abstenernos** sin afirmar que el sistema detectó todas las condiciones de falla.

Fuente primaria: https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data

## Diseño y criterios congelados

- Leer únicamente tres miembros del ZIP oficial NASA fijado por SHA-256 c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2: train_FD001.txt (100 motores, 20.631 filas), test_FD002.txt (259 motores) y RUL_FD002.txt (solo para puntuación final).
- **Prohibido abrir FD001 TEST/RUL, FD003 TEST/RUL o FD002 TRAIN.** El lector descarta esos miembros incluso si sus bytes son ilegibles.
- Predictor original **sin modificar**: Ridge α1, promedio últimos cinco ciclos, ciclos+3 parámetros de operación+21 canales de sensores, ajustado en los 100 motores FD001 TRAIN. No se cambia modelo, regularización ni normalización con FD002.
- **Detector OOD independiente del RUL:** dentro de FD001 TRAIN, motores 1–80 para estimar soporte y motores 81–100 para calibración de novedad (separados por identidad de motor). Se toma **un único vector terminal por motor**. Los últimos estados de entrenamiento son de run-to-failure, mientras FD002 TEST está censurado antes de fallar; esto limita la transferencia. El detector no observa ninguna etiqueta RUL.
- **Regla 1:** las 3 variables de operación de FD002 deben estar dentro del min–max observado en los 80 motores de ajuste. Se usa rango estricto, sin expandirlo por márgenes aprendidos del TEST.
- **Regla 2:** medir máximo |x−mediana|/(1,4826×MAD) de los 21 canales de sensores con MAD mayor a 1e−8 entre los 80 motores de ajuste. Los sensores casi constantes se excluyen de ese score; su cantidad se reporta y NO se considera una prueba de equivalencia.
- **Umbral fijo:** cuantil split-source 95% sobre 20 motores de calibración, rango ceil(0.95*(n+1)); para n=20 es el máximo. Esta cuantificación es **únicamente soporte de datos**, NO garantía de MAE, cobertura de un intervalo de RUL o confiabilidad automotriz.
- **Decisión previa a las etiquetas FD002:** si cualquiera de las reglas falla, abstain; si ambas se cumplen, accept. El programa construye todos los scores, decisiones y predicciones congeladas antes de leer RUL_FD002.txt.
- **Evaluación única:** informar motores aceptados/abstenidos, causas de abstención (operación/sensores/ambos), fracción de cobertura, MAE del modelo original y baseline de vida mediana menos ciclos para todos los motores, solo los aceptados y, **únicamente como auditoría**, los rechazados. Si cobertura es cero, MAE condicional = null; no inventar precisión. No emitir ninguna predicción individual en el artefacto.
- No calcular p-valores fila-a-fila. Los 259 motores simulados independientes son la unidad de evaluación. No seleccionar posteriormente el umbral con FD002 ni escoger un modelo ganador con FD002.

## Reglas de decisión

1. Un 100% de abstención por cambio de regímenes es un resultado válido de seguridad científica, **no evidencia de capacidad diagnóstica**. Implica que el dominio FD001 es demasiado estrecho.
2. Una cobertura distinta de cero sin reducción de error no permite proclamar una regla de seguridad predictiva.
3. Aunque el error condicional parezca favorable, el filtro **no está calibrado para el error** y no proporciona garantía de riesgo ni transferibilidad física.
4. Todo FD002 TEST RUL quedará consumido tras la corrida; no reajustar umbrales, modelos o criterios con ese resultado.

## QA y reproducibilidad

Pruebas con dataset **fabricado**, sin archivos externos:

    python3 -m unittest discover -s tests/science -p 'test_ma00_r10_domain_abstention.py'
    python3 tools/benchmark_cmapss_domain_abstention_r10.py --help

Prueba empírica sobre ZIP NASA verificado, en un commit opt-in:

    python3 tools/benchmark_cmapss_domain_abstention_r10.py archivo-NASA.zip > ma00-r10-aggregate.json

GitHub Actions ejecuta tests locales en cada push. El archivo original **solo** se descarga en la corrida con el marcador [MA00 NASA FD002 once] y únicamente se sube el JSON agregado. Sin deploy ni merge.

## Implicancia para MA00 automotriz

El método es un **ensayo de detección de regímenes fuera de soporte**, no un detector real OBD-II. FD002 usa ajustes de un turbofán simulado, no PID de autos, y un motor de combustión podría entrar en soporte de señales sin compartir mecanismos de desgaste. La edad mecánica, porcentaje de salud y RUL de automotores permanecen bloqueados hasta tener ground truth físico y validación entre motores.

## Activación única de FD002 TEST

La implementación, umbral y criterios se fijaron antes de ejecutar los datos oficiales. La CI de pruebas Python, JavaScript y compilación ha pasado; los E2E del commit de preparación siguen aparte. Se autoriza una única lectura de FD002 TEST y su RUL, con el detector calibrado únicamente en FD001 TRAIN. **No ajustar nada con los resultados FD002**, incluso si la cobertura es cero o el error es peor. La corrida deberá subir exclusivamente métricas agregadas.


## Resultados oficiales R10: única evaluación FD002 TEST (29/10/2026 UTC)

Auditoría sobre ZIP original NASA PCoE previamente fijado por SHA-256 c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2. Solo se leyeron FD001 TRAIN, FD002 TEST y FD002 RUL. FD001 TEST/RUL, FD003 TEST/RUL y FD002 TRAIN siguieron cerrados. Los parámetros y todas las decisiones quedaron congelados antes de usar FD002 RUL.

- Run: https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40791656486
- JSON agregado (sin filas originales): https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40791656486/artifacts/12862071475
- 100 motores FD001 TRAIN; detector calibrado con 80 motores de ajuste de soporte y otros 20 para umbral; 259 motores FD002 TEST.
- Puntaje de novedad máximo MAD-z: umbral derivado solo de FD001 TRAIN = **3,42641**; **14 sensores variables** participan en el score, 7 se consideran casi constantes y se excluyen. El cambio de sensores casi constantes NO fue probado como inocuo.
- Calibración independiente de fuente (20 motores): **18/20 aceptados**. Ese 90 % NO equivale a cobertura ni precisión del modelo en futuras flotas.
- FD002 TEST: **0 aceptados, 259 abstenciones, cobertura 0,00000**. Cambios operativos detectados en 259/259, de sensores en 259/259, ambos simultáneamente 259/259.
- MAE sobre la **cohorte completa** calculada exclusivamente como auditoría de lo que sucedería sin protección:
  - Ridge congelado FD001 ciclo+sensores: **2575,849 ciclos** (SIMULADOS).
  - Referencia mediana vida FD001 menos ciclos observados: **33,486 ciclos**.
  - Deterioro del modelo combinado = **2542,363 ciclos** de MAE adicional.
- MAE condicional de los casos aceptados = **null**, porque no hubo ninguno. No calcular ni reportar una precisión selectiva ficticia.
- FD002 TEST RUL queda **consumido**; no se pueden ajustar retrospectivamente umbral, modelo o condiciones para recuperar cobertura.

**Interpretación científica:** el detector de cambio de dominio se comportó de forma fail-closed: impidió emitir estimaciones no respaldadas cuando los regímenes y sensores estaban fuera de los observados en la fuente. El contraste adverso muestra una seria falla de extrapolación del predictor original. Pero una regla con 0 % de cobertura no demuestra capacidad de pronóstico, garantía de error, sensibilidad frente a fallas, ni utilidad clínica/automotriz. El estudio de R10 valida un mecanismo **operativo de abstención** en SIMULACIÓN; no mide desgaste de motor automotriz.

**Decisión:** no usar FD002 TEST para cambiar thresholds. Investigar calibración de cobertura/precisión exclusivamente con datos de entrenamiento y nuevas cohortes no consumidas; priorizar conceptos de soporte operativo, protocolos de captura repetibles, indicadores de calidad instrumental y ground truth mecánica independiente. Sin merge ni deploy.
