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

export default function Localization() { return null; }
