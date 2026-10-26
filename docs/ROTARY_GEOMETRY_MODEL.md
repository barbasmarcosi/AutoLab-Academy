# RW-P1 — Contrato del primer explorador cinemático

**Estado:** implementado como experimento RW0/RW1 en la PWA. No es un CAD validado, motor termodinámico, calculador OEM ni simulación de desempeño.

## Modelo y procedencia

Parámetros de ejemplo sintéticos: R=90 mm (centro del rotor a ápice), e=14 mm (excentricidad), b=50 mm (ancho virtual); 96 segmentos por cámara.

- Carcasa: x(α)=e cos(3α)+R cos(α); y(α)=e sin(3α)+R sin(α).
- Eje θ=3α; centro del rotor C=(e cos θ,e sin θ).
- Ápice k: C+R(cos(θ/3+2πk/3),sin(θ/3+2πk/3)).
- Para obtener un área geométrica aproximada se unen ápices adyacentes con una cuerda recta y se integra mediante la fórmula del polígono el contorno de la carcasa asociado.
- Volumen PROXY (cm³) = área (mm²) × b (mm) / 1000. Solo ilustra variaciones. No representa volúmenes reales de cámara ni cilindrada ni relación de compresión.

El rotor real posee flancos curvos y alojamientos de sellos que no están modelados; faltan holguras, puertos, recesos de bujías, presión, aire, lubricación, temperatura y combustión. Los nombres de cuatro fases son conceptuales y alineados aproximadamente con extremos geométricos, no eventos de apertura de puertos, encendido o inyección.

El rotor completa una vuelta por cada tres vueltas del eje (1080° de eje). La comparación con un motor de pistones de cuatro tiempos (720° de cigüeñal por ciclo por cilindro) es cinemática; NO establece superioridad de eficiencia, emisiones ni vida útil.

## Experimento reproducible

El estudiante selecciona cámara y ángulo, pronostica el cambio de área en +30° y redacta una justificación antes de mostrar resultados. Solo el pronóstico numérico/categórico se evalúa automáticamente; el texto libre no recibe evaluación semántica. Puede guardar modelo, versión, parámetros, baseline, hipótesis, resultado, límites y procedencia como caso en el portafolio. El respaldo JSON e IndexedDB mantienen el esquema previo (schema 1). RW0 contiene una conversión de par y rpm a potencia en kW.

## Evaluación de herramientas

| Herramienta | Decisión inicial |
| --- | --- |
| SVG y JS matemático nativo | Elegidos para geometría 2D reproducible offline, sin licencia adicional |
| CircuitJS / SPICE | Dominio de circuitos, no modelado Wankel. Estudiar integración bajo su licencia antes de incorporar |
| PyBaMM | Mantener en electroquímica de baterías, no reutilizar como solver de rotor |
| Speeduino / rusEFI | Referentes educativos ECU/firmware para fases posteriores, sin transmisión real ni flasheo |
| CFD / FEA / CAD especializado | No integrados: exigir revisión de precisión, licencia, compatibilidad y validación independiente |

## Fuentes consultadas

- Parametric modeling and analysis of intake phases for side-ported Wankel rotary engines: https://pmc.ncbi.nlm.nih.gov/articles/PMC10658253/
- The Wankel Rotary Engine (material pedagógico): https://world.lapla.si/en/wankel/
- Two-Stroke Wankel Type Rotary Engine, Energies 2019: https://www.mdpi.com/1996-1073/12/21/4096

## Alcance de verificación

Pruebas unitarias del giro 3:1, ápices, positividad y balance de áreas, periodicidad 1080°, rechazo de parámetros inválidos, tendencia y fórmula de potencia. E2E: predicción, persistencia, recarga y uso offline en navegadores soportados por CI. No se han realizado ensayos físicos ni contraste con CAD de geometría de flancos reales.

Próxima iteración: comparar áreas contra integración de referencia, cuantificar error por discretización, validar flancos curvos y añadir experimentos RW4 con hipótesis alternativas y pruebas discriminantes.

## Primer Rotary Research Bench: análisis de sensibilidad (P1b)

Se agregó un A/B determinista: baseline e=14 mm y alternativas e=10 o 18 mm, manteniendo R=90 mm, ancho ficticio=50 mm y paso de muestreo angular de 15 grados. La métrica es oscilación máximo-mínimo del volumen-proxy de una cámara; no compresión ni eficiencia. El estudiante plantea predicción e incertidumbre antes de contrastar y puede guardar el resultado y procedencia en el portafolio. Una comparación de 48 vs. 192 segmentos comprueba sensibilidad numérica de discretización, no sustituye estimación de incertidumbre física. Pruebas: tests/rotary-research.test.js.
