/**
 * Engineer RoleConfig for EmployerEngine.jsx.
 *
 * Transcribed from live src/EmployerEngineer.jsx — intake / steps / affinity only.
 * prompts and copy are placeholders for a later step.
 *
 * Nothing imports this file yet.
 */

var EngineerConfig = {
  roleId: "engineer",
  localStorageKey: "dz_saved_report_engineer",

  // Live numeric steps: 0 intake → 1 skills → 2 affinity → 3 gate → 4 results
  // (useState(0); startAt matches that).
  steps: {
    order: ["intake", "skills", "affinity", "gate", "results"],
    startAt: "intake",
  },

  intake: [
    // ── devType (DEV_TYPES) ─────────────────────────────────────────────
    {
      id: "devType",
      type: "select",
      options: [
        { id: "frontend", label: "Frontend", desc: "UI, browser, user-facing" },
        { id: "backend", label: "Backend", desc: "APIs, servers, databases" },
        { id: "fullstack", label: "Full Stack", desc: "End-to-end ownership" },
        { id: "mobile", label: "Mobile", desc: "iOS, Android, React Native" },
        { id: "aiml", label: "AI / ML", desc: "Models, training, inference" },
        { id: "platform", label: "Platform / Infra", desc: "Internal platforms, reliability" },
        { id: "devops", label: "DevOps / SRE", desc: "CI/CD, observability, ops" },
        { id: "data", label: "Data", desc: "Pipelines, warehouses, analytics" },
        { id: "security", label: "Security", desc: "AppSec, pen testing, compliance" },
        { id: "qa", label: "QA / Test", desc: "Quality, automation, testing" },
        { id: "embedded", label: "Embedded / Firmware", desc: "Hardware, IoT, low-level systems" },
        { id: "game", label: "Game", desc: "Game engines, graphics, simulation" },
        { id: "arvr", label: "AR / VR / XR", desc: "Spatial computing, immersive tech" },
        { id: "research", label: "Research Engineer", desc: "Algorithms, systems research" },
        { id: "other", label: "Other", desc: "Specify your type below" },
      ],
      dependsOn: null,
      filterFn: null,
      optionsSource: null,
      clearOnParentChange: false,
      pruneOnParentChange: false,
    },

    // ── devTypeOther (text shown when devType === "other"; required then) ─
    // Schema has no showWhen / visibleWhen — see report flags.
    {
      id: "devTypeOther",
      type: "text",
      options: null,
      dependsOn: null,
      filterFn: null,
      optionsSource: null,
      clearOnParentChange: false,
      pruneOnParentChange: false,
    },

    // ── seniority (SENIORITY_LEVELS) — flat; not filtered by devType ─────
    {
      id: "seniority",
      type: "select",
      options: [
        { id: "junior", label: "Junior", sub: "0 – 2 yrs", note: "Execution, guided tasks" },
        { id: "mid", label: "Mid-level", sub: "2 – 5 yrs", note: "Owns features end-to-end" },
        { id: "senior", label: "Senior", sub: "5 – 8 yrs", note: "Owns systems & quality" },
        { id: "staff", label: "Staff / Principal", sub: "8+ yrs, IC", note: "Org-wide technical vision" },
        { id: "manager", label: "Eng Manager", sub: "People leadership", note: "Manages teams & delivery" },
        { id: "director", label: "Director+", sub: "Org leadership", note: "Strategy, hiring, culture" },
      ],
      dependsOn: null,
      filterFn: null,
      optionsSource: null,
      clearOnParentChange: false,
      pruneOnParentChange: false,
    },

    // ── workContexts (WORK_CONTEXTS ⊂ CONTEXT_MAP[devType]) ──────────────
    // Live: prune on devType change (keep still-valid ids); do NOT clear.
    // CONTEXT_MAP.other === null → engine subset null = show all (matches live).
    {
      id: "workContexts",
      type: "multiSelect",
      options: [
        { id: "crud", label: "CRUD / Standard Web Apps" },
        { id: "distributed", label: "Distributed Systems & Microservices" },
        { id: "realtime", label: "Real-time / Event-driven Systems" },
        { id: "api", label: "API Design & Contracts" },
        { id: "security", label: "Security & Compliance (SOC2, HIPAA, PCI)" },
        { id: "data", label: "Data Pipelines & ETL" },
        { id: "mlint", label: "ML / AI Integration" },
        { id: "cloud", label: "Cloud Infrastructure (AWS/GCP/Azure)" },
        { id: "devtools", label: "Developer Tooling & Platforms" },
        { id: "consumer", label: "Consumer Product at Scale" },
        { id: "internal", label: "Internal Tooling" },
        { id: "fintech", label: "Payments / Fintech" },
        { id: "healthtech", label: "Healthcare Tech (HIPAA)" },
        { id: "lowlatency", label: "High-frequency / Low-latency Systems" },
        { id: "wasm", label: "WebAssembly / Edge Computing" },
        { id: "arvr", label: "AR / VR / Spatial Computing" },
        { id: "oss", label: "Open Source / OSS" },
      ],
      dependsOn: "devType",
      filterFn: "subset",
      optionsSource: {
        frontend: ["crud", "consumer", "realtime", "api", "devtools", "internal", "wasm", "arvr", "oss", "security"],
        backend: ["crud", "distributed", "realtime", "api", "security", "data", "mlint", "cloud", "fintech", "healthtech", "lowlatency", "internal", "oss"],
        fullstack: ["crud", "distributed", "realtime", "api", "security", "mlint", "cloud", "consumer", "internal", "fintech", "healthtech", "devtools", "oss"],
        mobile: ["crud", "consumer", "realtime", "api", "fintech", "healthtech", "arvr", "oss", "security", "internal"],
        aiml: ["mlint", "data", "cloud", "lowlatency", "oss", "healthtech", "distributed", "realtime"],
        platform: ["distributed", "cloud", "devtools", "security", "lowlatency", "internal", "oss", "data"],
        devops: ["cloud", "security", "devtools", "distributed", "internal", "lowlatency", "data", "realtime"],
        data: ["data", "mlint", "cloud", "healthtech", "fintech", "internal", "realtime", "oss", "distributed"],
        security: ["security", "cloud", "fintech", "healthtech", "devtools", "internal", "distributed", "api"],
        qa: ["crud", "consumer", "devtools", "internal", "mlint", "security", "api", "distributed"],
        embedded: ["lowlatency", "realtime", "security", "healthtech", "arvr", "fintech", "oss", "distributed"],
        game: ["consumer", "realtime", "arvr", "lowlatency", "oss", "distributed", "wasm"],
        arvr: ["consumer", "realtime", "lowlatency", "oss", "arvr", "mlint", "wasm"],
        research: ["mlint", "data", "oss", "lowlatency", "distributed", "cloud", "realtime"],
        other: null,
      },
      clearOnParentChange: false,
      pruneOnParentChange: true,
    },

    // ── companyType (COMPANY_TYPES) — optional; live UI allows deselect ──
    {
      id: "companyType",
      type: "select",
      options: [
        { id: "early", label: "Early-stage Startup", sub: "< 50 people" },
        { id: "growth", label: "Growth Startup", sub: "50 – 500 people" },
        { id: "tier1", label: "Tier-1 Tech", sub: "Google, Meta, Apple, Microsoft, Amazon" },
        { id: "aifirst", label: "AI-First Company", sub: "OpenAI, Anthropic, Nvidia, Mistral, etc." },
        { id: "enterprise", label: "Enterprise", sub: "Large corp, not tech-first" },
        { id: "consulting", label: "Consulting / Agency", sub: "Client work" },
        { id: "gov", label: "Government / Public", sub: "Public sector" },
      ],
      dependsOn: null,
      filterFn: null,
      optionsSource: null,
      clearOnParentChange: false,
      pruneOnParentChange: false,
    },

    // ── resumeText — optional; collected on intake step via file upload ──
    // Stored as plain text after parse. Schema type is "text" only — UI is
    // file upload (.pdf/.docx), not a text input. See report flags.
    {
      id: "resumeText",
      type: "text",
      options: null,
      dependsOn: null,
      filterFn: null,
      optionsSource: null,
      clearOnParentChange: false,
      pruneOnParentChange: false,
    },
  ],

  affinity: {
    mode: "global",
  },

  // ── TODO (separate step): PromptConfig ────────────────────────────────
  // Live Engineer prompts are highly role-specific (persona, tool names,
  // seniority/context calibration, week-bucketed phases 3/3/2, resume
  // grounding wording, scoring JSON with skills+benchmark, etc.).
  // Expect customTaskTemplate on landscape / scoring / recommendations.
  prompts: null, // TODO: PromptConfig

  // ── TODO (separate step): RoleCopyConfig ──────────────────────────────
  copy: null, // TODO: RoleCopyConfig
};

export default EngineerConfig;
