# AutoLab Academy — Roadmap de formación integral con tutoría conversacional
> Versión 1.0 · 2026-10-29 · Estado: **propuesta curricular, no programa cursado ni aprobado**.
>
> Este documento define **qué aprender, en qué orden, por qué y cómo demostrar comprensión**. La enseñanza y la devolución cualitativa ocurren en conversación con un tutor humano/IA; la PWA se reserva para consulta, simulaciones y evidencia local. **No reemplaza** el currículo MC00–MC14, los simuladores existentes ni el rediseño pedagógico del PR #56.

## Norte
Comprender el vehículo completo (combustión, HEV, PHEV y BEV) de manera causal y transferible, sin depender de memorizar respuestas, códigos de error o reemplazos de piezas. Poder explicar funciones, mecanismos, interdependencias, síntomas, hipótesis, pruebas y límites de seguridad. Profundización matemática/ingenieril **bajo demanda**, cuando resuelva una pregunta real. La competencia física y la capacidad para intervenir vehículos se acreditan separadamente.

**Lema:** función → fenómeno físico → mecanismo → predicción → evidencia → falla → prueba → transferencia.

## Cuatro ejes que acompañan toda la formación
1. **Anatomía funcional**: ¿qué existe y para qué? Ubicarlo en cadenas de energía, fuerzas, materiales y señales.
2. **Fisiología y causación**: ¿cómo funciona? Explicar y predecir sin mirar apuntes.
3. **Patología y diagnóstico**: ¿cómo falla, qué observamos y qué prueba discrimina las causas?
4. **Intervención segura y síntesis**: ¿cómo se comprueba la recuperación o rediseño, y cuándo no intervenir?

No se enseña el sensor sin explicar antes la variable física que mide ni el circuito sin su función mecánica. Tampoco se posterga por años la exposición a HEV/EV: se comparan arquitecturas en cada etapa y se profundizan después de cubrir las dependencias.

## Ruta incremental (orden conceptual, no cronograma obligatorio)

| Etapa | Tema y vínculo con currículo MC | Pregunta motriz | Puerta de salida: poder hacer sin material de consulta |
|---|---|---|---|
| **F00** | Automóvil como sistema; seguridad básica y cadenas energéticas (MC00, MC02) | ¿Qué debe resolver cualquier automóvil? | Dibujar de memoria dos cadenas de energía y señal, una térmica y una eléctrica; identificar peligros y funciones |
| **F01** | Fuerza, par, potencia, transmisión y tren motriz (MC01, MC06) | ¿Cómo se transforma movimiento en tracción? | Deducir embrague, marchas, reducción y diferencial; predecir cambios de par/velocidad con supuestos |
| **F02** | Motor térmico: geometría, 4 tiempos, combustible, encendido y diésel (MC03, MC04) | ¿Cómo transforma combustible en trabajo útil? | Reconstruir ciclo y explicar al menos dos causas de pérdida de par sin culpar primero a la ECU |
| **F03** | Admisión, lubricación, refrigeración, escape, emisiones y control básico (MC05, MC11) | ¿Qué mantiene al motor vivo y eficiente? | Explicar relaciones entre temperatura, presión, flujo, fricción y señal de sensores; contrastar hipótesis |
| **F04** | Neumáticos, chasis, dirección, suspensión y frenado (MC07, MC08) | ¿Qué permite girar y detenerse? | Deducir adherencia, transferencia de carga y frenado; reconocer límites de intervención |
| **F05** | Electricidad a bordo, sensores, actuadores, ECUs y redes (MC10, MC11) | ¿Qué debe medir/regular una centralita y por qué? | Dibujar un lazo físico-control-medición; proponer pruebas que distingan falla del sensor y de la planta |
| **F06** | Estructura, seguridad pasiva, confort, HVAC y auxiliares (MC00, MC09) | ¿Qué sistemas hacen seguro y habitable al vehículo? | Explicar ciclo frigorífico y el propósito de protecciones, sin improvisar tareas peligrosas |
| **F07** | Motores eléctricos, batería, inversor, BMS, regeneración, HEV/PHEV/BEV (MC12) | ¿Qué cambia si cambia la fuente y arquitectura de energía? | Trazar flujos de potencia en tres arquitecturas y describir límites de seguridad HV |
| **F08** | Diagnóstico integral y problemas interdisciplinarios (MC13 + todos) | ¿Qué evidencia distingue causas que producen el mismo síntoma? | Resolver un caso no visto: modelo causal, hipótesis, pronósticos previos, pruebas seguras y falsación |
| **Optativas** | Optimización, Wankel, range-extender, control avanzado, R&D (MC14) | ¿Podría resolverse el problema de otro modo? | Formular modelo, supuestos, riesgos, métricas y validación; **solo tras** prerrequisitos |

Los códigos F** son una **ruta de aprendizaje**; los códigos MC** son la **cobertura temática ya prevista** en la rama de rediseño. No cambiar IDs, notas ni acreditaciones de las lecciones actuales. No deducir competencias a partir de horas o de un video visto.

## Aprendizaje en espiral
En cada etapa:
- **Primer encuentro**: problema reconocible, predicción intuitiva y visual breve; medir ideas previas, no juzgarlas.
- **Segundo encuentro**: mecanismos, dibujo/animación y ejemplo resuelto; preguntar por qué es así y qué sucedería si falta una pieza.
- **Tercer encuentro**: variación de condiciones, caso inverso, otra arquitectura o una falla con varias causas plausibles.
- **Cuarto encuentro**: prueba independiente diferida, recuperación sin material y reflexión sobre errores.
- **Regreso posterior**: revisitar el mismo principio desde una etapa más difícil. Ej.: termostato en F03 → sensor y ventilador en F05 → circuito térmico de batería en F07.

## Puertas de comprensión (sin fingir certificación)
Para declarar una **comprensión provisional** se exige: (a) explicación causal propia sin ayuda, (b) dos predicciones justificadas incluyendo al menos un contrafactual, (c) un problema de transferencia no entrenado y (d) identificación honesta de incertidumbre. Una respuesta correcta por azar o con pistas cuenta solo como *práctica asistida*. Revalidar después con recuperación espaciada (p. ej., días 1, 7 y 21; ajustar por desempeño). Las habilidades prácticas reales **no** se califican con videos o simuladores.

Estados sugeridos por concepto: `no explorado`, `explorado`, `comprensión asistida`, `comprensión independiente provisional`, `retenido`, `aplicación supervisada`. Una sesión nunca transforma por sí sola lo conceptual en `aplicación supervisada`.

## Primer mes sugerido, sujeto a diagnóstico inicial
- **S1**: mapa funcional del vehículo, fuente de energía → propulsión → contacto con suelo; comparación ICE/BEV; seguridad.
- **S2**: fuerza, par, potencia, caja y diferencial; resolver predicciones y relaciones de transmisión.
- **S3**: motor de combustión, cuatro tiempos y sistemas asociados; visualizar corte 3D y explicar el ciclo.
- **S4**: comparación cadena térmica/eléctrica y primer caso integrador sin datos de escáner.

El progreso no se mide por semanas terminadas: si fallan los cimientos, se inserta una microlección y se retoma. Duración de referencia: sesiones conversacionales de 30–60 min, a adaptar por energía, motivación y evidencia.

## Separación de responsabilidades
- **Conversación con tutor**: preguntas socráticas, modelos causales, feedback semántico, corrección de errores, nivel de profundidad, comprensión inferida y decisiones de adaptación. No alegar evaluación automática si no ocurrió.
- **AutoLab PWA**: material de apoyo, lecciones existentes, simulaciones, preguntas objetivas, repaso, evidencia y exportación. Evitar reescritura de 94 lecciones por el mero cambio de roadmap.
- **Registro de aprendizaje**: sesiones resumidas por el tutor y revisables por el estudiante; recursos referenciados, compromisos, respuestas textuales cuando exista consentimiento, ideas equivocadas, evidencias, tareas y próxima revisión.
- **Control de cambios**: rama separada de documentación y PR Draft. No hacer merge, despliegue a Pages ni alterar puntuaciones existentes sin una etapa futura de implementación y validación.

## Privacidad, propiedad intelectual y seguridad
El repositorio GitHub es **público**. No subir automáticamente respuestas personales, transcripciones, evaluaciones individuales ni datos del vehículo identificables al repo público. Plantillas y catálogos didácticos sí son públicos. El historial individual se conserva localmente en una exportación privada u otra ubicación elegida expresamente, con borrado y corrección posibles; **este PR no implementa sincronización**. La conversación por sí misma no escribe el progreso en GitHub ni IndexedDB; cada persistencia requiere una acción real con confirmación.

Enlazar videos externos en lugar de descargar/redistribuir contenido protegido; verificar pertinencia y derechos antes de cualquier incrustación. Las prácticas no autorizan reparación de frenos, dirección, airbags, alta presión, elevación o HV. Documentación OEM y supervisión para intervenciones reales.

## Archivos vinculados
- [Protocolo tutor–estudiante](TUTORING_CONTRACT.md)
- [Biblioteca visual curada](VISUAL_LIBRARY.md)
- [Modelo de registro y privacidad](LEARNING_RECORD.md)
- [Primera sesión diagnóstica](SESSION_00_BASELINE.md)
- Currículo existente en PR #56: [Automotive Mechanics Core MC00–MC14](https://github.com/barbasmarcosi/AutoLab-Academy/blob/feature/pedagogy-first-redesign/docs/AUTOMOTIVE_MECHANICS_CURRICULUM.md)
