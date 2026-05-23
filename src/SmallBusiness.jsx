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

var SB_INDUSTRIES = [
  { id: "prof_services",   label: "Professional Services",          sub: "consulting, accounting, law, design, marketing, IT services", pct: "~14%" },
  { id: "retail",          label: "Retail & E-commerce",            sub: "",                                                            pct: "~11%" },
  { id: "trades",          label: "Skilled Trades & Construction",  sub: "HVAC, electrical, plumbing, contracting, specialty",          pct: "~10%" },
  { id: "health_personal", label: "Health Care & Personal Services",sub: "independent practices, dental, PT, salons, wellness",         pct: "~10%" },
  { id: "food_hosp",       label: "Food Service & Hospitality",     sub: "restaurants, cafes, catering, lodging",                       pct: "~9%"  },
  { id: "auto_repair",     label: "Auto, Repair & Equipment",       sub: "auto repair, cleaning, rental, maintenance",                  pct: "~9%"  },
  { id: "realestate",      label: "Real Estate & Property",         sub: "agencies, property management, brokers",                      pct: "~7%"  },
  { id: "transport",       label: "Transportation & Logistics",     sub: "small trucking, delivery, fleet",                             pct: "~6%"  },
  { id: "admin_staffing",  label: "Administrative & Staffing",      sub: "cleaning, security, recruiting",                              pct: "~6%"  },
  { id: "manuf_wholesale", label: "Manufacturing & Wholesale",      sub: "",                                                            pct: "~9%"  },
  { id: "finance_advisory",label: "Finance, Insurance & Advisory",  sub: "independent advisors, brokers, agents",                      pct: "~3%"  },
  { id: "other",           label: "Other",                          sub: "describe your business below",                               pct: "~6%"  },
];

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
  var [industry, setIndustry] = useState("");
  var [otherText, setOtherText] = useState("");

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

  if (step === 1) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 1 OF 8 — YOUR INDUSTRY
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "12.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            What kind of business do you run?
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Pick the category that fits best. This shapes everything that follows.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
            {SB_INDUSTRIES.map(function(ind) {
              var isSelected = industry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={function() { setIndustry(ind.id); }}
                  style={{
                    background: isSelected ? S.accent : S.card,
                    border: "1px solid " + (isSelected ? S.accent : S.border),
                    borderRadius: 12,
                    padding: "16px 18px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ind.sub ? 4 : 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#ffffff" : S.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
                      {ind.label}
                    </span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: isSelected ? "rgba(255,255,255,0.7)" : S.gold, flexShrink: 0 }}>
                      {ind.pct}
                    </span>
                  </div>
                  {ind.sub ? (
                    <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.65)" : S.dim, lineHeight: 1.4 }}>
                      {ind.sub}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {industry === "other" ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
                DESCRIBE YOUR BUSINESS
              </div>
              <textarea
                value={otherText}
                onChange={function(e) { setOtherText(e.target.value); }}
                placeholder="e.g. We make custom furniture for commercial clients..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: S.font,
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  color: S.text,
                  background: S.card,
                }}
              />
            </div>
          ) : null}

          <button
            onClick={function() { setStep(2); }}
            disabled={!industry || (industry === "other" && !otherText.trim())}
            style={{
              background: (!industry || (industry === "other" && !otherText.trim())) ? S.card2 : S.accent,
              color: (!industry || (industry === "other" && !otherText.trim())) ? S.dim : "#ffffff",
              border: "1px solid " + ((!industry || (industry === "other" && !otherText.trim())) ? S.border : S.accent),
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: (!industry || (industry === "other" && !otherText.trim())) ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(0); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

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
