# AutoLab Academy v0.7 — Contenidos y laboratorio de osciloscopio

## Ampliación de la academia

Se agregaron **10 lecciones originales** (dos por área) a las 6 previas: **16 lecturas** distribuidas en electricidad, motor/OBD, osciloscopía, redes y HEV/EV.

Se incorporaron **30 preguntas nuevas** (seis por área) a las 30 anteriores: **60 preguntas** con cuatro opciones y explicación por respuesta. El esquema de IDs se conserva para no perder el progreso de repetición espaciada FSRS. Las nuevas preguntas se incorporan a exámenes acumulativos y por especialidad sin borrar registros anteriores.

Contenido conceptual y fuentes contextuales; la creación de esta sección no implica revisión por un perito automotor. Cada lección distingue la interpretación de señales de la intervención física de alto riesgo.

### Lecturas completadas

Se registra fecha de primera lectura en el campo notes, usando claves con prefijo lesson- seguido por el identificador (IndexedDB y JSON exportable). Los minutos estimados se suman una sola vez por lección, de modo que revisarla nuevamente no infla la métrica; el progreso histórico anterior no se reconstruye ficticiamente.

## Laboratorio de osciloscopio

Cuatro capturas generadas mediante un modelo matemático explícito:

| Escenario | Supuestos sintéticos | Pregunta |
| --- | --- | --- |
| PWM | Período 8 ms, alto 2 ms, amplitud 5 V | Duty 25% |
| CKP | Rueda 60-2, una vuelta de 100 ms, nivel digital ficticio | 600 RPM |
| CAN diferencial | 500 kbit/s, CAN-H 3,5/2,5 V, CAN-L 1,5/2,5 V | Diferencia dominante 2 V |
| Senoidal | Periodicidad 5 ms, centrada en 2,5 V | 200 Hz |

- La visualización SVG se escala al ancho, con scroll horizontal en pantallas pequeñas.
- Las respuestas numéricas usan coma o punto decimal y tolerancias explícitas.
- Corrección determinista offline, resultado guardado como práctica en el historial y en el backup existente.
- Los gráficos se generan localmente sin servidor ni hardware conectado. No son capturas medidas, ni ejemplos OEM validados, ni instrumentos de diagnóstico.
- Los valores típicos del modelo CAN son intencionadamente simplificados: la señal física real depende de topología, transceptor, velocidad y estado del vehículo.

## Seguridad y límites

No transmitir tramas CAN, conectar sondas a alta tensión ni intervenir paquetes de tracción. La práctica enseña interpretación de datos sintéticos y no certifica aptitud profesional. Las URLs asociadas a temas son referencias generales, no documentación de los datos ficticios.

## Verificación

Los tests nuevos comprueban:
- 16 IDs de lecciones y 60 IDs de preguntas sin duplicados;
- equilibrio de 12 preguntas por área y mínimo 3 lecciones por área;
- fuentes HTTPS, respuesta dentro de cuatro opciones y explicación suficiente;
- las cuatro formas de onda, 600 muestras por escenario, tiempos crecientes;
- duty PWM, pausa CKP, diferencial CAN dominante y recesivo, frecuencia senoidal, validación de entradas/tolerancias.

**Pendiente de QA manual:** interacción Safari/iPhone, actualización de service worker, contraste VoiceOver, renderización de gráficos en pantallas pequeñas y prueba de exportación/restauración completa.
