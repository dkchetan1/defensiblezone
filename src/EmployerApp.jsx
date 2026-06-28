import { useEffect, useState, useRef } from "react";
import { grantEmployerAccess, isEmployerAccessGranted } from "./EmployerEdition.js";

var LS = {
  bg: "#F5F2EE",
  text: "#1C1917",
  muted: "#6B6560",
  accent: "#2C5F5F",
  border: "#DDD9D3",
  card: "#FFFFFF",
  red: "#B91C1C",
  font: "'Inter',system-ui,sans-serif",
  serif: "'DM Serif Display','Playfair Display',Georgia,serif",
  mono: "'DM Mono','Courier New',monospace",
};

var ROLES = [
  "Software Engineer",
  "Product Manager",
  "Sales Professional",
  "UX Professional",
  "Finance Professional",
];

export default function EmployerApp() {
  var [hasAccess, setHasAccess] = useState(function () {
    return isEmployerAccessGranted();
  });
  var [selectedRole, setSelectedRole] = useState(null);
  var [accessCode, setAccessCode] = useState("");
  var [codeError, setCodeError] = useState("");

  useEffect(function () {
    var link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = LS.bg;
    document.body.style.margin = "0";
    return function () {
      document.body.style.background = "";
    };
  }, []);

  function handleCodeSubmit(e) {
    e.preventDefault();
    var trimmed = (accessCode || "").trim();
    if (!trimmed) {
      setCodeError("Please enter an access code.");
      return;
    }
    setCodeError("");
    grantEmployerAccess();
    setHasAccess(true);
  }

  var screen = !hasAccess ? "code" : selectedRole ? "flow" : "roles";

  return (
    <div style={{ background: LS.bg, minHeight: "100vh", fontFamily: LS.font, color: LS.text }}>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid " + LS.border, padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span style={{ fontFamily: LS.serif, fontSize: 18, fontWeight: 700, color: LS.text }}>
            Defensible Zone™
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a
              href="mailto:support@recursiolab.com"
              style={{
                fontFamily: LS.mono,
                fontSize: 12,
                color: LS.muted,
                textDecoration: "none",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              Questions &amp; Feedback →
            </a>
            <a
              href="https://defensiblezone.ai/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: LS.mono,
                fontSize: 12,
                color: LS.muted,
                textDecoration: "none",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              Privacy Policy →
            </a>
          </div>
        </div>
      </div>

      {screen === "flow" && selectedRole === "Software Engineer" ? (
        <EngineerFlow />
      ) : screen === "flow" && selectedRole === "Product Manager" ? (
        <ProductManagerFlow />
      ) : (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "72px 24px 48px" }}>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, letterSpacing: "0.12em", marginBottom: 12, fontWeight: 600 }}>
          EMPLOYER EDITION
        </div>
        <h1 style={{ fontFamily: LS.serif, fontSize: 36, fontWeight: 600, margin: "0 0 12px", lineHeight: 1.15 }}>
          {screen === "code" ? "Enter your access code" : screen === "roles" ? "Choose a role" : selectedRole}
        </h1>
        {screen !== "flow" ? (
          <p style={{ color: LS.muted, fontSize: 16, lineHeight: 1.65, margin: "0 0 32px" }}>
            {screen === "code"
              ? "Use the code provided by your organization to access the assessment."
              : "Select the assessment your team member should complete."}
          </p>
        ) : null}

        {screen === "code" ? (
          <form onSubmit={handleCodeSubmit}>
            <label
              htmlFor="employer-access-code"
              style={{ display: "block", fontFamily: LS.mono, fontSize: 11, color: LS.muted, letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}
            >
              ACCESS CODE
            </label>
            <input
              id="employer-access-code"
              type="text"
              value={accessCode}
              onChange={function (e) {
                setAccessCode(e.target.value);
                if (codeError) setCodeError("");
              }}
              placeholder="Enter code"
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: LS.card,
                border: "1px solid " + (codeError ? LS.red : LS.border),
                borderRadius: 10,
                padding: "14px 16px",
                fontSize: 16,
                fontFamily: LS.mono,
                color: LS.text,
                outline: "none",
                marginBottom: codeError ? 8 : 20,
              }}
            />
            {codeError ? (
              <div style={{ color: LS.red, fontSize: 14, marginBottom: 16 }}>{codeError}</div>
            ) : null}
            <button
              type="submit"
              style={{
                width: "100%",
                background: LS.accent,
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "14px 20px",
                fontSize: 15,
                fontFamily: LS.mono,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              CONTINUE
            </button>
          </form>
        ) : screen === "roles" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ROLES.map(function (label) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={function () {
                    setSelectedRole(label);
                  }}
                  style={{
                    textAlign: "left",
                    background: LS.card,
                    border: "1px solid " + LS.border,
                    borderRadius: 12,
                    padding: "18px 20px",
                    fontSize: 17,
                    fontFamily: LS.font,
                    fontWeight: 600,
                    color: LS.text,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <p style={{ color: LS.muted, fontSize: 16, lineHeight: 1.65, margin: "0 0 24px" }}>
              {selectedRole} flow goes here
            </p>
            <button
              type="button"
              onClick={function () {
                setSelectedRole(null);
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 15,
                fontFamily: LS.font,
                color: LS.accent,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ← Back to role picker
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}


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

// ── MATH ───────────────────────────────────────────────────────────────
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

// ── MAIN APP ───────────────────────────────────────────────────────────
function EngineerFlow() {
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
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var effectivelyVerified = gateVerified || isEmployerAccessGranted();
  var [gateError, setGateError] = useState("");
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [manualEmailSent, setManualEmailSent] = useState(false);
  var [manualEmailInput, setManualEmailInput] = useState("");
  var [manualEmailError, setManualEmailError] = useState("");
  var [manualEmailLoading, setManualEmailLoading] = useState(false);
  var [resumeFileName, setResumeFileName] = useState("");
  var [resumeText, setResumeText] = useState("");
  var [resumeUploading, setResumeUploading] = useState(false);
  var [resumeUploadError, setResumeUploadError] = useState("");
  var resumeInputRef = useRef(null);

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
            var expired = false;
            try {
              var s = JSON.parse(savedRaw);
              if (!s.savedAt || (Date.now() - s.savedAt) > 14 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem("dz_saved_report_engineer");
                expired = true;
              } else {
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
              }
            } catch (e) {}
            if (expired) {
              setStep(0);
              setGateOnDifferentDevice(true);
            } else {
              if (data.email) setGateEmail(data.email);
              setGateVerified(true);
              setStep(3);
            }
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
      if (step === 3 && effectivelyVerified === true && skills.length > 0) {
        runAnalysis();
      }
    },
    [step, effectivelyVerified, skills]
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

  useEffect(function() {
    if (results && !recommendations && !recsLoading && devType && seniority) {
      fetchRecommendations(results);
    }
  }, [results, devType, seniority]);

  useEffect(function() {
    if (!recommendations) return;
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
  }, [recommendations]);

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
    setError(null);
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

  var canProceed = devType !== "" && seniority !== "" && workContexts.length > 0 && (devType !== "other" || devTypeOther.trim() !== "");

  function clearResumeInput() {
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  }

  function removeResume() {
    setResumeFileName("");
    setResumeText("");
    setResumeUploadError("");
    clearResumeInput();
  }

  function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        var result = reader.result;
        var comma = typeof result === "string" ? result.indexOf(",") : -1;
        resolve(comma !== -1 ? result.slice(comma + 1) : "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleResumeFileSelect(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;

    setResumeUploadError("");

    var lowerName = file.name.toLowerCase();
    var validExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");
    if (!validExt) {
      setResumeUploadError("Only PDF and DOCX files are supported.");
      clearResumeInput();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError("File is too large. Please upload a file under 5MB.");
      clearResumeInput();
      return;
    }

    setResumeUploading(true);
    try {
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
        setResumeUploadError(
          (data && data.error) ||
          "Something went wrong reading this file — you can continue without it, or try again."
        );
        setResumeUploading(false);
        clearResumeInput();
        return;
      }

      if (data.extractable === false || !data.text || !String(data.text).trim()) {
        setResumeText("");
        setResumeFileName("");
        setResumeUploadError(
          "We couldn't read text from this file — you can continue without it, or try a different file."
        );
        setResumeUploading(false);
        clearResumeInput();
        return;
      }

      setResumeText(data.text);
      setResumeFileName(file.name);
      setResumeUploadError("");
      setResumeUploading(false);
      clearResumeInput();
    } catch (err) {
      setResumeUploadError(
        "Something went wrong reading this file — you can continue without it, or try again."
      );
      setResumeUploading(false);
      clearResumeInput();
    }
  }

  // ── API CALL 1 ────────────────────────────────────────────────────────
  async function fetchLandscapeAndSkills() {
    if (!canProceed) return;
    setLoading(true); setLoadingMsg("Reading your engineering landscape…"); setError(null);
    var profile = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var sl = SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
    var prompt = "You are a senior engineering career strategist specializing in AI labor market analysis for software engineers.\n\nENGINEER PROFILE:\n- Type: " + profile.devLabel + " Engineer\n- Seniority: " + profile.seniorityLabel + " — " + (sl ? sl.note : "") + "\n- Work context: " + wcStr + "\n- Company: " + (profile.companyLabel || "not specified") + "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about the AI threat to this exact engineer profile RIGHT NOW (April 2026). Name specific tools (GitHub Copilot, Cursor, Devin, Claude, Gemini Code Assist), specific tasks being automated, and where the real exposure is at this seniority level doing this work. Do not write generic AI commentary — be specific to this combination.\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a " + profile.seniorityLabel + " " + profile.devLabel + " Engineer working on " + wcStr + " to assess for AI defensibility right now. Be precise — not 'coding' but 'designing distributed transaction systems across eventual consistency boundaries'. Include a realistic mix: some that are defensible and some genuinely at risk. Weight toward skills that actually differentiate at the " + profile.seniorityLabel + " level, not junior-level skills.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";
    try {
      var res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || data.error_description || "API error: " + JSON.stringify(data));
      var raw = data.content.map(function(b) { return b.text||""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      var loaded = parsed.skills.map(function(text, i) { return {id:"s"+i,text:text,editing:false}; });
      setLandscape(parsed.landscape);
      setSkills(loaded);
      setFluencies({});
      setAdjustedSkills(new Set());
      adjustedSkillsRef.current = new Set();
      setStep(1);
    } catch(e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function(r) { setTimeout(r, 2000); });
        try {
          var res2 = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(typeof data2.error === "object" ? JSON.stringify(data2) : (data2.error || JSON.stringify(data2)));
          var raw2 = data2.content.map(function(b) { return b.text||""; }).join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          var loaded2 = parsed2.skills.map(function(text, i) { return {id:"s"+i,text:text,editing:false}; });
          setLandscape(parsed2.landscape);
          setSkills(loaded2);
          setFluencies({});
          setAdjustedSkills(new Set());
          adjustedSkillsRef.current = new Set();
          setStep(1);
        } catch(e2) { setError("Something went wrong — please try again in a moment."); }
      } else { setError("Something went wrong — please try again in a moment."); }
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

  async function handleManualEmailCopy() {
    if (!recommendations) {
      setManualEmailError("Your full report is still being prepared — please try again in a few seconds.");
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
      var prof = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
      var res = await fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          product: "engineer",
          type: "paid",
          results: {
            profile: { roleLabel: prof.devLabel + " Engineer", seniorityLabel: prof.seniorityLabel },
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
    try {
      var res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:2000, messages:[{role:"user",content:prompt}] })
      });
      var data = await res.json();
      if (!data.content) throw new Error(data.error || data.error_description || "API error: " + JSON.stringify(data));
      var raw = data.content.map(function(b) { return b.text||""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      var enriched = parsed.skills.map(function(skill, i) {
        var found = skills.find(function(s) { return s.text===skill.name; }) || skills.find(function(s) { return skill.name.indexOf(s.text.slice(0,20))!==-1; });
        var id = found ? found.id : ("s" + i);
        var fluencyVal = found && fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
        var dz  = calcDZ(aff, skill.ai_replaceability, skill.market_demand);
        return Object.assign({}, skill, { id: id, naturalAffinity:aff, investment:fluencyVal, affinity:aff, dz:dz });
      });
      setBenchmark(parsed.benchmark);
      setResults(enriched);
      setStep(4);
      try {
        localStorage.setItem("dz_saved_report_engineer", JSON.stringify({
          step: 3, devType, gateEmail, seniority, workContexts, customContexts: [],
          companyType, skills, conscience, pull, fluencies,
          benchmark: parsed.benchmark, results: enriched,
          savedAt: Date.now()
        }));
      } catch (_e) {}
      fetchRecommendations(enriched);
    } catch(e) {
      if (e.message && e.message.indexOf("overloaded") !== -1) {
        await new Promise(function(r) { setTimeout(r, 2000); });
        try {
          var res2 = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:2000, messages:[{role:"user",content:prompt}] }) });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(typeof data2.error === "object" ? JSON.stringify(data2) : (data2.error || JSON.stringify(data2)));
          var raw2 = data2.content.map(function(b) { return b.text||""; }).join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          var enriched2 = parsed2.skills.map(function(skill, i) {
            var found2 = skills.find(function(s) { return s.text===skill.name; }) || skills.find(function(s) { return skill.name.indexOf(s.text.slice(0,20))!==-1; });
            var id2 = found2 ? found2.id : ("s" + i);
            var fluencyVal2 = found2 && fluencies[id2] !== undefined ? fluencies[id2] : getSeed(conscience, pull);
            var aff2 = compAff(conscience, pull, fluencyVal2);
            var dz2  = calcDZ(aff2, skill.ai_replaceability, skill.market_demand);
            return Object.assign({}, skill, { id: id2, naturalAffinity:aff2, investment:fluencyVal2, affinity:aff2, dz:dz2 });
          });
          setBenchmark(parsed2.benchmark);
          setResults(enriched2);
          setStep(4);
          try {
            localStorage.setItem("dz_saved_report_engineer", JSON.stringify({
              step: 3, devType, gateEmail, seniority, workContexts, customContexts,
              companyType, skills, conscience, pull, fluencies,
              benchmark: parsed2.benchmark, results: enriched2,
              savedAt: Date.now()
            }));
          } catch (_e) {}
          fetchRecommendations(enriched2);
        } catch(e2) { setError("Analysis failed — please try again in a moment."); }
      } else { setError("Analysis failed — please try again in a moment."); }
    }
    finally { setLoading(false); }
  }

  // ── LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{background:S.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:S.font,padding:"32px 20px",boxSizing:"border-box"}}>
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
  <style dangerouslySetInnerHTML={{__html:"@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .reveal{animation:fadeSlide 0.25s ease-out both;}"}} />
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

          {/* ── SECTION 5: Resume — optional, after company context ── */}
          {contextsReady && (
            <Card style={{marginBottom:12}} className="reveal">
              <Label style={{marginBottom:8}}>
                RESUME <span style={{color:S.dim,fontWeight:400,textTransform:"none"}}>— optional — upload to personalize your skill list</span>
              </Label>
              {resumeText ? (
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:S.mono,fontSize:12,color:S.green,fontWeight:700}}>✓ {resumeFileName}</span>
                  <button
                    type="button"
                    onClick={removeResume}
                    style={{background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:S.mono,fontSize:12,color:S.dim,textDecoration:"underline"}}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeFileSelect}
                    disabled={resumeUploading}
                    style={{...inputStyle, padding:"10px 12px", fontSize:14}}
                  />
                  {resumeUploading && (
                    <p style={{color:S.muted,fontSize:14,margin:"8px 0 0",fontFamily:S.mono}}>Reading your resume…</p>
                  )}
                </div>
              )}
              {resumeUploadError && (
                <p style={{color:S.muted,fontSize:14,margin:"8px 0 0",lineHeight:1.5}}>{resumeUploadError}</p>
              )}
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
      </div>
    );
  }

  // ── STEP 1: SKILLS ─────────────────────────────────────────────────────
  if (step === 1) {
    var profile1 = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    return (
      <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"32px 20px"}}>
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
              <div style={{fontFamily:S.mono,fontSize:12,color:skills.length>=8?S.red:S.dim,fontWeight:700}}>{skills.length} / 8</div>
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
    var dzSliderCSS = "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";
    return (
      <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"32px 20px"}}>
        <style dangerouslySetInnerHTML={{__html:dzSliderCSS}} />
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
                  fluencies,
                  savedAt: Date.now()
                }));
              } catch (_e) {}
              setStep(3);
            }} disabled={skills.length===0} style={{flex:3}}>ANALYZE MY DEFENSIBLE ZONE™ →</PrimaryBtn>
          </div>
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

    if (effectivelyVerified) {
      return (
        <div style={fullScreenCenter}>
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
        </div>
      );
    }

    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    return (
      <div style={formShell}>
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

                    <div style={{ marginBottom: 28 }}>
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
                              return (
                                <div
                                  key={rec.id + "-" + globalIdx}
                                  style={{
                                    display: "flex",
                                    background: "#ffffff",
                                    border: "1px solid #d0d7e8",
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    overflow: "hidden"
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

          {manualEmailSent || !gateEmail || !gateEmail.trim() ? (
            <div
              className="no-print"
              style={{
                background: "#ffffff",
                border: "1px solid #d0d7e8",
                borderRadius: 14,
                padding: "24px 22px",
                marginBottom: 28,
              }}
            >
              {manualEmailSent ? (
                <div style={{ fontSize: 15, color: S.green, lineHeight: 1.6, textAlign: "center" }}>
                  ✓ Sent — check your inbox for a copy of your results.
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontFamily: S.serif,
                      fontSize: 22,
                      fontWeight: 600,
                      color: S.text,
                      marginBottom: 10,
                      lineHeight: 1.25,
                    }}
                  >
                    Want a copy of this?
                  </div>
                  <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.65, margin: "0 0 18px" }}>
                    This report only lives in this browser tab right now. If you&apos;d like it saved somewhere you can find later, enter your email below and
                    we&apos;ll send you a copy — it&apos;s never shared with your employer.
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={manualEmailInput}
                    disabled={manualEmailLoading}
                    onChange={function (e) {
                      setManualEmailInput(e.target.value);
                      if (manualEmailError) setManualEmailError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: 16,
                      fontFamily: S.font,
                      border: "1px solid " + S.border,
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#ffffff",
                      color: S.text,
                    }}
                  />
                  {manualEmailError ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{manualEmailError}</div> : null}
                  <button
                    type="button"
                    onClick={handleManualEmailCopy}
                    disabled={manualEmailLoading}
                    style={{
                      width: "100%",
                      padding: 14,
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: S.font,
                      background: manualEmailLoading ? "#e5a820" : S.gold,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      cursor: manualEmailLoading ? "not-allowed" : "pointer",
                      marginTop: 12,
                    }}
                  >
                    {manualEmailLoading ? "Sending…" : "Email me a copy"}
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
var PM_SENIORITY_LEVELS = [
  { id:"apm",      label:"APM / Associate PM",   note:"Feature-level work, mentored" },
  { id:"pm",       label:"Product Manager",      note:"End-to-end feature ownership" },
  { id:"senior",   label:"Senior PM",            note:"Product area ownership, strategic input" },
  { id:"staff",    label:"Staff / Principal PM", note:"Cross-org influence, framework-setter" },
  { id:"gpm",      label:"Group PM / Lead PM",   note:"Multiple products, some people management" },
  { id:"director", label:"Director of Product",  note:"Full product org, strategy, hiring" },
  { id:"vp",       label:"VP of Product",        note:"Company-level vision, P&L" },
  { id:"cpo",      label:"CPO",                  note:"C-suite, everything product" },
];

// ── COMPANY TYPES ───────────────────────────────────────────────────
var PM_COMPANY_TYPES = [
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
var PM_WORK_CONTEXTS = [
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
var PM_CONTEXT_MAP = {
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

// ── PM SCORING HELPERS ───────────────────────────────────────────────
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
function buildPMProfile(pmType, seniority, workContexts, companyType) {
  var pt = PM_TYPES.find(function(p) { return p.id === pmType; });
  var sl = PM_SENIORITY_LEVELS.find(function(s) { return s.id === seniority; });
  var ct = PM_COMPANY_TYPES.find(function(c) { return c.id === companyType; });
  var wcLabels = workContexts.map(function(id) {
    var w = PM_WORK_CONTEXTS.find(function(x) { return x.id === id; });
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

var PM_DISCLAIMER =
  "This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment. Scores are estimates based on publicly available research and LLM calibration — not a definitive evaluation of your skills or employability.";

function PMDisclaimer() {
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
      <div style={{ fontFamily: S.mono, fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>
        IMPORTANT — PLEASE READ
      </div>
      <div style={{ fontFamily: S.mono, fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>{PM_DISCLAIMER}</div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────
function ProductManagerFlow() {
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
  var [gateEmail, setGateEmail]             = useState("");
  var [gateSent, setGateSent]               = useState(false);
  var [gateVerified, setGateVerified]       = useState(false);
  var effectivelyVerified = gateVerified || isEmployerAccessGranted();
  var [gateError, setGateError]             = useState("");
  var [gateLoading, setGateLoading]         = useState(false);
  var [showResend, setShowResend]           = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [manualEmailSent, setManualEmailSent] = useState(false);
  var [manualEmailInput, setManualEmailInput] = useState("");
  var [manualEmailError, setManualEmailError] = useState("");
  var [manualEmailLoading, setManualEmailLoading] = useState(false);

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
      if (step === 0) return;
      if (!effectivelyVerified) return;
      if (skills.length > 0 || loading) return;
      fetchLandscapeAndSkills();
    },
    [effectivelyVerified, pmType, seniority, workContexts, step]
  );





  useEffect(
    function () {
      if (!results || !results.skills || results.skills.length === 0) return;
      if (recommendations || recsLoading) return;
      fetchRecommendations();
    },
    [results]
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
            var expired = false;
            try {
              var s = JSON.parse(savedRaw);
              if (!s.savedAt || Date.now() - s.savedAt > 14 * 24 * 60 * 60 * 1000) {
                expired = true;
                localStorage.removeItem("dz_saved_report_pm");
              } else {
                if (s.pmType) setPmType(s.pmType);
                if (s.seniority) setSeniority(s.seniority);
                if (s.companyType) setCompanyType(s.companyType);
                if (s.workContexts) setWorkContexts(s.workContexts);
                if (s.conscience !== undefined) setConscience(s.conscience);
                if (s.pull !== undefined) setPull(s.pull);
                if (s.gateEmail) setGateEmail(s.gateEmail);
              }
            } catch (e) {}
            if (expired) {
              setStep(1);
              setGateOnDifferentDevice(true);
            } else {
              if (data.email) setGateEmail(data.email);
              setGateVerified(true);
              setStep(2);
            }
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
            savedAt: Date.now(),
          })
        );
      } catch (_e) {}
    },
    [step, pmType, seniority, companyType, workContexts, conscience, pull, gateEmail]
  );

  useEffect(function() {
    if (!pmType) return;
    var allowed = PM_CONTEXT_MAP[pmType];
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
    if (!pmType || showAllCtx) return PM_WORK_CONTEXTS;
    var allowed = PM_CONTEXT_MAP[pmType] || [];
    return PM_WORK_CONTEXTS.filter(function(wc) { return allowed.indexOf(wc.id) !== -1; });
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

  async function handleManualEmailCopy() {
    if (!recommendations) {
      setManualEmailError("Your full report is still being prepared — please try again in a few seconds.");
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
      var skillsList = Array.isArray(results.skills) ? results.skills : [];
      var res = await fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
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
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateEmail(trimmed);
      paidEmailSentRef.current = true;
      freeEmailSentRef.current = true;
      setManualEmailSent(true);
    } catch (e) {
      setManualEmailError("Something went wrong. Please try again.");
    } finally {
      setManualEmailLoading(false);
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
    setGateEmail(""); setGateSent(false); setGateVerified(false); setGateError("");
    setGateLoading(false); setShowResend(false); setGateOnDifferentDevice(false); setGateInputFocused(false);
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
      if (!recommendations) return;
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
    [recommendations]
  );



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

  var skillStepBarPct = (3 / 6) * 100;
  var scoreStepBarPct = (4 / 6) * 100;
  var resultsStepBarPct = (5 / 6) * 100;
  
  async function fetchLandscapeAndSkills() {
    if (!canProceed) return;
    setLoading(true);
    setLoadingMsg(PM_LOADING_MSGS[0]);
    setError(null);
    var profile = buildPMProfile(pmType, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var sl = PM_SENIORITY_LEVELS.find(function (s) {
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
    var profile = buildPMProfile(pmType, seniority, workContexts, companyType);
    var wcStr = profile.workContextLabels.join(", ");
    var skillSummary = skills
      .map(function (s, i) {
        var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
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
        var aff = compAff(conscience, pull, fluencyVal);
        var aiR = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
        var mkt = typeof scored.market_demand === "number" ? scored.market_demand : 7;
        var dz = calcDZ(aff, aiR, mkt);
        return {
          id: id,
          text: found ? found.text : scored.name,
          name: found ? found.text : scored.name,
          conscience: conscience,
          pull: pull,
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
            var aff2 = compAff(conscience, pull, fluencyVal2);
            var aiR2 = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
            var mkt2 = typeof scored.market_demand === "number" ? scored.market_demand : 7;
            var dz2 = calcDZ(aff2, aiR2, mkt2);
            return {
              id: id2,
              text: found2 ? found2.text : scored.name,
              name: found2 ? found2.text : scored.name,
              conscience: conscience,
              pull: pull,
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
    var profile = results.profile || buildPMProfile(pmType, seniority, workContexts, companyType);
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
      >        <style
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
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>        </div>
      </div>
    );
  }

  var visibleCtx = getVisibleContexts();
  var hiddenCount = PM_WORK_CONTEXTS.length - visibleCtx.length;
  var progressPct = ((step + 1) / 6) * 100;

  if (error && (step === 1 || step === 2 || step === 3)) {
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
      >        <div style={{ maxWidth: 680, margin: "0 auto" }}>
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
          </button>        </div>
      </div>
    );
  }

  if (loading || (step === 1 && effectivelyVerified)) {
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
      >        <style
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
          </div>        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>        <style
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
              {PM_SENIORITY_LEVELS.map(function (sl) {
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

          <Card style={{ marginBottom: 12 }}>
            <Label>WHERE DO YOU WORK?</Label>
            <div className="pm-sel-grid">
              {PM_COMPANY_TYPES.map(function (ct) {
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
          </PrimaryBtn>        </div>
      </div>
    );
  }

  if (step === 1 && !effectivelyVerified) {
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
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>        <style
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

          {!gateOnDifferentDevice && !showExpiredInvalid ? (
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
          ) : null}

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
                BEGIN ON THIS DEVICE
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
          </button>        </div>
      </div>
    );
  }

  if (step === 3) {
    var profile3 = buildPMProfile(pmType, seniority, workContexts, companyType);
    var affinityStops = [0, 3, 5, 7, 10];
    var conscienceLabelTexts = ["Move on easily", "Mildly bothered", "Somewhat unsettled", "Want to fix it", "Can't let it go"];
    var pullLabelTexts = ["Almost never", "Occasionally", "Sometimes", "Regularly", "Constantly"];
    var dzSliderCSS =
      "input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none} input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].dz-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed} input[type=range].conscience-sl::-moz-range-thumb{background:#7c3aed} input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2} input[type=range].pull-sl::-moz-range-thumb{background:#0891b2} input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer} input[type=range].fluency-sl::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}";
    var landscapeSummary = profile3.seniorityLabel + " " + profile3.pmLabel;
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>        <style dangerouslySetInnerHTML={{ __html: dzSliderCSS }} />
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

          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>
            PART 1 — ABOUT YOU IN GENERAL
          </div>
          <div style={{ fontSize: 15, color: "#7a88a8", marginBottom: 24 }}>Answer these once. They apply across all your skills.</div>
          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em" }}>CRAFT CONSCIENCE</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              When you ship a product decision you know isn&apos;t quite right — a shortcut, a compromise forced by stakeholders, a feature you knew wouldn&apos;t serve users — how does that sit with you?
            </p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              This tells us whether you genuinely care about product quality independent of whether anyone noticed or measured it.
            </p>
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
              style={{ background: "linear-gradient(to right, #7c3aed " + (conscience / 10) * 100 + "%, #d0d7e8 " + (conscience / 10) * 100 + "%)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {affinityStops.map(function (stopValue, idx) {
                return (
                  <div
                    key={stopValue}
                    style={{
                      width: "20%",
                      textAlign: "center",
                      fontSize: 12,
                      color: "#7c3aed",
                      opacity: Math.abs(conscience - stopValue) <= 1 ? 1 : 0.25,
                      fontWeight: Math.abs(conscience - stopValue) <= 1 ? 700 : 400,
                    }}
                  >
                    {conscienceLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: S.card, border: "1px solid #d0d7e8", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0891b2", flexShrink: 0 }} />
              <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#0891b2", letterSpacing: "0.08em" }}>PULL</span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              Outside of work hours — do you find yourself thinking about product problems, user needs, or market dynamics?
            </p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              This measures intrinsic drive. It separates PMs who are doing a job from those who can&apos;t stop thinking about the work.
            </p>
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
              style={{ background: "linear-gradient(to right, #0891b2 " + (pull / 10) * 100 + "%, #d0d7e8 " + (pull / 10) * 100 + "%)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              {affinityStops.map(function (stopValue, idx) {
                return (
                  <div
                    key={stopValue}
                    style={{
                      width: "20%",
                      textAlign: "center",
                      fontSize: 12,
                      color: "#0891b2",
                      opacity: Math.abs(pull - stopValue) <= 1 ? 1 : 0.25,
                      fontWeight: Math.abs(pull - stopValue) <= 1 ? 700 : 400,
                    }}
                  >
                    {pullLabelTexts[idx]}
                  </div>
                );
              })}
            </div>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #d0d7e8", margin: "32px 0" }} />
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>
            PART 2 — SKILL BY SKILL
          </div>
          <div style={{ fontSize: 15, color: "#7a88a8", lineHeight: 1.6, marginBottom: 8 }}>
            For each skill — does doing this work feel natural and easy, or does it take real effort?
          </div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>
            Sliders are pre-set based on your answers above. Only move one if a skill feels noticeably different from your usual pattern.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {skills.map(function (s) {
              var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              var affinityScore = compAff(conscience, pull, fluencyVal);
              var affinityColor = affinityScore >= 7 ? S.green : affinityScore >= 5 ? S.gold : S.red;
              var fluencyForGrad = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
              return (
                <div
                  key={s.id}
                  style={{
                    background: S.card,
                    border: "1px solid #d0d7e8",
                    borderRadius: 12,
                    padding: "18px 22px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: S.text, flex: 1, lineHeight: 1.4 }}>{s.text}</span>
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
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontFamily: S.mono,
                        flexShrink: 0,
                        background: adjustedSkills.has(s.id) ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.10)",
                        color: adjustedSkills.has(s.id) ? "#d97706" : "#059669",
                      }}
                    >
                      {adjustedSkills.has(s.id) ? "adjusted" : "pre-seeded"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>FELT FLUENCY</span>
                    <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#d97706" }}>{fluencyForGrad}/10</span>
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
                    style={{ background: "linear-gradient(to right, #d97706 " + (fluencyForGrad / 10) * 100 + "%, #d0d7e8 " + (fluencyForGrad / 10) * 100 + "%)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Effortful</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Frictionless</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>AFFINITY SCORE</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: affinityColor }}>{affinityScore}</span>
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
          </PrimaryBtn>        </div>
      </div>
    );
  }

  // ── STEP 4: FREE RESULTS ─────────────────────────────────────────────
  if (step === 4 && results) {
    var profileRes = results.profile || buildPMProfile(pmType, seniority, workContexts, companyType);
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
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "40px 20px", boxSizing: "border-box" }}>        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              {recommendations && recommendations.recommendations ? "COMPLETE — YOUR RESULTS & PLAN" : recsLoading ? "BUILDING YOUR PLAN" : "YOUR RESULTS"}
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

            {recsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <style dangerouslySetInnerHTML={{ __html: "@keyframes dzPMLoadDots{0%,100%{opacity:0.25}50%{opacity:1}}" }} />
                <div style={{ fontFamily: S.serif, fontSize: 22, fontStyle: "italic", color: S.text, lineHeight: 1.45, marginBottom: 12 }}>{loadingMsg}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, fontFamily: S.mono, fontSize: 22, color: S.dim }}>
                  <span style={{ animation: "dzPMLoadDots 1s ease-in-out infinite" }}>.</span>
                  <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.2s infinite" }}>.</span>
                  <span style={{ animation: "dzPMLoadDots 1s ease-in-out 0.4s infinite" }}>.</span>
                </div>
              </div>
            ) : recsError ? (
              <Card style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{recsError}</p>
                <PrimaryBtn onClick={fetchRecommendations}>TRY AGAIN</PrimaryBtn>
              </Card>
            ) : recommendations && recommendations.recommendations ? (
              (function () {
                var rawRecs = recommendations.recommendations.slice();
                var PHASE_HEADERS = [
                  { phase: 1, label: "WEEKS 1–4 — START NOW" },
                  { phase: 2, label: "WEEKS 5–8 — BUILD ON IT" },
                  { phase: 3, label: "WEEKS 9–12 — STRUCTURAL MOVES" },
                ];
                return (
                  <div>
                    <p style={{ color: S.dim, fontSize: 16, lineHeight: 1.7, margin: "0 0 24px" }}>
                      Here is exactly what to do — sequenced by what you can start now.
                    </p>
                    {PHASE_HEADERS.map(function (ph) {
                      var phaseRecs = rawRecs.filter(function (r) { return r.phase === ph.phase; });
                      if (phaseRecs.length === 0) return null;
                      return (
                        <div key={ph.phase} style={{ marginBottom: 32 }}>
                          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 14 }}>
                            {ph.label}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {phaseRecs.map(function (rec, idx) {
                              return (
                                <div
                                  key={(rec.id || "rec") + "-" + idx}
                                  style={{ background: S.card, border: "1px solid " + S.border, borderRadius: 12, padding: "20px 22px", position: "relative" }}
                                >
                                  <div style={{ position: "absolute", top: 14, right: 14, fontFamily: S.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: S.gold, background: S.card2, border: "1px solid " + S.border, borderRadius: 6, padding: "4px 8px" }}>
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
                  </div>
                );
              })()
            ) : null}
          </div>

          <div
            style={{ background: S.card2,
              border: "1px solid " + S.border,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, margin: 0, lineHeight: 1.6 }}>
              {recommendations && recommendations.recommendations ? "A copy of this plan has been sent to " : "A copy of these results has been sent to "}{gateEmail || "your email"}
            </p>
          </div>


          {(!gateEmail || !gateEmail.trim() || manualEmailSent) ? (
            <div
              className="no-print"
              style={{
                background: S.card2,
                border: "1px solid " + S.border,
                borderRadius: 12,
                padding: "24px 22px",
                marginBottom: 28,
              }}
            >
              {manualEmailSent ? (
                <div style={{ fontSize: 15, color: S.green, lineHeight: 1.6, textAlign: "center" }}>
                  ✓ Sent — check your inbox for a copy of your results.
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 600, color: S.text, marginBottom: 10, lineHeight: 1.25 }}>
                    Want a copy of this?
                  </div>
                  <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.65, margin: "0 0 18px" }}>
                    This report only lives in this browser tab right now. If you&apos;d like it saved somewhere you can find later, enter your email below and
                    we&apos;ll send you a copy — it&apos;s never shared with your employer.
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={manualEmailInput}
                    disabled={manualEmailLoading}
                    onChange={function (e) {
                      setManualEmailInput(e.target.value);
                      if (manualEmailError) setManualEmailError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: 16,
                      fontFamily: S.font,
                      border: "1px solid " + S.border,
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#ffffff",
                      color: S.text,
                    }}
                  />
                  {manualEmailError ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{manualEmailError}</div> : null}
                  <button
                    type="button"
                    onClick={handleManualEmailCopy}
                    disabled={manualEmailLoading}
                    style={{
                      width: "100%",
                      padding: 14,
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: S.font,
                      background: manualEmailLoading ? "#e5a820" : S.gold,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      cursor: manualEmailLoading ? "not-allowed" : "pointer",
                      marginTop: 12,
                    }}
                  >
                    {manualEmailLoading ? "Sending…" : "Email me a copy"}
                  </button>
                </div>
              )}
            </div>
          ) : null}

                    <PMDisclaimer />
        </div>
      </div>
    );
  }


  return null;
}
