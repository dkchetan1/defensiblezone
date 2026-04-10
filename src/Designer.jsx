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

  if (step === 1) {
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
        <div style={{ fontFamily: S.mono, fontSize: 14, color: S.dim, textAlign: "center" }}>
          Step 1 — context questions coming next.
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
          What kind of designer are you?
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
