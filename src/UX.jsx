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
  font: "'DM Sans',system-ui,-apple-system,sans-serif",
  mono: "'DM Mono','Courier New',monospace",
  serif: "'DM Serif Display',Georgia,serif",
};

var PROMO_CODES = ["DZFRIEND", "DZPREVIEW", "DZTEST"];

export default function UX() { return null; }
