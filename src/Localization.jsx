import { DZNavBar, DZFooter } from "./SharedComponents";
import { useState, useEffect } from "react";

// ── ROLE TYPES ─────────────────────────────────────────────────────────
var ROLE_TYPES = [
  { id:"translator",    label:"Translator / Interpreter",       desc:"Language conversion, from documents to live interpreting" },
  { id:"loc_engineer",  label:"Localization Engineer",          desc:"i18n, file formats, TMS integration, workflow automation" },
  { id:"loc_pm",        label:"Localization PM / Program Manager", desc:"Project delivery, vendor management, cross-functional coordination" },
  { id:"langops",       label:"LangOps / Globalization Strategist", desc:"Localization infrastructure, tooling strategy, org-level program design" },
  { id:"language_data", label:"Language Data / NLP",            desc:"AI training data, annotation, computational linguistics, LLM evaluation" },
  { id:"lang_learning", label:"Language Learning & Content",    desc:"Curriculum design, instructional content, language coaching" },
];

// ── SENIORITY ──────────────────────────────────────────────────────────
var SENIORITY_LEVELS = [
  { id:"junior",   label:"Junior",            sub:"0–2 yrs",  note:"Learning craft, guided tasks" },
  { id:"mid",      label:"Mid-level",         sub:"2–5 yrs",  note:"Owns projects end-to-end" },
  { id:"senior",   label:"Senior",            sub:"5–10 yrs", note:"Sets quality standards, mentors" },
  { id:"lead",     label:"Lead / Manager",    sub:"8+ yrs",   note:"Team or program ownership" },
  { id:"director", label:"Director / Head",   sub:"10+ yrs",  note:"Strategy, org design, exec influence" },
];

// ── CONTENT DOMAINS ────────────────────────────────────────────────────
var CONTENT_DOMAINS = [
  { id:"legal",       label:"Legal & Contracts",           sub:"Agreements, court, compliance" },
  { id:"medical",     label:"Medical & Clinical",          sub:"Healthcare, pharma, clinical trials" },
  { id:"technical",   label:"Technical Documentation",     sub:"Manuals, engineering, software docs" },
  { id:"marketing",   label:"Marketing & Transcreation",   sub:"Brand voice, campaigns, creative adaptation" },
  { id:"software",    label:"Software / UI Localization",  sub:"App strings, product interfaces" },
  { id:"audiovisual", label:"Audiovisual",                 sub:"Subtitling, dubbing, voiceover" },
  { id:"game",        label:"Game Localization",           sub:"In-game text, narrative, culturalization" },
  { id:"literary",    label:"Literary & Publishing",       sub:"Books, journalism, creative works" },
];

// ── LANGUAGE PAIRS ─────────────────────────────────────────────────────
var _LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Chinese (Simplified)", "Chinese (Traditional)", "Korean",
  "Arabic", "Russian", "Dutch", "Polish", "Turkish", "Swedish", "Danish",
  "Finnish", "Norwegian", "Hebrew", "Hindi", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Greek", "Czech", "Romanian", "Hungarian",
  "Ukrainian", "Other / Low-resource language",
];
var LANGUAGE_PAIRS = {
  SOURCE_LANGUAGES: _LANGUAGES,
  TARGET_LANGUAGES: _LANGUAGES,
};

// ── WORK CONTEXTS ──────────────────────────────────────────────────────
var WORK_CONTEXTS = [
  { id:"freelance",         label:"Freelance / Independent" },
  { id:"lsp_small",         label:"Small LSP (< 50 people)" },
  { id:"lsp_large",         label:"Large LSP / Agency" },
  { id:"inhouse_tech",      label:"In-house team at a tech company" },
  { id:"inhouse_enterprise",label:"In-house team at a non-tech enterprise" },
  { id:"tech_vendor",       label:"Localization technology vendor (TMS, MT, etc.)" },
  { id:"edtech",            label:"Language learning / EdTech company" },
  { id:"gov_legal",         label:"Government, legal, or court services" },
  { id:"language_data_co",  label:"Language data / AI training company" },
];

// ── DESIGN TOKENS ──────────────────────────────────────────────────────
var S = {
  bg: "#f8f9fb",
  card: "#ffffff",
  card2: "#f2f4f8",
  border: "#d0d7e8",
  text: "#0d1117",
  muted: "#1e2a42",
  dim: "#4a5568",
  accent: "#1a1d2e",
  gold: "#D97706",
  font: "'DM Sans',system-ui,-apple-system,sans-serif",
  mono: "'DM Mono','Courier New',monospace",
  serif: "'DM Serif Display',Georgia,serif",
};

function getRoleLabel(id) {
  var rt = ROLE_TYPES.find(function (x) { return x.id === id; });
  return rt ? rt.label : id;
}

function getSeniorityLabel(id) {
  var sl = SENIORITY_LEVELS.find(function (x) { return x.id === id; });
  return sl ? sl.label : id;
}

function getWorkContextLabel(id) {
  var wc = WORK_CONTEXTS.find(function (x) { return x.id === id; });
  return wc ? wc.label : id;
}

function getDomainLabels(ids) {
  return ids.map(function (id) {
    var d = CONTENT_DOMAINS.find(function (x) { return x.id === id; });
    return d ? d.label : id;
  });
}

export default function Localization() {
  var [step, setStep] = useState(0);
  var [roleType, setRoleType] = useState("");
  var [seniority, setSeniority] = useState("");
  var [sourceLanguage, setSourceLanguage] = useState("");
  var [targetLanguage, setTargetLanguage] = useState("");
  var [specialization, setSpecialization] = useState("");
  var [contentDomains, setContentDomains] = useState([]);
  var [workContext, setWorkContext] = useState("");
  var [landscape, setLandscape] = useState("");
  var [skills, setSkills] = useState([]);
  var [fluencies, setFluencies] = useState({});
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);

  useEffect(function () {
    var link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0,400;0,600&display=swap";
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
    [step]
  );

  function resetAll() {
    setStep(0);
    setRoleType("");
    setSeniority("");
    setSourceLanguage("");
    setTargetLanguage("");
    setSpecialization("");
    setContentDomains([]);
    setWorkContext("");
    setLandscape("");
    setSkills([]);
    setFluencies({});
    setLoading(false);
    setLoadingMsg("");
    setError(null);
  }

  function buildAnalysisPrompt() {
    var sl = SENIORITY_LEVELS.find(function (x) { return x.id === seniority; });
    var domainLabels = getDomainLabels(contentDomains).join(", ");
    var specLine = specialization.trim() !== "" ? "\n- Specialization: " + specialization.trim() : "";
    return (
      "You are a senior localization and language-industry career strategist specializing in AI labor market analysis for language professionals.\n\n" +
      "PROFESSIONAL PROFILE:\n" +
      "- Role type: " + getRoleLabel(roleType) + "\n" +
      "- Seniority: " + getSeniorityLabel(seniority) + (sl ? " — " + sl.note : "") + "\n" +
      "- Language pair: " + sourceLanguage + " → " + targetLanguage + "\n" +
      "- Content domains: " + domainLabels + "\n" +
      "- Work context: " + getWorkContextLabel(workContext) +
      specLine +
      "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2–3 precise sentences about the AI threat to this exact language professional profile RIGHT NOW (2026). Name specific tools where relevant (DeepL, Google Translate, GPT-4/Claude, Smartling, Phrase, memoQ, SDL Trados, dubbing AI, speech-to-speech). Factor in the language pair — high-resource pairs (e.g. EN↔FR, EN↔ES) face much higher MT quality and AI exposure than low-resource or literary pairs. Factor in content domain — legal/medical/technical vs literary/marketing changes exposure differently. Be specific to this combination, not generic AI commentary.\n\n" +
      "Task 2 — SKILLS: Generate exactly 6 skills that are the most strategically important for this professional to assess for AI defensibility right now. Each skill must include:\n" +
      "- name: a specific skill label (not generic — e.g. 'EN→FR legal contract translation under tight deadlines' not just 'translation')\n" +
      "- aiR: AI replaceability score 0–10 (0 = AI cannot do this today, 10 = AI fully does this today). Calibrate to THIS language pair, domain, and role — e.g. a legal translator on EN↔FR should score higher aiR than a literary translator in a low-resource pair.\n" +
      "- mkt: market demand score 0–10 (0 = low market value, 10 = high market value) for someone with this profile today.\n\n" +
      "Return ONLY valid JSON with no preamble:\n" +
      '{"landscape":"...","skills":[{"name":"...","aiR":0,"mkt":0},{"name":"...","aiR":0,"mkt":0},{"name":"...","aiR":0,"mkt":0},{"name":"...","aiR":0,"mkt":0},{"name":"...","aiR":0,"mkt":0},{"name":"...","aiR":0,"mkt":0}]}'
    );
  }

  function applyAnalysisResult(parsed) {
    if (!parsed.skills || !Array.isArray(parsed.skills)) throw new Error("Invalid skills");
    var loaded = parsed.skills.slice(0, 6).map(function (sk, i) {
      return {
        name: sk.name || sk.text || "Skill " + (i + 1),
        aiR: typeof sk.aiR === "number" ? sk.aiR : typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : 5,
        mkt: typeof sk.mkt === "number" ? sk.mkt : typeof sk.market_demand === "number" ? sk.market_demand : 5,
      };
    });
    while (loaded.length < 6) {
      loaded.push({ name: "Skill " + (loaded.length + 1), aiR: 5, mkt: 5 });
    }
    var defaultFluencies = {};
    for (var fi = 0; fi < 6; fi++) defaultFluencies[fi] = 5;
    setLandscape(parsed.landscape || "");
    setSkills(loaded);
    setFluencies(defaultFluencies);
    setStep(3);
  }

  async function fetchLandscapeAndSkills() {
    var domainCount = contentDomains.length;
    var canAnalyze = domainCount >= 1 && domainCount <= 3 && workContext !== "";
    if (!canAnalyze) return;
    setStep(3);
    setLoading(true);
    setLoadingMsg("Analyzing your language work profile…");
    setError(null);
    var prompt = buildAnalysisPrompt();
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || data.error_description || "API error: " + JSON.stringify(data));
      var raw = data.content.map(function (b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      applyAnalysisResult(JSON.parse(m[0]));
    } catch (e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function (r) { setTimeout(r, 2000); });
        try {
          var res2 = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(typeof data2.error === "object" ? JSON.stringify(data2) : (data2.error || JSON.stringify(data2)));
          var raw2 = data2.content.map(function (b) { return b.text || ""; }).join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          applyAnalysisResult(JSON.parse(m2[0]));
        } catch (e2) {
          setError("Something went wrong — please try again in a moment.");
        }
      } else {
        setError("Something went wrong — please try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleDomain(id) {
    setContentDomains(function (prev) {
      if (prev.indexOf(id) !== -1) return prev.filter(function (x) { return x !== id; });
      if (prev.length >= 3) return prev;
      return prev.concat([id]);
    });
  }

  var tileBase = {
    textAlign: "left",
    background: "#ffffff",
    border: "1px solid " + S.border,
    borderRadius: 12,
    padding: 20,
    cursor: "pointer",
    boxSizing: "border-box",
  };

  var pillDefault = {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 15,
    border: "1px solid " + S.border,
    marginRight: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: "#ffffff",
    color: S.text,
    fontFamily: S.font,
    lineHeight: 1.3,
  };

  var pillSelected = {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 15,
    border: "1px solid " + S.accent,
    marginRight: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: S.accent,
    color: "#ffffff",
    fontFamily: S.font,
    lineHeight: 1.3,
  };

  var containerOuter = {
    background: S.bg,
    minHeight: "100vh",
    padding: "32px 20px",
    fontFamily: S.font,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  var containerInner = { maxWidth: 640, width: "100%", margin: "0 auto" };

  var backBtnStyle = {
    fontFamily: S.mono,
    fontSize: 12,
    color: S.dim,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
  };

  var continueBtnBase = {
    width: "100%",
    marginTop: 20,
    background: S.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: S.mono,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };

  var inputStyle = {
    width: "100%",
    background: S.card2,
    border: "1px solid " + S.border,
    borderRadius: 8,
    padding: "12px 16px",
    color: S.text,
    fontSize: 16,
    fontFamily: S.font,
    outline: "none",
    boxSizing: "border-box",
  };

  var selectStyle = Object.assign({}, inputStyle, {
    cursor: "pointer",
    appearance: "auto",
  });

  var sectionLabel = {
    fontFamily: S.mono,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: S.muted,
    marginBottom: 12,
    fontWeight: 600,
  };

  function StepLabel(props2) {
    return (
      <div
        style={{
          fontFamily: S.mono,
          fontSize: 12,
          color: S.gold,
          letterSpacing: "0.1em",
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        STEP {props2.n} OF 4
      </div>
    );
  }

  // ── STEP 0: Role type ─────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={containerOuter}>
        <DZNavBar />
        <div style={containerInner}>
          <StepLabel n={1} />

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · LOCALIZATION EDITION
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 38,
              fontStyle: "italic",
              color: S.text,
              margin: "0 0 12px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Find your position in the AI era of language work.
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 32px" }}>
            Map your skills against AI displacement risk and market demand — calibrated to your role, languages, and domain.
          </p>

          <div style={sectionLabel}>What type of language professional are you?</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {ROLE_TYPES.map(function (rt) {
              var selected = roleType === rt.id;
              var bg = selected ? S.gold + "12" : "#ffffff";
              var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
              return (
                <div
                  key={rt.id}
                  role="button"
                  tabIndex={0}
                  onClick={function () { setRoleType(rt.id); }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" || e.key === " ") setRoleType(rt.id);
                  }}
                  style={Object.assign({}, tileBase, { background: bg, border: border })}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6, lineHeight: 1.25 }}>{rt.label}</div>
                  <div style={{ fontSize: 14, color: S.dim, lineHeight: 1.55 }}>{rt.desc}</div>
                </div>
              );
            })}
          </div>

          {roleType !== "" ? (
            <button
              type="button"
              onClick={function () { setStep(1); }}
              style={continueBtnBase}
            >
              NEXT →
            </button>
          ) : null}

          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 1: Seniority + Language pair ──────────────────────────────────
  if (step === 1) {
    var canContinue1 = seniority !== "" && sourceLanguage !== "" && targetLanguage !== "";
    return (
      <div style={containerOuter}>
        <DZNavBar />
        <div style={containerInner}>
          <button type="button" onClick={function () { setStep(0); }} style={backBtnStyle}>
            ← back
          </button>
          <StepLabel n={2} />

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 38,
              fontStyle: "italic",
              color: S.text,
              margin: "0 0 12px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Your experience &amp; languages
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 32px" }}>
            Seniority and language pair shape how AI exposure plays out in your market.
          </p>

          <div style={Object.assign({}, sectionLabel, { marginBottom: 12 })}>Seniority level</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 32 }}>
            {SENIORITY_LEVELS.map(function (sl) {
              var sel = seniority === sl.id;
              return (
                <span
                  key={sl.id}
                  role="button"
                  tabIndex={0}
                  onClick={function () { setSeniority(sl.id); }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" || e.key === " ") setSeniority(sl.id);
                  }}
                  style={sel ? pillSelected : pillDefault}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{sl.label}</div>
                  <div style={{ fontSize: 13, opacity: sel ? 0.85 : 1, color: sel ? "inherit" : S.dim, marginTop: 2 }}>{sl.sub}</div>
                </span>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={Object.assign({}, sectionLabel, { marginBottom: 8 })}>Source language</div>
              <select
                value={sourceLanguage}
                onChange={function (e) { setSourceLanguage(e.target.value); }}
                style={selectStyle}
              >
                <option value="">Select…</option>
                {LANGUAGE_PAIRS.SOURCE_LANGUAGES.map(function (lang) {
                  return <option key={lang} value={lang}>{lang}</option>;
                })}
              </select>
            </div>
            <div>
              <div style={Object.assign({}, sectionLabel, { marginBottom: 8 })}>Target language</div>
              <select
                value={targetLanguage}
                onChange={function (e) { setTargetLanguage(e.target.value); }}
                style={selectStyle}
              >
                <option value="">Select…</option>
                {LANGUAGE_PAIRS.TARGET_LANGUAGES.map(function (lang) {
                  return <option key={lang} value={lang}>{lang}</option>;
                })}
              </select>
            </div>
          </div>

          <div style={Object.assign({}, sectionLabel, { marginBottom: 8 })}>Specialization <span style={{ color: S.dim, fontWeight: 400, textTransform: "none" }}>— optional</span></div>
          <input
            type="text"
            value={specialization}
            onChange={function (e) { setSpecialization(e.target.value); }}
            placeholder="e.g. patent law, video game narrative, pharma clinical trials"
            style={inputStyle}
          />

          <button
            type="button"
            disabled={!canContinue1}
            onClick={function () {
              if (!canContinue1) return;
              setStep(2);
            }}
            style={Object.assign({}, continueBtnBase, !canContinue1 ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            NEXT →
          </button>

          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 2: Content domain + Work context ─────────────────────────────
  if (step === 2) {
    var domainCount = contentDomains.length;
    var canAnalyze = domainCount >= 1 && domainCount <= 3 && workContext !== "";
    var countColor = domainCount > 0 ? S.gold : S.dim;
    return (
      <div style={containerOuter}>
        <DZNavBar />
        <div style={containerInner}>
          <button type="button" onClick={function () { setStep(1); }} style={backBtnStyle}>
            ← back
          </button>
          <StepLabel n={3} />

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 38,
              fontStyle: "italic",
              color: S.text,
              margin: "0 0 12px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Your domain &amp; work context
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 8px" }}>
            Pick 1–3 content domains and where you work today.
          </p>

          <div style={{ fontSize: 14, fontFamily: S.mono, color: countColor, marginBottom: 24 }}>
            {domainCount} of 3 selected
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {CONTENT_DOMAINS.map(function (cd) {
              var selected = contentDomains.indexOf(cd.id) !== -1;
              var maxed = domainCount >= 3;
              var disabled = !selected && maxed;
              var bg = selected ? S.gold + "12" : "#ffffff";
              var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
              return (
                <div
                  key={cd.id}
                  role="button"
                  tabIndex={0}
                  onClick={function () {
                    if (disabled) return;
                    toggleDomain(cd.id);
                  }}
                  onKeyDown={function (e) {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    if (disabled) return;
                    toggleDomain(cd.id);
                  }}
                  style={Object.assign({}, tileBase, {
                    background: bg,
                    border: border,
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  })}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 4, lineHeight: 1.25 }}>{cd.label}</div>
                  <div style={{ fontSize: 14, color: S.dim, lineHeight: 1.55 }}>{cd.sub}</div>
                </div>
              );
            })}
          </div>

          <div style={Object.assign({}, sectionLabel, { marginBottom: 12 })}>Where do you work?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            {WORK_CONTEXTS.map(function (wc) {
              var selected = workContext === wc.id;
              var bg = selected ? S.gold + "12" : "#ffffff";
              var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
              return (
                <div
                  key={wc.id}
                  role="button"
                  tabIndex={0}
                  onClick={function () { setWorkContext(wc.id); }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" || e.key === " ") setWorkContext(wc.id);
                  }}
                  style={Object.assign({}, tileBase, { background: bg, border: border, padding: "14px 18px" })}
                >
                  <div style={{ fontSize: 15, fontWeight: selected ? 600 : 500, color: S.text }}>{wc.label}</div>
                </div>
              );
            })}
          </div>

          {error ? (
            <p style={{ color: "#b91c1c", fontSize: 14, fontFamily: S.mono, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{error}</p>
          ) : null}

          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={function () {
              if (!canAnalyze || loading) return;
              fetchLandscapeAndSkills();
            }}
            style={Object.assign({}, continueBtnBase, !canAnalyze || loading ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            ANALYZE MY PROFILE →
          </button>

          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 3: Landscape + affinity sliders ──────────────────────────────
  if (step === 3) {
    var dzSliderCSS =
      "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)}";

    if (loading) {
      return (
        <div style={{ background: S.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: S.font, padding: "32px 20px", boxSizing: "border-box" }}>
          <DZNavBar />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <style dangerouslySetInnerHTML={{ __html: "@keyframes spin{to{transform:rotate(360deg)}}" }} />
            <div style={{ textAlign: "center", maxWidth: 400, padding: "0 20px" }}>
              <div style={{ width: 52, height: 52, border: "3px solid " + S.border, borderTop: "3px solid " + S.gold, borderRadius: "50%", margin: "0 auto 28px", animation: "spin 0.85s linear infinite" }} />
              <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: "0 0 10px", letterSpacing: "0.08em" }}>DEFENSIBLE ZONE&#8482; · LOCALIZATION EDITION</p>
              <p style={{ fontFamily: S.serif, fontSize: 22, color: S.text, fontStyle: "italic", margin: "0 0 10px" }}>{loadingMsg}</p>
              <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: 0, letterSpacing: "0.08em" }}>READING YOUR LANGUAGE LANDSCAPE · SCORING AI EXPOSURE</p>
            </div>
          </div>
          <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}><DZFooter /></div>
        </div>
      );
    }

    var roleLabel = getRoleLabel(roleType);
    var seniorityLabel = getSeniorityLabel(seniority);
    var canSeeDZ = skills.length >= 6 && skills.every(function (_sk, idx) {
      return fluencies[idx] !== undefined;
    });

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px", boxSizing: "border-box" }}>
        <DZNavBar />
        <style dangerouslySetInnerHTML={{ __html: dzSliderCSS }} />
        <div style={containerInner}>
          <button type="button" onClick={function () { setStep(2); setError(null); }} style={backBtnStyle}>
            ← back
          </button>

          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.1em", marginBottom: 16, fontWeight: 600 }}>
            STEP 3 OF 4 · {roleLabel.toUpperCase()}
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 34,
              fontStyle: "italic",
              color: S.text,
              margin: "0 0 20px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Your AI landscape
          </h1>

          {error ? (
            <p style={{ color: "#b91c1c", fontSize: 14, fontFamily: S.mono, fontWeight: 600, marginBottom: 16 }}>{error}</p>
          ) : null}

          <div style={{ background: "linear-gradient(135deg,rgba(26,29,46,.97),rgba(26,29,46,.92))", borderRadius: 14, padding: 22, marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, background: "radial-gradient(circle,rgba(217,119,6,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "rgba(217,119,6,.8)", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
              AI LANDSCAPE · {roleLabel.toUpperCase()} · {seniorityLabel.toUpperCase()} · {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
            </div>
            <p style={{ color: "rgba(240,242,248,.9)", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{landscape}</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
            {getDomainLabels(contentDomains).map(function (dl) {
              return (
                <span key={dl} style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 12, padding: "3px 10px", fontWeight: 600 }}>{dl}</span>
              );
            })}
          </div>

          <div style={Object.assign({}, sectionLabel, { marginBottom: 16 })}>Rate your natural affinity for each skill</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {skills.map(function (sk, idx) {
              var fluencyVal = fluencies[idx] !== undefined ? fluencies[idx] : 5;
              return (
                <div
                  key={idx}
                  style={{
                    background: S.card,
                    border: "1px solid " + S.border,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 4, lineHeight: 1.35 }}>{sk.name}</div>
                  <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, marginBottom: 14 }}>
                    AI replaceability {sk.aiR}/10 · Market demand {sk.mkt}/10
                  </div>
                  <div style={{ fontSize: 14, color: S.muted, marginBottom: 10 }}>How naturally does this come to you?</div>
                  <input
                    className="dz-slider"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={fluencyVal}
                    onChange={function (e) {
                      var val = Number(e.target.value);
                      setFluencies(function (prev) {
                        var next = Object.assign({}, prev);
                        next[idx] = val;
                        return next;
                      });
                    }}
                    style={{ background: "linear-gradient(to right, #d97706 " + (fluencyVal / 10) * 100 + "%, #d0d7e8 " + (fluencyVal / 10) * 100 + "%)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: S.mono, fontSize: 11, color: S.dim }}>
                    <span>1</span>
                    <span style={{ color: S.gold, fontWeight: 700 }}>{fluencyVal}/10</span>
                    <span>10</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canSeeDZ}
            onClick={function () {
              if (!canSeeDZ) return;
              setStep(4);
            }}
            style={Object.assign({}, continueBtnBase, !canSeeDZ ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            SEE MY DEFENSIBLE ZONE →
          </button>

          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 4: Placeholder results ───────────────────────────────────────
  return (
    <div style={containerOuter}>
      <DZNavBar />
      <div style={Object.assign({}, containerInner, { textAlign: "center", paddingTop: 48, paddingBottom: 48 })}>
        <p
          style={{
            fontFamily: S.serif,
            fontSize: 28,
            fontStyle: "italic",
            color: S.text,
            margin: "0 0 32px",
            lineHeight: 1.3,
          }}
        >
          Results coming soon
        </p>
        <button
          type="button"
          onClick={resetAll}
          style={Object.assign({}, continueBtnBase, { maxWidth: 280, margin: "0 auto" })}
        >
          ← BACK
        </button>
        <DZFooter />
      </div>
    </div>
  );
}
