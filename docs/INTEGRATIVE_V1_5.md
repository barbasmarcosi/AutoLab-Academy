# AutoLab Academy v1.5 — Taller Integrador y trazabilidad de diagnósticos

## Qué entrega

Tres expedientes **sintéticos y desconectados de vehículos**, que reúnen cuatro fuentes de observación: condiciones de funcionamiento, datos atribuidos a un controlador de banco (OBD ficticio), formas de onda ficticias y resultados de pruebas de circuito virtual.

Los expedientes trabajan hipótesis alternativas para:

1. **Alimentación local ECU:** un P0300 del banco coincide con la omisión de mando y un descenso de tensión en el pin ECU, mientras bornes ficticios están estables.
2. **Suministro de combustible limitado:** el banco registra correcciones crecientes con demanda y una presión virtual menor que su propia referencia. La orden eléctrica de inyector sigue activa.
3. **Intermitencia CKP:** se registran pulsos CKP faltantes en la misma ventana en que la orden de encendido desaparece, pero el voltaje de alimentación permanece dentro de los parámetros hipotéticos.

Ningún número es captura real, PID garantizado, valor OEM, forma de onda calibrada ni algoritmo de fabricante. El motor de la app **no evalúa semánticamente** la calidad del texto libre.

## Cadena de evidencia y clasificación

Cada lectura tiene:

- ID permanente del instrumento virtual.
- Tipo de fuente: `context`, `obd`, `wave` o `circuit`.
- Condición y valor sintético documentado.
- Procedencia declarada, no inferida.
- Pronóstico del estudiante antes de revelar el resultado.
- Clasificación del banco como observación, normal, anómala o peligrosa.
- Un papel conocido **solo después de corregir**: confirmar la hipótesis del generador, excluir una alternativa bajo los supuestos del banco o aportar contexto sin discriminar.

La selección de datos incluye fuentes que **no prueban una causa**; el objetivo es abandonar la idea de que basta reunir números concordantes. La rúbrica exige abrir las cuatro fuentes, una confirmación y una prueba de descarte.

## Evaluación y límites

| Criterio | Puntos |
|---|---:|
| Causa del generador identificada | 35 |
| Prueba confirmatoria del modelo | 20 |
| Prueba de descarte independiente | 15 |
| Lecturas de las cuatro fuentes | 15 |
| Al menos un pronóstico previo correcto | 5 |
| Justificación escrita entre 120 y 3000 caracteres | 5 |
| Incertidumbres escritas entre 60 y 1200 caracteres | 5 |

Se necesitan **todos los criterios** para cumplir la rúbrica. Si se elige una acción marcada insegura se obtiene **cero puntos** y no se aprueba. La redacción no recibe validación lingüística, semántica ni profesional: superar la rúbrica solo confirma selecciones estructuradas de un conjunto de datos ficticios.

La aplicación conserva en IndexedDB y los respaldos JSON un campo opcional `report` (máximo 10000 caracteres) por registro de caso, sin aumentar la versión del esquema de progreso ni invalidar entradas antiguas. El informe incluye hipótesis original, evidencia consultada y su procedencia, pronósticos, causa elegida, respuesta del generador, hipótesis descartadas dentro del modelo, límites y nota automática.

El informe puede descargarse al finalizar la práctica o recuperarse después desde la tarjeta del Portafolio, incluso luego de restaurar JSON. La exportación general de Portafolio incorpora informes completos disponibles.

## Formación

5 lecciones y 10 preguntas nuevas, una lección y dos preguntas por cada especialidad. Total: **61 lecciones, 150 preguntas y nueve etapas**.

## Referencias técnicas conceptuales

- [Pico: pruebas de sistemas](https://www.picoauto.com/library/automotive-guided-tests/system-tests/)
- [Pico: sensores](https://www.picoauto.com/library/automotive-guided-tests/sensors/)
- [Pico: Automotive Guided Tests](https://www.picoauto.com/library/automotive-guided-tests/)
- [HSE: vehículos híbridos y eléctricos](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm)

Las guías ilustran métodos de comparación y el contexto de instrumentación; **no respaldan las cifras inventadas de estos modelos**.

## Criterios de calidad y deuda técnica

Tests automáticos: integridad de 3 expedientes, cobertura por fuente, confirmación, descarte, acciones inseguras, predicciones, texto, incertidumbre, informe Markdown, persistencia de reportes y compatibilidad con respaldos pre-v1.5, 61/150 IDs e itinerario de nueve etapas, validación del service worker.

Pendiente: QA táctil con Safari/iPhone, pruebas manuales de offline y recarga con service worker, accesibilidad VoiceOver, revisión de contenidos por técnico, trazas y esquemas reales licenciados, y validación supervisada del razonamiento. **Ninguna nota ni documento acredita competencia de taller, diagnóstico real, manipulación de combustible o intervención HV.**
