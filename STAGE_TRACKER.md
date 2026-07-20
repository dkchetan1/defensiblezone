# Stage Tracker

Tracks progress on the Employer Edition engine consolidation effort. Updated after each verified step.

## Stage 2 — Engine consolidation

- [x] Step 1: Live-repo investigation, corrected several assumptions from an earlier pass (2026-07-19)
- [x] Step 2: Config schema drafted for EmployerEngine.jsx, pending live-file sanity-check (2026-07-19)
- [x] Step 3: Schema sanity-check against live files — Intake/Step/Affinity/phaseModel confirmed; clearOnParentChange not universal (Finance sector deps) (2026-07-19). Schema now committed at docs/employer_engine_schema.md.
- [x] Step 4a: EmployerEngine.jsx state/navigation shell — config-driven steps, intake deps (clear + prune), pre-gate localStorage save (`7cbd6ec` / `f6896a1`, 2026-07-20)
- [x] Step 4b: Shared prompt-builder + fetchLandscapeAndSkills / fetchScores / fetchRecommendations; phaseModel branching; post-score localStorage save (`15f3034`, 2026-07-20)
- [x] Step 4c: Schema escape hatches — customTaskTemplate, extensions, scoring.responseShape, phaseDefinition.blurbs; wired in EmployerEngine.jsx (2026-07-20; commit pending)
- [x] Step 4c follow-up: customTaskTemplate {{placeholder}} substitution (profileSummary / skillsList / fluencyData / affinityData / resumeText) (2026-07-20; commit pending)
- [ ] Step 5: Migrate Engineer — write EngineerConfig
- [ ] Step 6: Migrate Engineer — swap live route to render through EmployerEngine
- [ ] Step 7: Migrate Engineer — verify byte-for-byte against current live behavior
- [ ] Step 8: Migrate Sales (config + swap + verify)
- [ ] Step 9: Migrate Finance (config + swap + verify)
- [ ] Step 10: Migrate PM (config + swap + verify — includes intentional fix of missing post-score localStorage save)
- [ ] Step 11: Migrate UX (config + swap + verify)
- [ ] Step 12: Final cross-check — confirm all five Employer*.jsx files are thin config+wrapper files, confirm no B2C files were touched, update ARCHITECTURE.md
