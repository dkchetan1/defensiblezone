import { DZNavBar, DZFooter } from "./SharedComponents";
import { snapToStop, getSeed, compAff, calcDZ } from "./SharedScoring";
import { callGenerateWithRetry, parseGenerateJson } from "./SharedApi";
import { DZ_SLIDER_CSS_STANDARD, ProgressiveRevealStyles } from "./SharedStyles";
import { createSkillEditorHandlers, SkillCountBadge, skillsFromGeneratedList } from "./SharedSkillEditor";
import { useState, useEffect, useRef } from "react";
import PDFButton from "./PDFButton";

// ── ENGINEER TYPES ─────────────────────────────────────────────────────
var DEV_TYPES = [
  { id:"frontend",  label:"Frontend",          desc:"UI, browser, user-facing" },
  { id:"backend",   label:"Backend",            desc:"APIs, servers, databases" },
  { id:"fullstack", label:"Full Stack",         desc:"End-to-end ownership" },
  { id:"mobile",    label:"Mobile",             desc:"iOS, Android, React Native" },
  { id:"aiml",      label:"AI / ML",            desc:"Models, training, inference" },
  { id:"platform",  label:"Platform / Infra",   desc:"Internal platforms, reliability" },
  { id:"devops",    label:"DevOps / SRE",       desc:"CI/CD, observability, ops" },
  { id:"data",      label:"Data",               desc:"Pipelines, warehouses, analytics" },
  { id:"security",  label:"Security",           desc:"AppSec, pen testing, compliance" },
  { id:"qa",        label:"QA / Test",          desc:"Quality, automation, testing" },
  { id:"embedded",  label:"Embedded / Firmware",desc:"Hardware, IoT, low-level systems" },
  { id:"game",      label:"Game",               desc:"Game engines, graphics, simulation" },
  { id:"arvr",      label:"AR / VR / XR",       desc:"Spatial computing, immersive tech" },
  { id:"research",  label:"Research Engineer",  desc:"Algorithms, systems research" },
  { id:"other",     label:"Other",              desc:"Specify your type below" },
];

// ── SENIORITY ──────────────────────────────────────────────────────────
var SENIORITY_LEVELS = [
  { id:"junior",  label:"Junior",            sub:"0 – 2 yrs",         note:"Execution, guided tasks" },
  { id:"mid",     label:"Mid-level",         sub:"2 – 5 yrs",         note:"Owns features end-to-end" },
  { id:"senior",  label:"Senior",            sub:"5 – 8 yrs",         note:"Owns systems & quality" },
  { id:"staff",   label:"Staff / Principal", sub:"8+ yrs, IC",        note:"Org-wide technical vision" },
  { id:"manager", label:"Eng Manager",       sub:"People leadership", note:"Manages teams & delivery" },
  { id:"director",label:"Director+",         sub:"Org leadership",    note:"Strategy, hiring, culture" },
];

// ── WORK CONTEXTS ──────────────────────────────────────────────────────
var WORK_CONTEXTS = [
  { id:"crud",       label:"CRUD / Standard Web Apps" },
  { id:"distributed",label:"Distributed Systems & Microservices" },
  { id:"realtime",   label:"Real-time / Event-driven Systems" },
  { id:"api",        label:"API Design & Contracts" },
  { id:"security",   label:"Security & Compliance (SOC2, HIPAA, PCI)" },
  { id:"data",       label:"Data Pipelines & ETL" },
  { id:"mlint",      label:"ML / AI Integration" },
  { id:"cloud",      label:"Cloud Infrastructure (AWS/GCP/Azure)" },
  { id:"devtools",   label:"Developer Tooling & Platforms" },
  { id:"consumer",   label:"Consumer Product at Scale" },
  { id:"internal",   label:"Internal Tooling" },
  { id:"fintech",    label:"Payments / Fintech" },
  { id:"healthtech", label:"Healthcare Tech (HIPAA)" },
  { id:"lowlatency", label:"High-frequency / Low-latency Systems" },
  { id:"wasm",       label:"WebAssembly / Edge Computing" },
  { id:"arvr",       label:"AR / VR / Spatial Computing" },
  { id:"oss",        label:"Open Source / OSS" },
];

// ── CONTEXT FILTER MAP ─────────────────────────────────────────────────
// Maps dev type to the most relevant work context ids
var CONTEXT_MAP = {
  frontend:  ["crud","consumer","realtime","api","devtools","internal","wasm","arvr","oss","security"],
  backend:   ["crud","distributed","realtime","api","security","data","mlint","cloud","fintech","healthtech","lowlatency","internal","oss"],
  fullstack: ["crud","distributed","realtime","api","security","mlint","cloud","consumer","internal","fintech","healthtech","devtools","oss"],
  mobile:    ["crud","consumer","realtime","api","fintech","healthtech","arvr","oss","security","internal"],
  aiml:      ["mlint","data","cloud","lowlatency","oss","healthtech","distributed","realtime"],
  platform:  ["distributed","cloud","devtools","security","lowlatency","internal","oss","data"],
  devops:    ["cloud","security","devtools","distributed","internal","lowlatency","data","realtime"],
  data:      ["data","mlint","cloud","healthtech","fintech","internal","realtime","oss","distributed"],
  security:  ["security","cloud","fintech","healthtech","devtools","internal","distributed","api"],
  qa:        ["crud","consumer","devtools","internal","mlint","security","api","distributed"],
  embedded:  ["lowlatency","realtime","security","healthtech","arvr","fintech","oss","distributed"],
  game:      ["consumer","realtime","arvr","lowlatency","oss","distributed","wasm"],
  arvr:      ["consumer","realtime","lowlatency","oss","arvr","mlint","wasm"],
  research:  ["mlint","data","oss","lowlatency","distributed","cloud","realtime"],
  other:     null,
};

// ── COMPANY TYPES ──────────────────────────────────────────────────────
var COMPANY_TYPES = [
  { id:"early",     label:"Early-stage Startup",  sub:"< 50 people" },
  { id:"growth",    label:"Growth Startup",        sub:"50 – 500 people" },
  { id:"tier1",     label:"Tier-1 Tech",           sub:"Google, Meta, Apple, Microsoft, Amazon" },
  { id:"aifirst",   label:"AI-First Company",      sub:"OpenAI, Anthropic, Nvidia, Mistral, etc." },
  { id:"enterprise",label:"Enterprise",            sub:"Large corp, not tech-first" },
  { id:"consulting",label:"Consulting / Agency",   sub:"Client work" },
  { id:"gov",       label:"Government / Public",   sub:"Public sector" },
];

// ── DESIGN TOKENS ──────────────────────────────────────────────────────
var S = {
  bg:"#f8f9fc", card:"#ffffff", card2:"#f2f4f8",
  border:"#d0d7e8", text:"#0d1117", muted:"#1e2a42", dim:"#4a5568",
  accent:"#1a1d2e", purple:"#7c3aed", gold:"#d97706",
  green:"#059669", red:"#dc2626", blue:"#2563eb", orange:"#ea580c",
  font:"system-ui,-apple-system,sans-serif",
  mono:"'Courier New',monospace",
  serif:"'Playfair Display',Georgia,serif",
};

function buildProfile(devType, devTypeOther, seniority, workContexts, companyType) {
  var dt = DEV_TYPES.find(function(d) { return d.id === devType; });
  var sl = SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
  var ct = COMPANY_TYPES.find(function(c) { return c.id === companyType; });
  var wcLabels = workContexts.map(function(id) {
    var w = WORK_CONTEXTS.find(function(x) { return x.id === id; });
    return w ? w.label : id;
  });
  var devLabel = devType === "other" ? (devTypeOther || "Engineer") : (dt ? dt.label : devType);
  return {
    devLabel: devLabel,
    seniorityLabel: sl ? sl.label : seniority,
    seniorityNote: sl ? sl.note : "",
    companyLabel: ct ? ct.label : (companyType || ""),
    workContextLabels: wcLabels,
    summary: (sl ? sl.label : seniority) + " " + devLabel + " Engineer" + (ct ? " · " + ct.label : ""),
  };
}

// ── SHARED UI ──────────────────────────────────────────────────────────
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

// ── PROMO CODES ────────────────────────────────────────────────────────
// To add/remove bypass codes, edit this array.
// Remove the array entirely (set to []) when going fully live.
var PROMO_CODES = ["DZFRIEND", "DZPREVIEW", "DZTEST"];
var DISCOUNT_CODES = ["DZHALF"];
var TEST_CODES = ["DZONE"];

// ── MAIN APP ───────────────────────────────────────────────────────────
export default function Engineer() {
  var [step, setStep]                     = useState(0);
  var [devType, setDevType]               = useState("");
  var [devTypeOther, setDevTypeOther]     = useState("");
  var [seniority, setSeniority]           = useState("");
  var [workContexts, setWorkContexts]     = useState([]);
  var [customContexts, setCustomContexts] = useState([]);
  var [showAllCtx, setShowAllCtx]         = useState(false);
  var [companyType, setCompanyType]       = useState("");
  var [landscape, setLandscape]           = useState("");
  var [skills, setSkills]                 = useState([]);
  var [conscience, setConscience]         = useState(5);
  var [pull, setPull]                     = useState(5);
  var [fluencies, setFluencies]           = useState({});
  var [adjustedSkills, setAdjustedSkills] = useState(function() { return new Set(); });
  var adjustedSkillsRef                   = useRef(new Set());
  var freeEmailSentRef = useRef(false);
  var paidEmailSentRef = useRef(false);
  var [results, setResults]               = useState(null);
  var [benchmark, setBenchmark]           = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [loading, setLoading]               = useState(false);
  var [loadingMsg, setLoadingMsg]         = useState("");
  var [error, setError]                   = useState(null);
  var [tier, setTier]                     = useState(0); // 0=free, 2=recs, 3=pdf
  var [promoUsed, setPromoUsed]           = useState(false);
  var [promoCode, setPromoCode]           = useState("");
  var [promoError, setPromoError]         = useState("");
  var [discountApplied, setDiscountApplied] = useState(false);
  var [testModeApplied, setTestModeApplied] = useState(false);
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState("");
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
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
            savedRaw = localStorage.getItem("dz_saved_report_engineer");
          } catch (e) {}
          if (savedRaw) {
            try {
              var s = JSON.parse(savedRaw);
              if (s.devType) setDevType(s.devType);
              if (s.devTypeOther !== undefined) setDevTypeOther(s.devTypeOther);
              if (s.seniority) setSeniority(s.seniority);
              if (s.workContexts) setWorkContexts(s.workContexts);
              if (s.customContexts) setCustomContexts(s.customContexts);
              if (s.companyType) setCompanyType(s.companyType);
              if (s.skills) {
                setSkills(s.skills);
                var adj = new Set(s.skills.map(function (sk) { return sk.id; }));
                adjustedSkillsRef.current = adj;
                setAdjustedSkills(new Set(adj));
              }
              if (s.fluencies) setFluencies(s.fluencies);
              if (s.conscience !== undefined) setConscience(s.conscience);
              if (s.pull !== undefined) setPull(s.pull);
            } catch (e) {}
            if (data.email) setGateEmail(data.email);
            setGateVerified(true);
            setStep(3);
          } else {
            setStep(0);
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
        setStep(3);
        setGateLoading(false);
      } catch (e) {
        setGateError("invalid");
        setStep(3);
        setGateLoading(false);
      }
    })();
  }, []);

  useEffect(
    function () {
      if (step === 3 && gateVerified === true && skills.length > 0) {
        runAnalysis();
      }
    },
    [step, gateVerified, skills]
  );

  useEffect(function() {
    if (step !== 4 || !results) return;
    if (!gateEmail || !gateEmail.trim()) return;
    if (freeEmailSentRef.current) return;
    freeEmailSentRef.current = true;
    var prof = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    fetch("/api/send-results-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: gateEmail.trim(),
        product: "engineer",
        type: "free",
        results: {
          profile: { roleLabel: prof.devLabel + " Engineer", seniorityLabel: prof.seniorityLabel },
          landscape: landscape,
          skills: results,
        },
      }),
    }).catch(function() {});
  }, [step, results]);

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

  // ── Payment verification ────────────────────────────────────────────────
  // On mount: (1) check localStorage for existing valid token,
  //           (2) if ?session_id= in URL, verify with backend and store token.
  useEffect(function() {
    // Helper: decode JWT payload without verifying signature (verification is done server-side)
    function decodeJwt(token) {
      try {
        var payload = token.split(".")[1];
        var base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
      } catch (e) { return null; }
    }

    function applyToken(token) {
      var decoded = decodeJwt(token);
      if (!decoded) return false;
      // Check expiry
      if (decoded.exp && Date.now() / 1000 > decoded.exp) return false;
      // Check product matches
      if (decoded.product && decoded.product !== "engineer") return false;
      if (decoded.tier === 2 || decoded.tier === 3) {
        setTier(decoded.tier);
        setGateVerified(true);
        return true;
      }
      return false;
    }

    function restoreReport() {
      try {
        var saved = localStorage.getItem("dz_saved_report_engineer");
        if (!saved) return;
        var s = JSON.parse(saved);
        if (s.devType) setDevType(s.devType);
        if (s.seniority) setSeniority(s.seniority);
        if (s.workContexts) setWorkContexts(s.workContexts);
        if (s.customContexts) setCustomContexts(s.customContexts);
        if (s.companyType) setCompanyType(s.companyType);
        if (s.skills) {
          setSkills(s.skills);
          var adj = new Set(s.skills.map(function (sk) { return sk.id; }));
          adjustedSkillsRef.current = adj;
          setAdjustedSkills(new Set(adj));
        }
        if (s.fluencies) setFluencies(s.fluencies);
        if (s.conscience !== undefined) setConscience(s.conscience);
        if (s.pull !== undefined) setPull(s.pull);
        if (s.benchmark) setBenchmark(s.benchmark);
        if (s.results) {
          setResults(s.results);
          setStep(4);
        }
        if (s.gateEmail) setGateEmail(s.gateEmail);
      } catch (e) {}
    }

    // 1. Try existing token from localStorage
    var stored = localStorage.getItem("dz_token_engineer");
    if (stored && applyToken(stored)) {
      if (window.location.pathname.includes("/report")) restoreReport();
      return; // already unlocked from previous purchase
    }

    // 2. Fresh redirect from Stripe
    var params = new URLSearchParams(window.location.search);

    // Handle ?success=true (create-checkout-session flow used by DZONE)
    if (params.get("success") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      freeEmailSentRef.current = true;
      restoreReport();
      setTier(2);
      setGateVerified(true);
      return;
    }

    // Handle ?session_id= (direct Stripe buy link flow)
    var sessionId = params.get("session_id");
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname); // clean URL immediately
      freeEmailSentRef.current = true;
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, product: "engineer" }),
      })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.token) {
            localStorage.setItem("dz_token_engineer", data.token);
            applyToken(data.token);
            restoreReport();
          }
        })
        .catch(function(err) { console.error("Payment verification failed:", err); });
    }
  }, []);

  useEffect(function() {
    if (results && (tier >= 2 || promoUsed) && !recommendations &&
        !recsLoading && devType && seniority) {
      fetchRecommendations(results);
    }
  }, [results, tier, promoUsed, devType, seniority]);

  useEffect(function() {
    if (!recommendations || tier < 2) return;
    if (!results) return;
    if (!gateEmail || !gateEmail.trim()) return;
    if (paidEmailSentRef.current) return;
    paidEmailSentRef.current = true;
    var prof = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    fetch("/api/send-results-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: gateEmail.trim(),
        product: "engineer",
        type: "paid",
        results: {
          profile: { roleLabel: prof.devLabel + " Engineer", seniorityLabel: prof.seniorityLabel },
          landscape: landscape,
          skills: results,
          recommendations: recommendations,
        },
      }),
    }).catch(function() {});
  }, [recommendations, tier]);

  useEffect(function() {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = S.bg;
    return function() { document.body.style.background = ""; };
  }, []);

  var inputStyle = {
    width:"100%", background:"#f2f4f8", border:"1px solid " + S.border,
    borderRadius:8, padding:"12px 16px", color:S.text, fontSize:16,
    fontFamily:S.font, outline:"none", boxSizing:"border-box",
  };

  // When devType changes, reset work contexts that aren't relevant
  useEffect(function() {
    if (!devType || devType === "other") return;
    var allowed = CONTEXT_MAP[devType];
    if (!allowed) return;
    setWorkContexts(function(prev) {
      return prev.filter(function(id) { return allowed.indexOf(id) !== -1; });
    });
    setShowAllCtx(false);
  }, [devType]);

  useEffect(function() {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(function() {
    if (window.gtag) {
      window.gtag("event", "assessment_step", {
        product: "engineer",
        step_number: step,
      });
    }
  }, [step]);

  function getVisibleContexts() {
    if (!devType || devType === "other" || showAllCtx) return WORK_CONTEXTS;
    var allowed = CONTEXT_MAP[devType] || [];
    return WORK_CONTEXTS.filter(function(wc) { return allowed.indexOf(wc.id) !== -1; });
  }

  function toggleCtx(id) {
    setWorkContexts(function(prev) {
      return prev.indexOf(id) !== -1 ? prev.filter(function(x) { return x !== id; }) : prev.concat([id]);
    });
  }

  function resetAll() {
    setStep(0); setDevType(""); setDevTypeOther(""); setSeniority("");
    setWorkContexts([]); setCustomContexts([]); setShowAllCtx(false);
    setCompanyType(""); setLandscape(""); setSkills([]);
    setConscience(5); setPull(5); setFluencies({}); setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setBenchmark(null);
    setRecommendations(null); setRecsLoading(false); setRecsError(null);
    setError(null); setTier(0); setPromoUsed(false); setPromoCode(""); setPromoError("");
  }

  var skillEditor = createSkillEditorHandlers({
    setSkills: setSkills,
    setFluencies: setFluencies,
    adjustedSkillsRef: adjustedSkillsRef,
    setAdjustedSkills: setAdjustedSkills,
  });
  var startEditing = skillEditor.startEditing;
  var updateText = skillEditor.updateText;
  var commitEdit = skillEditor.commitEdit;
  var removeSkill = skillEditor.removeSkill;

  var canProceed = devType !== "" && seniority !== "" && workContexts.length > 0 && (devType !== "other" || devTypeOther.trim() !== "");

  // ── API CALL 1 ────────────────────────────────────────────────────────
  async function fetchLandscapeAndSkills() {
    if (!canProceed) return;
    setLoading(true); setLoadingMsg("Reading your engineering landscape…"); setError(null);
    var profile = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var sl = SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
    var prompt = "You are a senior engineering career strategist specializing in AI labor market analysis for software engineers.\n\nENGINEER PROFILE:\n- Type: " + profile.devLabel + " Engineer\n- Seniority: " + profile.seniorityLabel + " — " + (sl ? sl.note : "") + "\n- Work context: " + wcStr + "\n- Company: " + (profile.companyLabel || "not specified") + "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about the AI threat to this exact engineer profile RIGHT NOW (April 2026). Name specific tools (GitHub Copilot, Cursor, Devin, Claude, Gemini Code Assist), specific tasks being automated, and where the real exposure is at this seniority level doing this work. Do not write generic AI commentary — be specific to this combination.\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a " + profile.seniorityLabel + " " + profile.devLabel + " Engineer working on " + wcStr + " to assess for AI defensibility right now. Be precise — not 'coding' but 'designing distributed transaction systems across eventual consistency boundaries'. Include a realistic mix: some that are defensible and some genuinely at risk. Weight toward skills that actually differentiate at the " + profile.seniorityLabel + " level, not junior-level skills.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";
    try {
      var data = await callGenerateWithRetry({ model:"claude-sonnet-4-6", max_tokens:1000, messages:[{role:"user",content:prompt}] });
      var parsed = parseGenerateJson(data);
      var loaded = skillsFromGeneratedList(parsed.skills);
      setLandscape(parsed.landscape);
      setSkills(loaded);
      setFluencies({});
      setAdjustedSkills(new Set());
      adjustedSkillsRef.current = new Set();
      setStep(1);
    } catch(e) {
      setError("Something went wrong — please try again in a moment.");
    }
    finally { setLoading(false); }
  }

  // ── API CALL 2 + RECOMMENDATIONS ────────────────────────────────────────
  async function fetchRecommendations(scoredSkills) {
    setRecsLoading(true);
    setRecsError(null);
    var profile = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var skillSummary = skills
      .map(function (s, i) {
        var scored = scoredSkills.find(function (r) {
          return r.id === s.id || r.name === s.text;
        });
        var aiR = scored && typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
        var market = scored && typeof scored.market_demand === "number" ? scored.market_demand : 7;
        return i + 1 + ". " + s.text + " (AI Risk: " + aiR + "/10, Market Demand: " + market + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior engineering career strategist. A " +
      profile.seniorityLabel +
      " " +
      profile.devLabel +
      " Engineer at " +
      (profile.companyLabel || "not specified") +
      " focused on " +
      wcStr +
      " just completed a Defensible Zone assessment.\n\nFor each skill below, write a short personalized recommendation. Be specific to their seniority and context. Use plain English. Do not use the word 'threat'. Be direct and practical. For each recommendation, assign a phase (1, 2, or 3) based strictly on feasibility of starting — not score. You MUST distribute cards across all three phases. Do not put more than 4 cards in any single phase. Phase 1 (Weeks 1–4): actions the engineer can begin immediately within their current role — no org setup, no stakeholder buy-in, just personal execution. Phase 2 (Weeks 5–8): actions requiring some coordination with others, organizational standing, or setup before starting. Phase 3 (Weeks 9–12): actions with longer horizons — structural moves that only land after Phase 1 and 2 have created the conditions. Aim for roughly 3 cards in Phase 1, 3 in Phase 2, and 2 in Phase 3.\n\nSkills with scores:\n" +
      skillSummary +
      '\n\nReturn ONLY valid JSON, no preamble:\n{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact situation.","phase":1},{"id":"s1","headline":"...","action":"...","why":"...","phase":1},{"id":"s2","headline":"...","action":"...","why":"...","phase":1},{"id":"s3","headline":"...","action":"...","why":"...","phase":1},{"id":"s4","headline":"...","action":"...","why":"...","phase":1},{"id":"s5","headline":"...","action":"...","why":"...","phase":1},{"id":"s6","headline":"...","action":"...","why":"...","phase":1},{"id":"s7","headline":"...","action":"...","why":"...","phase":1}]}';
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
      setRecsLoading(false);
    } catch (e) {
      setRecsError("Could not load recommendations. Please try again.");
      setRecsLoading(false);
    }
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
        body: JSON.stringify({ email: trimmed, product: "engineer" }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateSent(true);
    } catch (e) {
      setGateError("Something went wrong. Please try again.");
    } finally {
      setGateLoading(false);
    }
  }

  async function runAnalysis() {
    setLoading(true); setLoadingMsg("Scoring your Defensible Zone™…"); setError(null);
    var profile = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var sl = SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
    var skillList = skills.map(function(s,i) { return (i+1)+". "+s.text; }).join("\n");
    var affinityList = skills.map(function(s) {
      var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
      var w = compAff(conscience, pull, fluencyVal);
      return '"'+s.text+'": conscience='+conscience+'/10, pull='+pull+'/10, fluency='+fluencyVal+'/10, composite='+w+'/10';
    }).join("\n");
    var prompt = "You are a senior engineering career strategist and AI labor market analyst.\n\nENGINEER PROFILE:\n- Type: " + profile.devLabel + " Engineer\n- Seniority: " + profile.seniorityLabel + " — " + (sl ? sl.note : "") + "\n- Work context: " + wcStr + "\n- Company: " + (profile.companyLabel||"not specified") + "\n\nSKILLS:\n" + skillList + "\n\nAFFINITY SCORES:\n" + affinityList + "\n\nScore each skill:\n\nai_replaceability (0-10) — calibrated to THIS specific profile:\n0-2: Requires sustained judgment, cross-system context, or org relationships that take years to build. AI cannot approximate.\n3-4: AI accelerates this substantially but the judgment, architecture decisions, or oversight still requires this seniority level.\n5-6: AI handles most execution. The engineer adds framing, edge case handling, and quality judgment.\n7-8: AI does this adequately today for this role. The engineer is reviewing, not creating.\n9-10: A junior prompt engineer outperforms this person's contribution on this skill right now.\n\nCRITICAL: A " + profile.seniorityLabel + " engineer doing " + wcStr + " should NOT have the same scores as a junior CRUD developer. Calibrate to seniority and work context. Staff-level system design, compliance judgment, and cross-team technical leadership should score 2-4 max.\n\nmarket_demand (0-10) — for " + profile.seniorityLabel + " " + profile.devLabel + " engineers at " + (profile.companyLabel||"this company type") + ":\n0-2: Declining or commoditized\n3-4: Steady\n5-6: Growing, competitive\n7-8: High demand, premium comp\n9-10: Critical shortage, top-of-market\n\ninterface_span: true ONLY if skill requires fluency in 2+ distinct professional disciplines simultaneously (eng + security compliance, eng + ML research, eng + product strategy, eng + hardware).\n\nrationale: one precise sentence calibrated to this specific profile. Explain the replaceability score given this person's seniority and work context.\n\nBENCHMARK vs other " + profile.seniorityLabel + " " + profile.devLabel + " engineers:\n- percentile: 0-100 AI defensibility\n- summary: one sentence\n- insights: 2-3 strategic observations specific to this profile\n\nReturn ONLY valid JSON:\n{\"skills\":[{\"name\":\"exact skill text\",\"ai_replaceability\":5,\"market_demand\":7,\"interface_span\":false,\"rationale\":\"one sentence\"}],\"benchmark\":{\"percentile\":65,\"summary\":\"...\",\"insights\":[\"...\",\"...\"]}}";
    function enrichScoredSkills(parsed) {
      return parsed.skills.map(function(skill, i) {
        var found = skills.find(function(s) { return s.text===skill.name; }) || skills.find(function(s) { return skill.name.indexOf(s.text.slice(0,20))!==-1; });
        var id = found ? found.id : ("s" + i);
        var fluencyVal = found && fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
        var dz  = calcDZ(aff, skill.ai_replaceability, skill.market_demand);
        return Object.assign({}, skill, { id: id, naturalAffinity:aff, investment:fluencyVal, affinity:aff, dz:dz });
      });
    }
    try {
      var data = await callGenerateWithRetry({ model:"claude-sonnet-4-6", max_tokens:2000, messages:[{role:"user",content:prompt}] });
      var parsed = parseGenerateJson(data);
      var enriched = enrichScoredSkills(parsed);
      setBenchmark(parsed.benchmark);
      setResults(enriched);
      setStep(4);
      try {
        localStorage.setItem("dz_saved_report_engineer", JSON.stringify({
          step: 3, devType, gateEmail, seniority, workContexts, customContexts: [],
          companyType, skills, conscience, pull, fluencies,
          benchmark: parsed.benchmark, results: enriched
        }));
      } catch (_e) {}
      fetchRecommendations(enriched);
    } catch(e) {
      setError("Analysis failed — please try again in a moment.");
    }
    finally { setLoading(false); }
  }

  // ── LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{background:S.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:S.font,padding:"32px 20px",boxSizing:"border-box"}}>
        <DZNavBar />
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <style dangerouslySetInnerHTML={{__html:"@keyframes spin{to{transform:rotate(360deg)}}"}} />
        <div style={{textAlign:"center",maxWidth:400,padding:"0 20px"}}>
          <div style={{width:52,height:52,border:"3px solid "+S.border,borderTop:"3px solid "+S.gold,borderRadius:"50%",margin:"0 auto 28px",animation:"spin 0.85s linear infinite"}} />
          <p style={{fontFamily:S.mono,fontSize:12,color:S.muted,margin:"0 0 10px",letterSpacing:"0.08em"}}>DEFENSIBLE ZONE&#8482; · SOFTWARE ENGINEER EDITION</p>
          <p style={{fontFamily:S.serif,fontSize:22,color:S.text,fontStyle:"italic",margin:"0 0 10px"}}>{loadingMsg}</p>
          <p style={{fontFamily:S.mono,fontSize:12,color:S.muted,margin:0,letterSpacing:"0.08em"}}>
            {step===0?"READING YOUR ENGINEERING LANDSCAPE · GENERATING SKILL MAP":"SCORING AI REPLACEABILITY · CALIBRATING TO YOUR LEVEL"}
          </p>
        </div>
        </div>
        <div style={{maxWidth:680,margin:"0 auto",width:"100%"}}><DZFooter /></div>
      </div>
    );
  }

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
        <DZNavBar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzEngineerGateDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
            DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
          </div>
          <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>Verifying your email…</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
            <span style={{ animation: "dzEngineerGateDots 1s ease-in-out infinite" }}>.</span>
            <span style={{ animation: "dzEngineerGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
            <span style={{ animation: "dzEngineerGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
          </div>
        </div>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}><DZFooter /></div>
      </div>
    );
  }

  // ── STEP 0: STRUCTURED CONTEXT (progressive reveal) ───────────────────
  if (step === 0) {
    var devTypeReady = devType !== "" && (devType !== "other" || devTypeOther.trim() !== "");
    var seniorityReady = devTypeReady && seniority !== "";
    var contextsReady = seniorityReady && workContexts.length > 0;
    var visibleCtx = getVisibleContexts();
    var hiddenCount = WORK_CONTEXTS.length - visibleCtx.length;

    return (
     <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"40px 20px"}}>
  <DZNavBar />
  <ProgressiveRevealStyles />
  <div style={{maxWidth:740,margin:"0 auto"}}>

          <div style={{marginBottom:32}}>
            <div style={{fontFamily:S.mono,fontSize:12,color:S.gold,letterSpacing:"0.12em",marginBottom:10,fontWeight:600}}>RECURSIO LAB · DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION</div>
            <h1 style={{fontFamily:S.serif,fontSize:40,color:S.text,margin:"0 0 12px",lineHeight:1.1}}>Find Your<br /><em>Defensible Zone<sup style={{fontSize:"0.45em",verticalAlign:"super",fontStyle:"normal"}}>™</sup></em></h1>
            <p style={{color:S.muted,fontSize:16,lineHeight:1.75,margin:0,maxWidth:540}}>
              The AI threat to software engineering is not uniform. Where you sit, what you build, and how senior you are changes everything. This assessment is calibrated to your exact profile.
            </p>
          </div>

          {/* ── SECTION 1: Engineer type — always visible ── */}
          <Card style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Label style={{marginBottom:0}}>WHAT TYPE OF ENGINEER ARE YOU?</Label>
              {devTypeReady && (
                <span style={{fontFamily:S.mono,fontSize:12,color:S.green,fontWeight:700}}>✓ {devType==="other"?devTypeOther:DEV_TYPES.find(function(d){return d.id===devType;})?.label}</span>
              )}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
              {DEV_TYPES.map(function(dt) {
                return (
                  <SelBtn key={dt.id} active={devType===dt.id} onClick={function() { setDevType(dt.id); }}>
                    <div>
                      <div style={{fontWeight:700,fontSize:16}}>{dt.label}</div>
                      <div style={{fontSize:15,opacity:0.75,marginTop:1}}>{dt.desc}</div>
                    </div>
                  </SelBtn>
                );
              })}
            </div>
            {devType === "other" && (
              <div style={{marginTop:12}} className="reveal">
                <input autoFocus value={devTypeOther} onChange={function(e){setDevTypeOther(e.target.value);}} placeholder="Describe your engineer type — e.g. Blockchain, Compiler, Simulation…" style={inputStyle} />
              </div>
            )}
          </Card>

          {/* ── SECTION 2: Seniority — appears after engineer type ── */}
          {devTypeReady && (
            <Card style={{marginBottom:12}} className="reveal">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <Label style={{marginBottom:0}}>WHAT IS YOUR SENIORITY LEVEL?</Label>
                {seniority && (
                  <span style={{fontFamily:S.mono,fontSize:12,color:S.green,fontWeight:700}}>✓ {SENIORITY_LEVELS.find(function(s){return s.id===seniority;})?.label}</span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:8}}>
                {SENIORITY_LEVELS.map(function(sl) {
                  return (
                    <SelBtn key={sl.id} active={seniority===sl.id} onClick={function(){setSeniority(sl.id);}}>
                      <div style={{fontWeight:700,fontSize:16,marginBottom:2}}>{sl.label}</div>
                      <div style={{fontSize:15,opacity:0.75}}>{sl.sub}</div>
                      <div style={{fontSize:14,opacity:0.6,marginTop:2}}>{sl.note}</div>
                    </SelBtn>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── SECTION 3: Work context — appears after seniority ── */}
          {seniorityReady && (
            <Card style={{marginBottom:12}} className="reveal">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <Label style={{marginBottom:0}}>WHAT DO YOU PRIMARILY WORK ON?</Label>
                <span style={{fontFamily:S.mono,fontSize:12,color:workContexts.length>0?S.gold:S.dim,fontWeight:700}}>
                  {workContexts.length > 0 ? workContexts.length+" selected" : "select all that apply"}
                </span>
              </div>
              <p style={{color:S.muted,fontSize:16,margin:"0 0 14px",lineHeight:1.7}}>
                This is the most important input — it's what changes your scores the most.
                {devType && devType !== "other" && !showAllCtx && hiddenCount > 0 && (
                  <span style={{color:S.dim}}> Showing the {visibleCtx.length} most relevant contexts for {DEV_TYPES.find(function(d){return d.id===devType;})?.label} engineers.</span>
                )}
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                {visibleCtx.map(function(wc) {
                  return <Chip key={wc.id} label={wc.label} active={workContexts.indexOf(wc.id)!==-1} onClick={function(){toggleCtx(wc.id);}} />;
                })}
              </div>
              {devType && devType !== "other" && !showAllCtx && hiddenCount > 0 && (
                <button onClick={function(){setShowAllCtx(true);}} style={{background:"none",border:"1px dashed "+S.border,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontFamily:S.mono,fontSize:12,color:S.dim,marginBottom:12}}>+ Show {hiddenCount} more contexts</button>
              )}
            </Card>
          )}

          {/* ── SECTION 4: Company — appears after at least one context selected ── */}
          {contextsReady && (
            <Card style={{marginBottom:20}} className="reveal">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <Label style={{marginBottom:0}}>COMPANY CONTEXT <span style={{color:S.dim,fontWeight:400,textTransform:"none"}}>— optional</span></Label>
                {companyType && (
                  <span style={{fontFamily:S.mono,fontSize:12,color:S.green,fontWeight:700}}>✓ {COMPANY_TYPES.find(function(c){return c.id===companyType;})?.label}</span>
                )}
              </div>
              <p style={{color:S.muted,fontSize:16,margin:"0 0 12px",lineHeight:1.6}}>Improves market demand scoring. A Staff engineer at an AI-first company has a very different market profile than one at a large enterprise.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:8}}>
                {COMPANY_TYPES.map(function(ct) {
                  return (
                    <SelBtn key={ct.id} active={companyType===ct.id} onClick={function(){setCompanyType(companyType===ct.id?"":ct.id);}}>
                      <div style={{fontWeight:700,fontSize:16}}>{ct.label}</div>
                      <div style={{fontSize:15,opacity:0.75,marginTop:2}}>{ct.sub}</div>
                    </SelBtn>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── CTA — appears after contexts selected ── */}
          {contextsReady && (
            <div className="reveal">
              {error && <p style={{color:S.red,fontSize:14,fontFamily:S.mono,fontWeight:600,marginBottom:12,textAlign:"center"}}>{error}</p>}
              <PrimaryBtn onClick={fetchLandscapeAndSkills} disabled={!canProceed}>GENERATE MY SKILL MAP →</PrimaryBtn>
              <p style={{color:S.dim,fontSize:14,textAlign:"center",marginTop:12,fontFamily:S.mono}}>Takes about 60 seconds · Two steps · No account required</p>
            </div>
          )}

          {/* ── Nudge text when nothing selected yet ── */}
          {!devTypeReady && (
            <p style={{color:S.dim,fontSize:14,fontFamily:S.mono,textAlign:"center",marginTop:8}}>Select your engineer type above to continue ↑</p>
          )}
          {devTypeReady && !seniorityReady && (
            <p style={{color:S.dim,fontSize:14,fontFamily:S.mono,textAlign:"center",marginTop:8}}>Now select your seniority level ↑</p>
          )}
          {seniorityReady && !contextsReady && (
            <p style={{color:S.dim,fontSize:14,fontFamily:S.mono,textAlign:"center",marginTop:8}}>Select at least one work context to continue ↑</p>
          )}

        </div>
        <DZFooter />
      </div>
    );
  }

  // ── STEP 1: SKILLS ─────────────────────────────────────────────────────
  if (step === 1) {
    var profile1 = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    return (
      <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"32px 20px"}}>
        <DZNavBar />
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:S.mono,fontSize:12,color:S.gold,letterSpacing:"0.1em",marginBottom:6,fontWeight:600}}>STEP 1 OF 2 · {profile1.summary.toUpperCase()}</div>
            <h2 style={{fontFamily:S.serif,fontSize:30,color:S.text,margin:"0 0 6px"}}>Your AI Landscape</h2>
          </div>
          <div style={{background:"linear-gradient(135deg,rgba(26,29,46,.97),rgba(26,29,46,.92))",borderRadius:14,padding:22,marginBottom:18,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:160,height:160,background:"radial-gradient(circle,rgba(217,119,6,.15) 0%,transparent 70%)",pointerEvents:"none"}} />
            <div style={{fontFamily:S.mono,fontSize:12,color:"rgba(217,119,6,.8)",letterSpacing:"0.1em",marginBottom:8,fontWeight:600}}>AI LANDSCAPE · {profile1.devLabel.toUpperCase()} ENGINEER · {profile1.seniorityLabel.toUpperCase()}</div>
            <p style={{color:"rgba(240,242,248,.9)",fontSize:16,lineHeight:1.75,margin:0,fontStyle:"italic"}}>{landscape}</p>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:18}}>
            {profile1.workContextLabels.map(function(wc) {
              return <span key={wc} style={{fontFamily:S.mono,fontSize:12,color:S.gold,background:"rgba(217,119,6,0.1)",border:"1px solid rgba(217,119,6,0.3)",borderRadius:12,padding:"3px 10px",fontWeight:600}}>{wc}</span>;
            })}
          </div>
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
              <Label style={{marginBottom:0}}>YOUR SKILLS TO ASSESS</Label>
              <SkillCountBadge count={skills.length} tokens={S} />
            </div>
            <p style={{color:S.muted,fontSize:16,margin:"0 0 16px",lineHeight:1.6}}>
              Generated for your exact profile. <strong style={{color:S.text}}>Edit any skill to be more specific</strong> — "React perf optimization for 50M MAU" scores better than "React".
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {skills.map(function(s, i) {
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:S.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:s.editing?9:10}}>
                      <span style={{color:"white",fontSize:12,fontFamily:S.mono,fontWeight:700}}>{i+1}</span>
                    </div>
                    <div style={{flex:1}}>
                      {s.editing ? (
                        <div style={{display:"flex",gap:8}}>
                          <input autoFocus value={s.text} onChange={function(e){updateText(s.id,e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"||e.key==="Escape")commitEdit(s.id);}} style={Object.assign({},inputStyle,{flex:1})} />
                          <button onClick={function(){commitEdit(s.id);}} style={{background:S.accent,border:"none",color:"white",padding:"12px 16px",borderRadius:8,cursor:"pointer",fontFamily:S.mono,fontSize:14,fontWeight:700}}>✓</button>
                        </div>
                      ) : (
                        <div style={{display:"flex",alignItems:"center",background:"#f2f4f8",border:"1px solid "+S.border,borderRadius:10,padding:"10px 14px",gap:10,minHeight:46}}>
                          <span style={{color:S.text,fontSize:16,flex:1,fontWeight:500,lineHeight:1.4}}>{s.text}</span>
                          <button onClick={function(){startEditing(s.id);}} style={{background:"none",border:"1px solid "+S.border,color:S.muted,cursor:"pointer",fontSize:12,padding:"4px 9px",borderRadius:6,fontFamily:S.mono,whiteSpace:"nowrap"}}>EDIT</button>
                          <button onClick={function(){removeSkill(s.id);}} style={{background:"none",border:"none",color:S.dim,cursor:"pointer",fontSize:18,lineHeight:1,padding:0,flexShrink:0}}>×</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{display:"flex",gap:12}}>
            <button onClick={function(){setStep(0);}} style={{flex:1,background:"transparent",border:"1px solid "+S.border,color:S.muted,borderRadius:12,padding:"15px 0",fontSize:14,fontFamily:S.mono,cursor:"pointer",letterSpacing:"0.06em",fontWeight:600}}>← BACK</button>
            <PrimaryBtn onClick={function(){setStep(2);}} disabled={skills.length===0} style={{flex:3}}>
              {skills.length===0?"ADD AT LEAST ONE SKILL":"NEXT: RATE AFFINITY & FLUENCY →"}
            </PrimaryBtn>
          </div>
          <DZFooter />
        </div>
      </div>
    );
  }

  // ── STEP 2: BIFACTOR AFFINITY ─────────────────────────────────────────
  if (step === 2) {
    var profile2 = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var affinityStops = [0, 3, 5, 7, 10];
    var conscienceLabelTexts = ["Move on easily","Mildly bothered","Somewhat unsettled","Want to fix it","Can't let it go"];
    var pullLabelTexts = ["Almost never","Occasionally","Sometimes","Regularly","Constantly"];
    return (
      <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"32px 20px"}}>
        <DZNavBar />
        <style dangerouslySetInnerHTML={{__html:DZ_SLIDER_CSS_STANDARD}} />
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:S.mono,fontSize:12,color:S.purple,letterSpacing:"0.1em",marginBottom:8,fontWeight:600}}>STEP 2 OF 2 · AFFINITY</div>
            <h2 style={{fontFamily:S.serif,fontSize:30,color:S.text,margin:"0 0 8px"}}>How does engineering work feel?</h2>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <span style={{fontFamily:S.mono,fontSize:12,color:S.gold,background:"rgba(217,119,6,0.1)",border:"1px solid rgba(217,119,6,0.3)",borderRadius:12,padding:"3px 10px",fontWeight:600}}>{profile2.devLabel} Engineer</span>
              <span style={{fontFamily:S.mono,fontSize:12,color:S.muted,background:S.card2,border:"1px solid "+S.border,borderRadius:12,padding:"3px 10px",fontWeight:600}}>{profile2.seniorityLabel}</span>
            </div>
            <p style={{fontSize:16,color:"#6b7280",lineHeight:1.7,margin:0}}>
              These questions aren&apos;t about how skilled you are. They&apos;re about whether this work genuinely fits you. Be honest — there are no wrong answers.
            </p>
          </div>
          <div style={{fontFamily:S.mono,fontSize:12,textTransform:"uppercase",color:"#7a88a8",marginBottom:6}}>PART 1 — ABOUT YOU IN GENERAL</div>
          <div style={{fontSize:15,color:"#7a88a8",marginBottom:24}}>Answer these once. They apply across all your skills.</div>
          <div style={{background:S.card,border:"1px solid #d0d7e8",borderRadius:14,padding:"24px 28px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:"#7c3aed",flexShrink:0}} />
              <span style={{fontFamily:S.mono,fontSize:12,fontWeight:700,color:"#7c3aed",letterSpacing:"0.08em"}}>CRAFT CONSCIENCE</span>
            </div>
            <p style={{fontSize:16,fontStyle:"italic",color:"#3d4a6b",lineHeight:1.6,marginBottom:6,marginTop:0}}>
              When you push code or ship something you know isn&apos;t quite right — a shortcut, a hack, technical debt you accepted under pressure — how does that sit with you?
            </p>
            <p style={{fontSize:14,color:"#7a88a8",lineHeight:1.5,marginBottom:20,marginTop:0}}>
              This tells us whether you genuinely care about engineering quality independent of whether anyone reviewed it, measured it, or noticed.
            </p>
            <input
              className="dz-slider conscience-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={conscience}
              onChange={function(e){ setConscience(snapToStop(Number(e.target.value))); }}
              style={{background:"linear-gradient(to right, #7c3aed "+(conscience/10)*100+"%, #d0d7e8 "+(conscience/10)*100+"%)"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              {affinityStops.map(function(stopValue, idx) {
                return (
                  <div key={stopValue} style={{width:"20%",textAlign:"center",fontSize:12,color:"#7c3aed",opacity:Math.abs(conscience-stopValue)<=1?1:0.25,fontWeight:Math.abs(conscience-stopValue)<=1?700:400}}>
                    {conscienceLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{background:S.card,border:"1px solid #d0d7e8",borderRadius:14,padding:"24px 28px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:"#0891b2",flexShrink:0}} />
              <span style={{fontFamily:S.mono,fontSize:12,fontWeight:700,color:"#0891b2",letterSpacing:"0.08em"}}>INTRINSIC PULL</span>
            </div>
            <p style={{fontSize:16,fontStyle:"italic",color:"#3d4a6b",lineHeight:1.6,marginBottom:6,marginTop:0}}>
              Outside of work, with no deadlines and no one asking, how often does your mind drift toward technical problems — an architecture decision, a bug, something you want to build?
            </p>
            <p style={{fontSize:14,color:"#7a88a8",lineHeight:1.5,marginBottom:20,marginTop:0}}>
              This tells us whether engineering is something you&apos;re genuinely wired for, or primarily a professional identity and income.
            </p>
            <input
              className="dz-slider pull-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={pull}
              onChange={function(e){ setPull(snapToStop(Number(e.target.value))); }}
              style={{background:"linear-gradient(to right, #0891b2 "+(pull/10)*100+"%, #d0d7e8 "+(pull/10)*100+"%)"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              {affinityStops.map(function(stopValue, idx) {
                return (
                  <div key={stopValue} style={{width:"20%",textAlign:"center",fontSize:12,color:"#0891b2",opacity:Math.abs(pull-stopValue)<=1?1:0.25,fontWeight:Math.abs(pull-stopValue)<=1?700:400}}>
                    {pullLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>
          <hr style={{border:"none",borderTop:"1px solid #d0d7e8",margin:"32px 0"}} />
          <div style={{fontFamily:S.mono,fontSize:12,textTransform:"uppercase",color:"#7a88a8",marginBottom:6}}>PART 2 — SKILL BY SKILL</div>
          <div style={{fontSize:15,color:"#7a88a8",lineHeight:1.6,marginBottom:8}}>
            For each skill — does doing this work feel natural and easy, or does it take real effort?
          </div>
          <div style={{fontSize:14,color:"#9ca3af",marginBottom:24}}>
            Sliders are pre-set based on your answers above. Only move one if a skill feels noticeably different from your usual pattern.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {skills.map(function(s) {
              var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              var affinityScore = compAff(conscience, pull, fluencyVal);
              var affinityColor = affinityScore >= 7 ? S.green : affinityScore >= 5 ? S.gold : S.red;
              var fluencyForGrad = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              return (
                <div
                  key={s.id}
                  style={{
                    background:S.card,
                    border:"1px solid #d0d7e8",
                    borderRadius:12,
                    padding:"18px 22px",
                    marginBottom:0
                  }}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{flex:1,paddingRight:12}}>
                      <div style={{fontSize:16,fontWeight:600,color:S.text}}>{s.text}</div>
                    </div>
                    <span style={{
                      fontSize:12,
                      padding:"2px 8px",
                      borderRadius:10,
                      fontFamily:S.mono,
                      flexShrink:0,
                      background:adjustedSkills.has(s.id)?"rgba(217,119,6,0.12)":"rgba(5,150,105,0.10)",
                      color:adjustedSkills.has(s.id)?"#d97706":"#059669"
                    }}>
                      {adjustedSkills.has(s.id)?"adjusted":"pre-seeded"}
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontFamily:S.mono,fontSize:12,color:"#7a88a8"}}>FELT FLUENCY</span>
                    <span style={{fontFamily:S.mono,fontSize:12,fontWeight:700,color:"#d97706"}}>{fluencyForGrad}/10</span>
                  </div>
                  <input
                    className="dz-slider fluency-sl"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={fluencyVal}
                    onChange={function(e) {
                      var val = Number(e.target.value);
                      setFluencies(function(prev) { return Object.assign({}, prev, { [s.id]: val }); });
                      markAdjusted(s.id);
                    }}
                    style={{background:"linear-gradient(to right, #d97706 "+(fluencyForGrad/10)*100+"%, #d0d7e8 "+(fluencyForGrad/10)*100+"%)"}}
                  />
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:12,color:"#9ca3af"}}>Effortful</span>
                    <span style={{fontSize:12,color:"#9ca3af"}}>Frictionless</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"1px solid #f0f0f0"}}>
                    <span style={{fontFamily:S.mono,fontSize:12,color:"#7a88a8"}}>AFFINITY SCORE</span>
                    <span style={{fontSize:22,fontWeight:700,color:affinityColor}}>{affinityScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12,marginBottom:12}}>
            <button onClick={function(){setStep(1);}} style={{flex:1,background:"transparent",border:"1px solid "+S.border,color:S.muted,borderRadius:12,padding:"15px 0",fontSize:14,fontFamily:S.mono,cursor:"pointer",letterSpacing:"0.06em",fontWeight:600}}>← BACK</button>
            <PrimaryBtn onClick={function(){
              try {
                localStorage.setItem("dz_saved_report_engineer", JSON.stringify({
                  devType,
                  devTypeOther,
                  seniority,
                  workContexts,
                  customContexts,
                  companyType,
                  skills,
                  conscience,
                  pull,
                  fluencies
                }));
              } catch (_e) {}
              setStep(3);
            }} disabled={skills.length===0} style={{flex:3}}>ANALYZE MY DEFENSIBLE ZONE™ →</PrimaryBtn>
          </div>
          <DZFooter />
        </div>
      </div>
    );
  }

  if (step === 3) {
    var fullScreenCenter = {
      background: S.bg,
      minHeight: "100vh",
      fontFamily: S.font,
      display: "flex",
      flexDirection: "column",
      padding: "32px 20px",
      boxSizing: "border-box",
    };
    var gateTryAgainBtn = {
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

    if (gateVerified) {
      return (
        <div style={fullScreenCenter}>
          <DZNavBar />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <style
            dangerouslySetInnerHTML={{
              __html: "@keyframes dzEngineerGateDots{0%,100%{opacity:0.25}50%{opacity:1}}",
            }}
          />
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
            </div>
            {error ? (
              <div>
                <div style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{error}</div>
                <button
                  type="button"
                  onClick={function () {
                    runAnalysis();
                  }}
                  style={Object.assign({}, gateTryAgainBtn, { marginTop: 0, width: "auto", minWidth: 200 })}
                >
                  Try again
                </button>
              </div>
            ) : (
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>Scoring your Defensible Zone™…</div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzEngineerGateDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzEngineerGateDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzEngineerGateDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
          </div>
          <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}><DZFooter /></div>
        </div>
      );
    }

    var formShell = {
      background: S.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      boxSizing: "border-box",
      fontFamily: S.font,
    };
    var card = { maxWidth: 480, width: "100%", margin: "0 auto", textAlign: "center" };

    if (gateSent) {
      return (
        <div style={formShell}>
          <DZNavBar />
          <div style={card}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.gold,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              CHECK YOUR INBOX
            </div>

            <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>
              We sent you a link.
            </div>

            <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 20 }}>
              Click the button in the email from noreply@defensiblezone.ai to open your results. Check your spam folder if you do not see it within a minute.
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 20,
                background: S.card2,
                border: "1px solid " + S.border,
                fontFamily: S.mono,
                fontSize: 13,
                color: S.muted,
                marginBottom: 28,
              }}
            >
              {gateEmail}
            </div>

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
                }}
              >
                Resend the link
              </button>
            ) : null}

            <div
              role="button"
              tabIndex={0}
              onClick={function () {
                setGateEmail("");
                setGateSent(false);
                setGateError("");
                setGateVerified(false);
                setGateLoading(false);
                setShowResend(false);
                setStep(0);
              }}
              onKeyDown={function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                setGateEmail("");
                setGateSent(false);
                setGateError("");
                setGateVerified(false);
                setGateLoading(false);
                setShowResend(false);
                setStep(0);
              }}
              style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, cursor: "pointer", marginTop: 24 }}
            >
              Start over
            </div>
          </div>
          <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}><DZFooter /></div>
        </div>
      );
    }

    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    return (
      <div style={formShell}>
        <DZNavBar />
        <div style={card}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
            DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
          </div>

          <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>
            Your report is ready.
          </div>

          <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 28 }}>
            Enter your email to unlock it. We&apos;ll send you a link.
          </div>

          {gateError === "expired" ? (
            <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>This link has expired. Enter your email to get a new one.</div>
          ) : null}
          {gateError === "invalid" ? (
            <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>Something went wrong. Please enter your email to continue.</div>
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

          {gateError && !showExpiredInvalid ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{gateError}</div> : null}

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
            }}
          >
            Send me my report
          </button>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}><DZFooter /></div>
      </div>
    );
  }

  // ── STEP 3: RESULTS ────────────────────────────────────────────────────
  if (step === 4 && results) {
    var profile3 = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var skillDZs = skills.map(function (skill) {
      var r = results.find(function (x) {
        return x.name === skill.text;
      });
      if (!r) {
        return { id: skill.id, text: skill.text, dz: 0, affinity: 0, aiR: 5, market: 7, rationale: "" };
      }
      return {
        id: skill.id,
        text: skill.text,
        dz: r.dz,
        affinity: r.affinity,
        aiR: r.ai_replaceability,
        market: r.market_demand,
        rationale: r.rationale || "",
      };
    });
    var totalDZ = Math.round(
      skillDZs.reduce(function (sum, s) {
        return sum + s.dz;
      }, 0) / skillDZs.length
    );
    var dzLabelColor = totalDZ >= 70 ? S.green : totalDZ >= 50 ? S.gold : totalDZ >= 30 ? S.orange : S.red;
    var dzLabelText =
      totalDZ >= 70 ? "Highly Defensible" : totalDZ >= 50 ? "Moderately Defensible" : totalDZ >= 30 ? "Mixed Territory" : "Needs Attention";
    function dzBarColor(score) {
      if (score >= 65) return S.green;
      if (score >= 40) return S.gold;
      return S.red;
    }
    var sortedDZ = skillDZs.slice().sort(function (a, b) {
      return b.dz - a.dz;
    });
    var topSkills = sortedDZ.slice(0, 3);
    var atRisk = sortedDZ.slice(-3);

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px" }}>
        <DZNavBar />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 34,
              color: S.text,
              margin: "0 0 6px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Your Defensible Zone™
          </h1>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>{profile3.summary}</p>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d0d7e8",
              borderRadius: 16,
              padding: "28px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "4px solid " + dzLabelColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: dzLabelColor,
                  lineHeight: 1,
                  fontFamily: S.mono,
                }}
              >
                {totalDZ}
              </span>
              <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: S.mono, marginTop: 2 }}>/ 100</span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: "#9ca3af",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                OVERALL DZ SCORE
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: dzLabelColor, marginBottom: 6, fontFamily: S.serif }}>{dzLabelText}</div>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
                Across your 8 assessed skills, this is how defensible your software engineering practice is against AI displacement right now.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 14, padding: "20px 18px" }}>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: S.green,
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                  fontWeight: 700,
                }}
              >
                MOST DEFENSIBLE
              </div>
              {topSkills.map(function (s) {
                return (
                  <div key={s.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.text, lineHeight: 1.35, marginBottom: 4 }}>{s.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: s.dz + "%", height: "100%", background: S.green, borderRadius: 3 }} />
                      </div>
                      <span
                        style={{
                          fontFamily: S.mono,
                          fontSize: 12,
                          color: S.green,
                          fontWeight: 700,
                          minWidth: 28,
                          textAlign: "right",
                        }}
                      >
                        {s.dz}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #d0d7e8", borderRadius: 14, padding: "20px 18px" }}>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: S.red,
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                  fontWeight: 700,
                }}
              >
                MOST EXPOSED
              </div>
              {atRisk.map(function (s) {
                return (
                  <div key={s.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.text, lineHeight: 1.35, marginBottom: 4 }}>{s.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: s.dz + "%", height: "100%", background: dzBarColor(s.dz), borderRadius: 3 }} />
                      </div>
                      <span
                        style={{
                          fontFamily: S.mono,
                          fontSize: 12,
                          color: dzBarColor(s.dz),
                          fontWeight: 700,
                          minWidth: 28,
                          textAlign: "right",
                        }}
                      >
                        {s.dz}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="dz-engineer-report">
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: S.dim,
                marginBottom: 14,
              }}
            >
              FULL SKILL BREAKDOWN
            </div>

            {skillDZs.map(function (s) {
              var col = dzBarColor(s.dz);
              return (
                <div
                  key={s.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d0d7e8",
                    borderRadius: 12,
                    padding: "16px 18px",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: S.text, flex: 1, paddingRight: 12, lineHeight: 1.35 }}>{s.text}</div>
                    <div style={{ fontFamily: S.mono, fontSize: 22, fontWeight: 700, color: col, flexShrink: 0, lineHeight: 1 }}>{s.dz}</div>
                  </div>
                  <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ width: s.dz + "%", height: "100%", background: col, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", gap: 18, marginBottom: s.rationale ? 10 : 0 }}>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>AFFINITY</div>
                      <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{s.affinity}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>AI RISK</div>
                      <div
                        style={{
                          fontFamily: S.mono,
                          fontSize: 12,
                          fontWeight: 700,
                          color: s.aiR >= 7 ? S.red : s.aiR >= 5 ? S.gold : S.green,
                        }}
                      >
                        {s.aiR}/10
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: "#9ca3af", letterSpacing: "0.06em" }}>DEMAND</div>
                      <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: S.blue }}>{s.market}/10</div>
                    </div>
                  </div>
                  {s.rationale ? (
                    <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5, borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>{s.rationale}</div>
                  ) : null}
                </div>
              );
            })}

            <div style={{ background: "#f2f4f8", borderRadius: 12, padding: "16px 20px", marginTop: 8, marginBottom: 28 }}>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: S.dim,
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                HOW YOUR SCORE IS CALCULATED
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "#3d4a6b", margin: "0 0 12px" }}>
                Your DZ score is calculated from three inputs. Affinity measures how naturally this work fits you — combining how much you care about quality
                (Craft Conscience), how often your mind drifts toward these technical problems outside formal work (Intrinsic Pull), and how effortlessly each
                skill feels for you (Felt Fluency). AI Resistance measures how hard it is for current AI systems to replicate this skill at your seniority
                level. Market Demand measures how much organizations are actively paying for humans who do this well. The three are multiplied together — so a
                high score requires all three, not just one.
              </p>
              <p style={{ fontSize: 14, color: "#9ca3af", fontStyle: "italic", margin: 0, lineHeight: 1.65 }}>
                The weights and calibration scores are based on published AI labor market research and our own survey of 450 professionals conducted March
                2026.
              </p>
            </div>

            {recsLoading ? (
              <div
                style={{
                  background: "#f8f9fc",
                  minHeight: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  fontFamily: S.font,
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: "@keyframes dzEngineerDots{0%,100%{opacity:0.25}50%{opacity:1}}",
                  }}
                />
                <div
                  style={{
                    fontFamily: S.mono,
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: S.gold,
                    marginBottom: 32,
                  }}
                >
                  DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
                </div>
                <h2
                  style={{
                    fontFamily: S.serif,
                    fontSize: 28,
                    color: S.text,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Building your action plan.
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "#6b7280",
                    maxWidth: 380,
                    textAlign: "center",
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  We&apos;re analyzing your scores against current AI labor market data and calibrating recommendations to your role and seniority. This takes a
                  few seconds.
                </p>
                <div style={{ display: "flex", gap: 10, marginTop: 32, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzEngineerDots 1s ease-in-out infinite" }}>.</span>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzEngineerDots 1s ease-in-out 0.2s infinite" }}>.</span>
                  <span style={{ fontSize: 36, color: S.gold, animation: "dzEngineerDots 1s ease-in-out 0.4s infinite" }}>.</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 40 }}>
                  <span
                    style={{
                      background: "white",
                      border: "1px solid #d0d7e8",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontSize: 13,
                      color: "#6b7280",
                      fontFamily: S.font,
                    }}
                  >
                    8 skills assessed
                  </span>
                  <span
                    style={{
                      background: "white",
                      border: "1px solid #d0d7e8",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontSize: 13,
                      color: "#6b7280",
                      fontFamily: S.font,
                    }}
                  >
                    AI market data: April 2026
                  </span>
                  <span
                    style={{
                      background: "white",
                      border: "1px solid #d0d7e8",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontSize: 13,
                      color: "#6b7280",
                      fontFamily: S.font,
                    }}
                  >
                    Calibrated to your seniority
                  </span>
                </div>
              </div>
            ) : recsError ? (
              <div style={{ textAlign: "center", maxWidth: 400, margin: "24px auto 28px" }}>
                <p style={{ color: S.red, fontSize: 16, margin: "0 0 20px" }}>{recsError}</p>
                <button
                  type="button"
                  onClick={function () {
                    fetchRecommendations(results || []);
                  }}
                  style={{
                    background: "#D97706",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 32px",
                    fontSize: 16,
                    fontFamily: S.font,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
              </div>
            ) : (
              (function () {
                var rawRecs =
                  recommendations && recommendations.recommendations ? recommendations.recommendations.slice() : [];
                var byId = {};
                rawRecs.forEach(function (r) {
                  byId[r.id] = r;
                });
                skills.forEach(function (s) {
                  if (rawRecs.length < 8 && !byId[s.id]) {
                    rawRecs.push({ id: s.id, headline: "", action: "", why: "" });
                    byId[s.id] = rawRecs[rawRecs.length - 1];
                  }
                });
                var recList = rawRecs.slice(0, 8);
                var PHASE_META = [
                  {
                    phase: 1,
                    label: "Phase 1 — Weeks 1–4 — Establish your position",
                    framing: "Start here because these actions require nothing beyond your own time and existing role — no buy-in, no setup, just execution.",
                  },
                  {
                    phase: 2,
                    label: "Phase 2 — Weeks 5–8 — Build visible authority",
                    framing: "These actions become available once you have momentum from Phase 1 — they require coordination, organizational standing, or others to notice you.",
                  },
                  {
                    phase: 3,
                    label: "Phase 3 — Weeks 9–12 — Compound and protect",
                    framing: "These are the moves that lock in what you built — longer-horizon actions that only land well after the earlier phases have created the conditions for them.",
                  },
                ];

                var groupedByPhase = PHASE_META.map(function (meta) {
                  return {
                    meta: meta,
                    recs: recList.filter(function (r) { return r.phase === meta.phase; }),
                  };
                }).filter(function (g) { return g.recs.length > 0; });

                var hasPhases = groupedByPhase.length > 1;

                var showAllRecs = tier >= 2 || promoUsed;
                var showUpsell = tier === 0 && !promoUsed;

                var rec59Url = (testModeApplied ? "https://buy.stripe.com/00weVd9Rg4YX1H7bc2dQQ0f" : "https://buy.stripe.com/6oU28rbZo9fd85vdkadQQ0e") + (discountApplied ? "?prefilled_promo_code=DZHALF" : "");

                var recFeatures = [
                  "All 8 personalized recommendations",
                  "Ranked by impact for your role",
                  "90-day action steps",
                  "Specific to your seniority and context",
                  "Downloadable PDF report",
                  "Share with a coach or manager",
                ];

                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ marginBottom: 28 }}>
                      <h2
                        style={{
                          fontFamily: S.serif,
                          fontSize: 28,
                          fontWeight: 600,
                          color: S.text,
                          margin: "0 0 10px",
                          lineHeight: 1.2,
                        }}
                      >
                        Your 90-Day Action Plan
                      </h2>
                      <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                        One specific action for each skill — ranked by what will move the needle most for a {profile3.seniorityLabel} {profile3.devLabel}{" "}
                        Engineer.
                      </p>
                    </div>

                    <div style={{ marginBottom: showUpsell ? 0 : 28 }}>
                      {(hasPhases ? groupedByPhase : [{ meta: null, recs: recList }]).map(function (group, groupIdx) {
                        return (
                          <div key={groupIdx}>
                            {group.meta && (
                              <div style={{
                                marginBottom: 20,
                                marginTop: groupIdx === 0 ? 0 : 48,
                                background: "linear-gradient(135deg, #1a1d2e 0%, #2d1f6e 100%)",
                                borderRadius: 14,
                                padding: "22px 24px",
                              }}>
                                <div style={{
                                  fontFamily: S.mono,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: "0.14em",
                                  color: "rgba(255,255,255,0.55)",
                                  textTransform: "uppercase",
                                  marginBottom: 8,
                                }}>
                                  {group.meta.label.split("—")[0].trim()}
                                </div>
                                <div style={{
                                  fontFamily: S.serif,
                                  fontSize: 22,
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  lineHeight: 1.2,
                                  marginBottom: 10,
                                }}>
                                  {group.meta.label.split("—").slice(1).join("—").trim()}
                                </div>
                                <div style={{
                                  fontSize: 14,
                                  color: "rgba(255,255,255,0.7)",
                                  lineHeight: 1.65,
                                  borderTop: "1px solid rgba(255,255,255,0.15)",
                                  paddingTop: 10,
                                  fontStyle: "italic",
                                }}>
                                  {group.meta.framing}
                                </div>
                              </div>
                            )}
                            {group.recs.map(function (rec, idx) {
                              var globalIdx = recList.indexOf(rec);
                              var skillRow = skillDZs.find(function (sd) { return sd.id === rec.id; });
                              var skillName = (skills.find(function (sk) { return sk.id === rec.id; }) || {}).text || rec.id;
                              var dzForBar = skillRow ? skillRow.dz : 0;
                              var barColor = dzBarColor(dzForBar);
                              var lockedBlur = !showAllRecs && globalIdx > 0;
                              return (
                                <div
                                  key={rec.id + "-" + globalIdx}
                                  style={{
                                    display: "flex",
                                    background: "#ffffff",
                                    border: "1px solid #d0d7e8",
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    overflow: "hidden",
                                    filter: lockedBlur ? "blur(5px)" : "none",
                                    userSelect: lockedBlur ? "none" : "auto",
                                    pointerEvents: lockedBlur ? "none" : "auto",
                                  }}
                                >
                                  <div style={{ width: 4, background: barColor, flexShrink: 0 }} />
                                  <div style={{ padding: "20px 22px", flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontFamily: S.mono,
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        color: "#6b7280",
                                        marginBottom: 8,
                                      }}
                                    >
                                      {skillName}
                                    </div>
                                    <div
                                      style={{
                                        fontFamily: S.serif,
                                        fontSize: 20,
                                        fontWeight: 600,
                                        color: S.text,
                                        lineHeight: 1.3,
                                        marginBottom: 10,
                                      }}
                                    >
                                      {rec.headline || "—"}
                                    </div>
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

                    {tier >= 2 || promoUsed ? (
                      <div style={{ marginTop: 20, marginBottom: 4, textAlign: "center" }} className="no-print">
                        <PDFButton contentId="dz-engineer-report" label="Save as PDF" />
                      </div>
                    ) : null}

                    {showUpsell ? (
                      <div
                        className="no-print"
                        style={{
                          background: "linear-gradient(135deg, #1a1d2e 0%, #2d1f5e 100%)",
                          borderRadius: 16,
                          padding: 28,
                          marginTop: 24,
                          marginBottom: 28,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: S.mono,
                            fontSize: 12,
                            color: S.gold,
                            letterSpacing: "0.1em",
                            marginBottom: 12,
                            fontWeight: 600,
                          }}
                        >
                          UNLOCK YOUR FULL ACTION PLAN
                        </div>
                        <h3
                          style={{
                            fontFamily: S.serif,
                            fontSize: 24,
                            fontWeight: 600,
                            color: "#ffffff",
                            margin: "0 0 12px",
                            lineHeight: 1.25,
                          }}
                        >
                          See exactly what to do next.
                        </h3>
                        <p style={{ fontSize: 15, color: "rgba(196, 181, 253, 0.85)", lineHeight: 1.65, margin: "0 0 24px" }}>
                          Your scores are ready. Your action plan is personalized to you as a {profile3.seniorityLabel} {profile3.devLabel} Engineer. Unlock all 8
                          recommendations plus a PDF you can keep.
                        </p>

                        <div style={{ background: "#ffffff", border: "2px solid " + S.gold, borderRadius: 12, padding: "20px 18px", marginBottom: 20 }}>
                          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>
                            FULL 90-DAY ACTION PLAN
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: S.text, lineHeight: 1, marginBottom: 4 }}>
                            {testModeApplied ? "$1.00" : "$59"}
                            <span style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 400, color: S.muted }}> one-time</span>
                          </div>
                          {testModeApplied ? (
                            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, marginTop: 4 }}>
                              TEST MODE ACTIVE
                            </div>
                          ) : null}
                          <div style={{ marginBottom: 16, marginTop: 10 }}>
                            {recFeatures.map(function (line) {
                              return (
                                <div key={line} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 6 }}>
                                  <span style={{ color: S.gold, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                                  <div style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.5 }}>{line}</div>
                                </div>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={function () { window.location.href = rec59Url; }}
                            style={{ background: S.gold, color: "#ffffff", border: "none", borderRadius: 10, padding: "14px 16px", fontSize: 15, fontFamily: S.font, fontWeight: 600, cursor: "pointer", width: "100%" }}
                          >
                            {testModeApplied ? "Pay $1.00 to Unlock →" : "Unlock Full Action Plan →"}
                          </button>
                        </div>

                        <div className="no-print" style={{ marginTop: 24 }}>
                          <div
                            style={{
                              fontFamily: S.mono,
                              fontSize: 12,
                              color: "rgba(255,255,255,0.75)",
                              letterSpacing: "0.08em",
                              marginBottom: 10,
                              fontWeight: 600,
                            }}
                          >
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
                                flex: "1 1 180px",
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
                              onClick={function () {
     var v = (promoCode || "").trim();
     var isFree = PROMO_CODES.some(function(c) { return c.toLowerCase() === v.toLowerCase(); });
     var isDiscount = DISCOUNT_CODES.some(function(c) { return c.toLowerCase() === v.toLowerCase(); });
     var isTest = TEST_CODES.some(function(c) { return c.toLowerCase() === v.toLowerCase(); });
     if (isFree) {
       setTier(2);
       setPromoUsed(true);
       setPromoError("");
     } else if (isDiscount) {
       setDiscountApplied(true);
       setPromoError("");
     } else if (isTest) {
       setTestModeApplied(true);
       setPromoError("");
     } else {
       setPromoError("That code isn't valid.");
     }
                              }}
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
                          {promoError ? (
                            <div style={{ color: S.red, fontSize: 14, marginTop: 8 }}>{promoError}</div>
                          ) : null}
                          {discountApplied ? (
                            <div style={{ color: "#059669", fontSize: 14, marginTop: 8 }}>50% discount applied! Click a button above to pay.</div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })()
            )}
          </div>

          <button
            onClick={resetAll}
            className="no-print"
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid " + S.border,
              color: S.muted,
              borderRadius: 12,
              padding: "15px 0",
              fontSize: 14,
              fontFamily: S.mono,
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            ← START OVER
          </button>

          <div
            style={{
              background: "#fef9ec",
              border: "1px solid #f0c060",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>
              IMPORTANT — PLEASE READ
            </div>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>
              This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment.
              Scores are estimates based on publicly available research and LLM calibration — not a definitive evaluation of your skills or employability.
            </div>
          </div>

          <DZFooter />
        </div>
      </div>
    );
  }

  return null;
}
