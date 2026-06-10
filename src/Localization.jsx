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

export default function Localization() {
  var [step, setStep] = useState(0);
  var [roleType, setRoleType] = useState("");
  var [seniority, setSeniority] = useState("");
  var [sourceLanguage, setSourceLanguage] = useState("");
  var [targetLanguage, setTargetLanguage] = useState("");
  var [specialization, setSpecialization] = useState("");
  var [contentDomains, setContentDomains] = useState([]);
  var [workContext, setWorkContext] = useState("");

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
        STEP {props2.n} OF 3
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

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={function () {
              if (!canAnalyze) return;
              setStep(3);
            }}
            style={Object.assign({}, continueBtnBase, !canAnalyze ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            ANALYZE MY PROFILE →
          </button>

          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 3: Placeholder results ───────────────────────────────────────
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
