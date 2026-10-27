# AutoLab Academy v87 — seis bancos numéricos con investigación causal

## Principio

Cada banco aparece **en la lección** que explica su fenómeno. El estudiante congela la hipótesis conceptual, el valor predicho, su criterio de refutación y una explicación con limitaciones **antes** de recibir los resultados del modelo. Solo entonces aparece una **tabla de sensibilidad de tres condiciones** y el mecanismo físico-matemático, que permite comparar hipótesis con otras observaciones del mismo modelo.

Son resultados calculados deterministas, **no capturas instrumentales**, datos del fabricante, práctica en un vehículo o evidencia de competencia de alta tensión. La argumentación escrita no recibe corrección semántica automática; la rúbrica cualitativa para docentes es distinta del puntaje objetivo del cálculo.

| Lección | Variable del modelo | Salida ideal | Contraste didáctico |
| --- | --- | --- | --- |
| `voltage-dividers` | Carga resistiva paralela a 10 kΩ: 5, 10, 20 kΩ | Vout, (5 R_{eq}/(10+R_{eq})), con (R_{eq}=10R_L/(10+R_L)) en kΩ | Una entrada carga el divisor; en vacío eran 2,5 V |
| `rc-input` | R=1, 2, 4 kΩ; C=100 µF | τ=0,1; 0,2; 0,4 s | Constante de tiempo ≠ asentamiento completo |
| `current-shunt` | R=12,5, 20, 25 mΩ; caída diferencial fija 50 mV | I=4; 2,5; 2 A | El valor real, no solo nominal, determina I |
| `pullups` | R de retorno a masa=5, 10, 20 kΩ; pull-up 10 kΩ a 5 V | Nodo=1,667; 2,5; 3,333 V | El circuito abierto es un caso diferente de un retorno resistivo finito |
| `actuator-power` | PWM ideal 12 V/0 V con duty 25, 50, 75 % | Media=3; 6; 9 V | La media no demuestra corriente ni trabajo del actuador |
| `can` | 1, 2, 3 terminaciones ideales de 120 Ω en paralelo | Req=120; 60; 40 Ω | Tres resistencias son hipotéticas; la cuenta no diagnostica ni autoriza modificar un vehículo |

**Seguridad:** los modelos CAN son de redes ficticias desconectadas de energía. No conectar medidores o generadores a vehículos activos, ni abrir baterías HV para reproducirlos. La sección de V=12 V se refiere exclusivamente a un promedio ideal de señal de control.

## Evaluación honesta

- ID propio de evidencia por caso: `lab-numeric-divider-v1`, `lab-numeric-rc-v1`, `lab-numeric-shunt-v1`, `lab-numeric-pullup-v1`, `lab-numeric-pwm-v1`, `lab-numeric-can-termination-v1`.
- Puntaje objetivo: 40 % predicción (tolerancia: máximo entre 0,02 unidades y 3 % del valor), 25 % hipótesis, 25 % falsación, 10 % completitud documental formal.
- Aprobación solo cuando coinciden **todos** los criterios objetivos. El texto de justificación se guarda sin interpretarlo ni validarlo semánticamente. El feedback incluye hipótesis compatible, falsador conceptual, ecuación, sensibilidad e incertidumbre.
- `NUMERIC_BENCH_MODEL=autolab-numeric-bench-v1` se incluye en el **texto del informe** para sobrevivir la normalización del respaldo JSON/IndexedDB. No asumir que metadatos adicionales ajenos al esquema persistirán.
- Lectura, razonamiento v2, cuaderno y laboratorio conservan evidencias diferenciadas. Los tres laboratorios nuevos son bancos matemáticos, no instrumentales físicos.
- Código: `src/numeric-inquiry.js`. Pruebas: `tests/numeric-inquiry.test.js`, `tests/e2e/numeric-inquiry.spec.js`. El E2E verifica que las predicciones y el debrief no se expongan antes de bloquear las decisiones.
- La caché de la PWA se actualiza a `autolab-academy-v87`, preservando respaldo esquema 1 y compatibilidad offline.

## Cobertura actual

94 lecciones, 94 cuadernos científicos de diseño no calificados, 32 ejercicios v2 con contrafactuales, **10 laboratorios integrados (4 preexistentes + 6 numéricos), 12 puentes solo vinculados**. Quedan 72 lecciones sin laboratorio integrado o vinculado y 62 sin ejercicio objetivo de transferencia. Falta instrumentación más realista con formas de onda, mediciones con incertidumbre y validación práctica supervisada.

## Entornos y calidad

Solo se trabaja en PR #52 `feature/engineering-mindset-rd-vision` y despliegue de test `autolab-academy-rd-preview` en Vercel. **No fusionar ni desplegar GitHub Pages de producción.** La build Vercel READY no sustituye la prueba Playwright en Chromium/WebKit, ni los unitarios, ni las auditorías.
