# AutoLab Academy v89 — transferencia desde teoría a cálculos de electrónica de potencia LV

## Alcance

Cinco nuevas prácticas **embebidas** en la lección que desarrolla su fundamento; no son simulaciones físicas de piezas de automóvil, diagnósticos OEM ni una autorización para ensayar corriente, tensión HV, cargas inductivas o sistemas de potencia reales.

| Lección | Qué varía el alumno | Cálculo ideal | Modelo |
| --- | --- | --- | --- |
| `resistive-loss` | Corriente sintética de 2/4/6 A | Potencia (P=I^2R), (R=0,25\ \Omega) | 1/4/9 W; no calcula temperatura de conectores |
| `mosfet-control` | Corriente sintética de 2/4/6 A | Conducción (P=I^2 R_{DS(on)}), resistencia fija (0,05\ \Omega) | 0,2/0,8/1,8 W; *solo* MOSFET plenamente excitado |
| `inductive-load` | Corriente sintética de 2/4/6 A | Energía (E=\frac12 LI^2), (L=0,2\ H) | 0,4/1,6/3,6 J; **no** calcula voltaje de flyback |
| `ground-reference-network` | Corriente sintética de 2/4/6 A | Caída (ΔV=IR), (R=50\ m\Omega) | 0,10/0,20/0,30 V; no identifica un módulo averiado |
| `dcdc-switches` | Duty 25/50/75 % de buck sintético LV | (V_{out}=D V_{in}), (V_{in}=12\ V) | 3/6/9 V; requiere conducción continua ideal |

**Importante:** en un MOSFET, (V_{GS(th)}) no asegura baja (R_{DS(on)}); en un buck real hay pérdidas, límites de control, magnetismo y rizado; y una bobina física debe tener protección de descarga. Los ejemplos son exclusivamente matemáticos y de baja tensión.

## Secuencia dentro de la teoría

1. Elegir parámetro de una de las tres condiciones.
2. Formular hipótesis física, criterio explícito que la falsaría y resultado numérico predicho.
3. Escribir explicación y limitaciones, congelar las decisiones.
4. Revelar **el cálculo matemático**, la ecuación causal y la tabla de sensibilidad de tres condiciones.
5. Guardar un registro de entrenamiento `lab-numeric-*-v1` separado de lectura, cuaderno H1/H2 y razonamiento contrafactual.

La rúbrica cuantifica **la coincidencia del modelo**: predicción numérica (40 puntos), hipótesis (25), falsador (25), documentación formal (10). La redacción no tiene revisión semántica automática; cumplir la nota no demuestra manejo de osciloscopio ni competencia práctica real.

## Trazabilidad

- Implementación: `src/numeric-inquiry.js` y montaje por `src/app.js`.
- Puente pedagógico: `src/lesson-practice.js`.
- Evidencia persistente: IDs `lab-numeric-resistive-loss-v1`, `lab-numeric-mosfet-v1`, `lab-numeric-inductor-energy-v1`, `lab-numeric-shared-return-v1`, `lab-numeric-buck-v1`.
- QA unitario: `tests/numeric-inquiry.test.js` valida fórmulas, predicciones incorrectas, límites de entrada y sensibilidad.
- QA de interfaz: `tests/e2e/numeric-inquiry.spec.js` ensaya también el guardado, descarga de backup y recarga en Chromium/WebKit.
- PWA offline: `autolab-academy-v89`, sin modificación del esquema de IndexedDB.

## Cobertura acumulada

94 lecciones con cuaderno experimental no calificado, 36 microcasos de razonamiento contrafactual, 19 laboratorios embebidos (**4 existentes + 11 bancos numéricos + 4 oscilogramas**) y 12 prácticas vinculadas. **63 lecciones aún no tienen laboratorio individual integrado o vinculado.** Tampoco se acredita práctica física, calibración, aptitud HV ni razonamiento escrito sin evaluación humana.

## Entornos

El trabajo queda exclusivamente en el PR #52 Draft, rama `feature/engineering-mindset-rd-vision`. La integración Git despliega *previews* independientes de Vercel; no se promueve, fusiona ni publica a Pages producción. Un estado Vercel READY no es equivalente a CI integral aprobada.
