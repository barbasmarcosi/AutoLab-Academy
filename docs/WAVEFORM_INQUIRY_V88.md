# AutoLab Academy v88 — oscilloscope labs inside four lessons

## Goal

Bridge **theory → causal prediction → withheld synthetic waveform → evaluation of discriminating evidence**. The pupil must pick a model condition, an explicit hypothesis, a numeric prediction and a falsifying observation, with written rationale and limitations **before** the visual waveform appears.

This is an instrument-*literacy* exercise. Generated waveforms are **not an actual probe, calibrated measurement, verified OEM signal, engine diagnosis, CAN decoder, physical safety test, or certification**.

## Four integrated models

| Lesson | Model reused | User-adjusted parameter | Predicted quantity | Model mechanics |
| --- | --- | --- | --- | --- |
| `scope` | `generateWaveform('sine')` | Timebase factor ×0.5/1/2 | 400/200/100 Hz | (f=1/T); voltage amplitude unchanged |
| `pwm-scope` | `generateWaveform('pwm')` | High time 2/4/6 ms with period 8 ms | 25/50/75 % duty | Voltage toggles 0↔5 V; period held fixed |
| `ckp-cmp` | `generateWaveform('ckp')` | Revolution window 80/100/120 ms | 750/600/500 rpm | (RPM=60{,}000/T_{ms}), fictitious 60-2 reference wheel; no modeled CMP correlation |
| `physical-can` | `generateWaveform('can')` | Differential dominant 1/2/3 V | 1/2/3 V | Recessive: both 2.5 V; dominant: 2.5±Δ/2; fixed synthetic bit sequence |

The original waveform library is reused rather than introducing duplicate waveform-generation engines. A transformed trace is plotted using inline, accessibility-labeled SVG, and hidden until decisions are frozen. Its representation is deterministic and bounded. The report states the formula, model provenance and uncertainty explicitly.

## Assessment

- A numeric prediction is marked compatible within **max(0.05 units, 2.5% of the expected value)**.
- Hypothesis and falsifier decisions are checked against a declared **model answer**, not against a real physical diagnosis.
- Structured score: prediction 40, hypothesis 25, falsification 25, formal explanation/limits 10. Passing requires **all three objective decisions**; prose length is checked, semantics are **not graded**.
- Each investigation has its own evidence ID: `lab-scope-waveform-v1`, `lab-pwm-waveform-v1`, `lab-ckp-waveform-v1`, `lab-can-differential-waveform-v1`.
- Saves through existing IndexedDB/JSON schema; reload and backup remain compatible, and earlier evidence is not migrated or rewritten.

## Safety and limits

Do not connect a generator, ground-referenced oscilloscope, bus transmitter or meter to arbitrary vehicle nodes based on these demonstrations. CKP timing is a **simplified mathematical revolution period**, not a validated real wheel identification; no actual CMP synchronization is simulated. Differential CAN models are schematic voltage examples and cannot establish network health. All simulated parameters are pedagogical, not manufacturer limits.

## Implementation and quality

- `src/waveform-inquiry.js`: deterministic transformations, calculation, scoring, report, SVG plot and lesson-mounted UI.
- `src/lesson-practice.js`, `src/app.js`: dedicated embedded lesson bridges.
- `tests/waveform-inquiry.test.js`: independent parameter/result invariants, uniqueness, scoring and input boundaries.
- `tests/e2e/waveform-inquiry.spec.js`: four lessons × Chromium/WebKit, no early graph, explicit freeze, separate evidence, backup/reload, failed prediction and reattempt.
- Offline service worker `autolab-academy-v88` precaches the module.
- PR #52 remains **Draft**, Vercel `autolab-academy-rd-preview` is **preview-only**, GitHub Pages production is not deployed.

Coverage after this increment: **94** theory lessons, **94** ungraded inquiry notebooks, **36** objective causal/transfer cases, **14** embedded labs (4 previous, 6 numeric and 4 waveform), **12** linked-only labs, **68** lessons without either embedded or linked lab. This does not represent complete scientific or physical proficiency.
