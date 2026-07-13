import { useEffect, useState } from "react";
import { grantEmployerAccess, isEmployerAccessGranted } from "./EmployerEdition.js";
import EmployerEngineer from "./EmployerEngineer.jsx";
import EmployerProductManager from "./EmployerProductManager.jsx";

export var LS = {
  bg: "#F5F2EE",
  text: "#1C1917",
  muted: "#6B6560",
  accent: "#2C5F5F",
  border: "#DDD9D3",
  card: "#FFFFFF",
  red: "#B91C1C",
  font: "'Inter',system-ui,sans-serif",
  serif: "'DM Serif Display','Playfair Display',Georgia,serif",
  mono: "'DM Mono','Courier New',monospace",
};

var ROLES = [
  "Software Engineer",
  "Product Manager",
  "Sales Professional",
  "UX Professional",
  "Finance Professional",
];

export default function EmployerApp() {
  var [hasAccess, setHasAccess] = useState(function () {
    return isEmployerAccessGranted();
  });
  var [selectedRole, setSelectedRole] = useState(null);
  var [accessCode, setAccessCode] = useState("");
  var [codeError, setCodeError] = useState("");

  useEffect(function () {
    var link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = LS.bg;
    document.body.style.margin = "0";
    return function () {
      document.body.style.background = "";
    };
  }, []);

  function handleCodeSubmit(e) {
    e.preventDefault();
    var trimmed = (accessCode || "").trim();
    if (!trimmed) {
      setCodeError("Please enter an access code.");
      return;
    }
    setCodeError("");
    grantEmployerAccess();
    setHasAccess(true);
  }

  var screen = !hasAccess ? "code" : selectedRole ? "flow" : "roles";

  return (
    <div style={{ background: LS.bg, minHeight: "100vh", fontFamily: LS.font, color: LS.text }}>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid " + LS.border, padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span style={{ fontFamily: LS.serif, fontSize: 18, fontWeight: 700, color: LS.text }}>
            Defensible Zone™
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a
              href="mailto:support@recursiolab.com"
              style={{
                fontFamily: LS.mono,
                fontSize: 12,
                color: LS.muted,
                textDecoration: "none",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              Questions &amp; Feedback →
            </a>
            <a
              href="https://defensiblezone.ai/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: LS.mono,
                fontSize: 12,
                color: LS.muted,
                textDecoration: "none",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              Privacy Policy →
            </a>
          </div>
        </div>
      </div>

      {screen === "flow" && selectedRole === "Software Engineer" ? (
        <EmployerEngineer />
      ) : screen === "flow" && selectedRole === "Product Manager" ? (
        <EmployerProductManager />
      ) : (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "72px 24px 48px" }}>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, letterSpacing: "0.12em", marginBottom: 12, fontWeight: 600 }}>
          EMPLOYER EDITION
        </div>
        <h1 style={{ fontFamily: LS.serif, fontSize: 36, fontWeight: 600, margin: "0 0 12px", lineHeight: 1.15 }}>
          {screen === "code" ? "Enter your access code" : screen === "roles" ? "Choose a role" : selectedRole}
        </h1>
        {screen !== "flow" ? (
          <p style={{ color: LS.muted, fontSize: 16, lineHeight: 1.65, margin: "0 0 32px" }}>
            {screen === "code"
              ? "Use the code provided by your organization to access the assessment."
              : "Select the assessment your team member should complete."}
          </p>
        ) : null}

        {screen === "code" ? (
          <form onSubmit={handleCodeSubmit}>
            <label
              htmlFor="employer-access-code"
              style={{ display: "block", fontFamily: LS.mono, fontSize: 11, color: LS.muted, letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}
            >
              ACCESS CODE
            </label>
            <input
              id="employer-access-code"
              type="text"
              value={accessCode}
              onChange={function (e) {
                setAccessCode(e.target.value);
                if (codeError) setCodeError("");
              }}
              placeholder="Enter code"
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: LS.card,
                border: "1px solid " + (codeError ? LS.red : LS.border),
                borderRadius: 10,
                padding: "14px 16px",
                fontSize: 16,
                fontFamily: LS.mono,
                color: LS.text,
                outline: "none",
                marginBottom: codeError ? 8 : 20,
              }}
            />
            {codeError ? (
              <div style={{ color: LS.red, fontSize: 14, marginBottom: 16 }}>{codeError}</div>
            ) : null}
            <button
              type="submit"
              style={{
                width: "100%",
                background: LS.accent,
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "14px 20px",
                fontSize: 15,
                fontFamily: LS.mono,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              CONTINUE
            </button>
          </form>
        ) : screen === "roles" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ROLES.map(function (label) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={function () {
                    setSelectedRole(label);
                  }}
                  style={{
                    textAlign: "left",
                    background: LS.card,
                    border: "1px solid " + LS.border,
                    borderRadius: 12,
                    padding: "18px 20px",
                    fontSize: 17,
                    fontFamily: LS.font,
                    fontWeight: 600,
                    color: LS.text,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <p style={{ color: LS.muted, fontSize: 16, lineHeight: 1.65, margin: "0 0 24px" }}>
              {selectedRole} flow goes here
            </p>
            <button
              type="button"
              onClick={function () {
                setSelectedRole(null);
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 15,
                fontFamily: LS.font,
                color: LS.accent,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ← Back to role picker
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}


// ── DESIGN TOKENS ──────────────────────────────────────────────────────
export var S = {
  bg:"#f8f9fc", card:"#ffffff", card2:"#f2f4f8",
  border:"#d0d7e8", text:"#0d1117", muted:"#1e2a42", dim:"#4a5568",
  accent:"#1a1d2e", purple:"#7c3aed", gold:"#d97706",
  green:"#059669", red:"#dc2626", blue:"#2563eb", orange:"#ea580c",
  font:"system-ui,-apple-system,sans-serif",
  mono:"'Courier New',monospace",
  serif:"'Playfair Display',Georgia,serif",
};

// ── MATH ───────────────────────────────────────────────────────────────
export var AFFINITY_STOPS = [0, 3, 5, 7, 10];
export function snapToStop(val) {
  return AFFINITY_STOPS.reduce(function(prev, curr) {
    return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
  });
}
export function getSeed(c, p) {
  var raw = Math.round((c * 0.5 + p * 0.5) * 10) / 10;
  return AFFINITY_STOPS.reduce(function(prev, curr) {
    return Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev;
  });
}
export function compAff(conscience, pull, fluency) {
  return Math.round((conscience * 0.35 + pull * 0.35 + fluency * 0.3) * 10) / 10;
}
export function calcDZ(aff, aiR, mkt) {
  var v = 100 * Math.pow(aff / 10, 0.35) * Math.pow((10 - aiR) / 10, 0.40) * Math.pow(mkt / 10, 0.25);
  return Math.min(100, Math.round(v));
}

// ── SHARED UI ──────────────────────────────────────────────────────────
export function Card(props) {
  return (
    <div style={Object.assign({ background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: 28 }, props.style)}>
      {props.children}
    </div>
  );
}
export function Label(props) {
  return (
    <div style={Object.assign({ fontFamily: S.mono, fontSize: 12, color: S.muted, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }, props.style)}>
      {props.children}
    </div>
  );
}
export function PrimaryBtn(props) {
  var dis = props.disabled;
  return (
    <button onClick={props.onClick} disabled={dis} style={Object.assign({
      width:"100%", background: dis ? S.card : S.accent, color: dis ? S.dim : "white",
      border:"1px solid " + (dis ? S.border : S.accent), borderRadius:12, padding:"18px 0",
      fontSize:16, fontFamily:S.mono, fontWeight:700, cursor: dis ? "not-allowed" : "pointer",
      letterSpacing:"0.08em", transition:"all 0.2s",
    }, props.style)}>
      {props.children}
    </button>
  );
}
export function SelBtn(props) {
  var active = props.active;
  return (
    <button onClick={props.onClick} style={{
      background: active ? S.accent : S.card,
      color: active ? "white" : S.text,
      border:"1px solid " + (active ? S.accent : S.border),
      borderRadius:10, padding:"10px 14px", cursor:"pointer",
      fontFamily:S.font, fontSize:16, fontWeight: active ? 700 : 500,
      textAlign:"left", transition:"all 0.15s", width:"100%",
    }}>
      {props.children}
    </button>
  );
}
export function Chip(props) {
  var active = props.active;
  return (
    <button onClick={props.onClick} style={{
      background: active ? S.gold : S.card,
      color: active ? "white" : S.muted,
      border:"1px solid " + (active ? S.gold : S.border),
      borderRadius:20, padding:"6px 14px", cursor:"pointer",
      fontFamily:S.mono, fontSize:12, fontWeight: active ? 700 : 500,
      transition:"all 0.15s", whiteSpace:"nowrap",
    }}>
      {props.label}
    </button>
  );
}

export function dzScoreColor(score) {
  if (score < 40) return S.red;
  if (score <= 65) return S.gold;
  return S.green;
}
export function getOverallSubLabel(score) {
  if (score <= 39) return "High exposure. Significant repositioning needed.";
  if (score <= 59) return "Moderate exposure. Some strong anchors, gaps to address.";
  if (score <= 74) return "Solid foundation. Targeted moves will strengthen your position.";
  if (score <= 89) return "Well-positioned. Protect your anchors and extend your lead.";
  return "Exceptional. You're operating in rare territory.";
}
export function getSkillInterpretation(aiRisk, mkt, aff) {
  if (aiRisk >= 7) return "High AI exposure — your affinity is what keeps this defensible.";
  if (aiRisk <= 3 && mkt >= 7) return "Low AI risk, high market value — a strong anchor.";
  if (aff >= 7 && aiRisk >= 6) return "Your affinity is your edge here — lean into it.";
  if (aff <= 3 && aiRisk >= 6) return "Vulnerable. Consider whether this is worth defending.";
  return "Moderate position — context and execution matter here.";
}
export function isValidEmail(email) {
  var at = email.indexOf("@");
  if (at === -1) return false;
  return email.indexOf(".", at + 1) !== -1;
}

