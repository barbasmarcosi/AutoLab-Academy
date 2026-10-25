# AutoLab Academy v1.2 — Buffers de señales y fallas intermitentes

## Objetivo y alcance

Nuevo laboratorio **Capturas temporales**: seis ventanas consecutivas de duración ficticia de 120 ms, con una anomalía que aparece en una sola ventana. Se pueden observar cinco señales sintéticas en una línea de tiempo común: CKP (Hall idealizado), CMP (Hall idealizado), orden de inyector, corriente de inyector y alimentación de ECU.

**Las formas de onda NO proceden de instrumentos, motores, OEM ni vehículos reales.** No existe interfaz de hardware ni transmisión de datos CAN. Los valores elegidos son parámetros didácticos para razonar sobre sincronización y correlación, no rangos de diagnóstico para reparaciones reales.

## Casos

1. **CKP interrumpido temporalmente.** En una ventana desaparecen impulsos CKP durante un tramo; CMP y alimentación continúan bajo los supuestos del generador. La ausencia selectiva sirve para ensayar comparación entre canales, no para declarar una rotura física.
2. **CMP desplazado respecto de CKP.** Un flanco CMP se desplaza dentro de una ventana y CKP mantiene su patrón. No se modelan 720° mecánicos ni se deduce TDC a partir del diente faltante.
3. **Comando de inyector presente y corriente ausente.** El canal lógico continúa activo mientras la corriente de la carga virtual desaparece. El ejemplo no reproduce inyectores piezoeléctricos, GDI, rampas de corriente OEM ni tensiones reales de flyback.
4. **Caída local de alimentación y mando faltante.** La alimentación sintética cae a 8,2 V en coincidencia con una omisión del pulso de salida. La coincidencia temporal apoya una hipótesis *del modelo*, no demuestra causalidad universal en vehículos.

## Flujo formativo y rúbrica

- Se selecciona **hipótesis inicial antes de abrir el buffer**.
- El usuario abre y compara ventanas normales y anómalas, pudiendo seleccionar dos canales para observar en cada una.
- Para la corrección debe identificar la ventana del evento, la causa y **el par de señales que realmente visualizó tanto en una ventana normal como en la afectada**.
- Se registra una justificación de 100–3000 caracteres, pero **no se interpreta semánticamente**.
- Puntaje objetivo: 40 puntos por causa correcta, 25 por ventana, 25 por el par de evidencias realmente observado en ambas condiciones, 10 por haber documentado una explicación. La práctica solo cumple todos los criterios si se satisfacen las cuatro condiciones.
- La descarga Markdown incluye semilla reproducible, hipótesis previa, ventanas inspeccionadas, evidencias, diagnóstico final y explicación de referencia.
- Los resultados se añaden al historial existente y al Portafolio y sobreviven a respaldos JSON compatibles con esquema 1; no se almacenan falsas mediciones físicas.

## Contenido y progresión

Se incorporaron cinco lecciones y diez preguntas nuevas, balanceadas entre electricidad, inyección, osciloscopía, redes y BMS. Total de AutoLab: **46 lecciones, 120 preguntas y seis niveles**. La sexta etapa se llama *Señales y fallas intermitentes*.

## Referencias contextuales

- Pico: [Cam and crank correlation](https://www.picoauto.com/library/application-notes/cam-and-crank-correlation).
- Pico: [Guía de tensión de inyector multipunto](https://staging2026.picoauto.com/library/automotive-guided-tests/actuators/injector-%28gasoline%29/AGT-382-mpi-injector-voltage/).
- Kvaser: [CAN protocol tutorial](https://kvaser.com/can-protocol-tutorial/).
- HSE: [Electric and hybrid vehicles](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm).

Estos recursos apoyan conceptos generales, **no avalan las curvas o cifras sintéticas particulares de AutoLab**.

## Verificación y pendientes

Suite Node: modelo sobre 200 semillas, unicidad de ventana, anomalías selectivas, sincronización de canales, condición de comparación normal/anómala, necesidad de consultar ambos canales, exportación, itinerario, portafolio y recuperación JSON. Los módulos se precachean para uso offline tras una instalación actualizada.

Pendientes: QA real en Safari/iPhone, revisión profesional de contenidos, ensayos de compatibilidad tras actualización de service worker, pruebas de lector de pantalla, validación de capacidad para transferir el conocimiento al diagnóstico físico. Ninguna puntuación constituye certificación, habilitación HV ni evidencia de reparación real.
