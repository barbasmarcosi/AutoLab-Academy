# v1.9.10 — Integridad de la navegación offline

La escritura en Cache Storage se separa de la entrega HTTP. Si se lee una página HTML válida de la red, se entrega aunque cache.put falle (por ejemplo, por falta de cuota o permisos). El aviso del fallo de caché va a la consola, no a un falso error de red.

Solo las rutas iniciales de la PWA (raíz e index.html bajo el scope del worker) pueden actualizar el HTML offline. Un 404, un JSON, una navegación a otra aplicación o contenido no HTML no reemplazan la portada. Una verdadera caída de red devuelve el shell en caché si existe.

La instalación inicial sigue siendo atómica: si addAll no puede descargar todos los assets, la nueva versión no reemplaza a la anterior. El cambio no toca IndexedDB, respaldos JSON ni credenciales. Tests Node verifican cuota, JSON, ruta ajena y fallo de red; Playwright comprueba upgrade v31→v32 y apertura offline. Queda pendiente reproducción en Safari/iPhone físico y cuota física agotada.
