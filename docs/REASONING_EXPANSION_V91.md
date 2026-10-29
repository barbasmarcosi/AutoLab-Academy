# AutoLab Academy v91 — cuatro investigaciones adicionales de causalidad electrónica

## Visión didáctica

Cada caso v2 obliga a congelar una hipótesis, elegir una **prueba discriminante**, declarar un **falsador** y resolver un escenario **contrafactual nuevo** antes de mostrar las respuestas. No equivale a una simulación física de sensores/ECU ni a una corrección inteligente de las justificaciones escritas.

| Lección | Hipótesis alternativas | Prueba discriminante de laboratorio sintético | Evidencia contrafactual |
|---|---|---|---|
| `mosfet-control` | Excitación de puerta insuficiente frente a caída resistiva de potencia | VGS, VDS y corriente LV bajo la misma demanda | Gate apropiado pero VDS alta modifica hipótesis: `VGS(th)` nunca acredita baja pérdida |
| `inductive-load` | Energía de bobina frente a comportamiento del clamp | Corriente y tensión de apagado con L e I iniciales iguales y clamp variable | Curvas de desmagnetización distintas no contradicen la misma energía inicial |
| `ground-reference-network` | Sensor desplazado frente a masa local bajo carga | Medida diferencial del retorno y correlación con corriente y señal local | Caída de retorno correlacionada exige contrastar referencia antes de reemplazar sensores |
| `dcdc-switches` | Ecuación ideal del buck frente a límite de corriente/control | Vin, Vout, corriente y rizado en dos condiciones de carga de un **modelo LV** | Vout cae con duty fijo cuando un modelo extendido impone límite: (V_{out}=D\,V_{in}) no es garantía universal |

## Integración y contratos

- Catálogo evaluable: **40/94** lecciones (`src/lesson-reasoning.js`), con **40 escenarios propios de transferencia** (`src/lesson-transfer.js`), sin duplicaciones de IDs y con test de correspondencia entre ambos.
- Evidencia humana: rúbrica separada, cinco dimensiones con anclajes 0–3; su estado permanece **PENDIENTE** y no se deduce comprensión de texto por cantidad de caracteres.
- Evidencia numérica e instrumental virtual: **19 laboratorios embebidos** más **12 bancos vinculados**, sin doble acreditar lecciones. Quedan **54 sin v2** y **63 sin laboratorio embebido/vinculado**.
- Comprobación de navegador: un caso MOSFET v2 congelado y exportado exige 100/100 en decisiones objetivas; **no** debe marcar aprobada ni la lectura teórica ni la práctica numérica independiente.
- Caché offline `autolab-academy-v91` para invalidar módulos previos al introducir nuevos casos; IndexedDB/JSON conserva esquema 1.

## Seguridad y alcance de QA

Estos escenarios únicamente enseñan razonamiento conceptual en circuitos ficticios LV. No se puentean protecciones, no se intervienen sistemas energizados sin procedimientos autorizados y no se realizan pruebas HV. La ausencia de datos OEM, tolerancias y calibración impide derivar un diagnóstico verificable de un vehículo real. La suite Playwright en Chromium/WebKit, pruebas unitarias y compilación deben quedar aprobadas para el **HEAD exacto**: una preview de Vercel en estado READY **no demuestra** que la CI haya terminado.

## Entorno

Proyecto de pruebas: Vercel `autolab-academy-rd-preview`, **target preview**, restringido al PR #52 `feature/engineering-mindset-rd-vision`. Sin merge ni publicación de GitHub Pages de producción.
