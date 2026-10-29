# Lección 07 — Masas, terminales y resistencia de contacto

**Estado:** candidata de calidad interna de diseño **9,1/10**, no aceptada hasta suite E2E completa y publicación de Pages del SHA exacto. La PWA no mide ni diagnostica vehículos reales.

## Física y datos del modelo
Se reutiliza `voltageDropModel` de `volt-drop-lesson.js`, **sin reinventar circuito, simulador numérico ni motor eléctrico**. Red DC de baja tensión ficticia: fuente ideal 12 V, resistencias positivas y retornos conocidos y carga resistiva variable. Balance `Vsource = I×Rpositive + I×Rreturn + I×Rload`. La lectura de continuidad sin corriente no localiza un contacto defectuoso porque el voltaje de caída depende de la corriente. El banco docente jamás infiere umbrales o componentes OEM.

Fuente técnica introductoria de referencia: [Pico Technology — Automotive guided tests](https://www.picoauto.com/library/automotive-guided-tests/) y principios físicos de Ohm/Kirchhoff. Las lecturas concretas son **sintéticas**, no transcripciones de documentación oficial.

## Ciclo teoría ↔ práctica ↔ transferencia

1. **Ingreso sin nota:** cuatro preguntas sobre continuidad en reposo, localizar por extremos de cada conductor, convertir `R=ΔV/I` y límites de seguridad.
2. **Ejemplo resuelto:** mismo circuito ideal con retorno nominal 0,05 Ω vs. retorno elevado 0,40 Ω; se contrastan corrientes, caídas de positivo, retorno y carga, y un caso de circuito sin corriente.
3. **Práctica guiada `lab-ground-test-guided-v1`:** tres escenarios **distintos de las transferencias**: cambio en retorno, cambio en positivo y cambio de carga. Antes de revelar lecturas el alumno congela mecanismo y pronóstico numérico; después discrimina observables y documenta explicación.
4. **Transferencia `lab-ground-test-holdout-v1`:** nueve situaciones reservadas con tres mecanismos y parámetros variados; bloquea hipótesis y primera observación antes de revelar cuatro datos; exige caída calculada, causa, prueba discriminante, falsador de la conclusión, justificación y alternativa.
5. **Nota objetiva:** 30/100 por caída de retorno (±0,06 V en estos datos ideales), 40/100 por causa, 20/100 por contraste y 10/100 por falsación. La hipótesis inicialmente incorrecta **no se penaliza** si se revisa después de nueva evidencia.
6. **Evidencia:** guiada y reservada separadas, intento completo, cuatro lecturas y orden de exploración, explicación libre pendiente de revisión humana, rotación de nueve casos. La lectura no sustituye la competencia práctica.
7. **QA:** unitarias metamórficas para nueve variantes, límites y restricciones de circuito, regresión de progresos, Playwright sobre caso guiado, reservado y exportación, WCAG AA móvil y shell offline v105.

## Rúbrica de diseño — provisional

| Dimensión | Máximo | Evaluación provisional |
|---|---:|---:|
| Física, unidades y límites de alcance | 2,0 | 1,9 |
| Diagnóstico previo y teoría contrastiva | 2,0 | 1,9 |
| Simulación guiada integrada y reutilización de componentes | 2,0 | 1,9 |
| Transferencia reservada y falsación con evidencia | 2,0 | 1,9 |
| QA, persistencia, accesibilidad y debilidades documentadas | 2,0 | 1,5 |
| **Total condicional** | **10,0** | **9,1** |

## Riesgos abiertos
- Resistores ideales no modelan corrosión térmica, ruidos, fluctuaciones de batería, cables reales, transitorios, contactos no lineales, puntos de masa distribuidos ni errores instrumentales.
- Una única simulación de causa por caso no representa fallas simultáneas; tampoco identifica la pieza física culpable.
- Las explicaciones abiertas se almacenan, pero no son corregidas semánticamente.
- No hay novatos observados, transferencia diferida ni pruebas físicas. La operación offline expone respuestas de casos en el código.
- No se dan instrucciones para desconectar retornos críticos ni puentear protecciones de vehículos.

**Evidencia focalizada:** [CI #40801330807](https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40801330807), SUCCESS (build, unitarias, E2E focalizados). Se exige matriz completa Chromium + WebKit + WebKit móvil, y deploy de Pages exitoso antes de aceptación final.

**Siguiente lección del itinerario:** `sensor-reference` (alimentación, referencia y masa de sensor).
