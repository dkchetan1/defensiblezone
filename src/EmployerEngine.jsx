import { useState, useEffect, useMemo } from "react";

// ── constants ───────────────────────────────────────────────────────────
var SAVE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// ── helpers ─────────────────────────────────────────────────────────────

function emptyValueForType(type) {
  return type === "multiSelect" ? [] : "";
}

function buildInitialIntakeValues(intake) {
  var values = {};
  (intake || []).forEach(function (field) {
    values[field.id] = emptyValueForType(field.type);
  });
  return values;
}

function parentIdsOf(field) {
  if (!field || field.dependsOn == null) return [];
  return Array.isArray(field.dependsOn) ? field.dependsOn : [field.dependsOn];
}

function isEmptyIntakeValue(value) {
  if (value == null || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * clearOnParentChange is either a single boolean (apply regardless of which
 * parent changed) or a per-parent map ({ [parentFieldId]: boolean }).
 */
function shouldClearOnParentChange(field, changedParentId) {
  var flag = field.clearOnParentChange;
  if (flag == null) return false;
  if (typeof flag === "boolean") return flag;
  return flag[changedParentId] === true;
}

/**
 * pruneOnParentChange is a single boolean. When true on a multiSelect field,
 * parent changes filter the current selection down to ids that remain in the
 * newly available options — unlike clear, which wipes the value entirely.
 */
function shouldPruneOnParentChange(field) {
  return field.pruneOnParentChange === true;
}

/**
 * Resolve available options for a dependent intake field.
 *
 * filterFn "subset": optionsSource maps parent value(s) → id[] used to filter
 *   field.options (e.g. CONTEXT_MAP → subset of WORK_CONTEXTS). A null/undefined
 *   allow-list means "show all" (Engineer "other" pattern).
 *
 * filterFn "lookup": optionsSource maps parent value(s) → a full options list
 *   (or is a function of the parent values, e.g. Finance getValidSizes).
 *
 * Multi-parent: string[] dependsOn. Object sources nest by parent order;
 * function sources are called with parent values in dependsOn order.
 */
function resolveAvailableOptions(field, intakeValues) {
  if (!field) return [];
  if (field.dependsOn == null) {
    return field.options || [];
  }

  var parents = parentIdsOf(field);
  var parentValues = parents.map(function (id) {
    return intakeValues[id];
  });

  if (parentValues.some(isEmptyIntakeValue)) {
    return [];
  }

  var source = field.optionsSource;

  if (field.filterFn === "subset") {
    var allowedIds = lookupSource(source, parents, parentValues);
    if (allowedIds == null) {
      return field.options || [];
    }
    if (!Array.isArray(allowedIds)) return [];
    return (field.options || []).filter(function (opt) {
      var key = opt && opt.id != null ? opt.id : opt;
      return allowedIds.indexOf(key) !== -1;
    });
  }

  if (field.filterFn === "lookup") {
    var lookedUp = lookupSource(source, parents, parentValues);
    return Array.isArray(lookedUp) ? lookedUp : [];
  }

  return field.options || [];
}

function lookupSource(source, parents, parentValues) {
  if (source == null) return null;
  if (typeof source === "function") {
    return source.apply(null, parentValues);
  }
  if (parents.length === 1) {
    return source[parentValues[0]];
  }
  // Nested object keyed in dependsOn order: source[p0][p1]...
  var cursor = source;
  for (var i = 0; i < parentValues.length; i++) {
    if (cursor == null || typeof cursor !== "object") return undefined;
    cursor = cursor[parentValues[i]];
  }
  return cursor;
}

/**
 * Apply clearOnParentChange / pruneOnParentChange after one or more parent
 * fields change. Cascades: a cleared or pruned field counts as a change for
 * its dependents.
 *
 * Clear and prune are distinct:
 *   clear — wipe value entirely ("" or [])
 *   prune — multiSelect only; drop selections no longer in available options
 *
 * If both flags are set for the same field, clear wins (runs first; prune
 * then sees an empty value and skips).
 */
function applyParentChangeEffects(intake, values, changedParentIds) {
  var next = Object.assign({}, values);
  var queue = changedParentIds.slice();

  while (queue.length > 0) {
    var parentId = queue.shift();
    intake.forEach(function (field) {
      if (parentIdsOf(field).indexOf(parentId) === -1) return;

      // Prefer clear over prune when both are configured.
      if (shouldClearOnParentChange(field, parentId)) {
        if (isEmptyIntakeValue(next[field.id])) return;
        next[field.id] = emptyValueForType(field.type);
        queue.push(field.id);
        return;
      }

      if (!shouldPruneOnParentChange(field)) return;
      if (field.type !== "multiSelect") return;
      var current = next[field.id];
      if (!Array.isArray(current) || current.length === 0) return;

      var available = resolveAvailableOptions(field, next);
      var allowedKeys = {};
      available.forEach(function (opt) {
        allowedKeys[optionKey(opt)] = true;
      });
      var pruned = current.filter(function (id) {
        return allowedKeys[String(id)] === true;
      });
      if (pruned.length === current.length) return;
      next[field.id] = pruned;
      queue.push(field.id);
    });
  }

  return next;
}

function optionKey(opt) {
  if (opt == null) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  if (opt.id != null) return String(opt.id);
  if (opt.name != null) return String(opt.name);
  return String(opt);
}

function optionLabel(opt) {
  if (opt == null) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  if (opt.label != null) return String(opt.label);
  if (opt.title != null) return String(opt.title);
  if (opt.name != null) return String(opt.name);
  if (opt.id != null) return String(opt.id);
  return String(opt);
}

// ── component ───────────────────────────────────────────────────────────

/**
 * EmployerEngine — shared state + step-navigation shell.
 *
 * Consumes RoleConfig from docs/employer_engine_schema.md.
 * AI prompt-building / scoring are intentionally stubbed for a later step.
 */
export default function EmployerEngine(props) {
  var config = props.config;

  var stepOrder = (config && config.steps && config.steps.order) || [];
  var startAt = (config && config.steps && config.steps.startAt) || stepOrder[0] || "intake";
  var intakeFields = (config && config.intake) || [];
  var affinityMode = (config && config.affinity && config.affinity.mode) || "global";
  var storageKey = (config && config.localStorageKey) || null;
  var isPerSkill = affinityMode === "perSkill";

  // ── core state ────────────────────────────────────────────────────────
  var [currentStep, setCurrentStep] = useState(startAt);
  var [intakeValues, setIntakeValues] = useState(function () {
    return buildInitialIntakeValues(intakeFields);
  });
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  // Only allocated when config.affinity.mode === "perSkill" (UX live path).
  var [skillConscience, setSkillConscience] = useState(function () {
    return isPerSkill ? {} : null;
  });
  var [skillPull, setSkillPull] = useState(function () {
    return isPerSkill ? {} : null;
  });

  var stepIndex = stepOrder.indexOf(currentStep);
  var stepCount = stepOrder.length;
  var isFirstStep = stepIndex <= 0;
  var isLastStep = stepIndex < 0 || stepIndex >= stepCount - 1;

  // Available options per intake field, derived from current intakeValues.
  var availableOptionsByField = useMemo(
    function () {
      var map = {};
      intakeFields.forEach(function (field) {
        map[field.id] = resolveAvailableOptions(field, intakeValues);
      });
      return map;
    },
    [intakeFields, intakeValues]
  );

  // ── localStorage: load on mount ───────────────────────────────────────
  useEffect(function () {
    if (!storageKey) return;
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (!saved.savedAt || Date.now() - saved.savedAt > SAVE_TTL_MS) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (saved.intakeValues && typeof saved.intakeValues === "object") {
        setIntakeValues(function (prev) {
          return Object.assign({}, prev, saved.intakeValues);
        });
      }
      if (saved.conscience !== undefined) setConscience(saved.conscience);
      if (saved.pull !== undefined) setPull(saved.pull);
      if (isPerSkill) {
        if (saved.skillConscience) setSkillConscience(saved.skillConscience);
        if (saved.skillPull) setSkillPull(saved.skillPull);
      }
      // Restore step only if it is still a known named step in this config.
      if (saved.currentStep && stepOrder.indexOf(saved.currentStep) !== -1) {
        setCurrentStep(saved.currentStep);
      }
    } catch (_e) {}
    // Mount-only hydrate from localStorage (mirrors live role files).
  }, []);

  // ── localStorage: save before gate (intake + affinity only) ────────────
  /**
   * Mirrors the live "save before gate" pattern (Engineer analyze→gate click,
   * Sales affinity-step persist, UX saveProfileState before score).
   * Does NOT include scored results — post-score save lands with scoring logic.
   */
  function saveBeforeGate() {
    if (!storageKey) return;
    try {
      var payload = {
        roleId: config.roleId,
        currentStep: currentStep,
        intakeValues: intakeValues,
        conscience: conscience,
        pull: pull,
        savedAt: Date.now(),
      };
      if (isPerSkill) {
        payload.skillConscience = skillConscience || {};
        payload.skillPull = skillPull || {};
      }
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (_e) {}
  }

  function loadSavedState() {
    if (!storageKey) return null;
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved.savedAt || Date.now() - saved.savedAt > SAVE_TTL_MS) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return saved;
    } catch (_e) {
      return null;
    }
  }

  // ── intake setters ────────────────────────────────────────────────────

  function setIntakeValue(fieldId, value) {
    setIntakeValues(function (prev) {
      var next = Object.assign({}, prev, { [fieldId]: value });
      return applyParentChangeEffects(intakeFields, next, [fieldId]);
    });
  }

  function getAvailableOptions(fieldId) {
    return availableOptionsByField[fieldId] || [];
  }

  // ── step navigation (by position in config.steps.order) ───────────────

  function goNext() {
    if (stepIndex < 0 || stepIndex >= stepCount - 1) return;
    var nextName = stepOrder[stepIndex + 1];
    // Save point after intake+affinity, before scoring / gate flow.
    if (nextName === "gate") {
      saveBeforeGate();
    }
    setCurrentStep(nextName);
  }

  function goBack() {
    if (stepIndex <= 0) return;
    setCurrentStep(stepOrder[stepIndex - 1]);
  }

  function goToStep(stepName) {
    if (stepOrder.indexOf(stepName) === -1) return;
    if (stepName === "gate" && currentStep !== "gate") {
      saveBeforeGate();
    }
    setCurrentStep(stepName);
  }

  // ── AI stubs (implemented in a later step) ────────────────────────────

  // PLACEHOLDER — fetchLandscapeAndSkills: build landscape + skill list from intake.
  function fetchLandscapeAndSkills() {
    console.log(
      "[EmployerEngine] fetchLandscapeAndSkills stub — not implemented yet",
      { roleId: config && config.roleId }
    );
  }

  // PLACEHOLDER — fetchScores: score skills (ai_replaceability / market_demand / DZ).
  function fetchScores() {
    console.log(
      "[EmployerEngine] fetchScores stub — not implemented yet",
      { roleId: config && config.roleId }
    );
  }

  // PLACEHOLDER — fetchRecommendations: post-score action recommendations.
  function fetchRecommendations() {
    console.log(
      "[EmployerEngine] fetchRecommendations stub — not implemented yet",
      { roleId: config && config.roleId }
    );
  }

  // ── JSX shell ─────────────────────────────────────────────────────────

  if (!config) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        EmployerEngine: missing required <code>config</code> prop.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        boxSizing: "border-box",
        fontFamily: "system-ui, sans-serif",
        color: "#1a1a1a",
        background: "#f7f5f0",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b6b6b",
            margin: "0 0 8px",
          }}
        >
          EmployerEngine shell · {config.roleId || "unknown-role"}
          {isPerSkill ? " · affinity: perSkill" : " · affinity: global"}
        </p>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {stepOrder.map(function (name, i) {
            var active = name === currentStep;
            return (
              <button
                key={name}
                type="button"
                onClick={function () {
                  goToStep(name);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: active ? "1px solid #b8860b" : "1px solid #d0d0d0",
                  background: active ? "#b8860b18" : "#fff",
                  color: active ? "#1a1a1a" : "#6b6b6b",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {i + 1}. {name}
              </button>
            );
          })}
        </div>

        <h1 style={{ fontSize: 28, margin: "0 0 8px", fontWeight: 600 }}>
          Step: {currentStep}
        </h1>
        <p style={{ margin: "0 0 24px", color: "#6b6b6b", fontSize: 14 }}>
          Position {stepIndex + 1} of {stepCount}
          {config.steps && config.steps.startAt
            ? " (startAt: " + config.steps.startAt + ")"
            : ""}
        </p>

        {/* Per-step placeholder content */}
        <div
          style={{
            border: "1px dashed #c8c8c8",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            background: "#fff",
          }}
        >
          {currentStep === "intake" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Intake (skeleton)</p>
              {intakeFields.map(function (field) {
                var opts = getAvailableOptions(field.id);
                var val = intakeValues[field.id];
                var dep = field.dependsOn
                  ? Array.isArray(field.dependsOn)
                    ? field.dependsOn.join(", ")
                    : field.dependsOn
                  : "—";
                return (
                  <div key={field.id} style={{ marginBottom: 14, fontSize: 14 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>{field.id}</strong>{" "}
                      <span style={{ color: "#6b6b6b" }}>
                        ({field.type}) · dependsOn: {dep} · {opts.length} options
                      </span>
                    </div>
                    {field.type === "text" ? (
                      <input
                        type="text"
                        value={val || ""}
                        onChange={function (e) {
                          setIntakeValue(field.id, e.target.value);
                        }}
                        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
                      />
                    ) : field.type === "multiSelect" ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {opts.map(function (opt) {
                          var key = optionKey(opt);
                          var selected =
                            Array.isArray(val) && val.indexOf(key) !== -1;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={function () {
                                var prev = Array.isArray(val) ? val : [];
                                var next =
                                  prev.indexOf(key) !== -1
                                    ? prev.filter(function (x) {
                                        return x !== key;
                                      })
                                    : prev.concat([key]);
                                setIntakeValue(field.id, next);
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 4,
                                border: selected
                                  ? "1px solid #b8860b"
                                  : "1px solid #ddd",
                                background: selected ? "#b8860b22" : "#fafafa",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              {optionLabel(opt)}
                            </button>
                          );
                        })}
                        {opts.length === 0 ? (
                          <span style={{ color: "#999" }}>No options yet</span>
                        ) : null}
                      </div>
                    ) : (
                      <select
                        value={val || ""}
                        onChange={function (e) {
                          setIntakeValue(field.id, e.target.value);
                        }}
                        style={{ width: "100%", padding: 8 }}
                      >
                        <option value="">— select —</option>
                        {opts.map(function (opt) {
                          var key = optionKey(opt);
                          return (
                            <option key={key} value={key}>
                              {optionLabel(opt)}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {currentStep === "skills" ? (
            <div>
              <p style={{ margin: "0 0 12px" }}>
                Skills step placeholder — landscape/skills generation not wired yet.
              </p>
              <button type="button" onClick={fetchLandscapeAndSkills}>
                Run fetchLandscapeAndSkills (stub)
              </button>
            </div>
          ) : null}

          {currentStep === "affinity" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Affinity (skeleton)</p>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                conscience: {conscience}
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={conscience}
                  onChange={function (e) {
                    setConscience(Number(e.target.value));
                  }}
                  style={{ display: "block", width: "100%" }}
                />
              </label>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                pull: {pull}
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={pull}
                  onChange={function (e) {
                    setPull(Number(e.target.value));
                  }}
                  style={{ display: "block", width: "100%" }}
                />
              </label>
              {isPerSkill ? (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b6b6b" }}>
                    perSkill maps ready (skillConscience keys:{" "}
                    {Object.keys(skillConscience || {}).length}, skillPull keys:{" "}
                    {Object.keys(skillPull || {}).length}). Real per-skill UI
                    lands with scoring; seed below verifies state wiring.
                  </p>
                  <button
                    type="button"
                    onClick={function () {
                      setSkillConscience(function (prev) {
                        return Object.assign({}, prev, { _demo: conscience });
                      });
                      setSkillPull(function (prev) {
                        return Object.assign({}, prev, { _demo: pull });
                      });
                    }}
                  >
                    Seed demo skillConscience/skillPull from global
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
                  Global affinity only (mode: {affinityMode}).
                </p>
              )}
            </div>
          ) : null}

          {currentStep === "gate" ? (
            <div>
              <p style={{ margin: "0 0 8px" }}>
                Gate step placeholder — navigating here from a prior step triggers{" "}
                <code>saveBeforeGate</code> into <code>{storageKey || "(no key)"}</code>.
              </p>
              <button
                type="button"
                onClick={function () {
                  console.log("[EmployerEngine] loadSavedState", loadSavedState());
                }}
              >
                Log loadSavedState()
              </button>
            </div>
          ) : null}

          {currentStep === "results" ? (
            <div>
              <p style={{ margin: "0 0 12px" }}>
                Results step placeholder — scoring / recommendations not wired yet.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={fetchScores}>
                  Run fetchScores (stub)
                </button>
                <button type="button" onClick={fetchRecommendations}>
                  Run fetchRecommendations (stub)
                </button>
              </div>
            </div>
          ) : null}

          {["intake", "skills", "affinity", "gate", "results"].indexOf(currentStep) ===
          -1 ? (
            <p style={{ margin: 0 }}>
              Custom step <code>{currentStep}</code> — no dedicated placeholder.
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 8,
              border: "1px solid #d0d0d0",
              background: isFirstStep ? "#eee" : "#fff",
              cursor: isFirstStep ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isLastStep}
            style={{
              flex: 2,
              padding: "12px 0",
              borderRadius: 8,
              border: "1px solid #b8860b",
              background: isLastStep ? "#eee" : "#b8860b",
              color: isLastStep ? "#999" : "#fff",
              cursor: isLastStep ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Named exports for unit tests / next-step wiring without mounting the shell.
export {
  resolveAvailableOptions,
  applyParentChangeEffects,
  shouldClearOnParentChange,
  shouldPruneOnParentChange,
  parentIdsOf,
  buildInitialIntakeValues,
};
