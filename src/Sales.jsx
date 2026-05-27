import { useState, useEffect, useRef } from "react";

// ── SALES TYPES ─────────────────────────────────────────────────────
var SALES_TYPES = [
  // Group: Acquisition / Front-of-Funnel
  { id:"sdr",         group:"Acquisition / Front-of-Funnel",  label:"SDR / BDR (Outbound)",            desc:"Top-of-funnel prospecting — cold outreach, meeting setting" },
  { id:"ldr",         group:"Acquisition / Front-of-Funnel",  label:"Inbound SDR / LDR",               desc:"Inbound qualification, MQL routing, demo booking" },
  { id:"inside_ae",   group:"Acquisition / Front-of-Funnel",  label:"Inside / Transactional AE",       desc:"Phone/video sales, fast cycles (<30 days), volume-driven" },
  { id:"field_rep",   group:"Acquisition / Front-of-Funnel",  label:"Field / Outside Sales Rep",       desc:"Regional territory, in-person, route-based" },
  // Group: Closing Roles
  { id:"ae_smb",      group:"Closing Roles",                  label:"Account Executive — SMB",         desc:"Sub-$50K ACVs, 14–60 day cycles, transactional" },
  { id:"ae_mm",       group:"Closing Roles",                  label:"Account Executive — Mid-Market",  desc:"$50K–$250K ACVs, multi-stakeholder, 30–120 day cycles" },
  { id:"ae_ent",      group:"Closing Roles",                  label:"Account Executive — Enterprise",  desc:"$250K+ ACVs, 6–18 month cycles, complex deals" },
  { id:"strategic_ae",group:"Closing Roles",                  label:"Strategic / Named Accounts",      desc:"Fortune 500, multi-million, multi-year, deeply consultative" },
  // Group: Post-Sale & Specialist
  { id:"am",          group:"Post-Sale & Specialist",         label:"Account Manager (expansion)",     desc:"Owns existing accounts, upsell, cross-sell, renewal" },
  { id:"csm",         group:"Post-Sale & Specialist",         label:"Customer Success Manager",        desc:"Adoption, value realization, retention, health monitoring" },
  { id:"se",          group:"Post-Sale & Specialist",         label:"Sales Engineer / Solutions Consultant", desc:"Technical presales, demos, POCs, RFPs" },
  { id:"channel",     group:"Post-Sale & Specialist",         label:"Channel / Partner Manager",       desc:"Indirect sales through resellers, SIs, ISVs, agencies" },
  // Group: Operations & Leadership
  { id:"revops",      group:"Operations & Leadership",        label:"RevOps / Sales Operations",       desc:"Systems, forecasting, analytics, comp/territory design" },
  { id:"enablement",  group:"Operations & Leadership",        label:"Sales Enablement",                desc:"Training, content, onboarding, playbooks" },
];

// ── ROLE TRACK ──────────────────────────────────────────────────────
var ROLE_TRACKS = [
  { id:"ic",           label:"Individual Contributor",      desc:"I do the work" },
  { id:"player_coach", label:"Player-Coach Manager",        desc:"I do the work AND coach others" },
  { id:"manager",      label:"People Manager",              desc:"I lead a team, don't carry quota myself" },
];

// ── SENIORITY (filtered by role track) ──────────────────────────────
var SENIORITY_BY_TRACK = {
  ic:           [
    { id:"entry",      label:"Entry / Associate",         note:"First sales role, 0–2 years" },
    { id:"ic",         label:"Individual Contributor",    note:"Carrying full quota, 2–5 years" },
    { id:"senior_ic",  label:"Senior IC",                 note:"Larger accounts, mentor role, 5–10 years" },
    { id:"principal",  label:"Principal / Top Performer", note:"Top 5–10% of reps, 8+ years" },
  ],
  player_coach: [
    { id:"manager",    label:"Team Lead / First-Line Manager", note:"4–8 direct reports, player-coach" },
    { id:"sr_manager", label:"Senior Manager",                 note:"Multiple teams, still in deals" },
  ],
  manager: [
    { id:"director",   label:"Director / Senior Manager", note:"Multiple teams, region or segment, 10–15 years" },
    { id:"vp",         label:"VP Sales / SVP",            note:"Org-level strategy, hiring, territory design" },
    { id:"svp",        label:"SVP / Executive VP Sales",  note:"Multi-region or multi-segment ownership" },
    { id:"cro",        label:"CRO / Chief Revenue Officer", note:"C-suite, owns all revenue functions" },
  ],
};

// ── COMPANY TYPES ───────────────────────────────────────────────────
var COMPANY_TYPES = [
  { id:"founder_led",      label:"Pre-Seed / Founder-Led",        sub:"<10 people, no formal sales motion" },
  { id:"early_startup",    label:"Early Startup (Series A–B)",    sub:"10–75 people, building the motion" },
  { id:"growth_saas",      label:"Growth-Stage B2B SaaS",         sub:"75–500 people, scaling repeatable motion" },
  { id:"midmarket_saas",   label:"Mid-Market B2B SaaS",           sub:"500–2,000 people, segmented sales orgs" },
  { id:"enterprise_saas",  label:"Enterprise SaaS",               sub:"2,000+ people, complex multi-product" },
  { id:"plg_saas",         label:"PLG / Self-Serve SaaS",         sub:"Product-led, sales-assist motion" },
  { id:"aifirst",          label:"AI-First Company",              sub:"New category creation, evangelist selling" },
  { id:"tier1_cloud",      label:"Tier-1 Cloud / Big Tech",       sub:"AWS, GCP, Azure, Salesforce Cloud" },
  { id:"legacy_enterprise",label:"Legacy Enterprise Software",    sub:"Oracle, SAP, IBM, Microsoft on-prem" },
  { id:"cybersecurity",    label:"Cybersecurity",                 sub:"Specialized vertical, high deal sizes" },
  { id:"fintech",          label:"Fintech / Payments",            sub:"Stripe, Plaid, Adyen, banking software" },
  { id:"healthtech",       label:"HealthTech / Medical",          sub:"HIPAA, hospital systems, slow procurement" },
  { id:"industrial",       label:"Industrial / Manufacturing",    sub:"Physical products, regional reps" },
  { id:"prof_services",    label:"Professional Services",         sub:"Selling services — Deloitte, Accenture" },
  { id:"agency",           label:"Agency / Creative Services",    sub:"Selling agency services" },
];

// ── INDUSTRY VERTICALS ──────────────────────────────────────────────
var INDUSTRY_VERTICALS = [
  { id:"horizontal",    label:"Horizontal / Many industries" },
  { id:"financial",     label:"Financial Services / Banking" },
  { id:"healthcare",    label:"Healthcare / Hospitals / Payers" },
  { id:"government",    label:"Government / Public Sector" },
  { id:"tech",          label:"Technology / SaaS companies" },
  { id:"retail",        label:"Retail / E-commerce / CPG" },
  { id:"manufacturing", label:"Manufacturing / Industrial" },
  { id:"education",     label:"Education / EdTech" },
  { id:"media",         label:"Media / Entertainment" },
  { id:"nonprofit",     label:"Nonprofit / NGO" },
  { id:"smb",           label:"SMB / Small Business" },
];

// ── WORK CONTEXTS ───────────────────────────────────────────────────
var WORK_CONTEXTS = [
  { id:"outbound_prospect", label:"Outbound Prospecting (cold outreach)" },
  { id:"inbound_qual",      label:"Inbound Qualification (MQL routing, demo booking)" },
  { id:"discovery",         label:"Discovery & Needs Analysis" },
  { id:"demo",              label:"Demo / Product Presentation" },
  { id:"tech_eval",         label:"Technical Evaluation / POC Management" },
  { id:"negotiation",       label:"Negotiation & Closing" },
  { id:"procurement",       label:"RFP / RFI / Procurement Navigation" },
  { id:"multi_thread",      label:"Multi-Thread Stakeholder Management" },
  { id:"exec_eng",          label:"Executive Engagement & C-Suite Selling" },
  { id:"account_plan",      label:"Account Planning & Territory Strategy" },
  { id:"forecast",          label:"Pipeline Management & Forecasting" },
  { id:"success",           label:"Customer Success & Adoption" },
  { id:"renewals",          label:"Renewals & Retention" },
  { id:"expansion",         label:"Upsell & Expansion" },
  { id:"channel_enable",    label:"Channel / Partner Enablement" },
  { id:"enablement",        label:"Sales Enablement & Training" },
  { id:"analytics",         label:"Sales Analytics & Reporting" },
  { id:"coaching",          label:"Deal Coaching & Team Management" },
];

// ── CONTEXT MAP ─────────────────────────────────────────────────────
var CONTEXT_MAP = {
  sdr:          ["outbound_prospect","inbound_qual","discovery","forecast","enablement"],
  ldr:          ["inbound_qual","discovery","outbound_prospect","forecast"],
  inside_ae:    ["inbound_qual","discovery","demo","negotiation","forecast","expansion"],
  field_rep:    ["outbound_prospect","discovery","demo","negotiation","account_plan","expansion"],
  ae_smb:       ["inbound_qual","discovery","demo","negotiation","forecast","expansion"],
  ae_mm:        ["discovery","demo","tech_eval","negotiation","multi_thread","account_plan","forecast"],
  ae_ent:       ["tech_eval","negotiation","procurement","multi_thread","exec_eng","account_plan","forecast"],
  strategic_ae: ["procurement","multi_thread","exec_eng","account_plan","expansion","success"],
  am:           ["expansion","renewals","success","multi_thread","exec_eng","account_plan"],
  csm:          ["success","renewals","expansion","analytics","multi_thread"],
  se:           ["demo","tech_eval","procurement","multi_thread","discovery"],
  channel:      ["channel_enable","negotiation","account_plan","multi_thread","enablement"],
  revops:       ["forecast","analytics","coaching","account_plan","enablement"],
  enablement:   ["enablement","coaching","analytics","outbound_prospect","demo"],
};

// ── DESIGN TOKENS ───────────────────────────────────────────────────
var S = {
  bg:"#f8f9fc", card:"#ffffff", card2:"#f2f4f8",
  border:"#d0d7e8", text:"#0d1117", muted:"#1e2a42", dim:"#4a5568",
  accent:"#1a1d2e", purple:"#7c3aed", gold:"#d97706",
  green:"#059669", red:"#dc2626", blue:"#2563eb", orange:"#ea580c",
  font:"system-ui,-apple-system,sans-serif",
  mono:"'Courier New',monospace",
  serif:"'Playfair Display',Georgia,serif",
};

// ── PROMO CODES ─────────────────────────────────────────────────────
var PROMO_CODES    = ["DZFRIEND","DZPREVIEW","DZTEST","DZSALESPRE"];
var DISCOUNT_CODES = ["DZHALF","DZSALESHALF"];

// ── MATH ────────────────────────────────────────────────────────────
var AFFINITY_STOPS = [0, 3, 5, 7, 10];

function snapToStop(val) {
  return AFFINITY_STOPS.reduce(function(prev, curr) {
    return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
  });
}

function getSeed(c, p) {
  var raw = Math.round((c * 0.5 + p * 0.5) * 10) / 10;
  return AFFINITY_STOPS.reduce(function(prev, curr) {
    return Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev;
  });
}

function compAff(conscience, pull, fluency) {
  return Math.round((conscience * 0.35 + pull * 0.35 + fluency * 0.3) * 10) / 10;
}

function calcDZ(aff, aiR, mkt) {
  var v = 100 * Math.pow(aff / 10, 0.35) * Math.pow((10 - aiR) / 10, 0.40) * Math.pow(mkt / 10, 0.25);
  return Math.min(100, Math.round(v));
}

function dzScoreColor(score) {
  if (score < 40) return S.red;
  if (score <= 65) return S.gold;
  return S.green;
}

function getOverallSubLabel(score) {
  if (score <= 39) return "High exposure. Significant repositioning needed.";
  if (score <= 59) return "Moderate exposure. Some strong anchors, gaps to address.";
  if (score <= 74) return "Solid foundation. Targeted moves will strengthen your position.";
  if (score <= 89) return "Well-positioned. Protect your anchors and extend your lead.";
  return "Exceptional. You're operating in rare territory.";
}

function getSkillInterpretation(aiRisk, mkt, aff) {
  if (aiRisk >= 7) return "High AI exposure — your affinity is what keeps this defensible.";
  if (aiRisk <= 3 && mkt >= 7) return "Low AI risk, high market value — a strong anchor.";
  if (aff >= 7 && aiRisk >= 6) return "Your affinity is your edge here — lean into it.";
  if (aff <= 3 && aiRisk >= 6) return "Vulnerable. Consider whether this is worth defending.";
  return "Moderate position — context and execution matter here.";
}

function buildProfile(salesType, roleTrack, seniority, workContexts, companyType, industryVertical) {
  var st = SALES_TYPES.find(function(t) { return t.id === salesType; });
  var rt = ROLE_TRACKS.find(function(r) { return r.id === roleTrack; });
  var levels = SENIORITY_BY_TRACK[roleTrack] || [];
  var sl = levels.find(function(s) { return s.id === seniority; });
  var ct = COMPANY_TYPES.find(function(c) { return c.id === companyType; });
  var iv = INDUSTRY_VERTICALS.find(function(v) { return v.id === industryVertical; });
  var wcLabels = workContexts.map(function(id) {
    var w = WORK_CONTEXTS.find(function(x) { return x.id === id; });
    return w ? w.label : id;
  });
  return {
    salesTypeLabel:      st  ? st.label  : salesType,
    roleTrackLabel:      rt  ? rt.label  : roleTrack,
    seniorityLabel:      sl  ? sl.label  : seniority,
    companyLabel:        ct  ? ct.label  : (companyType || ""),
    industryVerticalLabel: iv ? iv.label : (industryVertical || ""),
    workContextLabels:   wcLabels,
    summary: [
      sl  ? sl.label  : seniority,
      st  ? st.label  : salesType,
      ct  ? ct.label  : "",
      iv  ? "Selling into " + iv.label : "",
    ].filter(Boolean).join(" · "),
  };
}

// ── DISCLAIMER ──────────────────────────────────────────────────────
var SALES_DISCLAIMER =
  "This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment. Scores are estimates based on publicly available research and LLM calibration — not a definitive evaluation of your skills or employability. This tool does not predict commission income, quota attainment, or employment outcomes.";

// ── SHARED UI ───────────────────────────────────────────────────────
function Card(props) {
  return (
    <div style={Object.assign({ background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: 28 }, props.style)}>
      {props.children}
    </div>
  );
}

function Label(props) {
  return (
    <div style={Object.assign({ fontFamily: S.mono, fontSize: 12, color: S.muted, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }, props.style)}>
      {props.children}
    </div>
  );
}

function PrimaryBtn(props) {
  var dis = props.disabled;
  return (
    <button onClick={props.onClick} disabled={dis} style={Object.assign({
      width:"100%", background: dis ? S.card : S.accent, color: dis ? S.dim : "white",
      border:"1px solid " + (dis ? S.border : S.accent), borderRadius:12, padding:"18px 0",
      fontSize:16, fontFamily:S.mono, fontWeight:700, cursor: dis ? "not-allowed" : "pointer",
      letterSpacing:"0.08em", transition:"all 0.2s",
    }, props.style)}>
      {props.children}
    </button>
  );
}

function SelBtn(props) {
  var active = props.active;
  return (
    <button onClick={props.onClick} style={{
      background: active ? S.accent : S.card,
      color: active ? "white" : S.text,
      border:"1px solid " + (active ? S.accent : S.border),
      borderRadius:10, padding:"10px 14px", cursor:"pointer",
      fontFamily:S.font, fontSize:16, fontWeight: active ? 700 : 500,
      textAlign:"left", transition:"all 0.15s", width:"100%",
    }}>
      {props.children}
    </button>
  );
}

function Chip(props) {
  var active = props.active;
  return (
    <button onClick={props.onClick} style={{
      background: active ? S.gold : S.card,
      color: active ? "white" : S.muted,
      border:"1px solid " + (active ? S.gold : S.border),
      borderRadius:20, padding:"6px 14px", cursor:"pointer",
      fontFamily:S.mono, fontSize:12, fontWeight: active ? 700 : 500,
      transition:"all 0.15s", whiteSpace:"nowrap",
    }}>
      {props.label}
    </button>
  );
}

function SalesDisclaimer() {
  return (
    <div
      style={{
        background: "#fef9ec",
        border: "1px solid #f0c060",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 28,
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: S.mono, fontSize: 14, color: "#92400e", fontWeight: 700, marginBottom: 4 }}>
        IMPORTANT — PLEASE READ
      </div>
      <div style={{ fontFamily: S.mono, fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>{SALES_DISCLAIMER}</div>
    </div>
  );
}

function SalesFooter() {
  return (
    <div style={{ background: S.card2, borderTop: "1px solid " + S.border, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginBottom: 4 }}>DEFENSIBLE ZONE™</div>
          <a
            href="https://defensiblezone.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.accent, textDecoration: "none" }}
            onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
          >
            defensiblezone.ai →
          </a>
        </div>
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginBottom: 4 }}>QUESTIONS &amp; FEEDBACK</div>
          <a
            href="mailto:support@recursiolab.com"
            style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
            onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
          >
            support@recursiolab.com →
          </a>
        </div>
      </div>
    </div>
  );
}
