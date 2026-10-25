# AutoLab Academy v1.0 — Electrónica de componentes y drivers

## Alcance real

Se incorpora un **banco didáctico algebraico**, no un motor SPICE, osciloscopio conectado, esquema OEM ni instrumento certificado. No hay backend ni datos enviados fuera del navegador.

Seis módulos sintéticos con dos estados: referencia nominal y componente alterado:
- Divisor resistivo 5 V, top 3 kΩ y bottom 2 kΩ: Vnodo = 2 V; con rama inferior ideal abierta, 5 V.
- Fuente 12 V, carga 6 Ω y cable en serie: caída bajo carga entre extremos del tramo.
- MOSFET low-side resistivo ideal (12 V, carga 8 Ω): cambio de RDS equivalente y lectura VDS durante conducción. **No** se deducen capacidad de puerta, temperatura ni transitorios de conmutación.
- Shunt en serie con carga 10 Ω: diferencia entre terminales y efecto de la resistencia propia.
- RC a escalón 12 V: curva teórica Vc(t) con R=1000 Ω; capacitor 100 µF nominal o 20 µF alterado. Gráfico temporal SVG comparativo, sin fingir un oscilograma físico.
- Bobina de 0,15 H con corriente inicial 2 A o 4 A: E=0,5LI²; **no** se calcula pico inductivo ni la protección de flyback que debe diseñarse específicamente.

Cada módulo presenta un trayecto conceptual de bloques SVG, descripción de supuestos, fórmula y magnitud solicitada. Exige valor numérico en coma o punto decimal, elegir la prueba adecuada y escribir una justificación (70–2000 caracteres).

## Calificación y documentación

La rúbrica estructura 70 puntos por resultado numérico dentro de 0,5% o una tolerancia mínima de 0,005 unidades, y 30 puntos por seleccionar evidencia relevante. La elección marcada como insegura obtiene **cero puntos**. El texto se exige pero **no se evalúa semánticamente**, así que una calificación alta no acredita interpretación correcta de esquemas reales.

Los resultados quedan en el arreglo de prácticas ya existente en IndexedDB y el backup JSON, sin migración de esquema. La descarga Markdown incluye condición, valor estimado, referencia, ecuación, justificación y fuente contextual. Los supuestos se identifican como **sintéticos y educativos**, no valores OEM.

## Progresión

Se suman 10 lecciones y 20 preguntas; total **36 lecciones y 100 preguntas**. Se añade el cuarto nivel, **Componentes y drivers**, al itinerario: las etapas previas y los identificadores existentes no cambian. La valoración de lectura permanece distinta de exámenes y prácticas.

## Bibliografía contextual

- Nexperia, aplicaciones de MOSFET como interruptor de potencia: https://www.nexperia.com/applications/interactive-app-notes/IAN50020_Power_Switch_MOSFETs
- Nexperia, control de solenoides automotrices: https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html
- Pico Automotive Guided Tests: https://www.picoauto.com/library/automotive-guided-tests/
- Kvaser, introducción al protocolo CAN: https://kvaser.com/can-protocol-tutorial/
- HSE, seguridad de vehículos híbridos y eléctricos: https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm

Las fuentes respaldan conceptos generales y **no** los valores arbitrarios de los modelos de AutoLab.

## Calidad y pendientes

Pruebas automáticas: seis configuraciones, vectores de referencia de ambas condiciones, resultados numéricos, evidencia, rechazo de acciones inseguras, entrada numérica inválida, curva RC y contenido curricular completo. La PWA precachea los módulos.

**No verificado aún en dispositivo:** Safari iPhone, VoiceOver, interacción táctil, actualización de caché y exportación/restauración JSON sobre instalaciones antiguas. También sigue pendiente una revisión independiente por especialista automotor y el diseño de un sistema de laboratorio físico de baja tensión con instrumentación calibrada y supervisión.

Nunca usar este banco como procedimiento de intervención HV, reparación de ECU o certificación profesional.
