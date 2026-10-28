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
Lesson 1: NOT ACCEPTED. Theory-order defect repaired as preliminary infrastructure change only. No lesson certified.
Lessons 2–94: NOT AUDITED under new rubric. Existing implementation does not imply completion.
Do not merge or deploy production before independent review.
