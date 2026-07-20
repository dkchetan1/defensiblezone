# Employer Edition — Engine Config Schema (Draft for Review)

Status: Draft. Verified against live files in Step 3 (2026-07-19) — one correction made (clearOnParentChange, see Section 6). EmployerEngine.jsx shell exists; role migrations pending.

Purpose: define the shape of the per-role config object that EmployerEngine.jsx will consume. If this shape can represent all five roles' real behavior without a special case for any of them, the schema is sound. If any role needs an escape hatch, that's a sign the shape is wrong and needs revising before migration starts.

### Resolution: localStorage save payload shape (permanent)

The nested save payload written by EmployerEngine.jsx is the permanent standard going forward:

```
{
  roleId, currentStep, savedAt,
  intakeValues,          // { [fieldId]: value } — all intake fields live here
  conscience, pull,
  skillConscience?,      // only when affinity.mode === "perSkill"
  skillPull?,
  // …later: skills, results, etc.
}
```

No backward-compatibility adapter will be built for the old flat-key save shape used by the live role files (top-level `devType`, `sector`, `workContexts`, etc.). No production users currently hold saved data in that format, so there is nothing to migrate. Do not add an adapter later assuming one is needed.

---

## 1. Top-level shape

```
RoleConfig = {
  roleId: string,                    // "engineer", "sales", "finance", "pm", "ux"
  localStorageKey: string,           // e.g. "dz_saved_report_engineer"

  steps: StepConfig,
  intake: IntakeFieldConfig[],
  affinity: AffinityConfig,
  prompts: PromptConfig,
  copy: RoleCopyConfig,              // labels, persona strings, UI-only text
}
```

## 2. Steps

Step counts and numbering are NOT uniform, and some roles skip numbers internally (Sales/PM use 0,1,3,4 with step 2 unused). The engine should not assume contiguous integers.

```
StepConfig = {
  order: string[],   // ordered list of step names, e.g.
                      // ["intake", "skills", "affinity", "gate", "results"]
  startAt: string,   // name of first step (covers UX starting mid-sequence)
}
```

The engine drives navigation by position in order, not by raw numbers — so UX's "start at step 1 of 5" and Finance's "0–6" are both just different-length order arrays. No numeric-start special case needed.

## 3. Intake fields — generic dependency mechanism

"Flat vs. cascading" is not a binary. Every role has at least one dependent field. The difference is only how many dependency links exist (Engineer/PM: 1, Sales/UX: 2, Finance: 4). So there's one mechanism, used a different number of times per role.

```
IntakeFieldConfig = {
  id: string,                        // e.g. "seniority"
  type: "select" | "multiSelect" | "text",
  options: Option[] | null,          // null if options come only from dependency below
  dependsOn: string | string[] | null,  // id(s) of parent field(s); null if independent.
                                         // Array form exists because Finance's companySize
                                         // genuinely depends on BOTH sector AND firmType at
                                         // once (getValidSizes(sector, firmType)) — this is
                                         // not a simplification target. Every other field in
                                         // all five roles has exactly one parent and will just
                                         // populate a single-item value; the array shape is
                                         // there specifically so Finance's real two-parent
                                         // dependency doesn't get flattened or special-cased.
  filterFn: "subset" | "lookup",     // how dependsOn's value(s) determine options
  optionsSource: object | null,      // the lookup table itself, e.g. CONTEXT_MAP,
                                      // SENIORITY_BY_SECTOR_AND_ROLE, getValidSizes
  clearOnParentChange: boolean | { [parentFieldId: string]: boolean },
                                      // Per-parent, NOT a single flag — see Step 3 finding below.
                                      // Single field with one parent: boolean is fine
                                      // (e.g. Sales seniority clears when roleTrack changes: true).
                                      // Multi-parent field: must specify per-parent, because
                                      // clearing behavior can be asymmetric across parents.
                                      // Finance's companySize depends on [sector, firmType] but
                                      // ONLY clears on firmType change, not sector change:
                                      // { sector: false, firmType: true }
  pruneOnParentChange: boolean,       // Distinct from clearOnParentChange — see below.
                                      // Only meaningful for multiSelect fields.
}
```

`clearOnParentChange` vs `pruneOnParentChange` — two different reactions to a parent change:

- **clear** — wipe the field's value entirely (select → `""`, multiSelect → `[]`). Used when the old answer is no longer meaningful under the new parent (e.g. Sales `seniority` clears when `roleTrack` changes; Finance `companySize` clears when `firmType` changes).
- **prune** — for multiSelect only: keep selections that are still valid options under the new parent; drop only the ones that are not. Used when the field is a filtered chip list whose allowed set shrinks/shifts with the parent, but still-valid picks should survive (e.g. Engineer's `workContexts`: when `devType` changes from `frontend` to `backend`, prune to the intersection with `CONTEXT_MAP.backend` rather than clearing the whole selection — a user who had `api` + `realtime` + `wasm` selected keeps `api` and `realtime`, loses only `wasm`).

A field should use one or the other for a given parent change, not both. If both flags are set, clear wins (full wipe; prune is a no-op on an empty value).

Two filterFn modes cover every case found:
- subset — parent value picks a subset of one fixed, shared options list (Engineer's devType → CONTEXT_MAP → subset of WORK_CONTEXTS; Sales/PM's context filters work the same way).
- lookup — parent value(s) map to an entirely separate options list, not a subset of anything shared (Sales/UX's roleTrack/roleType → SENIORITY_BY_*; Finance's sector → ROLES_BY_SECTOR, sector → firm types, sector → work focus, and [sector, firmType] → sizes).

Finance is four IntakeFieldConfig entries with dependsOn set: three single-parent (keyed on sector), one two-parent (companySize, keyed on [sector, firmType]). This is a real structural difference from every other role, not an artifact of over-modeling — Finance's size options are genuinely governed by two independent choices, and the schema preserves that rather than approximating it as a single-parent chain.

Decision log (2026-07-19): confirmed with product owner — dependsOn supports multi-parent by design, specifically to avoid watering down Finance's real dependency structure. Standing principle going forward: if a role's behavior is genuinely more complex than the others, the schema bends to fit it; roles are never simplified to fit a cleaner schema.

## 4. Affinity

Three states, not two — global-only, declared-but-unused (PM), and live (UX). Inferring the mode from whether state variables exist would silently import PM's dead code as if it were real behavior. Must be an explicit flag.

```
AffinityConfig = {
  mode: "global" | "perSkill",
  // "global": conscience/pull only, feeds compAff(conscience, pull, fluency)
  // "perSkill": skillConscience/skillPull maps exist AND are read in scoring
}
```

Decision needed before Step 10 (PM migration): PM currently declares per-skill affinity state but never reads it in fetchScores. Migrating PM to mode: "global" fixes this silently (arguably correct, since the state was dead anyway) — but it's still a behavior decision, not a pure lift-and-shift, and should be called out explicitly in that step's verification rather than discovered by accident.

## 5. Prompts — phase structure is config, not fixed by the engine

The plan originally assumed one shared phase field in the output JSON (headline/action/why/phase) with role config only supplying vocabulary. The investigation found three distinct phase models:
- Week-bucketed, MUST-distribute (Engineer/Sales/PM): phases are literal time windows (Weeks 1–4/5–8/9–12), max 4 items/phase, target distribution 3/3/2.
- No phases at all (Finance).
- State-driven phase taxonomy (UX): Anchor / Reposition / Extend, tied to DZ score / AI-exposure rather than time, with a required phaseLabel.

```
PromptConfig = {
  landscape: {
    persona: string,                 // "senior engineering career strategist", etc.
    toolNames: string[],             // Copilot/Cursor/Devin, Gong/Apollo/Clay, etc.
    styleNotes: string,              // e.g. "not 'coding' but 'designing distributed…'"
  },
  scoring: {
    calibrationNotes: string,        // seniority/context CRITICAL calibration text
    guardrails: string[],            // e.g. Sales's activity-vs-outcome, vertical -1/-2
  },
  recommendations: {
    tone: {
      bannedWords: string[],         // "threat", "danger", "risk", emoji rule, etc.
      voiceNote: string,             // "sales coach not career counselor", etc.
    },
    phaseModel: "weekBucketed" | "none" | "custom",
    phaseDefinition: object | null,
      // weekBucketed: { labels: ["Weeks 1-4","Weeks 5-8","Weeks 9-12"],
      //                 maxPerPhase: 4, targetDistribution: [3,3,2] }
      // none: null — engine skips phase field in output JSON entirely
      // custom: { labels: ["Anchor","Reposition","Extend"],
      //           requiresPhaseLabel: true, driverNote: "DZ score / AI-exposure driven" }
    roleGuardrails: string[],        // Sales's ROLE-TRACK + SDR guardrail, etc.
  },
}
```

The shared prompt-builder function reads phaseModel and branches its output-JSON-shape instructions accordingly — one function, three prompt shapes, not three functions. "none" means the builder omits phase instructions and the output schema entirely, matching Finance's real behavior instead of forcing a phase system on a role that never had one.

## 6. Schema review outcomes (Step 3, verified against live files 2026-07-19)

1. dependsOn multi-parent — RESOLVED: yes — dependsOn: string | string[]. Finance's companySize depends on ["sector", "firmType"]. Deliberately not simplified away.
2. PM's missing post-score localStorage save — RESOLVED: yes, fix during PM's migration (Step 10), flagged explicitly in that step's changelog as an intentional behavior change, not a silent side effect of shared code.
3. clearOnParentChange — RESOLVED, schema corrected: it's per-parent, not per-field, and NOT universal. Finance's companySize (depends on sector AND firmType) only clears on firmType change — sector change does NOT clear it. Meanwhile role/seniority (single-parent, depend only on sector) DO clear on sector change. Schema changed from clearOnParentChange: boolean to clearOnParentChange: boolean | { [parentFieldId]: boolean } to preserve this asymmetry. Confirmed via EmployerFinance.jsx lines 493-497 (useEffect clearing companySize only on [firmType] dependency) vs. lines 2825-2828 (sector click handler clearing role/seniority directly).
4. pruneOnParentChange — RESOLVED (follow-up): multiSelect fields like Engineer/Sales `workContexts` do not clear on parent change; they prune to the intersection with the newly allowed options. Added as a distinct boolean alongside clearOnParentChange. Clear and prune are mutually exclusive intents; if both are set, clear wins.

Step 3 verification results (all other points): Sections 2 (steps), 3 (affinity three-state), 4 (dependency mechanism generally), and 5 (phaseModel) all CONFIRMED against live code with no changes needed. Full findings logged in CHANGELOG.md.
