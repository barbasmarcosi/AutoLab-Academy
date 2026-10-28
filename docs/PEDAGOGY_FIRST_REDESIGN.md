# Pedagogy-first redesign — acceptance contract

## Non-negotiable sequence per lesson
1. Prerequisites and diagnostic baseline; link missing foundations.
2. Clear learning objectives, glossary, physical mechanism, diagrams and units.
3. Fully worked numerical/diagnostic example with reasoning and instrument placement.
4. Guided sandbox: change variables, observe, compare predictions.
5. Immediate formative checks: selected answer, correct answer, explanation of why every distractor fails, and retry.
6. Independent diagnostic case: symptoms, known/unknown evidence, H1/H2, safe discriminating measurement, predicted outcomes, falsifier and uncertainty.
7. Separate scores for conceptual knowledge, guided practice, independent transfer; never infer physical competency from simulation.
8. Source and safety caveats; actionable next lesson.

## Milestones
P0: finish theory before practice (first commit); repair feedback and answer disclosure; never present text length as reasoning competence.
P1: rebuild introductory electricity/voltage-drop lesson as gold-standard vertical slice, including runnable variable-control simulator, worked examples, test fixtures and accessibility.
P2: rebuild next two lessons using identical pedagogy and verify prerequisites/order (MC00/MC01 before advanced diagnosis).
P3: migrate remaining curriculum in prerequisite order, reusing existing simulation engines; do not count generic worksheets as hands-on labs.
P4: usability/learning validation with novice personas and independent hold-out cases; CI checks for content completeness and teaching quality.

## Mandatory per-lesson critical gate
- Science: units, assumptions, instrumentation, safety and falsifiable predictions reviewed.
- Clarity: a true novice can explain each new term using only preceding content.
- Coherence: every question follows the required instruction and a worked example.
- Feedback: incorrect AND correct options receive specific immediate explanations; answer revealed at appropriate stage.
- Practice: genuine manipulable/observable activity, or explicitly labelled non-instrumental exercise.
- Transfer: genuinely new data and independent scenario; no copied answer cues.
- Assessment: open text not automatically marked correct on character count; score semantics truthful.
- UX/accessibility: keyboard, mobile, offline and screen-reader smoke tests.
- Verification: unit, integration, E2E, and evidence. Record unresolved issues and rating (0–10); do not mark a lesson complete below 9/10 or with any critical failure.

## Status
Lesson 1: **NOT ACCEPTED, provisional 8.5/10** (reviewed 2026-10-28; not a measured learner outcome). Changes:
- Full DC foundations, technical reference and two contrasting worked examples (12 V ideal models).
- Diagram with labelled terminals and moving voltage-probe marks; explicitly predict and measure two tramos.
- Simulated low-voltage experiment with parameter manipulation, reset-on-change and objective prediction tolerance (±0.15 V).
- Immediate correct/incorrect feedback with choice, expected answer and causal explanation.
- Three reserved synthetic scenarios (similar losses, positive-dominant, return-dominant) with no answer shown by the interface before submission.
- Pre-measurement initial hypothesis, declared confidence, compatible predicted pattern and first discriminating probe frozen before any reading. The uncertainty option is valid when data are insufficient.
- Measurements and final diagnosis can support, revise or contradict the initial position; changing a wrong prior is not penalized.
- Immutable objective decision snapshot plus ordered virtual readings, timestamps, final explanation, falsifier and human-review pending status persist in exported evidence. This timing is client-reported, not tamper-proof proctoring.
- A 1.25× ratio is the **didactic** threshold for a dominant drop, not an OEM acceptability or repair threshold.
- Falsification is scored **against the student's chosen final hypothesis**, not against the hidden fault key. Each of the three hypotheses has different contradictory/supporting observations, with distinct correct answer positions; changing the final hypothesis clears the prior falsifier choice.
- On reopening the PWA, the next independent case is selected using the latest retained v2 case result (balanced → positive → return → balanced). Malformed/old rubric entries do not steer rotation. This reduces repetition, but is **not** a secure anti-cheating mechanism or a guarantee of unseen material.
- Reading, guided practice, independent holdout and conceptual transfer counted separately.
- Tests: pure scientific model, held-out scenarios, evidence semantics, offline cache, and Chromium/WebKit E2E.

**Critical findings and gate blockers**:
1. GitHub Actions run 40640521960 passed unit/build, Chromium/WebKit/mobile focused smoke and complete E2E on the prior SHA 6bdb646. A **new run is mandatory on the latest freeze-hypothesis implementation**; do not carry forward the earlier green status.
2. Novice comprehension/user-testing has NOT been performed; no claim of 9/10 without it.
3. The structured hypothesis/transfer case now records the student's evidence-based justification, but **does not** semantically grade its correctness. The broader conceptual transfer engine now grades only four objective decisions; 60 + 40 points, with no score for text length. Explanation and caveats are required as documented, ungraded evidence; human review remains pending. Genuine evidence-based explanation requires human review or an independently validated rubric.
4. Guided practice allows formative retries; its 100/100 is not independent mastery and must never be sold as such.
5. In the reserved case, a successful retry is evidence of a successful attempt, not first-try competence. The earliest **retained** attempt can be inspected; the capped 500-entry progress log cannot certify a lifetime first-attempt rate.

**Next critical review**: run all automated checks on the exact final SHA; watch a novice complete the lesson without assistance; compare confidence, prior and final inference without penalizing revision; inspect independent reasoning on unseen numbers; check keyboard, 375px mobile viewport, screen reader announcements, offline study, and backup round-trip. The current offline PWA keeps scenarios and answers in downloadable JS: "blind" means hidden by the exercise UI, not cryptographically secret or suitable for proctored certification. Certify only after all gates and scores ≥9/10.

Lessons 2–94: NOT AUDITED under new rubric. Existing implementation does not imply completion.
Do not merge or deploy production before independent review.


## Execution update — 2026-10-28
- At initial commit `9f161591`, the GitHub Actions `verify` job completed successfully with full E2E; the `deploy` job was correctly skipped on a PR. Vercel's separate build-rate-limit status does not indicate a GitHub Actions test failure.
- To reduce PR turnaround, every PR runs static/unit, site build, and a focused Chromium E2E. Full Chromium, WebKit, mobile WebKit E2E runs on a main push or explicitly on `workflow_dispatch` with `full_suite=true`. Dispatch on this feature branch can deploy via GitHub Pages without Vercel.
- A green focused check is NOT equivalent to a green full cross-browser release milestone.
- Automated 100/100 scores in the general reasoning engine now represent only objective decisions; explanations and caveats remain under human review. Historical v2 results used an earlier scoring rule: v3 records have distinct IDs/model keys and old v1/v2 attempts remain visible as legacy, never satisfying new v3 progress.
- Lesson 1 is still **8.5/10 provisional / NOT ACCEPTED** pending novice comprehension, real keyboard/mobile/offline acceptance and a milestone check on the current commit. Lessons 2–94 are unapproved. Never invent learner-validated scores.


## Evidence migration: v3 and first-lesson progression
- General transfer model/id advanced to `autolab-reasoning-transfer-v3` / `lab-reasoning-{lessonId}-v3`. Old v1/v2 attempts remain visible, but cannot complete the new rubric. Portfolio explicitly distinguishes prior v2 and current v3.
- `volt-drop` requires reading, embedded guided bank, and its dedicated independent `lab-volt-drop-holdout-v2` only. It must NOT additionally require generic reasoning transfer that its lesson UI does not mount.
- v3 transfer is a record of **objective choices**, not a certification that free-text causal reasoning is correct.


## Independent-case numeric leakage closed
- The lesson-1 independent holdout no longer exposes a load-voltage probe before submitting the numerical load prediction. Only two conductor measurements, under the same load, may be submitted to its grading function. A third direct probe or a duplicated probe fails closed.
- The load-voltage model value is revealed after submission for corrective feedback. The learner must compute it as source minus the two observed conductor drops; tests explicitly reject direct answer disclosure in the assessment UI and grader.


## CI coverage guard
- The focused Chromium gate includes not only the lesson-1 holdout/offline flows but representative MC06/MC14/MOSFET conceptual transfers and progression/legacy evidence tests, guarding the v3 scoring migration at browser level.
- Publishing to the existing GitHub Pages environment on manual feature-branch dispatch requires explicit `full_suite=true`. The default quick manual validation does not silently overwrite production.

## 2026-10-28: reference and signed-voltage literacy
- Added explicit closed-loop A/B/D/E potentials relative to E, positive/negative voltmeter polarity and the distinction from unsigned magnitude in the guided simulation. Clarified that the open-circuit node model is underdetermined.
- Added deterministic metamorphic tests over multiple positive/return resistances checking all node drops, sign reversal and Kirchhoff closure.
- Clarified that the generic conceptual transfer in lesson 1 is optional; its dedicated independent holdout is the actual progression gate.

## 2026-10-28: initial diagnostic
- Three pre-reading questions about potential reference, zero-current drop and correct two-probe placement are ungraded, unpersisted and specifically remediated. The interaction freezes only once per view and never increases mastery or progress.
- This is automated pedagogical scaffolding, not observed validation with real novices; evidence gate and 8.5/10 provisional status remain.

## Full cross-browser milestone on a PR SHA
- Normal PR CI: unit/static/build plus focused Chromium. A milestone explicitly sets `<!-- [FULL_E2E_MILESTONE] -->` in the PR body before pushing; this runs the full Chromium/WebKit/mobile WebKit suite ONCE. Remove the marker once started.
- PR events NEVER upload or deploy Pages, including the full-suite milestone. Publishing needs a separate GitHub Pages Actions run with `full_suite=true`.
- Automated testing cannot substitute for actual beginner comprehension and human evaluation of written reasoning.

## Lesson 02 — synthetic DTC guided practice in progress
- Three fictional P0171 symptom cases. Every practice starts with a frozen hypothesis and first test, then observes four targeted independent synthetic results. The final diagnosis and a hypothesis-relative falsifier are objectively scored; free-text remains ungraded for human review. No OEM thresholds or physical procedures are implied.
- Integrated guided practice is distinct from the already-existing conceptual challenge and independent transfer. Lesson 02 is NOT yet certified >=9/10.

## Lesson 02 automatic quality gates
- Corrected 94-lesson evidence-coverage test to 23 embedded labs after mapping `motor-data` (35 total mapped), with the new practice ID explicitly isolated from generic reasoning/exam IDs.
- Focused Chromium CI now runs the second lesson's E2E for freezing the prior, enforcing the first test, collecting four observations and persisting a qualified synthetic result.
