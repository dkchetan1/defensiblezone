import { useState, useEffect, useRef } from "react";

// ── SALES TYPES ─────────────────────────────────────────────────────
var OFFER_FREE_SESSION = true;

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
var TEST_CODES     = ["DZONE"];

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

function SalesNavBar() {
  return (
    <div style={{ background: S.card2, borderBottom: "1px solid " + S.border, padding: "14px 24px", marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <a
          href="https://defensiblezone.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 13, fontWeight: "bold", color: S.accent, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          defensiblezone.ai →
        </a>
        <a
          href="mailto:support@recursiolab.com"
          style={{ fontFamily: S.mono, fontSize: 13, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Questions &amp; Feedback →
        </a>
      </div>
    </div>
  );
}

function SalesFooter() {
  return (
    <div style={{ background: S.card2, borderTop: "1px solid " + S.border, padding: "20px 24px", marginTop: 32 }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
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
        <a
          href="mailto:support@recursiolab.com"
          style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Questions &amp; Feedback →
        </a>
        <a
          href="https://defensiblezone.ai/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.dim, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Privacy Policy →
        </a>
      </div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────
export default function EmployerSales({ reportMode }) {
  var [salesType, setSalesType] = useState("");
  var [roleTrack, setRoleTrack] = useState("");
  var [seniority, setSeniority] = useState("");
  var [companyType, setCompanyType] = useState("");
  var [industryVertical, setIndustryVertical] = useState("");
  var [workContexts, setWorkContexts] = useState([]);
  var [showAllCtx, setShowAllCtx] = useState(false);
  var [landscape, setLandscape] = useState("");
  var [skills, setSkills] = useState([]);
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  var [fluencies, setFluencies] = useState({});
  var [customSkill, setCustomSkill] = useState("");
  var [adjustedSkills, setAdjustedSkills] = useState(function () { return new Set(); });
  var adjustedSkillsRef = useRef(new Set());
  var freeEmailSentRef = useRef(false);
  var paidEmailSentRef = useRef(false);
  var [results, setResults] = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [step, setStep] = useState(0);
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [tier, setTier] = useState(0);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [promoUsed, setPromoUsed] = useState(false);
  var [discountApplied, setDiscountApplied] = useState(false);
  var [testModeApplied, setTestModeApplied] = useState(false);
  var [checkoutLoading, setCheckoutLoading] = useState(false);
  var [checkoutError, setCheckoutError] = useState(null);
  var [paymentCanceled, setPaymentCanceled] = useState(false);
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState("");
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [showCalibration, setShowCalibration] = useState(false);

  var SALES_LOADING_MSGS = ["Mapping your sales landscape…", "Identifying your exposure points…", "Calibrating skill defensibility…", "Almost ready…"];
  var SALES_SCORING_MSGS = ["Scoring your skills…", "Calculating AI exposure…", "Building your defensible zone…", "Almost there…"];
  var SALES_RECS_MSGS = ["Mapping your 90-day plan…", "Sequencing your actions…", "Personalising to your sales profile…", "Almost ready…"];

  var salesGroups = ["Acquisition / Front-of-Funnel", "Closing Roles", "Post-Sale & Specialist", "Operations & Leadership"];

  function markAdjusted(skillId) {
    adjustedSkillsRef.current.add(skillId);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  useEffect(function () {
    setFluencies(function (prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function (s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = getSeed(conscience, pull);
        }
      });
      return next;
    });
  }, [conscience, pull, skills]);

  useEffect(
    function () {
      if (!loading && !recsLoading) return;
      var msgs = recsLoading ? SALES_RECS_MSGS : step === 3 ? SALES_SCORING_MSGS : SALES_LOADING_MSGS;
      var i = 0;
      setLoadingMsg(msgs[0]);
      var t = setInterval(function () {
        i = (i + 1) % msgs.length;
        setLoadingMsg(msgs[i]);
      }, 2000);
      return function () {
        clearInterval(t);
      };
    },
    [loading, recsLoading, step]
  );

  useEffect(function () {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(
    function () {
      if (!gateVerified) return;
      if (skills.length > 0 || loading) return;
      fetchLandscapeAndSkills();
    },
    [gateVerified]
  );

  useEffect(function () {
    if (!salesType) return;
    var allowed = CONTEXT_MAP[salesType];
    if (!allowed) return;
    setWorkContexts(function (prev) {
      return prev.filter(function (id) { return allowed.indexOf(id) !== -1; });
    });
    setShowAllCtx(false);
  }, [salesType]);

  useEffect(function () {
    setSeniority("");
  }, [roleTrack]);

  function restoreSavedReport() {
    try {
      var savedRaw = localStorage.getItem("dz_saved_report_sales");
      if (!savedRaw) return false;
      var s = JSON.parse(savedRaw);
      if (s.salesType) setSalesType(s.salesType);
      if (s.roleTrack) setRoleTrack(s.roleTrack);
      if (s.seniority) setSeniority(s.seniority);
      if (s.companyType) setCompanyType(s.companyType);
      if (s.industryVertical) setIndustryVertical(s.industryVertical);
      if (s.workContexts) setWorkContexts(s.workContexts);
      if (s.conscience !== undefined) setConscience(s.conscience);
      if (s.pull !== undefined) setPull(s.pull);
      if (s.gateEmail) setGateEmail(s.gateEmail);
      if (s.landscape) setLandscape(s.landscape);
      if (s.skills) setSkills(s.skills);
      if (s.fluencies) setFluencies(s.fluencies);
      if (s.results) setResults(s.results);
      if (s.tier !== undefined) setTier(s.tier);
      if (s.promoUsed) setPromoUsed(s.promoUsed);
      if (s.discountApplied) setDiscountApplied(s.discountApplied);
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveStateForReturn() {
    try {
      localStorage.setItem(
        "dz_saved_report_sales",
        JSON.stringify({
          salesType: salesType,
          roleTrack: roleTrack,
          seniority: seniority,
          companyType: companyType,
          industryVertical: industryVertical,
          workContexts: workContexts,
          conscience: conscience,
          pull: pull,
          gateEmail: gateEmail,
          landscape: landscape,
          skills: skills,
          fluencies: fluencies,
          results: results,
          tier: tier,
          promoUsed: promoUsed,
          discountApplied: discountApplied,
        })
      );
    } catch (_e) {}
  }

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      restoreSavedReport();
      setTier(2);
      setPaymentCanceled(false);
      setCheckoutError(null);
      setStep(6);
      return;
    }
    if (params.get("canceled") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      restoreSavedReport();
      setStep(5);
      setPaymentCanceled(true);
      return;
    }
  }, []);

  useEffect(
    function () {
      if (step === 5 && (tier >= 2 || promoUsed)) {
        setStep(6);
      }
    },
    [step, tier, promoUsed]
  );

  useEffect(
    function () {
      if (step !== 6) return;
      if (!(tier >= 2 || promoUsed)) return;
      if (!results) return;
      if (recommendations || recsLoading) return;
      fetchRecommendations();
    },
    [step, tier, promoUsed, results]
  );

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
          body: JSON.stringify({ token: gateToken }),
        });
        var data = await res.json();
        if (data && data.valid === true) {
          var savedRaw = null;
          try {
            savedRaw = localStorage.getItem("dz_saved_report_sales");
          } catch (e) {}
          if (savedRaw) {
            try {
              var s = JSON.parse(savedRaw);
              if (s.salesType) setSalesType(s.salesType);
              if (s.roleTrack) setRoleTrack(s.roleTrack);
              if (s.seniority) setSeniority(s.seniority);
              if (s.companyType) setCompanyType(s.companyType);
              if (s.industryVertical) setIndustryVertical(s.industryVertical);
              if (s.workContexts) setWorkContexts(s.workContexts);
              if (s.conscience !== undefined) setConscience(s.conscience);
              if (s.pull !== undefined) setPull(s.pull);
              if (s.gateEmail) setGateEmail(s.gateEmail);
            } catch (e) {}
            if (data.email) setGateEmail(data.email);
            setGateVerified(true);
            setStep(2);
          } else {
            setGateOnDifferentDevice(true);
            setStep(1);
          }
          setGateLoading(false);
          return;
        }
        if (data && data.valid === false && data.reason === "expired") {
          setGateError("expired");
        } else {
          setGateError("invalid");
        }
        setStep(1);
        setGateLoading(false);
      } catch (e) {
        setGateError("invalid");
        setStep(1);
        setGateLoading(false);
      }
    })();
  }, []);

  useEffect(
    function () {
      if (!gateSent) {
        setShowResend(false);
        return;
      }
      setShowResend(false);
      var t = setTimeout(function () {
        setShowResend(true);
      }, 30000);
      return function () {
        clearTimeout(t);
      };
    },
    [gateSent]
  );

  useEffect(
    function () {
      if (step !== 1) return;
      try {
        localStorage.setItem(
          "dz_saved_report_sales",
          JSON.stringify({
            salesType: salesType,
            roleTrack: roleTrack,
            seniority: seniority,
            companyType: companyType,
            industryVertical: industryVertical,
            workContexts: workContexts,
            conscience: conscience,
            pull: pull,
            gateEmail: gateEmail,
          })
        );
      } catch (_e) {}
    },
    [step, salesType, roleTrack, seniority, companyType, industryVertical, workContexts, conscience, pull, gateEmail]
  );

  useEffect(
    function () {
      if (step !== 4 || !results) return;
      if (freeEmailSentRef.current) return;
      if (!gateEmail.trim()) return;
      freeEmailSentRef.current = true;
      var skillsList = Array.isArray(results.skills) ? results.skills : [];
      fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail,
          product: "sales",
          type: "free",
          results: {
            profile: results.profile,
            landscape: results.landscape,
            skills: skillsList,
            overallScore: computeOverallScore(skillsList),
          },
        }),
      }).catch(function () {});
    },
    [step, results]
  );

  useEffect(
    function () {
      if (!recommendations || tier < 2) return;
      if (!results) return;
      if (paidEmailSentRef.current) return;
      if (!gateEmail.trim()) return;
      paidEmailSentRef.current = true;
      var skillsList = Array.isArray(results.skills) ? results.skills : [];
      fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail,
          product: "sales",
          type: "paid",
          results: {
            profile: results.profile,
            landscape: results.landscape,
            skills: skillsList,
            overallScore: computeOverallScore(skillsList),
            recommendations: recommendations,
          },
        }),
      }).catch(function () {});
    },
    [recommendations, tier]
  );

  function isValidEmail(email) {
    var at = email.indexOf("@");
    if (at === -1) return false;
    return email.indexOf(".", at + 1) !== -1;
  }

  function computeOverallScore(skillsArr) {
    if (!Array.isArray(skillsArr) || skillsArr.length === 0) return 0;
    return Math.round(
      skillsArr.reduce(function (sum, s) {
        return sum + (typeof s.dz === "number" ? s.dz : 0);
      }, 0) / skillsArr.length
    );
  }

  function getVisibleContexts() {
    if (!salesType || showAllCtx) return WORK_CONTEXTS;
    var allowed = CONTEXT_MAP[salesType] || [];
    return WORK_CONTEXTS.filter(function (wc) { return allowed.indexOf(wc.id) !== -1; });
  }

  function toggleCtx(id) {
    setWorkContexts(function (prev) {
      return prev.indexOf(id) !== -1 ? prev.filter(function (x) { return x !== id; }) : prev.concat([id]);
    });
  }

  function startEditing(id) {
    setSkills(function (p) { return p.map(function (s) { return s.id === id ? Object.assign({}, s, { editing: true }) : s; }); });
  }
  function updateText(id, text) {
    setSkills(function (p) { return p.map(function (s) { return s.id === id ? Object.assign({}, s, { text: text }) : s; }); });
  }
  function commitEdit(id) {
    setSkills(function (p) { return p.map(function (s) { return s.id === id ? Object.assign({}, s, { editing: false }) : s; }); });
  }
  function removeSkill(id) {
    setSkills(function (p) { return p.filter(function (s) { return s.id !== id; }); });
    setFluencies(function (p) { var n = Object.assign({}, p); delete n[id]; return n; });
    adjustedSkillsRef.current.delete(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }
  function addSkill() {
    var t = customSkill.trim();
    if (!t) return;
    var id = "s" + Date.now();
    setSkills(function (p) { return p.concat([{ id: id, text: t, editing: false }]); });
    setCustomSkill("");
  }

  function resetAll() {
    setSalesType(""); setRoleTrack(""); setSeniority(""); setCompanyType(""); setIndustryVertical("");
    setWorkContexts([]); setShowAllCtx(false);
    setLandscape(""); setSkills([]);
    setConscience(5); setPull(5); setFluencies({}); setCustomSkill("");
    setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setRecommendations(null); setRecsLoading(false); setRecsError(null);
    setStep(0); setLoading(false); setLoadingMsg(""); setError(null);
    setTier(0); setPromoCode(""); setPromoError(""); setPromoUsed(false); setDiscountApplied(false);
    setGateEmail(""); setGateSent(false); setGateVerified(false); setGateError("");
    setGateLoading(false); setShowResend(false); setGateOnDifferentDevice(false); setGateInputFocused(false);
    setCheckoutLoading(false); setCheckoutError(null); setPaymentCanceled(false);
    setShowCalibration(false);
    freeEmailSentRef.current = false;
    paidEmailSentRef.current = false;
  }

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
        body: JSON.stringify({ email: trimmed, product: "sales" }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateEmail(trimmed);
      setGateSent(true);
    } catch (e) {
      setGateError("Something went wrong. Please try again.");
    } finally {
      setGateLoading(false);
    }
  }

  function applyPromoCode() {
    var v = (promoCode || "").trim();
    var isFree = PROMO_CODES.some(function (c) { return c.toLowerCase() === v.toLowerCase(); });
    var isDiscount = DISCOUNT_CODES.some(function (c) { return c.toLowerCase() === v.toLowerCase(); });
    var isTest = TEST_CODES.some(function (c) { return c.toLowerCase() === v.toLowerCase(); });
    if (isFree) {
      setTier(2);
      setPromoUsed(true);
      setPromoError("");
      setPaymentCanceled(false);
      setStep(6);
    } else if (isDiscount) {
      setDiscountApplied(true);
      setPromoError("");
    } else if (isTest) {
      setTestModeApplied(true);
      setPromoError("");
    } else {
      setPromoError("That code isn't valid.");
    }
  }

  async function handleUnlockCheckout() {
    if (!gateEmail.trim()) {
      setCheckoutError("Please verify your email before checkout.");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    setPaymentCanceled(false);
    saveStateForReturn();
    var priceCents = testModeApplied ? 100 : (discountApplied ? 3950 : 7900);
    try {
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "sales",
          email: gateEmail.trim(),
          price: priceCents,
          discount: discountApplied,
          testMode: testModeApplied,
        }),
      });
      var data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout");
      window.location.href = data.url;
    } catch (e) {
      setCheckoutError(e.message || "Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }

  async function fetchLandscapeAndSkills() {
    setLoading(true);
    setError(null);
    var profile = buildProfile(salesType, roleTrack, seniority, workContexts, companyType, industryVertical);
    var wcStr = profile.workContextLabels.join(", ");
    var prompt =
      "You are a senior sales career strategist with deep knowledge of the 2026 AI labor market.\n\nSELLER PROFILE:\n- Sales role: " +
      profile.seniorityLabel +
      " " +
      profile.salesTypeLabel +
      "\n- Role track: " +
      profile.roleTrackLabel +
      "\n- Work contexts: " +
      wcStr +
      "\n- Company: " +
      (profile.companyLabel || "not specified") +
      "\n- Selling into: " +
      (profile.industryVerticalLabel || "horizontal / various industries") +
      "\n\nWrite a 3–4 sentence 'AI Landscape' narrative for this seller. Be specific about how AI is affecting this exact role at this kind of company in this vertical. Name specific tools where relevant (Gong, Apollo, Clay, Outreach, Salesforce Einstein, etc.). Be direct, not alarmist. Speak in the second person ('You...').\n\nThen, identify 7–10 specific skills this seller likely uses. Be SPECIFIC to their role — do not produce generic 'communication' or 'negotiation' entries. A good skill is 'Multi-thread stakeholder mapping in 6–18 month enterprise cycles,' not 'Stakeholder management.'\n\nFor SDRs/BDRs: skills should be activity-oriented and outbound.\nFor Enterprise AEs: skills should center on complex deal mechanics.\nFor CSMs: skills should center on adoption, value realization, expansion.\nFor Sales Engineers: skills should be technical-presales focused.\nFor Managers (any track): include team-leadership skills.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"...\",\"...\"]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || data.error_description || "API error");
      var raw = data.content.map(function (b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      var loaded = parsed.skills.map(function (text, i) { return { id: "s" + i, text: text, editing: false }; });
      setLandscape(parsed.landscape);
      setSkills(loaded);
      setFluencies({});
      setAdjustedSkills(new Set());
      adjustedSkillsRef.current = new Set();
      setStep(3);
    } catch (e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function (r) { setTimeout(r, 2000); });
        try {
          var res2 = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
          });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(data2.error || "API error");
          var raw2 = data2.content.map(function (b) { return b.text || ""; }).join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          var loaded2 = parsed2.skills.map(function (text, i) { return { id: "s" + i, text: text, editing: false }; });
          setLandscape(parsed2.landscape);
          setSkills(loaded2);
          setFluencies({});
          setAdjustedSkills(new Set());
          adjustedSkillsRef.current = new Set();
          setStep(3);
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

  async function fetchScores() {
    if (skills.length === 0) return;
    setLoading(true);
    setError(null);
    var profile = buildProfile(salesType, roleTrack, seniority, workContexts, companyType, industryVertical);
    var skillLines = skills
      .map(function (s, i) {
        var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
        return i + 1 + ". " + s.text + " (fluency: " + fluencyVal + "/10, affinity: " + aff + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior sales career strategist with deep knowledge of the 2026 AI labor market.\n\nSELLER PROFILE:\n- Sales role: " +
      profile.seniorityLabel +
      " " +
      profile.salesTypeLabel +
      "\n- Role track: " +
      profile.roleTrackLabel +
      "\n- Work contexts: " +
      profile.workContextLabels.join(", ") +
      "\n- Company: " +
      (profile.companyLabel || "not specified") +
      "\n- Selling into: " +
      (profile.industryVerticalLabel || "horizontal / various industries") +
      "\n\nSkills to score:\n" +
      skillLines +
      "\n\nFor each skill return:\n- ai_replaceability: 1-10 (10=AI doing this already, 1=deeply human)\n- market_demand: 1-10 (10=extremely high demand, 1=declining)\n\nSCORING GUARDRAILS:\n- Activity-based work (volume calls, sequences, list building) → high AI risk (7–10)\n- Outcome-based work (closing complex deals, expanding accounts) → lower AI risk (2–5)\n- Cycle complexity matters: $5K SMB sale is 90% AI-replaceable; 18-month $5M enterprise deal is 15%\n- Vertical specialization gives defensibility — adjust aiR down 1–2 points where domain knowledge matters\n- Manager-track skills: AI augments forecasting/coaching but cannot replace people leadership\n- AI-first companies: stable-to-rising demand. PLG sales-assist: declining. Enterprise AE: stable. SDR: declining.\n\nAlso return phase1_teaser: one specific Phase 1 action this seller can start this week (2–3 sentences, very specific to their role and vertical).\n\nBe honest. Do not default to middle values.\n\nReturn ONLY valid JSON:\n{\"scores\":[{\"id\":\"s0\",\"name\":\"skill name\",\"ai_replaceability\":N,\"market_demand\":N}],\"phase1_teaser\":\"...\"}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || "API error");
      var raw = data.content.map(function (b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      if (!parsed.scores || !Array.isArray(parsed.scores)) throw new Error("No scores");
      var enriched = parsed.scores.map(function (scored, i) {
        var found =
          skills.find(function (s) { return s.id === scored.id; }) ||
          skills.find(function (s) { return scored.name === s.text; }) ||
          skills.find(function (s) { return scored.name && scored.name.indexOf(s.text.slice(0, 20)) !== -1; });
        var id = found ? found.id : scored.id || "s" + i;
        var fluencyVal = fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
        var aiR = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
        var mkt = typeof scored.market_demand === "number" ? scored.market_demand : 7;
        return {
          id: id,
          text: found ? found.text : scored.name,
          name: found ? found.text : scored.name,
          fluency: fluencyVal,
          affinity: aff,
          ai_replaceability: aiR,
          market_demand: mkt,
          dz: calcDZ(aff, aiR, mkt),
        };
      });
      setResults({ skills: enriched, profile: profile, landscape: landscape, phase1Teaser: parsed.phase1_teaser });
      setStep(4);
    } catch (e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function (r) { setTimeout(r, 2000); });
        try {
          var res2 = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
          });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(data2.error || "API error");
          var raw2 = data2.content.map(function (b) { return b.text || ""; }).join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON");
          var parsed2 = JSON.parse(m2[0]);
          var enriched2 = parsed2.scores.map(function (scored, i) {
            var found2 =
              skills.find(function (s) { return s.id === scored.id; }) ||
              skills.find(function (s) { return scored.name === s.text; }) ||
              skills.find(function (s) { return scored.name && scored.name.indexOf(s.text.slice(0, 20)) !== -1; });
            var id2 = found2 ? found2.id : scored.id || "s" + i;
            var fluencyVal2 = fluencies[id2] !== undefined ? fluencies[id2] : getSeed(conscience, pull);
            var aff2 = compAff(conscience, pull, fluencyVal2);
            var aiR2 = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
            var mkt2 = typeof scored.market_demand === "number" ? scored.market_demand : 7;
            return {
              id: id2,
              text: found2 ? found2.text : scored.name,
              name: found2 ? found2.text : scored.name,
              fluency: fluencyVal2,
              affinity: aff2,
              ai_replaceability: aiR2,
              market_demand: mkt2,
              dz: calcDZ(aff2, aiR2, mkt2),
            };
          });
          setResults({ skills: enriched2, profile: profile, landscape: landscape, phase1Teaser: parsed2.phase1_teaser });
          setStep(4);
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

  async function fetchRecommendations() {
    if (!results || !Array.isArray(results.skills) || results.skills.length === 0) return;
    setRecsLoading(true);
    setRecsError(null);
    var profile = results.profile || buildProfile(salesType, roleTrack, seniority, workContexts, companyType, industryVertical);
    var skillSummary = results.skills
      .map(function (sk, i) {
        var aiR = typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : 5;
        var mkt = typeof sk.market_demand === "number" ? sk.market_demand : 7;
        var name = sk.text || sk.name || "Skill " + (i + 1);
        return i + 1 + ". " + name + " (AI Risk: " + aiR + "/10, Market: " + mkt + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior sales career strategist. A " +
      profile.seniorityLabel +
      " " +
      profile.salesTypeLabel +
      " (role track: " +
      profile.roleTrackLabel +
      ") at " +
      (profile.companyLabel || "not specified") +
      " selling into " +
      (profile.industryVerticalLabel || "horizontal / various industries") +
      ", focused on " +
      profile.workContextLabels.join(", ") +
      ", just completed a Defensible Zone assessment.\n\nFor each skill below, write a short personalised recommendation. Be specific to their sales role, seniority, and selling motion. Use plain English. Do not use the word 'threat'. Be direct and practical. Sound like a sales coach, not a career counselor.\n\nAssign a phase (1, 2, or 3):\n- Phase 1 (Weeks 1–4): actions the seller can begin immediately — no org setup needed\n- Phase 2 (Weeks 5–8): actions requiring coordination with manager/SE/CSM/RevOps\n- Phase 3 (Weeks 9–12): structural moves — vertical positioning, LinkedIn POV, internal mobility\n\nDistribute: aim for 3 in Phase 1, 3 in Phase 2, 2 in Phase 3. Max 4 per phase.\n\nROLE-TRACK GUARDRAILS:\n- ICs: recommendations about THEIR deals, pipeline, personal brand\n- Player-Coach: 60% own deals, 40% team coaching and visibility\n- People Managers: team defensibility, hiring, coaching, own positioning. Do NOT recommend personal prospecting to a VP Sales.\n\nSDR GUARDRAIL: If salesType is sdr or ldr, at least one Phase 3 recommendation must be a transition move toward AE, CSM, or RevOps.\n\nSkills:\n" +
      skillSummary +
      "\n\nReturn ONLY valid JSON:\n{\"recommendations\":[{\"id\":\"s0\",\"headline\":\"5-7 word action headline\",\"action\":\"One specific thing to do.\",\"why\":\"One sentence on why this matters.\",\"phase\":1}]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || "API error");
      var raw = data.content.map(function (b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      setRecommendations(JSON.parse(m[0]));
    } catch (e) {
      setRecsError("Could not load your plan. Please try again.");
    } finally {
      setRecsLoading(false);
    }
  }

  var canProceed = salesType !== "" && roleTrack !== "" && seniority !== "" && workContexts.length > 0;
  var visibleCtx = getVisibleContexts();
  var hiddenCount = WORK_CONTEXTS.length - visibleCtx.length;
  var currentSeniorityOptions = SENIORITY_BY_TRACK[roleTrack] || [];
  var progressPct = ((step + 1) / 6) * 100;
  var skillStepBarPct = (3 / 6) * 100;
  var scoreStepBarPct = (4 / 6) * 100;
  var resultsStepBarPct = (5 / 6) * 100;
  var unlockStepBarPct = 100;
  var dzSliderCSS =
    "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";

  var inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 16,
    fontFamily: S.font,
    border: "1px solid " + S.border,
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
    color: S.text,
  };

  if (gateLoading) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, display: "flex", flexDirection: "column", padding: "32px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@keyframes dzSalesGateDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>DEFENSIBLE ZONE™ · SALES EDITION</div>
            <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>Verifying your link…</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzSalesGateDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzSalesGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzSalesGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}><SalesFooter /></div>
      </div>
    );
  }

  if (recsLoading) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@keyframes dzSalesLoadDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>COMPLETE — YOUR 90-DAY PLAN</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>DEFENSIBLE ZONE™ · SALES EDITION</div>
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{loadingMsg}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out 0.4s infinite" }}>.</span>
              </div>
            </div>
          </div>
          <SalesFooter />
        </div>
      </div>
    );
  }

  if (loading) {
    var loadingStepLabel = step === 3 ? "STEP 4 OF 6 — CALCULATING YOUR ZONE" : "STEP 3 OF 6 — READING YOUR LANDSCAPE";
    var loadingBarPct = step === 3 ? scoreStepBarPct : skillStepBarPct;
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@keyframes dzSalesLoadDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>{loadingStepLabel}</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: loadingBarPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>DEFENSIBLE ZONE™ · SALES EDITION</div>
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{loadingMsg}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ animation: "dzSalesLoadDots 1s ease-in-out 0.4s infinite" }}>.</span>
              </div>
            </div>
          </div>
          <SalesFooter />
        </div>
      </div>
    );
  }

  if (error && (step === 2 || step === 3)) {
    var errStepLabel = step === 3 ? "STEP 4 OF 6 — CALCULATING YOUR ZONE" : "STEP 3 OF 6 — READING YOUR LANDSCAPE";
    var errBarPct = step === 3 ? scoreStepBarPct : skillStepBarPct;
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>{errStepLabel}</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: errBarPct + "%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>
          <Card style={{ textAlign: "center" }}>
            <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{error}</p>
            <PrimaryBtn onClick={function () { setError(null); if (step === 3) fetchScores(); else fetchLandscapeAndSkills(); }}>TRY AGAIN</PrimaryBtn>
          </Card>
          <button type="button" onClick={resetAll} style={{ marginTop: 20, background: "transparent", border: "1px solid " + S.border, color: S.dim, borderRadius: 10, padding: "10px 16px", fontFamily: S.mono, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", width: "100%" }}>START OVER</button>
          <SalesFooter />
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@media(max-width:520px){.sales-sel-grid{grid-template-columns:1fr!important}.sales-track-grid{grid-template-columns:1fr!important}} .sales-sel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px} .sales-track-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>STEP 1 OF 6 — YOUR PROFILE</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: progressPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>DEFENSIBLE ZONE™ — SALES EDITION</div>
            <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>Find out how defensible your sales career really is.</h1>
            <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: 0 }}>AI is reshaping B2B sales faster than most sellers realize. This assessment maps exactly where you&apos;re exposed — and where you&apos;re protected.</p>
          </div>
          <Card style={{ marginBottom: 12 }}>
            <Label>YOUR SALES ROLE</Label>
            {salesGroups.map(function (groupName) {
              var typesInGroup = SALES_TYPES.filter(function (t) { return t.group === groupName; });
              return (
                <div key={groupName} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>{groupName.toUpperCase()}</div>
                  <div className="sales-sel-grid">
                    {typesInGroup.map(function (st) {
                      var active = salesType === st.id;
                      return (
                        <SelBtn key={st.id} active={active} onClick={function () { setSalesType(st.id); }}>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{st.label}</div>
                          <div style={{ fontSize: 13, color: active ? "rgba(255,255,255,0.75)" : S.dim, marginTop: 4, lineHeight: 1.4 }}>{st.desc}</div>
                        </SelBtn>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </Card>
          <Card style={{ marginBottom: 12 }}>
            <Label>YOUR ROLE TRACK</Label>
            <div className="sales-track-grid">
              {ROLE_TRACKS.map(function (rt) {
                var active = roleTrack === rt.id;
                return (
                  <SelBtn key={rt.id} active={active} onClick={function () { setRoleTrack(rt.id); }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{rt.label}</div>
                    <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.75)" : S.dim, marginTop: 4, lineHeight: 1.35 }}>{rt.desc}</div>
                  </SelBtn>
                );
              })}
            </div>
          </Card>
          {roleTrack ? (
            <Card style={{ marginBottom: 12 }}>
              <Label>YOUR SENIORITY</Label>
              <div className="sales-sel-grid">
                {currentSeniorityOptions.map(function (sl) {
                  var active = seniority === sl.id;
                  return (
                    <SelBtn key={sl.id} active={active} onClick={function () { setSeniority(sl.id); }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{sl.label}</div>
                      <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.6)" : S.dim, marginTop: 3, lineHeight: 1.35 }}>{sl.note}</div>
                    </SelBtn>
                  );
                })}
              </div>
            </Card>
          ) : null}
          <Card style={{ marginBottom: 12 }}>
            <Label>YOUR WORK CONTEXTS <span style={{ color: S.red }}>*</span></Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {visibleCtx.map(function (wc) {
                return <Chip key={wc.id} label={wc.label} active={workContexts.indexOf(wc.id) !== -1} onClick={function () { toggleCtx(wc.id); }} />;
              })}
            </div>
            {salesType && !showAllCtx && hiddenCount > 0 ? (
              <button type="button" onClick={function () { setShowAllCtx(true); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.blue, textDecoration: "underline", marginBottom: 10 }}>
                Show {hiddenCount} more contexts
              </button>
            ) : null}
          </Card>
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: S.border }} />
            <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>TELL US MORE — IMPROVES YOUR ASSESSMENT</span>
            <div style={{ flex: 1, height: 1, background: S.border }} />
          </div>
          <Card style={{ marginBottom: 12 }}>
            <Label>YOUR COMPANY TYPE (optional)</Label>
            <div className="sales-sel-grid">
              {COMPANY_TYPES.map(function (ct) {
                var active = companyType === ct.id;
                return (
                  <SelBtn key={ct.id} active={active} onClick={function () { setCompanyType(companyType === ct.id ? "" : ct.id); }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{ct.label}</div>
                    <div style={{ fontSize: 13, color: active ? "rgba(255,255,255,0.75)" : S.dim, marginTop: 4 }}>{ct.sub}</div>
                  </SelBtn>
                );
              })}
            </div>
          </Card>
          <Card style={{ marginBottom: 20 }}>
            <Label>WHO DO YOU SELL TO? (optional)</Label>
            <div className="sales-sel-grid">
              {INDUSTRY_VERTICALS.map(function (iv) {
                var active = industryVertical === iv.id;
                return (
                  <SelBtn key={iv.id} active={active} onClick={function () { setIndustryVertical(industryVertical === iv.id ? "" : iv.id); }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{iv.label}</div>
                  </SelBtn>
                );
              })}
            </div>
          </Card>
          <PrimaryBtn onClick={function () { setStep(1); }} disabled={!canProceed}>ANALYSE MY PROFILE →</PrimaryBtn>
          {!canProceed ? (
            <p style={{ color: S.dim, fontSize: 14, fontFamily: S.mono, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>Select your sales role, role track, seniority, and at least one work context to continue.</p>
          ) : null}
          <SalesDisclaimer />
          <SalesFooter />
        </div>
      </div>
    );
  }

  if (step === 1) {
    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    var gateTryAgainBtn = { width: "100%", marginTop: 16, background: S.accent, color: "#ffffff", border: "none", borderRadius: 10, padding: 16, fontSize: 16, fontWeight: 600, fontFamily: S.mono, letterSpacing: "0.06em", cursor: "pointer" };
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@keyframes dzSalesGateSpin{to{transform:rotate(360deg)}}" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>STEP 2 OF 6 — VERIFY YOUR EMAIL</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "33%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>
          {gateOnDifferentDevice ? (
            <Card style={{ marginBottom: 20, textAlign: "center" }}>
              <Label style={{ color: S.gold, marginBottom: 16 }}>DIFFERENT DEVICE DETECTED</Label>
              <p style={{ fontSize: 16, color: S.text, lineHeight: 1.7, margin: "0 0 20px" }}>It looks like you opened the link on a different device. Please start again on this device.</p>
              <button type="button" onClick={resetAll} style={gateTryAgainBtn}>BEGIN ON THIS DEVICE</button>
            </Card>
          ) : gateSent ? (
            <Card style={{ textAlign: "center" }}>
              <Label style={{ color: S.gold, marginBottom: 16 }}>CHECK YOUR INBOX</Label>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>Almost there.</h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 20px" }}>
                We sent a link to <span style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, fontWeight: 600 }}>{gateEmail}</span>. Click it to continue your assessment.
              </p>
              {showResend ? (
                <button type="button" onClick={function () { setShowResend(false); handleGateSubmit(); }} style={{ background: "transparent", border: "1px solid " + S.border, borderRadius: 10, padding: "10px 20px", fontFamily: S.mono, fontSize: 12, color: S.muted, cursor: "pointer", marginBottom: 8 }}>Resend the link</button>
              ) : null}
              <div style={{ marginTop: 20 }}>
                <button type="button" onClick={function () { setGateSent(false); setShowResend(false); setGateError(""); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.blue, textDecoration: "underline" }}>Use a different email</button>
              </div>
            </Card>
          ) : (
            <Card>
              <Label>ONE QUICK STEP</Label>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>Where should we send your results?</h2>
              <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 24px" }}>Enter your email to start the assessment. Your free results will be emailed to you as a PDF when you&apos;re done.</p>
              {gateError === "expired" ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>That link has expired. Please request a new one.</div> : null}
              {gateError === "invalid" ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>That link isn&apos;t valid. Please try again.</div> : null}
              <input
                type="email"
                placeholder="your@email.com"
                value={gateEmail}
                disabled={gateLoading}
                onFocus={function () { setGateInputFocused(true); }}
                onBlur={function () { setGateInputFocused(false); }}
                onChange={function (e) { setGateEmail(e.target.value); if (showExpiredInvalid) setGateError(""); }}
                style={{ width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: S.font, border: gateInputFocused ? "1px solid " + S.gold : "1px solid " + S.border, borderRadius: 10, outline: "none", boxSizing: "border-box", background: "#ffffff", color: S.text }}
              />
              {gateError && !showExpiredInvalid ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{gateError}</div> : null}
              <button type="button" onClick={handleGateSubmit} disabled={gateLoading} style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 600, fontFamily: S.mono, letterSpacing: "0.06em", background: gateLoading ? "#e5a820" : S.gold, color: "#ffffff", border: "none", borderRadius: 10, cursor: gateLoading ? "not-allowed" : "pointer", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {gateLoading ? <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #ffffff", borderRadius: "50%", animation: "dzSalesGateSpin 0.85s linear infinite", flexShrink: 0 }} /> : null}
                {gateLoading ? "Sending…" : "SEND ME THE LINK →"}
              </button>
            </Card>
          )}
          <button type="button" onClick={function () { setStep(0); }} style={{ marginTop: 20, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}>← BACK</button>
          <SalesFooter />
        </div>
      </div>
    );
  }

  if (step === 3) {
    var profile3 = buildProfile(salesType, roleTrack, seniority, workContexts, companyType, industryVertical);
    var landscapeSummary = profile3.seniorityLabel + " " + profile3.salesTypeLabel;
    var affinityStops = [0, 3, 5, 7, 10];
    var conscienceLabelTexts = ["Move on easily", "Slightly bothered", "Unsettled", "Want to fix it", "Can't let it go"];
    var pullLabelTexts = ["Almost never", "Occasionally", "Sometimes", "Regularly", "Constantly"];

    if (!showCalibration) {
      return (
        <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
          <SalesNavBar />
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>STEP 3 OF 6 — REVIEW YOUR SKILLS</div>
              <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: skillStepBarPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
              </div>
            </div>
            <button type="button" onClick={resetAll} style={{ background: "transparent", border: "1px solid " + S.border, color: S.dim, borderRadius: 10, padding: "10px 16px", fontFamily: S.mono, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", marginBottom: 24 }}>START OVER</button>
            <div style={{ background: S.accent, borderRadius: 14, padding: 22, marginBottom: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, background: "radial-gradient(circle,rgba(217,119,6,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div style={{ fontFamily: S.mono, fontSize: 12, color: "rgba(217,119,6,.85)", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>YOUR AI LANDSCAPE — {landscapeSummary.toUpperCase()}</div>
              <p style={{ color: "#ffffff", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{landscape}</p>
            </div>
            <Card style={{ marginBottom: 20 }}>
              <Label>YOUR SKILLS TO ASSESS</Label>
              <p style={{ color: S.dim, fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>Generated for your exact profile. Edit any skill to be more specific — specificity improves your scores.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {skills.map(function (s) {
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {s.editing ? (
                          <input autoFocus value={s.text} onChange={function (e) { updateText(s.id, e.target.value); }} onBlur={function () { commitEdit(s.id); }} onKeyDown={function (e) { if (e.key === "Enter" || e.key === "Escape") commitEdit(s.id); }} style={inputStyle} />
                        ) : (
                          <div onClick={function () { startEditing(s.id); }} style={{ display: "flex", alignItems: "center", background: "#f2f4f8", border: "1px solid " + S.border, borderRadius: 10, padding: "10px 14px", gap: 10, minHeight: 46, cursor: "pointer" }}>
                            <span style={{ color: S.text, fontSize: 16, flex: 1, fontWeight: 500, lineHeight: 1.4 }}>{s.text}</span>
                            <button type="button" onClick={function (ev) { ev.stopPropagation(); startEditing(s.id); }} style={{ background: "none", border: "1px solid " + S.border, color: S.muted, cursor: "pointer", fontSize: 12, padding: "4px 9px", borderRadius: 6, fontFamily: S.mono }}>EDIT</button>
                            <button type="button" onClick={function (ev) { ev.stopPropagation(); removeSkill(s.id); }} style={{ background: "none", border: "none", color: S.dim, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, fontFamily: S.mono, background: adjustedSkills.has(s.id) ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.10)", color: adjustedSkills.has(s.id) ? "#d97706" : "#059669" }}>{adjustedSkills.has(s.id) ? "adjusted" : "pre-seeded"}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" placeholder="Add a custom skill…" value={customSkill} onChange={function (e) { setCustomSkill(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") addSkill(); }} style={Object.assign({}, inputStyle, { flex: 1, marginBottom: 0 })} />
                <button type="button" onClick={addSkill} disabled={!customSkill.trim()} style={{ background: customSkill.trim() ? S.accent : S.card2, color: customSkill.trim() ? "white" : S.dim, border: "1px solid " + S.border, borderRadius: 10, padding: "12px 18px", fontFamily: S.mono, fontSize: 13, fontWeight: 700, cursor: customSkill.trim() ? "pointer" : "not-allowed" }}>ADD</button>
              </div>
            </Card>
            <PrimaryBtn onClick={function () { setShowCalibration(true); }} disabled={skills.length === 0}>CALIBRATE MY SKILLS →</PrimaryBtn>
            <SalesFooter />
          </div>
        </div>
      );
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: dzSliderCSS }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>STEP 4 OF 6 — CALIBRATE YOUR SKILLS</div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: scoreStepBarPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>
          <button type="button" onClick={resetAll} style={{ background: "transparent", border: "1px solid " + S.border, color: S.dim, borderRadius: 10, padding: "10px 16px", fontFamily: S.mono, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", marginBottom: 24 }}>START OVER</button>
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>PART 1 — ABOUT YOU IN GENERAL</div>
          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em" }}>SALES CONSCIENCE</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>When you lose a deal you know you should have won — because you cut corners on discovery or skipped a stakeholder — how does that sit with you?</p>
            <input className="dz-slider conscience-sl" type="range" min={0} max={10} step={1} value={conscience} onChange={function (e) { setConscience(snapToStop(Number(e.target.value))); }} style={{ background: "linear-gradient(to right, #7c3aed " + (conscience / 10) * 100 + "%, #d0d7e8 " + (conscience / 10) * 100 + "%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {affinityStops.map(function (stopValue, idx) {
                return <div key={stopValue} style={{ width: "20%", textAlign: "center", fontSize: 12, color: "#7c3aed", opacity: Math.abs(conscience - stopValue) <= 1 ? 1 : 0.25, fontWeight: Math.abs(conscience - stopValue) <= 1 ? 700 : 400 }}>{conscienceLabelTexts[idx]}</div>;
              })}
            </div>
          </div>
          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0891b2", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#0891b2", letterSpacing: "0.08em" }}>MARKET PULL</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>Outside of work — do you find yourself thinking about your accounts, your pipeline, or how to sharpen your approach?</p>
            <input className="dz-slider pull-sl" type="range" min={0} max={10} step={1} value={pull} onChange={function (e) { setPull(snapToStop(Number(e.target.value))); }} style={{ background: "linear-gradient(to right, #0891b2 " + (pull / 10) * 100 + "%, #d0d7e8 " + (pull / 10) * 100 + "%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {affinityStops.map(function (stopValue, idx) {
                return <div key={stopValue} style={{ width: "20%", textAlign: "center", fontSize: 12, color: "#0891b2", opacity: Math.abs(pull - stopValue) <= 1 ? 1 : 0.25, fontWeight: Math.abs(pull - stopValue) <= 1 ? 700 : 400 }}>{pullLabelTexts[idx]}</div>;
              })}
            </div>
          </div>
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 16 }}>PART 2 — YOUR SKILLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {skills.map(function (s) {
              var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              var affinityScore = compAff(conscience, pull, fluencyVal);
              var affinityColor = affinityScore >= 7 ? S.green : affinityScore >= 5 ? S.gold : S.red;
              return (
                <div key={s.id} style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                      {s.editing ? (
                        <input autoFocus value={s.text} onChange={function (e) { updateText(s.id, e.target.value); }} onBlur={function () { commitEdit(s.id); }} onKeyDown={function (e) { if (e.key === "Enter" || e.key === "Escape") commitEdit(s.id); }} style={inputStyle} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: S.text, flex: 1, lineHeight: 1.4 }}>{s.text}</span>
                          <button type="button" onClick={function () { startEditing(s.id); }} style={{ background: "none", border: "1px solid " + S.border, color: S.muted, cursor: "pointer", fontSize: 12, padding: "4px 9px", borderRadius: 6, fontFamily: S.mono }}>EDIT</button>
                          <button type="button" onClick={function () { removeSkill(s.id); }} style={{ background: "none", border: "none", color: S.dim, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, fontFamily: S.mono, background: adjustedSkills.has(s.id) ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.10)", color: adjustedSkills.has(s.id) ? "#d97706" : "#059669" }}>{adjustedSkills.has(s.id) ? "adjusted" : "pre-seeded"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>FELT FLUENCY</span>
                    <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#d97706" }}>{fluencyVal}/10</span>
                  </div>
                  <input className="dz-slider fluency-sl" type="range" min={0} max={10} step={1} value={fluencyVal} onChange={function (e) { var val = Number(e.target.value); setFluencies(function (prev) { return Object.assign({}, prev, { [s.id]: val }); }); markAdjusted(s.id); }} style={{ background: "linear-gradient(to right, #d97706 " + (fluencyVal / 10) * 100 + "%, #d0d7e8 " + (fluencyVal / 10) * 100 + "%)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Effortful</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Frictionless</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>AFFINITY SCORE</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: affinityColor }}>{affinityScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="text" placeholder="Add a custom skill…" value={customSkill} onChange={function (e) { setCustomSkill(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") addSkill(); }} style={Object.assign({}, inputStyle, { flex: 1, marginBottom: 0 })} />
              <button type="button" onClick={addSkill} disabled={!customSkill.trim()} style={{ background: customSkill.trim() ? S.accent : S.card2, color: customSkill.trim() ? "white" : S.dim, border: "1px solid " + S.border, borderRadius: 10, padding: "12px 18px", fontFamily: S.mono, fontSize: 13, fontWeight: 700, cursor: customSkill.trim() ? "pointer" : "not-allowed" }}>ADD</button>
            </div>
          </Card>
          <button type="button" onClick={function () { setShowCalibration(false); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.blue, textDecoration: "underline", marginBottom: 20 }}>← BACK TO SKILLS</button>
          <PrimaryBtn onClick={fetchScores} disabled={skills.length === 0}>SEE MY RESULTS →</PrimaryBtn>
          <SalesFooter />
        </div>
      </div>
    );
  }

  // ── STEP 4: FREE RESULTS ─────────────────────────────────────────────
  if (step === 4 && results) {
    var scoredSkills4 = Array.isArray(results.skills) ? results.skills : [];
    var overallScore = computeOverallScore(scoredSkills4);
    var overallColor4 = dzScoreColor(overallScore);
    var phase1TeaserText =
      results.phase1Teaser && results.phase1Teaser.trim()
        ? results.phase1Teaser
        : "Start with one concrete move this week that makes your strongest deal skill visible — to your manager, your accounts, or your pipeline.";
    var unlockPrice4 = discountApplied ? "$39.50" : "$79";

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 5 OF 6 — YOUR RESULTS
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: resultsStepBarPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            style={{
              background: "transparent",
              border: "1px solid " + S.border,
              color: S.dim,
              borderRadius: 10,
              padding: "10px 16px",
              fontFamily: S.mono,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.06em",
              marginBottom: 24,
            }}
          >
            START OVER
          </button>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 20, fontWeight: 600 }}>
            DEFENSIBLE ZONE™ · SALES EDITION
          </div>

          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Your Defensible Zone™
          </h1>

          <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: "0 0 28px", lineHeight: 1.5, letterSpacing: "0.02em" }}>
            {results.profile && results.profile.summary ? results.profile.summary : ""}
          </p>

          <div style={{ background: S.accent, borderRadius: 14, padding: 22, marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 160,
                height: 160,
                background: "radial-gradient(circle,rgba(217,119,6,.15) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "rgba(217,119,6,.85)", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              YOUR AI LANDSCAPE
            </div>
            <p style={{ color: "#ffffff", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{results.landscape}</p>
          </div>

          <Card style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
              YOUR DEFENSIBLE ZONE SCORE
            </div>
            <div style={{ fontFamily: S.mono, fontSize: 72, fontWeight: 700, color: overallColor4, lineHeight: 1, marginBottom: 12 }}>
              {overallScore}
            </div>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              {getOverallSubLabel(overallScore)}
            </p>
          </Card>

          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 14, fontWeight: 600 }}>
            SKILL-BY-SKILL BREAKDOWN
          </div>

          {scoredSkills4.map(function (sk) {
            var dz = typeof sk.dz === "number" ? sk.dz : 0;
            var aiR = typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : 5;
            var mkt = typeof sk.market_demand === "number" ? sk.market_demand : 7;
            var aff = typeof sk.affinity === "number" ? sk.affinity : 5;
            var col = dzScoreColor(dz);
            var skillName = sk.text || sk.name || "—";
            return (
              <div
                key={sk.id || skillName}
                style={{
                  background: S.card,
                  border: "1px solid " + S.border,
                  borderRadius: 12,
                  padding: "18px 20px",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.35, flex: 1 }}>{skillName}</div>
                  <div style={{ fontFamily: S.mono, fontSize: 28, fontWeight: 700, color: col, flexShrink: 0, lineHeight: 1 }}>{dz}</div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>AI EXPOSURE</span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.red, fontWeight: 700 }}>{aiR}/10</span>
                  </div>
                  <div style={{ height: 6, background: S.card2, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: (aiR / 10) * 100 + "%", height: "100%", background: S.red, borderRadius: 3 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>MARKET VALUE</span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.green, fontWeight: 700 }}>{mkt}/10</span>
                  </div>
                  <div style={{ height: 6, background: S.card2, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: (mkt / 10) * 100 + "%", height: "100%", background: S.green, borderRadius: 3 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>YOUR AFFINITY</span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, color: S.purple, fontWeight: 700 }}>{aff}/10</span>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
                  {getSkillInterpretation(aiR, mkt, aff)}
                </p>
              </div>
            );
          })}

          <div
            style={{
              background: S.card,
              border: "2px solid " + S.gold,
              borderRadius: 12,
              padding: "20px 22px",
              marginTop: 32,
              marginBottom: 28,
            }}
          >
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.08em", marginBottom: 10, fontWeight: 700 }}>
              PREVIEW — PHASE 1 ACTION
            </div>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.65, margin: 0 }}>{phase1TeaserText}</p>
          </div>

          <div
            style={{
              background: S.card2,
              border: "1px solid " + S.border,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, margin: 0, lineHeight: 1.6 }}>
              A copy of these results has been sent to {gateEmail}
            </p>
          </div>

          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>
            HAVE A PROMO CODE?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch", marginBottom: 8 }}>
            <input
              type="text"
              value={promoCode}
              onChange={function (e) {
                setPromoCode(e.target.value);
                if (promoError) setPromoError("");
              }}
              placeholder="Enter code"
              style={Object.assign({}, inputStyle, { flex: "1 1 160px", minWidth: 0, marginBottom: 0 })}
            />
            <button
              type="button"
              onClick={applyPromoCode}
              style={{
                padding: "12px 20px",
                fontSize: 15,
                fontFamily: S.mono,
                fontWeight: 700,
                letterSpacing: "0.06em",
                background: S.card2,
                color: S.text,
                border: "1px solid " + S.border,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              APPLY
            </button>
          </div>
          {promoError ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>{promoError}</div> : null}
          {testModeApplied ? (
            <div style={{ color: S.green, fontSize: 14, marginBottom: 20 }}>Test mode — $1.00 price applied</div>
          ) : discountApplied ? (
            <div style={{ color: S.green, fontSize: 14, marginBottom: 20 }}>50% discount applied — your price is $39.50</div>
          ) : null}

          <PrimaryBtn
            onClick={function () {
              setStep(5);
            }}
            style={{ marginBottom: 28 }}
          >
            UNLOCK MY FULL PLAN — {unlockPrice4}
          </PrimaryBtn>

          <SalesDisclaimer />
          <SalesFooter />
        </div>
      </div>
    );
  }

  // ── STEP 5: PAYWALL ──────────────────────────────────────────────────
  if (step === 5 && tier < 2 && !promoUsed) {
    var unlockPrice5 = discountApplied ? "$39.50" : "$79";
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <style dangerouslySetInnerHTML={{ __html: "@keyframes dzSalesCheckoutSpin{to{transform:rotate(360deg)}}" }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 6 OF 6 — UNLOCK YOUR PLAN
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 20, fontWeight: 600 }}>
            UNLOCK YOUR 90-DAY PLAN
          </div>

          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
            Your full plan is ready.
          </h1>

          <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 28px" }}>
            Unlock personalised actions for every skill — sequenced across three phases. We&apos;ll email the complete plan to{" "}
            <span style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, fontWeight: 600 }}>{gateEmail}</span>.
          </p>

          <div
            style={{
              background: S.accent,
              borderRadius: 14,
              padding: "28px 24px",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: S.mono, fontSize: 28, fontWeight: 700, color: "#ffffff" }}>{unlockPrice5}</div>
          </div>

          {paymentCanceled ? (
            <div style={{ color: "#d97706", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              Payment was cancelled — try again when you&apos;re ready.
            </div>
          ) : null}

          {checkoutError ? (
            <div style={{ color: S.red, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{checkoutError}</div>
          ) : null}

          <PrimaryBtn onClick={handleUnlockCheckout} disabled={checkoutLoading} style={{ marginBottom: 24 }}>
            {checkoutLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "dzSalesCheckoutSpin 0.85s linear infinite",
                    flexShrink: 0,
                  }}
                />
                Starting checkout…
              </span>
            ) : (
              "UNLOCK MY PLAN → " + unlockPrice5
            )}
          </PrimaryBtn>

          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>
            HAVE A PROMO CODE?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch", marginBottom: 8 }}>
            <input
              type="text"
              value={promoCode}
              onChange={function (e) {
                setPromoCode(e.target.value);
                if (promoError) setPromoError("");
              }}
              placeholder="Enter code"
              style={Object.assign({}, inputStyle, { flex: "1 1 160px", minWidth: 0, marginBottom: 0 })}
            />
            <button
              type="button"
              onClick={applyPromoCode}
              style={{
                padding: "12px 20px",
                fontSize: 15,
                fontFamily: S.mono,
                fontWeight: 700,
                letterSpacing: "0.06em",
                background: S.card2,
                color: S.text,
                border: "1px solid " + S.border,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              APPLY
            </button>
          </div>
          {promoError ? <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>{promoError}</div> : null}
          {testModeApplied ? (
            <div style={{ color: S.green, fontSize: 14, marginBottom: 24 }}>Test mode — $1.00 price applied</div>
          ) : discountApplied ? (
            <div style={{ color: S.green, fontSize: 14, marginBottom: 24 }}>50% discount applied — your price is $39.50</div>
          ) : null}

          <button
            type="button"
            onClick={function () {
              setStep(4);
              setPaymentCanceled(false);
              setCheckoutError(null);
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: S.mono,
              fontSize: 12,
              color: S.dim,
              letterSpacing: "0.06em",
            }}
          >
            ← BACK TO RESULTS
          </button>

          <SalesFooter />
        </div>
      </div>
    );
  }

  // ── STEP 6: 90-DAY PLAN ──────────────────────────────────────────────
  if (step === 6 && (tier >= 2 || promoUsed)) {
    var rawRecs6 = recommendations && Array.isArray(recommendations.recommendations) ? recommendations.recommendations.slice() : [];
    var PHASE_HEADERS_6 = [
      { phase: 1, label: "PHASE 1: WEEKS 1–4 — START NOW" },
      { phase: 2, label: "PHASE 2: WEEKS 5–8 — BUILD ON IT" },
      { phase: 3, label: "PHASE 3: WEEKS 9–12 — STRUCTURAL MOVES" },
    ];

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <SalesNavBar />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              COMPLETE — YOUR 90-DAY PLAN
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "100%", background: S.green, borderRadius: 2 }} />
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            style={{
              background: "transparent",
              border: "1px solid " + S.border,
              color: S.dim,
              borderRadius: 10,
              padding: "10px 16px",
              fontFamily: S.mono,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.06em",
              marginBottom: 24,
            }}
          >
            START OVER
          </button>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 12, fontWeight: 600 }}>
            YOUR DEFENSIBLE ZONE PLAN
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 10px", lineHeight: 1.2, fontWeight: 600 }}>
            90 days to a stronger position.
          </h1>
          <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 32px" }}>
            Here is exactly what to do — sequenced by what you can start now.
          </p>

          {recsError ? (
            <Card style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{recsError}</p>
              <PrimaryBtn onClick={fetchRecommendations}>TRY AGAIN</PrimaryBtn>
            </Card>
          ) : null}

          {!recsError && rawRecs6.length > 0
            ? PHASE_HEADERS_6.map(function (ph) {
                var phaseRecs = rawRecs6.filter(function (r) {
                  return r.phase === ph.phase;
                });
                if (phaseRecs.length === 0) return null;
                return (
                  <div key={ph.phase} style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontFamily: S.mono,
                        fontSize: 11,
                        color: S.muted,
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                        marginBottom: 14,
                      }}
                    >
                      {ph.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {phaseRecs.map(function (rec, idx) {
                        return (
                          <div
                            key={(rec.id || "rec") + "-" + idx}
                            style={{
                              background: S.card,
                              border: "1px solid " + S.border,
                              borderRadius: 12,
                              padding: "20px 22px",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 14,
                                right: 14,
                                fontFamily: S.mono,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                color: S.gold,
                                background: S.card2,
                                border: "1px solid " + S.border,
                                borderRadius: 6,
                                padding: "4px 8px",
                              }}
                            >
                              PHASE {rec.phase}
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: S.text, lineHeight: 1.35, marginBottom: 10, paddingRight: 72 }}>
                              {rec.headline || "—"}
                            </div>
                            <div style={{ fontSize: 15, color: S.dim, lineHeight: 1.65, marginBottom: 10 }}>{rec.action || ""}</div>
                            <div style={{ fontSize: 13, color: S.muted, fontStyle: "italic", lineHeight: 1.55 }}>{rec.why || ""}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            : null}

          {!recsError && rawRecs6.length > 0 ? (
            <div
              style={{
                background: S.card2,
                border: "1px solid " + S.border,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 28,
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, margin: 0, lineHeight: 1.6 }}>
                A copy of this plan has been sent to {gateEmail}
              </p>
            </div>
          ) : null}

          <div style={{ margin: "8px 0 28px" }}>
            <div style={{ background: S.card, border: "1px solid " + S.border, borderRadius: 14, padding: "22px 22px" }}>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 12, fontWeight: 700 }}>
                YOUR NEXT STEP
              </div>
              <div style={{ fontFamily: S.serif, fontSize: 24, color: S.text, margin: "0 0 10px", lineHeight: 1.25, fontWeight: 600 }}>
                Work through this with me.
              </div>
              <div style={{ color: S.dim, fontSize: 15, lineHeight: 1.65, marginBottom: 18 }}>
                Book a session to walk through your results together and build a concrete plan.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {OFFER_FREE_SESSION === true ? (
                  <div style={{ background: S.accent, borderRadius: 14, padding: "18px 18px" }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 10, fontWeight: 700 }}>
                      COMPLIMENTARY
                    </div>
                    <div style={{ fontFamily: S.serif, fontSize: 20, color: "#ffffff", margin: "0 0 12px", lineHeight: 1.25, fontWeight: 600 }}>
                      Book your free 30-min session
                    </div>
                    <a
                      href="https://cal.com/dkchetan/dz-individual-free"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontFamily: S.mono,
                        fontSize: 13,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        background: S.gold,
                        color: "#0d1117",
                        textDecoration: "none",
                      }}
                    >
                      BOOK NOW →
                    </a>
                  </div>
                ) : null}

                <div style={{ background: S.card, border: "1px solid " + S.accent, borderRadius: 14, padding: "18px 18px" }}>
                  <div style={{ fontFamily: S.mono, fontSize: 24, fontWeight: 800, color: S.accent, lineHeight: 1, marginBottom: 10 }}>$99</div>
                  <div style={{ fontFamily: S.serif, fontSize: 18, color: S.text, margin: "0 0 10px", lineHeight: 1.25, fontWeight: 600 }}>
                    30-min Strategy Session — $99
                  </div>
                  <a
                    href="https://cal.com/dkchetan/individual-strategy"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontFamily: S.mono,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      background: S.accent,
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    Book now →
                  </a>
                </div>

                <div style={{ background: S.card, border: "1px solid " + S.accent, borderRadius: 14, padding: "18px 18px" }}>
                  <div style={{ fontFamily: S.mono, fontSize: 24, fontWeight: 800, color: S.accent, lineHeight: 1, marginBottom: 10 }}>$199</div>
                  <div style={{ fontFamily: S.serif, fontSize: 18, color: S.text, margin: "0 0 10px", lineHeight: 1.25, fontWeight: 600 }}>
                    60-min Deep Dive — $199
                  </div>
                  <a
                    href="https://cal.com/dkchetan/individual-roadmap"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontFamily: S.mono,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      background: S.accent,
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    Book now →
                  </a>
                </div>
              </div>

              <div style={{ fontSize: 15, color: S.dim, textAlign: "center", marginTop: 16, fontFamily: S.font }}>
                Full refund if cancelled up to 2 business days before the session.
              </div>
            </div>
          </div>

          <SalesDisclaimer />
          <SalesFooter />
        </div>
      </div>
    );
  }

  return null;
}
