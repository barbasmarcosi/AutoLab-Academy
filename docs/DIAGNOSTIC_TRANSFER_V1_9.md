# AutoLab Academy v1.9 — Transferencia diagnóstica

## Objetivo

Practicar **diagnóstico diferencial contextual** en vez de volver a despejar una incógnita conocida. Cada investigación simula un síntoma que admite **al menos dos mecanismos causales distintos**, con presentación y evidencias que se generan mediante una semilla reproducible. Se selecciona un solo mecanismo activo por familia **solo en este banco sintético**: en un vehículo real podrían coexistir averías.

La sesión contiene cinco investigaciones, una por especialidad, y cada una cambia entre dos causas y dos descripciones iniciales. Existen **20 combinaciones por familia y contexto en conjunto (5 × 2 × 2)**, además de múltiples órdenes de pruebas y de casos. No se utilizan vehículos, ECUs, PIDs de marca ni sistemas físicos.

## Cinco investigaciones

| Especialidad | Síntoma común | Hipótesis A | Hipótesis B |
|---|---|---|---|
| Electricidad | Desaparece mando de actuador | Alimentación local ECU | Referencia CKP perdida |
| Motor | Correcciones de combustible positivas | Presión insuficiente del banco | Sublectura MAF virtual |
| Señales | Arranque demorado por sincronización | CKP interrumpido | CMP ausente inicialmente |
| Redes | Telemetría CAN intermitente | Terminación ausente del emulador | Carga de tráfico elevada |
| EV/HEV | No se habilita READY | Alimentación auxiliar 12 V ficticia | Interlock HV **virtual** no autorizado |

La medición de terminación en el caso CAN es únicamente una lectura preprogramada de un segmento **ficticio, sin energía**; no instruye a realizar pruebas de resistencia en vehículos en servicio. Los parámetros de bus dependen de topología y estándares, y las cifras representadas **no** son tolerancias universales OEM.

La comprobación de interlock del banco HEV es **solo lectura de un estado virtual**. No existe procedimiento físico, equipo HV, manipulación, desconexión o acceso a batería de tracción.

## Experiencia secuencial

1. El estudiante ve solamente un síntoma ambiguo y registra una hipótesis inicial.
2. Consulta instrumentos virtuales sin etiquetas sobre cuál confirma la causa. Antes de abrir cada lectura debe anticipar si será normal, anómala, contextual o insegura.
3. Examina la lectura y su **procedencia**; busca una evidencia que confirme y otra que refute una alternativa, bajo supuestos explícitos.
4. Registra la conclusión final, al menos 100 caracteres de justificación y 60 sobre incertidumbres y pruebas necesarias en un vehículo real.
5. Tras las cinco investigaciones se muestra la solución del generador, el rol de cada lectura, la puntuación y un informe Markdown reproducible. El texto libre **no se evalúa por significado**.

## Criterios automáticos

| Criterio | Puntos |
|---|---:|
| Mecanismo del generador elegido | 40 |
| Evidencia confirmatoria consultada | 20 |
| Evidencia de descarte consultada | 15 |
| Lectura contextual consultada | 10 |
| Algún pronóstico correcto | 5 |
| Justificación escrita presente y acotada | 5 |
| Incertidumbres escritas presentes y acotadas | 5 |

La aprobación estructurada exige todos los criterios. Seleccionar una acción señalada como insegura **anula puntuación y aprobación**. Los informes registran semilla, escenario, hipótesis inicial, pronósticos, lecturas de banco, causa final, interpretación y límites. Se guardan en Portafolio y respaldo JSON con el esquema local anterior (campo opcional `report`).

Una puntuación de 100 no demuestra que el razonamiento escrito sea correcto. No mide de manera validada transferencia lejana, eficacia profesional ni capacidad de mantenimiento de vehículos. Se necesitan instrumentos reales, documentación del fabricante y supervisión.

## Referencias conceptuales

- [Pico: caída de tensión y seguridad de osciloscopios](https://www.picoauto.com/library/automotive-guided-tests/ignition/distributorless-wasted-spark/AGT-041-ignition-amplifier-earth-volt-drop/)
- [Pico: correlación CKP/CMP](https://www.picoauto.com/library/automotive-guided-tests/es/system-tests/posici%C3%B3n-del-%C3%A1rbol-de-levas-frente-a-posici%C3%B3n-del-cig%C3%BCe%C3%B1al/AGT-151-posici%C3%B3n-del-cig%C3%BCe%C3%B1al-frente-a-posici%C3%B3n-del-%C3%A1rbol-de-levas/)
- [Kvaser: terminación y pruebas de bus CAN](https://kvaser.com/developer-blog/how-to-test-your-can-termination-works-correctly/)
- [HSE: peligros y requisitos de formación HEV/EV](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm)

Estas fuentes respaldan fundamentos y advertencias de seguridad, **no** las mediciones y resultados inventados del generador.

## Verificación

Pruebas de 400 semillas, dos mecanismos por familia, cuatro combinaciones causa × síntoma, consistencia de confirmación/descarte, bloqueo de maniobras inseguras, límites de explicación, semilla reproducible, informe y restauración de JSON/Portafolio. Nuevo archivo precargado en PWA offline.

**Pendientes:** QA real Safari/iPhone y VoiceOver, validación de actualización de caché PWA, evaluación editorial con especialista automotor y pruebas de transferencia supervisadas con evidencias reales licenciadas.
