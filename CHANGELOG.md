# Changelog

This file tracks notable changes to the Employer Edition and related app.defensiblezone.ai work. Newest entries at the top.

## 2026-07-19 — Engine consolidation: schema design (Step 2)

Drafted EmployerEngine.jsx config schema (not yet implemented, no app code changed). Designed against a live-file investigation that corrected several assumptions from the original consolidation plan:

- Intake field dependencies are a single generic mechanism (subset-filter or lookup-filter, with optional chaining and optional multi-parent support), not a flat-vs-cascade binary. Finance's companySize genuinely depends on both sector and firmType at once — preserved as real structure, not simplified into a single-parent chain.
- Affinity is a three-state flag (global / declared-but-unused / live), not a boolean. PM declares skillConscience/skillPull but never reads it in scoring; UX reads it live in fetchScores. Schema makes this explicit rather than inferring it from state presence.
- Recommendation phase structure is config-driven per role. Engineer/Sales/PM use week-bucketed phases with a 3/3/2 distribute rule; Finance has no phase system; UX uses a state-driven Anchor/Reposition/Extend taxonomy. Shared prompt-builder branches on phaseModel rather than assuming one output shape.
- Step navigation uses a named ordered array, not raw step numbers, to account for Sales/PM's skipped step-2 and UX starting mid-sequence.
- PM's missing post-score localStorage save (results lost on refresh, unlike the other four roles) will be deliberately fixed during PM's migration step, not preserved as-is — flagged here so it's not mistaken for scope creep when it happens.

No production files touched. No deploy.

## 2026-07-19 — Engine consolidation: live-repo investigation (Step 1)

Re-verified the five Employer role files (EmployerEngineer.jsx, EmployerSales.jsx, EmployerFinance.jsx, EmployerProductManager.jsx, EmployerUX.jsx) directly against live code, correcting several assumptions from an earlier investigation pass:

- UX's intake is not flat — seniority depends on roleType, and workFocus is filtered by roleType.
- Finance's dependency structure has four separate filters off sector (role, seniority, firm type, work focus), not a single 3-level cascade, and its companySize field depends on both sector and firmType simultaneously.
- PM declares per-skill affinity state (skillConscience/skillPull) but never reads it during scoring — dead code, not live behavior.
- UX does read per-skill affinity live in fetchScores.
- Recommendation phase structures differ by role: Engineer/Sales/PM use week-bucketed phases, Finance has none, UX uses a custom Anchor/Reposition/Extend taxonomy.
- PM's localStorage only saves at the gate step, never after scoring — results are lost on refresh, unlike the other four roles.

No app code changed. No deploy.
