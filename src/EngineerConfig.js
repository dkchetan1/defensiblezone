/**
 * Engineer RoleConfig for EmployerEngine.jsx.
 *
 * Transcribed from live src/EmployerEngineer.jsx — intake / steps / affinity /
 * PromptConfig (customTaskTemplate) / RoleCopyConfig (UI-only copy).
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

  // ── PromptConfig (Step 5b) — customTaskTemplate overrides generic assembly ─
  // Verbatim from EmployerEngineer.jsx fetchLandscapeAndSkills / runAnalysis /
  // fetchRecommendations, with dynamic interpolations replaced by {{…}} tokens.
  // Generic assembly fields left empty — customTaskTemplate takes precedence.
  prompts: {
    landscape: {
      persona: "",
      toolNames: [],
      styleNotes: "",
      customTaskTemplate:
        "You are a senior engineering career strategist specializing in AI labor market analysis for software engineers.\n\n" +
        "ENGINEER PROFILE:\n" +
        "- Type: {{devTypeLabel}} Engineer\n" +
        "- Seniority: {{seniorityLabel}} — {{seniorityNote}}\n" +
        "- Work context: {{workContextsText}}\n" +
        "- Company: {{companyLabel}}\n\n" +
        "{{#resumeText}}" +
        "CANDIDATE'S RESUME (use this to ground the skill list in their actual, evidenced work history — do not just repeat generic skills for this role/seniority level):\n" +
        "{{resumeText}}\n\n" +
        "When generating the 8 skills in Task 2: prioritize skills that are actually evidenced in the resume above. If the resume doesn't fully cover 8 strategically important skills for this profile, fill the remaining slots with additional role-appropriate skills not found in the resume. Do not list a skill twice just because it's phrased differently in two places — merge overlapping skills into one entry.\n\n" +
        "{{/resumeText}}" +
        "Task 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about the AI threat to this exact engineer profile RIGHT NOW (April 2026). Name specific tools (GitHub Copilot, Cursor, Devin, Claude, Gemini Code Assist), specific tasks being automated, and where the real exposure is at this seniority level doing this work. Do not write generic AI commentary — be specific to this combination.\n\n" +
        "Task 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a {{seniorityLabel}} {{devTypeLabel}} Engineer working on {{workContextsText}} to assess for AI defensibility right now. Be precise — not 'coding' but 'designing distributed transaction systems across eventual consistency boundaries'. Include a realistic mix: some that are defensible and some genuinely at risk. Weight toward skills that actually differentiate at the {{seniorityLabel}} level, not junior-level skills.\n\n" +
        'Return ONLY valid JSON:\n{"landscape":"...","skills":["skill1","skill2","skill3","skill4","skill5","skill6","skill7","skill8"]}',
    },

    scoring: {
      calibrationNotes: "",
      guardrails: [],
      customTaskTemplate:
        "You are a senior engineering career strategist and AI labor market analyst.\n\n" +
        "ENGINEER PROFILE:\n" +
        "- Type: {{devTypeLabel}} Engineer\n" +
        "- Seniority: {{seniorityLabel}} — {{seniorityNote}}\n" +
        "- Work context: {{workContextsText}}\n" +
        "- Company: {{companyLabel}}\n\n" +
        "SKILLS:\n" +
        "{{skillsList}}\n\n" +
        "AFFINITY SCORES:\n" +
        "{{affinityData}}\n\n" +
        "Score each skill:\n\n" +
        "ai_replaceability (0-10) — calibrated to THIS specific profile:\n" +
        "0-2: Requires sustained judgment, cross-system context, or org relationships that take years to build. AI cannot approximate.\n" +
        "3-4: AI accelerates this substantially but the judgment, architecture decisions, or oversight still requires this seniority level.\n" +
        "5-6: AI handles most execution. The engineer adds framing, edge case handling, and quality judgment.\n" +
        "7-8: AI does this adequately today for this role. The engineer is reviewing, not creating.\n" +
        "9-10: A junior prompt engineer outperforms this person's contribution on this skill right now.\n\n" +
        "CRITICAL: A {{seniorityLabel}} engineer doing {{workContextsText}} should NOT have the same scores as a junior CRUD developer. Calibrate to seniority and work context. Staff-level system design, compliance judgment, and cross-team technical leadership should score 2-4 max.\n\n" +
        "market_demand (0-10) — for {{seniorityLabel}} {{devTypeLabel}} engineers at {{companyTypeContextPhrase}}:\n" +
        "0-2: Declining or commoditized\n" +
        "3-4: Steady\n" +
        "5-6: Growing, competitive\n" +
        "7-8: High demand, premium comp\n" +
        "9-10: Critical shortage, top-of-market\n\n" +
        "interface_span: true ONLY if skill requires fluency in 2+ distinct professional disciplines simultaneously (eng + security compliance, eng + ML research, eng + product strategy, eng + hardware).\n\n" +
        "rationale: one precise sentence calibrated to this specific profile. Explain the replaceability score given this person's seniority and work context.\n\n" +
        "BENCHMARK vs other {{seniorityLabel}} {{devTypeLabel}} engineers:\n" +
        "- percentile: 0-100 AI defensibility\n" +
        "- summary: one sentence\n" +
        "- insights: 2-3 strategic observations specific to this profile\n\n" +
        'Return ONLY valid JSON:\n{"skills":[{"name":"exact skill text","ai_replaceability":5,"market_demand":7,"interface_span":false,"rationale":"one sentence"}],"benchmark":{"percentile":65,"summary":"...","insights":["...","..."]}}',
      // Live returns skills[] + benchmark (not scores-only).
      responseShape: {
        requiredKeys: ["skills"],
        optionalKeys: ["benchmark"],
      },
    },

    recommendations: {
      tone: {
        bannedWords: [],
        voiceNote: "",
      },
      phaseModel: "weekBucketed",
      phaseDefinition: {
        labels: ["Weeks 1–4", "Weeks 5–8", "Weeks 9–12"],
        blurbs: [
          "actions the engineer can begin immediately within their current role — no org setup, no stakeholder buy-in, just personal execution",
          "actions requiring some coordination with others, organizational standing, or setup before starting",
          "actions with longer horizons — structural moves that only land after Phase 1 and 2 have created the conditions",
        ],
        maxPerPhase: 4,
        targetDistribution: [3, 3, 2],
      },
      roleGuardrails: [],
      customTaskTemplate:
        "You are a senior engineering career strategist. A {{seniorityLabel}} {{devTypeLabel}} Engineer at {{companyLabel}} focused on {{workContextsText}} just completed a Defensible Zone assessment.\n\n" +
        "For each skill below, write a short personalized recommendation. Be specific to their seniority and context. Use plain English. Do not use the word 'threat'. Be direct and practical. For each recommendation, assign a phase (1, 2, or 3) based strictly on feasibility of starting — not score. You MUST distribute cards across all three phases. Do not put more than 4 cards in any single phase. Phase 1 (Weeks 1–4): actions the engineer can begin immediately within their current role — no org setup, no stakeholder buy-in, just personal execution. Phase 2 (Weeks 5–8): actions requiring some coordination with others, organizational standing, or setup before starting. Phase 3 (Weeks 9–12): actions with longer horizons — structural moves that only land after Phase 1 and 2 have created the conditions. Aim for roughly 3 cards in Phase 1, 3 in Phase 2, and 2 in Phase 3.\n\n" +
        "Skills with scores:\n" +
        "{{skillsList}}\n\n" +
        'Return ONLY valid JSON, no preamble:\n{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact situation.","phase":1},{"id":"s1","headline":"...","action":"...","why":"...","phase":1},{"id":"s2","headline":"...","action":"...","why":"...","phase":1},{"id":"s3","headline":"...","action":"...","why":"...","phase":1},{"id":"s4","headline":"...","action":"...","why":"...","phase":1},{"id":"s5","headline":"...","action":"...","why":"...","phase":1},{"id":"s6","headline":"...","action":"...","why":"...","phase":1},{"id":"s7","headline":"...","action":"...","why":"...","phase":1}]}',
    },
  },

  // ── RoleCopyConfig — UI-only text, verbatim from EmployerEngineer.jsx ──
  // Schema leaves RoleCopyConfig loosely defined ("labels, persona strings,
  // UI-only text"). Shape below matches what EmployerEngine already reads
  // (fieldLabels, profileHeader) plus the live step/button/heading strings
  // the skeleton will need when Engineer is routed through it.
  // Dynamic interpolations use {token} (same convention as expandable.triggerLabel).
  copy: {
    // buildPrompt generic assembly header (live: "ENGINEER PROFILE:")
    profileHeader: "ENGINEER PROFILE",

    // Edition chrome (appears on loading / gate / results)
    editionLine: "DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION",
    heroEyebrow: "RECURSIO LAB · DEFENSIBLE ZONE™ · SOFTWARE ENGINEER EDITION",

    // Intake field labels (EmployerEngine fieldDisplayLabel → copy.fieldLabels)
    fieldLabels: {
      devType: "WHAT TYPE OF ENGINEER ARE YOU?",
      seniority: "WHAT IS YOUR SENIORITY LEVEL?",
      workContexts: "WHAT DO YOU PRIMARILY WORK ON?",
      companyType: "COMPANY CONTEXT",
      resumeText: "RESUME",
    },

    intake: {
      heroHeadline: "Find Your Defensible Zone™",
      heroBody:
        "The AI threat to software engineering is not uniform. Where you sit, what you build, and how senior you are changes everything. This assessment is calibrated to your exact profile.",
      companyOptionalSuffix: "— optional",
      companyHelper:
        "Improves market demand scoring. A Staff engineer at an AI-first company has a very different market profile than one at a large enterprise.",
      resumeOptionalSuffix: "— optional — upload to personalize your skill list",
      resumeReading: "Reading your resume…",
      resumeRemove: "Remove",
      workContextsHelper:
        "This is the most important input — it's what changes your scores the most.",
      workContextsFilteredHint:
        " Showing the {count} most relevant contexts for {devTypeLabel} engineers.",
      workContextsSelectHint: "select all that apply",
      workContextsSelectedHint: "{count} selected",
      expandContexts: "+ Show {count} more contexts",
      devTypeOtherPlaceholder:
        "Describe your engineer type — e.g. Blockchain, Compiler, Simulation…",
      nudgeDevType: "Select your engineer type above to continue ↑",
      nudgeSeniority: "Now select your seniority level ↑",
      nudgeWorkContexts: "Select at least one work context to continue ↑",
      ctaHelper: "Takes about 60 seconds · Two steps · No account required",
      generateButton: "GENERATE MY SKILL MAP →",
      resumeErrors: {
        unsupportedType: "Only PDF and DOCX files are supported.",
        tooLarge: "File is too large. Please upload a file under 5MB.",
        readFailed:
          "Something went wrong reading this file — you can continue without it, or try again.",
        noText:
          "We couldn't read text from this file — you can continue without it, or try a different file.",
      },
    },

    skills: {
      stepEyebrow: "STEP 1 OF 2 · {profileSummary}",
      heading: "Your AI Landscape",
      landscapeEyebrow: "AI LANDSCAPE · {devTypeLabel} ENGINEER · {seniorityLabel}",
      skillsLabel: "YOUR SKILLS TO ASSESS",
      skillsHelper:
        'Generated for your exact profile. Edit any skill to be more specific — "React perf optimization for 50M MAU" scores better than "React".',
      skillsGroundedInResume: "✓ Personalized using your resume",
      editButton: "EDIT",
      aiUsageLabel: "AI USAGE",
      aiUsageOptionalSuffix:
        "— optional — tell us if you've already used AI as part of this work",
      aiUsageHelper:
        "Pick one or two skills above where you've actually used AI as part of your job, and briefly describe how.",
      aiUsagePlaceholder:
        "e.g. Used GitHub Copilot to draft the first pass of integration tests, then reviewed and corrected the edge cases myself.",
      backButton: "← BACK",
      nextEmpty: "ADD AT LEAST ONE SKILL",
      nextReady: "NEXT: RATE AFFINITY & FLUENCY →",
    },

    affinity: {
      stepEyebrow: "STEP 2 OF 2 · AFFINITY",
      heading: "How does engineering work feel?",
      intro:
        "These questions aren't about how skilled you are. They're about whether this work genuinely fits you. Be honest — there are no wrong answers.",
      part1Label: "PART 1 — ABOUT YOU IN GENERAL",
      part1Helper: "Answer these once. They apply across all your skills.",
      craftConscienceLabel: "CRAFT CONSCIENCE",
      craftConscienceQuestion:
        "When you push code or ship something you know isn't quite right — a shortcut, a hack, technical debt you accepted under pressure — how does that sit with you?",
      craftConscienceHelper:
        "This tells us whether you genuinely care about engineering quality independent of whether anyone reviewed it, measured it, or noticed.",
      conscienceStops: [
        "Move on easily",
        "Mildly bothered",
        "Somewhat unsettled",
        "Want to fix it",
        "Can't let it go",
      ],
      intrinsicPullLabel: "INTRINSIC PULL",
      intrinsicPullQuestion:
        "Outside of work, with no deadlines and no one asking, how often does your mind drift toward technical problems — an architecture decision, a bug, something you want to build?",
      intrinsicPullHelper:
        "This tells us whether engineering is something you're genuinely wired for, or primarily a professional identity and income.",
      pullStops: [
        "Almost never",
        "Occasionally",
        "Sometimes",
        "Regularly",
        "Constantly",
      ],
      part2Label: "PART 2 — SKILL BY SKILL",
      part2Helper:
        "For each skill — does doing this work feel natural and easy, or does it take real effort?",
      part2Hint:
        "Sliders are pre-set based on your answers above. Only move one if a skill feels noticeably different from your usual pattern.",
      feltFluencyLabel: "FELT FLUENCY",
      fluencyLow: "Effortful",
      fluencyHigh: "Frictionless",
      affinityScoreLabel: "AFFINITY SCORE",
      adjustedBadge: "adjusted",
      preSeededBadge: "pre-seeded",
      backButton: "← BACK",
      analyzeButton: "ANALYZE MY DEFENSIBLE ZONE™ →",
    },

    gate: {
      verifyingEmail: "Verifying your email…",
      scoring: "Scoring your Defensible Zone™…",
      readyHeading: "Your report is ready.",
      readyBody: "Enter your email to unlock it. We'll send you a link.",
      emailPlaceholder: "your@email.com",
      submitButton: "Send me my report",
      checkInboxEyebrow: "CHECK YOUR INBOX",
      sentHeading: "We sent you a link.",
      sentBody:
        "Click the button in the email from noreply@defensiblezone.ai to open your results. Check your spam folder if you do not see it within a minute.",
      resendLink: "Resend the link",
      startOver: "Start over",
      tryAgain: "Try again",
      expiredError: "This link has expired. Enter your email to get a new one.",
      invalidError: "Something went wrong. Please enter your email to continue.",
      genericError: "Something went wrong. Please try again.",
    },

    results: {
      heading: "Your Defensible Zone™",
      overallLabel: "OVERALL DZ SCORE",
      overallHelper:
        "Across your 8 assessed skills, this is how defensible your software engineering practice is against AI displacement right now.",
      dzLabels: {
        high: "Highly Defensible",
        moderate: "Moderately Defensible",
        mixed: "Mixed Territory",
        low: "Needs Attention",
      },
      mostDefensible: "MOST DEFENSIBLE",
      mostExposed: "MOST EXPOSED",
      fullBreakdown: "FULL SKILL BREAKDOWN",
      affinityCol: "AFFINITY",
      aiRiskCol: "AI RISK",
      demandCol: "DEMAND",
      howCalculatedHeading: "HOW YOUR SCORE IS CALCULATED",
      howCalculatedBody:
        "Your DZ score is calculated from three inputs. Affinity measures how naturally this work fits you — combining how much you care about quality (Craft Conscience), how often your mind drifts toward these technical problems outside formal work (Intrinsic Pull), and how effortlessly each skill feels for you (Felt Fluency). AI Resistance measures how hard it is for current AI systems to replicate this skill at your seniority level. Market Demand measures how much organizations are actively paying for humans who do this well. The three are multiplied together — so a high score requires all three, not just one.",
      howCalculatedFootnote:
        "The weights and calibration scores are based on published AI labor market research and our own survey of 450 professionals conducted March 2026.",
      recsLoadingHeading: "Building your action plan.",
      recsLoadingBody:
        "We're analyzing your scores against current AI labor market data and calibrating recommendations to your role and seniority. This takes a few seconds.",
      recsLoadingChips: [
        "8 skills assessed",
        "AI market data: April 2026",
        "Calibrated to your seniority",
      ],
      actionPlanHeading: "Your 90-Day Action Plan",
      actionPlanHelper:
        "One specific action for each skill — ranked by what will move the needle most for a {seniorityLabel} {devTypeLabel} Engineer.",
      phases: [
        {
          label: "Phase 1 — Weeks 1–4 — Establish your position",
          framing:
            "Start here because these actions require nothing beyond your own time and existing role — no buy-in, no setup, just execution.",
        },
        {
          label: "Phase 2 — Weeks 5–8 — Build visible authority",
          framing:
            "These actions become available once you have momentum from Phase 1 — they require coordination, organizational standing, or others to notice you.",
        },
        {
          label: "Phase 3 — Weeks 9–12 — Compound and protect",
          framing:
            "These are the moves that lock in what you built — longer-horizon actions that only land well after the earlier phases have created the conditions for them.",
        },
      ],
      startOver: "← START OVER",
      disclaimerHeading: "IMPORTANT — PLEASE READ",
      disclaimerBody:
        "This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment. Scores are estimates based on publicly available research and LLM calibration — not a definitive evaluation of your skills or employability.",
      emailCopyHeading: "Want a copy of this?",
      emailCopyBody:
        "This report only lives in this browser tab right now. If you'd like it saved somewhere you can find later, enter your email below and we'll send you a copy — it's never shared with your employer.",
      emailCopyButton: "Email me a copy",
      emailCopySending: "Sending…",
      emailCopySent: "✓ Sent — check your inbox for a copy of your results.",
      tryAgain: "Try again",
    },

    loading: {
      landscapeMsg: "Reading your engineering landscape…",
      scoringMsg: "Scoring your Defensible Zone™…",
      landscapeSub:
        "READING YOUR ENGINEERING LANDSCAPE · GENERATING SKILL MAP",
      scoringSub: "SCORING AI REPLACEABILITY · CALIBRATING TO YOUR LEVEL",
      landscapeError:
        "Something went wrong — please try again in a moment.",
      scoringError: "Analysis failed — please try again in a moment.",
    },
  },
};

export default EngineerConfig;
