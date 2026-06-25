import { useEffect, useState } from "react";
import { grantEmployerAccess, isEmployerAccessGranted } from "./EmployerEdition.js";

var LS = {
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
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
          <span style={{ fontFamily: LS.serif, fontSize: 18, fontWeight: 700, color: LS.text }}>
            Defensible Zone™
          </span>
        </div>
      </div>

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
    </div>
  );
}
