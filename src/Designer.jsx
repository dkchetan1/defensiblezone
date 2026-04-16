import { useState, useEffect, useRef } from "react";
import EmailGate from "./EmailGate";
import PDFButton from "./PDFButton";

// ── DESIGNER TYPES ─────────────────────────────────────────────────────
var DESIGNER_TYPES = [
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
];

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
};

var COMPANY_SIZE_OPTIONS = [
  "Freelance / Solo",
  "Early-stage startup (1–50)",
  "Growth startup (51–200)",
  "Mid-size company (201–1000)",
  "Large enterprise (1000+)",
  "Agency / Consultancy",
];

var WORK_FOCUS_OPTIONS = [
  "Mobile apps",
  "Web products & SaaS",
  "Design systems",
  "Enterprise & B2B software",
  "Consumer products",
  "AI-powered products",
  "Health & medical tech",
  "Fintech & financial services",
  "Brand and marketing",
  "Consulting & strategy",
];

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
};

// ── DESIGN TOKENS ──────────────────────────────────────────────────────
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

export default function Designer() {
  var [step, setStep] = useState(0);
  var [designerType, setDesignerType] = useState("");
  var [hoveredCard, setHoveredCard] = useState(null);
  var [seniority, setSeniority] = useState("");
  var [companySize, setCompanySize] = useState("");
  var [workFocus, setWorkFocus] = useState([]);
  var [landscape, setLandscape] = useState("");
  var [skills, setSkills] = useState([]);
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  var [fluencies, setFluencies] = useState({});
  var [adjustedSkills, setAdjustedSkills] = useState(new Set());
  var adjustedSkillsRef = useRef(new Set());
  var [results, setResults] = useState(null);
  var [resultsLoading, setResultsLoading] = useState(false);
  var [resultsError, setResultsError] = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [tier, setTier] = useState(0);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [promoUsed, setPromoUsed] = useState(false);

  useEffect(function () {
    var link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0,400;0,600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = S.bg;
    return function () {
      document.body.style.background = "";
    };
  }, []);

  useEffect(
    function () {
      setSeniority("");
    },
    [designerType]
  );

  function snapToStop(val) {
    var stops = [0, 3, 5, 7, 10];
    return stops.reduce(function (prev, curr) {
      return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
    });
  }

  function computeAffinity(c, p, f) {
    return Math.round((c * 0.35 + p * 0.35 + f * 0.3) * 10) / 10;
  }

  function getSeed(c, p) {
    var stops = [0, 3, 5, 7, 10];
    var raw = Math.round((c * 0.5 + p * 0.5) * 10) / 10;
    return stops.reduce(function (prev, curr) {
      return Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev;
    });
  }

  function markAdjusted(id) {
    adjustedSkillsRef.current.add(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  useEffect(
    function () {
      setFluencies(function (prev) {
        var next = Object.assign({}, prev);
        skills.forEach(function (skill) {
          if (!adjustedSkillsRef.current.has(skill.id)) {
            next[skill.id] = getSeed(conscience, pull);
          }
        });
        return next;
      });
    },
    [conscience, pull, skills]
  );

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [step]
  );

  useEffect(function () {
    function decodeJwt(token) {
      try {
        var payload = token.split(".")[1];
        var padded = payload + "===".slice((payload.length + 3) % 4);
        return JSON.parse(atob(padded));
      } catch (e) {
        return null;
      }
    }

    function applyToken(token) {
      var decoded = decodeJwt(token);
      if (!decoded) return false;
      if (decoded.exp && Date.now() / 1000 > decoded.exp) return false;
      if (decoded.product && decoded.product !== "designer") return false;
      if (decoded.tier === 2 || decoded.tier === 3) {
        setTier(decoded.tier);
        return true;
      }
      return false;
    }

    function restoreReport() {
      try {
        var saved = localStorage.getItem("dz_saved_report_designer");
        if (!saved) return;
        var s = JSON.parse(saved);
        if (s.designerType) setDesignerType(s.designerType);
        if (s.seniority) setSeniority(s.seniority);
        if (s.companySize) setCompanySize(s.companySize);
        if (s.workFocus) setWorkFocus(s.workFocus);
        if (s.skills) setSkills(s.skills);
        if (s.fluencies) setFluencies(s.fluencies);
        if (s.conscience !== undefined) setConscience(s.conscience);
        if (s.pull !== undefined) setPull(s.pull);
        if (s.results) {
          setResults(s.results);
          setStep(5);
        }
      } catch (e) {}
    }

    var stored = localStorage.getItem("dz_token_designer");
    if (stored && applyToken(stored)) {
      if (window.location.pathname.includes("/report")) restoreReport();
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var sessionId = params.get("session_id");
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, product: "designer" }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.token) {
            localStorage.setItem("dz_token_designer", data.token);
            applyToken(data.token);
            restoreReport();
          }
        })
        .catch(function (err) {
          console.error("Payment verification failed:", err);
        });
    }
  }, []);

  async function fetchSkills() {
    setLoading(true);
    setLoadingMsg("Reading your design landscape…");
    setError(null);

    var designerTitle =
      (DESIGNER_TYPES.find(function (dt) {
        return dt.id === designerType;
      }) || {}).title || designerType;

    var prompt =
      "You are a senior design career strategist specializing in AI labor market analysis for designers.\n\nDESIGNER PROFILE:\n- Type: " +
      designerTitle +
      "\n- Seniority: " +
      seniority +
      "\n- Company: " +
      companySize +
      "\n- Work focus: " +
      workFocus.join(", ") +
      "\n\nTask 1 — LANDSCAPE SNAPSHOT: Write 2-3 precise sentences about how AI is affecting this exact designer profile RIGHT NOW (April 2026). Name specific tools (Figma AI, Adobe Firefly, Galileo AI, Midjourney, Claude, Gemini). Be specific to this combination of role, seniority, and focus.\n\nTask 2 — SKILL SUGGESTIONS: Generate exactly 8 skills that are the most strategically important for a " +
      seniority +
      " " +
      designerTitle +
      " working on " +
      workFocus.join(", ") +
      " to assess for AI defensibility right now. Be precise and specific to this role level. Include a realistic mix: some defensible, some genuinely at risk.\n\nReturn ONLY valid JSON:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";

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
      if (!data.content) throw new Error(data.error || "API error");
      var raw = data.content
        .map(function (b) {
          return b.text || "";
        })
        .join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      var loaded = parsed.skills.map(function (text, i) {
        return { id: "s" + i, text: text };
      });
      setLandscape(parsed.landscape);
      setSkills(loaded);
      setStep(2);
    } catch (e) {
      setError("Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchResults() {
    setResultsLoading(true);
    setResultsError(null);
    var designerTitle =
      (DESIGNER_TYPES.find(function (dt) {
        return dt.id === designerType;
      }) || {}).title || designerType;
    var skillList = skills
      .map(function (s, i) {
        return i + 1 + ". " + s.text;
      })
      .join("\n");
    var prompt =
      "You are a senior AI labor market analyst specializing in design careers.\n\nDESIGNER PROFILE: " +
      designerTitle +
      ", " +
      seniority +
      ", " +
      companySize +
      ", focus: " +
      workFocus.join(", ") +
      "\n\nFor each of the 8 skills below, provide scores for this exact profile in April 2026:\n- aiR: AI replaceability 0-10 (10 = AI can fully do this now)\n- market: market demand 0-10 (10 = very high demand for humans)\n- rationale: one sentence explaining the aiR score\n\nInclude a realistic mix — some high aiR (at risk), some low.\n\nSkills:\n" +
      skillList +
      '\n\nReturn ONLY valid JSON, no preamble:\n{"skills":[{"id":"s0","aiR":7.5,"market":8.0,"rationale":"..."},{"id":"s1","aiR":3.0,"market":7.5,"rationale":"..."},{"id":"s2","aiR":5.0,"market":6.0,"rationale":"..."},{"id":"s3","aiR":2.0,"market":8.5,"rationale":"..."},{"id":"s4","aiR":8.0,"market":7.0,"rationale":"..."},{"id":"s5","aiR":4.5,"market":6.5,"rationale":"..."},{"id":"s6","aiR":6.0,"market":7.5,"rationale":"..."},{"id":"s7","aiR":3.5,"market":9.0,"rationale":"..."}]}';
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
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
      var parsedResults = JSON.parse(m[0]);
      try {
        localStorage.setItem("dz_saved_report_designer", JSON.stringify({
          step: 5, designerType, seniority, companySize, workFocus,
          skills, conscience, pull, fluencies, results: parsedResults
        }));
      } catch(e) {}
      setResults(parsedResults);
      setResultsLoading(false);
      fetchRecommendations(parsedResults.skills);
    } catch (e) {
      setResultsError("Something went wrong scoring your skills. Please try again.");
      setResultsLoading(false);
    }
  }

  async function fetchRecommendations(scoredSkills) {
    setRecsLoading(true);
    setRecsError(null);
    var designerTitle = (DESIGNER_TYPES.find(function (dt) {
      return dt.id === designerType;
    }) || {}).title || designerType;
    var skillSummary = skills
      .map(function (s, i) {
        var scored = scoredSkills.find(function (r) {
          return r.id === s.id;
        });
        var aiR = scored ? scored.aiR : 5;
        var market = scored ? scored.market : 7;
        return i + 1 + ". " + s.text + " (AI Risk: " + aiR + "/10, Market Demand: " + market + "/10)";
      })
      .join("\n");
    var prompt =
      "You are a senior design career strategist. A " +
      seniority +
      " " +
      designerTitle +
      " at a " +
      companySize +
      " focused on " +
      workFocus.join(", ") +
      " just completed a Defensible Zone assessment.\n\nFor each skill below, write a short personalized recommendation. Be specific to their seniority and context. Use plain English. Do not use the word 'threat'. Be direct and practical.\n\nSkills with scores:\n" +
      skillSummary +
      '\n\nReturn ONLY valid JSON, no preamble:\n{"recommendations":[{"id":"s0","headline":"5-7 word action headline","action":"One specific thing to do in the next 90 days.","why":"One sentence on why this matters for their exact situation."},{"id":"s1","headline":"...","action":"...","why":"..."},{"id":"s2","headline":"...","action":"...","why":"..."},{"id":"s3","headline":"...","action":"...","why":"..."},{"id":"s4","headline":"...","action":"...","why":"..."},{"id":"s5","headline":"...","action":"...","why":"..."},{"id":"s6","headline":"...","action":"...","why":"..."},{"id":"s7","headline":"...","action":"...","why":"..."}]}';
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

  if (loading) {
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
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes dzDesignerDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: S.mono, fontSize: 14, color: S.dim, letterSpacing: "0.04em" }}>{loadingMsg}</div>
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
            <span style={{ animation: "dzDesignerDots 1s ease-in-out infinite" }}>.</span>
            <span style={{ animation: "dzDesignerDots 1s ease-in-out 0.2s infinite" }}>.</span>
            <span style={{ animation: "dzDesignerDots 1s ease-in-out 0.4s infinite" }}>.</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{error}</p>
          <button
            type="button"
            onClick={function () {
              fetchSkills();
            }}
            style={{
              background: "#D97706",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontFamily: S.font,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    var affinityStops = [0, 3, 5, 7, 10];
    var conscienceLabelTexts = [
      "Relieved to move on",
      "Mildly bothered",
      "Somewhat unsettled",
      "Want to fix it",
      "Can't let it go",
    ];
    var pullLabelTexts = ["Almost never", "Occasionally", "Sometimes", "Regularly", "Constantly"];
    return (
      <div style={{ background: "#f8f9fc", minHeight: "100vh", padding: "32px 20px", fontFamily: S.font }}>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "input[type=range].dz-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; border: none; } input[type=range].dz-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.18); } input[type=range].conscience-sl::-webkit-slider-thumb { background: #7c3aed; } input[type=range].pull-sl::-webkit-slider-thumb { background: #0891b2; } input[type=range].fluency-sl::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #d97706; border: 2px solid white; cursor: pointer; }",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button
            type="button"
            onClick={function () {
              setStep(2);
            }}
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: "#7a88a8",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              marginBottom: 8,
              display: "block",
              textAlign: "left",
            }}
          >
            ← back
          </button>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: "#d97706", letterSpacing: "0.1em" }}>
            DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
          </div>
          <div style={{ marginTop: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map(function (i) {
              return (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: 6,
                    background: i === 2 ? "#d97706" : "#d0d7e8",
                  }}
                />
              );
            })}
          </div>
          <h1
            style={{
              fontSize: 34,
              fontFamily: S.serif,
              color: "#0d1117",
              marginBottom: 12,
              marginTop: 0,
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            How does this work feel?
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, marginBottom: 32, marginTop: 0 }}>
            These questions aren&apos;t about how skilled you are. They&apos;re about whether this type of work genuinely fits you. Be honest — there are no wrong answers.
          </p>
          <div style={{ fontFamily: S.mono, fontSize: 12, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>
            PART 1 — ABOUT YOU IN GENERAL
          </div>
          <div style={{ fontSize: 15, color: "#7a88a8", marginBottom: 24 }}>
            Answer these once. They apply across all your skills.
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid #d0d7e8",
              borderRadius: 14,
              padding: "24px 28px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#7c3aed",
                  letterSpacing: "0.08em",
                }}
              >
                CRAFT CONSCIENCE
              </span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              {AFFINITY_COPY[designerType]?.conscience?.question ??
                "When your work falls short of your own standard — a research study that felt rushed, a product that felt compromised — how does that sit with you?"}
            </p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              {AFFINITY_COPY[designerType]?.conscience?.explanation ??
                "This tells us whether you genuinely care about quality in your work, independent of whether anyone else notices."}
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
              style={{
                background: "linear-gradient(to right, #7c3aed " + (conscience / 10) * 100 + "%, #d0d7e8 " + (conscience / 10) * 100 + "%)",
              }}
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
          <div
            style={{
              background: "white",
              border: "1px solid #d0d7e8",
              borderRadius: 14,
              padding: "24px 28px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0891b2", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: S.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0891b2",
                  letterSpacing: "0.08em",
                }}
              >
                INTRINSIC PULL
              </span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              {AFFINITY_COPY[designerType]?.pull?.question ??
                "Outside of work, with no deadlines and no one asking, how often does your mind drift toward user problems — why people behave the way they do, what frustrates them, how things could work better?"}
            </p>
            <p style={{ fontSize: 14, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              {AFFINITY_COPY[designerType]?.pull?.explanation ??
                "This tells us whether design is something you're naturally drawn to, or something you do primarily because it pays well."}
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
              style={{
                background: "linear-gradient(to right, #0891b2 " + (pull / 10) * 100 + "%, #d0d7e8 " + (pull / 10) * 100 + "%)",
              }}
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
          {skills.map(function (skill) {
            var fluencyVal =
              fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull);
            var affinityScore = computeAffinity(conscience, pull, fluencyVal);
            var affinityColor =
              affinityScore >= 7 ? "#059669" : affinityScore >= 5 ? "#d97706" : "#dc2626";
            return (
              <div
                key={skill.id}
                style={{
                  background: "white",
                  border: "1px solid #d0d7e8",
                  borderRadius: 12,
                  padding: "18px 22px",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0d1117", flex: 1, paddingRight: 12 }}>
                    {skill.text}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontFamily: S.mono,
                      flexShrink: 0,
                      background: adjustedSkills.has(skill.id) ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.10)",
                      color: adjustedSkills.has(skill.id) ? "#d97706" : "#059669",
                    }}
                  >
                    {adjustedSkills.has(skill.id) ? "adjusted" : "pre-seeded"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: S.mono, fontSize: 12, color: "#7a88a8" }}>FELT FLUENCY</span>
                  <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 700, color: "#d97706" }}>
                    {(fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull)) + "/10"}
                  </span>
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
                      return Object.assign({}, prev, { [skill.id]: val });
                    });
                    markAdjusted(skill.id);
                  }}
                  style={{
                    background:
                      "linear-gradient(to right, #d97706 " +
                      ((fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull)) / 10) *
                        100 +
                      "%, #d0d7e8 " +
                      ((fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull)) / 10) *
                        100 +
                      "%)",
                  }}
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
          <button
            type="button"
            onClick={function () {
              setStep(4);
            }}
            style={{
              background: "#d97706",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "16px 32px",
              fontSize: 16,
              cursor: "pointer",
              marginTop: 32,
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              fontFamily: S.font,
            }}
          >
            See my results →
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
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
          DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
        </div>
        <EmailGate
          productName="Defensible Zone Designer Edition"
          onUnlock={function () {
            setStep(5);
            fetchResults();
          }}
        />
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

  if (step === 5) {
    if (resultsLoading) {
      return (
        <div
          style={{
            background: "#f8f9fc",
            minHeight: "100vh",
            fontFamily: S.font,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420, fontFamily: S.mono, fontSize: 15, color: S.dim }}>
            Scoring your skills against the AI landscape…
          </div>
        </div>
      );
    }
    if (resultsError) {
      return (
        <div
          style={{
            background: "#f8f9fc",
            minHeight: "100vh",
            fontFamily: S.font,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <p style={{ color: S.red, fontSize: 16, margin: "0 0 20px" }}>{resultsError}</p>
            <button
              type="button"
              onClick={function () {
                fetchResults();
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
        </div>
      );
    }
    var designerTitle = (DESIGNER_TYPES.find(function (dt) {
      return dt.id === designerType;
    }) || {}).title || designerType;

    var skillDZs = skills.map(function (skill) {
      var f = fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull);
      var affinity = computeAffinity(conscience, pull, f);
      var aiRScore = 5;
      var marketScore = 7;
      var rationale = "";
      if (results && results.skills) {
        var found = results.skills.find(function (r) {
          return r.id === skill.id;
        });
        if (found) {
          aiRScore = typeof found.aiR === "number" ? found.aiR : 5;
          marketScore = typeof found.market === "number" ? found.market : 7;
          rationale = found.rationale || "";
        }
      }
      var dz = Math.round(100 * Math.pow(affinity / 10, 0.35) * Math.pow((10 - aiRScore) / 10, 0.40) * Math.pow(marketScore / 10, 0.25));
      return {
        id: skill.id,
        text: skill.text,
        affinity: affinity,
        aiR: aiRScore,
        market: marketScore,
        rationale: rationale,
        dz: Math.max(0, Math.min(100, dz)),
      };
    });

    var totalDZ = Math.round(skillDZs.reduce(function (sum, s) {
      return sum + s.dz;
    }, 0) / skillDZs.length);

    var dzLabelColor = totalDZ >= 70 ? S.green : totalDZ >= 50 ? S.gold : totalDZ >= 30 ? S.orange : S.red;
    var dzLabel =
      totalDZ >= 70 ? "Highly Defensible" : totalDZ >= 50 ? "Moderately Defensible" : totalDZ >= 30 ? "Mixed Territory" : "Needs Attention";

    var sortedDZ = skillDZs.slice().sort(function (a, b) {
      return b.dz - a.dz;
    });
    var topSkills = sortedDZ.slice(0, 3);
    var atRisk = sortedDZ.slice(-3);

    function dzColor(score) {
      if (score >= 65) return S.green;
      if (score >= 40) return S.gold;
      return S.red;
    }

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
            DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
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
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px" }}>
            {designerTitle} · {seniority} · {companySize}
          </p>

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
              <div style={{ fontSize: 22, fontWeight: 700, color: dzLabelColor, marginBottom: 6, fontFamily: S.serif }}>{dzLabel}</div>
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
                Across your 8 assessed skills, this is how defensible your practice is against AI displacement right now.
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
                        <div style={{ width: s.dz + "%", height: "100%", background: dzColor(s.dz), borderRadius: 3 }} />
                      </div>
                      <span
                        style={{
                          fontFamily: S.mono,
                          fontSize: 12,
                          color: dzColor(s.dz),
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
            var col = dzColor(s.dz);
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
              (Craft Conscience), how often you think about these problems unprompted (Intrinsic Pull), and how effortlessly the work flows for you (Felt
              Fluency). AI Resistance measures how hard it is for current AI systems to replicate this skill at your seniority level. Market Demand measures
              how much organizations are actively paying for humans who do this well. The three are multiplied together — so a high score requires all three,
              not just one.
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
                  __html: "@keyframes dzDesignerDots{0%,100%{opacity:0.25}50%{opacity:1}}",
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
                DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
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
                We're analyzing your scores against current AI labor market data and calibrating recommendations to your role and seniority. This takes a few
                seconds.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 32, alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 36, color: S.gold, animation: "dzDesignerDots 1s ease-in-out infinite" }}>.</span>
                <span style={{ fontSize: 36, color: S.gold, animation: "dzDesignerDots 1s ease-in-out 0.2s infinite" }}>.</span>
                <span style={{ fontSize: 36, color: S.gold, animation: "dzDesignerDots 1s ease-in-out 0.4s infinite" }}>.</span>
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
                  fetchRecommendations(results ? results.skills : []);
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
              var showAllRecs = tier >= 1 || promoUsed;
              var showUpsell = tier === 0 && !promoUsed;

              var rec29Url = "https://buy.stripe.com/00waEXbZobnl0D3bc2dQQ02";
              var rec34Url = "https://buy.stripe.com/00wdR93sSgHFadD5RIdQQ03";

              var tier29Features = [
                "All 8 personalized recommendations",
                "Ranked by impact for your role",
                "90-day action steps",
                "Specific to your seniority and focus",
              ];
              var tier34Features = [
                "Everything in Recommendations",
                "Downloadable PDF",
                "Share with a coach or manager",
                "Permanent record of your assessment",
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
                      One specific action for each skill — ranked by what will move the needle most for a {seniority} {designerTitle}.
                    </p>
                  </div>

                  <div id="dz-report-content" style={{ marginBottom: showUpsell ? 0 : 28 }}>
                    {recList.map(function (rec, idx) {
                      var skillRow = skillDZs.find(function (sd) {
                        return sd.id === rec.id;
                      });
                      var skillName =
                        (skills.find(function (sk) {
                          return sk.id === rec.id;
                        }) || {}).text || rec.id;
                      var dzForBar = skillRow ? skillRow.dz : 0;
                      var barColor = dzColor(dzForBar);
                      var lockedBlur = !showAllRecs && idx > 0;
                      return (
                        <div
                          key={rec.id + "-" + idx}
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

                  {tier >= 1 || promoUsed ? (
                    <div style={{ marginTop: 20, marginBottom: 4, textAlign: "center" }}>
                      <PDFButton contentId="dz-report-content" label="Save as PDF" />
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
                        Your scores are ready. Your action plan is personalized to you as a {seniority} {designerTitle}. Unlock all 8 recommendations
                        plus a PDF you can keep.
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 12,
                          alignItems: "stretch",
                        }}
                      >
                        <div
                          style={{
                            flex: "1 1 260px",
                            background: "#ffffff",
                            border: "1px solid #d0d7e8",
                            borderRadius: 12,
                            padding: "20px 18px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: S.mono,
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#6b7280",
                              marginBottom: 8,
                              fontWeight: 600,
                            }}
                          >
                            RECOMMENDATIONS
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 4 }}>$29 one-time</div>
                          <div style={{ flex: 1, marginBottom: 16 }}>
                            {tier29Features.map(function (line) {
                              return (
                                <div key={line} style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.5, marginBottom: 6 }}>
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={function () {
                              window.location.href = rec29Url;
                            }}
                            style={{
                              background: S.gold,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              padding: "12px 16px",
                              fontSize: 15,
                              fontFamily: S.font,
                              fontWeight: 600,
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            Unlock Recommendations →
                          </button>
                        </div>

                        <div
                          style={{
                            flex: "1 1 260px",
                            background: "#ffffff",
                            border: "1px solid #d0d7e8",
                            borderRadius: 12,
                            padding: "20px 18px",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              fontFamily: S.mono,
                              fontSize: 12,
                              background: S.gold,
                              color: "#ffffff",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                            }}
                          >
                            BEST VALUE
                          </div>
                          <div
                            style={{
                              fontFamily: S.mono,
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#6b7280",
                              marginBottom: 8,
                              fontWeight: 600,
                              paddingRight: 88,
                            }}
                          >
                            RECOMMENDATIONS + PDF
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 4 }}>$34 one-time</div>
                          <div style={{ flex: 1, marginBottom: 16 }}>
                            {tier34Features.map(function (line) {
                              return (
                                <div key={line} style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.5, marginBottom: 6 }}>
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={function () {
                              window.location.href = rec34Url;
                            }}
                            style={{
                              background: S.gold,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              padding: "12px 16px",
                              fontSize: 15,
                              fontFamily: S.font,
                              fontWeight: 600,
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            Get PDF Report →
                          </button>
                        </div>
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
                              var v = (promoCode || "").trim().toUpperCase();
                              if (v === "DZFRIEND" || v === "DZPREVIEW" || v === "DZTEST") {
                                setTier(2);
                                setPromoUsed(true);
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
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()
          )}

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: "#9ca3af",
              textAlign: "center",
              paddingBottom: 32,
              marginTop: 0,
              lineHeight: 1.7,
            }}
          >
            <div>DEFENSIBLE ZONE™ is a trademark of its creator. All rights reserved.</div>
            <div style={{ marginTop: 6 }}>For educational purposes only. Not professional career advice.</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          display: "flex",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
        <div style={{ maxWidth: 680, width: "100%" }}>
          <button
            type="button"
            onClick={function () {
              setStep(1);
            }}
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.dim,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "none",
              marginBottom: 20,
              display: "block",
              textAlign: "left",
            }}
          >
            ← back
          </button>

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 32,
              color: S.text,
              margin: "0 0 20px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Your design landscape.
          </h1>

          <div
            style={{
              background: "#f2f4f8",
              borderRadius: 10,
              padding: "16px 20px",
              fontSize: 16,
              color: "#3d4a6b",
              marginBottom: 28,
              lineHeight: 1.65,
            }}
          >
            {landscape}
          </div>

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: S.dim,
              marginBottom: 6,
            }}
          >
            HOW WE CHOSE THESE SKILLS
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: "#6b7280",
              margin: "0 0 20px",
            }}
          >
            These 8 skills were selected based on your profile — your UX practice area, seniority, company size, and work focus. They represent the areas where AI is having the most impact on work like yours right now, and where your Defensible Zone™ is most likely to be tested.
          </p>

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
            YOUR SKILLS TO ASSESS
          </div>

          <div style={{ marginBottom: 28 }}>
            {skills.map(function (s, idx) {
              return (
                <div
                  key={s.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d0d7e8",
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 8,
                    fontSize: 16,
                    color: S.text,
                    lineHeight: 1.5,
                  }}
                >
                  {idx + 1}. {s.text}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={function () {
                setStep(3);
              }}
              style={{
                background: "#D97706",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "14px 32px",
                fontSize: 16,
                fontFamily: S.font,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    var canContinueStep1 = Boolean(seniority && companySize && workFocus.length > 0);
    var pillDefault = {
      background: "#ffffff",
      border: "1px solid #d0d7e8",
      borderRadius: 20,
      padding: "10px 18px",
      fontSize: 15,
      color: "#0d1117",
      cursor: "pointer",
      fontFamily: S.font,
      lineHeight: 1.3,
    };
    var pillSelected = {
      background: "#D97706",
      color: "#ffffff",
      border: "none",
      borderRadius: 20,
      padding: "10px 18px",
      fontSize: 15,
      cursor: "pointer",
      fontFamily: S.font,
      lineHeight: 1.3,
    };
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.font,
          display: "flex",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
        <div style={{ maxWidth: 680, width: "100%" }}>
          <button
            type="button"
            onClick={function () {
              window.location.href = "/";
            }}
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.dim,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "none",
              marginBottom: 8,
              display: "block",
              textAlign: "left",
            }}
          >
            ← Defensible Zone
          </button>
          <button
            type="button"
            onClick={function () {
              setStep(0);
            }}
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.dim,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "none",
              marginBottom: 20,
              display: "block",
              textAlign: "left",
            }}
          >
            ← back
          </button>

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 36,
              color: S.text,
              margin: "0 0 14px",
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            Tell us about your work.
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: 16,
              lineHeight: 1.65,
              margin: "0 0 32px",
              maxWidth: "100%",
            }}
          >
            The same skill looks very different depending on your seniority and where you work. This helps us calibrate your results.
          </p>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: S.dim,
                marginBottom: 20,
              }}
            >
              YOUR EXPERIENCE LEVEL
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(SENIORITY_BY_TYPE[designerType] || []).map(function (label) {
                var sel = seniority === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={function () {
                      setSeniority(label);
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: S.dim,
                marginBottom: 20,
              }}
            >
              WHERE YOU WORK
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COMPANY_SIZE_OPTIONS.map(function (label) {
                var sel = companySize === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={function () {
                      setCompanySize(label);
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: S.dim,
                marginBottom: 20,
              }}
            >
              YOUR PRIMARY WORK FOCUS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {WORK_FOCUS_OPTIONS.map(function (label) {
                var sel = workFocus.indexOf(label) >= 0;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={function () {
                      setWorkFocus(function (prev) {
                        if (prev.indexOf(label) >= 0) {
                          return prev.filter(function (x) {
                            return x !== label;
                          });
                        }
                        return prev.concat([label]);
                      });
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={function () {
                fetchSkills();
              }}
              style={{
                background: canContinueStep1 ? "#D97706" : "#e5e7eb",
                color: canContinueStep1 ? "#ffffff" : "#9ca3af",
                border: "none",
                borderRadius: 12,
                padding: "14px 32px",
                fontSize: 15,
                fontFamily: S.font,
                fontWeight: 600,
                cursor: canContinueStep1 ? "pointer" : "not-allowed",
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font, padding: "32px 20px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@media (max-width:600px){.dz-designer-grid{grid-template-columns:1fr !important;}}",
        }}
      />
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ padding: "0 0 8px" }}>
          <a
            href="/"
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.muted,
              textDecoration: "none",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            ← DEFENSIBLE ZONE™
          </a>
        </div>

        <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", marginBottom: 16, fontWeight: 600 }}>
          DEFENSIBLE ZONE™ · UX PROFESSIONAL EDITION
        </div>

        <h1 style={{ fontFamily: S.serif, fontSize: 34, color: S.text, margin: "0 0 14px", lineHeight: 1.15, fontWeight: 600 }}>
          What kind of UX professional are you?
        </h1>

        <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.65, margin: "0 0 28px", maxWidth: "100%" }}>
          Your skills and how AI affects them look very different depending on your practice. Pick the one that closest describes your work.
        </p>

        <div
          className="dz-designer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {DESIGNER_TYPES.map(function (dt) {
            var selected = designerType === dt.id;
            var hovered = hoveredCard === dt.id;
            var bg = selected ? "#fffbf0" : hovered ? "#f8f9fc" : "#ffffff";
            var border = selected ? "2px solid " + S.gold : "1px solid " + S.border;
            return (
              <button
                key={dt.id}
                type="button"
                onClick={function () {
                  setDesignerType(dt.id);
                }}
                onMouseEnter={function () {
                  setHoveredCard(dt.id);
                }}
                onMouseLeave={function () {
                  setHoveredCard(null);
                }}
                style={{
                  textAlign: "left",
                  background: bg,
                  border: border,
                  borderRadius: 12,
                  padding: "16px 18px",
                  minHeight: 80,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  transition: "background 0.15s, border 0.15s",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0d1117" }}>{dt.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, lineHeight: 1.45 }}>{dt.desc}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <button
            type="button"
            disabled={!designerType}
            onClick={function () {
              setStep(1);
            }}
            style={{
              background: designerType ? "#D97706" : "#e5e7eb",
              color: designerType ? "#ffffff" : "#9ca3af",
              border: "none",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontFamily: S.font,
              fontWeight: 600,
              cursor: designerType ? "pointer" : "not-allowed",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
