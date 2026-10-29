# Lección 03 — Lectura inicial de señales con osciloscopio

**Estado:** candidata a la puerta de diseño interno **9,1/10**, condicionado a **CI completa del SHA del hito**, sin defectos críticos. No se equipara a transferencia física, autorización instrumental, habilidades sobre vehículos ni retención longitudinal.

## Razonamiento científico y método

- **Conceptos iniciales sin nota:** período y frecuencia con unidades, escala vertical, trigger y referencia de medición. El chequeo muestra devolución específica, no guarda ni certifica.
- **Ejemplo resuelto:** mínimos/máximos para Vpp, offset de señal, conversiones de ms a s, 5 ms ↔ 200 Hz, divisiones por período y por Vpp; diferencia entre zoom y fuente.
- **Instrumento manipulado:** pantalla SVG procedente del generador sintético de `waveform-inquiry`, con V/div, ms/div, offset de referencia y disparo. Las invariantes físicas (frecuencia 200 Hz, período 5 ms, Vpp 2,4 V) no se modifican por escalas o desplazamientos del instrumento.
- **Práctica guiada preexistente:** `lab-scope-waveform-v1`: seno ficticio de 200 Hz, hipótesis, predicción numérica, refutador y trace registrado.
- **Transferencia independiente:** `lab-scope-holdout-v1`, nueve variaciones reservadas de tres mecanismos: período físico diferente, amplificación visual por V/div y desplazamiento aparente de referencia. No son los mismos casos del laboratorio guiado.
- **Orden de evidencias:** congelar causa inicialmente sospechada, prueba inicial y frecuencia predicha; revelar cuatro observaciones en el orden comprometido; calcular frecuencia desde período / ciclos equivalentes por 10 ms, elegir mecanismo y prueba discriminante, seleccionar resultado que lo falsaría.
- **Puntuación objetiva:** 40/100 por frecuencia calculada (±2 % o ±3 Hz), 40/100 por causa, 10/100 por prueba discriminante, 10/100 por falsador coherente con la conclusión elegida. La hipótesis inicial puede ser equivocada sin penalización; un razonamiento escrito y una causa alternativa se persisten **sin valoración semántica**.
- **Historial y PWA:** evidencia separada de guiado / transferencia, reintentos versionados rotan por 9 escenarios y resisten reportes históricos malformados. Service worker `autolab-academy-v101`, revalidación de exportación mediante la suite y recorridos E2E reales, interfaz adaptable.

## Matriz crítica — evaluación provisional de diseño

| Criterio | Máximo | Valor condicionado |
|---|---:|---:|
| Teoría correcta, dimensiones y seguridad instrumental | 2,0 | 1,9 |
| Prerrequisitos, errores conceptuales y ejemplo contrastado | 2,0 | 1,9 |
| Simulador manipulable integrado y causalidad correctamente limitada | 2,0 | 1,9 |
| Caso reservado, predicción previa, falsación y evidencia independiente | 2,0 | 1,9 |
| Trazabilidad, pruebas unitarias/E2E, accesibilidad y persistencia | 2,0 | 1,5 |
| **Total condicional** | **10** | **9,1** |

## Validaciones que NO se han demostrado
- Observación externa de al menos tres alumnos novatos, verbalización de hipótesis y transferencia diferida 24–72 h.
- Evaluación cualitativa independiente de las explicaciones libres; podría haber respuestas incoherentes que la máquina no detecte.
- Calibración metrológica, incertidumbre de equipos reales, acoplamiento, formas de onda bajo carga y calidad de pinzas o sondas.
- Seguridad física y preparación para trabajo en alta tensión.
- Seguridad antifraude: los datos de los casos deben estar disponibles en JS por operación offline.

**Decisión:** aceptar como 9,1/10 de **diseño interno** solo si el build, las unidades, Chromium, WebKit y WebKit móvil pasan en el SHA exacto del hito y el publicador de Pages reporta éxito. De otro modo corregir y repetir antes de comenzar la lección 04.

## Próximo paso
La lección 04 es `can`. Reutilizar modelos y redes CAN existentes, empezando por diagnóstico de conocimientos previos, contraste entre diferencial y común, terminación, arbitraje, pruebas seguras, caso reservado y rúbrica independiente; no confundir captura simulada con autorización de manipular una red real.

## Revisión de CI completa (primer hito 03, 2026-10-28/29)
- [Run #40792154579](https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40792154579): **438 E2E aprobados, 3 fallos del mismo test histórico** (`tests/e2e/waveform-inquiry.spec.js` en Chromium, WebKit y móvil). El test antiguo atribuía «Práctica aprobada» a la lección `scope` solo por completar el banco guiado, ignorando el requisito nuevo del caso reservado.
- Corrección **sin relajar la puerta**: el test ahora comprueba «Banco guiado completado · caso independiente sin resolver» para `scope` y conserva el resto de las comprobaciones. No se modificó el simulador para satisfacer un test viejo.
- La lección sigue **no aceptada como hito publicado** hasta que una nueva matriz completa certifique la versión corregida. El hito conjunto con lección 04 incluirá la evidencia exacta.
