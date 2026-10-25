# v1.9.4 — Durabilidad y respaldo confiables

## Corrección de capacidad

La PWA conserva hasta 500 expedientes, cuyos informes pueden ocupar hasta 10.000 caracteres cada uno. El límite anterior de 2.000.000 de caracteres para todos los datos impedía guardar un historial considerablemente menor a ese máximo y también impedía importarlo.

Se implementan tres límites: 12 millones de caracteres por payload validado, 16 millones de caracteres por documento JSON importado y 24 MB para archivo importado desde la UI. Siguen vigentes los límites de número de registros, tamaño individual y sanitización de respuestas. No hay migración de IndexedDB ni del schema de respaldos.

El respaldo JSON no está cifrado. Debe conservarse en ubicación privada; no equivale a sincronización ni a recuperación automática en otro dispositivo.

## Confirmación de escritura

El botón Guardar borrador espera a que la transacción IndexedDB termine antes de mostrar confirmación. Si falla, emite error y no anuncia éxito. El botón Borrar progreso local tampoco anuncia éxito tras una escritura fallida. Los campos se guardan además al perder el foco; el autosave diferido permanece como mecanismo auxiliar.

## Verificación

Prueba unitaria con 500 informes detallados y JSON que supera 2 MB, y rechazo de payload excesivo. Playwright verifica guardar manualmente y retomar después de recargar. Sigue pendiente prueba de fallos reales de cuota y Safari/iPhone.