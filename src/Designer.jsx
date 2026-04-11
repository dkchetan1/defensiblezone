import { useState, useEffect } from "react";

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

var SENIORITY_OPTIONS = [
  "Intern / Student",
  "Junior (0–2 years)",
  "Mid-level (3–5 years)",
  "Senior (6–10 years)",
  "Staff / Principal (10+ years)",
  "Director / Head of Design",
  "VP / C-Suite",
];

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
  "Web products",
  "Design systems",
  "Enterprise software",
  "Consumer products",
  "AI / emerging tech",
  "Physical + digital",
  "Brand and marketing",
  "Research and strategy",
];

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

  function snapToStop(val) {
    var stops = [0, 3, 5, 7, 10];
    return stops.reduce(function (prev, curr) {
      return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
    });
  }

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
              "input[type=range].dz-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; border: none; } input[type=range].dz-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.18); } input[type=range].conscience-sl::-webkit-slider-thumb { background: #7c3aed; } input[type=range].pull-sl::-webkit-slider-thumb { background: #0891b2; }",
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
          <div style={{ fontFamily: S.mono, fontSize: 11, color: "#d97706", letterSpacing: "0.1em" }}>
            DEFENSIBLE ZONE™ · DESIGNER EDITION
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
          <div style={{ fontFamily: S.mono, fontSize: 11, textTransform: "uppercase", color: "#7a88a8", marginBottom: 6 }}>
            PART 1 — ABOUT YOU IN GENERAL
          </div>
          <div style={{ fontSize: 14, color: "#7a88a8", marginBottom: 24 }}>
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
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#7c3aed",
                  letterSpacing: "0.08em",
                }}
              >
                CRAFT CONSCIENCE
              </span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              When your design work falls short of your own standard — not a client&apos;s, not a manager&apos;s — how does that sit with you?
            </p>
            <p style={{ fontSize: 13, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              This tells us whether you genuinely care about quality in your work, independent of whether anyone else notices.
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
                      fontSize: 11,
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
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0891b2",
                  letterSpacing: "0.08em",
                }}
              >
                INTRINSIC PULL
              </span>
            </div>
            <p style={{ fontSize: 16, fontStyle: "italic", color: "#3d4a6b", lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              Outside of work, with no deadlines and no one asking, how often does your mind drift toward design problems?
            </p>
            <p style={{ fontSize: 13, color: "#7a88a8", lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              This tells us whether design is something you&apos;re naturally drawn to, or something you do primarily because it pays well.
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
                      fontSize: 11,
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
            Continue →
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div
        style={{
          background: S.bg,
          minHeight: "100vh",
          fontFamily: S.mono,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          color: S.dim,
          fontSize: 14,
        }}
      >
        Step 4 coming next.
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
              fontSize: 11,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · DESIGNER EDITION
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
              fontSize: 15,
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
              fontSize: 11,
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
                    fontSize: 15,
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
                fontSize: 15,
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
      fontSize: 14,
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
      fontSize: 14,
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
              fontSize: 11,
              color: S.gold,
              letterSpacing: "0.12em",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · DESIGNER EDITION
          </div>

          <h1
            style={{
              fontFamily: S.serif,
              fontSize: 32,
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
              fontSize: 15,
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
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: S.dim,
                marginBottom: 20,
              }}
            >
              YOUR EXPERIENCE LEVEL
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SENIORITY_OPTIONS.map(function (label) {
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
                fontSize: 11,
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
                fontSize: 11,
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
          DEFENSIBLE ZONE™ · DESIGNER EDITION
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
