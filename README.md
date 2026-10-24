# AutoLab Academy

**PWA de entrenamiento en electrónica y diagnóstico automotriz, híbridos y eléctricos.**

Primera versión funcional: módulos de lectura, exámenes corregidos con explicaciones y fuentes, escenarios deterministas de diagnóstico, repaso, notas y respaldo/exportación del progreso.

## Probar en local

Node 20+ (sin dependencias de npm):

\`\`\`bash
npm test
npm run build
python3 -m http.server 8080
\`\`\`

Abrir http://localhost:8080/ (service worker solamente en HTTPS o localhost). Evitar abrir index.html como archivo file://, porque los módulos y IndexedDB requieren origen web.

## GitHub Pages

El sitio se publica mediante .github/workflows/pages.yml en cada push a main que supera los tests.
Configurar **Settings → Pages → Source: GitHub Actions**. El workflow no usa secretos de despliegue.
https://barbasmarcosi.github.io/AutoLab-Academy/

## Datos

Se almacena el progreso en IndexedDB local. **No existe sincronización automática ni backup remoto.** Desde "Mis datos" exportá el JSON y guardalo en un lugar seguro. La importación reemplaza el progreso actual luego de pedir confirmación. No introducir datos sensibles de clientes.

## Limitaciones

- 30 preguntas introductorias, 6 lecciones, 3 casos sintéticos.
- Repaso con intervalos simples (FSRS se evaluará para fases siguientes).
- No hay CircuitJS, SocketCAN ni PyBaMM embebidos: enlaces a recursos externos.
- No hay autenticación, IA ni conexión a vehículos.
- El diseño web estático es una decisión deliberada de arranque; React/TypeScript, Dexie y test E2E quedan para evolución posterior.
- Ningún resultado equivale a habilitación o certificación para intervenciones en alta tensión.

Ver [roadmap](docs/ROADMAP.md).
