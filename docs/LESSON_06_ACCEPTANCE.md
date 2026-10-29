# Lección 06 — Seguridad de alta tensión: reconocer el límite

**Estado:** candidato a puerta de diseño interno **9,2/10**, condicionado a CI completa del SHA y publicación en Pages. La cifra evalúa diseño, prevención de errores críticos y verificabilidad; **no es una certificación** ni una medición de competencia sobre vehículos.

## Fuentes y límites de validez

- [HSE — Electric and hybrid vehicles](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm): peligros en talleres, movimiento silencioso, trabajo por personal competente, prácticas específicas del fabricante y precauciones ante vehículos dañados.
- [NHTSA — Electric and Hybrid Vehicles](https://www.nhtsa.gov/vehicle-safety/electric-and-hybrid-vehicles): precauciones ante daño, inundación, peligro eléctrico, gases, riesgo térmico y emergencias.
- [NHTSA — Emergency Response Guides](https://www.nhtsa.gov/emergency-response-guides): documentación específica por fabricante y vehículo para personal de respuesta, rescate y recuperación.
- [WorkSafe Victoria — Working on hybrid and electric vehicles safely](https://www.worksafe.vic.gov.au/working-hybrid-and-electric-vehicles-safely): evaluación de peligros, competencia y autorización, sistemas de trabajo seguros; abrir paquetes requiere personal competente y equipo especializado.

**No se reproducen instrucciones físicas de desconexión, aislamiento, comprobación de ausencia de tensión, actuación sobre interlocks, intervención de paquetes o extinción de incendios.** Ese trabajo depende del vehículo, el fabricante, las autoridades locales, el rol y la formación acreditada.

## Diseño de aprendizaje

1. **Ideas previas sin nota ni persistencia:** silencio del vehículo, cable naranja, señales de daño y límites de un examen digital.
2. **Ejemplos resueltos contrastados:** movimiento silencioso, derivación de tareas HV fuera del rol, indicios de daño, emergencias y consulta puramente documental. La ausencia de síntomas **no prueba** ausencia de tensión.
3. **Práctica guiada `lab-hv-safety-guided-v1`:** tres casos que fuerzan a distinguir respuesta de emergencia, suspensión y derivación, e información documental sin intervención. No se permite avanzar escogiendo una intervención insegura; guardado solo tras 3/3.
4. **Transferencia independiente `lab-hv-safety-holdout-v1`:** nueve expedientes reservados, tres por mecanismo, con historia inicial que no ofrece la conclusión. Hipótesis y primer informe congelados antes de revelar datos; cuatro informes; decisión final, peligro principal, reconocimiento explícito de no habilitación, justificación y alternativa.
5. **Evaluación crítica:** respuesta 50 puntos, reconocimiento del peligro 30 y límite de autoridad 20. **Fallo crítico / cero puntos** si se elige manipular personalmente HV, si se afirma habilitación por nota o seguridad subjetiva, o si se retrasa una respuesta de emergencia cuando hay signos activos. No se certifica nada incluso con 100 puntos.
6. **Traza auditable:** registro guiado y holdout separados; historial versionado, orden de evidencias, decisiones y texto abierto con `qualitativeReview: pending`. Reintentos rotan por nueve casos, sin filtrar como válidos reportes corruptos. Persistencia local y exportación con modelo `autolab-hv-awareness-v1`, caché offline `autolab-academy-v104`.
7. **QA reproducible:** pruebas de casos, de guardas críticas, de intento con evidencia incompleta, de actualización de hipótesis, E2E de navegador, exportación, accesibilidad WCAG AA móvil y recorrido de práctica/transferencia separado.

## Evaluación interna condicional

| Dimensión | Máximo | Puntaje provisional |
|---|---:|---:|
| Fuentes especializadas, exactitud y límites de seguridad | 2,0 | 2,0 |
| Prerrequisitos y ejemplos contrastivos | 2,0 | 1,9 |
| Práctica interactiva guiada segura | 2,0 | 1,9 |
| Nueve casos independientes con decisión y prueba previa | 2,0 | 1,8 |
| Integración offline, CI, accesibilidad, evidencia auditable | 2,0 | 1,6 |
| **Total provisional** | **10,0** | **9,2** |

## Riesgos y pendientes explícitos

- La semántica de razonamientos escritos permanece sin corregir y podría no ser coherente.
- Los casos son sintéticos y observables digitalmente; no son situaciones de emergencia reales.
- La aplicación no ofrece guía de actuación de rescate, aislamiento, energía residual, EPP, bloqueo/etiquetado ni procedimientos de taller.
- No hay evaluación observada de estudiantes, retención diferida 24–72 h, validación humana de accesibilidad ni certificación externa.
- Los casos están incluidos en JS offline: no hay mecanismo antifraude; el objetivo es aprendizaje conceptual con transferencia, nunca examen protegido.

**Puerta de aceptación:** solo considerar ≥9/10 de diseño si el SHA exacto supera compilación, unitarias, E2E focalizadas y matriz completa de Chromium/WebKit/WebKit móvil, sin fallos críticos. Publicación automática posterior exige `deploy: success`. No equivale a competencia profesional.

**Próxima lección:** seguir el orden real del itinerario de 94 lecciones; no inferir del orden temático ni asumir que la teoría acredita práctica.
