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
