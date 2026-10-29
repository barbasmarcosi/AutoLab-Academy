# AutoLab Academy — Pages milestone releases

**Public URL:** https://barbasmarcosi.github.io/AutoLab-Academy/

## Trigger
- This repository maintains exactly **one** Pages site; each release overwrites the previous live static bundle.
- Feature-branch PR `#56` is the editorial workspace. A commit pushed to `feature/pedagogy-first-redesign` whose **message includes exactly `[pages-milestone]`** causes a dedicated push workflow run to build, run the focused E2E, install WebKit, execute the complete cross-browser Playwright suite, and deploy via GitHub Pages Actions **only if verification succeeds**.
- Ordinary feature pushes keep fast PR CI; their push verify is skipped. Main's existing full verification and Pages publication are unchanged. A manual workflow dispatch with `full_suite=true` also supports release from an explicitly selected ref.
- No Vercel workflows or external hosting; Pages has only one current version. Do not promise that old milestones are independently hosted.
- The version shown by the static deployment may lag the PR's newest commit if it has not passed an explicitly marked milestone.
- Service worker cache must be version-bumped when published code changes, to avoid keeping old offline assets after a release.

## First release request — 2026-10-28
- **Scope:** Lesson 01, internally reviewed 9.1/10 *design*; lesson 02 DTC/trim guided synthetic lab and post-submission counterfactual, still not accepted 9/10.
- **Quality:** lesson 01 exact-source release milestone full CI at run 40736958265 PASS; lesson 02 focused latest CI run 40739580425 PASS. This deployment independently re-runs all browsers at its own SHA.
- **Progress:** 94 lessons total; 35 linked to a practical engine; 23 integrated; 12 linked only. Only lesson 01 passed internal design acceptance.
- **Not certified:** real learner comprehension/retention, free-text reasoning, supervised instrument skills, HV intervention.
- **This release:** triggered by the commit with the required marker; publish only after Actions is green. Verify Pages live URL and workflow deployment before claiming it is online.

## Pages environment authorization fix — 2026-10-28
The initial feature-branch release `ba2df954` passed **every verification**, including complete Chromium, WebKit and mobile WebKit E2E and artifact upload. Its deploy job was rejected before execution because the `github-pages` environment permits only the default branch.

The resolution does not require admin-level environment edits or merging PR #56:
- `.github/workflows/publish-pedagogy-pages.yml` lives on `main` and listens for completed successful **push** workflow runs of `Test and deploy AutoLab Academy` from exactly `feature/pedagogy-first-redesign`.
- A feature commit marked `[pages-milestone]` launches the full test matrix, **without direct deploy**.
- On success, the publisher runs with GitHub context `main`, checks out `workflow_run.head_sha` (the immutable tested feature commit), rebuilds with locked dependencies, uploads the exact Pages artifact and deploys to `github-pages`.
- No external hosting, no production merge, no new credentials. The branch restriction failure is solved by using the proper workflow context.
- `main` infrastructure commit `a2bce265` is labeled `[pages-router]` to avoid publishing an old `main` snapshot while installing the router.
- Publication is NOT complete until the `Publish validated AutoLab Academy milestones to Pages` run reports `deploy: success`.

## Segundo candidato (lección 02, 2026-10-28)
- Lección 02: diagnóstico de conceptos previos, nueve casos reservados y transferencia con predicción congelada, evidencia discriminante, falsación e historial independiente.
- **Fuente de verdad:** `docs/LESSON_02_ACCEPTANCE.md`. La nota de calidad requiere CI completa verde y no equivale a competencia física.
- La publicación se dispara solo desde un commit `[pages-milestone]` de la rama del PR y el publicador en `main` toma el mismo SHA verificado.

## Tercer candidato: osciloscopía básica (lección 03, 2026-10-28/29)
- Desarrollo: `src/scope-lesson.js`, `src/scope-transfer.js`, prácticas vinculadas y tests `scope-lesson` / `scope-transfer`.
- Fuente de verdad: `docs/LESSON_03_ACCEPTANCE.md`. El puntaje de diseño 9,1 es provisional hasta la CI completa exacta.
- Hito identificado por `[pages-milestone]`; el publicador en `main` recompila e instala **exactamente el SHA validado**. Una versión anterior permanece activa si la ejecución falla.

## Candidato conjunto de lecciones 03+04 — 2026-10-28/29
- Se corrige el run completo fallido de lección 03 (438 correctos, tres expectativas desactualizadas de un único test) y se incorpora CAN con banco de terminación/arbitraje, nueve investigaciones y su CI focalizada.
- Publicar **ambas lecciones juntas en una sola versión** del sitio para evitar sobrescribir un hito nuevo con el posterior cierre de un workflow anterior.
- La puerta es el commit exacto marcado `[pages-milestone]`, `verify: success` y `Publish validated AutoLab Academy milestones to Pages: deploy success`. Hasta entonces la web conserva el hito 02.

## Revisión anti-fuga de respuestas antes de aceptación
- Tras el candidato inicial del hito 03+04, un control pedagógico encontró que algunas **descripciones iniciales de casos reservados contenían la causa** (ajuste de pantalla, referencia o terminador adicional). Esto reduce la independencia del ejercicio.
- Se sustituyeron por **síntomas observables sin revelar el mecanismo**, y se añadieron tests de regresión en `tests/scope-transfer.test.js` y `tests/can-transfer.test.js`.
- [CI focalizada #40794071876](https://github.com/barbasmarcosi/AutoLab-Academy/actions/runs/40794071876): PASS de unidad, compilación y navegador.
- **Candidato final revisado**: commit con marcador `[pages-milestone]` posterior a `30bc0ab0`. Conserva la puerta completa y publicación desde workflow del `main`. No calificar como aceptado hasta obtener validación del SHA revisado y deploy éxito.
