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

// ── PLACEHOLDER EXPORT ──────────────────────────────────────────────
export default function ProductManager() {
  return <div style={{ fontFamily: S.font, padding: 40, color: S.text }}>ProductManager — building…</div>;
}
