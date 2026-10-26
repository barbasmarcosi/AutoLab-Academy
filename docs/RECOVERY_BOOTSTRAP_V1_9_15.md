# v1.9.15 — Recuperación de arranque cuando IndexedDB está corrupto

## Bloqueo corregido

Antes, si `loadProgress()` rechazaba un registro incompatible o un error de apertura, AutoLab mostraba solo un mensaje de error y no tenía una vía para restaurar un respaldo propio. Esto obligaba al alumno a intentar reparar IndexedDB por fuera de la PWA o borrar los datos del sitio, con peligro de pérdida irreparable.

La pantalla de error ahora ofrece **recuperación mediante JSON**, reaprovechando el mismo lector, límites de 24 MB, `parseBackup` con validación fail-closed y escritura FIFO de IndexedDB ya existentes. Requiere una confirmación explícita de reemplazo; nunca purga la base automáticamente. Solo reinicia la aplicación tras la transacción duradera de escritura. Si el navegador impide acceder a IndexedDB, el proceso falla claramente y la pantalla permanece disponible. Si el alumno no posee respaldo, se le aconseja no borrar la base.

## Evidencias automatizadas

Playwright induce un registro de progreso con schema 99, comprueba bloqueo inicial sin reset ni escritura accidental, restaura un respaldo válido confirmado, verifica notas reabriendo IndexedDB y recargando, y controla rechazo de JSON incompatible y de `QuotaExceededError` durante la recuperación. No equivale a recuperación forense de una base físicamente dañada ni restaura un respaldo que nunca se generó. Esquema de respaldos 1 sin modificaciones; SW v36→v37.
