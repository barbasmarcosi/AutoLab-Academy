# v1.9.16 — Endurecimiento de la cadena de suministro

Los workflows de Pages y ciencia ya no dependen de etiquetas móviles `@v4`/`@v5`: todas sus acciones están fijadas a commits de 40 caracteres recuperados de los refs públicos de GitHub. Dependabot propone actualizaciones semanales de npm y de acciones como pull requests sujetos a CI y revisión; no hay automerge ni despliegues automáticos por Dependabot.

El job `verify` agrega `npm audit --audit-level=high`, bloqueando vulnerabilidades reportadas altas o críticas tanto en dependencias de producción como de desarrollo. Esto depende de la base de datos de advisories de npm y de la disponibilidad de la red de CI, no equivale a ausencia completa de vulnerabilidades, un análisis SAST, o revisión de todo el código upstream.

Los tests comprueban refs inmutables de GitHub Actions, ejecución de npm ci y npm audit, y la política de actualizaciones. Lockfile versionado y SW v37→v38. Validar sobre PR y después sobre main/Pages antes de declararlo publicado.
