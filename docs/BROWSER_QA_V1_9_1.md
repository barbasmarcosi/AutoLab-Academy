# v1.9.1 — Pruebas reales de navegador para la PWA

## Cobertura automatizada

- Playwright en Chromium ejecuta el mismo bundle de esbuild que se despliega en Pages.
- El servidor de pruebas utiliza el subpath /AutoLab-Academy/ para validar manifest, recursos relativos y scope del service worker.
- Cinco investigaciones reales de UI: hipótesis, selección de cada prueba segura, pronóstico, revelado, conclusión, justificación y resultado.
- Se validan quince registros de procedencia en Markdown, cinco expedientes en IndexedDB, recarga de la página, respaldo JSON, reinicio y restauración.
- Una importación inválida no reemplaza el progreso. El service worker se instala y permite navegar a una práctica sin red.
- Los tests corren en PR y en main, y deben pasar antes de publicar. Los fallos dejan trazas y capturas como artefactos de Actions.

## Reproducir

npm install
npm run build
npm run build:site
npx playwright install chromium
npm run test:e2e

En CI se instalan también las bibliotecas de Chromium con --with-deps.

## Límites explícitos

- Solo cubre Chromium desktop automatizado, no Safari/iPhone ni VoiceOver en un teléfono real.
- La comprobación offline valida instalación y uso con la app precargada; la actualización entre versiones distintas aún no se prueba.
- Los escenarios no realizan mediciones físicas ni usan valores OEM. La revisión de contenido por expertos sigue pendiente.
- El avance de una sesión parcial no se persiste hasta terminar las cinco investigaciones: se pierde si el usuario recarga antes.
- El respaldo JSON es manual y no cifrado. IndexedDB no sustituye una copia segura externa.