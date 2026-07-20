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
  extensions?: { [key: string]: any },
    // Open-ended bucket for future role-specific fields that don't fit any
    // existing schema section. Exists so future roles (or new nuance discovered
    // in existing roles) can carry additional structured data without requiring
    // another schema redesign. EmployerEngine.jsx should treat this as
    // pass-through data available to buildPrompt and any custom logic, not
    // something it interprets by default.
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
Option = {
  id: string,
  label: string,
  note?: string,                     // Supplementary text alongside the label. Live prompts
                                      // use this (e.g. Engineer's seniority: "label — note" in
                                      // scoring/landscape prompts, not just label). Without
                                      // note on Option the data has nowhere to live and would
                                      // be silently dropped during migration. The engine makes
                                      // note available as data; it does NOT hardcode a
                                      // separator — role prompts / customTaskTemplate decide
                                      // how to format label + note.
}

IntakeFieldConfig = {
  id: string,                        // e.g. "seniority"
  type: "select" | "multiSelect" | "text" | "file",
                                      // "file" = upload control. When type is "file", see
                                      // parseAs below. Do not put full upload/parsing
                                      // mechanism in config — only the type marker; actual
                                      // parsing lives in engine code.
  parseAs?: "text",                  // Only meaningful when type === "file". "text" means
                                      // parse the uploaded file to text after upload
                                      // (e.g. Engineer's resume PDF/DOCX → text for prompts).
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
  visibleWhen?: { field: string, equals: any } | null,
                                      // Field is only shown/required when another field equals
                                      // a specific value. e.g. Engineer's devTypeOther is only
                                      // visible when devType === "other". If null/absent,
                                      // field is always visible.
  required: boolean,                  // Whether the field must have a value before the user
                                      // can proceed. Combined with visibleWhen, a generic
                                      // canProceed check becomes: all fields where
                                      // (visibleWhen is absent OR its condition is currently
                                      // true) AND required must have a non-empty value.
                                      // Verified against EmployerEngineer.jsx's real
                                      // canProceed logic — it reduces to exactly this pattern.
  allowDeselect: boolean,             // Whether a select-type field can be clicked again to
                                      // clear its selection (vs. always requiring a different
                                      // option to change it). e.g. Engineer's companyType
                                      // allows click-to-deselect.
  expandable?: {
    enabled: boolean,
    mode: "oneWay" | "toggle",
    triggerLabel?: string,            // e.g. "+ Show {count} more" — {count} substituted
    collapseLabel?: string,           // toggle mode only; e.g. "Show fewer areas"
  },
                                      // For multiSelect fields that reveal additional options
                                      // beyond an initial filtered subset. This is per-field
                                      // config, NOT an engine default — live roles vary:
                                      //   Finance: no such pattern at all.
                                      //   Engineer/Sales/PM: one-way reveal (click "+ Show N
                                      //     more", stays expanded, no collapse) on workContexts.
                                      //   UX: genuine two-way toggle ("Show all areas" /
                                      //     "Show fewer areas") on workFocus (a different
                                      //     field than the others use).
                                      // That variance is why expandable lives on the field.
  maxSelections?: number | null,      // For multiSelect fields, caps how many options can
                                      // be actively selected at once (a click-time selection
                                      // limit, separate from required/visibleWhen proceed
                                      // checks). e.g. Finance and UX cap certain multiSelect
                                      // fields at a max of 4 selections. null/absent means
                                      // no cap.
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
    customTaskTemplate?: string | null,
      // Full prompt-stage text used verbatim EXCEPT for placeholder tokens, which
      // are substituted with real per-user data at request time. Everything else
      // in the string is preserved exactly as written — this is substitution, not
      // a second generic-assembly pass. When set, generic assembly fields for this
      // stage (persona/toolNames/styleNotes/etc.) are ignored — no merge.
      // Supported placeholders (exact token names):
      //   {{profileSummary}}   — user's intake answers as a readable summary
      //   {{skillsList}}       — skills for this stage (empty at landscape; skill
      //                          names at scoring; scored summary at recommendations)
      //   {{fluencyData}}      — per-skill fluency scores (meaningful at scoring/recs)
      //   {{affinityData}}     — conscience/pull or skillConscience/skillPull
      //                          (global + skills: per-skill lines with fluency +
      //                          composite, matching live Engineer affinityList)
      //   {{resumeText}}       — truncated resume text when present (often landscape)
      // Fine-grained intake tokens (same stages as profileSummary — after intake):
      //   {{seniorityLabel}}   — selected seniority option label (e.g. "Senior")
      //   {{seniorityNote}}    — selected seniority option note (Option.note), or ""
      //   {{devTypeLabel}}     — selected devType label; when id is "other", the
      //                          free-text other value (or "Engineer" if empty)
      //   {{workContextsText}} — selected workContexts labels joined ", "
      //                          (exact live Engineer join format)
      //   {{companyLabel}}     — selected companyType label, or "not specified"
      //                          when unset (live profile / recommendations fallback)
      //   {{companyTypeContextPhrase}} — for live market_demand phrasing: selected
      //                          companyType label when set (same plain label as
      //                          companyLabel), or "this company type" when unset
      // Conditional sections (optional):
      //   {{#resumeText}}...{{/resumeText}} — entire block omitted when resumeText
      //                          is empty (live omits resume framing, not just the
      //                          body). Inner {{resumeText}} still substitutes.
      // If a role's template needs a placeholder not listed here, add it to this
      // list rather than inventing an unlisted token silently.
  },
  scoring: {
    calibrationNotes: string,        // seniority/context CRITICAL calibration text
    guardrails: string[],            // e.g. Sales's activity-vs-outcome, vertical -1/-2
    customTaskTemplate?: string | null,
      // Same escape hatch as landscape — full stage override with placeholder
      // substitution only; no merge with calibrationNotes/guardrails/persona.
    responseShape: {
      requiredKeys: string[],        // e.g. ["scores"]
      optionalKeys: string[],        // e.g. ["benchmark"]
    },
      // Documents what fetchScores should request from the model and accept back.
      // Existing roles differ (skills+benchmark vs scores-only) — this makes that
      // explicit and configurable instead of an implicit assumption in code.
  },
  recommendations: {
    tone: {
      bannedWords: string[],         // "threat", "danger", "risk", emoji rule, etc.
      voiceNote: string,             // "sales coach not career counselor", etc.
    },
    phaseModel: "weekBucketed" | "none" | "custom",
    phaseDefinition: object | null,
      // weekBucketed: {
      //   labels: ["Weeks 1-4","Weeks 5-8","Weeks 9-12"],
      //   blurbs?: string[],   // optional per-phase descriptive text, e.g. Engineer's
      //                        // "no org setup required" — index-aligned with labels
      //   maxPerPhase: 4,
      //   targetDistribution: [3,3,2]
      // }
      // none: null — engine skips phase field in output JSON entirely
      // custom: { labels: ["Anchor","Reposition","Extend"],
      //           requiresPhaseLabel: true, driverNote: "DZ score / AI-exposure driven" }
    roleGuardrails: string[],        // Sales's ROLE-TRACK + SDR guardrail, etc.
    customTaskTemplate?: string | null,
      // Same escape hatch — full stage override with placeholder substitution only.
  },
}
```

The shared prompt-builder function reads phaseModel and branches its output-JSON-shape instructions accordingly — one function, three prompt shapes, not three functions. "none" means the builder omits phase instructions and the output schema entirely, matching Finance's real behavior instead of forcing a phase system on a role that never had one.

`customTaskTemplate` is available independently on landscape, scoring, and recommendations. When set for a stage, that stage's generic assembly fields are ignored entirely (no merge). The template string is preserved exactly except for `{{…}}` placeholder tokens, which are string-substituted with live per-user data at request time. Unknown tokens are left unchanged. Fine-grained tokens (`seniorityLabel`, `seniorityNote`, `devTypeLabel`, `workContextsText`, `companyLabel`, `companyTypeContextPhrase`) carry exact live intake values with no engine-side paraphrasing — use them for mid-sentence interpolations that `{{profileSummary}}` cannot reconstruct. `{{#resumeText}}…{{/resumeText}}` drops the whole section when no resume was uploaded.

## 6. Schema review outcomes (Step 3, verified against live files 2026-07-19)

1. dependsOn multi-parent — RESOLVED: yes — dependsOn: string | string[]. Finance's companySize depends on ["sector", "firmType"]. Deliberately not simplified away.
2. PM's missing post-score localStorage save — RESOLVED: yes, fix during PM's migration (Step 10), flagged explicitly in that step's changelog as an intentional behavior change, not a silent side effect of shared code.
3. clearOnParentChange — RESOLVED, schema corrected: it's per-parent, not per-field, and NOT universal. Finance's companySize (depends on sector AND firmType) only clears on firmType change — sector change does NOT clear it. Meanwhile role/seniority (single-parent, depend only on sector) DO clear on sector change. Schema changed from clearOnParentChange: boolean to clearOnParentChange: boolean | { [parentFieldId]: boolean } to preserve this asymmetry. Confirmed via EmployerFinance.jsx lines 493-497 (useEffect clearing companySize only on [firmType] dependency) vs. lines 2825-2828 (sector click handler clearing role/seniority directly).
4. pruneOnParentChange — RESOLVED (follow-up): multiSelect fields like Engineer/Sales `workContexts` do not clear on parent change; they prune to the intersection with the newly allowed options. Added as a distinct boolean alongside clearOnParentChange. Clear and prune are mutually exclusive intents; if both are set, clear wins.

Step 3 verification results (all other points): Sections 2 (steps), 3 (affinity three-state), 4 (dependency mechanism generally), and 5 (phaseModel) all CONFIRMED against live code with no changes needed. Full findings logged in CHANGELOG.md.
