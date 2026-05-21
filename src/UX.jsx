import { useState, useEffect, useRef } from "react";

// ── UX ROLE TYPES ─────────────────────────────────────────────────────
var UX_ROLE_TYPES = [
  { id: "product", title: "Product Designer", desc: "Research, strategy, flows, and shipping. The full picture." },
  { id: "interaction", title: "Interaction Designer", desc: "How things work. Flows, states, microinteractions." },
  { id: "visual_brand", title: "Visual / Brand Designer", desc: "How things look. Identity, typography, color, systems." },
  { id: "ux_researcher", title: "UX Researcher", desc: "Understanding people. Interviews, usability testing, synthesis." },
  { id: "content", title: "Content Designer", desc: "Words, voice, microcopy, information architecture." },
  { id: "design_ops", title: "DesignOps", desc: "Design systems, tooling, processes, team infrastructure." },
  { id: "motion", title: "Motion Designer", desc: "Animation, transitions, interactive storytelling." },
  { id: "service", title: "Service Designer", desc: "End-to-end journeys, systems, touchpoints across channels." },
  { id: "strategist", title: "Design Strategist", desc: "Vision, futures, org-level design thinking." },
  { id: "ux_analyst", title: "UX Analyst", desc: "Data, metrics, heatmaps, quantitative research." },
  { id: "design_eng", title: "Design Engineer", desc: "Figma to code. React, Storybook, design system implementation." },
  { id: "accessibility", title: "Accessibility Specialist", desc: "WCAG, assistive tech, inclusive design, compliance." },
  { id: "conversation", title: "Conversation / Voice Designer", desc: "Chatbots, voice assistants, multimodal AI interfaces." },
];

// ── SENIORITY BY TYPE ─────────────────────────────────────────────────
var SENIORITY_BY_TYPE = {
  product: [
    "Intern / Student",
    "Junior Product Designer",
    "Product Designer",
    "Senior Product Designer",
    "Staff / Principal Product Designer",
    "Product Design Director",
    "VP of Design",
  ],
  interaction: [
    "Intern / Student",
    "Junior Interaction Designer",
    "Interaction Designer",
    "Senior Interaction Designer",
    "Staff / Principal Interaction Designer",
    "Interaction Design Lead",
    "Head of Interaction Design",
  ],
  visual_brand: [
    "Intern / Student",
    "Junior Visual Designer",
    "Visual Designer",
    "Senior Visual Designer",
    "Staff / Principal Visual Designer",
    "Visual Design Director",
    "VP of Brand & Design",
  ],
  ux_researcher: [
    "Intern / Student",
    "Junior UX Researcher",
    "UX Researcher",
    "Senior UX Researcher",
    "Staff / Principal Researcher",
    "Research Director",
    "VP of Research",
  ],
  content: [
    "Intern / Student",
    "Junior Content Designer",
    "Content Designer",
    "Senior Content Designer",
    "Staff / Principal Content Designer",
    "Content Design Director",
    "Head of Content Design",
  ],
  design_ops: [
    "Intern / Student",
    "Junior DesignOps Specialist",
    "DesignOps Specialist",
    "Senior DesignOps Specialist",
    "Staff / Principal DesignOps",
    "DesignOps Director",
    "VP of Design Operations",
  ],
  motion: [
    "Intern / Student",
    "Junior Motion Designer",
    "Motion Designer",
    "Senior Motion Designer",
    "Staff / Principal Motion Designer",
    "Motion Design Director",
    "Head of Motion Design",
  ],
  service: [
    "Intern / Student",
    "Junior Service Designer",
    "Service Designer",
    "Senior Service Designer",
    "Staff / Principal Service Designer",
    "Service Design Director",
    "Head of Service Design",
  ],
  strategist: [
    "Intern / Student",
    "Junior Design Strategist",
    "Design Strategist",
    "Senior Design Strategist",
    "Staff / Principal Design Strategist",
    "Strategy Director",
    "VP of Design Strategy",
  ],
  ux_analyst: [
    "Intern / Student",
    "Junior UX Analyst",
    "UX Analyst",
    "Senior UX Analyst",
    "Staff / Principal UX Analyst",
    "UX Analytics Director",
    "Head of UX Analytics",
  ],
  design_eng: [
    "Intern / Student",
    "Junior Design Engineer",
    "Design Engineer",
    "Senior Design Engineer",
    "Staff / Principal Design Engineer",
    "Design Engineering Director",
    "Head of Design Engineering",
  ],
  accessibility: [
    "Intern / Student",
    "Junior Accessibility Specialist",
    "Accessibility Specialist",
    "Senior Accessibility Specialist",
    "Staff / Principal Accessibility Specialist",
    "Accessibility Director",
    "Head of Accessibility",
  ],
  conversation: [
    "Intern / Student",
    "Junior Conversation Designer",
    "Conversation Designer",
    "Senior Conversation Designer",
    "Staff / Principal Conversation Designer",
    "Conversation Design Director",
    "Head of Voice & Conversation Design",
  ],
};

// ── COMPANY TYPES ─────────────────────────────────────────────────────
var COMPANY_TYPES = [
  { id: "freelance", label: "Freelance / Solo", sub: "Independent, client work, self-directed" },
  { id: "seed", label: "Seed / Early Startup", sub: "1–50 people, pre or early PMF" },
  { id: "growth", label: "Growth Startup", sub: "51–500 people, scaling fast" },
  { id: "b2bsaas", label: "B2B SaaS", sub: "50–2,000 people, product-led or sales-led" },
  { id: "enterprise", label: "Enterprise", sub: "1,000+ people, complex org, slower cycles" },
  { id: "bigtech", label: "Big Tech", sub: "Google, Meta, Apple, Microsoft, Amazon" },
  { id: "aifirst", label: "AI-First Company", sub: "OpenAI, Anthropic, Midjourney, Runway, etc." },
  { id: "agency", label: "Agency / Consultancy", sub: "Client-facing, project-based, breadth over depth" },
  { id: "fintech", label: "Fintech", sub: "Payments, banking, crypto, insurance" },
  { id: "healthtech", label: "HealthTech / MedTech", sub: "HIPAA, clinical, digital health" },
  { id: "gov", label: "Government / Public Sector", sub: "Policy, accessibility, slow cycles" },
  { id: "designled", label: "Design-Led Company", sub: "Airbnb, Figma, Linear — design has real P&L influence" },
];

// ── WORK FOCUS ────────────────────────────────────────────────────────
var WORK_FOCUS_OPTIONS = [
  "Mobile apps",
  "Web products & SaaS",
  "Design systems & component libraries",
  "Enterprise & B2B software",
  "Consumer products at scale",
  "AI product interfaces",
  "Health & medical tech",
  "Fintech & financial services",
  "Brand and marketing",
  "Onboarding & activation flows",
  "Data visualization & dashboards",
  "Voice & multimodal interfaces",
  "Internal tools & back-office software",
  "Consulting & strategy",
];

// ── CONTEXT MAP ───────────────────────────────────────────────────────
var CONTEXT_MAP = {
  product: [
    "Web products & SaaS",
    "Mobile apps",
    "Onboarding & activation flows",
    "Consumer products at scale",
    "Design systems & component libraries",
    "Enterprise & B2B software",
  ],
  interaction: [
    "Mobile apps",
    "Web products & SaaS",
    "Onboarding & activation flows",
    "AI product interfaces",
    "Voice & multimodal interfaces",
    "Consumer products at scale",
  ],
  visual_brand: [
    "Brand and marketing",
    "Web products & SaaS",
    "Design systems & component libraries",
    "Consumer products at scale",
    "Mobile apps",
    "Consulting & strategy",
  ],
  ux_researcher: [
    "Web products & SaaS",
    "Mobile apps",
    "Consumer products at scale",
    "Enterprise & B2B software",
    "Health & medical tech",
    "Onboarding & activation flows",
  ],
  content: [
    "Web products & SaaS",
    "Onboarding & activation flows",
    "Mobile apps",
    "Enterprise & B2B software",
    "Voice & multimodal interfaces",
    "Brand and marketing",
  ],
  design_ops: [
    "Design systems & component libraries",
    "Internal tools & back-office software",
    "Enterprise & B2B software",
    "Web products & SaaS",
    "Consulting & strategy",
    "Consumer products at scale",
  ],
  motion: [
    "Mobile apps",
    "Consumer products at scale",
    "AI product interfaces",
    "Brand and marketing",
    "Web products & SaaS",
    "Voice & multimodal interfaces",
  ],
  service: [
    "Consulting & strategy",
    "Enterprise & B2B software",
    "Health & medical tech",
    "Fintech & financial services",
    "Onboarding & activation flows",
    "Consumer products at scale",
  ],
  strategist: [
    "Consulting & strategy",
    "Enterprise & B2B software",
    "AI product interfaces",
    "Consumer products at scale",
    "Brand and marketing",
    "Fintech & financial services",
  ],
  ux_analyst: [
    "Data visualization & dashboards",
    "Web products & SaaS",
    "Mobile apps",
    "Onboarding & activation flows",
    "Consumer products at scale",
    "Enterprise & B2B software",
  ],
  design_eng: [
    "Design systems & component libraries",
    "Web products & SaaS",
    "Internal tools & back-office software",
    "AI product interfaces",
    "Mobile apps",
    "Enterprise & B2B software",
  ],
  accessibility: [
    "Enterprise & B2B software",
    "Web products & SaaS",
    "Health & medical tech",
    "Internal tools & back-office software",
    "Mobile apps",
    "Consumer products at scale",
  ],
  conversation: [
    "Voice & multimodal interfaces",
    "AI product interfaces",
    "Mobile apps",
    "Web products & SaaS",
    "Onboarding & activation flows",
    "Consumer products at scale",
  ],
};

// ── AFFINITY COPY ─────────────────────────────────────────────────────
var AFFINITY_COPY = {
  product: {
    conscience: {
      question:
        "When a product ships with flows you know are confusing, or research that was skipped to hit a deadline — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about the quality of the experience, independent of whether stakeholders notice.",
    },
    pull: {
      question:
        "Outside of work, with no deadlines and no brief, how often does your mind drift toward how products could work better — flows, decisions, moments of friction?",
      explanation:
        "This tells us whether product thinking is something you're naturally drawn to, or something you do primarily because it pays well.",
    },
  },
  interaction: {
    conscience: {
      question:
        "When an interaction you designed feels clunky in use — a transition that's off, a state that's confusing — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about the craft of how things behave, independent of whether anyone else notices.",
    },
    pull: {
      question:
        "Outside of work, how often do you find yourself noticing and mentally redesigning interactions in apps, devices, or everyday objects?",
      explanation:
        "This tells us whether interaction design is a genuine obsession, or primarily a professional skill.",
    },
  },
  visual_brand: {
    conscience: {
      question:
        "When work goes out that doesn't meet your visual standard — wrong hierarchy, weak typography, compromised brand — how does that sit with you?",
      explanation:
        "This tells us whether visual quality genuinely matters to you, independent of whether the client or team notices.",
    },
    pull: {
      question:
        "Outside of work, how often does your eye catch and critique the visual design around you — logos, layouts, packaging, screens?",
      explanation:
        "This tells us whether visual thinking is wired into how you see the world, or something you switch on at work.",
    },
  },
  ux_researcher: {
    conscience: {
      question:
        "When research gets cut short, findings get misrepresented, or decisions get made without talking to users — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about rigorous, honest research, independent of whether the team pushes back.",
    },
    pull: {
      question:
        "Outside of work, how often does your mind drift toward why people behave the way they do — decisions, habits, workarounds, irrational choices?",
      explanation:
        "This tells us whether human behavior is something you're genuinely curious about, or a professional tool you apply at work.",
    },
  },
  content: {
    conscience: {
      question:
        "When copy ships that's unclear, inconsistent, or doesn't respect the reader's intelligence — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about the quality of language in products, independent of whether anyone audits it.",
    },
    pull: {
      question:
        "Outside of work, how often do you notice and mentally rewrite the words around you — interfaces, signs, emails, instructions?",
      explanation:
        "This tells us whether language and clarity are a natural obsession, or skills you apply professionally.",
    },
  },
  design_ops: {
    conscience: {
      question:
        "When design processes are inefficient, inconsistent, or slowing the team down and no one is fixing it — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about how design teams operate, independent of whether it's your job to fix it.",
    },
    pull: {
      question:
        "Outside of work, how often do you think about how systems, processes, and teams could be better organized and run?",
      explanation:
        "This tells us whether operational thinking comes naturally to you, or is a role you've grown into.",
    },
  },
  motion: {
    conscience: {
      question:
        "When animation ships that feels mechanical, mistimed, or doesn't serve the experience — how does that sit with you?",
      explanation:
        "This tells us whether motion craft genuinely matters to you, independent of whether the product team notices the difference.",
    },
    pull: {
      question:
        "Outside of work, how often do you notice and mentally rework the motion and timing around you — in apps, film, physical objects?",
      explanation:
        "This tells us whether motion is a deep creative obsession, or a specialized skill you apply at work.",
    },
  },
  service: {
    conscience: {
      question:
        "When a service journey has obvious gaps — handoffs that break, touchpoints that contradict each other, people falling through the cracks — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about the whole system, not just the digital screens.",
    },
    pull: {
      question:
        "Outside of work, how often does your mind map out the systems behind everyday experiences — why a service failed, where the breakdown happened, how it could be redesigned?",
      explanation:
        "This tells us whether systems thinking is how your mind naturally works, or a framework you apply professionally.",
    },
  },
  strategist: {
    conscience: {
      question:
        "When design decisions get made without strategic grounding — no vision, no principles, no long-term thinking — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about design having organizational impact, not just delivering outputs.",
    },
    pull: {
      question:
        "Outside of work, how often do you find yourself thinking about the future — how industries will shift, how organizations need to change, what design's role in that looks like?",
      explanation:
        "This tells us whether strategic and futures thinking comes naturally to you, or is a professional mode you shift into.",
    },
  },
  ux_analyst: {
    conscience: {
      question:
        "When decisions get made on gut feel when the data says otherwise, or when metrics get cherry-picked to tell a convenient story — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about honest, rigorous analysis, independent of whether stakeholders want to hear it.",
    },
    pull: {
      question:
        "Outside of work, how often does your mind reach for data to explain things — patterns in behavior, anomalies in outcomes, questions that need a number to answer?",
      explanation:
        "This tells us whether quantitative thinking is how your brain naturally works, or a skill you apply in a professional context.",
    },
  },
  design_eng: {
    conscience: {
      question:
        "When a component ships that diverges from the system, breaks in edge cases, or doesn't match what you designed in Figma — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about design-to-code fidelity and craft, independent of whether the sprint goal was met.",
    },
    pull: {
      question:
        "Outside of work, how often do you find yourself inspecting how interfaces are built — inspecting source, prototyping ideas, or refining a component library for fun?",
      explanation:
        "This tells us whether bridging design and code is a genuine obsession, or a professional skill you apply when asked.",
    },
  },
  accessibility: {
    conscience: {
      question:
        "When a product ships with known barriers — missing labels, broken keyboard paths, contrast that fails WCAG — and the team treats it as a later fix — how does that sit with you?",
      explanation:
        "This tells us whether inclusive design genuinely matters to you, independent of whether legal or leadership is pushing for compliance.",
    },
    pull: {
      question:
        "Outside of work, how often do you notice who gets excluded — interfaces that assume sight or dexterity, content that isn't plain enough, experiences that weren't tested with assistive tech?",
      explanation:
        "This tells us whether accessibility thinking is how you naturally see products, or a specialization you apply on the job.",
    },
  },
  conversation: {
    conscience: {
      question:
        "When a voice or chat experience ships that's robotic, misleading, or fails gracefully when users go off-script — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about conversational craft and user trust, independent of whether the AI demo impressed stakeholders.",
    },
    pull: {
      question:
        "Outside of work, how often do you notice and mentally redesign how bots, assistants, and IVRs talk — tone, turn-taking, recovery when things go wrong?",
      explanation:
        "This tells us whether conversation and voice design is something you're drawn to, or a niche you work in professionally.",
    },
  },
};

// ── DESIGN TOKENS ─────────────────────────────────────────────────────
var S = {
  bg: "#f8f9fc",
  card: "#ffffff",
  card2: "#f2f4f8",
  border: "#d0d7e8",
  text: "#0d1117",
  muted: "#1e2a42",
  dim: "#4a5568",
  accent: "#1a1d2e",
  purple: "#7c3aed",
  gold: "#d97706",
  green: "#059669",
  red: "#dc2626",
  blue: "#2563eb",
  orange: "#ea580c",
  font: "system-ui,-apple-system,sans-serif",
  mono: "'Courier New',monospace",
  serif: "'Playfair Display',Georgia,serif",
};

var PROMO_CODES = ["DZFRIEND", "DZPREVIEW", "DZTEST"];

// ── MATH HELPERS ──────────────────────────────────────────────────────
var AFFINITY_STOPS = [0, 3, 5, 7, 10];

function snapToStop(val) {
  return AFFINITY_STOPS.reduce(function (prev, curr) {
    return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
  });
}

function getSeed(c, p) {
  var raw = (c + p) / 2;
  return snapToStop(raw);
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

function getOverallLabel(score) {
  if (score <= 39) return "Needs Attention";
  if (score <= 59) return "Moderate Exposure";
  if (score <= 74) return "Solid Foundation";
  if (score <= 89) return "Well Positioned";
  return "Exceptional";
}

function getOverallSublabel(score) {
  if (score <= 39) return "High exposure. Significant repositioning needed.";
  if (score <= 59) return "Moderate exposure. Some strong anchors, gaps to address.";
  if (score <= 74) return "Solid foundation. Targeted moves will strengthen your position.";
  if (score <= 89) return "Well positioned. Protect your anchors and extend your lead.";
  return "Exceptional. You're operating in rare territory.";
}

function getSkillInterpretation(aiRisk, mkt, aff) {
  if (aiRisk >= 7) return "High AI exposure — your affinity is what keeps this defensible.";
  if (aiRisk <= 3 && mkt >= 7) return "Low AI risk, high market value — a strong anchor.";
  if (aff >= 7 && aiRisk >= 6) return "Your affinity is your edge here — lean into it.";
  if (aff <= 3 && aiRisk >= 6) return "Vulnerable. Consider whether this is worth defending.";
  return "Moderate position — context and execution matter here.";
}

function buildProfile(roleType, seniority, isManager, companyTypeId, workFocus) {
  var rt = UX_ROLE_TYPES.find(function (r) { return r.id === roleType; });
  var ct = COMPANY_TYPES.find(function (c) { return c.id === companyTypeId; });
  var workFocusLabels = workFocus || [];
  var roleLabel = rt ? rt.title : roleType;
  var companyLabel = ct ? ct.label : (companyTypeId || "");
  var companySub = ct ? ct.sub : "";
  return {
    roleLabel: roleLabel,
    seniorityLabel: seniority,
    isManager: isManager,
    companyLabel: companyLabel,
    companySub: companySub,
    workFocusLabels: workFocusLabels,
    summary: seniority + " " + roleLabel + (companyLabel ? " · " + companyLabel : ""),
  };
}

// ── SHARED UI COMPONENTS ──────────────────────────────────────────────
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
      width: "100%", background: dis ? S.card : S.accent, color: dis ? S.dim : "white",
      border: "1px solid " + (dis ? S.border : S.accent), borderRadius: 12, padding: "18px 0",
      fontSize: 16, fontFamily: S.mono, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer",
      letterSpacing: "0.08em", transition: "all 0.2s",
    }, props.style)}>
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
      border: "1px solid " + (active ? S.gold : S.border),
      borderRadius: 20, padding: "6px 14px", cursor: "pointer",
      fontFamily: S.mono, fontSize: 12, fontWeight: active ? 700 : 500,
      transition: "all 0.15s", whiteSpace: "nowrap",
    }}>
      {props.label}
    </button>
  );
}

function UXDisclaimer() {
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
      <div style={{ fontFamily: S.mono, fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>
        This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment. Scores are estimates based on AI labor market research and model calibration — not a definitive evaluation of your skills or employability.
      </div>
    </div>
  );
}

function UXFooter() {
  return (
    <div style={{ marginTop: 32, background: S.card2, borderTop: "1px solid " + S.border, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginBottom: 4 }}>DEFENSIBLE ZONE™</div>
          <a
            href="https://defensiblezone.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.accent, textDecoration: "none" }}
            onMouseEnter={function (e) { e.currentTarget.style.opacity = "0.75"; }}
            onMouseLeave={function (e) { e.currentTarget.style.opacity = "1"; }}
          >
            defensiblezone.ai →
          </a>
        </div>
        <div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, marginBottom: 4 }}>QUESTIONS &amp; FEEDBACK</div>
          <a
            href="mailto:support@recursiolab.com"
            style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
            onMouseEnter={function (e) { e.currentTarget.style.opacity = "0.75"; }}
            onMouseLeave={function (e) { e.currentTarget.style.opacity = "1"; }}
          >
            support@recursiolab.com →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function UX() {
  var [roleType, setRoleType] = useState("");
  var [seniority, setSeniority] = useState("");
  var [isManager, setIsManager] = useState(false);
  var [companyTypeId, setCompanyTypeId] = useState("");
  var [workFocus, setWorkFocus] = useState([]);
  var [landscape, setLandscape] = useState("");
  var [skills, setSkills] = useState([]);
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  var [fluencies, setFluencies] = useState({});
  var [skillConscience, setSkillConscience] = useState({});
  var [skillPull, setSkillPull] = useState({});
  var [adjustedSkills, setAdjustedSkills] = useState(function () { return new Set(); });
  var [results, setResults] = useState(null);
  var [benchmark, setBenchmark] = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [step, setStep] = useState(1);
  var [tier, setTier] = useState(0);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [promoUsed, setPromoUsed] = useState(false);
  var [discountApplied, setDiscountApplied] = useState(false);
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState("");
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [checkoutLoading, setCheckoutLoading] = useState(false);
  var [checkoutError, setCheckoutError] = useState(null);
  var [paymentCanceled, setPaymentCanceled] = useState(false);
  var [resultsLoading, setResultsLoading] = useState(false);
  var [resultsError, setResultsError] = useState(null);
  var freeEmailSentRef = useRef(false);
  var [freeEmailSentDisplay, setFreeEmailSentDisplay] = useState(false);
  var paidEmailSentRef = useRef(false);
  var [paidEmailSentDisplay, setPaidEmailSentDisplay] = useState(false);
  var [hoveredCard, setHoveredCard] = useState(null);
  var [customSkill, setCustomSkill] = useState("");
  var [showAllFocus, setShowAllFocus] = useState(false);

  var adjustedSkillsRef = useRef(new Set());

  useEffect(function() {
    document.body.style.background = S.bg;
    return function() {
      document.body.style.background = "";
    };
  }, []);

  var UX_LOADING_MSGS = [
    "Mapping your UX landscape…",
    "Identifying your exposure points…",
    "Calibrating skill defensibility…",
    "Almost ready…",
  ];
  var UX_SCORING_MSGS = [
    "Scoring your skills…",
    "Calculating AI exposure…",
    "Building your defensible zone…",
    "Almost there…",
  ];
  var UX_RECS_MSGS = [
    "Mapping your 90-day plan…",
    "Sequencing your actions…",
    "Personalising to your profile…",
    "Almost ready…",
  ];

  function markAdjusted(skillId) {
    adjustedSkillsRef.current.add(skillId);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  useEffect(function () {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(function () {
    if (window.gtag) {
      window.gtag("event", "assessment_step", {
        product: "ux",
        step_number: step,
      });
    }
  }, [step]);

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
    setSkillConscience(function (prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function (s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = conscience;
        }
      });
      return next;
    });
    setSkillPull(function (prev) {
      var next = Object.assign({}, prev);
      skills.forEach(function (s) {
        if (!adjustedSkillsRef.current.has(s.id)) {
          next[s.id] = pull;
        }
      });
      return next;
    });
  }, [conscience, pull, skills]);

  useEffect(
    function () {
      if (!loading && !recsLoading) return;
      var msgs = recsLoading ? UX_RECS_MSGS : (step === 4 || step === 5) ? UX_SCORING_MSGS : UX_LOADING_MSGS;
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
          body: JSON.stringify({ token: gateToken, product: "ux" }),
        });
        var data = await res.json();
        if (data && data.valid === true) {
          if (data.email) setGateEmail(data.email);
          var restored = restoreSavedReport();
          setGateVerified(true);
          setGateLoading(false);
          if (!restored) {
            setGateOnDifferentDevice(true);
          }
          return;
        }
        if (data && data.valid === false && data.reason === "expired") {
          setGateError("expired");
        } else {
          setGateError("invalid");
        }
        setGateLoading(false);
      } catch (e) {
        setGateError("invalid");
        setGateLoading(false);
      }
    })();
  }, []);

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      restoreSavedReport();
      setGateVerified(true);
      setTier(2);
      setPaymentCanceled(false);
      setStep(6);
      return;
    }
    if (params.get("canceled") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      restoreSavedReport();
      setGateVerified(true);
      setStep(5);
      setPaymentCanceled(true);
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

  useEffect(function() {
    if (step !== 6) return;
    if (!recommendations) return;
    if (!(tier >= 2 || promoUsed)) return;
    sendPaidReportEmail();
  }, [step, recommendations, tier, promoUsed]);

  useEffect(function () {
    if (step !== 4) return;
    if (!results || !results.skills || results.skills.length === 0) return;
    if (recommendations || recsLoading) return;
    fetchRecommendations();
  }, [step, results]);

  useEffect(
    function () {
      if (!gateVerified) return;
      if (gateOnDifferentDevice) return;
      if (results || loading) return;
      if (!roleType || !seniority) return;
      fetchScores();
    },
    [gateVerified, gateOnDifferentDevice, roleType, seniority]
  );

  function restoreSavedReport() {
    try {
      var savedRaw = localStorage.getItem("dz_saved_report_ux");
      if (!savedRaw) return false;
      var s = JSON.parse(savedRaw);
      if (s.roleType) setRoleType(s.roleType);
      if (s.seniority) setSeniority(s.seniority);
      if (s.isManager !== undefined) setIsManager(s.isManager);
      if (s.companyTypeId) setCompanyTypeId(s.companyTypeId);
      if (s.workFocus) setWorkFocus(s.workFocus);
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

  function saveStateForReturn(overrides) {
    overrides = overrides || {};
    try {
      localStorage.setItem(
        "dz_saved_report_ux",
        JSON.stringify({
          roleType: roleType,
          seniority: seniority,
          isManager: isManager,
          companyTypeId: companyTypeId,
          workFocus: workFocus,
          conscience: conscience,
          pull: pull,
          gateEmail: gateEmail,
          landscape: landscape,
          skills: skills,
          fluencies: fluencies,
          skillConscience: skillConscience,
          skillPull: skillPull,
          results: overrides.results !== undefined ? overrides.results : results,
          tier: tier,
          promoUsed: promoUsed,
          discountApplied: discountApplied,
        })
      );
    } catch (_e) {}
  }

  async function handleUnlockCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    saveStateForReturn();
    try {
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "ux",
          email: gateEmail.trim(),
          price: 7900,
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
    var profile = buildProfile(roleType, seniority, isManager, companyTypeId, workFocus);
    var wfStr = profile.workFocusLabels.join(", ");
    var prompt =
      "You are a senior UX and design career strategist specializing in AI labor market analysis for UX professionals.\n\nUX PROFILE:\n- Role: " +
      profile.roleLabel +
      "\n- Seniority: " +
      profile.seniorityLabel +
      "\n- People manager: " +
      (isManager ? "yes" : "no") +
      "\n- Company type: " +
      (profile.companyLabel || "not specified") +
      (profile.companySub ? " — " + profile.companySub : "") +
      "\n- Work focus: " +
      wfStr +
      "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about the AI threat to this exact UX profile in 2026. Name specific tools (Figma AI, Adobe Firefly, Galileo AI, Midjourney, Claude, v0, Cursor), specific tasks being automated, and where the real exposure is at this seniority level doing this work. Do not write generic AI commentary — be specific to this combination of role, seniority, manager status, company type, and work focus.\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a " +
      profile.seniorityLabel +
      " " +
      profile.roleLabel +
      (isManager ? " (people manager)" : "") +
      " working on " +
      wfStr +
      " to assess for AI defensibility right now. Be precise and UX-specific — not generic. Include a realistic mix: some defensible, some genuinely at risk. Weight toward skills that differentiate at the " +
      profile.seniorityLabel +
      " level.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";

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
      if (!data.content) throw new Error(data.error || data.error_description || "API error");
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
          if (!data2.content) throw new Error(data2.error || "API error");
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
    setError(null);
    var profile = buildProfile(roleType, seniority, isManager, companyTypeId, workFocus);
    var wfStr = profile.workFocusLabels.join(", ");
    var skillSummary = skills
      .map(function (s, i) {
        var fluencyVal = fluencies[s.id] !== undefined ? fluencies[s.id] : getSeed(conscience, pull);
        var sc = skillConscience[s.id] !== undefined ? skillConscience[s.id] : conscience;
        var sp = skillPull[s.id] !== undefined ? skillPull[s.id] : pull;
        var aff = compAff(sc, sp, fluencyVal);
        return (
          i +
          1 +
          ". " +
          s.text +
          " (conscience: " +
          sc +
          "/10, pull: " +
          sp +
          "/10, fluency: " +
          fluencyVal +
          "/10, affinity: " +
          aff +
          "/10)"
        );
      })
      .join("\n");
    var prompt =
      "You are a senior UX and design career strategist with deep knowledge of the 2026 AI labor market.\n\nUX PROFILE:\n- Role: " +
      profile.roleLabel +
      "\n- Seniority: " +
      profile.seniorityLabel +
      "\n- People manager: " +
      (isManager ? "yes" : "no") +
      "\n- Company type: " +
      (profile.companyLabel || "not specified") +
      "\n- Work focus: " +
      wfStr +
      "\n\nSkills to score:\n" +
      skillSummary +
      "\n\nFor each skill, return:\n- ai_replaceability: 1-10 (10 = AI is already doing this or will within 12 months; 1 = deeply human, irreplaceable)\n- market_demand: 1-10 (10 = extremely high market value right now for this UX role and seniority)\n\nBe honest and precise. Score for this exact profile — do not default to middle values.\n\nReturn ONLY valid JSON:\n{\"scores\":[{\"id\":\"s0\",\"name\":\"skill name\",\"ai_replaceability\":N,\"market_demand\":N},{...}]}";

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
      if (!data.content) throw new Error(data.error || "API error");
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
        var sc = skillConscience[id] !== undefined ? skillConscience[id] : conscience;
        var sp = skillPull[id] !== undefined ? skillPull[id] : pull;
        var aff = compAff(sc, sp, fluencyVal);
        var aiR = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
        var mkt = typeof scored.market_demand === "number" ? scored.market_demand : 7;
        var dz = calcDZ(aff, aiR, mkt);
        return {
          id: id,
          text: found ? found.text : scored.name,
          conscience: sc,
          pull: sp,
          fluency: fluencyVal,
          affinity: aff,
          ai_replaceability: aiR,
          market_demand: mkt,
          dz: dz,
        };
      });
      var resultsPayload = { skills: enriched, profile: profile, landscape: landscape };
      setResults(resultsPayload);
      saveStateForReturn({ results: resultsPayload });
      sendFreeResultsEmail();
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
          if (!data2.content) throw new Error(data2.error || "API error");
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
            var sc2 = skillConscience[id2] !== undefined ? skillConscience[id2] : conscience;
            var sp2 = skillPull[id2] !== undefined ? skillPull[id2] : pull;
            var aff2 = compAff(sc2, sp2, fluencyVal2);
            var aiR2 = typeof scored.ai_replaceability === "number" ? scored.ai_replaceability : 5;
            var mkt2 = typeof scored.market_demand === "number" ? scored.market_demand : 7;
            var dz2 = calcDZ(aff2, aiR2, mkt2);
            return {
              id: id2,
              text: found2 ? found2.text : scored.name,
              conscience: sc2,
              pull: sp2,
              fluency: fluencyVal2,
              affinity: aff2,
              ai_replaceability: aiR2,
              market_demand: mkt2,
              dz: dz2,
            };
          });
          var resultsPayload2 = { skills: enriched2, profile: profile, landscape: landscape };
          setResults(resultsPayload2);
          saveStateForReturn({ results: resultsPayload2 });
          sendFreeResultsEmail();
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
    if (!results || !results.skills || results.skills.length === 0) return;
    setRecsLoading(true);
    setRecsError(null);
    var profile = results.profile || buildProfile(roleType, seniority, isManager, companyTypeId, workFocus);
    var wfStr = profile.workFocusLabels.join(", ");
    var skillSummary = results.skills
      .map(function (sk, i) {
        var aiR = typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : 5;
        var mkt = typeof sk.market_demand === "number" ? sk.market_demand : 7;
        var dz = typeof sk.dz === "number" ? sk.dz : 0;
        return (
          i +
          1 +
          ". [" +
          sk.id +
          "] " +
          sk.text +
          " (DZ: " +
          dz +
          ", AI replaceability: " +
          aiR +
          "/10, market demand: " +
          mkt +
          "/10)"
        );
      })
      .join("\n");
    var prompt =
      "You are a senior UX and design career strategist. A " +
      profile.seniorityLabel +
      " " +
      profile.roleLabel +
      (isManager ? " (people manager)" : "") +
      " at " +
      (profile.companyLabel || "not specified") +
      " focused on " +
      wfStr +
      " just completed a Defensible Zone assessment.\n\nWrite exactly 8 recommendations — one per skill — grouped into exactly 3 phases:\n\nPhase 1 — Anchor (protect your most defensible skills): skills with high DZ and low AI replaceability\nPhase 2 — Reposition (address your highest-exposure skills): skills with high AI replaceability or low DZ\nPhase 3 — Extend (build new capabilities to widen your zone): skills where building fluency or new adjacent capabilities would widen their defensible zone\n\nEach recommendation must have:\n- id: matching the skill id (s0–s7)\n- phase: 1, 2, or 3\n- phaseLabel: \"Anchor\", \"Reposition\", or \"Extend\"\n- headline: 5-7 words\n- action: one specific thing to do in the next 90 days\n- why: one sentence on why this matters for their exact situation\n\nSkills with scores:\n" +
      skillSummary +
      '\n\nReturn ONLY valid JSON:\n{"recommendations":[{"id":"s0","phase":1,"phaseLabel":"Anchor","headline":"...","action":"...","why":"..."},{...}]}';

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
      var parsed = JSON.parse(m[0]);
      setRecommendations(parsed);
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
              max_tokens: 2000,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          var data2 = await res2.json();
          if (!data2.content) throw new Error(data2.error || "API error");
          var raw2 = data2.content
            .map(function (b) {
              return b.text || "";
            })
            .join("");
          var m2 = raw2.match(/\{[\s\S]*\}/);
          if (!m2) throw new Error("No JSON in response");
          var parsed2 = JSON.parse(m2[0]);
          setRecommendations(parsed2);
        } catch (e2) {
          setRecsError("Something went wrong — please try again in a moment.");
        }
      } else {
        setRecsError("Something went wrong — please try again in a moment.");
      }
    } finally {
      setRecsLoading(false);
    }
  }

  function sendFreeResultsEmail() {
    if (freeEmailSentRef.current) return;
    if (!gateEmail.trim() || !results) return;
    freeEmailSentRef.current = true;
    setFreeEmailSentDisplay(true);
    try {
      fetch("/api/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail,
          product: "ux",
          type: "free_results",
          profile: buildProfile(roleType, seniority, isManager, companyTypeId, workFocus),
          skills: results.skills,
          landscape: landscape,
        }),
      }).catch(function () {});
    } catch (_e) {}
  }

  function sendPaidReportEmail() {
    if (paidEmailSentRef.current) return;
    if (!gateEmail.trim() || !results) return;
    paidEmailSentRef.current = true;
    setPaidEmailSentDisplay(true);
    try {
      fetch("/api/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail,
          product: "ux",
          type: "paid_report",
          profile: buildProfile(roleType, seniority, isManager, companyTypeId, workFocus),
          skills: results.skills,
          landscape: landscape,
          recommendations: recommendations,
        }),
      }).catch(function () {});
    } catch (_e) {}
  }

  var progressPct = step >= 1 && step <= 4 ? (step / 5) * 100 : 0;
  var showGateExpiredInvalid = gateError === "expired" || gateError === "invalid";
  var gateEmailEmptyError = gateError === "empty";
  var contextOptions = roleType ? CONTEXT_MAP[roleType] || [] : [];
  var extraFocusOptions = showAllFocus
    ? WORK_FOCUS_OPTIONS.filter(function (opt) {
        return contextOptions.indexOf(opt) === -1;
      })
    : [];
  var step2SeniorityErr = step === 2 && (resultsError === "seniority" || resultsError === "both");
  var step2WorkFocusErr = step === 2 && (resultsError === "workFocus" || resultsError === "both");

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes uxDZPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.94)}}" +
            "@keyframes uxDots{0%,100%{opacity:.25}50%{opacity:1}}" +
            "@keyframes uxSpin{to{transform:rotate(360deg)}}" +
            ".ux-role-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}" +
            "@media(min-width:768px){.ux-role-grid{grid-template-columns:repeat(3,1fr)}}" +
            ".ux-company-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}" +
            "input[type=range].ux-dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none}" +
            "input[type=range].ux-dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)}" +
            "input[type=range].ux-dz-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer}",
        }}
      />

      {loading ? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: S.purple,
              color: "#fff",
              fontFamily: S.mono,
              fontWeight: 700,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "uxDZPulse 1.4s ease-in-out infinite",
              marginBottom: 24,
            }}
          >
            DZ
          </div>
          <div style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, letterSpacing: "0.06em", marginBottom: 16 }}>
            {loadingMsg}
          </div>
          <div style={{ display: "flex", gap: 6, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
            <span style={{ animation: "uxDots 1s ease-in-out infinite" }}>.</span>
            <span style={{ animation: "uxDots 1s ease-in-out 0.2s infinite" }}>.</span>
            <span style={{ animation: "uxDots 1s ease-in-out 0.4s infinite" }}>.</span>
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            boxSizing: "border-box",
          }}
        >
          <Card style={{ maxWidth: 480, width: "100%", border: "1px solid " + S.red, textAlign: "center" }}>
            <p style={{ color: S.red, fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" }}>{error}</p>
            <PrimaryBtn
              onClick={function () {
                setError(null);
                if (step < 3) fetchLandscapeAndSkills();
                else if (step >= 3) fetchScores();
              }}
              style={{ maxWidth: 280, margin: "0 auto" }}
            >
              Try Again
            </PrimaryBtn>
          </Card>
        </div>
      ) : (
        <>
          {step >= 1 && step <= 4 ? (
            <div style={{ padding: "0 20px", maxWidth: 720, margin: "0 auto" }}>
              <div style={{ height: 3, background: S.border, borderRadius: 2, overflow: "hidden", marginTop: 0 }}>
                <div
                  style={{
                    height: "100%",
                    width: progressPct + "%",
                    background: S.gold,
                    borderRadius: 2,
                    transition: "width 0.25s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 11,
                  color: S.dim,
                  letterSpacing: "0.08em",
                  marginTop: 8,
                  marginBottom: 24,
                  fontWeight: 600,
                }}
              >
                Step {step} of 5
              </div>
            </div>
          ) : null}

          {step === 4 && !gateVerified ? (
            <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px 40px", boxSizing: "border-box" }}>
              {gateLoading ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "3px solid " + S.border,
                      borderTop: "3px solid " + S.gold,
                      borderRadius: "50%",
                      animation: "uxSpin 0.85s linear infinite",
                      margin: "0 auto 16px",
                    }}
                  />
                  <div style={{ fontFamily: S.mono, fontSize: 14, color: S.muted }}>Verifying…</div>
                </div>
              ) : gateOnDifferentDevice ? (
                <Card style={{ textAlign: "center" }}>
                  <h2 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: "0 0 12px", fontWeight: 600 }}>
                    Looks like you opened this on a different device
                  </h2>
                  <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.7, margin: "0 0 24px" }}>
                    Your previous session wasn&apos;t found here. Re-enter your email to get a fresh link and start again.
                  </p>
                  <Label>YOUR EMAIL</Label>
                  <input
                    type="email"
                    value={gateEmail}
                    onFocus={function () {
                      setGateInputFocused(true);
                    }}
                    onBlur={function () {
                      setGateInputFocused(false);
                    }}
                    onChange={function (e) {
                      setGateEmail(e.target.value);
                      if (gateEmailEmptyError) setGateError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: 16,
                      fontFamily: S.font,
                      border:
                        "1px solid " +
                        (gateEmailEmptyError ? S.red : gateInputFocused ? S.gold : S.border),
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 12,
                    }}
                  />
                  <PrimaryBtn
                    onClick={async function () {
                      var trimmed = gateEmail.trim();
                      if (!trimmed) {
                        setGateError("empty");
                        return;
                      }
                      var at = trimmed.indexOf("@");
                      if (at === -1 || trimmed.indexOf(".", at + 1) === -1) {
                        setGateError("Please enter a valid email address.");
                        return;
                      }
                      setGateError("");
                      setGateLoading(true);
                      try {
                        var res = await fetch("/api/send-gate-email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: trimmed, product: "ux" }),
                        });
                        var data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Request failed");
                        setGateEmail(trimmed);
                        setGateSent(true);
                        setGateOnDifferentDevice(false);
                        setGateVerified(false);
                        setShowResend(false);
                        setTimeout(function () {
                          setShowResend(true);
                        }, 15000);
                      } catch (e) {
                        setGateError("Something went wrong. Please try again.");
                      } finally {
                        setGateLoading(false);
                      }
                    }}
                  >
                    Send My Free Assessment →
                  </PrimaryBtn>
                </Card>
              ) : gateSent ? (
                <Card style={{ textAlign: "center" }}>
                  <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", fontWeight: 600 }}>
                    Check your email
                  </h2>
                  <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 20px" }}>
                    We sent a link to{" "}
                    <span style={{ fontFamily: S.mono, fontWeight: 600, color: S.muted }}>{gateEmail}</span>. Click it to
                    begin your assessment.
                  </p>
                  <p style={{ fontSize: 14, color: S.dim, margin: "0 0 8px" }}>
                    Wrong email?{" "}
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
                        fontSize: 14,
                        color: S.blue,
                        textDecoration: "underline",
                      }}
                    >
                      Edit
                    </button>
                  </p>
                  {showResend ? (
                    <button
                      type="button"
                      onClick={async function () {
                        setShowResend(false);
                        var trimmed = gateEmail.trim();
                        if (!trimmed) return;
                        setGateLoading(true);
                        try {
                          var res = await fetch("/api/send-gate-email", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: trimmed, product: "ux" }),
                          });
                          var data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Request failed");
                          setTimeout(function () {
                            setShowResend(true);
                          }, 15000);
                        } catch (e) {
                          setGateError("Something went wrong. Please try again.");
                        } finally {
                          setGateLoading(false);
                        }
                      }}
                      style={{
                        marginTop: 16,
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
                      Resend link
                    </button>
                  ) : null}
                </Card>
              ) : (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: S.purple,
                        color: "#fff",
                        fontFamily: S.mono,
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      DZ
                    </div>
                    <div>
                      <h1 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: 0, lineHeight: 1.2, fontWeight: 600 }}>
                        UX Professional AI Assessment
                      </h1>
                      <p style={{ fontSize: 15, color: S.dim, margin: "6px 0 0", lineHeight: 1.5 }}>
                        Find out where you stand. Free skill-by-skill results, instantly.
                      </p>
                    </div>
                  </div>

                  <ul style={{ margin: "0 0 24px", paddingLeft: 20, color: S.muted, fontSize: 14, lineHeight: 1.7 }}>
                    <li>Free: personalised skill scores and AI exposure map</li>
                    <li>Paid: full 90-day action plan across 3 phases — $79 one-time</li>
                    <li>Takes about 8 minutes — no account required</li>
                  </ul>

                  {gateError === "expired" ? (
                    <p style={{ color: S.red, fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>
                      That link has expired. Enter your email again to get a new one.
                    </p>
                  ) : null}
                  {gateError === "invalid" ? (
                    <p style={{ color: S.red, fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>
                      Something went wrong with that link. Try again.
                    </p>
                  ) : null}

                  <Label>YOUR EMAIL</Label>
                  <input
                    type="email"
                    value={gateEmail}
                    onFocus={function () {
                      setGateInputFocused(true);
                    }}
                    onBlur={function () {
                      setGateInputFocused(false);
                    }}
                    onChange={function (e) {
                      setGateEmail(e.target.value);
                      if (gateEmailEmptyError || showGateExpiredInvalid) setGateError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: 16,
                      fontFamily: S.font,
                      border:
                        "1px solid " +
                        (gateEmailEmptyError ? S.red : gateInputFocused ? S.gold : S.border),
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 8,
                    }}
                  />
                  {gateError && gateError !== "expired" && gateError !== "invalid" && gateError !== "empty" ? (
                    <p style={{ color: S.red, fontSize: 13, margin: "0 0 12px" }}>{gateError}</p>
                  ) : null}

                  <PrimaryBtn
                    onClick={async function () {
                      var trimmed = gateEmail.trim();
                      if (!trimmed) {
                        setGateError("empty");
                        return;
                      }
                      var at = trimmed.indexOf("@");
                      if (at === -1 || trimmed.indexOf(".", at + 1) === -1) {
                        setGateError("Please enter a valid email address.");
                        return;
                      }
                      setGateError("");
                      setGateLoading(true);
                      try {
                        var res = await fetch("/api/send-gate-email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: trimmed, product: "ux" }),
                        });
                        var data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Request failed");
                        setGateEmail(trimmed);
                        setGateSent(true);
                        setShowResend(false);
                        setTimeout(function () {
                          setShowResend(true);
                        }, 15000);
                      } catch (e) {
                        setGateError("Something went wrong. Please try again.");
                      } finally {
                        setGateLoading(false);
                      }
                    }}
                    style={{ marginTop: 8 }}
                  >
                    Send My Free Assessment →
                  </PrimaryBtn>
                </Card>
              )}

              <UXDisclaimer />
            </div>
          ) : null}

          {step === 1 ? (
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 28 }}>
                <Label style={{ color: S.gold, marginBottom: 10 }}>STEP 1 OF 5 — YOUR ROLE</Label>
                <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 10px", fontWeight: 600 }}>
                  What kind of UX professional are you?
                </h1>
                <p style={{ fontSize: 16, color: S.dim, margin: 0, lineHeight: 1.6 }}>
                  Choose the role that best describes your primary work.
                </p>
              </div>

              <div className="ux-role-grid" style={{ marginBottom: 28 }}>
                {UX_ROLE_TYPES.map(function (rt) {
                  var active = roleType === rt.id;
                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={function () {
                        setRoleType(rt.id);
                        setSeniority("");
                        setWorkFocus([]);
                        setPromoError("");
                      }}
                      onMouseEnter={function () {
                        setHoveredCard(rt.id);
                      }}
                      onMouseLeave={function () {
                        setHoveredCard(null);
                      }}
                      style={{
                        textAlign: "left",
                        padding: 16,
                        borderRadius: 12,
                        cursor: "pointer",
                        background: active ? "rgba(217,119,6,0.08)" : hoveredCard === rt.id ? S.card2 : S.card,
                        border: "2px solid " + (active ? S.gold : S.border),
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15, color: S.text, marginBottom: 4 }}>{rt.title}</div>
                      <div style={{ fontSize: 13, color: S.dim, lineHeight: 1.4 }}>{rt.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 28 }}>
                <Label>DO YOU MANAGE PEOPLE?</Label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={function () {
                      setIsManager(false);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: "12px 20px",
                      borderRadius: 24,
                      fontFamily: S.mono,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid " + (!isManager ? S.accent : S.border),
                      background: !isManager ? S.accent : S.card,
                      color: !isManager ? "#fff" : S.muted,
                    }}
                  >
                    Individual Contributor
                  </button>
                  <button
                    type="button"
                    onClick={function () {
                      setIsManager(true);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: "12px 20px",
                      borderRadius: 24,
                      fontFamily: S.mono,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid " + (isManager ? S.accent : S.border),
                      background: isManager ? S.accent : S.card,
                      color: isManager ? "#fff" : S.muted,
                    }}
                  >
                    People Manager
                  </button>
                </div>
              </div>

              {promoError ? <p style={{ color: S.red, fontSize: 14, margin: "0 0 16px" }}>{promoError}</p> : null}

              <PrimaryBtn
                disabled={!roleType}
                onClick={function () {
                  if (!roleType) {
                    setPromoError("Please select a role type to continue.");
                    return;
                  }
                  setPromoError("");
                  setStep(2);
                }}
              >
                Continue →
              </PrimaryBtn>
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 28 }}>
                <Label style={{ color: S.gold, marginBottom: 10 }}>STEP 2 OF 5 — YOUR PROFILE</Label>
                <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 10px", fontWeight: 600 }}>
                  Tell us about your situation
                </h1>
              </div>

              <Card style={{ marginBottom: 20 }}>
                <Label>YOUR LEVEL</Label>
                <select
                  value={seniority}
                  onChange={function (e) {
                    setSeniority(e.target.value);
                    setResultsError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    fontSize: 16,
                    fontFamily: S.font,
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    background: "#fff",
                    color: seniority ? S.text : S.dim,
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select your level</option>
                  {(SENIORITY_BY_TYPE[roleType] || []).map(function (lvl) {
                    return (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    );
                  })}
                </select>
                {step2SeniorityErr ? (
                  <p style={{ color: S.red, fontSize: 13, marginTop: 8, marginBottom: 0 }}>Please select your level.</p>
                ) : null}
              </Card>

              <Card style={{ marginBottom: 20 }}>
                <Label>WHERE YOU WORK</Label>
                <div className="ux-company-grid">
                  {COMPANY_TYPES.map(function (ct) {
                    var active = companyTypeId === ct.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={function () {
                          setCompanyTypeId(ct.id);
                        }}
                        style={{
                          textAlign: "left",
                          padding: 14,
                          borderRadius: 10,
                          cursor: "pointer",
                          background: active ? "rgba(217,119,6,0.08)" : S.card,
                          border: "2px solid " + (active ? S.gold : S.border),
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 14, color: S.text }}>{ct.label}</div>
                        <div style={{ fontSize: 12, color: S.dim, marginTop: 4, lineHeight: 1.35 }}>{ct.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card style={{ marginBottom: 24 }}>
                <Label>WHAT YOU WORK ON</Label>
                <p style={{ fontSize: 14, color: S.dim, margin: "0 0 16px", lineHeight: 1.5 }}>Choose up to 4 areas</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {contextOptions.map(function (opt) {
                    var active = workFocus.indexOf(opt) !== -1;
                    return (
                      <Chip
                        key={opt}
                        label={opt}
                        active={active}
                        onClick={function () {
                          setCheckoutError("");
                          if (active) {
                            setWorkFocus(
                              workFocus.filter(function (x) {
                                return x !== opt;
                              })
                            );
                          } else if (workFocus.length >= 4) {
                            setCheckoutError("Pick up to 4 areas");
                          } else {
                            setWorkFocus(workFocus.concat([opt]));
                          }
                        }}
                      />
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={function () {
                    setShowAllFocus(!showAllFocus);
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
                    marginBottom: 12,
                  }}
                >
                  {showAllFocus ? "Show fewer areas" : "Show all areas"}
                </button>
                {showAllFocus ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {extraFocusOptions.map(function (opt) {
                      var active = workFocus.indexOf(opt) !== -1;
                      return (
                        <Chip
                          key={opt}
                          label={opt}
                          active={active}
                          onClick={function () {
                            setCheckoutError("");
                            if (active) {
                              setWorkFocus(
                                workFocus.filter(function (x) {
                                  return x !== opt;
                                })
                              );
                            } else if (workFocus.length >= 4) {
                              setCheckoutError("Pick up to 4 areas");
                            } else {
                              setWorkFocus(workFocus.concat([opt]));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                ) : null}
                {checkoutError ? <p style={{ color: S.red, fontSize: 13, marginTop: 12, marginBottom: 0 }}>{checkoutError}</p> : null}
                {step2WorkFocusErr ? (
                  <p style={{ color: S.red, fontSize: 13, marginTop: 8, marginBottom: 0 }}>Select at least one area.</p>
                ) : null}
              </Card>

              <button
                type="button"
                onClick={function () {
                  setStep(1);
                  setResultsError("");
                  setCheckoutError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: S.dim,
                  marginBottom: 20,
                  textDecoration: "underline",
                }}
              >
                ← Back
              </button>

              <PrimaryBtn
                disabled={!seniority || workFocus.length === 0}
                onClick={function () {
                  if (!seniority && workFocus.length === 0) {
                    setResultsError("both");
                    return;
                  }
                  if (!seniority) {
                    setResultsError("seniority");
                    return;
                  }
                  if (workFocus.length === 0) {
                    setResultsError("workFocus");
                    return;
                  }
                  setResultsError("");
                  fetchLandscapeAndSkills();
                }}
              >
                Analyse My Skills →
              </PrimaryBtn>
            </div>
          ) : null}

          {step === 3 && !loading ? (
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 40px", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 28 }}>
                <Label style={{ color: S.gold, marginBottom: 10 }}>STEP 3 OF 5 — YOUR AFFINITY</Label>
                <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 10px", fontWeight: 600 }}>
                  How do you feel about this work?
                </h1>
                <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: 0 }}>
                  Be honest. This calibrates your scores more accurately than anything else.
                </p>
              </div>

              <Card style={{ marginBottom: 20 }}>
                <Label>HOW YOU FEEL ABOUT YOUR WORK IN GENERAL</Label>
                {["conscience", "pull"].map(function (key) {
                  var copy = (AFFINITY_COPY[roleType] || AFFINITY_COPY.product)[key];
                  var val = key === "conscience" ? conscience : pull;
                  var setVal = key === "conscience" ? setConscience : setPull;
                  return (
                    <div key={key} style={{ marginBottom: key === "conscience" ? 28 : 0 }}>
                      <p style={{ fontSize: 16, color: S.text, lineHeight: 1.55, margin: "0 0 6px" }}>{copy.question}</p>
                      <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, lineHeight: 1.5, margin: "0 0 16px" }}>{copy.explanation}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <input
                          className="ux-dz-slider"
                          type="range"
                          min={0}
                          max={10}
                          step={1}
                          value={val}
                          onChange={function (e) {
                            setVal(Number(e.target.value));
                          }}
                          style={{
                            flex: 1,
                            background: "linear-gradient(to right, " + S.gold + " " + val * 10 + "%, " + S.border + " " + val * 10 + "%)",
                          }}
                        />
                        <span style={{ fontFamily: S.mono, fontSize: 36, fontWeight: 700, color: S.gold, minWidth: 44, textAlign: "right", lineHeight: 1 }}>
                          {val}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim }}>0 — Not really</span>
                        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim }}>10 — Deeply</span>
                      </div>
                    </div>
                  );
                })}
              </Card>

              <Card style={{ marginBottom: 24 }}>
                <Label>YOUR SKILL-BY-SKILL FLUENCY</Label>
                <p style={{ fontSize: 14, color: S.dim, margin: "0 0 20px", lineHeight: 1.5 }}>
                  These are seeded from your global scores. Adjust any that feel off.
                </p>
                {skills.map(function (skill) {
                  var fluencyVal = fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull);
                  return (
                    <div key={skill.id} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid " + S.border }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        {skill.editing ? (
                          <input
                            autoFocus
                            value={skill.text}
                            onChange={function (e) {
                              setSkills(
                                skills.map(function (s) {
                                  return s.id === skill.id ? Object.assign({}, s, { text: e.target.value }) : s;
                                })
                              );
                            }}
                            onBlur={function () {
                              setSkills(
                                skills.map(function (s) {
                                  return s.id === skill.id ? Object.assign({}, s, { editing: false }) : s;
                                })
                              );
                            }}
                            onKeyDown={function (e) {
                              if (e.key === "Enter") {
                                setSkills(
                                  skills.map(function (s) {
                                    return s.id === skill.id ? Object.assign({}, s, { editing: false }) : s;
                                  })
                                );
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: 160,
                              padding: "10px 12px",
                              fontSize: 16,
                              fontFamily: S.font,
                              border: "1px solid " + S.border,
                              borderRadius: 8,
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          <>
                            <span style={{ fontSize: 16, fontWeight: 600, color: S.text, flex: 1, lineHeight: 1.35 }}>{skill.text}</span>
                            <button
                              type="button"
                              onClick={function () {
                                setSkills(
                                  skills.map(function (s) {
                                    return s.id === skill.id ? Object.assign({}, s, { editing: true }) : s;
                                  })
                                );
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                fontSize: 14,
                                color: S.dim,
                                lineHeight: 1,
                              }}
                              aria-label="Edit skill name"
                            >
                              ✎
                            </button>
                          </>
                        )}
                        {adjustedSkills.has(skill.id) ? (
                          <span
                            style={{
                              fontFamily: S.mono,
                              fontSize: 10,
                              color: S.gold,
                              background: "rgba(217,119,6,0.12)",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 700,
                            }}
                          >
                            adjusted
                          </span>
                        ) : null}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <input
                          className="ux-dz-slider"
                          type="range"
                          min={0}
                          max={10}
                          step={1}
                          value={fluencyVal}
                          onChange={function (e) {
                            var v = Number(e.target.value);
                            markAdjusted(skill.id);
                            setFluencies(function (prev) {
                              return Object.assign({}, prev, { [skill.id]: v });
                            });
                          }}
                          style={{
                            flex: 1,
                            background: "linear-gradient(to right, " + S.gold + " " + fluencyVal * 10 + "%, " + S.border + " " + fluencyVal * 10 + "%)",
                          }}
                        />
                        <span style={{ fontFamily: S.mono, fontSize: 28, fontWeight: 700, color: S.gold, minWidth: 36, textAlign: "right", lineHeight: 1 }}>
                          {fluencyVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <input
                    type="text"
                    value={customSkill}
                    placeholder="Add a skill not listed above…"
                    onChange={function (e) {
                      setCustomSkill(e.target.value);
                    }}
                    onKeyDown={function (e) {
                      if (e.key === "Enter" && customSkill.trim()) {
                        setSkills(skills.concat([{ id: "s" + skills.length, text: customSkill.trim(), editing: false }]));
                        setCustomSkill("");
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      fontSize: 15,
                      fontFamily: S.font,
                      border: "1px solid " + S.border,
                      borderRadius: 10,
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={function () {
                      if (!customSkill.trim()) return;
                      setSkills(skills.concat([{ id: "s" + skills.length, text: customSkill.trim(), editing: false }]));
                      setCustomSkill("");
                    }}
                    style={{
                      background: S.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 16px",
                      fontFamily: S.mono,
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: customSkill.trim() ? "pointer" : "not-allowed",
                      opacity: customSkill.trim() ? 1 : 0.5,
                    }}
                  >
                    +
                  </button>
                </div>
              </Card>

              <button
                type="button"
                onClick={function () {
                  setStep(2);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: S.dim,
                  marginBottom: 20,
                  textDecoration: "underline",
                }}
              >
                ← Back
              </button>

              <PrimaryBtn
                disabled={skills.length === 0}
                onClick={function() {
                  saveStateForReturn();
                  setStep(4);
                }}
              >
                Score My Skills →
              </PrimaryBtn>
            </div>
          ) : null}

          {gateVerified && (step === 4 || (step === 5 && results)) && results && !loading ? (
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 48px", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 28 }}>
                <Label style={{ color: S.gold, marginBottom: 10 }}>STEP 4 OF 5 — YOUR RESULTS</Label>
                <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 12px", fontWeight: 600, lineHeight: 1.2 }}>
                  {results.profile && results.profile.summary ? results.profile.summary : buildProfile(roleType, seniority, isManager, companyTypeId, workFocus).summary}
                </h1>
                {results.landscape ? (
                  <p style={{ fontSize: 16, color: S.dim, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{results.landscape}</p>
                ) : null}
              </div>

              {(function () {
                var scoredSkills = results.skills || [];
                var overallDZ =
                  scoredSkills.length > 0
                    ? Math.round(
                        scoredSkills.reduce(function (sum, sk) {
                          return sum + (typeof sk.dz === "number" ? sk.dz : 0);
                        }, 0) / scoredSkills.length
                      )
                    : 0;
                var overallCol = dzScoreColor(overallDZ);
                var recsList = recommendations
                  ? Array.isArray(recommendations)
                    ? recommendations
                    : recommendations.recommendations || []
                  : [];
                var sortedRecs = recsList.slice().sort(function (a, b) {
                  return (a.phase || 1) - (b.phase || 1);
                });
                var phaseMeta = [
                  { phase: 1, pill: "Phase 1 — Anchor", color: S.green },
                  { phase: 2, pill: "Phase 2 — Reposition", color: S.gold },
                  { phase: 3, pill: "Phase 3 — Extend", color: S.purple },
                ];
                var recGlobalIdx = 0;

                function aiMetricColor(v) {
                  if (v >= 7) return S.red;
                  if (v >= 4) return S.gold;
                  return S.green;
                }

                return (
                  <>
                    <Card style={{ marginBottom: 28, textAlign: "center" }}>
                      <div style={{ fontFamily: S.mono, fontSize: 48, fontWeight: 700, color: overallCol, lineHeight: 1, marginBottom: 8 }}>{overallDZ}</div>
                      <div style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 600, color: overallCol, marginBottom: 6 }}>{getOverallLabel(overallDZ)}</div>
                      <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 16px" }}>{getOverallSublabel(overallDZ)}</p>
                      <div style={{ height: 4, background: S.card2, borderRadius: 2, overflow: "hidden", maxWidth: 320, margin: "0 auto" }}>
                        <div style={{ width: overallDZ + "%", height: "100%", background: S.gold, borderRadius: 2 }} />
                      </div>
                    </Card>

                    {scoredSkills.map(function (skill) {
                      var dz = typeof skill.dz === "number" ? skill.dz : 0;
                      var aiR = typeof skill.ai_replaceability === "number" ? skill.ai_replaceability : 5;
                      var mkt = typeof skill.market_demand === "number" ? skill.market_demand : 7;
                      var aff = typeof skill.affinity === "number" ? skill.affinity : 5;
                      var dzCol = dzScoreColor(dz);
                      var aiCol = aiMetricColor(aiR);
                      var mktCol = mkt >= 7 ? S.green : mkt >= 4 ? S.gold : S.dim;
                      var isHovered = hoveredCard === skill.id;
                      return (
                        <div
                          key={skill.id}
                          onMouseEnter={function () {
                            setHoveredCard(skill.id);
                          }}
                          onMouseLeave={function () {
                            setHoveredCard(null);
                          }}
                          style={{
                            background: S.card,
                            border: "1px solid " + S.border,
                            borderRadius: 14,
                            padding: "20px 22px",
                            marginBottom: 12,
                            boxShadow: isHovered ? "0 6px 20px rgba(0,0,0,0.08)" : "none",
                            transition: "box-shadow 0.2s ease",
                          }}
                        >
                          <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 16 }}>{skill.text}</div>

                          <div style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                              <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>DEFENSIBLE ZONE</span>
                              <span style={{ fontFamily: S.mono, fontSize: 32, fontWeight: 700, color: dzCol, lineHeight: 1 }}>{dz}</span>
                            </div>
                            <div style={{ height: 4, background: S.card2, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: dz + "%", height: "100%", background: dzCol, borderRadius: 2 }} />
                            </div>
                          </div>

                          <div style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>AI REPLACEABILITY</span>
                              <span style={{ fontFamily: S.mono, fontSize: 14, fontWeight: 700, color: aiCol }}>{aiR}/10</span>
                            </div>
                            <div style={{ height: 4, background: S.card2, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: (aiR / 10) * 100 + "%", height: "100%", background: aiCol, borderRadius: 2 }} />
                            </div>
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600 }}>MARKET DEMAND</span>
                              <span style={{ fontFamily: S.mono, fontSize: 14, fontWeight: 700, color: mktCol }}>{mkt}/10</span>
                            </div>
                            <div style={{ height: 4, background: S.card2, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: (mkt / 10) * 100 + "%", height: "100%", background: mktCol, borderRadius: 2 }} />
                            </div>
                          </div>

                          <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, lineHeight: 1.55, margin: 0 }}>
                            {getSkillInterpretation(aiR, mkt, aff)}
                          </p>
                        </div>
                      );
                    })}

                    {freeEmailSentDisplay ? (
                      <div
                        style={{
                          background: "rgba(5,150,105,0.08)",
                          border: "1px solid rgba(5,150,105,0.35)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          marginBottom: 28,
                          fontSize: 14,
                          color: S.green,
                          lineHeight: 1.5,
                        }}
                      >
                        ✓ Your free results have been emailed to {gateEmail}
                      </div>
                    ) : null}

                    <div style={{ marginTop: 36, marginBottom: 24 }}>
                      <h2 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: "0 0 8px", fontWeight: 600 }}>Your 90-Day Defensible Zone Plan</h2>
                      <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: 0 }}>
                        Based on your scores, we&apos;ve built a personalised action plan across 3 phases.
                      </p>
                    </div>

                    {recsLoading ? (
                      <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            border: "3px solid " + S.border,
                            borderTop: "3px solid " + S.gold,
                            borderRadius: "50%",
                            animation: "uxSpin 0.85s linear infinite",
                            margin: "0 auto 16px",
                          }}
                        />
                        <div style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, marginBottom: 6 }}>{loadingMsg}</div>
                        <div style={{ fontSize: 14, color: S.dim }}>Building your plan…</div>
                      </div>
                    ) : recsError ? (
                      <Card style={{ textAlign: "center", marginBottom: 24 }}>
                        <p style={{ color: S.red, fontSize: 15, margin: "0 0 16px" }}>{recsError}</p>
                        <PrimaryBtn
                          onClick={fetchRecommendations}
                          style={{ maxWidth: 240, margin: "0 auto" }}
                        >
                          Try Again
                        </PrimaryBtn>
                      </Card>
                    ) : sortedRecs.length > 0 ? (
                      <>
                        {phaseMeta.map(function (pm) {
                          var phaseRecs = sortedRecs.filter(function (r) {
                            return (r.phase || 1) === pm.phase;
                          });
                          if (phaseRecs.length === 0) return null;
                          return (
                            <div key={pm.phase} style={{ marginBottom: 28 }}>
                              <div
                                style={{
                                  display: "inline-block",
                                  fontFamily: S.mono,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#fff",
                                  background: pm.color,
                                  padding: "6px 12px",
                                  borderRadius: 20,
                                  letterSpacing: "0.04em",
                                  marginBottom: 6,
                                }}
                              >
                                {pm.pill}
                              </div>
                              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, marginBottom: 14 }}>
                                {phaseRecs.length} action{phaseRecs.length !== 1 ? "s" : ""}
                              </div>
                              {phaseRecs.map(function (rec) {
                                var isFirst = recGlobalIdx === 0;
                                recGlobalIdx += 1;
                                var cardInner = (
                                  <>
                                    <div
                                      style={{
                                        display: "inline-block",
                                        fontFamily: S.mono,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: pm.color,
                                        letterSpacing: "0.06em",
                                        marginBottom: 10,
                                      }}
                                    >
                                      {pm.pill}
                                    </div>
                                    <div style={{ fontFamily: S.serif, fontSize: 20, color: S.text, marginBottom: 10, lineHeight: 1.3, fontWeight: 600 }}>
                                      {rec.headline || "—"}
                                    </div>
                                    <p style={{ fontSize: 15, color: S.text, lineHeight: 1.6, margin: "0 0 10px" }}>{rec.action || ""}</p>
                                    <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>{rec.why || ""}</p>
                                  </>
                                );
                                if (isFirst) {
                                  return (
                                    <div
                                      key={rec.id || recGlobalIdx}
                                      style={{
                                        background: S.card,
                                        border: "1px solid " + S.border,
                                        borderLeft: "4px solid " + S.gold,
                                        borderRadius: 12,
                                        padding: "22px 24px",
                                        marginBottom: 12,
                                      }}
                                    >
                                      {cardInner}
                                    </div>
                                  );
                                }
                                return (
                                  <div
                                    key={rec.id || recGlobalIdx}
                                    style={{
                                      position: "relative",
                                      background: S.card,
                                      border: "1px solid " + S.border,
                                      borderRadius: 12,
                                      padding: "22px 24px",
                                      marginBottom: 12,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none" }}>{cardInner}</div>
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 28,
                                        pointerEvents: "none",
                                      }}
                                    >
                                      🔒
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}

                        <div
                          style={{
                            position: "sticky",
                            bottom: 16,
                            background: S.card,
                            border: "1px solid " + S.border,
                            borderRadius: 16,
                            padding: "28px 24px",
                            marginTop: 8,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            zIndex: 2,
                          }}
                        >
                          <h3 style={{ fontFamily: S.serif, fontSize: 24, color: S.text, margin: "0 0 8px", fontWeight: 600 }}>Unlock Your Full 90-Day Plan</h3>
                          <p style={{ fontSize: 15, color: S.dim, margin: "0 0 20px", lineHeight: 1.6 }}>One payment. Yours to keep.</p>
                          <div style={{ fontFamily: S.mono, fontSize: 42, fontWeight: 700, color: S.text, lineHeight: 1, marginBottom: 2 }}>$79</div>
                          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, marginBottom: 20 }}>one-time</div>
                          <ul style={{ margin: "0 0 24px", paddingLeft: 20, fontSize: 15, color: S.text, lineHeight: 1.7 }}>
                            <li>Full 8-recommendation plan across 3 phases</li>
                            <li>Personalised to your exact role, level, and company type</li>
                            <li>Emailed to you immediately after payment</li>
                          </ul>
                          {paymentCanceled ? (
                            <div
                              style={{
                                background: "#fef9ec",
                                border: "1px solid #f0c060",
                                borderRadius: 8,
                                padding: "10px 14px",
                                fontSize: 13,
                                color: "#92400e",
                                marginBottom: 16,
                                lineHeight: 1.5,
                              }}
                            >
                              Payment was canceled — your progress is saved.
                            </div>
                          ) : null}
                          <PrimaryBtn
                            disabled={checkoutLoading}
                            onClick={function () { handleUnlockCheckout(); }}
                          >
                            {checkoutLoading ? "Redirecting…" : "Unlock My Plan — $79"}
                          </PrimaryBtn>
                          {checkoutError ? (
                            <p style={{ color: S.red, fontSize: 14, marginTop: 12, marginBottom: 0 }}>{checkoutError}</p>
                          ) : null}
                          <div style={{ marginTop: 24 }}>
                            <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, margin: "0 0 10px" }}>Have a promo code?</p>
                            <div style={{ display: "flex", gap: 10 }}>
                              <input
                                type="text"
                                value={promoCode}
                                onChange={function (e) {
                                  setPromoCode(e.target.value.toUpperCase());
                                  if (promoError) setPromoError("");
                                }}
                                style={{
                                  flex: 1,
                                  padding: "12px 14px",
                                  fontSize: 15,
                                  fontFamily: S.mono,
                                  textTransform: "uppercase",
                                  border: "1px solid " + S.border,
                                  borderRadius: 10,
                                  boxSizing: "border-box",
                                }}
                              />
                              <button
                                type="button"
                                onClick={function () {
                                  var code = promoCode.trim().toUpperCase();
                                  if (PROMO_CODES.indexOf(code) !== -1) {
                                    setPromoUsed(true);
                                    setDiscountApplied(true);
                                    setPromoError("");
                                    setStep(6);
                                  } else {
                                    setPromoError("Invalid promo code");
                                  }
                                }}
                                style={{
                                  padding: "12px 18px",
                                  fontFamily: S.mono,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  background: S.accent,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 10,
                                  cursor: "pointer",
                                }}
                              >
                                Apply
                              </button>
                            </div>
                            {promoError ? <p style={{ color: S.red, fontSize: 13, marginTop: 8, marginBottom: 0 }}>{promoError}</p> : null}
                          </div>
                        </div>

                        <UXDisclaimer />
                      </>
                    ) : null}
                  </>
                );
              })()}
            </div>
          ) : null}

          {gateVerified && step === 6 && (tier >= 2 || promoUsed) && results ? (
            (function () {
              if (!recommendations && recsLoading) {
                return (
                  <div
                    style={{
                      minHeight: "100vh",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: S.purple,
                        color: "#fff",
                        fontFamily: S.mono,
                        fontWeight: 700,
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "uxDZPulse 1.4s ease-in-out infinite",
                        marginBottom: 24,
                      }}
                    >
                      DZ
                    </div>
                    <div style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, letterSpacing: "0.06em", marginBottom: 16 }}>
                      {loadingMsg}
                    </div>
                    <div style={{ display: "flex", gap: 6, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
                      <span style={{ animation: "uxDots 1s ease-in-out infinite" }}>.</span>
                      <span style={{ animation: "uxDots 1s ease-in-out 0.2s infinite" }}>.</span>
                      <span style={{ animation: "uxDots 1s ease-in-out 0.4s infinite" }}>.</span>
                    </div>
                  </div>
                );
              }

              if (recsError && !recommendations) {
                return (
                  <div
                    style={{
                      minHeight: "60vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "60px 20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <Card style={{ maxWidth: 480, width: "100%", border: "1px solid " + S.red, textAlign: "center" }}>
                      <p style={{ color: S.red, fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" }}>{recsError}</p>
                      <PrimaryBtn onClick={fetchRecommendations} style={{ maxWidth: 280, margin: "0 auto" }}>
                        Try Again
                      </PrimaryBtn>
                    </Card>
                  </div>
                );
              }

              if (!recommendations) return null;

              var scoredSkills6 = results.skills || [];
              var overallDZ6 =
                scoredSkills6.length > 0
                  ? Math.round(
                      scoredSkills6.reduce(function (sum, sk) {
                        return sum + (typeof sk.dz === "number" ? sk.dz : 0);
                      }, 0) / scoredSkills6.length
                    )
                  : 0;
              var overallCol6 = dzScoreColor(overallDZ6);
              var recsList6 = Array.isArray(recommendations)
                ? recommendations
                : recommendations.recommendations || [];
              var skillById6 = {};
              scoredSkills6.forEach(function (sk) {
                if (sk.id != null) skillById6[sk.id] = sk;
              });
              var phaseMeta6 = [
                {
                  phase: 1,
                  pill: "Phase 1 — Anchor",
                  color: S.green,
                  desc: "Protect what's already working. These are your most defensible skills.",
                },
                {
                  phase: 2,
                  pill: "Phase 2 — Reposition",
                  color: S.gold,
                  desc: "Address your highest-exposure areas before AI commoditises them.",
                },
                {
                  phase: 3,
                  pill: "Phase 3 — Extend",
                  color: S.purple,
                  desc: "Build new capabilities to widen your zone over the next 90 days.",
                },
              ];

              return (
                <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 48px", boxSizing: "border-box" }}>
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                      YOUR 90-DAY DEFENSIBLE ZONE PLAN
                    </div>
                    <h1 style={{ fontFamily: S.serif, fontSize: 32, color: S.text, margin: "0 0 12px", fontWeight: 600, lineHeight: 1.2 }}>
                      {results.profile && results.profile.summary ? results.profile.summary : buildProfile(roleType, seniority, isManager, companyTypeId, workFocus).summary}
                    </h1>
                    <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.7, margin: 0 }}>
                      Here is your personalised action plan. A copy has been emailed to {gateEmail}.
                    </p>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                      <div style={{ fontFamily: S.mono, fontSize: 40, fontWeight: 700, color: overallCol6, lineHeight: 1 }}>{overallDZ6}</div>
                      <div>
                        <div style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 600, color: overallCol6, marginBottom: 4 }}>{getOverallLabel(overallDZ6)}</div>
                        <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.5, margin: 0 }}>{getOverallSublabel(overallDZ6)}</p>
                      </div>
                    </div>
                    <div style={{ height: 2, background: S.gold, borderRadius: 1, marginBottom: 12 }} />
                    {results.landscape ? (
                      <p style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>{results.landscape}</p>
                    ) : null}
                  </div>

                  {phaseMeta6.map(function (pm6) {
                    var phaseRecs6 = recsList6.filter(function (r) {
                      return (r.phase || 1) === pm6.phase;
                    });
                    if (phaseRecs6.length === 0) return null;
                    return (
                      <div key={pm6.phase} style={{ marginBottom: 32 }}>
                        <div
                          style={{
                            display: "inline-block",
                            fontFamily: S.mono,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fff",
                            background: pm6.color,
                            padding: "8px 14px",
                            borderRadius: 20,
                            letterSpacing: "0.04em",
                            marginBottom: 10,
                          }}
                        >
                          {pm6.pill}
                        </div>
                        <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 18px" }}>{pm6.desc}</p>
                        {phaseRecs6.map(function (rec6, idx6) {
                          var linkedSkill6 = rec6.id != null ? skillById6[rec6.id] : null;
                          return (
                            <div
                              key={rec6.id || "rec6-" + pm6.phase + "-" + idx6}
                              style={{
                                background: S.card,
                                border: "1px solid " + S.border,
                                borderLeft: "3px solid " + S.gold,
                                borderRadius: 12,
                                padding: "22px 24px",
                                marginBottom: 12,
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  fontFamily: S.mono,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: pm6.color,
                                  letterSpacing: "0.06em",
                                  marginBottom: 12,
                                }}
                              >
                                {pm6.pill}
                              </div>
                              <div style={{ fontFamily: S.serif, fontSize: 22, color: S.text, marginBottom: 16, lineHeight: 1.3, fontWeight: 600 }}>
                                {rec6.headline || "—"}
                              </div>
                              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>ACTION</div>
                              <p style={{ fontSize: 15, color: S.text, lineHeight: 1.6, margin: "0 0 16px" }}>{rec6.action || ""}</p>
                              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>WHY THIS MATTERS</div>
                              <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 16px" }}>{rec6.why || ""}</p>
                              {linkedSkill6 ? (
                                <div
                                  style={{
                                    display: "inline-block",
                                    fontFamily: S.mono,
                                    fontSize: 11,
                                    color: S.muted,
                                    background: S.card2,
                                    border: "1px solid " + S.border,
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                  }}
                                >
                                  {linkedSkill6.text}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {paidEmailSentDisplay ? (
                    <div
                      style={{
                        background: "rgba(5,150,105,0.08)",
                        border: "1px solid rgba(5,150,105,0.35)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 28,
                        fontSize: 14,
                        color: S.green,
                        lineHeight: 1.5,
                      }}
                    >
                      ✓ Your full plan has been emailed to {gateEmail}
                    </div>
                  ) : null}

                  <div style={{ borderTop: "1px solid " + S.border, marginTop: 16, paddingTop: 32, textAlign: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 15, color: S.dim, margin: "0 0 14px", lineHeight: 1.6 }}>Want to reassess a different role or level?</p>
                    <button
                      type="button"
                      onClick={function () {
                        try {
                          localStorage.removeItem("dz_saved_report_ux");
                        } catch (_e) {}
                        window.location.href = "/ux";
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: S.accent,
                        fontFamily: S.mono,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Start a New Assessment
                    </button>
                  </div>

                  <UXDisclaimer />
                </div>
              );
            })()
          ) : null}
        </>
      )}

      <UXFooter />
    </div>
  );
}
