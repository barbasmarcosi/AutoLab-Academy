# v1.9.2 — Investigaciones retomables

## Contrato

El borrador guarda solo semilla, índice y respuestas en el progreso IndexedDB. Los escenarios se reconstruyen de forma determinista. El respaldo JSON continúa usando schema 1 y acepta archivos antiguos sin borrador.

El saneamiento del borrador valida IDs de cada instrumento frente al caso reconstruido, deduplica observaciones, rechaza predicciones inventadas y limita extensiones del razonamiento.

## Experiencia

Si existe una sesión incompleta, el menú ofrece Retomar investigación guardada. Empezar otra requiere confirmar que se descartará el borrador. Pausar y salir permite volver luego. La finalización de los cinco casos guarda el portafolio y limpia el borrador.

Las selecciones e instrumentos se guardan inmediatamente; los textos se guardan con un debounce de 250 ms. Cerrar inmediatamente tras la última tecla puede perder esos últimos caracteres. Ningún borrador acredita una práctica real.

## QA

Unit tests verifican formato, filtrado de evidencias extrañas, semilla determinista y compatibilidad con JSON anterior. Test E2E Chromium verifica recarga, navegación, pausa, backup y restauración. Pendientes Safari/iPhone y estrés prolongado.