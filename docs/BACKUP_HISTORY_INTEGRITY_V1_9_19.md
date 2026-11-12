# v1.9.19 — Integridad de historiales ante respaldos parciales

## Hallazgo P1: pérdida silenciosa de registros

`validateBackup` se utiliza tanto al importar un respaldo JSON como **antes de cada guardado local** y al abrir IndexedDB. Su implementación filtraba silenciosamente intentos de examen con porcentajes incompatibles y expedientes con puntajes incompatibles. Así, un respaldo parcialmente dañado podía anunciar restauración correcta después de perder expedientes; y abrir una base dañada podía devolver una copia recortada que el siguiente guardado sobrescribiera definitivamente.

## Mitigación

- Si **cualquier** intento o expediente tiene una estructura base inválida (ID/tópico o porcentaje para exámenes; ID o puntaje para expedientes), se rechaza el conjunto **antes** de construir una copia saneada. No hay restauración parcial silenciosa.
- La pantalla de recuperación existente se utiliza cuando IndexedDB contiene esos registros: no se elimina la base ni se crea un historial vacío.
- Un archivo de importación rechazado no llega al diálogo de reemplazo ni escribe IndexedDB; el progreso anterior permanece disponible.
- Los respaldos válidos y el formato JSON esquema 1 no cambian. La sanitización de detalles opcionales y límites de tamaño continúa como antes.

## Evidencia automatizada

- Unitarios: mezcla de exámenes/expedientes válidos e inválidos; rechazo al validar, exportar e importar; aceptación del subconjunto válido solo tras corregirlo explícitamente.
- Playwright Chromium/WebKit/WebKit móvil: importación mixta no reemplaza datos existentes y base corrupta abre la recuperación explícita.
- Exigir CI completa del PR antes de integrar; Pages **solo** después de merge en `main` y job `deploy` exitoso.

## Límites

No se recupera automáticamente el contenido dañado: el usuario debe aportar un respaldo compatible o una reparación supervisada. Persisten sanitizaciones explícitas de campos secundarios, límites de cantidad y ausencia de cifrado/sincronización; no se atribuye validación física, OEM ni profesional.
