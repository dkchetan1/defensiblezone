import { useState, useEffect, useMemo } from "react";
import { getSeed, compAff, calcDZ } from "./EmployerApp.jsx";

// ── constants ───────────────────────────────────────────────────────────
var SAVE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
var GENERATE_MODEL = "claude-sonnet-4-6";
var MAX_TOKENS_LANDSCAPE = 1000;
var MAX_TOKENS_SCORING = 2000;
var MAX_TOKENS_RECS = 2000;

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

function fieldDisplayLabel(field, config) {
  if (!field) return "";
  if (field.label) return field.label;
  var copyLabels =
    config && config.copy && config.copy.fieldLabels ? config.copy.fieldLabels : null;
  if (copyLabels && copyLabels[field.id]) return copyLabels[field.id];
  return field.id;
}

/**
 * Resolve a stored intake value to a human-readable label using the field's
 * available options (or the raw text for text fields).
 */
function resolveIntakeDisplayValue(field, value, intakeValues) {
  if (field == null || isEmptyIntakeValue(value)) return "";
  if (field.type === "text") return String(value);
  if (field.type === "multiSelect" && Array.isArray(value)) {
    var multiOpts = resolveAvailableOptions(field, intakeValues || {});
    return value
      .map(function (id) {
        var found = multiOpts.find(function (opt) {
          return optionKey(opt) === String(id);
        });
        return found ? optionLabel(found) : String(id);
      })
      .filter(Boolean)
      .join(", ");
  }
  var opts = resolveAvailableOptions(field, intakeValues || {});
  var match = opts.find(function (opt) {
    return optionKey(opt) === String(value);
  });
  return match ? optionLabel(match) : String(value);
}

function buildProfileLines(config, state) {
  var intake = (config && config.intake) || [];
  var values = (state && state.intakeValues) || {};
  var lines = [];
  intake.forEach(function (field) {
    // Resume text is injected as its own block, not a profile bullet.
    if (field.id === "resumeText" || field.id === "resume") return;
    var display = resolveIntakeDisplayValue(field, values[field.id], values);
    if (!display) return;
    lines.push("- " + fieldDisplayLabel(field, config) + ": " + display);
  });
  return lines.join("\n");
}

function truncateResume(text) {
  if (!text) return "";
  if (text.length <= 6000) return text;
  var cut = text.slice(0, 6000);
  var lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

function getResumeText(state) {
  if (!state) return "";
  if (state.resumeText) return state.resumeText;
  var values = state.intakeValues || {};
  return values.resumeText || values.resume || "";
}

/**
 * Supported customTaskTemplate placeholder token names. Only these are
 * substituted; any other {{token}} is left unchanged (not invented silently).
 */
var CUSTOM_TASK_TEMPLATE_PLACEHOLDERS = [
  "profileSummary",
  "skillsList",
  "fluencyData",
  "affinityData",
  "resumeText",
];

function formatSkillsNamesList(skills) {
  if (!skills || !skills.length) return "";
  return skills
    .map(function (s, i) {
      return i + 1 + ". " + (s.text || s.name || "Skill " + (i + 1));
    })
    .join("\n");
}

function formatScoredSkillsList(scoredSkills) {
  if (!scoredSkills || !scoredSkills.length) return "";
  return scoredSkills
    .map(function (sk, i) {
      var aiR =
        typeof sk.ai_replaceability === "number"
          ? sk.ai_replaceability
          : typeof sk.aiR === "number"
            ? sk.aiR
            : 5;
      var market =
        typeof sk.market_demand === "number"
          ? sk.market_demand
          : typeof sk.market === "number"
            ? sk.market
            : 7;
      var name = sk.text || sk.name || "Skill " + (i + 1);
      var dzPart = typeof sk.dz === "number" ? ", DZ: " + sk.dz : "";
      return (
        i +
        1 +
        ". [" +
        (sk.id || "s" + i) +
        "] " +
        name +
        " (AI Risk: " +
        aiR +
        "/10, Market Demand: " +
        market +
        "/10" +
        dzPart +
        ")"
      );
    })
    .join("\n");
}

function formatFluencyData(state) {
  var skills = (state && state.skills) || [];
  if (!skills.length) return "";
  var fluencies = (state && state.fluencies) || {};
  var conscience = state && state.conscience != null ? state.conscience : 5;
  var pull = state && state.pull != null ? state.pull : 5;
  return skills
    .map(function (s, i) {
      var fluencyVal =
        fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
      return i + 1 + ". " + s.text + ": fluency " + fluencyVal + "/10";
    })
    .join("\n");
}

function formatAffinityData(state) {
  var conscience = state && state.conscience != null ? state.conscience : 5;
  var pull = state && state.pull != null ? state.pull : 5;
  var isPerSkill = state && state.affinityMode === "perSkill";
  if (!isPerSkill) {
    return "conscience: " + conscience + "/10, pull: " + pull + "/10";
  }
  var skills = (state && state.skills) || [];
  var skillConscience = (state && state.skillConscience) || {};
  var skillPull = (state && state.skillPull) || {};
  if (!skills.length) {
    return (
      "perSkill affinity (no skills yet); defaults conscience: " +
      conscience +
      "/10, pull: " +
      pull +
      "/10"
    );
  }
  return skills
    .map(function (s, i) {
      var c =
        skillConscience[s.id] !== undefined ? skillConscience[s.id] : conscience;
      var p = skillPull[s.id] !== undefined ? skillPull[s.id] : pull;
      return (
        i + 1 + ". " + s.text + " (conscience: " + c + "/10, pull: " + p + "/10)"
      );
    })
    .join("\n");
}

/**
 * Build the substitution map for customTaskTemplate placeholders.
 * Values that are not yet available at a given stage are empty strings.
 */
function buildCustomTemplatePlaceholders(kind, config, state) {
  var profileLines = buildProfileLines(config, state);
  var profileSummary = profileLines || "";
  var resumeRaw = getResumeText(state);
  var resumeText = resumeRaw ? truncateResume(resumeRaw) : "";

  var skillsList = "";
  if (kind === "landscape") {
    // Skills are produced BY landscape — none exist yet.
    skillsList = "";
  } else if (kind === "scoring") {
    skillsList = formatSkillsNamesList((state && state.skills) || []);
  } else if (kind === "recommendations") {
    var scored =
      (state && state.results && state.results.skills) ||
      (state && Array.isArray(state.results) ? state.results : []) ||
      [];
    skillsList = formatScoredSkillsList(scored);
    if (!skillsList) {
      skillsList = formatSkillsNamesList((state && state.skills) || []);
    }
  }

  var fluencyData = "";
  if (kind === "scoring" || kind === "recommendations") {
    fluencyData = formatFluencyData(state);
  }

  var affinityData = formatAffinityData(state);

  return {
    profileSummary: profileSummary,
    skillsList: skillsList,
    fluencyData: fluencyData,
    affinityData: affinityData,
    resumeText: resumeText,
  };
}

/**
 * Substitute {{token}} placeholders in a customTaskTemplate.
 * Only known tokens are replaced; everything else in the string is preserved
 * exactly (including unknown {{tokens}}, which are left as-is).
 */
function applyCustomTaskTemplate(template, kind, config, state) {
  if (!template) return template;
  var values = buildCustomTemplatePlaceholders(kind, config, state);
  return String(template).replace(/\{\{(\w+)\}\}/g, function (_match, name) {
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      var v = values[name];
      return v == null ? "" : String(v);
    }
    return _match;
  });
}

function joinGuardrails(list) {
  if (!list || !list.length) return "";
  return list
    .map(function (g) {
      return "- " + g;
    })
    .join("\n");
}

/**
 * Default scoring responseShape when a role config omits it — preserves the
 * pre-formalization "scores + optional benchmark" behavior.
 */
function defaultScoringResponseShape() {
  return { requiredKeys: ["scores"], optionalKeys: ["benchmark"] };
}

function resolveScoringResponseShape(scoringCfg) {
  var shape = scoringCfg && scoringCfg.responseShape;
  if (!shape) return defaultScoringResponseShape();
  return {
    requiredKeys: Array.isArray(shape.requiredKeys)
      ? shape.requiredKeys
      : ["scores"],
    optionalKeys: Array.isArray(shape.optionalKeys) ? shape.optionalKeys : [],
  };
}

/**
 * Build the "Return ONLY valid JSON: …" example from responseShape keys.
 * Known keys get realistic examples; unknown keys get a placeholder.
 */
function buildScoringReturnJsonExample(shape) {
  var required = (shape && shape.requiredKeys) || ["scores"];
  var optional = (shape && shape.optionalKeys) || [];
  var fragments = [];
  var seen = {};

  function addKey(key) {
    if (seen[key]) return;
    seen[key] = true;
    if (key === "scores" || key === "skills") {
      fragments.push(
        '"' +
          key +
          '":[{"id":"s0","name":"exact skill text","ai_replaceability":5,"market_demand":7,"interface_span":false,"rationale":"one sentence"}]'
      );
    } else if (key === "benchmark") {
      fragments.push(
        '"benchmark":{"percentile":65,"summary":"...","insights":["...","..."]}'
      );
    } else {
      fragments.push('"' + key + '":...');
    }
  }

  required.forEach(addKey);
  optional.forEach(addKey);
  return "{" + fragments.join(",") + "}";
}

/**
 * Pick the scored-skill array from a parsed scoring response using responseShape.
 */
function extractScoredList(parsed, shape) {
  var required = (shape && shape.requiredKeys) || ["scores"];
  var prefer = ["scores", "skills"];
  var i;
  for (i = 0; i < prefer.length; i++) {
    if (
      required.indexOf(prefer[i]) !== -1 &&
      Array.isArray(parsed[prefer[i]])
    ) {
      return parsed[prefer[i]];
    }
  }
  for (i = 0; i < required.length; i++) {
    if (Array.isArray(parsed[required[i]])) return parsed[required[i]];
  }
  return null;
}

function buildPhaseInstructions(recCfg) {
  var model = recCfg && recCfg.phaseModel;
  var def = (recCfg && recCfg.phaseDefinition) || null;

  if (model === "none" || !model) {
    return {
      instruction: "",
      jsonExample:
        '{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact situation."}]}',
    };
  }

  if (model === "weekBucketed") {
    var labels = (def && def.labels) || ["Weeks 1-4", "Weeks 5-8", "Weeks 9-12"];
    var blurbs = (def && Array.isArray(def.blurbs) && def.blurbs.length > 0
      ? def.blurbs
      : null);
    var maxPer = def && def.maxPerPhase != null ? def.maxPerPhase : 4;
    var dist = (def && def.targetDistribution) || [3, 3, 2];
    var phaseLines = labels
      .map(function (label, i) {
        var blurb =
          blurbs && blurbs[i] != null && String(blurbs[i]).length > 0
            ? ": " + blurbs[i]
            : "";
        return "Phase " + (i + 1) + " (" + label + ")" + blurb;
      })
      .join("; ");
    var aimParts = labels.map(function (label, i) {
      return (dist[i] != null ? dist[i] : "?") + " in Phase " + (i + 1) + " (" + label + ")";
    });
    var instruction =
      "For each recommendation, assign a phase (1, 2, or 3) based strictly on feasibility of starting — not score. You MUST distribute cards across all three phases. Do not put more than " +
      maxPer +
      " cards in any single phase. Phases: " +
      phaseLines +
      ". Aim for roughly " +
      aimParts.join(", ") +
      ".";
    return {
      instruction: instruction,
      jsonExample:
        '{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact situation.","phase":1}]}',
    };
  }

  if (model === "custom") {
    var customLabels = (def && def.labels) || [];
    var driverNote = (def && def.driverNote) || "";
    var requiresLabel = !def || def.requiresPhaseLabel !== false;
    var customPhaseLines = customLabels
      .map(function (label, i) {
        return "Phase " + (i + 1) + " — " + label;
      })
      .join("\n");
    var instruction =
      "Write recommendations grouped into phases" +
      (driverNote ? " (" + driverNote + ")" : "") +
      ":\n" +
      customPhaseLines +
      "\nEach recommendation must include a numeric phase (1–" +
      customLabels.length +
      ")" +
      (requiresLabel
        ? ' and a phaseLabel matching one of: "' + customLabels.join('", "') + '"'
        : "") +
      ".";
    var jsonFields = requiresLabel
      ? '{"id":"s0","phase":1,"phaseLabel":"' +
        (customLabels[0] || "Label") +
        '","headline":"...","action":"...","why":"..."}'
      : '{"id":"s0","phase":1,"headline":"...","action":"...","why":"..."}';
    return {
      instruction: instruction,
      jsonExample: '{"recommendations":[' + jsonFields + "]}",
    };
  }

  return { instruction: "", jsonExample: '{"recommendations":[]}' };
}

/**
 * Shared prompt-builder. Assembles stage prompts from config.prompts only —
 * no role-specific hardcoded strings. Profile bullets come from config.intake
 * values; persona / tools / tone / phaseModel come from PromptConfig.
 *
 * If config.prompts[kind].customTaskTemplate is set, that string is used with
 * {{placeholder}} substitution only — generic assembly fields for that stage
 * are ignored (no merge). Supported tokens: {{profileSummary}}, {{skillsList}},
 * {{fluencyData}}, {{affinityData}}, {{resumeText}}.
 *
 * config.extensions is pass-through data available here and on state.extensions
 * when called from the engine; the generic builder does not interpret it.
 *
 * kind: "landscape" | "scoring" | "recommendations"
 * state: { intakeValues, skills, results, conscience, pull, skillConscience,
 *          skillPull, fluencies, resumeText, affinityMode, extensions }
 */
function buildPrompt(kind, config, state) {
  var prompts = (config && config.prompts) || {};
  // config.extensions (also on state.extensions from the engine) is pass-through
  // only — generic assembly does not interpret it.

  var stageCfg = prompts[kind] || {};
  if (stageCfg.customTaskTemplate) {
    return applyCustomTaskTemplate(
      stageCfg.customTaskTemplate,
      kind,
      config,
      state
    );
  }

  var copy = (config && config.copy) || {};
  var profileHeader = copy.profileHeader || "PROFILE";
  var profileLines = buildProfileLines(config, state);
  var profileBlock =
    profileHeader + ":\n" + (profileLines || "- (no intake values set)");
  var resumeText = getResumeText(state);
  var resumeBlock = "";
  if (resumeText) {
    resumeBlock =
      "\n\nCANDIDATE'S RESUME (use this to ground the skill list in their actual, evidenced work history — do not just repeat generic skills for this role/seniority level):\n" +
      truncateResume(resumeText) +
      "\n\nWhen generating the skills: prioritize skills that are actually evidenced in the resume above. If the resume doesn't fully cover enough strategically important skills for this profile, fill the remaining slots with additional role-appropriate skills not found in the resume. Do not list a skill twice just because it's phrased differently in two places — merge overlapping skills into one entry.";
  }

  if (kind === "landscape") {
    var L = prompts.landscape || {};
    var persona = L.persona || "career strategist specializing in AI labor market analysis";
    var tools = (L.toolNames || []).join(", ");
    var styleNotes = L.styleNotes || "";
    return (
      "You are a " +
      persona +
      ".\n\n" +
      profileBlock +
      resumeBlock +
      "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about how AI is affecting this exact professional profile RIGHT NOW. Name specific tools" +
      (tools ? " (" + tools + ")" : "") +
      ", specific tasks being automated, and where the real exposure is for this profile. Do not write generic AI commentary — be specific to this combination." +
      (styleNotes ? " " + styleNotes : "") +
      "\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for this profile to assess for AI defensibility right now. Be precise and specific to this profile. Include a realistic mix: some that are defensible and some genuinely at risk." +
      (styleNotes ? " " + styleNotes : "") +
      '\n\nReturn ONLY valid JSON:\n{"landscape":"...","skills":["skill1","skill2","skill3","skill4","skill5","skill6","skill7","skill8"]}'
    );
  }

  if (kind === "scoring") {
    var S = prompts.scoring || {};
    var scorePersona =
      (prompts.landscape && prompts.landscape.persona) ||
      "career strategist and AI labor market analyst";
    var skills = (state && state.skills) || [];
    var fluencies = (state && state.fluencies) || {};
    var conscience = state && state.conscience != null ? state.conscience : 5;
    var pull = state && state.pull != null ? state.pull : 5;
    var skillConscience = (state && state.skillConscience) || {};
    var skillPull = (state && state.skillPull) || {};
    var isPerSkill = state && state.affinityMode === "perSkill";
    var skillLines = skills
      .map(function (s, i) {
        var fluencyVal =
          fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
        var c = isPerSkill
          ? skillConscience[s.id] !== undefined
            ? skillConscience[s.id]
            : conscience
          : conscience;
        var p = isPerSkill
          ? skillPull[s.id] !== undefined
            ? skillPull[s.id]
            : pull
          : pull;
        var aff = compAff(c, p, fluencyVal);
        if (isPerSkill) {
          return (
            i +
            1 +
            ". " +
            s.text +
            " (conscience: " +
            c +
            "/10, pull: " +
            p +
            "/10, fluency: " +
            fluencyVal +
            "/10, affinity: " +
            aff +
            "/10)"
          );
        }
        return (
          i +
          1 +
          ". " +
          s.text +
          " (fluency: " +
          fluencyVal +
          "/10, affinity: " +
          aff +
          "/10)"
        );
      })
      .join("\n");
    var calibration = S.calibrationNotes || "";
    var guardrails = joinGuardrails(S.guardrails);
    var responseShape = resolveScoringResponseShape(S);
    return (
      "You are a " +
      scorePersona +
      ".\n\n" +
      profileBlock +
      "\n\nSkills to score:\n" +
      skillLines +
      "\n\nFor each skill return:\n- ai_replaceability: 0-10 (10 = AI is already doing this; 0 = deeply human / irreplaceable)\n- market_demand: 0-10 (10 = extremely high demand; 0 = declining)\n- rationale: one precise sentence calibrated to this specific profile" +
      (calibration ? "\n\nCRITICAL CALIBRATION:\n" + calibration : "") +
      (guardrails ? "\n\nSCORING GUARDRAILS:\n" + guardrails : "") +
      "\n\nBe honest. Do not default to middle values.\n\nReturn ONLY valid JSON:\n" +
      buildScoringReturnJsonExample(responseShape)
    );
  }

  if (kind === "recommendations") {
    var R = prompts.recommendations || {};
    var tone = R.tone || {};
    var recPersona =
      (prompts.landscape && prompts.landscape.persona) || "career strategist";
    var scoredSkills =
      (state && state.results && state.results.skills) ||
      (state && Array.isArray(state.results) ? state.results : []) ||
      [];
    var skillSummary = scoredSkills
      .map(function (sk, i) {
        var aiR =
          typeof sk.ai_replaceability === "number"
            ? sk.ai_replaceability
            : typeof sk.aiR === "number"
              ? sk.aiR
              : 5;
        var market =
          typeof sk.market_demand === "number"
            ? sk.market_demand
            : typeof sk.market === "number"
              ? sk.market
              : 7;
        var name = sk.text || sk.name || "Skill " + (i + 1);
        var dzPart = typeof sk.dz === "number" ? ", DZ: " + sk.dz : "";
        return (
          i +
          1 +
          ". [" +
          (sk.id || "s" + i) +
          "] " +
          name +
          " (AI Risk: " +
          aiR +
          "/10, Market Demand: " +
          market +
          "/10" +
          dzPart +
          ")"
        );
      })
      .join("\n");
    var banned = (tone.bannedWords || []).length
      ? "Do not use the words: " + tone.bannedWords.join(", ") + "."
      : "";
    var voice = tone.voiceNote || "";
    var phase = buildPhaseInstructions(R);
    var roleGuards = joinGuardrails(R.roleGuardrails);
    var intro =
      "You are a " +
      recPersona +
      ". The following professional just completed a Defensible Zone assessment.\n\n" +
      profileBlock +
      "\n\nFor each skill below, write a short personalized recommendation. Be specific to their profile. Use plain English. Be direct and practical." +
      (banned ? " " + banned : "") +
      (voice ? " " + voice : "");
    return (
      intro +
      (phase.instruction ? "\n\n" + phase.instruction : "") +
      (roleGuards ? "\n\nROLE GUARDRAILS:\n" + roleGuards : "") +
      "\n\nSkills with scores:\n" +
      skillSummary +
      "\n\nReturn ONLY valid JSON, no preamble:\n" +
      phase.jsonExample
    );
  }

  throw new Error("buildPrompt: unknown kind '" + kind + "'");
}

/**
 * Shared /api/generate caller — matches EmployerEngineer / EmployerSales /
 * EmployerUX / EmployerFinance: POST JSON { model, max_tokens, messages },
 * read data.content[].text, extract first JSON object. Retries once on overload.
 */
async function callGenerate(prompt, maxTokens) {
  async function once() {
    var res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GENERATE_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    var data = await res.json();
    if (!data.content) {
      throw new Error(
        data.error || data.error_description || "API error: " + JSON.stringify(data)
      );
    }
    var raw = data.content
      .map(function (b) {
        return b.text || "";
      })
      .join("");
    var m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("No JSON in response");
    return JSON.parse(m[0]);
  }

  try {
    return await once();
  } catch (e) {
    if (e && e.message && e.message.indexOf("overloaded") !== -1) {
      await new Promise(function (r) {
        setTimeout(r, 2000);
      });
      return await once();
    }
    throw e;
  }
}

function promptStateFromEngine(opts) {
  return {
    intakeValues: opts.intakeValues,
    skills: opts.skills,
    results: opts.results,
    conscience: opts.conscience,
    pull: opts.pull,
    skillConscience: opts.skillConscience,
    skillPull: opts.skillPull,
    fluencies: opts.fluencies,
    resumeText: opts.resumeText,
    affinityMode: opts.affinityMode,
    extensions: opts.extensions,
  };
}

// ── component ───────────────────────────────────────────────────────────

/**
 * EmployerEngine — shared state + step navigation + AI fetch/prompt layer.
 *
 * Consumes RoleConfig from docs/employer_engine_schema.md.
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

  // Landscape / skills / scoring / recommendations
  var [landscape, setLandscape] = useState("");
  var [skills, setSkills] = useState([]);
  var [fluencies, setFluencies] = useState({});
  var [results, setResults] = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [benchmark, setBenchmark] = useState(null);
  var [skillsGroundedInResume, setSkillsGroundedInResume] = useState(false);
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);

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
      if (typeof saved.landscape === "string") setLandscape(saved.landscape);
      if (Array.isArray(saved.skills)) setSkills(saved.skills);
      if (saved.fluencies && typeof saved.fluencies === "object") {
        setFluencies(saved.fluencies);
      }
      if (saved.results) setResults(saved.results);
      if (saved.recommendations) setRecommendations(saved.recommendations);
      if (saved.benchmark) setBenchmark(saved.benchmark);
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

  /**
   * Post-score save (nested payload standard from schema § Resolution).
   * Called after fetchRecommendations succeeds — includes scores + recs.
   * Mirrors Sales saveReportAfterScores / Engineer post-analysis persist,
   * but uses the nested intakeValues shape (no flat-key adapter).
   */
  function saveAfterRecommendations(extra) {
    if (!storageKey) return;
    try {
      var payload = {
        roleId: config.roleId,
        currentStep: "results",
        intakeValues: intakeValues,
        conscience: conscience,
        pull: pull,
        landscape: extra && extra.landscape != null ? extra.landscape : landscape,
        skills: extra && extra.skills != null ? extra.skills : skills,
        fluencies: extra && extra.fluencies != null ? extra.fluencies : fluencies,
        results: extra && extra.results != null ? extra.results : results,
        recommendations:
          extra && extra.recommendations != null
            ? extra.recommendations
            : recommendations,
        benchmark: extra && extra.benchmark != null ? extra.benchmark : benchmark,
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

  // ── AI fetch layer ────────────────────────────────────────────────────

  function buildEnginePromptState(overrides) {
    return promptStateFromEngine({
      intakeValues: intakeValues,
      skills: overrides && overrides.skills != null ? overrides.skills : skills,
      results: overrides && overrides.results != null ? overrides.results : results,
      conscience: conscience,
      pull: pull,
      skillConscience: skillConscience,
      skillPull: skillPull,
      fluencies: fluencies,
      resumeText: getResumeText({ intakeValues: intakeValues }),
      affinityMode: affinityMode,
      extensions: (config && config.extensions) || null,
    });
  }

  function enrichScoredSkills(scoredList) {
    return (scoredList || []).map(function (scored, i) {
      var found =
        skills.find(function (s) {
          return s.id === scored.id;
        }) ||
        skills.find(function (s) {
          return scored.name === s.text;
        }) ||
        skills.find(function (s) {
          return scored.name && scored.name.indexOf(s.text.slice(0, 20)) !== -1;
        }) ||
        skills[i];
      var id = found ? found.id : scored.id || "s" + i;
      var fluencyVal =
        fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
      var c = isPerSkill
        ? skillConscience && skillConscience[id] !== undefined
          ? skillConscience[id]
          : conscience
        : conscience;
      var p = isPerSkill
        ? skillPull && skillPull[id] !== undefined
          ? skillPull[id]
          : pull
        : pull;
      var aff = compAff(c, p, fluencyVal);
      var aiR =
        typeof scored.ai_replaceability === "number"
          ? scored.ai_replaceability
          : typeof scored.aiR === "number"
            ? scored.aiR
            : 5;
      var mkt =
        typeof scored.market_demand === "number"
          ? scored.market_demand
          : typeof scored.market === "number"
            ? scored.market
            : 7;
      var row = {
        id: id,
        text: found ? found.text : scored.name,
        name: found ? found.text : scored.name,
        fluency: fluencyVal,
        affinity: aff,
        naturalAffinity: aff,
        investment: fluencyVal,
        ai_replaceability: aiR,
        market_demand: mkt,
        dz: calcDZ(aff, aiR, mkt),
      };
      if (isPerSkill) {
        row.conscience = c;
        row.pull = p;
      }
      if (scored.rationale) row.rationale = scored.rationale;
      if (scored.interface_span != null) row.interface_span = scored.interface_span;
      return row;
    });
  }

  async function fetchLandscapeAndSkills() {
    setLoading(true);
    setLoadingMsg("Reading your landscape…");
    setError(null);
    var prompt = buildPrompt("landscape", config, buildEnginePromptState());
    var usedResume = !!getResumeText({ intakeValues: intakeValues });
    try {
      var parsed = await callGenerate(prompt, MAX_TOKENS_LANDSCAPE);
      if (!parsed.skills || !Array.isArray(parsed.skills)) {
        throw new Error("Invalid skills in response");
      }
      var loaded = parsed.skills.map(function (text, i) {
        return { id: "s" + i, text: text, editing: false };
      });
      setLandscape(parsed.landscape || "");
      setSkills(loaded);
      setSkillsGroundedInResume(usedResume);
      setFluencies({});
      setResults(null);
      setRecommendations(null);
      setBenchmark(null);
      if (isPerSkill) {
        setSkillConscience({});
        setSkillPull({});
      }
      if (stepOrder.indexOf("skills") !== -1) {
        setCurrentStep("skills");
      }
    } catch (_e) {
      setError("Something went wrong — please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchScores() {
    if (!skills || skills.length === 0) return;
    setLoading(true);
    setLoadingMsg("Scoring your Defensible Zone™…");
    setError(null);
    var scoringCfg =
      (config && config.prompts && config.prompts.scoring) || {};
    var responseShape = resolveScoringResponseShape(scoringCfg);
    var prompt = buildPrompt("scoring", config, buildEnginePromptState());
    try {
      var parsed = await callGenerate(prompt, MAX_TOKENS_SCORING);
      var requiredKeys = responseShape.requiredKeys || [];
      var missing = requiredKeys.filter(function (key) {
        return parsed[key] == null;
      });
      if (missing.length) {
        throw new Error("Missing required scoring keys: " + missing.join(", "));
      }
      var scoredList = extractScoredList(parsed, responseShape);
      if (!Array.isArray(scoredList) || scoredList.length === 0) {
        throw new Error("No scores in response");
      }
      var enriched = enrichScoredSkills(scoredList);
      var resultsPayload = {
        skills: enriched,
        landscape: landscape,
      };
      (responseShape.optionalKeys || []).forEach(function (key) {
        if (parsed[key] == null) return;
        if (key === "benchmark") {
          resultsPayload.benchmark = parsed.benchmark;
          setBenchmark(parsed.benchmark);
        } else if (key === "phase1_teaser") {
          resultsPayload.phase1Teaser = parsed.phase1_teaser;
        } else {
          resultsPayload[key] = parsed[key];
        }
      });
      setResults(resultsPayload);
      if (stepOrder.indexOf("results") !== -1) {
        setCurrentStep("results");
      }
    } catch (_e) {
      setError("Analysis failed — please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecommendations(scoredOverride) {
    var scoredSkills =
      scoredOverride ||
      (results && results.skills) ||
      (Array.isArray(results) ? results : null);
    if (!scoredSkills || scoredSkills.length === 0) return;

    setRecsLoading(true);
    setRecsError(null);
    var resultsForPrompt =
      scoredOverride != null
        ? { skills: scoredOverride, landscape: landscape }
        : results;
    var prompt = buildPrompt(
      "recommendations",
      config,
      buildEnginePromptState({ results: resultsForPrompt })
    );
    try {
      var parsed = await callGenerate(prompt, MAX_TOKENS_RECS);
      var recs = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : null;
      if (!recs) throw new Error("Invalid recommendations");
      var recsPayload = { recommendations: recs };
      setRecommendations(recsPayload);
      saveAfterRecommendations({
        landscape: landscape,
        skills: skills,
        fluencies: fluencies,
        results: resultsForPrompt,
        recommendations: recsPayload,
        benchmark: benchmark || (resultsForPrompt && resultsForPrompt.benchmark) || null,
      });
    } catch (_e) {
      setRecsError("Could not load recommendations. Please try again.");
    } finally {
      setRecsLoading(false);
    }
  }

  // ── JSX shell ─────────────────────────────────────────────────────────

  if (!config) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        EmployerEngine: missing required <code>config</code> prop.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f7f5f0",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6b6b6b",
              margin: "0 0 12px",
            }}
          >
            EmployerEngine · {config.roleId || "unknown-role"}
          </p>
          <p style={{ fontSize: 20, margin: 0, fontStyle: "italic" }}>
            {loadingMsg || "Working…"}
          </p>
        </div>
      </div>
    );
  }

  var phaseModel =
    config.prompts &&
    config.prompts.recommendations &&
    config.prompts.recommendations.phaseModel;

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
              <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
                Skills / landscape
              </p>
              {error ? (
                <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>
              ) : null}
              {landscape ? (
                <p style={{ fontSize: 14, margin: "0 0 12px", lineHeight: 1.5 }}>
                  {landscape}
                </p>
              ) : (
                <p style={{ margin: "0 0 12px", color: "#6b6b6b", fontSize: 14 }}>
                  No landscape yet — run generate.
                </p>
              )}
              {skills.length > 0 ? (
                <ol style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 14 }}>
                  {skills.map(function (s) {
                    return <li key={s.id}>{s.text}</li>;
                  })}
                </ol>
              ) : null}
              {skillsGroundedInResume ? (
                <p style={{ fontSize: 12, color: "#6b6b6b", margin: "0 0 12px" }}>
                  Skills grounded in resume text.
                </p>
              ) : null}
              <button type="button" onClick={fetchLandscapeAndSkills}>
                Run fetchLandscapeAndSkills
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
              <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
                Results{" "}
                <span style={{ fontWeight: 400, color: "#6b6b6b", fontSize: 13 }}>
                  (phaseModel: {phaseModel || "—"})
                </span>
              </p>
              {error ? (
                <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>
              ) : null}
              {recsError ? (
                <p style={{ color: "#b91c1c", fontSize: 14 }}>{recsError}</p>
              ) : null}
              {results && results.skills ? (
                <p style={{ fontSize: 13, color: "#6b6b6b", margin: "0 0 8px" }}>
                  {results.skills.length} scored skills
                  {recommendations && recommendations.recommendations
                    ? " · " +
                      recommendations.recommendations.length +
                      " recommendations"
                    : ""}
                  {recsLoading ? " · loading recommendations…" : ""}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: "#6b6b6b", margin: "0 0 12px" }}>
                  No scores yet.
                </p>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={fetchScores} disabled={skills.length === 0}>
                  Run fetchScores
                </button>
                <button
                  type="button"
                  onClick={function () {
                    fetchRecommendations();
                  }}
                  disabled={!results || !results.skills || results.skills.length === 0}
                >
                  Run fetchRecommendations
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
  buildPrompt,
  buildPhaseInstructions,
  callGenerate,
  resolveScoringResponseShape,
  extractScoredList,
  buildScoringReturnJsonExample,
  applyCustomTaskTemplate,
  buildCustomTemplatePlaceholders,
  CUSTOM_TASK_TEMPLATE_PLACEHOLDERS,
};
