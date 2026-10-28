# MA00 R4 — Benchmark pre-físico de confusión operacional

**Pre-registro: 28/10/2026, antes de inspeccionar los resultados de este benchmark.**
No mide desgaste, edad ni pronóstico de vida útil.

## Pregunta operacional

¿La diferencia aparente entre mediciones normales y de falla de EngineFaultDB se reduce al comparar regímenes similares de RPM, presión de admisión (MAP) y posición de mariposa (TPS)?

La pregunta es descriptiva. Igualar tres señales no controla todos los factores de confusión ni descubre causalidad, y el dataset solamente tiene **un motor físico** y **cuatro bloques contiguos de condición**, sin longitud de uso ni referencia independiente de desgaste.

## Datos e integridad

Origen: https://github.com/leoxthomas/EngineFaultDB
Commit c63f23ba048761d9c2a2c95d8fb4c0392a3c63d3; blob Git f68678f7e08a6902ac2955d18d7fbb2624ae6b8a.
El script tools/audit-enginefaultdb.mjs comprueba contenido original, tamaño, número de filas, esquema y bloques. La prueba publica agregados, sin redistribuir filas del dataset sujeto a su licencia.

## Método predefinido

1. Contrastar la clase normal 0 contra cada clase etiquetada 1, 2 y 3.
2. Reportar diferencias de **medias brutas** de CO, HC y lambda.
3. Formar grillas de cuantiles **conjuntos de RPM, MAP y TPS** (3, 4 y 5 bins solicitados por eje). Los cortes repetidos se deduplican.
4. Aceptar una celda únicamente con al menos **20 observaciones por clase**.
5. Calcular la diferencia de medias dentro de cada celda y ponderar por la menor cantidad de registros de ambos grupos, evitando extrapolar a regiones sin superposición.
6. Mostrar celdas compartidas, peso total, fracciones de cobertura de cada clase, diferencias brutas y diferencias dentro de régimen en cada resolución.
7. La puerta de soporte descriptivo exige al menos **dos celdas** y un peso de solapamiento equivalente al menos al 10 % de *cada* clase. No establece ninguna capacidad de predicción o generalización.

No se calcularán p-valores, intervalos de confianza fila-a-fila, accuracy, km, score de salud ni vida remanente: 55.999 filas correlacionadas no representan 55.999 motores independientes.

## Controles negativos

- **Confusión total simulada:** clase y CO difieren en promedio únicamente por tener diferente distribución de regímenes; después de emparejar, la diferencia debe ser exactamente cero.
- **Diferencia residual simulada:** se conserva un delta deliberado dentro de las mismas celdas, sin atribuirle causalidad.
- **Soporte ausente:** el algoritmo se abstiene si las condiciones de operación no se superponen.
- **Datos deteriorados:** se rechazan valores no finitos, campos ausentes y cualquier archivo cuyo blob no coincida con el original verificado.

## Reproducción

Prueba sintética local:

    node --test tests/mechanical-age-regime-overlap.test.js

Benchmark empírico después de obtener la fuente original:

    node tools/benchmark-enginefaultdb.mjs /ruta/EngineFaultDB_Final.csv > benchmark-aggregated.json

El workflow mechanical-age-research.yml ejecuta el cálculo empírico cuando se solicita por workflow_dispatch o en un **único commit etiquetado** [MA00 empirical once]. Los pushes normales posteriores no descargan el dataset.

## Cómo interpretar el resultado

| Observación | Conclusión permitida | Conclusión prohibida |
| --- | --- | --- |
| Delta desaparece al emparejar | Compatible con confusión operacional | La falla fue causada por RPM/MAP/TPS |
| Delta residual robusto 3/4/5 | Candidato a señal discriminante | Efecto causal o desgaste físico |
| Soporte común bajo | Comparación fuera de dominio, abstención | Extrapolar al ralentí u otros motores |
| Delta sensible a la grilla | Fragilidad del método | Índice calibrado |
| Cualquier caso | Falta cohorte longitudinal y referencia mecánica independiente | Edad equivalente, salud %, RUL |

Los gases CO/HC de laboratorio tampoco son PIDs estándar garantizados de un adaptador ELM327. Ninguna de estas mediciones establece valores OEM para el índice D de MA00.

## Ejecución empírica única (solicitud)

Este commit de investigación activa una sola auditoría de datos originales fijados por hash en GitHub Actions. El script y las reglas de análisis se comprometieron antes de activar la descarga. El resultado solo será considerado evidencia cuando la CI concluya y publique el artefacto agregado. No se ha autorizado el despliegue ni la inferencia de desgaste.
