import { useEffect, useRef, useState } from "react";

// ── DATA CONSTANTS ──────────────────────────────────────────────────────
var FINANCE_SECTORS = [
  { id: "ib", title: "Investment Banking & Capital Markets", desc: "M&A, ECM, DCM, trading, and the deals that move markets." },
  { id: "corporate", title: "Corporate Finance", desc: "FP&A, controllers, and the CFO track inside companies." },
  { id: "investment", title: "Investment Management & Research", desc: "Equity research, portfolio management, asset management, and quant." },
  { id: "risk", title: "Risk & Compliance", desc: "Credit risk, market risk, AML, and regulatory compliance." },
  { id: "wealth", title: "Wealth Management & Advisory", desc: "Financial advisors, private banking, and retirement planning." },
  { id: "accounting", title: "Accounting & Audit", desc: "Public accounting, internal audit, tax, and financial reporting." },
];

var ROLES_BY_SECTOR = {
  ib: [
    "Investment Banking Analyst",
    "Investment Banking Associate",
    "Capital Markets Associate",
    "M&A Advisor",
    "Sales & Trading Associate",
    "Equity Syndicate",
    "Debt Capital Markets Analyst",
  ],
  corporate: [
    "FP&A Analyst",
    "FP&A Manager",
    "Senior Financial Analyst",
    "Financial Controller",
    "VP of Finance",
    "CFO",
    "Treasurer",
  ],
  investment: [
    "Equity Research Analyst",
    "Associate Portfolio Manager",
    "Portfolio Manager",
    "Quantitative Analyst",
    "Fund Manager",
    "Credit Analyst",
    "Investment Strategist",
  ],
  risk: [
    "Credit Risk Analyst",
    "Market Risk Analyst",
    "Operational Risk Manager",
    "Chief Risk Officer",
    "Compliance Analyst",
    "AML / KYC Analyst",
    "Regulatory Affairs Manager",
  ],
  wealth: [
    "Junior Financial Advisor",
    "Financial Advisor",
    "Senior Financial Advisor",
    "Wealth Manager",
    "Private Banker",
    "Estate Planner",
    "Retirement Planning Specialist",
  ],
  accounting: [
    "Staff Accountant",
    "Senior Accountant",
    "Audit Associate",
    "Audit Manager",
    "Tax Analyst",
    "Internal Auditor",
    "Controller",
    "Accounting Director",
  ],
};

var SENIORITY_BY_SECTOR = {
  ib: ["Analyst (1st year)", "Analyst (2nd-3rd year)", "Associate", "Vice President", "Director", "Managing Director"],
  corporate: ["Analyst", "Senior Analyst", "Manager", "Senior Manager / Director", "VP", "CFO / Treasurer"],
  investment: ["Junior Analyst", "Analyst", "Associate", "Senior Analyst / PM", "Portfolio Manager", "CIO"],
  risk: ["Analyst", "Senior Analyst", "Manager", "Senior Manager", "Director", "CRO / CCO"],
  wealth: ["Junior Advisor", "Advisor", "Senior Advisor", "Wealth Manager", "Director", "Principal / Partner"],
  accounting: ["Staff", "Senior", "Supervisor", "Manager", "Senior Manager / Director", "Partner"],
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

export default function Finance(props) {
  var reportMode = Boolean(props && props.reportMode);
  void reportMode;

  // --- STATE VARIABLES (declare at top) ---
  var [step, setStep] = useState(0);
  var [sector, setSector] = useState("");
  var [role, setRole] = useState("");
  var [seniority, setSeniority] = useState("");
  var [firmType, setFirmType] = useState("");
  var [companySize, setCompanySize] = useState("");
  var [workFocus, setWorkFocus] = useState([]);
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  var [fluencies, setFluencies] = useState({});
  var adjustedSkills = useRef(new Set());
  var [skills, setSkills] = useState([]);
  var [landscape, setLandscape] = useState("");
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [results, setResults] = useState(null);
  var [resultsLoading, setResultsLoading] = useState(false);
  var [resultsError, setResultsError] = useState(null);
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState(null);
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [tier, setTier] = useState(0);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [promoUsed, setPromoUsed] = useState(false);
  var [discountApplied, setDiscountApplied] = useState(false);
  void firmType;
  void companySize;
  void workFocus;
  void conscience;
  void pull;
  void fluencies;
  void adjustedSkills;
  void skills;
  void landscape;
  void loading;
  void loadingMsg;
  void error;
  void results;
  void resultsLoading;
  void resultsError;
  void recommendations;
  void recsLoading;
  void recsError;
  void gateEmail;
  void gateSent;
  void gateVerified;
  void gateError;
  void gateLoading;
  void showResend;
  void tier;
  void promoCode;
  void promoError;
  void promoUsed;
  void discountApplied;

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
      window.scrollTo(0, 0);
    },
    [step]
  );

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "assessment_step", {
        product: "finance",
        step_number: step,
      });
    }
  }, [step]);

  if (step > 0) {
    return <div style={{ background: "#ffffff", minHeight: "100vh" }} />;
  }

  var tileBase = {
    textAlign: "left",
    background: "#ffffff",
    border: "1px solid " + S.border,
    borderRadius: 12,
    padding: 20,
    cursor: "pointer",
    boxSizing: "border-box",
  };

  var pillDefault = {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 15,
    border: "1px solid " + S.border,
    marginRight: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: "#ffffff",
    color: S.text,
    fontFamily: S.font,
    lineHeight: 1.3,
  };

  var pillSelected = {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 15,
    border: "1px solid " + S.accent,
    marginRight: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: S.accent,
    color: "#ffffff",
    fontFamily: S.font,
    lineHeight: 1.3,
  };

  return (
    <div
      style={{
        background: S.bg,
        minHeight: "100vh",
        padding: "32px 20px",
        fontFamily: S.font,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 640, width: "100%" }}>
        <div
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.gold,
            letterSpacing: "0.12em",
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          DEFENSIBLE ZONE™ · FINANCE EDITION
        </div>

        <h1
          style={{
            fontFamily: S.serif,
            fontSize: 38,
            fontStyle: "italic",
            color: S.text,
            margin: "0 0 12px",
            lineHeight: 1.15,
            fontWeight: 600,
          }}
        >
          Find your position in the AI era of finance.
        </h1>

        <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 40px" }}>
          Map your skills against AI displacement risk and market demand. Built for financial professionals who want a clear-eyed view of where they stand — and
          what to do about it.
        </p>

        <div
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: S.muted,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Which area of finance are you in?
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {FINANCE_SECTORS.map(function (s) {
            var selected = sector === s.id;
            var bg = selected ? S.gold + "12" : "#ffffff";
            var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={function () {
                  setSector(s.id);
                  setRole("");
                  setSeniority("");
                }}
                onKeyDown={function (e) {
                  if (e.key === "Enter" || e.key === " ") {
                    setSector(s.id);
                    setRole("");
                    setSeniority("");
                  }
                }}
                style={Object.assign({}, tileBase, { background: bg, border: border })}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6, lineHeight: 1.25 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: S.dim, lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>

        {sector !== "" ? (
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: S.muted,
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              What&apos;s your role?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {(ROLES_BY_SECTOR[sector] || []).map(function (label) {
                var sel = role === label;
                return (
                  <span
                    key={label}
                    role="button"
                    tabIndex={0}
                    onClick={function () {
                      setRole(label);
                      setSeniority("");
                    }}
                    onKeyDown={function (e) {
                      if (e.key === "Enter" || e.key === " ") {
                        setRole(label);
                        setSeniority("");
                      }
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {role !== "" ? (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: S.muted,
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              What&apos;s your level?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {(SENIORITY_BY_SECTOR[sector] || []).map(function (label) {
                var sel = seniority === label;
                return (
                  <span
                    key={label}
                    role="button"
                    tabIndex={0}
                    onClick={function () {
                      setSeniority(label);
                    }}
                    onKeyDown={function (e) {
                      if (e.key === "Enter" || e.key === " ") setSeniority(label);
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {seniority !== "" ? (
          <button
            type="button"
            onClick={function () {
              setStep(1);
            }}
            style={{
              width: "100%",
              marginTop: 20,
              background: S.accent,
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: 16,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: S.mono,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            CONTINUE →
          </button>
        ) : null}
      </div>
    </div>
  );
}

