# v1.9.13 — Dependencias reproducibles y suministro controlado

## Hallazgo

El repositorio no tenía package-lock.json y ejecutaba npm install en la CI. Aunque las dependencias directas estaban versionadas, las transitivas podían cambiar de una ejecución a otra sin modificación en el código.

## Corrección

El lockfile npm v3 se generó con Node 22 en GitHub Actions desde el package.json existente y se incorporó al repositorio, registrando resoluciones transitivas e integridad SRI. El workflow efímero utilizado para generarlo se eliminó de la rama después de incorporar el archivo: no se incorpora ni despliega. El workflow oficial Pages ahora utiliza npm ci --no-audit --no-fund, que falla si el manifiesto y el lockfile no coinciden. Los tests comprueban nombres y versiones, dependencias directas, número mínimo de entradas y hashes SRI cuando existe registro de npm.

Esto reduce divergencias no documentadas; no equivale a auditoría de vulnerabilidades ni revisión de todo el código de cada dependencia, ni garantiza que un registro npm esté disponible para siempre. No añade servicios al navegador ni credenciales.

## Validación

Exigir CI de PR, prueba de SW v34→v35, y CI + Pages del merge. Para actualizar dependencias en el futuro, se debe actualizar conjuntamente package.json y package-lock.json, ejecutar npm ci y probar en Actions.
