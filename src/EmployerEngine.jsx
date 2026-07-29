import { useState, useEffect, useMemo, useRef } from "react";
import {
  S,
  Card,
  Label,
  PrimaryBtn,
  SelBtn,
  Chip,
  snapToStop,
  AFFINITY_STOPS,
  getSeed,
  compAff,
  calcDZ,
  isValidEmail,
} from "./EmployerApp.jsx";
import { isEmployerAccessGranted } from "./EmployerEdition.js";

// ── constants ───────────────────────────────────────────────────────────
var SAVE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
var GENERATE_MODEL = "claude-sonnet-4-6";
var MAX_TOKENS_LANDSCAPE = 1000;
var MAX_TOKENS_SCORING = 2000;
var MAX_TOKENS_RECS = 2000;
var FILE_MAX_BYTES = 5 * 1024 * 1024;

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
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

/**
 * visibleWhen: field is shown only when another field's current value === equals.
 * Absent/null → always visible.
 */
function isFieldVisible(field, intakeValues) {
  if (!field || field.visibleWhen == null) return true;
  var vw = field.visibleWhen;
  if (!vw || vw.field == null) return true;
  var current = (intakeValues || {})[vw.field];
  return current === vw.equals;
}

/**
 * Generic canProceed: every field that is currently visible AND required must
 * have a non-empty value. Matches EmployerEngineer.jsx's real canProceed
 * pattern (required fields + conditional visibleWhen fields).
 */
function computeCanProceed(intake, intakeValues) {
  var fields = intake || [];
  var values = intakeValues || {};
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!isFieldVisible(field, values)) continue;
    if (field.required !== true) continue;
    if (isEmptyIntakeValue(values[field.id])) return false;
  }
  return true;
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

/**
 * Option.note — supplementary text alongside label. Available as data for
 * profile/prompt assembly; callers choose formatting (e.g. "label — note").
 * Engine does not hardcode a separator.
 */
function optionNote(opt) {
  if (opt == null || typeof opt === "string" || typeof opt === "number") return "";
  if (opt.note != null && String(opt.note).length > 0) return String(opt.note);
  return "";
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
 * Resolve selected option(s) to { id, label, note } records. note is threaded
 * through so profile/prompt builders can format "label — note" (or any other
 * join) without the engine hardcoding a separator. Falls back to scanning
 * field.options when a selected id is outside the currently available subset
 * (e.g. after expandable reveal).
 */
function resolveSelectedOptions(field, value, intakeValues) {
  if (field == null || isEmptyIntakeValue(value)) return [];
  if (field.type === "text" || field.type === "file") {
    return [{ id: null, label: String(value), note: "" }];
  }

  var available = resolveAvailableOptions(field, intakeValues || {});
  var full = Array.isArray(field.options) ? field.options : [];
  var pool = available.slice();
  full.forEach(function (opt) {
    var key = optionKey(opt);
    if (
      !pool.some(function (existing) {
        return optionKey(existing) === key;
      })
    ) {
      pool.push(opt);
    }
  });

  function resolveOne(id) {
    var found = pool.find(function (opt) {
      return optionKey(opt) === String(id);
    });
    if (found) {
      return { id: optionKey(found), label: optionLabel(found), note: optionNote(found) };
    }
    return { id: String(id), label: String(id), note: "" };
  }

  if (field.type === "multiSelect" && Array.isArray(value)) {
    return value.map(resolveOne);
  }
  return [resolveOne(value)];
}

/**
 * Resolve a stored intake value to a human-readable label using the field's
 * available options (or the raw text for text/file fields). Labels only —
 * use resolveSelectedOptions when note data is needed.
 */
function resolveIntakeDisplayValue(field, value, intakeValues) {
  if (field == null || isEmptyIntakeValue(value)) return "";
  if (field.type === "text" || field.type === "file") return String(value);
  return resolveSelectedOptions(field, value, intakeValues)
    .map(function (part) {
      return part.label;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * File → base64 payload for /api/parse-resume (matches EmployerEngineer.jsx).
 */
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var result = reader.result;
      var comma = typeof result === "string" ? result.indexOf(",") : -1;
      resolve(comma !== -1 ? result.slice(comma + 1) : "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Parse an uploaded file to text via /api/parse-resume — same approach as
 * EmployerEngineer.jsx / EmployerFinance.jsx / EmployerUX.jsx resume upload.
 * Returns { text, fileName } on success; throws Error with a user-facing message.
 */
async function parseFileToText(file) {
  var lowerName = (file.name || "").toLowerCase();
  var validExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");
  if (!validExt) {
    throw new Error("Only PDF and DOCX files are supported.");
  }
  if (file.size > FILE_MAX_BYTES) {
    throw new Error("File is too large. Please upload a file under 5MB.");
  }
  var fileData = await fileToBase64(file);
  var res = await fetch("/api/parse-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileData: fileData,
      mimeType: file.type,
    }),
  });
  var data = await res.json();
  if (!data || data.success !== true) {
    throw new Error(
      (data && data.error) ||
        "Something went wrong reading this file — you can continue without it, or try again."
    );
  }
  if (data.extractable === false || !data.text || !String(data.text).trim()) {
    throw new Error(
      "We couldn't read text from this file — you can continue without it, or try a different file."
    );
  }
  return { text: data.text, fileName: file.name };
}

/**
 * Options shown for a multiSelect with expandable config.
 * Collapsed: dependency-filtered available set.
 * Expanded: full field.options (fallback to available if options is null).
 */
function resolveDisplayOptions(field, intakeValues, isExpanded) {
  var available = resolveAvailableOptions(field, intakeValues || {});
  var exp = field && field.expandable;
  if (
    !exp ||
    !exp.enabled ||
    field.type !== "multiSelect" ||
    !isExpanded
  ) {
    return available;
  }
  if (Array.isArray(field.options) && field.options.length > 0) {
    return field.options;
  }
  return available;
}

function expandableHiddenCount(field, intakeValues) {
  if (!field || !field.expandable || !field.expandable.enabled) return 0;
  if (!Array.isArray(field.options) || field.options.length === 0) return 0;
  var available = resolveAvailableOptions(field, intakeValues || {});
  var availableKeys = {};
  available.forEach(function (opt) {
    availableKeys[optionKey(opt)] = true;
  });
  var hidden = 0;
  field.options.forEach(function (opt) {
    if (!availableKeys[optionKey(opt)]) hidden += 1;
  });
  return hidden;
}

function formatExpandableTriggerLabel(field, hiddenCount) {
  var exp = field && field.expandable;
  var raw =
    exp && exp.triggerLabel
      ? exp.triggerLabel
      : exp && exp.mode === "toggle"
        ? "Show all"
        : "+ Show {count} more";
  return String(raw).replace(/\{count\}/g, String(hiddenCount));
}

function formatExpandableCollapseLabel(field) {
  var exp = field && field.expandable;
  return (exp && exp.collapseLabel) || "Show fewer";
}

function buildProfileLines(config, state) {
  var intake = (config && config.intake) || [];
  var values = (state && state.intakeValues) || {};
  var lines = [];
  intake.forEach(function (field) {
    // Resume / file text is injected as its own block, not a profile bullet.
    if (field.id === "resumeText" || field.id === "resume" || field.type === "file") {
      return;
    }
    if (!isFieldVisible(field, values)) return;
    // Prefer structured resolve so Option.note is available to callers that
    // format label + note themselves; generic summary uses label only.
    var parts = resolveSelectedOptions(field, values[field.id], values);
    if (!parts.length) return;
    var display = parts
      .map(function (p) {
        return p.label;
      })
      .filter(Boolean)
      .join(", ");
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
  "seniorityLabel",
  "seniorityNote",
  "devTypeLabel",
  "workContextsText",
  "companyLabel",
  "companyTypeContextPhrase",
];

function findIntakeField(config, fieldId) {
  var intake = (config && config.intake) || [];
  for (var i = 0; i < intake.length; i++) {
    if (intake[i] && intake[i].id === fieldId) return intake[i];
  }
  return null;
}

/**
 * Fine-grained intake tokens for mid-sentence interpolations.
 * Exact live values — no engine-side reformatting beyond label lookup / join.
 * Available after intake (same stages as profileSummary).
 */
function resolveFineGrainedIntakeTokens(config, state) {
  var values = (state && state.intakeValues) || {};

  var seniorityField = findIntakeField(config, "seniority");
  var seniorityParts = seniorityField
    ? resolveSelectedOptions(seniorityField, values.seniority, values)
    : [];
  var seniorityLabel =
    seniorityParts.length && seniorityParts[0].label
      ? seniorityParts[0].label
      : values.seniority
        ? String(values.seniority)
        : "";
  var seniorityNote =
    seniorityParts.length && seniorityParts[0].note
      ? seniorityParts[0].note
      : "";

  // Live EmployerEngineer: other → free-text (or "Engineer"), else option label.
  var devTypeId = values.devType != null ? String(values.devType) : "";
  var devTypeLabel = "";
  if (devTypeId === "other") {
    // Live: devTypeOther || "Engineer" (no trim)
    var otherText =
      values.devTypeOther != null ? String(values.devTypeOther) : "";
    devTypeLabel = otherText || "Engineer";
  } else if (devTypeId) {
    var devTypeField = findIntakeField(config, "devType");
    var devParts = devTypeField
      ? resolveSelectedOptions(devTypeField, values.devType, values)
      : [];
    devTypeLabel =
      devParts.length && devParts[0].label
        ? devParts[0].label
        : String(devTypeId);
  }

  // Live: workContextLabels.join(", ")
  var workContextsField = findIntakeField(config, "workContexts");
  var workParts = workContextsField
    ? resolveSelectedOptions(workContextsField, values.workContexts, values)
    : [];
  var workContextsText = workParts
    .map(function (p) {
      return p.label;
    })
    .filter(Boolean)
    .join(", ");

  // Live profile/recs: companyLabel || "not specified"
  // Live market_demand: companyLabel || "this company type" (same plain label
  // when set — profile.companyLabel is ct.label, not a different phrasing)
  var companyField = findIntakeField(config, "companyType");
  var companyParts = companyField
    ? resolveSelectedOptions(companyField, values.companyType, values)
    : [];
  var companyRaw =
    companyParts.length && companyParts[0].label
      ? companyParts[0].label
      : values.companyType
        ? String(values.companyType)
        : "";
  var companyLabel = companyRaw || "not specified";
  var companyTypeContextPhrase = companyRaw || "this company type";

  return {
    seniorityLabel: seniorityLabel,
    seniorityNote: seniorityNote,
    devTypeLabel: devTypeLabel,
    workContextsText: workContextsText,
    companyLabel: companyLabel,
    companyTypeContextPhrase: companyTypeContextPhrase,
  };
}

function formatSkillsNamesList(skills) {
  if (!skills || !skills.length) return "";
  return skills
    .map(function (s, i) {
      return i + 1 + ". " + (s.text || s.name || "Skill " + (i + 1));
    })
    .join("\n");
}

/**
 * Recommendations skills list — match live EmployerEngineer.fetchRecommendations:
 * iterate user skills in order, look up scores, no [id] / DZ suffix.
 * "N. skill (AI Risk: X/10, Market Demand: Y/10)"
 */
function formatScoredSkillsList(skills, scoredSkills) {
  var list = skills && skills.length ? skills : [];
  var scored = scoredSkills || [];
  if (!list.length && scored.length) {
    // Fallback when skills state missing — still no [id]/DZ.
    return scored
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
        return (
          i +
          1 +
          ". " +
          name +
          " (AI Risk: " +
          aiR +
          "/10, Market Demand: " +
          market +
          "/10)"
        );
      })
      .join("\n");
  }
  if (!list.length) return "";
  return list
    .map(function (s, i) {
      var scoredRow = scored.find(function (r) {
        return r.id === s.id || r.name === s.text || r.text === s.text;
      });
      var aiR =
        scoredRow && typeof scoredRow.ai_replaceability === "number"
          ? scoredRow.ai_replaceability
          : 5;
      var market =
        scoredRow && typeof scoredRow.market_demand === "number"
          ? scoredRow.market_demand
          : 7;
      return (
        i +
        1 +
        ". " +
        (s.text || s.name || "Skill " + (i + 1)) +
        " (AI Risk: " +
        aiR +
        "/10, Market Demand: " +
        market +
        "/10)"
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
  var skills = (state && state.skills) || [];
  var fluencies = (state && state.fluencies) || {};

  // Global + skills: match live EmployerEngineer affinityList (per-skill lines
  // with global conscience/pull, per-skill fluency, and compAff composite).
  if (!isPerSkill) {
    if (!skills.length) {
      return "conscience: " + conscience + "/10, pull: " + pull + "/10";
    }
    return skills
      .map(function (s) {
        var fluencyVal =
          fluencies[s.id] !== undefined
            ? fluencies[s.id]
            : getSeed(conscience, pull);
        var w = compAff(conscience, pull, fluencyVal);
        return (
          '"' +
          s.text +
          '": conscience=' +
          conscience +
          "/10, pull=" +
          pull +
          "/10, fluency=" +
          fluencyVal +
          "/10, composite=" +
          w +
          "/10"
        );
      })
      .join("\n");
  }

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
  var fine = resolveFineGrainedIntakeTokens(config, state);

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
    skillsList = formatScoredSkillsList((state && state.skills) || [], scored);
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
    seniorityLabel: fine.seniorityLabel,
    seniorityNote: fine.seniorityNote,
    devTypeLabel: fine.devTypeLabel,
    workContextsText: fine.workContextsText,
    companyLabel: fine.companyLabel,
    companyTypeContextPhrase: fine.companyTypeContextPhrase,
  };
}

/**
 * Substitute {{token}} placeholders in a customTaskTemplate.
 * Only known tokens are replaced; everything else in the string is preserved
 * exactly (including unknown {{tokens}}, which are left as-is).
 *
 * Conditional blocks: {{#name}}...{{/name}} — when the named token is empty,
 * the entire block is omitted (used for resume framing that live skips when
 * no resume was uploaded).
 */
function applyCustomTaskTemplate(template, kind, config, state) {
  if (!template) return template;
  var values = buildCustomTemplatePlaceholders(kind, config, state);
  var out = String(template);
  out = out.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    function (_match, name, inner) {
      if (!Object.prototype.hasOwnProperty.call(values, name)) return _match;
      var v = values[name];
      if (v == null || String(v) === "") return "";
      return inner;
    }
  );
  return out.replace(/\{\{(\w+)\}\}/g, function (_match, name) {
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
 * {{fluencyData}}, {{affinityData}}, {{resumeText}}, {{seniorityLabel}},
 * {{seniorityNote}}, {{devTypeLabel}}, {{workContextsText}}, {{companyLabel}},
 * {{companyTypeContextPhrase}}.
 * Conditional: {{#resumeText}}...{{/resumeText}} omitted when resume empty.
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

// ── UI helpers (visual parity with EmployerEngineer.jsx) ──────────────────

function optionSub(opt) {
  if (opt == null || typeof opt === "string" || typeof opt === "number") return "";
  return opt.sub != null ? String(opt.sub) : "";
}

function optionDesc(opt) {
  if (opt == null || typeof opt === "string" || typeof opt === "number") return "";
  return opt.desc != null ? String(opt.desc) : "";
}

/**
 * {token} interpolation for copy strings (same convention as
 * expandable.triggerLabel's {count}).
 */
function interpolateCopy(str, tokens) {
  if (str == null) return "";
  return String(str).replace(/\{(\w+)\}/g, function (fullMatch, key) {
    return tokens && Object.prototype.hasOwnProperty.call(tokens, key)
      ? String(tokens[key])
      : fullMatch;
  });
}

function getCopy(config) {
  return (config && config.copy) || {};
}

/**
 * `results` can be the engine's native { skills: [...] } shape or a raw
 * scored array (legacy shape restored from an old localStorage save / gate
 * token). Normalize once here rather than re-checking Array.isArray at every
 * call site.
 */
function getScoredSkills(results) {
  if (!results) return [];
  if (Array.isArray(results)) return results;
  if (results.skills && Array.isArray(results.skills)) return results.skills;
  return [];
}

/**
 * UI-facing profile summary, reusing the same intake field resolution as
 * prompt building (resolveFineGrainedIntakeTokens) so header chips/eyebrows
 * always agree with what the prompts saw.
 */
function buildUiProfile(config, intakeValues) {
  var fine = resolveFineGrainedIntakeTokens(config, { intakeValues: intakeValues });
  var workContextLabels = fine.workContextsText
    ? fine.workContextsText.split(", ").filter(Boolean)
    : [];
  // JUDGMENT CALL: "Engineer" is hardcoded as the default role noun since
  // only the Engineer role is wired through this shared UI today. A future
  // role can override via config.copy.roleNoun without touching this file.
  var roleNoun = (config && config.copy && config.copy.roleNoun) || "Engineer";
  var companyLabel = fine.companyLabel === "not specified" ? "" : fine.companyLabel;
  var summary =
    fine.seniorityLabel +
    " " +
    fine.devTypeLabel +
    " " +
    roleNoun +
    (companyLabel ? " · " + companyLabel : "");
  return {
    devLabel: fine.devTypeLabel,
    seniorityLabel: fine.seniorityLabel,
    companyLabel: companyLabel,
    workContextLabels: workContextLabels,
    summary: summary,
    roleLabel: fine.devTypeLabel + " " + roleNoun,
  };
}

/**
 * Progressive reveal: every required + currently-visible field *before*
 * fieldIndex must be filled. This reproduces EmployerEngineer's
 * devTypeReady / seniorityReady / contextsReady chain generically, since
 * visibleWhen already makes e.g. devTypeOther "skip" when not applicable.
 */
function precedingRequiredFilled(intakeFields, intakeValues, fieldIndex) {
  for (var i = 0; i < fieldIndex; i++) {
    var field = intakeFields[i];
    if (!isFieldVisible(field, intakeValues)) continue;
    if (field.required !== true) continue;
    if (isEmptyIntakeValue(intakeValues[field.id])) return false;
  }
  return true;
}

function nudgeCopyKeyFor(fieldId) {
  return "nudge" + fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
}

/**
 * Live layout quirk: a text field that is visibleWhen another (select) field
 * equals a specific value (e.g. devTypeOther when devType === "other") is
 * rendered *inside* that field's card, not as its own top-level card.
 */
function nestedTextFieldFor(intakeFields, field) {
  return (
    (intakeFields || []).find(function (f) {
      return f.type === "text" && f.visibleWhen && f.visibleWhen.field === field.id;
    }) || null
  );
}

function isNestedTextField(intakeFields, field) {
  if (field.type !== "text" || !field.visibleWhen) return false;
  return (intakeFields || []).some(function (f) {
    return f.id === field.visibleWhen.field;
  });
}

/**
 * gate_token restore supports both the engine's nested { intakeValues }
 * shape and a legacy flat shape (top-level devType/seniority/... keys, as
 * saved by the pre-migration EmployerEngineer.jsx).
 */
function extractIntakeValuesFromSaved(saved, intakeFields) {
  if (saved && saved.intakeValues && typeof saved.intakeValues === "object") {
    return saved.intakeValues;
  }
  var values = {};
  (intakeFields || []).forEach(function (field) {
    if (saved && Object.prototype.hasOwnProperty.call(saved, field.id)) {
      values[field.id] = saved[field.id];
    }
  });
  return values;
}

/**
 * Hero headline formatting: renders "Find Your" + italic serif
 * "Defensible Zone™" (with a superscript trademark) when the configured
 * headline contains that phrase; otherwise renders the headline plain.
 */
function renderHeroHeadline(headline) {
  var text = headline || "";
  var marker = "Defensible Zone™";
  var idx = text.indexOf(marker);
  var headlineStyle = { fontFamily: S.serif, fontSize: 40, color: S.text, margin: "0 0 12px", lineHeight: 1.1 };
  if (idx === -1) {
    return <h1 style={headlineStyle}>{text}</h1>;
  }
  var prefix = text.slice(0, idx).replace(/\s+$/, "");
  var suffix = text.slice(idx + marker.length);
  return (
    <h1 style={headlineStyle}>
      {prefix}
      <br />
      <em>
        Defensible Zone
        <sup style={{ fontSize: "0.45em", verticalAlign: "super", fontStyle: "normal" }}>™</sup>
      </em>
      {suffix}
    </h1>
  );
}

var inputStyle = {
  width: "100%",
  background: "#f2f4f8",
  border: "1px solid " + S.border,
  borderRadius: 8,
  padding: "12px 16px",
  color: S.text,
  fontSize: 16,
  fontFamily: S.font,
  outline: "none",
  boxSizing: "border-box",
};

var DZ_SLIDER_CSS =
  "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";

var FADE_SLIDE_CSS =
  "@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .reveal{animation:fadeSlide 0.25s ease-out both;}";

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
  // multiSelect expandable UI: { [fieldId]: true } once revealed (oneWay) or toggled.
  var [expandedFields, setExpandedFields] = useState({});
  // file-type upload UI meta: { [fieldId]: { uploading, error, fileName } }
  var [fileUploadState, setFileUploadState] = useState({});
  var fileInputRefs = useRef({});

  // Skills editing / fluency-adjustment tracking (adjustedSkillsRef mirrors
  // adjustedSkills synchronously so the reseed effect below can check it
  // without waiting on a re-render).
  var [adjustedSkills, setAdjustedSkills] = useState(function () {
    return new Set();
  });
  var adjustedSkillsRef = useRef(new Set());
  var freeEmailSentRef = useRef(false);
  var paidEmailSentRef = useRef(false);

  // Email gate flow
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState("");
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var effectivelyVerified = gateVerified || isEmployerAccessGranted();

  // Manual "email me a copy" on the results step
  var [manualEmailSent, setManualEmailSent] = useState(false);
  var [manualEmailInput, setManualEmailInput] = useState("");
  var [manualEmailError, setManualEmailError] = useState("");
  var [manualEmailLoading, setManualEmailLoading] = useState(false);

  var stepIndex = stepOrder.indexOf(currentStep);

  function markAdjusted(skillId) {
    adjustedSkillsRef.current.add(skillId);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

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

  var canProceed = useMemo(
    function () {
      return computeCanProceed(intakeFields, intakeValues);
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
      if (Array.isArray(saved.skills)) {
        setSkills(saved.skills);
        // Mark restored skills as "adjusted" so the fluency-reseed effect
        // below doesn't immediately overwrite restored fluency values.
        var restoredIds = saved.skills.map(function (sk) {
          return sk.id;
        });
        adjustedSkillsRef.current = new Set(restoredIds);
        setAdjustedSkills(new Set(restoredIds));
      }
      if (saved.fluencies && typeof saved.fluencies === "object") {
        setFluencies(saved.fluencies);
      }
      if (typeof saved.skillsGroundedInResume === "boolean") {
        setSkillsGroundedInResume(saved.skillsGroundedInResume);
      }
      if (saved.gateEmail) setGateEmail(saved.gateEmail);
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
        landscape: landscape,
        skills: skills,
        fluencies: fluencies,
        skillsGroundedInResume: skillsGroundedInResume,
        savedAt: Date.now(),
      };
      if (gateEmail && gateEmail.trim()) payload.gateEmail = gateEmail.trim();
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
      if (gateEmail && gateEmail.trim()) payload.gateEmail = gateEmail.trim();
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
    // Optional UX nicety: collapse any expandable field whose parent just
    // changed, mirroring live EmployerEngineer's showAllCtx reset on devType change.
    intakeFields.forEach(function (f) {
      if (f.expandable && parentIdsOf(f).indexOf(fieldId) !== -1) {
        setFieldExpanded(f.id, false);
      }
    });
  }

  function getAvailableOptions(fieldId) {
    return availableOptionsByField[fieldId] || [];
  }

  function setFieldExpanded(fieldId, expanded) {
    setExpandedFields(function (prev) {
      var next = Object.assign({}, prev);
      if (expanded) next[fieldId] = true;
      else delete next[fieldId];
      return next;
    });
  }

  function clearFileInput(fieldId) {
    var input = fileInputRefs.current[fieldId];
    if (input) input.value = "";
  }

  function removeFileField(fieldId) {
    setIntakeValue(fieldId, "");
    setFileUploadState(function (prev) {
      var next = Object.assign({}, prev);
      next[fieldId] = { uploading: false, error: "", fileName: "" };
      return next;
    });
    clearFileInput(fieldId);
  }

  async function handleFileFieldSelect(field, e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var fieldId = field.id;
    setFileUploadState(function (prev) {
      var next = Object.assign({}, prev);
      next[fieldId] = { uploading: true, error: "", fileName: "" };
      return next;
    });
    try {
      if (field.parseAs !== "text") {
        throw new Error("Unsupported file parseAs — only \"text\" is implemented.");
      }
      var parsed = await parseFileToText(file);
      setIntakeValue(fieldId, parsed.text);
      setFileUploadState(function (prev) {
        var next = Object.assign({}, prev);
        next[fieldId] = {
          uploading: false,
          error: "",
          fileName: parsed.fileName,
        };
        return next;
      });
      clearFileInput(fieldId);
    } catch (err) {
      setIntakeValue(fieldId, "");
      setFileUploadState(function (prev) {
        var next = Object.assign({}, prev);
        next[fieldId] = {
          uploading: false,
          error: (err && err.message) || "Something went wrong reading this file.",
          fileName: "",
        };
        return next;
      });
      clearFileInput(fieldId);
    }
  }

  function selectOption(field, key) {
    var current = intakeValues[field.id];
    if (field.allowDeselect === true && String(current) === String(key)) {
      setIntakeValue(field.id, "");
      return;
    }
    setIntakeValue(field.id, key);
  }

  // ── step navigation (by position in config.steps.order) ───────────────

  function goBack() {
    if (stepIndex <= 0) return;
    setCurrentStep(stepOrder[stepIndex - 1]);
  }

  function goToAffinityFromSkills() {
    setCurrentStep("affinity");
  }

  function goToGateFromAffinity() {
    saveBeforeGate();
    setCurrentStep("gate");
  }

  // ── skills editing ────────────────────────────────────────────────────

  function startEditing(id) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { editing: true }) : s;
      });
    });
  }

  function updateText(id, text) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { text: text }) : s;
      });
    });
  }

  function commitEdit(id) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { editing: false }) : s;
      });
    });
  }

  function removeSkill(id) {
    setSkills(function (p) {
      return p.filter(function (s) {
        return s.id !== id;
      });
    });
    setFluencies(function (p) {
      var n = Object.assign({}, p);
      delete n[id];
      return n;
    });
    adjustedSkillsRef.current.delete(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  // ── reset ─────────────────────────────────────────────────────────────

  function resetAll() {
    setCurrentStep(startAt);
    setIntakeValues(buildInitialIntakeValues(intakeFields));
    setConscience(5);
    setPull(5);
    if (isPerSkill) {
      setSkillConscience({});
      setSkillPull({});
    }
    setLandscape("");
    setSkills([]);
    setFluencies({});
    setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null);
    setBenchmark(null);
    setRecommendations(null);
    setRecsLoading(false);
    setRecsError(null);
    setSkillsGroundedInResume(false);
    setError(null);
    setExpandedFields({});
    setFileUploadState({});
    setGateEmail("");
    setGateSent(false);
    setGateVerified(false);
    setGateError("");
    setGateLoading(false);
    setShowResend(false);
    setGateOnDifferentDevice(false);
    setGateInputFocused(false);
    setManualEmailSent(false);
    setManualEmailInput("");
    setManualEmailError("");
    setManualEmailLoading(false);
    freeEmailSentRef.current = false;
    paidEmailSentRef.current = false;
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (_e) {}
    }
  }

  // ── email gate handlers ───────────────────────────────────────────────

  async function handleGateSubmit() {
    var trimmed = gateEmail.trim();
    if (!isValidEmail(trimmed)) {
      setGateError("Please enter a valid email address.");
      return;
    }
    setGateError("");
    setGateLoading(true);
    try {
      var res = await fetch("/api/send-gate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, product: config.roleId }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateSent(true);
    } catch (e) {
      var gateCopySafe = (getCopy(config).gate) || {};
      setGateError(gateCopySafe.genericError || "Something went wrong. Please try again.");
    } finally {
      setGateLoading(false);
    }
  }

  async function handleManualEmailCopy() {
    if (!recommendations) {
      setManualEmailError(
        "Your full report is still being prepared — please try again in a few seconds."
      );
      return;
    }
    var trimmed = manualEmailInput.trim();
    if (!isValidEmail(trimmed)) {
      setManualEmailError("Please enter a valid email address.");
      return;
    }
    setManualEmailError("");
    setManualEmailLoading(true);
    try {
      var profile = buildUiProfile(config, intakeValues);
      var res = await fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          product: config.roleId,
          type: "paid",
          results: {
            profile: { roleLabel: profile.roleLabel, seniorityLabel: profile.seniorityLabel },
            landscape: landscape,
            skills: results,
            recommendations: recommendations,
          },
        }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateEmail(trimmed);
      freeEmailSentRef.current = true;
      setManualEmailSent(true);
    } catch (e) {
      setManualEmailError("Something went wrong. Please try again.");
    } finally {
      setManualEmailLoading(false);
    }
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
    var loadingCopy = (config.copy && config.copy.loading) || {};
    setLoading(true);
    setLoadingMsg(loadingCopy.landscapeMsg || "Reading your landscape…");
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
      setError(loadingCopy.landscapeError || "Something went wrong — please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchScores() {
    if (!skills || skills.length === 0) return;
    var loadingCopy = (config.copy && config.copy.loading) || {};
    setLoading(true);
    setLoadingMsg(loadingCopy.scoringMsg || "Scoring your Defensible Zone™…");
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
      setError(loadingCopy.scoringError || "Analysis failed — please try again in a moment.");
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

  // ── effects (visual parity with EmployerEngineer.jsx) ──────────────────

  // Reseed fluencies from conscience/pull whenever either changes, skipping
  // any skill the user has manually adjusted.
  useEffect(
    function () {
      setFluencies(function (prev) {
        var next = Object.assign({}, prev);
        skills.forEach(function (s) {
          if (!adjustedSkillsRef.current.has(s.id)) {
            next[s.id] = getSeed(conscience, pull);
          }
        });
        return next;
      });
    },
    [conscience, pull, skills]
  );

  // Serif display font + page background (mount-only, mirrors live).
  useEffect(function () {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = S.bg;
    return function () {
      document.body.style.background = "";
    };
  }, []);

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [currentStep]
  );

  // gate_token URL verification (mount-only) — restores saved progress
  // (nested intakeValues OR legacy flat shape) and jumps straight to the
  // verified gate step, matching live EmployerEngineer's magic-link flow.
  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    var gateToken = params.get("gate_token");
    if (!gateToken) return;
    window.history.replaceState({}, "", window.location.pathname);
    setGateLoading(true);
    (async function () {
      try {
        var res = await fetch("/api/verify-gate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: gateToken, product: config.roleId }),
        });
        var data = await res.json();
        if (data && data.valid === true) {
          var savedRaw = null;
          try {
            savedRaw = storageKey ? localStorage.getItem(storageKey) : null;
          } catch (_e) {}
          if (savedRaw) {
            var expired = false;
            try {
              var s = JSON.parse(savedRaw);
              if (!s.savedAt || Date.now() - s.savedAt > SAVE_TTL_MS) {
                if (storageKey) localStorage.removeItem(storageKey);
                expired = true;
              } else {
                var restoredValues = extractIntakeValuesFromSaved(s, intakeFields);
                setIntakeValues(function (prev) {
                  return Object.assign({}, prev, restoredValues);
                });
                if (Array.isArray(s.skills)) {
                  setSkills(s.skills);
                  var adj = new Set(
                    s.skills.map(function (sk) {
                      return sk.id;
                    })
                  );
                  adjustedSkillsRef.current = adj;
                  setAdjustedSkills(new Set(adj));
                }
                if (s.fluencies) setFluencies(s.fluencies);
                if (s.conscience !== undefined) setConscience(s.conscience);
                if (s.pull !== undefined) setPull(s.pull);
                if (isPerSkill) {
                  if (s.skillConscience) setSkillConscience(s.skillConscience);
                  if (s.skillPull) setSkillPull(s.skillPull);
                }
                if (typeof s.landscape === "string") setLandscape(s.landscape);
                if (typeof s.skillsGroundedInResume === "boolean") {
                  setSkillsGroundedInResume(s.skillsGroundedInResume);
                }
                if (s.results) setResults(s.results);
                if (s.recommendations) setRecommendations(s.recommendations);
                if (s.benchmark) setBenchmark(s.benchmark);
              }
            } catch (_e) {}
            if (expired) {
              setCurrentStep(startAt);
              setGateOnDifferentDevice(true);
            } else {
              if (data.email) setGateEmail(data.email);
              setGateVerified(true);
              if (stepOrder.indexOf("gate") !== -1) setCurrentStep("gate");
            }
          } else {
            setCurrentStep(startAt);
            setGateOnDifferentDevice(true);
          }
          setGateLoading(false);
          return;
        }
        if (data && data.valid === false && data.reason === "expired") {
          setGateError("expired");
        } else {
          setGateError("invalid");
        }
        if (stepOrder.indexOf("gate") !== -1) setCurrentStep("gate");
        setGateLoading(false);
      } catch (_e) {
        setGateError("invalid");
        if (stepOrder.indexOf("gate") !== -1) setCurrentStep("gate");
        setGateLoading(false);
      }
    })();
    // Mount-only URL check (mirrors live gate_token handling).
  }, []);

  // Once verified on the gate step with skills ready, score automatically.
  useEffect(
    function () {
      if (currentStep === "gate" && effectivelyVerified && skills.length > 0 && !results) {
        fetchScores();
      }
    },
    [currentStep, effectivelyVerified, skills, results]
  );

  // Once scores land, kick off recommendations automatically.
  useEffect(
    function () {
      if (results && !recommendations && !recsLoading) {
        fetchRecommendations(getScoredSkills(results));
      }
    },
    [results, recommendations, recsLoading]
  );

  // Free results email — fires once when a verified user with a known email
  // lands on results with scores but before recommendations exist.
  useEffect(
    function () {
      if (currentStep !== "results" || !results) return;
      if (!gateEmail || !gateEmail.trim()) return;
      if (freeEmailSentRef.current) return;
      freeEmailSentRef.current = true;
      var profile = buildUiProfile(config, intakeValues);
      fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail.trim(),
          product: config.roleId,
          type: "free",
          results: {
            profile: { roleLabel: profile.roleLabel, seniorityLabel: profile.seniorityLabel },
            landscape: landscape,
            skills: results,
          },
        }),
      }).catch(function () {});
    },
    [currentStep, results]
  );

  // Paid (full report) results email — fires once when recommendations land.
  useEffect(
    function () {
      if (!recommendations) return;
      if (!results) return;
      if (!gateEmail || !gateEmail.trim()) return;
      if (paidEmailSentRef.current) return;
      paidEmailSentRef.current = true;
      var profile = buildUiProfile(config, intakeValues);
      fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail.trim(),
          product: config.roleId,
          type: "paid",
          results: {
            profile: { roleLabel: profile.roleLabel, seniorityLabel: profile.seniorityLabel },
            landscape: landscape,
            skills: results,
            recommendations: recommendations,
          },
        }),
      }).catch(function () {});
    },
    [recommendations]
  );

  // "Resend the link" appears 20s after the gate email is sent.
  useEffect(
    function () {
      if (!gateSent) {
        setShowResend(false);
        return;
      }
      setShowResend(false);
      var t = setTimeout(function () {
        setShowResend(true);
      }, 20000);
      return function () {
        clearTimeout(t);
      };
    },
    [gateSent]
  );

  // ── JSX shell ─────────────────────────────────────────────────────────

  if (!config) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        EmployerEngine: missing required <code>config</code> prop.
      </div>
    );
  }

  var copy = getCopy(config);
  var intakeCopy = copy.intake || {};
  var skillsCopy = copy.skills || {};
  var affinityCopy = copy.affinity || {};
  var gateCopy = copy.gate || {};
  var resultsCopy = copy.results || {};
  var loadingCopyForRender = copy.loading || {};
  var editionLine = copy.editionLine || "";
  var uiProfile = buildUiProfile(config, intakeValues);

  if (loading) {
    var loadingSub =
      currentStep === "intake"
        ? loadingCopyForRender.landscapeSub || ""
        : loadingCopyForRender.scoringSub || "";
    return (
      <div style={{ background: S.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: S.font, padding: "32px 20px", boxSizing: "border-box" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <style dangerouslySetInnerHTML={{ __html: "@keyframes spin{to{transform:rotate(360deg)}}" }} />
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 20px" }}>
            <div style={{ width: 52, height: 52, border: "3px solid " + S.border, borderTop: "3px solid " + S.gold, borderRadius: "50%", margin: "0 auto 28px", animation: "spin 0.85s linear infinite" }} />
            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: "0 0 10px", letterSpacing: "0.08em" }}>{editionLine}</p>
            <p style={{ fontFamily: S.serif, fontSize: 22, color: S.text, fontStyle: "italic", margin: "0 0 10px" }}>{loadingMsg}</p>
            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: 0, letterSpacing: "0.08em" }}>{loadingSub}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gateLoading) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, display: "flex", flexDirection: "column", padding: "32px 20px", boxSizing: "border-box" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <style dangerouslySetInnerHTML={{ __html: "@keyframes dzGateDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>{editionLine}</div>
            <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{gateCopy.verifyingEmail}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzGateDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── INTAKE ──────────────────────────────────────────────────────────
  if (currentStep === "intake") {
    function renderSelectCard(field, isReveal) {
      var value = intakeValues[field.id];
      var opts = getAvailableOptions(field.id);
      var label = fieldDisplayLabel(field, config);
      var nested = nestedTextFieldFor(intakeFields, field);
      var nestedVisible = !!(nested && isFieldVisible(nested, intakeValues));
      var displayValue = value ? resolveIntakeDisplayValue(field, value, intakeValues) : "";
      if (nestedVisible && intakeValues[nested.id]) {
        displayValue = intakeValues[nested.id];
      }
      return (
        <Card key={field.id} style={{ marginBottom: 12 }} className={isReveal ? "reveal" : undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Label style={{ marginBottom: 0 }}>
              {label}
              {field.id === "companyType" && intakeCopy.companyOptionalSuffix ? (
                <span style={{ color: S.dim, fontWeight: 400, textTransform: "none" }}>
                  {" "}
                  {intakeCopy.companyOptionalSuffix}
                </span>
              ) : null}
            </Label>
            {value ? (
              <span style={{ fontFamily: S.mono, fontSize: 12, color: S.green, fontWeight: 700 }}>✓ {displayValue}</span>
            ) : null}
          </div>
          {field.id === "companyType" && intakeCopy.companyHelper ? (
            <p style={{ color: S.muted, fontSize: 16, margin: "0 0 12px", lineHeight: 1.6 }}>{intakeCopy.companyHelper}</p>
          ) : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 8 }}>
            {opts.map(function (opt) {
              var key = optionKey(opt);
              var active = String(value) === String(key);
              var desc = optionDesc(opt);
              var sub = optionSub(opt);
              var note = optionNote(opt);
              return (
                <SelBtn key={key} active={active} onClick={function () { selectOption(field, key); }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: sub ? 2 : 0 }}>{optionLabel(opt)}</div>
                    {desc ? <div style={{ fontSize: 15, opacity: 0.75, marginTop: 1 }}>{desc}</div> : null}
                    {sub ? <div style={{ fontSize: 15, opacity: 0.75 }}>{sub}</div> : null}
                    {note ? <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>{note}</div> : null}
                  </div>
                </SelBtn>
              );
            })}
          </div>
          {nested && nestedVisible ? (
            <div style={{ marginTop: 12 }} className="reveal">
              <input
                autoFocus
                value={intakeValues[nested.id] || ""}
                onChange={function (e) { setIntakeValue(nested.id, e.target.value); }}
                placeholder={intakeCopy[nested.id + "Placeholder"] || ""}
                style={inputStyle}
              />
            </div>
          ) : null}
        </Card>
      );
    }

    function renderMultiSelectCard(field) {
      var value = Array.isArray(intakeValues[field.id]) ? intakeValues[field.id] : [];
      var isExpanded = !!expandedFields[field.id];
      var opts = resolveDisplayOptions(field, intakeValues, isExpanded);
      var hiddenCount = expandableHiddenCount(field, intakeValues);
      var label = fieldDisplayLabel(field, config);
      var showFilteredHint = hiddenCount > 0 && !isExpanded;
      var parents = parentIdsOf(field);
      var parentLabel = "";
      if (parents.length) {
        var parentField = findIntakeField(config, parents[0]);
        if (parentField) {
          var parentParts = resolveSelectedOptions(parentField, intakeValues[parents[0]], intakeValues);
          parentLabel = parentParts.length && parentParts[0].label ? parentParts[0].label : "";
        }
      }
      var exp = field.expandable;
      var showExpandTrigger = exp && exp.enabled && hiddenCount > 0 && (exp.mode === "toggle" || !isExpanded);
      return (
        <Card key={field.id} style={{ marginBottom: 12 }} className="reveal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <Label style={{ marginBottom: 0 }}>{label}</Label>
            <span style={{ fontFamily: S.mono, fontSize: 12, color: value.length > 0 ? S.gold : S.dim, fontWeight: 700 }}>
              {value.length > 0
                ? interpolateCopy(intakeCopy.workContextsSelectedHint, { count: value.length })
                : intakeCopy.workContextsSelectHint}
            </span>
          </div>
          <p style={{ color: S.muted, fontSize: 16, margin: "0 0 14px", lineHeight: 1.7 }}>
            {intakeCopy.workContextsHelper}
            {showFilteredHint ? (
              <span style={{ color: S.dim }}>
                {interpolateCopy(intakeCopy.workContextsFilteredHint, { count: opts.length, devTypeLabel: parentLabel })}
              </span>
            ) : null}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {opts.map(function (opt) {
              var key = optionKey(opt);
              var active = value.indexOf(key) !== -1;
              var cap =
                field.maxSelections != null && field.maxSelections > 0
                  ? field.maxSelections
                  : null;
              var atCap = cap != null && value.length >= cap;
              var cappedOut = !active && atCap;
              return (
                <span key={key} style={{ opacity: cappedOut ? 0.4 : 1, pointerEvents: cappedOut ? "none" : "auto" }}>
                  <Chip
                    label={optionLabel(opt)}
                    active={active}
                    onClick={function () {
                      if (active) {
                        setIntakeValue(field.id, value.filter(function (x) { return x !== key; }));
                        return;
                      }
                      if (cap != null && value.length >= cap) return;
                      setIntakeValue(field.id, value.concat([key]));
                    }}
                  />
                </span>
              );
            })}
          </div>
          {showExpandTrigger ? (
            <button
              type="button"
              onClick={function () {
                if (exp.mode === "toggle" && isExpanded) setFieldExpanded(field.id, false);
                else setFieldExpanded(field.id, true);
              }}
              style={{ background: "none", border: "1px dashed " + S.border, borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, marginBottom: 12 }}
            >
              {exp.mode === "toggle" && isExpanded ? formatExpandableCollapseLabel(field) : formatExpandableTriggerLabel(field, hiddenCount)}
            </button>
          ) : null}
        </Card>
      );
    }

    function renderFileCard(field) {
      var value = intakeValues[field.id];
      var fileMeta = fileUploadState[field.id] || {};
      var label = fieldDisplayLabel(field, config);
      return (
        <Card key={field.id} style={{ marginBottom: 12 }} className="reveal">
          <Label style={{ marginBottom: 8 }}>
            {label} <span style={{ color: S.dim, fontWeight: 400, textTransform: "none" }}>{intakeCopy.resumeOptionalSuffix || ""}</span>
          </Label>
          {!isEmptyIntakeValue(value) ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: S.mono, fontSize: 12, color: S.green, fontWeight: 700 }}>✓ {fileMeta.fileName || "Uploaded file"}</span>
              <button
                type="button"
                onClick={function () { removeFileField(field.id); }}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, textDecoration: "underline" }}
              >
                {intakeCopy.resumeRemove || "Remove"}
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={function (el) { fileInputRefs.current[field.id] = el; }}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={function (e) { handleFileFieldSelect(field, e); }}
                disabled={!!fileMeta.uploading}
                style={Object.assign({}, inputStyle, { padding: "10px 12px", fontSize: 14 })}
              />
              {fileMeta.uploading ? (
                <p style={{ color: S.muted, fontSize: 14, margin: "8px 0 0", fontFamily: S.mono }}>{intakeCopy.resumeReading || "Reading your resume…"}</p>
              ) : null}
            </div>
          )}
          {fileMeta.error ? <p style={{ color: S.muted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}>{fileMeta.error}</p> : null}
        </Card>
      );
    }

    function renderTextCard(field) {
      var label = fieldDisplayLabel(field, config);
      return (
        <Card key={field.id} style={{ marginBottom: 12 }} className="reveal">
          <Label style={{ marginBottom: 8 }}>{label}</Label>
          <input value={intakeValues[field.id] || ""} onChange={function (e) { setIntakeValue(field.id, e.target.value); }} style={inputStyle} />
        </Card>
      );
    }

    function renderIntakeFieldCard(field, isFirst) {
      if (field.type === "select") return renderSelectCard(field, !isFirst);
      if (field.type === "multiSelect") return renderMultiSelectCard(field);
      if (field.type === "file") return renderFileCard(field);
      return renderTextCard(field);
    }

    function renderNudge() {
      for (var i = 0; i < intakeFields.length; i++) {
        var field = intakeFields[i];
        if (isNestedTextField(intakeFields, field)) continue;
        if (!isFieldVisible(field, intakeValues)) continue;
        if (field.required !== true) continue;
        if (!isEmptyIntakeValue(intakeValues[field.id])) continue;
        var msg = intakeCopy[nudgeCopyKeyFor(field.id)];
        if (!msg) return null;
        return (
          <p style={{ color: S.dim, fontSize: 14, fontFamily: S.mono, textAlign: "center", marginTop: 8 }}>{msg}</p>
        );
      }
      return null;
    }

    var firstVisibleFieldId = null;
    for (var fi = 0; fi < intakeFields.length; fi++) {
      if (isNestedTextField(intakeFields, intakeFields[fi])) continue;
      firstVisibleFieldId = intakeFields[fi].id;
      break;
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px" }}>
        <style dangerouslySetInnerHTML={{ __html: FADE_SLIDE_CSS }} />
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 10, fontWeight: 600 }}>
              {copy.heroEyebrow || editionLine}
            </div>
            {renderHeroHeadline(intakeCopy.heroHeadline)}
            <p style={{ color: S.muted, fontSize: 16, lineHeight: 1.75, margin: 0, maxWidth: 540 }}>{intakeCopy.heroBody}</p>
          </div>

          {intakeFields.map(function (field, index) {
            if (isNestedTextField(intakeFields, field)) return null;
            if (!isFieldVisible(field, intakeValues)) return null;
            if (!precedingRequiredFilled(intakeFields, intakeValues, index)) return null;
            return renderIntakeFieldCard(field, field.id === firstVisibleFieldId);
          })}

          {canProceed ? (
            <div className="reveal">
              {error ? (
                <p style={{ color: S.red, fontSize: 14, fontFamily: S.mono, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{error}</p>
              ) : null}
              <PrimaryBtn onClick={fetchLandscapeAndSkills} disabled={!canProceed}>{intakeCopy.generateButton}</PrimaryBtn>
              <p style={{ color: S.dim, fontSize: 14, textAlign: "center", marginTop: 12, fontFamily: S.mono }}>{intakeCopy.ctaHelper}</p>
            </div>
          ) : null}

          {renderNudge()}
        </div>
      </div>
    );
  }

  // ── SKILLS ──────────────────────────────────────────────────────────
  if (currentStep === "skills") {
    var profileSummaryUpper = uiProfile.summary.toUpperCase();
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>
              {interpolateCopy(skillsCopy.stepEyebrow, { profileSummary: profileSummaryUpper })}
            </div>
            <h2 style={{ fontFamily: S.serif, fontSize: 30, color: S.text, margin: "0 0 6px" }}>{skillsCopy.heading}</h2>
          </div>
          <div style={{ background: "linear-gradient(135deg,rgba(26,29,46,.97),rgba(26,29,46,.92))", borderRadius: 14, padding: 22, marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, background: "radial-gradient(circle,rgba(217,119,6,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "rgba(217,119,6,.8)", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
              {interpolateCopy(skillsCopy.landscapeEyebrow, { devTypeLabel: uiProfile.devLabel.toUpperCase(), seniorityLabel: uiProfile.seniorityLabel.toUpperCase() })}
            </div>
            <p style={{ color: "rgba(240,242,248,.9)", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{landscape}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {uiProfile.workContextLabels.map(function (wc) {
              return (
                <span key={wc} style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 12, padding: "3px 10px", fontWeight: 600 }}>
                  {wc}
                </span>
              );
            })}
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <Label style={{ marginBottom: 0 }}>{skillsCopy.skillsLabel}</Label>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: skills.length >= 8 ? S.red : S.dim, fontWeight: 700 }}>{skills.length} / 8</div>
            </div>
            <p style={{ color: S.muted, fontSize: 16, margin: "0 0 16px", lineHeight: 1.6 }}>{skillsCopy.skillsHelper}</p>
            {skillsGroundedInResume ? (
              <div style={{ fontSize: 15, color: S.green, lineHeight: 1.6, margin: "-8px 0 16px" }}>{skillsCopy.skillsGroundedInResume}</div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {skills.map(function (s, i) {
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: S.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: s.editing ? 9 : 10 }}>
                      <span style={{ color: "white", fontSize: 12, fontFamily: S.mono, fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      {s.editing ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            autoFocus
                            value={s.text}
                            onChange={function (e) { updateText(s.id, e.target.value); }}
                            onKeyDown={function (e) { if (e.key === "Enter" || e.key === "Escape") commitEdit(s.id); }}
                            style={Object.assign({}, inputStyle, { flex: 1 })}
                          />
                          <button onClick={function () { commitEdit(s.id); }} style={{ background: S.accent, border: "none", color: "white", padding: "12px 16px", borderRadius: 8, cursor: "pointer", fontFamily: S.mono, fontSize: 14, fontWeight: 700 }}>✓</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", background: "#f2f4f8", border: "1px solid " + S.border, borderRadius: 10, padding: "10px 14px", gap: 10, minHeight: 46 }}>
                          <span style={{ color: S.text, fontSize: 16, flex: 1, fontWeight: 500, lineHeight: 1.4 }}>{s.text}</span>
                          <button onClick={function () { startEditing(s.id); }} style={{ background: "none", border: "1px solid " + S.border, color: S.muted, cursor: "pointer", fontSize: 12, padding: "4px 9px", borderRadius: 6, fontFamily: S.mono, whiteSpace: "nowrap" }}>
                            {skillsCopy.editButton}
                          </button>
                          <button onClick={function () { removeSkill(s.id); }} style={{ background: "none", border: "none", color: S.dim, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Usage card intentionally skipped for this migration pass (task instruction: SKIP the AI Usage card on skills step). */}

          {error ? (
            <p style={{ color: S.red, fontSize: 14, fontFamily: S.mono, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{error}</p>
          ) : null}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={goBack} style={{ flex: 1, background: "transparent", border: "1px solid " + S.border, color: S.muted, borderRadius: 12, padding: "15px 0", fontSize: 14, fontFamily: S.mono, cursor: "pointer", letterSpacing: "0.06em", fontWeight: 600 }}>
              {skillsCopy.backButton}
            </button>
            <PrimaryBtn onClick={goToAffinityFromSkills} disabled={skills.length === 0} style={{ flex: 3 }}>
              {skills.length === 0 ? skillsCopy.nextEmpty : skillsCopy.nextReady}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    );
  }

  // ── AFFINITY ────────────────────────────────────────────────────────
  if (currentStep === "affinity") {
    var conscienceLabelTexts = affinityCopy.conscienceStops || [];
    var pullLabelTexts = affinityCopy.pullStops || [];
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px" }}>
        <style dangerouslySetInnerHTML={{ __html: DZ_SLIDER_CSS }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.purple, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>{affinityCopy.stepEyebrow}</div>
            <h2 style={{ fontFamily: S.serif, fontSize: 30, color: S.text, margin: "0 0 8px" }}>{affinityCopy.heading}</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 12, padding: "3px 10px", fontWeight: 600 }}>{uiProfile.roleLabel}</span>
              <span style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, background: S.card2, border: "1px solid " + S.border, borderRadius: 12, padding: "3px 10px", fontWeight: 600 }}>{uiProfile.seniorityLabel}</span>
            </div>
            <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{affinityCopy.intro}</p>
          </div>
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>{affinityCopy.part1Label}</div>
          <div style={{ fontSize: 15, color: "#7a88a8", marginBottom: 24 }}>{affinityCopy.part1Helper}</div>

          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em" }}>{affinityCopy.craftConscienceLabel}</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>{affinityCopy.craftConscienceQuestion}</p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>{affinityCopy.craftConscienceHelper}</p>
            <input
              className="dz-slider conscience-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={conscience}
              onChange={function (e) { setConscience(snapToStop(Number(e.target.value))); }}
              style={{ background: "linear-gradient(to right, #7c3aed " + (conscience / 10) * 100 + "%, #d0d7e8 " + (conscience / 10) * 100 + "%)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {AFFINITY_STOPS.map(function (stopValue, idx) {
                return (
                  <div key={stopValue} style={{ width: "20%", textAlign: "center", fontSize: 12, color: "#7c3aed", opacity: Math.abs(conscience - stopValue) <= 1 ? 1 : 0.25, fontWeight: Math.abs(conscience - stopValue) <= 1 ? 700 : 400 }}>
                    {conscienceLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0891b2", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#0891b2", letterSpacing: "0.08em" }}>{affinityCopy.intrinsicPullLabel}</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>{affinityCopy.intrinsicPullQuestion}</p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>{affinityCopy.intrinsicPullHelper}</p>
            <input
              className="dz-slider pull-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={pull}
              onChange={function (e) { setPull(snapToStop(Number(e.target.value))); }}
              style={{ background: "linear-gradient(to right, #0891b2 " + (pull / 10) * 100 + "%, #d0d7e8 " + (pull / 10) * 100 + "%)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {AFFINITY_STOPS.map(function (stopValue, idx) {
                return (
                  <div key={stopValue} style={{ width: "20%", textAlign: "center", fontSize: 12, color: "#0891b2", opacity: Math.abs(pull - stopValue) <= 1 ? 1 : 0.25, fontWeight: Math.abs(pull - stopValue) <= 1 ? 700 : 400 }}>
                    {pullLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #d0d7e8", margin: "32px 0" }} />
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>{affinityCopy.part2Label}</div>
          <div style={{ fontSize: 15, color: "#7a88a8", lineHeight: 1.6, marginBottom: 8 }}>{affinityCopy.part2Helper}</div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>{affinityCopy.part2Hint}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {skills.map(function (s) {
              var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              var affinityScore = compAff(conscience, pull, fluencyVal);
              var affinityColor = affinityScore >= 7 ? S.green : affinityScore >= 5 ? S.gold : S.red;
              return (
                <div key={s.id} style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: S.text }}>{s.text}</div>
                    </div>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, fontFamily: S.mono, flexShrink: 0, background: adjustedSkills.has(s.id) ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.10)", color: adjustedSkills.has(s.id) ? "#d97706" : "#059669" }}>
                      {adjustedSkills.has(s.id) ? affinityCopy.adjustedBadge : affinityCopy.preSeededBadge}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>{affinityCopy.feltFluencyLabel}</span>
                    <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#d97706" }}>{fluencyVal}/10</span>
                  </div>
                  <input
                    className="dz-slider fluency-sl"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={fluencyVal}
                    onChange={function (e) {
                      var val = Number(e.target.value);
                      setFluencies(function (prev) { return Object.assign({}, prev, { [s.id]: val }); });
                      markAdjusted(s.id);
                    }}
                    style={{ background: "linear-gradient(to right, #d97706 " + (fluencyVal / 10) * 100 + "%, #d0d7e8 " + (fluencyVal / 10) * 100 + "%)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{affinityCopy.fluencyLow}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{affinityCopy.fluencyHigh}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>{affinityCopy.affinityScoreLabel}</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: affinityColor }}>{affinityScore}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button onClick={goBack} style={{ flex: 1, background: "transparent", border: "1px solid " + S.border, color: S.muted, borderRadius: 12, padding: "15px 0", fontSize: 14, fontFamily: S.mono, cursor: "pointer", letterSpacing: "0.06em", fontWeight: 600 }}>
              {affinityCopy.backButton}
            </button>
            <PrimaryBtn onClick={goToGateFromAffinity} disabled={skills.length === 0} style={{ flex: 3 }}>{affinityCopy.analyzeButton}</PrimaryBtn>
          </div>
        </div>
      </div>
    );
  }

  // ── GATE ────────────────────────────────────────────────────────────
  if (currentStep === "gate") {
    var fullScreenCenter = { background: S.bg, minHeight: "100vh", fontFamily: S.font, display: "flex", flexDirection: "column", padding: "32px 20px", boxSizing: "border-box" };
    var gateTryAgainBtn = { width: "100%", marginTop: 20, background: S.accent, color: "#ffffff", border: "none", borderRadius: 10, padding: 16, fontSize: 16, fontWeight: 600, fontFamily: S.mono, letterSpacing: "0.06em", cursor: "pointer" };

    if (effectivelyVerified) {
      return (
        <div style={fullScreenCenter}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <style dangerouslySetInnerHTML={{ __html: "@keyframes dzGateDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>{editionLine}</div>
              {error ? (
                <div>
                  <div style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{error}</div>
                  <button type="button" onClick={fetchScores} style={Object.assign({}, gateTryAgainBtn, { marginTop: 0, width: "auto", minWidth: 200 })}>{gateCopy.tryAgain}</button>
                </div>
              ) : (
                <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{gateCopy.scoring}</div>
              )}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
                <span style={{ animation: "dzGateDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ animation: "dzGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ animation: "dzGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    var formShell = { background: S.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", boxSizing: "border-box", fontFamily: S.font };
    var gateCard = { maxWidth: 480, width: "100%", margin: "0 auto", textAlign: "center" };

    if (gateSent) {
      return (
        <div style={formShell}>
          <div style={gateCard}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, fontWeight: 600 }}>{gateCopy.checkInboxEyebrow}</div>
            <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>{gateCopy.sentHeading}</div>
            <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 20 }}>{gateCopy.sentBody}</div>
            <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: S.card2, border: "1px solid " + S.border, fontFamily: S.mono, fontSize: 13, color: S.muted, marginBottom: 28 }}>{gateEmail}</div>
            {showResend ? (
              <button
                type="button"
                onClick={function () { setShowResend(false); handleGateSubmit(); }}
                style={{ background: "transparent", border: "1px solid " + S.border, borderRadius: 10, padding: "10px 20px", fontFamily: S.mono, fontSize: 12, color: S.muted, cursor: "pointer" }}
              >
                {gateCopy.resendLink}
              </button>
            ) : null}
            <div
              role="button"
              tabIndex={0}
              onClick={function () {
                setGateEmail(""); setGateSent(false); setGateError(""); setGateVerified(false);
                setGateLoading(false); setShowResend(false); setCurrentStep(startAt);
              }}
              onKeyDown={function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                setGateEmail(""); setGateSent(false); setGateError(""); setGateVerified(false);
                setGateLoading(false); setShowResend(false); setCurrentStep(startAt);
              }}
              style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, cursor: "pointer", marginTop: 24 }}
            >
              {gateCopy.startOver}
            </div>
          </div>
        </div>
      );
    }

    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    return (
      <div style={formShell}>
        <div style={gateCard}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>{editionLine}</div>
          <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>{gateCopy.readyHeading}</div>
          <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 28 }}>{gateCopy.readyBody}</div>
          {gateError === "expired" ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>{gateCopy.expiredError}</div> : null}
          {gateError === "invalid" ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>{gateCopy.invalidError}</div> : null}
          <input
            type="email"
            placeholder={gateCopy.emailPlaceholder}
            value={gateEmail}
            disabled={gateLoading}
            onFocus={function () { setGateInputFocused(true); }}
            onBlur={function () { setGateInputFocused(false); }}
            onChange={function (e) { setGateEmail(e.target.value); if (showExpiredInvalid) setGateError(""); }}
            style={{ width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: S.font, border: gateInputFocused ? "1px solid " + S.gold : "1px solid " + S.border, borderRadius: 10, outline: "none", boxSizing: "border-box", background: "#ffffff", color: S.text }}
          />
          {gateError && !showExpiredInvalid ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{gateError}</div> : null}
          <button
            type="button"
            onClick={handleGateSubmit}
            disabled={gateLoading}
            style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 600, fontFamily: S.font, background: gateLoading ? "#e5a820" : S.gold, color: "#ffffff", border: "none", borderRadius: 10, cursor: gateLoading ? "not-allowed" : "pointer", marginTop: 12 }}
          >
            {gateCopy.submitButton}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ─────────────────────────────────────────────────────────
  if (currentStep === "results" && results && getScoredSkills(results).length > 0) {
    var scoredSkills = getScoredSkills(results);
    var totalDZ = Math.round(
      scoredSkills.reduce(function (sum, s) { return sum + (s.dz || 0); }, 0) / scoredSkills.length
    );
    var dzLabels = resultsCopy.dzLabels || {};
    var dzLabelColor = totalDZ >= 70 ? S.green : totalDZ >= 50 ? S.gold : totalDZ >= 30 ? S.orange : S.red;
    var dzLabelText = totalDZ >= 70 ? dzLabels.high : totalDZ >= 50 ? dzLabels.moderate : totalDZ >= 30 ? dzLabels.mixed : dzLabels.low;
    var dzBarColor = function (score) {
      if (score >= 65) return S.green;
      if (score >= 40) return S.gold;
      return S.red;
    };
    var sortedDZ = scoredSkills.slice().sort(function (a, b) { return (b.dz || 0) - (a.dz || 0); });
    var topSkills = sortedDZ.slice(0, 3);
    var atRisk = sortedDZ.slice(-3);
    var phasesCopy = resultsCopy.phases || [];
    var PHASE_META = phasesCopy.map(function (p, i) { return { phase: i + 1, label: p.label, framing: p.framing }; });

    var rawRecs = recommendations && recommendations.recommendations ? recommendations.recommendations.slice() : [];
    var byId = {};
    rawRecs.forEach(function (r) { byId[r.id] = r; });
    scoredSkills.forEach(function (s) {
      if (rawRecs.length < scoredSkills.length && !byId[s.id]) {
        rawRecs.push({ id: s.id, headline: "", action: "", why: "" });
        byId[s.id] = rawRecs[rawRecs.length - 1];
      }
    });
    var recList = rawRecs.slice(0, scoredSkills.length);
    var groupedByPhase = PHASE_META.map(function (meta) {
      return { meta: meta, recs: recList.filter(function (r) { return r.phase === meta.phase; }) };
    }).filter(function (g) { return g.recs.length > 0; });
    var hasPhases = groupedByPhase.length > 1;

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 20, fontWeight: 600 }}>{editionLine}</div>
          <h1 style={{ fontFamily: S.serif, fontSize: 34, color: S.text, margin: "0 0 6px", lineHeight: 1.15, fontWeight: 600 }}>{resultsCopy.heading}</h1>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>{uiProfile.summary}</p>

          <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 16, padding: 28, marginBottom: 24, display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", border: "4px solid " + dzLabelColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: dzLabelColor, lineHeight: 1, fontFamily: S.mono }}>{totalDZ}</span>
              <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: S.mono, marginTop: 2 }}>/ 100</span>
            </div>
            <div>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 6 }}>{resultsCopy.overallLabel}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: dzLabelColor, marginBottom: 6, fontFamily: S.serif }}>{dzLabelText}</div>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.55, margin: 0 }}>{resultsCopy.overallHelper}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.green, letterSpacing: "0.1em", marginBottom: 14, fontWeight: 700 }}>{resultsCopy.mostDefensible}</div>
              {topSkills.map(function (s) {
                return (
                  <div key={s.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.text, lineHeight: 1.35, marginBottom: 4 }}>{s.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: s.dz + "%", height: "100%", background: S.green, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: S.mono, fontSize: 12, color: S.green, fontWeight: 700, minWidth: 28, textAlign: "right" }}>{s.dz}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.red, letterSpacing: "0.1em", marginBottom: 14, fontWeight: 700 }}>{resultsCopy.mostExposed}</div>
              {atRisk.map(function (s) {
                return (
                  <div key={s.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.text, lineHeight: 1.35, marginBottom: 4 }}>{s.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: s.dz + "%", height: "100%", background: dzBarColor(s.dz), borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: S.mono, fontSize: 12, color: dzBarColor(s.dz), fontWeight: 700, minWidth: 28, textAlign: "right" }}>{s.dz}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: S.dim, marginBottom: 14 }}>{resultsCopy.fullBreakdown}</div>
            {scoredSkills.map(function (s) {
              var col = dzBarColor(s.dz);
              return (
                <div key={s.id} style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 12, padding: "16px 18px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: S.text, flex: 1, paddingRight: 12, lineHeight: 1.35 }}>{s.text}</div>
                    <div style={{ fontFamily: S.mono, fontSize: 22, fontWeight: 700, color: col, flexShrink: 0, lineHeight: 1 }}>{s.dz}</div>
                  </div>
                  <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ width: s.dz + "%", height: "100%", background: col, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", gap: 18, marginBottom: s.rationale ? 10 : 0 }}>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>{resultsCopy.affinityCol}</div>
                      <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{s.affinity}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>{resultsCopy.aiRiskCol}</div>
                      <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: s.ai_replaceability >= 7 ? S.red : s.ai_replaceability >= 5 ? S.gold : S.green }}>{s.ai_replaceability}/10</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>{resultsCopy.demandCol}</div>
                      <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: S.blue }}>{s.market_demand}/10</div>
                    </div>
                  </div>
                  {s.rationale ? (
                    <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5, borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>{s.rationale}</div>
                  ) : null}
                </div>
              );
            })}

            <div style={{ background: "#f2f4f8", borderRadius: 12, padding: "16px 20px", marginTop: 8, marginBottom: 28 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: S.dim, letterSpacing: "0.06em", marginBottom: 10, fontWeight: 700 }}>{resultsCopy.howCalculatedHeading}</div>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "#3d4a6b", margin: "0 0 12px" }}>{resultsCopy.howCalculatedBody}</p>
              <p style={{ fontSize: 14, color: "#9ca3af", fontStyle: "italic", margin: 0, lineHeight: 1.65 }}>{resultsCopy.howCalculatedFootnote}</p>
            </div>

            {recsLoading ? (
              <div style={{ background: "#f8f9fc", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: S.font }}>
                <style dangerouslySetInnerHTML={{ __html: "@keyframes dzRecsDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
                <div style={{ fontFamily: S.mono, fontSize: 12, letterSpacing: "0.12em", color: S.gold, marginBottom: 32 }}>{editionLine}</div>
                <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: 0, lineHeight: 1.2 }}>{resultsCopy.recsLoadingHeading}</h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#6b7280", maxWidth: 380, textAlign: "center", marginTop: 12, marginBottom: 0 }}>{resultsCopy.recsLoadingBody}</p>
                <div style={{ display: "flex", gap: 10, marginTop: 32, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzRecsDots 1s ease-in-out infinite" }}>.</span>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzRecsDots 1s ease-in-out 0.2s infinite" }}>.</span>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzRecsDots 1s ease-in-out 0.4s infinite" }}>.</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 40 }}>
                  {(resultsCopy.recsLoadingChips || []).map(function (chip) {
                    return (
                      <span key={chip} style={{ background: "white", border: "1px solid #d0d7e8", borderRadius: 20, padding: "8px 16px", fontSize: 13, color: "#6b7280", fontFamily: S.font }}>{chip}</span>
                    );
                  })}
                </div>
              </div>
            ) : recsError ? (
              <div style={{ textAlign: "center", maxWidth: 400, margin: "24px auto 28px" }}>
                <p style={{ color: S.red, fontSize: 16, margin: "0 0 20px" }}>{recsError}</p>
                <button
                  type="button"
                  onClick={function () { fetchRecommendations(scoredSkills); }}
                  style={{ background: "#D97706", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontFamily: S.font, fontWeight: 600, cursor: "pointer" }}
                >
                  {resultsCopy.tryAgain}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 600, color: S.text, margin: "0 0 10px", lineHeight: 1.2 }}>{resultsCopy.actionPlanHeading}</h2>
                  <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                    {interpolateCopy(resultsCopy.actionPlanHelper, { seniorityLabel: uiProfile.seniorityLabel, devTypeLabel: uiProfile.devLabel })}
                  </p>
                </div>
                <div style={{ marginBottom: 28 }}>
                  {(hasPhases ? groupedByPhase : [{ meta: null, recs: recList }]).map(function (group, groupIdx) {
                    return (
                      <div key={groupIdx}>
                        {group.meta ? (
                          <div style={{ marginBottom: 20, marginTop: groupIdx === 0 ? 0 : 48, background: "linear-gradient(135deg, #1a1d2e 0%, #2d1f6e 100%)", borderRadius: 14, padding: "22px 24px" }}>
                            <div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 8 }}>
                              {group.meta.label.split("—")[0].trim()}
                            </div>
                            <div style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 700, color: "#ffffff", lineHeight: 1.2, marginBottom: 10 }}>
                              {group.meta.label.split("—").slice(1).join("—").trim()}
                            </div>
                            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 10, fontStyle: "italic" }}>
                              {group.meta.framing}
                            </div>
                          </div>
                        ) : null}
                        {group.recs.map(function (rec, idx) {
                          var globalIdx = recList.indexOf(rec);
                          var skillRow = scoredSkills.find(function (sd) { return sd.id === rec.id; });
                          var skillName = skillRow ? skillRow.text : rec.id;
                          var dzForBar = skillRow ? skillRow.dz : 0;
                          var barColor = dzBarColor(dzForBar);
                          return (
                            <div key={rec.id + "-" + globalIdx} style={{ display: "flex", background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                              <div style={{ width: 4, background: barColor, flexShrink: 0 }} />
                              <div style={{ padding: "20px 22px", flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }}>{skillName}</div>
                                <div style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 600, color: S.text, lineHeight: 1.3, marginBottom: 10 }}>{rec.headline || "—"}</div>
                                <div style={{ fontSize: 16, color: S.text, lineHeight: 1.6, marginBottom: 10 }}>{rec.action}</div>
                                <div style={{ fontSize: 14, color: "#6b7280", fontStyle: "italic", lineHeight: 1.55 }}>{rec.why}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={resetAll}
            style={{ width: "100%", background: "transparent", border: "1px solid " + S.border, color: S.muted, borderRadius: 12, padding: "15px 0", fontSize: 14, fontFamily: S.mono, cursor: "pointer", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 28 }}
          >
            {resultsCopy.startOver}
          </button>

          <div style={{ background: "#fef9ec", border: "1px solid #f0c060", borderRadius: 12, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>{resultsCopy.disclaimerHeading}</div>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>{resultsCopy.disclaimerBody}</div>
          </div>

          {manualEmailSent || !gateEmail || !gateEmail.trim() ? (
            <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 22px", marginBottom: 28 }}>
              {manualEmailSent ? (
                <div style={{ fontSize: 15, color: S.green, lineHeight: 1.6, textAlign: "center" }}>{resultsCopy.emailCopySent}</div>
              ) : (
                <div>
                  <div style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 600, color: S.text, marginBottom: 10, lineHeight: 1.25 }}>{resultsCopy.emailCopyHeading}</div>
                  <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.65, margin: "0 0 18px" }}>{resultsCopy.emailCopyBody}</p>
                  <input
                    type="email"
                    placeholder={gateCopy.emailPlaceholder}
                    value={manualEmailInput}
                    disabled={manualEmailLoading}
                    onChange={function (e) { setManualEmailInput(e.target.value); if (manualEmailError) setManualEmailError(""); }}
                    style={{ width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: S.font, border: "1px solid " + S.border, borderRadius: 10, outline: "none", boxSizing: "border-box", background: "#ffffff", color: S.text }}
                  />
                  {manualEmailError ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{manualEmailError}</div> : null}
                  <button
                    type="button"
                    onClick={handleManualEmailCopy}
                    disabled={manualEmailLoading}
                    style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 600, fontFamily: S.font, background: manualEmailLoading ? "#e5a820" : S.gold, color: "#ffffff", border: "none", borderRadius: 10, cursor: manualEmailLoading ? "not-allowed" : "pointer", marginTop: 12 }}
                  >
                    {manualEmailLoading ? resultsCopy.emailCopySending : resultsCopy.emailCopyButton}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
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
  isFieldVisible,
  computeCanProceed,
  optionLabel,
  optionNote,
  resolveSelectedOptions,
  resolveIntakeDisplayValue,
  resolveDisplayOptions,
  expandableHiddenCount,
  parseFileToText,
};
