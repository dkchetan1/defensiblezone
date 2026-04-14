import { useState, useEffect, useRef } from "react";
import EmailGate from "./EmailGate";

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

// ── SOURCES ────────────────────────────────────────────────────────────
var SOURCES = [
  { id:"S1", label:"GitHub / Microsoft Copilot Research", cite:"Ziegler et al. (2022). Productivity Assessment of Neural Code Completion. MAPS '22. Kalliamvakou, E. (2022). Research: Quantifying GitHub Copilot's impact on developer productivity and happiness. GitHub Blog." },
  { id:"S2", label:"Stack Overflow Developer Survey 2024", cite:"Stack Overflow. (2024). Developer Survey 2024: AI tool adoption by role, language, and seniority. stackoverflow.com/research/developer-survey" },
  { id:"S3", label:"McKinsey Global Institute (2023)", cite:"McKinsey & Company. (2023). The economic potential of generative AI: The next productivity frontier. McKinsey Global Institute." },
  { id:"S4", label:"Goldman Sachs (2023)", cite:"Goldman Sachs. (2023). Generative AI: Too much spend, too little benefit? Global Investment Research. Goldman Sachs Economics Research." },
  { id:"S5", label:"WEF Future of Jobs Report 2025", cite:"World Economic Forum. (2025). Future of Jobs Report 2025. World Economic Forum, Geneva." },
  { id:"S6", label:"BLS Occupational Outlook Handbook", cite:"U.S. Bureau of Labor Statistics. (2024). Occupational Outlook Handbook: Software Developers, QA Analysts, and Testers. bls.gov/ooh/computer-and-information-technology" },
  { id:"S7", label:"METR / RAND AI Capability Evals (2024–25)", cite:"METR. (2024). Autonomy Evaluation Results. metr.org. RAND Corporation. (2024). Measuring AI's Coding Proficiency Across Skill Levels." },
];

// ── ALGO NOTES ─────────────────────────────────────────────────────────
var ALGO_NOTES = [
  { id:"A1", color:"#7c3aed", title:"Craft Conscience",   desc:"Asked once globally, stable adult trait — how much unfinished or compromised work weighs on you when no one is watching." },
  { id:"A2", color:"#0891b2", title:"Intrinsic Pull",     desc:"Asked once globally — frequency of unprompted domain engagement outside formal work (mind drifting toward technical problems)." },
  { id:"A3", color:"#d97706", title:"Felt Fluency",       desc:"Asked per skill — cognitive ease specific to that domain (effortful vs frictionless)." },
  { id:"A4", color:"#dc2626", title:"AI Replaceability",  desc:"Calibrated to your specific role type, seniority, and work context. A Staff engineer's system design scores 2-3; a Junior doing CRUD scores 8-9. Source: GitHub Copilot research, METR evals 2024-25." },
  { id:"A5", color:"#d97706", title:"Market Demand",      desc:"Estimated for your role type and company context. Based on BLS OOH data and WEF Future of Jobs 2025. Not real-time — production upgrade: live job posting data via BLS/Indeed API." },
  { id:"A6", color:"#2563eb", title:"Skill Suggestions",  desc:"Generated from your dev type + seniority + work context. More targeted than a generic engineer profile. You can edit any skill to be more specific." },
  { id:"A7", color:"#059669", title:"Benchmarking",       desc:"Estimated percentile vs engineers at your level and role type. No real cohort data yet — estimate only. Production: anonymized Defensible Zone™ cohort data." },
  { id:"A8", color:"#ea580c", title:"DZ Formula",         desc:"Composite affinity compAff(c,p,f) = (c×0.35)+(p×0.35)+(f×0.30). DZ = 100 x (affinity/10)^0.35 x ((10-aiR)/10)^0.40 x (market/10)^0.25, capped at 100 (Cobb-Douglas). The former interface_bonus term has been removed. Multiplicative — weakness in any dimension still drags the score." },
  { id:"A9", color:"#64748b", title:"Risk Matrix Placement",desc:"Skills placed on 2x2 by AI Replaceability (x-axis) and Market Demand (y-axis). Bubble size = natural affinity. Color = DZ score. Quadrant labels are strategic not prescriptive." },
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
function dzColor(dz) {
  if (dz >= 70) return S.gold;
  if (dz >= 45) return S.orange;
  return S.red;
}
function dzLabel(dz) {
  if (dz >= 70) return "Defensible";
  if (dz >= 45) return "Moderate Risk";
  return "High Risk";
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

// ── RISK MATRIX ────────────────────────────────────────────────────────
function RiskMatrix(props) {
  var results  = props.results;
  var hovered  = props.hovered;
  var setHovered = props.setHovered;

  var PAD_L = 64; var PAD_B = 54; var PAD_T = 48; var PAD_R = 24;
  var W = 500; var H = 460;
  var PW = W - PAD_L - PAD_R;
  var PH = H - PAD_T - PAD_B;
  var MID_X = PAD_L + PW / 2;
  var MID_Y = PAD_T + PH / 2;

  function px(aiR) { return PAD_L + (aiR / 10) * PW; }
  function py(mkt) { return PAD_T + PH - (mkt / 10) * PH; }

  var QUADRANTS = [
    { x: PAD_L,   y: PAD_T,   w: PW/2, h: PH/2, color:"rgba(217,119,6,.04)",  label:"DEFEND",       sub:"low AI risk · high demand", lx: PAD_L+8,      ly: PAD_T+18,    tc: S.gold },
    { x: MID_X,   y: PAD_T,   w: PW/2, h: PH/2, color:"rgba(234,88,12,.04)",  label:"LEVERAGE",     sub:"own the orchestration layer",lx: MID_X+8,      ly: PAD_T+18,    tc: S.orange },
    { x: PAD_L,   y: MID_Y,   w: PW/2, h: PH/2, color:"rgba(37,99,235,.04)",  label:"SPECIALIZE",   sub:"niche but protected",        lx: PAD_L+8,      ly: MID_Y+18,    tc: S.blue },
    { x: MID_X,   y: MID_Y,   w: PW/2, h: PH/2, color:"rgba(220,38,38,.04)",  label:"DEPRIORITIZE", sub:"exit path, don't invest",    lx: MID_X+8,      ly: MID_Y+18,    tc: S.red },
  ];

  var hovS = results ? results.find(function(r) { return r.name === hovered; }) : null;

  return (
    <svg viewBox={"0 0 " + W + " " + H} style={{ width:"100%", display:"block" }}>
      <defs>
        <filter id="bub-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill="#fff" rx="12" />

      {QUADRANTS.map(function(q, i) {
        return (
          <g key={i}>
            <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={q.color} />
            <text x={q.lx} y={q.ly} fontSize="12" fontFamily={S.mono} fontWeight="700" fill={q.tc} letterSpacing="0.08em">{q.label}</text>
            <text x={q.lx} y={q.ly + 14} fontSize="12" fontFamily={S.mono} fill={S.dim}>{q.sub}</text>
          </g>
        );
      })}

      <line x1={MID_X} y1={PAD_T} x2={MID_X} y2={PAD_T + PH} stroke={S.border} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1={PAD_L} y1={MID_Y} x2={PAD_L + PW} y2={MID_Y} stroke={S.border} strokeWidth="1.5" strokeDasharray="4,3" />
      <rect x={PAD_L} y={PAD_T} width={PW} height={PH} fill="none" stroke={S.border} strokeWidth="1.5" rx="2" />

      {[0,2,4,6,8,10].map(function(v) {
        return (
          <g key={v}>
            <text x={px(v)} y={PAD_T + PH + 16} textAnchor="middle" fontSize="12" fontFamily={S.mono} fill={S.dim}>{v}</text>
            <text x={PAD_L - 10} y={py(v) + 4} textAnchor="end" fontSize="12" fontFamily={S.mono} fill={S.dim}>{v}</text>
          </g>
        );
      })}

      <text x={PAD_L + PW / 2} y={H - 6} textAnchor="middle" fontSize="12" fontFamily={S.mono} fill={S.muted} fontWeight="600" letterSpacing="0.06em">AI REPLACEABILITY →</text>
      <text x={12} y={PAD_T + PH / 2} textAnchor="middle" fontSize="12" fontFamily={S.mono} fill={S.muted} fontWeight="600" letterSpacing="0.06em" transform={"rotate(-90,12," + (PAD_T + PH / 2) + ")"}>MARKET DEMAND →</text>

      {results && results.map(function(s, i) {
        var cx2 = px(s.ai_replaceability);
        var cy2 = py(s.market_demand);
        var r = 10 + (s.naturalAffinity || 5) * 1.8;
        var isH = hovered === s.name;
        return (
          <g key={s.name} onMouseEnter={function() { setHovered(s.name); }} onMouseLeave={function() { setHovered(null); }} style={{ cursor:"pointer" }}>
            <circle cx={cx2} cy={cy2} r={isH ? r + 4 : r} fill={dzColor(s.dz)} fillOpacity="0.85" stroke="white" strokeWidth="2" filter={isH ? "url(#bub-glow)" : ""} />
            <text x={cx2} y={cy2 + 4} textAnchor="middle" fontSize="12" fontFamily={S.mono} fontWeight="700" fill="white">{i + 1}</text>
          </g>
        );
      })}

      {hovS && (function() {
        var cx2 = px(hovS.ai_replaceability);
        var cy2 = py(hovS.market_demand);
        var tw = 240; var th = 82;
        var tx = Math.min(Math.max(cx2 - 120, 4), W - tw - 4);
        var ty = cy2 > PAD_T + PH / 2 ? cy2 - th - 14 : cy2 + 18;
        var sn = hovS.name.length > 28 ? hovS.name.slice(0, 27) + "…" : hovS.name;
        return (
          <g>
            <rect x={tx} y={ty} width={tw} height={th} rx="8" fill="rgba(13,17,23,.96)" stroke={dzColor(hovS.dz)} strokeWidth="1.5" />
            <text x={tx+12} y={ty+18} fontSize="12" fill="#f8f9fc" fontFamily={S.font} fontWeight="700">{sn}</text>
            <text x={tx+12} y={ty+34} fontSize="12" fill={dzColor(hovS.dz)} fontFamily={S.mono} fontWeight="600">{dzLabel(hovS.dz)} · DZ {hovS.dz}</text>
            <line x1={tx+12} y1={ty+42} x2={tx+tw-12} y2={ty+42} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={tx+12} y={ty+56} fontSize="12" fill="#8a96b0" fontFamily={S.mono}>AI Risk: {hovS.ai_replaceability}/10 · Demand: {hovS.market_demand}/10</text>
            <text x={tx+12} y={ty+70} fontSize="12" fill="#8a96b0" fontFamily={S.mono}>Affinity: {hovS.affinity}/10 · Interface span: {hovS.interface_span ? "yes" : "no"}</text>
          </g>
        );
      })()}

      <text x={PAD_L + 6} y={PAD_T - 8} fontSize="12" fontFamily={S.mono} fill={S.dim}>Bubble size = Natural Affinity · Color = DZ Score</text>
    </svg>
  );
}

// ── RECOMMENDATIONS ────────────────────────────────────────────────────
function buildRecs(skills, profile, benchmark) {
  var recs = [];
  var defensible    = skills.filter(function(s) { return s.dz >= 70; });
  var highRisk      = skills.filter(function(s) { return s.ai_replaceability >= 7; });
  var highAffLowMkt = skills.filter(function(s) { return s.affinity >= 7 && s.market_demand < 5; });
  var lowAffHighMkt = skills.filter(function(s) { return s.affinity < 4 && s.market_demand >= 7; });
  var iface         = skills.filter(function(s) { return s.interface_span; });
  var goldenCage    = skills.filter(function(s) { return (s.naturalAffinity != null ? s.naturalAffinity : s.affinity) >= 6 && (s.investment != null ? s.investment : 5) <= 3; });

  if (defensible.length) recs.push({ icon:"■", color:S.gold, title:"Protect & Deepen These Skills",
    names: defensible.map(function(s) { return s.name; }),
    actions:["These sit in your Defend quadrant — high natural affinity, low AI risk. This is where you build your reputation and your floor.",
             "Build systems and write publicly about your approach. Own the output layer, not just the execution.",
             "Seek roles and projects where these skills touch architecture, strategy, or irreplaceable organizational judgment."]});
  if (highRisk.length) recs.push({ icon:"■", color:S.red, title:"High AI Risk — Change Your Relationship With These",
    names: highRisk.map(function(s) { return s.name; }),
    actions:["AI is already doing the bulk of this work. Your job is to own the review, direction, and judgment — not the generation.",
             "The engineer who wields AI on these tasks is more valuable than the one who avoids it. Learn the orchestration layer.",
             "Reinvest the time AI saves you here into your Defend quadrant before the market reprices your role."]});
  if (goldenCage.length) recs.push({ icon:"■", color:S.gold, title:"The Golden Cage — Wake Up Before AI Does",
    names: goldenCage.map(function(s) { return s.name; }),
    actions:["You feel wired for this but you're not investing in it. That gap is exactly where AI is catching up.",
             "Coasting on expertise built 3+ years ago in a fast-moving technical field is especially dangerous in this cycle.",
             "Treat this like your most endangered asset: side projects, new patterns, public output, obsessive attention."]});
  if (highAffLowMkt.length) recs.push({ icon:"■", color:S.purple, title:"High Affinity, Low Market — Make Yourself Legible",
    names: highAffLowMkt.map(function(s) { return s.name; }),
    actions:["The gap here is framing, not capability. Most hiring managers don't know how to value what you have.",
             "Find the industries, company stages, or domains where this skill is on the critical path, not a nice-to-have.",
             "Write about it, build in public, create the artifact that makes the skill visible and priceable."]});
  if (lowAffHighMkt.length) recs.push({ icon:"■", color:S.blue, title:"High Market, Low Affinity — Plan Your Migration",
    names: lowAffHighMkt.map(function(s) { return s.name; }),
    actions:["These are paying your bills now but won't define your career. Use them for leverage while building toward your zone.",
             "AI will commoditize high-market, low-affinity skills faster than skills you actually care about deepening.",
             "Find the intersection: a team or domain where this skill overlaps with something you genuinely want to do."]});
  if (iface.length) recs.push({ icon:"■", color:S.green, title:"Interface Advantage — This Is Rare",
    names: iface.map(function(s) { return s.name; }),
    actions:["Engineers fluent across two disciplines are genuinely rare. AI can't replicate lived cross-domain experience.",
             "Actively seek roles that sit at the seam: eng + product, eng + security, eng + ML research, eng + design systems.",
             "Make the cross-domain fluency visible. It's invisible on a resume and only apparent in the right conversations."]});
  if (benchmark) recs.push({ icon:"■", color:"#0891b2", title:"How You Compare to Peers at Your Level",
    names:[],
    actions: benchmark.insights || ["Your Defensible Zone™ profile has been estimated vs other engineers at your level and role type.",
             "Scores above 70 indicate genuine defensibility vs AI at your seniority band.",
             "The most defensible engineers at any level are those whose work requires sustained judgment under ambiguity."]});
  recs.push({ icon:"■", color:S.dim, title:"Always: Build Trust Capital",
    names:[],
    actions:["The engineer trusted with the ambiguous, high-stakes problem is the last one replaced — by AI or by reorgs.",
             "Reputation for judgment compounds: every hard call you own well is future career capital.",
             "Your network of people who trust your technical judgment is a moat that no model can replicate."]});
  return recs;
}

// ── PROMO CODES ────────────────────────────────────────────────────────
// To add/remove bypass codes, edit this array.
// Remove the array entirely (set to []) when going fully live.
var PROMO_CODES = ["DZFRIEND", "DZPREVIEW", "DZTEST"];

// ── PAYWALL GATE ───────────────────────────────────────────────────────
function PaywallGate({ tier, onUnlock }) {
  var [input, setInput]   = useState("");
  var [error, setError]   = useState("");
  var [shake, setShake]   = useState(false);

  function tryPromo() {
    if (PROMO_CODES.map(function(c){return c.toLowerCase();}).indexOf(input.trim().toLowerCase()) !== -1) {
      onUnlock(3, true); // promo unlocks everything, flag as promo
    } else {
      setError("Invalid code. Try again or purchase below.");
      setShake(true);
      setTimeout(function(){ setShake(false); }, 500);
    }
  }

  var shakeStyle = shake ? {animation:"shake 0.4s ease"} : {};

  return (
    <div style={{background:S.card,border:"1px solid "+S.border,borderRadius:16,padding:28,marginBottom:10}}>
      <style dangerouslySetInnerHTML={{__html:"@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}"}} />

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <div>
          <div style={{fontFamily:S.mono,fontSize:12,color:S.muted,fontWeight:700,letterSpacing:"0.08em"}}>UNLOCK YOUR FULL REPORT</div>
          <div style={{fontSize:15,color:S.dim,marginTop:2}}>Your DZ score is above. Go deeper with actionable next steps.</div>
        </div>
      </div>

      {/* Tier cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>

        {/* Tier 2 */}
        <div style={{background:S.bg,border:"2px solid "+S.gold,borderRadius:12,padding:16,position:"relative"}}>
          <div style={{fontFamily:S.mono,fontSize:12,fontWeight:700,color:S.gold,letterSpacing:"0.1em",marginBottom:6}}>RECOMMENDATIONS</div>
          <div style={{fontFamily:S.serif,fontSize:28,color:S.text,fontWeight:700,lineHeight:1,marginBottom:4}}>$29<span style={{fontSize:15,fontWeight:400,color:S.dim}}> one-time</span></div>
          <ul style={{margin:"10px 0 14px",padding:0,listStyle:"none"}}>
            {["Personalized action plan","Steps ranked by impact & effort","Skills to protect vs deprioritize","AI-threat timeline for your profile"].map(function(item){
              return <li key={item} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:5}}><span style={{color:S.gold,fontWeight:700,flexShrink:0,marginTop:1}}>✓</span><span style={{color:S.muted,fontSize:14,lineHeight:1.5}}>{item}</span></li>;
            })}
          </ul>
          <button
            onClick={function(){ window.open("https://buy.stripe.com/00waEXbZobnl0D3bc2dQQ02","_blank"); }}
            style={{width:"100%",background:S.gold,color:"white",border:"none",borderRadius:8,padding:"11px 0",fontSize:14,fontFamily:S.mono,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}
          >GET RECOMMENDATIONS →</button>
        </div>

        {/* Tier 3 */}
        <div style={{background:S.bg,border:"2px solid "+S.accent,borderRadius:12,padding:16,position:"relative"}}>
          <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:S.accent,color:"white",fontFamily:S.mono,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>BEST VALUE</div>
          <div style={{fontFamily:S.mono,fontSize:12,fontWeight:700,color:S.accent,letterSpacing:"0.1em",marginBottom:6}}>RECOMMENDATIONS + PDF</div>
          <div style={{fontFamily:S.serif,fontSize:28,color:S.text,fontWeight:700,lineHeight:1,marginBottom:4}}>$34<span style={{fontSize:15,fontWeight:400,color:S.dim}}> one-time</span></div>
          <ul style={{margin:"10px 0 14px",padding:0,listStyle:"none"}}>
            {["Everything in Recommendations","Branded PDF you can save & share","Ready for career coaches & managers","Permanent record of your assessment"].map(function(item){
              return <li key={item} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:5}}><span style={{color:S.accent,fontWeight:700,flexShrink:0,marginTop:1}}>✓</span><span style={{color:S.muted,fontSize:14,lineHeight:1.5}}>{item}</span></li>;
            })}
          </ul>
          {/* TODO: Replace onClick with Stripe checkout for $34 */}
          <button
            onClick={function(){ window.open("https://buy.stripe.com/00wdR93sSgHFadD5RIdQQ03","_blank"); }}
            style={{width:"100%",background:S.accent,color:"white",border:"none",borderRadius:8,padding:"11px 0",fontSize:14,fontFamily:S.mono,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}
          >GET PDF REPORT →</button>
        </div>
      </div>

      {/* Promo code */}
      <div style={{borderTop:"1px solid "+S.border,paddingTop:16}}>
        <div style={{fontFamily:S.mono,fontSize:12,color:S.dim,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>HAVE A PROMO CODE?</div>
        <div style={Object.assign({display:"flex",gap:8},shakeStyle)}>
          <input
            value={input}
            onChange={function(e){setInput(e.target.value);setError("");}}
            onKeyDown={function(e){if(e.key==="Enter")tryPromo();}}
            placeholder="Enter code"
            style={{flex:1,background:S.bg,border:"1px solid "+(error?S.red:S.border),borderRadius:8,padding:"10px 14px",fontSize:16,fontFamily:S.mono,color:S.text,outline:"none"}}
          />
          <button
            onClick={tryPromo}
            style={{background:S.card2,border:"1px solid "+S.border,borderRadius:8,padding:"10px 18px",fontSize:12,fontFamily:S.mono,fontWeight:700,color:S.muted,cursor:"pointer",letterSpacing:"0.06em"}}
          >APPLY</button>
        </div>
        {error && <div style={{fontFamily:S.mono,fontSize:12,color:S.red,marginTop:6,fontWeight:600}}>{error}</div>}
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────
export default function Engineer() {
  var [step, setStep]                     = useState(0);
  var [devType, setDevType]               = useState("");
  var [devTypeOther, setDevTypeOther]     = useState("");
  var [seniority, setSeniority]           = useState("");
  var [workContexts, setWorkContexts]     = useState([]);
  var [showAllCtx, setShowAllCtx]         = useState(false);
  var [companyType, setCompanyType]       = useState("");
  var [landscape, setLandscape]           = useState("");
  var [skills, setSkills]                 = useState([]);
  var [conscience, setConscience]         = useState(5);
  var [pull, setPull]                     = useState(5);
  var [fluencies, setFluencies]           = useState({});
  var [adjustedSkills, setAdjustedSkills] = useState(function() { return new Set(); });
  var adjustedSkillsRef                   = useRef(new Set());
  var [results, setResults]               = useState(null);
  var [benchmark, setBenchmark]           = useState(null);
  var [hovered, setHovered]               = useState(null);
  var [loading, setLoading]               = useState(false);
  var [loadingMsg, setLoadingMsg]         = useState("");
  var [error, setError]                   = useState(null);
  var [showRecs, setShowRecs]             = useState(true);
  var [showAlgo, setShowAlgo]             = useState(false);
  var [showSources, setShowSources]       = useState(false);
  var [tier, setTier]                     = useState(0); // 0=free, 2=recs, 3=pdf
  var [promoUsed, setPromoUsed]           = useState(false);

  function handleUnlock(t, isPromo) { setTier(t); if (isPromo) setPromoUsed(true); }

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

  // ── Payment verification ────────────────────────────────────────────────
  // On mount: (1) check localStorage for existing valid token,
  //           (2) if ?session_id= in URL, verify with backend and store token.
  useEffect(function() {
    // Helper: decode JWT payload without verifying signature (verification is done server-side)
    function decodeJwt(token) {
      try {
        var payload = token.split(".")[1];
        var padded = payload + "===".slice((payload.length + 3) % 4);
        return JSON.parse(atob(padded));
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
        return true;
      }
      return false;
    }

    // 1. Try existing token from localStorage
    var stored = localStorage.getItem("dz_token_engineer");
    if (stored && applyToken(stored)) {
      return; // already unlocked from previous purchase
    }

    // 2. Fresh redirect from Stripe — verify session_id with backend
    var params = new URLSearchParams(window.location.search);
    var sessionId = params.get("session_id");
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname); // clean URL immediately
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
          }
        })
        .catch(function(err) { console.error("Payment verification failed:", err); });
    }
  }, []);

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
    setWorkContexts([]); setShowAllCtx(false);
    setCompanyType(""); setLandscape(""); setSkills([]);
    setConscience(5); setPull(5); setFluencies({}); setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setBenchmark(null);
    setHovered(null); setError(null); setShowRecs(true); setShowAlgo(false); setShowSources(false); setTier(0); setPromoUsed(false);
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

  // ── API CALL 2 ────────────────────────────────────────────────────────
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
      var enriched = parsed.skills.map(function(skill) {
        var found = skills.find(function(s) { return s.text===skill.name; }) || skills.find(function(s) { return skill.name.indexOf(s.text.slice(0,20))!==-1; });
        var id = found ? found.id : null;
        var fluencyVal = id && fluencies[id] !== undefined ? fluencies[id] : getSeed(conscience, pull);
        var aff = compAff(conscience, pull, fluencyVal);
        var dz  = calcDZ(aff, skill.ai_replaceability, skill.market_demand);
        return Object.assign({}, skill, { naturalAffinity:aff, investment:fluencyVal, affinity:aff, dz:dz });
      });
      setBenchmark(parsed.benchmark);
      setResults(enriched);
      setStep(3);
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
          var enriched2 = parsed2.skills.map(function(skill) {
            var found2 = skills.find(function(s) { return s.text===skill.name; }) || skills.find(function(s) { return skill.name.indexOf(s.text.slice(0,20))!==-1; });
            var id2 = found2 ? found2.id : null;
            var fluencyVal2 = id2 && fluencies[id2] !== undefined ? fluencies[id2] : getSeed(conscience, pull);
            var aff2 = compAff(conscience, pull, fluencyVal2);
            var dz2  = calcDZ(aff2, skill.ai_replaceability, skill.market_demand);
            return Object.assign({}, skill, { naturalAffinity:aff2, investment:fluencyVal2, affinity:aff2, dz:dz2 });
          });
          setBenchmark(parsed2.benchmark);
          setResults(enriched2);
          setStep(3);
        } catch(e2) { setError("Analysis failed — please try again in a moment."); }
      } else { setError("Analysis failed — please try again in a moment."); }
    }
    finally { setLoading(false); }
  }

  // ── LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{background:S.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
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
  <div style={{padding:"0 0 8px"}}>
    <a href="/" style={{fontFamily:S.mono,fontSize:12,color:S.muted,textDecoration:"none",letterSpacing:"0.06em",fontWeight:600}}>← DEFENSIBLE ZONE™</a>
  </div>
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
            <PrimaryBtn onClick={function(){ setStep(2.5); }} disabled={skills.length===0} style={{flex:3}}>ANALYZE MY DEFENSIBLE ZONE™ →</PrimaryBtn>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2.5) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          minHeight: "100vh",
          fontFamily: S.mono,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#d97706",
            letterSpacing: "0.12em",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION
        </div>
        <EmailGate
          productName="Defensible Zone™ Engineer Edition"
          onUnlock={function () {
            runAnalysis();
          }}
        />
        {error && <p style={{color:S.red,fontSize:14,marginTop:16,textAlign:"center",fontFamily:S.mono,fontWeight:600,maxWidth:480}}>{error}</p>}
        <div
          style={{
            fontSize: 10,
            color: S.dim,
            textAlign: "center",
            marginTop: 32,
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          DEFENSIBLE ZONE™ is a trademark of its creator. All rights reserved.
        </div>
      </div>
    );
  }

  // ── STEP 3: RESULTS ────────────────────────────────────────────────────
  if (step === 3 && results) {
    var profile3 = buildProfile(devType, devTypeOther, seniority, workContexts, companyType);
    var recs   = buildRecs(results, profile3, benchmark);
    var avgDZ  = Math.round(results.reduce(function(a,r){return a+r.dz;},0) / results.length);
    var sorted = results.slice().sort(function(a,b){return b.dz-a.dz;});

    return (
      <div style={{background:S.bg,minHeight:"100vh",fontFamily:S.font,padding:"28px 16px"}}>
        <style dangerouslySetInnerHTML={{__html:"@keyframes barIn{from{width:0}} .bar-anim{animation:barIn 0.9s ease-out forwards;}"}} />
        <div style={{maxWidth:1140,margin:"0 auto"}}>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:S.mono,fontSize:12,color:S.muted,letterSpacing:"0.08em",marginBottom:5,fontWeight:600}}>DEFENSIBLE ZONE™ REPORT · {profile3.summary.toUpperCase()}</div>
              <h1 style={{fontFamily:S.serif,fontSize:32,color:S.text,margin:0}}>Your Risk Profile</h1>
            </div>
            <div style={{display:"flex",gap:20,alignItems:"flex-end"}}>
              {benchmark && (
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:S.mono,fontSize:38,fontWeight:700,color:"#0891b2",lineHeight:1}}>{benchmark.percentile}<span style={{fontSize:18}}>%</span></div>
                  <div style={{fontFamily:S.mono,fontSize:12,color:S.muted,letterSpacing:"0.08em",fontWeight:600,marginTop:2}}>PEER PERCENTILE</div>
                </div>
              )}
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:S.mono,fontSize:38,fontWeight:700,color:dzColor(avgDZ),lineHeight:1}}>{avgDZ}</div>
                <div style={{fontFamily:S.mono,fontSize:12,color:S.muted,letterSpacing:"0.08em",fontWeight:600,marginTop:2}}>AVG DZ SCORE</div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
            {[profile3.devLabel+" Engineer", profile3.seniorityLabel].concat(profile3.workContextLabels).concat(profile3.companyLabel?[profile3.companyLabel]:[]).map(function(tag) {
              return <span key={tag} style={{fontFamily:S.mono,fontSize:12,color:S.muted,background:S.card2,border:"1px solid "+S.border,borderRadius:12,padding:"3px 10px",fontWeight:600}}>{tag}</span>;
            })}
          </div>

          {benchmark && (
            <div style={{background:S.card,border:"1px solid #bae6fd",borderRadius:12,padding:"12px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
              <p style={{color:"#0369a1",fontSize:16,margin:0,lineHeight:1.55,fontStyle:"italic"}}>{benchmark.summary}</p>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.2fr) minmax(0,0.8fr)",gap:12,marginBottom:12}}>
            <Card style={{padding:18}}>
              <Label>SKILL RISK MATRIX · HOVER TO INSPECT</Label>
              <RiskMatrix results={results} hovered={hovered} setHovered={setHovered} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:14,padding:"10px 0 0",borderTop:"1px solid "+S.border}}>
                {[{c:S.gold,l:"DEFEND — low AI risk, high demand"},{c:S.orange,l:"LEVERAGE — own the orchestration layer"},{c:S.blue,l:"SPECIALIZE — niche but protected"},{c:S.red,l:"DEPRIORITIZE — exit path"}].map(function(q) {
                  return (
                    <div key={q.l} style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:10,height:10,borderRadius:2,background:q.c,flexShrink:0}} />
                      <span style={{fontFamily:S.mono,fontSize:12,color:S.dim}}>{q.l}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card style={{padding:18,overflow:"auto"}}>
              <Label>SKILL SCORES · SORTED BY DZ</Label>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {sorted.map(function(s) {
                  return (
                    <div key={s.name} onMouseEnter={function(){setHovered(s.name);}} onMouseLeave={function(){setHovered(null);}} style={{borderLeft:"3px solid "+dzColor(s.dz),paddingLeft:12,paddingTop:10,paddingBottom:10,cursor:"pointer",borderRadius:"0 8px 8px 0",background:hovered===s.name?S.card2:"transparent"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{color:S.text,fontSize:16,fontWeight:700,paddingRight:8,lineHeight:1.3}}>{s.name}</span>
                        <span style={{fontFamily:S.mono,fontSize:12,padding:"2px 8px",borderRadius:20,flexShrink:0,color:dzColor(s.dz),background:dzColor(s.dz)+"18",fontWeight:700}}>{dzLabel(s.dz)}</span>
                      </div>
                      <div style={{height:3,background:"#e8ecf5",borderRadius:2,marginBottom:8,overflow:"hidden"}}>
                        <div className="bar-anim" style={{height:"100%",width:s.dz+"%",background:"linear-gradient(90deg,"+dzColor(s.dz)+"99,"+dzColor(s.dz)+")",borderRadius:2}} />
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
                        {[["NA",s.naturalAffinity,S.purple],["Inv",s.investment,"#0891b2"],["Comp",s.affinity,S.accent],["AIR",s.ai_replaceability,S.red],["Mkt",s.market_demand,S.green]].map(function(item) {
                          return (
                            <div key={item[0]}>
                              <div style={{fontFamily:S.mono,fontSize:12,color:S.dim}}>{item[0]}</div>
                              <div style={{fontFamily:S.mono,fontSize:14,color:item[2],fontWeight:700}}>{item[1]}/10</div>
                            </div>
                          );
                        })}
                      </div>
                      {s.interface_span && <div style={{fontFamily:S.mono,fontSize:12,color:S.green,marginTop:4,fontWeight:700}}>+ Interface span bonus</div>}
                      <p style={{color:S.muted,fontSize:16,margin:"8px 0 0",fontStyle:"italic",lineHeight:1.6}}>{s.rationale}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ── TIER 1: Free — Recommendations teaser or full content ── */}
          {tier < 2 ? (
            <PaywallGate tier={tier} onUnlock={handleUnlock} />
          ) : (
            <Card style={{padding:22,marginBottom:10}}>
              <style dangerouslySetInnerHTML={{__html:`
                @media print {
                  body * { visibility: hidden; }
                  #dz-print-region, #dz-print-region * { visibility: visible; }
                  #dz-print-region { position: absolute; left: 0; top: 0; width: 100%; }
                  .no-print { display: none !important; }
                }
              `}} />
              <div id="dz-print-region">
              {tier >= 3 && !promoUsed && (
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                  <button
                    onClick={function(){ window.open("https://buy.stripe.com/00wdR93sSgHFadD5RIdQQ03","_blank"); }}
                    style={{background:S.gold,color:"white",border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontFamily:S.mono,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:6}}
                  >DOWNLOAD PDF REPORT</button>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <button onClick={function(){setShowRecs(!showRecs);}} className="no-print" style={{background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0,flex:1}}>
                  <Label style={{marginBottom:0}}>STRATEGIC RECOMMENDATIONS · {profile3.seniorityLabel.toUpperCase()} {profile3.devLabel.toUpperCase()} ENGINEER</Label>
                  <span style={{color:S.muted,fontSize:12,fontFamily:S.mono,fontWeight:600,marginLeft:12}}>{showRecs?"▲ COLLAPSE":"▼ EXPAND"}</span>
                </button>
                {showRecs && (
                  <button
                    className="no-print"
                    onClick={function(){ window.print(); }}
                    style={{background:S.bg,border:"1px solid "+S.border,borderRadius:8,padding:"7px 14px",fontSize:12,fontFamily:S.mono,fontWeight:700,color:S.muted,cursor:"pointer",letterSpacing:"0.06em",marginLeft:12,flexShrink:0,display:"flex",alignItems:"center",gap:5}}
                  >Save as PDF</button>
                )}
              </div>
            {showRecs && (
              <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:0}}>
                {recs.map(function(rec, i) {
                  return (
                    <div key={i} style={{
                      borderLeft:"4px solid "+rec.color,
                      paddingLeft:20, paddingTop:16, paddingBottom:16,
                      marginBottom:4,
                      borderRadius:"0 8px 8px 0",
                      background: i%2===0 ? "transparent" : S.bg
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:rec.names.length>0?6:10}}>
                        <span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:rec.color,flexShrink:0}} />
                        <span style={{color:S.text,fontSize:16,fontWeight:700,lineHeight:1.3}}>{rec.title}</span>
                      </div>
                      {rec.names.length>0 && (
                        <div style={{fontFamily:S.mono,fontSize:12,color:rec.color,marginBottom:12,fontWeight:700,paddingLeft:18}}>
                          {rec.names.join(" · ")}
                        </div>
                      )}
                      <div style={{display:"flex",flexDirection:"column",gap:8,paddingLeft:18}}>
                        {rec.actions.map(function(a,j) {
                          return (
                            <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                              <span style={{color:rec.color,flexShrink:0,fontSize:13,fontWeight:700,marginTop:2,lineHeight:1}}>→</span>
                              <span style={{color:S.muted,fontSize:15,lineHeight:1.65}}>{a}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div> {/* end dz-print-region */}
          </Card>
          )} {/* end tier >= 2 conditional */}

          <Card style={{padding:22,marginBottom:10}}>
            <button onClick={function(){setShowAlgo(!showAlgo);}} style={{background:"none",border:"none",cursor:"pointer",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0}}>
              <Label style={{marginBottom:0}}>ALGORITHM ASSUMPTIONS & KNOWN LIMITATIONS</Label>
              <span style={{color:S.muted,fontSize:12,fontFamily:S.mono,fontWeight:600}}>{showAlgo?"▲ COLLAPSE":"▼ SHOW WORK"}</span>
            </button>
            {showAlgo && (
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
                {ALGO_NOTES.map(function(a) {
                  return (
                    <div key={a.id} style={{background:S.bg,border:"1px solid "+S.border,borderRadius:10,padding:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontFamily:S.mono,fontSize:12,fontWeight:700,background:a.color,color:"white",padding:"2px 8px",borderRadius:4}}>{a.id}</span>
                        <span style={{fontSize:12,fontWeight:700,color:S.text}}>{a.title}</span>
                      </div>
                      <p style={{color:S.muted,fontSize:12,margin:0,lineHeight:1.65,fontFamily:S.mono}}>{a.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card style={{padding:22,marginBottom:16}}>
            <button onClick={function(){setShowSources(!showSources);}} style={{background:"none",border:"none",cursor:"pointer",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0}}>
              <Label style={{marginBottom:0}}>METHODOLOGY & SOURCES</Label>
              <span style={{color:S.muted,fontSize:12,fontFamily:S.mono,fontWeight:600}}>{showSources?"▲ COLLAPSE":"▼ VIEW SOURCES"}</span>
            </button>
            {showSources && (
              <div style={{marginTop:16}}>
                <p style={{color:S.muted,fontSize:15,margin:"0 0 14px",lineHeight:1.75}}>
                  AI replaceability scores are calibrated using the sources below, combined with role-specific knowledge and LLM estimation. Market demand scores are grounded in BLS data and WEF projections. No score should be treated as definitive — this tool is designed for reflection and career planning, not as an employment assessment.
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {SOURCES.map(function(src) {
                    return (
                      <div key={src.id} style={{display:"flex",gap:12,padding:"10px 14px",background:S.bg,borderRadius:8,border:"1px solid "+S.border}}>
                        <span style={{fontFamily:S.mono,fontSize:12,fontWeight:700,background:S.accent,color:"white",padding:"2px 7px",borderRadius:4,flexShrink:0,height:"fit-content"}}>{src.id}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:S.text,marginBottom:3}}>{src.label}</div>
                          <div style={{fontFamily:S.mono,fontSize:12,color:S.dim,lineHeight:1.6}}>{src.cite}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <button onClick={resetAll} style={{width:"100%",background:"transparent",border:"1px solid "+S.border,color:S.muted,borderRadius:12,padding:"15px 0",fontSize:14,fontFamily:S.mono,cursor:"pointer",letterSpacing:"0.08em",fontWeight:600,marginBottom:28}}>← START OVER</button>

          <div style={{background:"#fef9ec",border:"1px solid #f0c060",borderRadius:12,padding:"16px 20px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontFamily:S.mono,fontSize:12,color:"#92400e",fontWeight:700,marginBottom:4,letterSpacing:"0.06em"}}>IMPORTANT — PLEASE READ</div>
            <div style={{fontFamily:S.mono,fontSize:12,color:"#78350f",lineHeight:1.7}}>
              This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment. Scores are estimates based on publicly available research and LLM calibration — not a definitive evaluation of your skills or employability.
            </div>
          </div>

          <div style={{paddingTop:14,textAlign:"center"}}>
            <span style={{fontFamily:S.mono,fontSize:12,color:S.dim,display:"block",marginBottom:4}}>DEFENSIBLE ZONE&#8482; is a trademark of its creator. All rights reserved.</span>
            <span style={{fontFamily:S.mono,fontSize:12,color:S.dim,display:"block"}}>&copy; 2026</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
