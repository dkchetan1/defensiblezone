import { useState, useEffect, useRef } from "react";

// ── PM TYPES ────────────────────────────────────────────────────────
var PM_TYPES = [
  { id:"generalist",  label:"Generalist PM",       desc:"Full lifecycle — roadmap, discovery, delivery" },
  { id:"growth",      label:"Growth PM",            desc:"Acquisition, retention, monetization, A/B testing" },
  { id:"platform",    label:"Platform / API PM",    desc:"Developer platforms, APIs, internal infrastructure" },
  { id:"enterprise",  label:"Enterprise PM",        desc:"B2B, long sales cycles, complex stakeholder maps" },
  { id:"consumer",    label:"Consumer PM",          desc:"B2C at scale, UX, engagement loops" },
  { id:"aiml",        label:"AI / ML PM",           desc:"AI-native products, model governance, evals" },
  { id:"technical",   label:"Technical PM",         desc:"Deep engineering collaboration, systems thinking" },
  { id:"data",        label:"Data PM",              desc:"Data products, analytics platforms, BI tools" },
  { id:"ux",          label:"UX / Research PM",     desc:"User research, design systems, experience-first" },
  { id:"ops",         label:"Product Ops PM",       desc:"Internal tooling, ops workflows, process products" },
  { id:"regulated",   label:"Regulated Industry PM",desc:"Fintech, HealthTech, GovTech — compliance-first" },
  { id:"hardware",    label:"Hardware / IoT PM",    desc:"Physical + digital, firmware, supply chain" },
  { id:"marketplace", label:"Marketplace PM",       desc:"Two-sided markets, trust & safety, liquidity" },
];

// ── SENIORITY ───────────────────────────────────────────────────────
var SENIORITY_LEVELS = [
  { id:"apm",      label:"APM / Associate PM",   sub:"0 – 2 yrs",    note:"Feature-level work, mentored" },
  { id:"pm",       label:"Product Manager",      sub:"2 – 4 yrs",    note:"End-to-end feature ownership" },
  { id:"senior",   label:"Senior PM",            sub:"4 – 7 yrs",    note:"Product area ownership, strategic input" },
  { id:"staff",    label:"Staff / Principal PM", sub:"7 – 12 yrs",   note:"Cross-org influence, framework-setter" },
  { id:"gpm",      label:"Group PM / Lead PM",   sub:"5 – 10 yrs",   note:"Multiple products, some people management" },
  { id:"director", label:"Director of Product",  sub:"8 – 15 yrs",   note:"Full product org, strategy, hiring" },
  { id:"vp",       label:"VP of Product",        sub:"12 – 20 yrs",  note:"Company-level vision, P&L" },
  { id:"cpo",      label:"CPO",                  sub:"15+ yrs",      note:"C-suite, everything product" },
];

// ── COMPANY TYPES ───────────────────────────────────────────────────
var COMPANY_TYPES = [
  { id:"seed",       label:"Seed / Pre-PMF Startup",  sub:"1 – 20 people" },
  { id:"early",      label:"Early-Stage Startup",     sub:"20 – 75 people" },
  { id:"growth",     label:"Growth-Stage Startup",    sub:"75 – 500 people" },
  { id:"tier1",      label:"Tier-1 Big Tech",         sub:"Google, Meta, Apple, Microsoft, Amazon" },
  { id:"aifirst",    label:"AI-First Company",        sub:"OpenAI, Anthropic, Mistral, etc." },
  { id:"b2bsaas",    label:"B2B SaaS",                sub:"50 – 2,000 people" },
  { id:"enterprise", label:"Enterprise (non-tech)",   sub:"Large corp, not tech-first" },
  { id:"fintech",    label:"Fintech",                 sub:"Payments, banking, crypto, insurance" },
  { id:"healthtech", label:"HealthTech / MedTech",    sub:"HIPAA, clinical, digital health" },
  { id:"marketplace",label:"Marketplace / Platform",  sub:"Two-sided, Airbnb/Uber model" },
  { id:"gov",        label:"Government / Public Sector", sub:"Policy, accessibility, slow cycles" },
];

// ── WORK CONTEXTS ───────────────────────────────────────────────────
var WORK_CONTEXTS = [
  { id:"discovery",     label:"Customer Discovery & Research" },
  { id:"roadmap",       label:"Roadmap Prioritization & Strategy" },
  { id:"delivery",      label:"Delivery & Execution (PRDs, sprints)" },
  { id:"stakeholder",   label:"Stakeholder & Executive Alignment" },
  { id:"metrics",       label:"Metrics, OKRs & Analytics" },
  { id:"gtm",           label:"Go-to-Market & Product Launches" },
  { id:"pricing",       label:"Pricing & Monetization Strategy" },
  { id:"platform_api",  label:"Platform / API Products" },
  { id:"growth_exp",    label:"Growth Experimentation & Funnels" },
  { id:"ai_integration",label:"AI Feature Integration" },
  { id:"ai_native",     label:"AI-Native Product Building" },
  { id:"data_products", label:"Data Products & Analytics Platforms" },
  { id:"compliance",    label:"Compliance & Regulated Products" },
  { id:"hardware_iot",  label:"Hardware / IoT Products" },
  { id:"b2b_enterprise",label:"B2B Enterprise Sales Cycles" },
  { id:"consumer_exp",  label:"Consumer Experience at Scale" },
];

// ── CONTEXT FILTER MAP ──────────────────────────────────────────────
var CONTEXT_MAP = {
  generalist:  ["discovery","roadmap","delivery","stakeholder","metrics","gtm"],
  growth:      ["metrics","growth_exp","pricing","delivery","consumer_exp","ai_integration"],
  platform:    ["platform_api","delivery","stakeholder","ai_native","data_products","roadmap"],
  enterprise:  ["b2b_enterprise","stakeholder","compliance","delivery","roadmap","gtm"],
  consumer:    ["consumer_exp","discovery","growth_exp","metrics","gtm","delivery"],
  aiml:        ["ai_native","ai_integration","data_products","delivery","metrics","compliance"],
  technical:   ["platform_api","delivery","ai_integration","data_products","roadmap","stakeholder"],
  data:        ["data_products","metrics","ai_integration","compliance","delivery","roadmap"],
  ux:          ["discovery","consumer_exp","delivery","roadmap","stakeholder","metrics"],
  ops:         ["delivery","metrics","stakeholder","compliance","data_products","roadmap"],
  regulated:   ["compliance","b2b_enterprise","stakeholder","delivery","data_products","roadmap"],
  hardware:    ["hardware_iot","delivery","stakeholder","gtm","compliance","roadmap"],
  marketplace: ["consumer_exp","growth_exp","stakeholder","pricing","compliance","metrics"],
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
var PROMO_CODES    = ["DZFRIEND","DZPREVIEW","DZTEST"];
var DISCOUNT_CODES = ["DZHALF"];

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
function buildProfile(pmType, seniority, workContexts, companyType) {
  var pt = PM_TYPES.find(function(p) { return p.id === pmType; });
  var sl = SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
  var ct = COMPANY_TYPES.find(function(c) { return c.id === companyType; });
  var wcLabels = workContexts.map(function(id) {
    var w = WORK_CONTEXTS.find(function(x) { return x.id === id; });
    return w ? w.label : id;
  });
  return {
    pmLabel:       pt ? pt.label : pmType,
    seniorityLabel: sl ? sl.label : seniority,
    seniorityNote:  sl ? sl.note  : "",
    companyLabel:   ct ? ct.label : (companyType || ""),
    workContextLabels: wcLabels,
    summary: (sl ? sl.label : seniority) + " " + (pt ? pt.label : pmType) + (ct ? " · " + ct.label : ""),
  };
}

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
function PMFooter() {
  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid " + S.border, textAlign: "center" }}>
      <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, lineHeight: 1.7, marginBottom: 8 }}>
        DEFENSIBLE ZONE™ is a product of Recursion Lab
      </div>
      <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, lineHeight: 1.7 }}>
        <a href="https://defensiblezone.ai" style={{ color: S.blue, textDecoration: "none" }}>
          defensiblezone.ai
        </a>
        {" · "}
        <a href="mailto:support@recursiolab.com" style={{ color: S.blue, textDecoration: "none" }}>
          Questions or feedback → support@recursiolab.com
        </a>
      </div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────
export default function ProductManager() {
  var [pmType, setPmType]                   = useState("");
  var [seniority, setSeniority]             = useState("");
  var [companyType, setCompanyType]         = useState("");
  var [workContexts, setWorkContexts]       = useState([]);
  var [showAllCtx, setShowAllCtx]           = useState(false);
  var [landscape, setLandscape]             = useState("");
  var [skills, setSkills]                   = useState([]);
  var [conscience, setConscience]           = useState(5);
  var [pull, setPull]                       = useState(5);
  var [fluencies, setFluencies]             = useState({});
  var [skillConscience, setSkillConscience] = useState({});
  var [skillPull, setSkillPull]             = useState({});
  var [customSkill, setCustomSkill]         = useState("");
  var [adjustedSkills, setAdjustedSkills]   = useState(function() { return new Set(); });
  var adjustedSkillsRef                     = useRef(new Set());
  var freeEmailSentRef                      = useRef(false);
  var paidEmailSentRef                      = useRef(false);
  var [results, setResults]                 = useState(null);
  var [benchmark, setBenchmark]             = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading]         = useState(false);
  var [recsError, setRecsError]             = useState(null);
  var [step, setStep]                       = useState(0);
  var [loading, setLoading]                 = useState(false);
  var [loadingMsg, setLoadingMsg]           = useState("");
  var [error, setError]                     = useState(null);
  var [tier, setTier]                       = useState(0);
  var [promoCode, setPromoCode]             = useState("");
  var [promoError, setPromoError]           = useState("");
  var [promoUsed, setPromoUsed]             = useState(false);
  var [discountApplied, setDiscountApplied] = useState(false);
  var [gateEmail, setGateEmail]             = useState("");
  var [gateSent, setGateSent]               = useState(false);
  var [gateVerified, setGateVerified]       = useState(false);
  var [gateError, setGateError]             = useState("");
  var [gateLoading, setGateLoading]         = useState(false);
  var [showResend, setShowResend]           = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [checkoutLoading, setCheckoutLoading] = useState(false);
  var [checkoutError, setCheckoutError] = useState(null);
  var [paymentCanceled, setPaymentCanceled] = useState(false);

  function markAdjusted(skillId) {
    adjustedSkillsRef.current.add(skillId);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  useEffect(function() {
    setFluencies(function(prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function(s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = getSeed(conscience, pull);
        }
      });
      return next;
    });
    setSkillConscience(function(prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function(s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = conscience;
        }
      });
      return next;
    });
    setSkillPull(function(prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function(s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = pull;
        }
      });
      return next;
    });
  }, [conscience, pull, skills]);

  var PM_LOADING_MSGS = [
    "Mapping your PM landscape…",
    "Identifying your exposure points…",
    "Calibrating skill defensibility…",
    "Almost ready…",
  ];

  var PM_SCORING_MSGS = [
    "Scoring your skills…",
    "Calculating AI exposure…",
    "Building your defensible zone…",
    "Almost there…",
  ];

  var PM_RECS_MSGS = [
    "Mapping your 90-day plan…",
    "Sequencing your actions…",
    "Personalising to your PM profile…",
    "Almost ready…",
  ];

  useEffect(
    function () {
      if (!loading && !recsLoading) return;
      var msgs = recsLoading ? PM_RECS_MSGS : step === 3 ? PM_SCORING_MSGS : PM_LOADING_MSGS;
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

  useEffect(
    function () {
      if (!gateVerified) return;
      if (skills.length > 0 || loading) return;
      fetchLandscapeAndSkills();
    },
    [gateVerified]
  );

  function restoreSavedReport() {
    try {
      var savedRaw = localStorage.getItem("dz_saved_report_pm");
      if (!savedRaw) return false;
      var s = JSON.parse(savedRaw);
      if (s.pmType) setPmType(s.pmType);
      if (s.seniority) setSeniority(s.seniority);
      if (s.companyType) setCompanyType(s.companyType);
      if (s.workContexts) setWorkContexts(s.workContexts);
      if (s.conscience !== undefined) setConscience(s.conscience);
      if (s.pull !== undefined) setPull(s.pull);
      if (s.gateEmail) setGateEmail(s.gateEmail);
      if (s.landscape) setLandscape(s.landscape);
      if (s.skills) setSkills(s.skills);
      if (s.fluencies) setFluencies(s.fluencies);
      if (s.skillConscience) setSkillConscience(s.skillConscience);
      if (s.skillPull) setSkillPull(s.skillPull);
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
        "dz_saved_report_pm",
        JSON.stringify({
          pmType: pmType,
          seniority: seniority,
          companyType: companyType,
          workContexts: workContexts,
          conscience: conscience,
          pull: pull,
          gateEmail: gateEmail,
          landscape: landscape,
          skills: skills,
          fluencies: fluencies,
          skillConscience: skillConscience,
          skillPull: skillPull,
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
      if (!results || !results.skills || results.skills.length === 0) return;
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
            savedRaw = localStorage.getItem("dz_saved_report_pm");
          } catch (e) {}
          if (savedRaw) {
            try {
              var s = JSON.parse(savedRaw);
              if (s.pmType) setPmType(s.pmType);
              if (s.seniority) setSeniority(s.seniority);
              if (s.companyType) setCompanyType(s.companyType);
              if (s.workContexts) setWorkContexts(s.workContexts);
              if (s.conscience !== undefined) setConscience(s.conscience);
              if (s.pull !== undefined) setPull(s.pull);
              if (s.gateEmail) setGateEmail(s.gateEmail);
            } catch (e) {}
            if (data.email) setGateEmail(data.email);
            setGateVerified(true);
            setStep(2);
          } else {
            setStep(1);
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
          "dz_saved_report_pm",
          JSON.stringify({
            pmType: pmType,
            seniority: seniority,
            companyType: companyType,
            workContexts: workContexts,
            conscience: conscience,
            pull: pull,
            gateEmail: gateEmail,
          })
        );
      } catch (_e) {}
    },
    [step, pmType, seniority, companyType, workContexts, conscience, pull, gateEmail]
  );

  useEffect(function() {
    if (!pmType) return;
    var allowed = CONTEXT_MAP[pmType];
    if (!allowed) return;
    setWorkContexts(function(prev) {
      return prev.filter(function(id) { return allowed.indexOf(id) !== -1; });
    });
    setShowAllCtx(false);
  }, [pmType]);

  useEffect(function() {
    window.scrollTo(0, 0);
  }, [step]);

  function getVisibleContexts() {
    if (!pmType || showAllCtx) return WORK_CONTEXTS;
    var allowed = CONTEXT_MAP[pmType] || [];
    return WORK_CONTEXTS.filter(function(wc) { return allowed.indexOf(wc.id) !== -1; });
  }

  function toggleCtx(id) {
    setWorkContexts(function(prev) {
      return prev.indexOf(id) !== -1 ? prev.filter(function(x) { return x !== id; }) : prev.concat([id]);
    });
  }

  function isValidEmail(email) {
    var at = email.indexOf("@");
    if (at === -1) return false;
    return email.indexOf(".", at + 1) !== -1;
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
        body: JSON.stringify({ email: trimmed, product: "pm" }),
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

  function resetAll() {
    setPmType(""); setSeniority(""); setCompanyType("");
    setWorkContexts([]); setShowAllCtx(false);
    setLandscape(""); setSkills([]);
    setConscience(5); setPull(5); setFluencies({});
    setSkillConscience({}); setSkillPull({}); setCustomSkill("");
    setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setBenchmark(null);
    setRecommendations(null); setRecsLoading(false); setRecsError(null);
    setStep(0); setLoading(false); setLoadingMsg(""); setError(null);
    setTier(0); setPromoCode(""); setPromoError(""); setPromoUsed(false); setDiscountApplied(false);
    setGateEmail(""); setGateSent(false); setGateVerified(false); setGateError("");
    setGateLoading(false); setShowResend(false); setGateOnDifferentDevice(false); setGateInputFocused(false);
    setCheckoutLoading(false); setCheckoutError(null); setPaymentCanceled(false);
    freeEmailSentRef.current = false;
    paidEmailSentRef.current = false;
  }

  function computeOverallScore(skills) {
    if (!Array.isArray(skills) || skills.length === 0) return 0;
    return Math.round(
      skills.reduce(function (sum, s) {
        return sum + (typeof s.dz === "number" ? s.dz : 0);
      }, 0) / skills.length
    );
  }

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
          product: "pm",
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
          product: "pm",
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

  function applyPromoCode() {
    var v = (promoCode || "").trim();
    var isFree = PROMO_CODES.some(function (c) {
      return c.toLowerCase() === v.toLowerCase();
    });
    var isDiscount = DISCOUNT_CODES.some(function (c) {
      return c.toLowerCase() === v.toLowerCase();
    });
    if (isFree) {
      setTier(2);
      setPromoUsed(true);
      setPromoError("");
      setPaymentCanceled(false);
      setStep(6);
    } else if (isDiscount) {
      setDiscountApplied(true);
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
    var priceCents = discountApplied ? 3950 : 7900;
    try {
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "pm",
          email: gateEmail.trim(),
          price: priceCents,
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

  function startEditing(id) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{editing:true}) : s; }); }); }
  function updateText(id, text) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{text:text}) : s; }); }); }
  function commitEdit(id) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{editing:false}) : s; }); }); }
  function removeSkill(id) {
    setSkills(function(p) { return p.filter(function(s) { return s.id!==id; }); });
    setFluencies(function(p) { var n=Object.assign({},p); delete n[id]; return n; });
    setSkillConscience(function(p) { var n=Object.assign({},p); delete n[id]; return n; });
    setSkillPull(function(p) { var n=Object.assign({},p); delete n[id]; return n; });
    adjustedSkillsRef.current.delete(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  function addSkill() {
    var t = customSkill.trim();
    if (!t) return;
    var id = "s" + Date.now();
    setSkills(function(p) {
      return p.concat([{ id: id, text: t, editing: false }]);
    });
    setCustomSkill("");
  }

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

  var STUB_AI_RISK = 5;
  var STUB_MARKET_DEMAND = 7;
  var skillStepBarPct = (3 / 6) * 100;
  var scoreStepBarPct = (4 / 6) * 100;
  var resultsStepBarPct = (5 / 6) * 100;
  var unlockStepBarPct = 100;

  async function fetchLandscapeAndSkills() {
    if (!canProceed) return;
    setLoading(true);
    setLoadingMsg(PM_LOADING_MSGS[0]);
    setError(null);
    var profile = buildProfile(pmType, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var sl = SENIORITY_LEVELS.find(function (s) {
      return s.id === seniority;
    });
    var prompt =
      "You are a senior product management career strategist specializing in AI labor market analysis for product managers.\n\nPM PROFILE:\n- PM Type: " +
      profile.pmLabel +
      "\n- Seniority: " +
      profile.seniorityLabel +
      " — " +
      profile.seniorityNote +
      "\n- Work contexts: " +
      wcStr +
      "\n- Company: " +
      (profile.companyLabel || "not specified") +
      "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about the AI threat to this exact PM profile RIGHT NOW (May 2026). Name specific tools (ChatPRD, Notion AI, Dovetail, Jira AI, Cursor, v0, Lovable), specific tasks being automated, and where the real exposure is at this seniority level doing this work. Do not write generic AI commentary — be specific to this combination of PM type, seniority, and work context.\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a " +
      profile.seniorityLabel +
      " " +
      profile.pmLabel +
      " working on " +
      wcStr +
      " to assess for AI defensibility right now. Be precise and PM-specific — not 'stakeholder management' but 'building executive alignment across competing product bets without formal authority at " +
      profile.seniorityLabel +
      " level'. Include a realistic mix: some that are defensible and some genuinely at risk from AI. Weight toward skills that actually differentiate at the " +
      profile.seniorityLabel +
      " level. Do not suggest generic skills.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";
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
      var raw = data.content
        .map(function (b) {
          return b.text || "";
        })
        .join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      var loaded = parsed.skills.map(function (text, i) {
        return { id: "s" + i, text: text, editing: false };
      });
      setLandscape(parsed.landscape);
      setSkills(loaded);
      setFluencies({});
      setSkillConscience({});
      setSkillPull({});
      setAdjustedSkills(new Set());
      adjustedSkillsRef.current = new Set();
      setStep(3);
    } catch (e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function (r) {
          setTimeout(r, 2000);
        });
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
          if (!data2.content)
            throw new Error(typeof data2.error === "object" ? JSON.stringify(data2) : data2.error || JSON.stringify(data2));
          var raw2 = data2.content
            .map(function (b) {
              return b.text || "";
            })
            .join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          var loaded2 = parsed2.skills.map(function (text, i) {
            return { id: "s" + i, text: text, editing: false };
          });
          setLandscape(parsed2.landscape);
          setSkills(loaded2);
          setFluencies({});
          setSkillConscience({});
          setSkillPull({});
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
    setLoadingMsg(PM_SCORING_MSGS[0]);
    setError(null);
    var profile = buildProfile(pmType, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var skillSummary = skills
      .map(function (s, i) {
        var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
        var cVal = skillConscience[s.id] !== undefined ? skillConscience[s.id] : conscience;
        var pVal = skillPull[s.id] !== undefined ? skillPull[s.id] : pull;
        var aff = compAff(cVal, pVal, fluencyVal);
        return i + 1 + ". " + s.text + " (fluency: " + fluencyVal + "/10, affinity: " + aff + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior product management career strategist with deep knowledge of the 2026 AI labor market.\n\nPM PROFILE:\n- PM Type: " +
      profile.pmLabel +
      "\n- Seniority: " +
      profile.seniorityLabel +
      "\n- Work contexts: " +
      wcStr +
      "\n- Company: " +
      (profile.companyLabel || "not specified") +
      "\n\nSkills to score:\n" +
      skillSummary +
      "\n\nFor each skill, return:\n- ai_replaceability: 1-10 (10 = AI is already doing this or will within 12 months; 1 = deeply human, irreplaceable)\n- market_demand: 1-10 (10 = extremely high market value right now for this PM type and seniority)\n\nBe honest and precise. A " +
      profile.seniorityLabel +
      " " +
      profile.pmLabel +
      "'s skills have different exposure profiles than a junior generalist. Score accordingly — do not default to middle values.\n\nReturn ONLY valid JSON:\n{\"scores\":[{\"id\":\"s0\",\"name\":\"skill name\",\"ai_replaceability\":N,\"market_demand\":N},{...}]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || data.error_description || "API error: " + JSON.stringify(data));
      var raw = data.content
        .map(function (b) {
          return b.text || "";
        })
        .join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      if (!parsed.scores || !Array.isArray(parsed.scores)) throw new Error("No scores in response");
      var enriched = parsed.scores.map(function (scored, i) {
        var found =
          skills.find(function (s) {
            return s.id === scored.id;
          }) ||
          skills.find(function (s) {
            return scored.name === s.text;
          }) ||
          skills.find(function (s) {
            return scored.name && scored.name.indexOf(s.text.slice(0, 20)) !== -1;
          });
        var id = found ? found.id : scored.id || "s" + i;
        var fluencyVal = fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
        var cVal = skillConscience[id] !== undefined ? skillConscience[id] : conscience;
        var pVal = skillPull[id] !== undefined ? skillPull[id] : pull;
        var aff = compAff(cVal, pVal, fluencyVal);
        var aiR = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
        var mkt = typeof scored.market_demand === "number" ? scored.market_demand : 7;
        var dz = calcDZ(aff, aiR, mkt);
        return {
          id: id,
          text: found ? found.text : scored.name,
          name: found ? found.text : scored.name,
          conscience: cVal,
          pull: pVal,
          fluency: fluencyVal,
          affinity: aff,
          ai_replaceability: aiR,
          market_demand: mkt,
          dz: dz,
        };
      });
      setResults({ skills: enriched, profile: profile, landscape: landscape });
      setStep(4);
    } catch (e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function (r) {
          setTimeout(r, 2000);
        });
        try {
          var res2 = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 800,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          var data2 = await res2.json();
          if (!data2.content)
            throw new Error(typeof data2.error === "object" ? JSON.stringify(data2) : data2.error || JSON.stringify(data2));
          var raw2 = data2.content
            .map(function (b) {
              return b.text || "";
            })
            .join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          if (!parsed2.scores || !Array.isArray(parsed2.scores)) throw new Error("No scores in response");
          var enriched2 = parsed2.scores.map(function (scored, i) {
            var found2 =
              skills.find(function (s) {
                return s.id === scored.id;
              }) ||
              skills.find(function (s) {
                return scored.name === s.text;
              }) ||
              skills.find(function (s) {
                return scored.name && scored.name.indexOf(s.text.slice(0, 20)) !== -1;
              });
            var id2 = found2 ? found2.id : scored.id || "s" + i;
            var fluencyVal2 = fluencies[id2] !== undefined ? fluencies[id2] : getSeed(conscience, pull);
            var cVal2 = skillConscience[id2] !== undefined ? skillConscience[id2] : conscience;
            var pVal2 = skillPull[id2] !== undefined ? skillPull[id2] : pull;
            var aff2 = compAff(cVal2, pVal2, fluencyVal2);
            var aiR2 = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
            var mkt2 = typeof scored.market_demand === "number" ? scored.market_demand : 7;
            var dz2 = calcDZ(aff2, aiR2, mkt2);
            return {
              id: id2,
              text: found2 ? found2.text : scored.name,
              name: found2 ? found2.text : scored.name,
              conscience: cVal2,
              pull: pVal2,
              fluency: fluencyVal2,
              affinity: aff2,
              ai_replaceability: aiR2,
              market_demand: mkt2,
              dz: dz2,
            };
          });
          setResults({ skills: enriched2, profile: profile, landscape: landscape });
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
    var profile = results.profile || buildProfile(pmType, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var scoredSkills = results.skills;
    var skillSummary = scoredSkills
      .map(function (sk, i) {
        var aiR = typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : 5;
        var mkt = typeof sk.market_demand === "number" ? sk.market_demand : 7;
        var name = sk.text || sk.name || "Skill " + (i + 1);
        return i + 1 + ". " + name + " (AI Risk: " + aiR + "/10, Market: " + mkt + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior product management career strategist. A " +
      profile.seniorityLabel +
      " " +
      profile.pmLabel +
      " at " +
      (profile.companyLabel || "not specified") +
      " focused on " +
      wcStr +
      " just completed a Defensible Zone assessment.\n\nFor each skill below, write a short personalised recommendation. Be specific to their PM type, seniority, and work context. Use plain English. Do not use the word 'threat'. Be direct and practical.\n\nAssign a phase (1, 2, or 3) based on feasibility of starting — not score:\n- Phase 1 (Weeks 1–4): actions the PM can begin immediately in their current role — no org setup needed, just personal execution\n- Phase 2 (Weeks 5–8): actions requiring some coordination, stakeholder buy-in, or setup\n- Phase 3 (Weeks 9–12): structural moves that only land after Phase 1 and 2 have created conditions\n\nDistribute across phases: aim for roughly 3 in Phase 1, 3 in Phase 2, 2 in Phase 3. No more than 4 in any single phase.\n\nSkills with scores:\n" +
      skillSummary +
      '\n\nReturn ONLY valid JSON:\n{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact PM situation.","phase":1},{...}]}';
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || "API error");
      var raw = data.content
        .map(function (b) {
          return b.text || "";
        })
        .join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      setRecommendations(JSON.parse(m[0]));
      setStep(6);
      setRecsLoading(false);
    } catch (e) {
      setRecsError("Could not load recommendations. Please try again.");
      setRecsLoading(false);
    }
  }

  var canProceed = pmType !== "" && seniority !== "" && workContexts.length > 0;

  if (gateLoading) {
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          display: "flex",
          flexDirection: "column",
          padding: "32px 20px",
          boxSizing: "border-box",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMGateDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ · PRODUCT MANAGER EDITION
            </div>
            <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>Verifying your link…</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzPMGateDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzPMGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzPMGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <PMFooter />
        </div>
      </div>
    );
  }

  var visibleCtx = getVisibleContexts();
  var hiddenCount = WORK_CONTEXTS.length - visibleCtx.length;
  var progressPct = ((step + 1) / 6) * 100;

  if (recsLoading) {
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMLoadDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 6 OF 6 — BUILDING YOUR PLAN
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
                DEFENSIBLE ZONE™ · PRODUCT MANAGER EDITION
              </div>
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{loadingMsg}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.4s infinite" }}>.</span>
              </div>
            </div>
          </div>
          <PMFooter />
        </div>
      </div>
    );
  }

  if (loading) {
    var loadingStepLabel = step === 3 ? "STEP 4 OF 6 — CALCULATING YOUR ZONE" : "STEP 3 OF 6 — READING YOUR LANDSCAPE";
    var loadingBarPct = step === 3 ? scoreStepBarPct : skillStepBarPct;
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMLoadDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              {loadingStepLabel}
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: loadingBarPct + "%",
                  background: S.accent,
                  borderRadius: 2,
                  transition: "width 0.25s ease",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
                DEFENSIBLE ZONE™ · PRODUCT MANAGER EDITION
              </div>
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{loadingMsg}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 18,
                  fontFamily: S.mono,
                  fontSize: 22,
                  color: S.dim,
                  lineHeight: 1,
                }}
              >
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.4s infinite" }}>.</span>
              </div>
            </div>
          </div>
          <PMFooter />
        </div>
      </div>
    );
  }

  if (error && (step === 2 || step === 3)) {
    var errStepLabel = step === 3 ? "STEP 4 OF 6 — CALCULATING YOUR ZONE" : "STEP 3 OF 6 — READING YOUR LANDSCAPE";
    var errBarPct = step === 3 ? scoreStepBarPct : skillStepBarPct;
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              {errStepLabel}
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: errBarPct + "%", background: S.accent, borderRadius: 2 }} />
            </div>
          </div>
          <Card style={{ textAlign: "center" }}>
            <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{error}</p>
            <PrimaryBtn
              onClick={function () {
                setError(null);
                if (step === 3) fetchScores();
                else fetchLandscapeAndSkills();
              }}
            >
              TRY AGAIN
            </PrimaryBtn>
          </Card>
          <button
            type="button"
            onClick={resetAll}
            style={{
              marginTop: 20,
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
              width: "100%",
            }}
          >
            START OVER
          </button>
          <PMFooter />
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "@media(max-width:520px){.pm-sel-grid{grid-template-columns:1fr!important}} .pm-sel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 1 OF 6 — YOUR PROFILE
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: progressPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ — PRODUCT MANAGER EDITION
            </div>
            <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
              Find your defensible zone.
            </h1>
            <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
              AI is reshaping product management faster than most PMs realize. This assessment maps exactly where you're exposed — and where you're protected.
            </p>
          </div>

          <Card style={{ marginBottom: 12 }}>
            <Label>WHAT TYPE OF PM ARE YOU?</Label>
            <div className="pm-sel-grid">
              {PM_TYPES.map(function (pt) {
                var active = pmType === pt.id;
                return (
                  <SelBtn key={pt.id} active={active} onClick={function () { setPmType(pt.id); }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{pt.label}</div>
                    <div style={{ fontSize: 13, color: active ? "rgba(255,255,255,0.75)" : S.dim, marginTop: 4, lineHeight: 1.4 }}>{pt.desc}</div>
                  </SelBtn>
                );
              })}
            </div>
          </Card>

          <Card style={{ marginBottom: 12 }}>
            <Label>YOUR LEVEL</Label>
            <div className="pm-sel-grid">
              {SENIORITY_LEVELS.map(function (sl) {
                var active = seniority === sl.id;
                return (
                  <SelBtn key={sl.id} active={active} onClick={function () { setSeniority(sl.id); }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{sl.label}</div>
                    <div style={{ fontSize: 13, color: active ? "rgba(255,255,255,0.75)" : S.dim }}>{sl.sub}</div>
                    <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.6)" : S.dim, marginTop: 3, lineHeight: 1.35 }}>{sl.note}</div>
                  </SelBtn>
                );
              })}
            </div>
          </Card>

          <Card style={{ marginBottom: 12 }}>
            <Label>WHERE DO YOU WORK?</Label>
            <div className="pm-sel-grid">
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
            <Label>WHAT DOES YOUR WORK ACTUALLY INVOLVE? (pick all that apply)</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {visibleCtx.map(function (wc) {
                return <Chip key={wc.id} label={wc.label} active={workContexts.indexOf(wc.id) !== -1} onClick={function () { toggleCtx(wc.id); }} />;
              })}
            </div>
            {pmType && !showAllCtx && hiddenCount > 0 && (
              <button
                type="button"
                onClick={function () { setShowAllCtx(true); }}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.blue, textDecoration: "underline", marginBottom: 10 }}
              >
                Show all contexts
              </button>
            )}
            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, margin: 0 }}>Select at least one</p>
          </Card>

          <PrimaryBtn onClick={function () { setStep(1); }} disabled={!canProceed}>
            ANALYSE MY PROFILE →
          </PrimaryBtn>

          <PMFooter />
        </div>
      </div>
    );
  }

  if (step === 1) {
    var gateTryAgainBtn = {
      width: "100%",
      marginTop: 16,
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
    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMGateSpin{to{transform:rotate(360deg)}}",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 2 OF 6 — VERIFY YOUR EMAIL
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: progressPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>

          {gateOnDifferentDevice ? (
            <Card style={{ marginBottom: 20, textAlign: "center" }}>
              <p style={{ fontSize: 16, color: S.text, lineHeight: 1.7, margin: "0 0 20px" }}>
                It looks like you opened the link on a different device. Please start again on this device.
              </p>
              <button
                type="button"
                onClick={resetAll}
                style={gateTryAgainBtn}
              >
                Start over
              </button>
            </Card>
          ) : gateSent ? (
            <Card style={{ textAlign: "center" }}>
              <Label style={{ color: S.gold, marginBottom: 16 }}>CHECK YOUR INBOX</Label>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
                Almost there.
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 20px" }}>
                We sent a link to{" "}
                <span style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, fontWeight: 600 }}>{gateEmail}</span>. Click it to continue your assessment.
              </p>
              {showResend ? (
                <button
                  type="button"
                  onClick={function () {
                    setShowResend(false);
                    handleGateSubmit();
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontFamily: S.mono,
                    fontSize: 12,
                    color: S.muted,
                    cursor: "pointer",
                    marginBottom: 8,
                  }}
                >
                  Resend the link
                </button>
              ) : null}
              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={function () {
                    setGateSent(false);
                    setShowResend(false);
                    setGateError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: S.mono,
                    fontSize: 12,
                    color: S.blue,
                    textDecoration: "underline",
                  }}
                >
                  Use a different email
                </button>
              </div>
            </Card>
          ) : (
            <Card>
              <Label>ONE QUICK STEP</Label>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
                Where should we send your results?
              </h2>
              <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 24px" }}>
                Enter your email to start the assessment. Your free results will be emailed to you as a PDF when you&apos;re done.
              </p>

              {gateError === "expired" ? (
                <div style={{ color: S.red, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
                  That link has expired. Please request a new one.
                </div>
              ) : null}
              {gateError === "invalid" ? (
                <div style={{ color: S.red, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
                  That link isn&apos;t valid. Please try again.
                </div>
              ) : null}

              <input
                type="email"
                placeholder="your@email.com"
                value={gateEmail}
                disabled={gateLoading}
                onFocus={function () {
                  setGateInputFocused(true);
                }}
                onBlur={function () {
                  setGateInputFocused(false);
                }}
                onChange={function (e) {
                  setGateEmail(e.target.value);
                  if (showExpiredInvalid) setGateError("");
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: 16,
                  fontFamily: S.font,
                  border: gateLoading ? "1px solid " + S.border : gateInputFocused ? "1px solid " + S.gold : "1px solid " + S.border,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#ffffff",
                  color: S.text,
                }}
              />

              {gateError && !showExpiredInvalid ? (
                <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{gateError}</div>
              ) : null}

              <button
                type="button"
                onClick={handleGateSubmit}
                disabled={gateLoading}
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: S.font,
                  background: gateLoading ? "#e5a820" : S.gold,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  cursor: gateLoading ? "not-allowed" : "pointer",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {gateLoading ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTop: "2px solid #ffffff",
                      borderRadius: "50%",
                      animation: "dzPMGateSpin 0.85s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                {gateLoading ? "Sending…" : "Send verification link"}
              </button>

              {showExpiredInvalid ? (
                <button
                  type="button"
                  onClick={function () {
                    setGateError("");
                    handleGateSubmit();
                  }}
                  disabled={gateLoading}
                  style={Object.assign({}, gateTryAgainBtn, { marginTop: 12, opacity: gateLoading ? 0.6 : 1 })}
                >
                  Request a new link
                </button>
              ) : null}
            </Card>
          )}

          <button
            type="button"
            onClick={function () { setStep(0); }}
            style={{
              marginTop: 20,
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
            ← BACK
          </button>

          <PMFooter />
        </div>
      </div>
    );
  }

  if (step === 3) {
    var profile3 = buildProfile(pmType, seniority, workContexts, companyType);
    var dzSliderCSS =
      "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";
    var landscapeSummary = profile3.seniorityLabel + " " + profile3.pmLabel;
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <style dangerouslySetInnerHTML={{ __html: dzSliderCSS }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 3 OF 6 — YOUR SKILLS
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: skillStepBarPct + "%",
                  background: S.accent,
                  borderRadius: 2,
                  transition: "width 0.25s ease",
                }}
              />
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

          <div
            style={{
              background: S.accent,
              borderRadius: 14,
              padding: 22,
              marginBottom: 24,
              position: "relative",
              overflow: "hidden",
            }}
          >
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
              YOUR AI LANDSCAPE — {landscapeSummary.toUpperCase()}
            </div>
            <p style={{ color: "#ffffff", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{landscape}</p>
          </div>

          <Card style={{ marginBottom: 16 }}>
            <Label>AFFINITY CALIBRATION</Label>
            <p style={{ color: S.dim, fontSize: 15, lineHeight: 1.65, margin: "0 0 20px" }}>
              Answer these once. They seed defaults for each skill below.
            </p>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.purple, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}>
                How much does this work energize you?
              </div>
              <input
                className="dz-slider conscience-sl"
                type="range"
                min={0}
                max={10}
                step={1}
                value={conscience}
                onChange={function (e) {
                  setConscience(snapToStop(Number(e.target.value)));
                }}
                style={{
                  background: "linear-gradient(to right, #7c3aed " + (conscience / 10) * 100 + "%, #d0d7e8 " + (conscience / 10) * 100 + "%)",
                }}
              />
            </div>
            <div>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: "#0891b2", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}>
                How strongly does this work pull you forward?
              </div>
              <input
                className="dz-slider pull-sl"
                type="range"
                min={0}
                max={10}
                step={1}
                value={pull}
                onChange={function (e) {
                  setPull(snapToStop(Number(e.target.value)));
                }}
                style={{
                  background: "linear-gradient(to right, #0891b2 " + (pull / 10) * 100 + "%, #d0d7e8 " + (pull / 10) * 100 + "%)",
                }}
              />
            </div>
          </Card>

          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
            RATE EACH SKILL
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {skills.map(function (s) {
              var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              var cVal = skillConscience[s.id] !== undefined ? skillConscience[s.id] : conscience;
              var pVal = skillPull[s.id] !== undefined ? skillPull[s.id] : pull;
              var affinityScore = compAff(cVal, pVal, fluencyVal);
              var dzScore = calcDZ(affinityScore, STUB_AI_RISK, STUB_MARKET_DEMAND);
              var dzColor = dzScore >= 70 ? S.green : dzScore >= 45 ? S.gold : S.red;
              return (
                <div
                  key={s.id}
                  style={{
                    background: S.card,
                    border: "1px solid " + S.border,
                    borderRadius: 12,
                    padding: "18px 22px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      {s.editing ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            autoFocus
                            value={s.text}
                            onChange={function (e) {
                              updateText(s.id, e.target.value);
                            }}
                            onKeyDown={function (e) {
                              if (e.key === "Enter" || e.key === "Escape") commitEdit(s.id);
                            }}
                            style={Object.assign({}, inputStyle, { flex: 1 })}
                          />
                          <button
                            type="button"
                            onClick={function () {
                              commitEdit(s.id);
                            }}
                            style={{
                              background: S.accent,
                              border: "none",
                              color: "white",
                              padding: "12px 16px",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontFamily: S.mono,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: S.text, fontSize: 16, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{s.text}</span>
                          <button
                            type="button"
                            onClick={function () {
                              startEditing(s.id);
                            }}
                            style={{
                              background: "none",
                              border: "1px solid " + S.border,
                              color: S.muted,
                              cursor: "pointer",
                              fontSize: 12,
                              padding: "4px 9px",
                              borderRadius: 6,
                              fontFamily: S.mono,
                            }}
                          >
                            EDIT
                          </button>
                          <button
                            type="button"
                            onClick={function () {
                              removeSkill(s.id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: S.dim,
                              cursor: "pointer",
                              fontSize: 20,
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: S.mono, fontSize: 11, color: S.purple }}>ENERGY (AFFINITY)</span>
                      <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: S.purple }}>{cVal}/10</span>
                    </div>
                    <input
                      className="dz-slider conscience-sl"
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={cVal}
                      onChange={function (e) {
                        var val = Number(e.target.value);
                        setSkillConscience(function (prev) {
                          return Object.assign({}, prev, { [s.id]: val });
                        });
                        markAdjusted(s.id);
                      }}
                      style={{
                        background: "linear-gradient(to right, #7c3aed " + (cVal / 10) * 100 + "%, #d0d7e8 " + (cVal / 10) * 100 + "%)",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: S.mono, fontSize: 11, color: "#0891b2" }}>MOMENTUM (PULL)</span>
                      <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: "#0891b2" }}>{pVal}/10</span>
                    </div>
                    <input
                      className="dz-slider pull-sl"
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={pVal}
                      onChange={function (e) {
                        var val = Number(e.target.value);
                        setSkillPull(function (prev) {
                          return Object.assign({}, prev, { [s.id]: val });
                        });
                        markAdjusted(s.id);
                      }}
                      style={{
                        background: "linear-gradient(to right, #0891b2 " + (pVal / 10) * 100 + "%, #d0d7e8 " + (pVal / 10) * 100 + "%)",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: S.mono, fontSize: 11, color: S.gold }}>FLUENCY</span>
                      <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: S.gold }}>{fluencyVal}/10</span>
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
                        setFluencies(function (prev) {
                          return Object.assign({}, prev, { [s.id]: val });
                        });
                        markAdjusted(s.id);
                      }}
                      style={{
                        background: "linear-gradient(to right, #d97706 " + (fluencyVal / 10) * 100 + "%, #d0d7e8 " + (fluencyVal / 10) * 100 + "%)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 12,
                      borderTop: "1px solid " + S.border,
                    }}
                  >
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}>DZ SCORE (EST.)</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: dzColor }}>{dzScore}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Card style={{ marginBottom: 20 }}>
            <Label>ADD A SKILL</Label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Describe a skill to assess…"
                value={customSkill}
                onChange={function (e) {
                  setCustomSkill(e.target.value);
                }}
                onKeyDown={function (e) {
                  if (e.key === "Enter") addSkill();
                }}
                style={Object.assign({}, inputStyle, { flex: 1, marginBottom: 0 })}
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={!customSkill.trim()}
                style={{
                  background: customSkill.trim() ? S.accent : S.card2,
                  color: customSkill.trim() ? "white" : S.dim,
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontFamily: S.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: customSkill.trim() ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                ADD
              </button>
            </div>
          </Card>

          <PrimaryBtn onClick={fetchScores} disabled={skills.length === 0}>
            CALCULATE MY DEFENSIBLE ZONE →
          </PrimaryBtn>

          <PMFooter />
        </div>
      </div>
    );
  }

  // ── STEP 4: FREE RESULTS ─────────────────────────────────────────────
  if (step === 4 && results) {
    var profileRes = results.profile || buildProfile(pmType, seniority, workContexts, companyType);
    var landscapeText = results.landscape || landscape;
    var scoredSkills = Array.isArray(results.skills) ? results.skills : [];
    var wcLabels = profileRes.workContextLabels || [];
    var wcPart = wcLabels.slice(0, 2).join(", ");
    if (wcLabels.length > 2) {
      wcPart = wcPart + ", +" + (wcLabels.length - 2) + " more";
    }
    var profileSummaryLine =
      profileRes.seniorityLabel +
      " " +
      profileRes.pmLabel +
      " · " +
      (profileRes.companyLabel || "—") +
      (wcPart ? " · " + wcPart : "");
    var totalDZ =
      scoredSkills.length > 0
        ? Math.round(
            scoredSkills.reduce(function (sum, s) {
              return sum + (typeof s.dz === "number" ? s.dz : 0);
            }, 0) / scoredSkills.length
          )
        : 0;
    var overallColor = dzScoreColor(totalDZ);
    var sortedByDz = scoredSkills.slice().sort(function (a, b) {
      return (b.dz || 0) - (a.dz || 0);
    });
    var topSkill = sortedByDz[0];
    var topSkillName = topSkill ? topSkill.text || topSkill.name || "your strongest skill" : "your strongest skill";
    var planActionCount = Math.max(9, scoredSkills.length * 3);
    var teaserText =
      "Based on your strongest anchor (" +
      topSkillName +
      "), your first move is to make it unmistakably visible — inside your org and in the market.";

    var blurredPhases = [
      {
        title: "Phase 1 — Weeks 1–4 — Establish your position",
        items: [
          "Document your top 3 product decisions from the last quarter with measurable outcomes",
          "Schedule a 30-minute sync with your most senior stakeholder to align on priorities",
          "Publish one internal artifact that makes your judgment visible to the org",
        ],
      },
      {
        title: "Phase 2 — Weeks 5–8 — Build visible authority",
        items: [
          "Lead a cross-functional review that surfaces trade-offs only you can make",
          "Ship a customer-facing narrative tied to your strongest product bet",
          "Identify one skill with high AI exposure and redesign how you deliver it",
        ],
      },
      {
        title: "Phase 3 — Weeks 9–12 — Compound and protect",
        items: [
          "Create a repeatable framework your team can use without you in the room",
          "Present your product strategy to an external audience (conference, blog, podcast)",
          "Lock in a mentorship or advisory relationship that extends your market signal",
        ],
      },
    ];

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 5 OF 6 — YOUR RESULTS
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: resultsStepBarPct + "%",
                  background: S.accent,
                  borderRadius: 2,
                  transition: "width 0.25s ease",
                }}
              />
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
            DEFENSIBLE ZONE™ · PRODUCT MANAGER EDITION
          </div>

          <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Your Defensible Zone™
          </h1>

          <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, margin: "0 0 28px", lineHeight: 1.5, letterSpacing: "0.02em" }}>
            {profileSummaryLine}
          </p>

          <div
            style={{
              background: S.accent,
              borderRadius: 14,
              padding: 22,
              marginBottom: 24,
              position: "relative",
              overflow: "hidden",
            }}
          >
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
            <p style={{ color: "#ffffff", fontSize: 16, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{landscapeText}</p>
          </div>

          <Card style={{ marginBottom: 28, textAlign: "center" }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.dim,
                letterSpacing: "0.08em",
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              YOUR DEFENSIBLE ZONE SCORE
            </div>
            <div style={{ fontFamily: S.mono, fontSize: 72, fontWeight: 700, color: overallColor, lineHeight: 1, marginBottom: 12 }}>
              {totalDZ}
            </div>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              {getOverallSubLabel(totalDZ)}
            </p>
          </Card>

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.dim,
              letterSpacing: "0.08em",
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            SKILL-BY-SKILL BREAKDOWN
          </div>

          {scoredSkills.map(function (sk) {
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

          <div style={{ marginTop: 32, marginBottom: 28 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: "0 0 20px", lineHeight: 1.2, fontWeight: 600 }}>
              Your 90-Day Plan
            </h2>

            <div
              style={{
                background: S.card,
                border: "1px solid " + S.border,
                borderRadius: 12,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 11,
                  color: S.gold,
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                PREVIEW — PHASE 1, ACTION 1
              </div>
              <p style={{ fontSize: 15, color: S.text, lineHeight: 1.65, margin: 0 }}>{teaserText}</p>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
                {blurredPhases.map(function (phase, pi) {
                  return (
                    <div key={pi} style={{ marginBottom: pi < blurredPhases.length - 1 ? 20 : 0 }}>
                      <div
                        style={{
                          fontFamily: S.mono,
                          fontSize: 11,
                          color: S.muted,
                          letterSpacing: "0.06em",
                          fontWeight: 700,
                          marginBottom: 10,
                        }}
                      >
                        {phase.title}
                      </div>
                      {phase.items.map(function (item, ii) {
                        return (
                          <div
                            key={ii}
                            style={{
                              background: S.card,
                              border: "1px solid " + S.border,
                              borderRadius: 10,
                              padding: "14px 16px",
                              marginBottom: 8,
                              fontSize: 14,
                              color: S.text,
                              lineHeight: 1.5,
                            }}
                          >
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "calc(100% - 16px)",
                  maxWidth: 400,
                  background: "linear-gradient(135deg, #1a1d2e 0%, #2d1f5e 100%)",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                  boxSizing: "border-box",
                }}
              >
                <h3 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 600, color: "#ffffff", margin: "0 0 12px", lineHeight: 1.25 }}>
                  Your full 90-day plan is ready.
                </h3>
                <p style={{ fontSize: 15, color: "rgba(196, 181, 253, 0.9)", lineHeight: 1.65, margin: "0 0 20px" }}>
                  You have {planActionCount} personalised actions across 3 phases. Unlock them now — and we&apos;ll email the complete plan to{" "}
                  {gateEmail || "your email"}.
                </p>
                <div style={{ fontFamily: S.mono, fontSize: 28, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>$79</div>
                <PrimaryBtn
                  onClick={function () {
                    saveStateForReturn();
                    setStep(5);
                  }}
                  style={{ marginBottom: 16 }}
                >
                  UNLOCK MY PLAN → $79
                </PrimaryBtn>
                <div style={{ fontFamily: S.mono, fontSize: 12, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>
                  HAVE A PROMO CODE?
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={function (e) {
                      setPromoCode(e.target.value);
                      if (promoError) setPromoError("");
                    }}
                    placeholder="Enter code"
                    style={{
                      flex: "1 1 160px",
                      minWidth: 0,
                      padding: "12px 14px",
                      fontSize: 15,
                      fontFamily: S.mono,
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.95)",
                      color: S.text,
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    style={{
                      padding: "12px 20px",
                      fontSize: 15,
                      fontFamily: S.font,
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.35)",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                </div>
                {promoError ? <div style={{ color: "#fca5a5", fontSize: 14, marginTop: 8 }}>{promoError}</div> : null}
                {discountApplied ? (
                  <div style={{ color: "#6ee7b7", fontSize: 14, marginTop: 8 }}>50% discount applied — your price is $39.50</div>
                ) : null}
              </div>
            </div>
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
              A copy of these results has been sent to {gateEmail || "your email"}
            </p>
          </div>

          <PMFooter />
        </div>
      </div>
    );
  }

  // ── STEP 5: Payment ──────────────────────────────────────────────────
  if (step === 5 && tier < 2 && !promoUsed) {
    var unlockPriceLabel = discountApplied ? "$39.50" : "$79";
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMCheckoutSpin{to{transform:rotate(360deg)}}",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 6 OF 6 — UNLOCK YOUR PLAN
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.accent, borderRadius: 2 }} />
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

          <Card style={{ marginBottom: 20 }}>
            <Label>UNLOCK YOUR 90-DAY PLAN</Label>
            <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
              Your full plan is ready.
            </h2>
            <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 24px" }}>
              Unlock personalised actions for every skill — sequenced across three phases. We&apos;ll email the complete plan to{" "}
              <span style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, fontWeight: 600 }}>{gateEmail || "your email"}</span>.
            </p>

            {paymentCanceled ? (
              <div style={{ color: S.red, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                Payment was cancelled — try again when you&apos;re ready.
              </div>
            ) : null}

            {checkoutError ? (
              <div style={{ color: S.red, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{checkoutError}</div>
            ) : null}

            <PrimaryBtn onClick={handleUnlockCheckout} disabled={checkoutLoading} style={{ marginBottom: 16 }}>
              {checkoutLoading ? (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTop: "2px solid #ffffff",
                      borderRadius: "50%",
                      animation: "dzPMCheckoutSpin 0.85s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                  Starting checkout…
                </span>
              ) : checkoutError ? (
                "TRY AGAIN"
              ) : (
                "UNLOCK MY PLAN → " + unlockPriceLabel
              )}
            </PrimaryBtn>

            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>
              HAVE A PROMO CODE?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
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
                  fontFamily: S.font,
                  fontWeight: 600,
                  background: S.card2,
                  color: S.text,
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
            {promoError ? <div style={{ color: S.red, fontSize: 14, marginTop: 8 }}>{promoError}</div> : null}
            {discountApplied ? (
              <div style={{ color: S.green, fontSize: 14, marginTop: 8 }}>50% discount applied — your price is $39.50</div>
            ) : null}
          </Card>

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

          <PMFooter />
        </div>
      </div>
    );
  }

  // ── STEP 6: Unlocked 90-day Plan ─────────────────────────────────────
  if (step === 6 && (tier >= 2 || promoUsed)) {
    if (recsError) {
      return (
        <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                STEP 6 OF 6 — BUILDING YOUR PLAN
              </div>
              <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.accent, borderRadius: 2 }} />
              </div>
            </div>
            <Card style={{ textAlign: "center" }}>
              <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{recsError}</p>
              <PrimaryBtn onClick={fetchRecommendations}>TRY AGAIN</PrimaryBtn>
            </Card>
            <button type="button" onClick={resetAll} style={{ marginTop: 20, background: "transparent", border: "1px solid " + S.border, color: S.dim, borderRadius: 10, padding: "10px 16px", fontFamily: S.mono, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", width: "100%" }}>
              START OVER
            </button>
            <PMFooter />
          </div>
        </div>
      );
    }

    if (!recommendations || !recommendations.recommendations) {
      return null;
    }

    var rawRecs = recommendations.recommendations.slice();
    var PHASE_HEADERS = [
      { phase: 1, label: "WEEKS 1–4 — START NOW" },
      { phase: 2, label: "WEEKS 5–8 — BUILD ON IT" },
      { phase: 3, label: "WEEKS 9–12 — STRUCTURAL MOVES" },
    ];

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              COMPLETE — YOUR 90-DAY PLAN
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: unlockStepBarPct + "%", background: S.green, borderRadius: 2 }} />
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

          {PHASE_HEADERS.map(function (ph) {
            var phaseRecs = rawRecs.filter(function (r) {
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
          })}

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
              A copy of this plan has been sent to {gateEmail || "your email"}
            </p>
          </div>

          <PMFooter />
        </div>
      </div>
    );
  }

  return null;
}
