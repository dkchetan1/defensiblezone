# Stage Tracker

Tracks progress on the Employer Edition engine consolidation effort. Updated after each verified step.

## Stage 2 — Engine consolidation

- [x] Step 1: Live-repo investigation, corrected several assumptions from an earlier pass (2026-07-19)
- [x] Step 2: Config schema drafted for EmployerEngine.jsx, pending live-file sanity-check (2026-07-19)
- [x] Step 3: Schema sanity-check against live files — Intake/Step/Affinity/phaseModel confirmed; clearOnParentChange not universal (Finance sector deps) (2026-07-19)
- [ ] Step 4: Build shared EmployerEngine.jsx component + shared prompt-builder (no role migrated yet)
- [ ] Step 5: Migrate Engineer — write EngineerConfig
- [ ] Step 6: Migrate Engineer — swap live route to render through EmployerEngine
- [ ] Step 7: Migrate Engineer — verify byte-for-byte against current live behavior
- [ ] Step 8: Migrate Sales (config + swap + verify)
- [ ] Step 9: Migrate Finance (config + swap + verify)
- [ ] Step 10: Migrate PM (config + swap + verify — includes intentional fix of missing post-score localStorage save)
- [ ] Step 11: Migrate UX (config + swap + verify)
- [ ] Step 12: Final cross-check — confirm all five Employer*.jsx files are thin config+wrapper files, confirm no B2C files were touched, update ARCHITECTURE.md
