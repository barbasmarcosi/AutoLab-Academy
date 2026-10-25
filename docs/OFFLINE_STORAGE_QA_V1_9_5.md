# AutoLab Academy v1.9.5 — migración offline y errores de escritura

## Qué se verifica

- Persistencia IndexedDB con transacciones de escritura FIFO para impedir que la última solicitud confirmada quede reemplazada por otra anterior.
- Un error en una transacción no bloquea las posteriores. La aplicación muestra el fallo y aconseja exportar un JSON, en lugar de confirmar un guardado inexistente.
- Playwright simula QuotaExceededError en IDBObjectStore.put, comprueba mensaje visible, que el último texto fallido no está en base y que una nueva escritura posterior sí se conserva.
- Prueba integrada de migración **real del service worker anterior** (copia de v26 en tests/fixtures) al worker actual (v27) dentro de un navegador y scope /AutoLab-Academy/. Valida caché nueva, limpieza de caché vieja, supervivencia IndexedDB, apertura de inicio y navegación de estudio completamente offline.
- Se ejecuta Chromium desktop, WebKit desktop y emulación de dispositivo iPhone 13 con WebKit. Esto último valida viewport/touch del emulador **pero no sustituye Safari en iPhone físico ni VoiceOver**.
- Los scripts HTML/SW de instalación previa para el ensayo se crean únicamente en la carpeta temporal site durante la prueba y se eliminan en finally; no se incorporan al artifact público.

## Límites

- QuotaExceededError se inyecta artificialmente por navegador; aún falta probar un sistema real sin espacio físico, cierre inesperado y un conjunto de hardware Safari/iOS.
- IndexedDB sigue siendo almacenamiento local. Desinstalar la PWA o borrar datos del sitio puede eliminarlo. Exportar JSON periódicamente sigue siendo imprescindible.
- Los contenidos son sintéticos y no se usan como especificaciones OEM, diagnósticos reales ni certificación.
