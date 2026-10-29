# Lección 04 — CAN: más allá de los dos cables

**Estado:** implementación integrada, puerta de calidad **PENDIENTE** de CI focalizada y completa. Evaluación objetivo de diseño interno: **9,0/10**, no acreditada hasta conseguir verificación reproducible sin defectos críticos. No se presupone competencia práctica.

## Fundamentos contrastados con fuentes de dominio

- [CAN in Automation, CAN HS transmission](https://www.can-cia.org/can-knowledge/can-hs-transmission): niveles nominales dominantes CAN-H 3,5 V, CAN-L 1,5 V; recesivo ambas líneas cerca de 2,5 V; existen tolerancias y otras capas físicas.
- [Kvaser, CAN termination](https://kvaser.com/developer-blog/how-to-test-your-can-termination-works-correctly/): para **esa topología** se utilizan dos terminadores nominales de 120 Ω en extremos, equivalente aproximado de 60 Ω en red desenergizada; no inferir límites universales.
- [Kvaser, Arbitration and identification](https://kvaser.com/lesson/addressing-arbitration-identification-message-reaches-controller/): arbitraje dominante=0; el ID de menor prioridad numérica gana cuando ambos comienzan juntos. Perder arbitraje no constituye por sí solo error de protocolo.
- [Kvaser, CAN messages](https://kvaser.com/lesson/can-messages/): mensaje estándar de 11 bits y trama extendida de 29; el laboratorio se limita explícitamente al **arbitraje entre dos IDs estándar diferentes de datos, inicio simultáneo**. No enseña CAN FD, CAN XL o arbitraje completo de formatos mixtos como si fueran idénticos.

## Secuencia didáctica

1. **Ingreso sin nota ni almacenamiento:** cuatro concepciones erróneas relevantes, con devolución por pregunta (dominante, paralelo de terminadores, diferencial y causalidad).
2. **Lectura y ejemplo resuelto:** separar voltajes nominales, condiciones físicas y lógica de medio compartido. Calcular 2 × 120 Ω en paralelo; comparar 0, 1, 2 y 3 terminadores. Mostrar 0x080 frente a 0x120 y el primer bit diferente.
3. **Banco de conceptos manipulable:** ensayar recesivo/dominante sin hardware y variar terminación, ID del emisor A y del B. Los experimentos no transmiten tramas ni hacen llamadas de red.
4. **Práctica guiada real reutilizada:** `lab-numeric-can-termination-v1`, ya existente en `numeric-inquiry`, con registro y criterios por lección. Se evita reimplementar ese cálculo como un simulador nuevo.
5. **Transferencia independiente `lab-can-holdout-v1`:** nueve casos reservados de tres mecanismos —topología con terminador ausente o adicional, nodo sin alimentación y arbitraje válido—, con hipótesis inicial y primera prueba comprometidas, predicción, cuatro observables, conclusión, prueba discriminante y refutador específico de la hipótesis seleccionada.
6. **Revisión honesta:** un estado inicial incorrecto puede cambiar sin penalización; la calidad semántica del texto de justificación y alternativa queda pendiente de revisión humana. Distinción rigurosa entre aprobación de práctica guiada, transferencia independiente, lectura y microcaso de razonamiento.
7. **Persistencia:** registros versionados con datos, órdenes, inferencia y provenance; rotación de 9 casos que ignora reportes malformados; exportación en JSON del progreso offline. SW caché `autolab-academy-v102`.

## Rúbrica de evaluación del caso reservado (sin semántica libre)

| Decisión verificable | Peso |
|---|---:|
| Inferir cuántos terminadores de 120 Ω equivalen a la resistencia de banco | 25 |
| Elegir el mecanismo correcto del **modelo** | 50 |
| Elegir la prueba con mayor capacidad de discriminar ese mecanismo | 15 |
| Indicar qué observación refutaría el mecanismo seleccionado | 10 |

La nota plena requiere las cuatro pruebas, una explicación y una alternativa; esa escritura **no se interpreta automáticamente**. Los modelos sintéticos con una sola causa no equivalen a un procedimiento de diagnóstico de vehículo real. No usar lecturas en redes energizadas ni realizar transmisiones en autos.

## Puerta de diseño interno — valoración condicional

| Criterio | Máximo | Puntaje provisional |
|---|---:|---:|
| Física/protocolo, límites y fuentes | 2,0 | 1,9 |
| Prerrequisitos, ejemplos y discriminación conceptual | 2,0 | 1,9 |
| Banco manipulable y práctica guiada integrada | 2,0 | 1,9 |
| Transferencia reservada, falsación y razonamiento falsable | 2,0 | 1,8 |
| Evidencia, guardias, E2E y acceso móvil | 2,0 | 1,5 |
| **Total condicional, aún no aceptado** | **10,0** | **9,0** |

Esta es una rúbrica crítica **de diseño**, no un experimento de aprendizaje, certificación o aprobación de prácticas físicas. Para aceptarla hacen falta CI exacta, matrices de navegadores y comprobación de publicación; además, estudios con novatos, lectura con tecnología asistiva y transferencia diferida están pendientes y no se sustituyen con E2E.

## Riesgos conocidos

- El JavaScript offline contiene las respuestas de los casos; no es un examen con secretos ni sistema antifraude.
- Una red automotriz real puede usar topología, transceptores, terminaciones y tolerancias diferentes, CAN de baja velocidad, CAN FD, CAN XL y fallas simultáneas.
- Un patrón de resistencia, actividad o voltaje no identifica **por sí solo** un transceptor averiado.
- El modelo no cubre reflectometría, integridad de señal temporal, bit stuffing, ACK, carga real, incertidumbre instrumental ni condiciones peligrosas.

**Siguiente lección tras la aceptación de la cuarta:** `bms`, SOC vs SOH y estimación con incertidumbre.
