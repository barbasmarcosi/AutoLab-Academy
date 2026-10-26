# v1.9.14 — Integridad transversal de todos los catálogos de escenarios

Además del control de 61 lecciones y 150 preguntas, un segundo gate importa los 13 catálogos de prácticas de la PWA, incluido el material general, ECU, multifallas, diferencial, trazas, inyección, misfire, integrador, transferencia, componentes, osciloscopio y BMS.

Comprueba identidades únicas globales, título y especialidad, referencias contextuales presentes cuando se requieren y URLs HTTPS cuando existen. Reutiliza los validadores internos de seis familias de laboratorios y el validador de casos comunes; evita mantener dos implementaciones divergentes de reglas de cada laboratorio. El resultado enumera por familia los escenarios y fuentes que faltan por documentar. Los casos sin fuente local en catálogos donde se modela procedencia por familia solo generan advertencias, **no se consideran verificados externamente**.

Esta comprobación no acredita que una hipótesis sintética represente un vehículo, que las unidades sean OEM ni que una práctica sea segura en alta tensión. La revisión técnica y el contraste de modelos con documentación externa siguen separados.

Gate: npm run audit:scenarios desde npm run build, tests unitarios de regresión, CI E2E sobre tres motores y upgrade v35→v36, sin modificar schema JSON ni notas.
