# Lesson 01 — Acceptance and independent learner review
**Stage:** 8.5/10 provisional, **NOT accepted**. Only move to lesson 02 after a documented reviewer score of at least 9/10, zero critical failures and exact-commit CI.

## Scientific and engineering gates
- Independently verify Ohm/Kirchhoff equations for positive-dominant, return-dominant, and balanced synthetic cases; check signed voltage for A/B/D/E relative to E, and the opposite-lead sign.
- Validate the 1.25 ratio as a **didactic** relative criterion, never an OEM pass/fail threshold. An open circuit lacks unique node potentials without extra constraints.
- Confirm hypothesis and first probe freeze before any readings, load voltage not readable before predicting, correction of an initial mistaken hypothesis not punished, falsifiers genuinely tied to the final chosen hypothesis.
- Keep baseline ungraded and unpersisted, guided retries formative, independent transfer and written explanation separate, and all v1/v2/v3 historical evidence accurately versioned.
- Validate keyboard-only navigation, 375px viewport, screen-reader announcements, zero critical WCAG violations, offline mode, backup/export/import and no unintentional horizontal scroll.
- No inference of physical competence or high-voltage work authorization from any simulated result.

## Novice observations — NOT YET PERFORMED
An independent observer should watch three or more novices without prior voltage-drop training. Without coaching, ask each to (a) explain voltage/reference/current in their own words, (b) predict a reversed lead sign, (c) select two probes and predict their values, (d) compare positive/return drops from a *new* synthetic circuit, (e) identify a falsifying observation, (f) explain why a battery at rest does not exclude resistive loss. Record missing terms, wrong inferences, hints requested and self-corrections. Repeat a method-transfer question after 24–72 hours. Collect no identifying information.

## Review rubric — 10 possible points
| Area | Weight |
|---|---:|
| Correct science, units, scope and sign | 2.0 |
| Novice prerequisites, scaffolding and worked problems | 2.0 |
| Manipulable, causal practice and before/after predictions | 1.5 |
| Independent diagnostic transfer and falsification | 1.5 |
| Accessibility, responsive, offline behavior | 1.5 |
| Evidence semantics, recovery, versioning, CI | 1.5 |

Do not invent achieved scores, test participants, or competence claims. A software design score is not empirical learning effectiveness. A full automated test suite is necessary for this release hito but does not itself award 9/10.

## Exact-commit reproducibility
- Push the intended HEAD with `<!-- [FULL_E2E_MILESTONE] -->` temporarily present in PR description.
- GitHub Actions verifies unit, build, focused Chromium and complete Chromium/WebKit/mobile WebKit; PR cannot deploy Pages.
- Remove the marker once the run has started; keep later PR updates fast. Use GitHub Pages via Actions only for deployment, with separate full-suite approval.

## Nine-case independent transfer (2026-10-28)
Three scenarios are no longer sufficient to discourage memorization. The independent holdout now contains nine distinct DC resistor configurations, cycling balanced/positive/return classifications and preserving original case identifiers for existing offline evidence. Each classifier is computed from physical readings, not case names. Empty numeric predictions and duplicate instrument clicks are rejected. Nine-case properties are tested, but actual novice transfer remains unobserved.
