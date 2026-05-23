import { useState } from "react";

var S = {
  bg: "#f8f9fc",
  card: "#ffffff",
  card2: "#f2f4f8",
  border: "#d0d7e8",
  text: "#0d1117",
  muted: "#1e2a42",
  dim: "#4a5568",
  accent: "#1a1d2e",
  gold: "#d97706",
  purple: "#7c3aed",
  green: "#059669",
  blue: "#2563eb",
  orange: "#ea580c",
  red: "#dc2626",
  font: "system-ui,-apple-system,sans-serif",
  mono: "'Courier New',monospace",
  serif: "'Playfair Display',Georgia,serif",
};

function SBNavbar() {
  return (
    <div style={{
      width: "100%",
      borderBottom: "1px solid " + S.border,
      background: S.card,
      padding: "0 24px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
    }}>
      <a
        href="https://defensiblezone.ai"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: S.mono,
          fontSize: 13,
          fontWeight: 700,
          color: S.accent,
          textDecoration: "none",
          letterSpacing: "0.06em",
        }}
      >
        DEFENSIBLE ZONE™
      </a>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <a
          href="https://defensiblezone.ai/businesses"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.muted,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          For Businesses
        </a>
        <a
          href="mailto:support@recursiolab.com"
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.muted,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          Support
        </a>
      </div>
    </div>
  );
}

export default function SmallBusiness(props) {
  var [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px", boxSizing: "border-box" }}>
          <div style={{
            fontFamily: S.mono,
            fontSize: 11,
            color: S.gold,
            letterSpacing: "0.14em",
            marginBottom: 20,
            fontWeight: 600,
          }}>
            DEFENSIBLE ZONE™ · SMALL BUSINESS OWNER EDITION
          </div>
          <h1 style={{
            fontFamily: S.serif,
            fontSize: 40,
            color: S.text,
            margin: "0 0 20px",
            lineHeight: 1.2,
            fontWeight: 600,
          }}>
            Is your business still defensible?
          </h1>
          <p style={{
            fontSize: 18,
            color: S.dim,
            lineHeight: 1.75,
            margin: "0 0 40px",
            maxWidth: 560,
          }}>
            AI is changing what businesses are worth. In 15 minutes, find out where yours stands — and what to do about it.
          </p>
          <button
            onClick={function() { setStep(1); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "18px 36px",
              fontSize: 16,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            BEGIN ASSESSMENT →
          </button>
          <p style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.dim,
            marginTop: 20,
            letterSpacing: "0.04em",
          }}>
            Designed for US small business owners with 1–100 employees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
      <SBNavbar />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px", boxSizing: "border-box" }}>
        <p style={{ color: S.dim, fontFamily: S.mono, fontSize: 14 }}>Step {step} — coming soon</p>
      </div>
    </div>
  );
}
