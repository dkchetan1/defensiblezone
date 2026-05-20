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
  var [adjustedSkills, setAdjustedSkills]   = useState(function() { return new Set(); });
  var adjustedSkillsRef                     = useRef(new Set());
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
  }, [conscience, pull, skills]);

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
    setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setBenchmark(null);
    setRecommendations(null); setRecsLoading(false); setRecsError(null);
    setStep(0); setLoading(false); setLoadingMsg(""); setError(null);
    setTier(0); setPromoCode(""); setPromoError(""); setPromoUsed(false); setDiscountApplied(false);
    setGateEmail(""); setGateSent(false); setGateVerified(false); setGateError("");
    setGateLoading(false); setShowResend(false); setGateOnDifferentDevice(false); setGateInputFocused(false);
  }

  function startEditing(id) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{editing:true}) : s; }); }); }
  function updateText(id, text) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{text:text}) : s; }); }); }
  function commitEdit(id) { setSkills(function(p) { return p.map(function(s) { return s.id===id ? Object.assign({},s,{editing:false}) : s; }); }); }
  function removeSkill(id) {
    setSkills(function(p) { return p.filter(function(s) { return s.id!==id; }); });
    setFluencies(function(p) { var n=Object.assign({},p); delete n[id]; return n; });
    adjustedSkillsRef.current.delete(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
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
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          boxSizing: "border-box",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzPMGateDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
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
    );
  }

  var visibleCtx = getVisibleContexts();
  var hiddenCount = WORK_CONTEXTS.length - visibleCtx.length;
  var progressPct = ((step + 1) / 6) * 100;

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
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 3 OF 6 — ASSESSMENT
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: progressPct + "%", background: S.accent, borderRadius: 2, transition: "width 0.25s ease" }} />
            </div>
          </div>
          <Card>
            <p style={{ fontFamily: S.mono, fontSize: 14, color: S.dim, margin: 0 }}>
              {gateVerified ? "Email verified. " : ""}Assessment — coming in a later prompt.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP {step + 1} OF 6
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: progressPct + "%", background: S.accent, borderRadius: 2 }} />
          </div>
        </div>
        {step > 0 && (
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
        )}
        <p style={{ fontFamily: S.mono, fontSize: 14, color: S.dim }}>Step {step + 1} — coming in a later prompt.</p>
      </div>
    </div>
  );
}
