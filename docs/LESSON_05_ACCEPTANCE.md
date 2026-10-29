# Lección 05 — BMS: estimar no es medir directamente

**Estado:** candidata a aceptación de diseño interno **9,1/10**. La nota es provisional hasta verificar matriz completa Chromium/WebKit/móvil y publicación exacta del SHA. No se afirma aprendizaje de estudiantes ni competencia física.

## Rigor y fuentes

El conteo de carga estima SOC a partir del SOC inicial supuesto, la integral de corriente y la capacidad útil supuesta. Errores de corriente, integración, reloj, condición inicial y capacidad provocan deriva o sesgo: [NASA/NTRS](https://ntrs.nasa.gov/citations/20220008848). El voltaje bajo carga no permite identificar SOC universal sin química, temperatura, referencia y modelo: [MathWorks BMS](https://www.mathworks.com/help/stateflow/ug/learn-how-to-model-battery-management-system.html). La electroquímica real no se reinventa: AutoLab ya usa [PyBaMM](https://pybamm.org/) como compañero y conserva el motor didáctico `src/bms-lab.js`.

**Ejemplos contrastivos:** 12 A × 1 h = 12 Ah, nominal 60 Ah ⇒ 80% SOC estimado desde 100%. Sesgo de +0,6 A ⇒ 79% estimado frente a 80% de referencia. Capacidad útil 48 Ah manteniendo 60 Ah en el estimador ⇒ 80% estimado, 75% referencia y 80% SOH *solo bajo ensayo completo y comparable*. No confundir SOC con SOH ni voltaje terminal con OCV calibrada.

## Secuencia implementada

1. **Ideas previas:** cuatro preguntas sin nota ni registro, devolución específica.
2. **Lectura y ejemplo resuelto:** unidades, corriente con signo, comparación de sesgo, capacidad y errores de partida; límites electroquímicos.
3. **Banco guiado `lab-bms-guided-v1`:** reutiliza `generateSyntheticBms`, `analyzeBms` y `capacitySohPct`; tres escenarios, predicción congelada antes del resultado, conclusión, justificación y alternativa.
4. **Caso independiente `lab-bms-holdout-v1`:** nueve casos reservados de sesgo, capacidad o estado inicial. Hipótesis y primer contraste congelados; cuatro mediciones virtuales de referencia, cálculo del error estimación − referencia, causa final, prueba discriminante y posible falsador.
5. **Puntuación objetiva:** 35 por diferencia en puntos porcentuales (±0,2), 45 por mecanismo causal, 10 por contraste y 10 por falsador. Predicción inicialmente equivocada no penalizada. Los textos se guardan **sin evaluación semántica**.
6. **Integridad y UX:** evidencias guiadas y reservadas distintas, reintentos rotativos, exportación JSON, compatibilidad offline (caché v103), pruebas numéricas por mecanismo, E2E Chromium y revisión WCAG AA móvil.

## Auditoría crítica y restricciones

Los datos de referencias y capacidad total son **ficticios** y conocidos por el generador, nunca datos de un automóvil. No se infiere SOH desde un segmento parcial. El modelo algebraico de voltaje de `bms-lab` NO es un modelo electroquímico ni OCV calibrada. Las nueve investigaciones tienen una sola causa; quedan fuera fallas simultáneas, química LFP/NMC, temperatura, incertidumbre instrumental, EKF, histéresis, degradación real y variaciones de celdas. Los casos JS son visibles por uso offline, por lo que tampoco son un examen antifraude. No se habilita abrir packs ni medir componentes HV.

| Criterio | Máximo | Diseño provisional |
|---|---:|---:|
| Física, SOC/SOH, unidades, límites | 2,0 | 1,9 |
| Prerrequisitos y ejemplos discriminantes | 2,0 | 1,9 |
| Práctica guiada con motor existente | 2,0 | 1,9 |
| Transferencia reservada, hipótesis y falsación | 2,0 | 1,9 |
| Evidencia, navegador real, accesibilidad y persistencia | 2,0 | 1,5 |
| **Total sujeto a CI completa** | **10,0** | **9,1** |

CI focalizada confirmada: [#40797311121](https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40797311121) SUCCESS. Aceptación final pendiente de suite completa y deploy en Pages. La evaluación humana cualitativa, retención diferida y prácticas reales no se suponen aprobadas.

**Siguiente lección:** `hv` — seguridad de alta tensión, decisiones conservadoras y puntos de parada, sin instrucciones de intervención física.
