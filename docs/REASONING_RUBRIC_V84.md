# AutoLab Academy — rúbrica de revisión humana v84

## Contrato pedagógico

Este módulo complementa las 32 investigaciones conceptuales v2, no sustituye la observación física ni acredita aptitud profesional. En el simulador digital se puntúan únicamente las tres decisiones objetivas y la transferencia contrafactual, además de verificar presencia formal de argumentos. La corrección automática **no comprende ni verifica** la justificación escrita.

## Criterios con anclajes 0–3

1. **Mecanismo causal y alternativas:** hipótesis refutable con mecanismo y alternativa que explica el mismo síntoma.
2. **Prueba discriminante:** diseño de prueba con condición, observable, predicciones de H1/H2 y referencia independiente.
3. **Falsación:** criterio explícito que obliga a revisar la hipótesis al aparecer evidencia incompatible.
4. **Procedencia e incertidumbre:** condiciones, unidades, instrumentos, restricciones, calibración y límites del modelo.
5. **Transferencia:** revisión o conservación de la hipótesis al presentarse datos diferentes sin repetir memorísticamente la solución.

Los cuatro niveles descriptivos de cada dimensión figuran en `src/lesson-transfer.js`. Se muestran en la devolución del alumno y se exportan en el expediente Markdown. El resultado de evaluación humana figura como **PENDIENTE**, nunca como nota asignada automáticamente.

## Evidencia y QA

- Identificadores y anclajes únicos, sin doble contabilización con los simuladores instrumentales.
- Reportes y respaldos locales v1 compatibles; no migración destructiva de IndexedDB.
- No se modifica la aprobación conceptual objetiva v2 ni los requisitos de práctica física.
- Verificación con tests unitarios de las cinco dimensiones y E2E que inspecciona la visibilidad y el informe persistido.
- Offline con service worker caché `autolab-academy-v84`.

## Deploy de prueba

La rama `feature/engineering-mindset-rd-vision` publica en el **proyecto independiente** Vercel `autolab-academy-rd-preview`. Cada commit tiene una URL de preview específica. El proyecto tiene protección SSO; autenticarse en Vercel cuando se requiera.

La aprobación de la CI del commit es un gate distinto de la finalización del build Vercel. Estado READY en Vercel no implica pruebas de navegador aprobadas. GitHub Pages producción se mantiene fuera de alcance hasta el merge explícito y posterior autorización.

## Pendientes para 10/10

62 lecciones sin casos objetivos propios; laboratorios instrumentales específicos aún ausentes en la mayor parte del currículo; revisiones supervisadas de argumentación; aceptación end-to-end y contraste con resultados físicos seguros. No inventar puntajes, resultados OEM ni aptitud HV.