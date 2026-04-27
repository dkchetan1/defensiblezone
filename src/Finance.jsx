import { useEffect, useRef, useState } from "react";
import PDFButton from "./PDFButton";

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
    { name: "Investment Banking Analyst", desc: "Pitch books, financial models, and deal support at banks" },
    { name: "Investment Banking Associate", desc: "Promoted analyst or MBA hire — more client exposure, same execution" },
    { name: "Capital Markets Associate", desc: "Equity or debt capital markets — raising capital for companies" },
    { name: "M&A Advisor", desc: "Advising on mergers, acquisitions, and divestitures" },
    { name: "Sales & Trading Associate", desc: "Buying and selling securities on behalf of clients or the firm" },
    { name: "Equity Syndicate", desc: "Coordinating equity offerings and book-building" },
    { name: "Debt Capital Markets Analyst", desc: "Structuring and placing debt — bonds, leveraged loans, credit" },
  ],
  corporate: [
    { name: "FP&A Analyst", desc: "Budgeting, forecasting, and variance analysis inside a company" },
    { name: "FP&A Manager", desc: "Leading the FP&A team — planning cycles, stakeholder reporting" },
    { name: "Senior Financial Analyst", desc: "Experienced individual contributor in corporate finance" },
    { name: "Financial Controller", desc: "Head of accounting operations — senior role, 10+ years, reports to CFO" },
    { name: "VP of Finance", desc: "Senior finance leader, one level below CFO" },
    { name: "CFO", desc: "Chief Financial Officer — top finance executive" },
    { name: "Treasurer", desc: "Managing cash, liquidity, investments, and banking relationships" },
  ],
  investment: [
    { name: "Equity Research Associate", desc: "Junior role in sell-side research — supports the Research Analyst" },
    { name: "Equity Research Analyst", desc: "Senior role in sell-side research — publishes reports under their name" },
    { name: "Associate Portfolio Manager", desc: "Supporting a Portfolio Manager on buy-side investment decisions" },
    { name: "Portfolio Manager", desc: "Buy-side — managing investment portfolios for institutional clients" },
    { name: "Quantitative Analyst", desc: "Building quantitative models and algorithms for trading or investment" },
    { name: "Fund Manager", desc: "Managing a mutual fund or pooled investment vehicle" },
    { name: "Credit Analyst", desc: "Buy-side — analyzing bond and credit investments at asset managers or hedge funds" },
    { name: "Investment Strategist", desc: "Developing macro or sector investment views and themes" },
  ],
  risk: [
    { name: "Credit Risk Analyst", desc: "Bank/lending context — assessing borrower and portfolio credit risk" },
    { name: "Market Risk Analyst", desc: "Measuring and managing market exposure — VaR, stress testing" },
    { name: "Operational Risk Manager", desc: "Managing risk from internal processes, people, and systems" },
    { name: "Chief Risk Officer", desc: "C-suite — overseeing enterprise-wide risk management" },
    { name: "Compliance Analyst", desc: "Ensuring the organization meets regulatory requirements" },
    { name: "AML / KYC Analyst", desc: "Anti-money laundering and know-your-customer compliance" },
    { name: "Regulatory Affairs Manager", desc: "Interpreting and implementing regulatory requirements" },
  ],
  wealth: [
    { name: "Junior Financial Advisor", desc: "Entry-level — building a client base and supporting senior advisors" },
    { name: "Financial Advisor", desc: "Managing client relationships and financial planning" },
    { name: "Senior Financial Advisor", desc: "Experienced advisor managing high-value clients" },
    { name: "Wealth Manager", desc: "Comprehensive wealth planning for high-net-worth clients" },
    { name: "Private Banker", desc: "Ultra-HNW banking — clients typically $1M+ or $10M+ in assets" },
    { name: "Estate Planner", desc: "Specialist in estate, trust, and inheritance planning" },
    { name: "Retirement Planning Specialist", desc: "Specialist in retirement income and pension planning" },
  ],
  accounting: [
    { name: "Staff Accountant", desc: "Entry-level — reconciliations, basic financial statements, data entry" },
    { name: "Senior Accountant", desc: "3–5 years — owns complex accounting tasks, guides junior staff" },
    { name: "Audit Associate", desc: "Public accounting entry/mid — conducting audits at client organizations" },
    { name: "Audit Manager", desc: "Managing audit engagements and teams — 7–10 years experience" },
    { name: "Tax Analyst", desc: "Corporate or public accounting tax compliance and planning" },
    { name: "Internal Auditor", desc: "In-house review of internal controls and financial processes" },
    { name: "Controller", desc: "Head of accounting — senior role, 10+ years, reports to CFO" },
    { name: "Accounting Director", desc: "Top accounting leadership below CFO — 15+ years typical" },
  ],
};

var SENIORITY_BY_SECTOR_AND_ROLE = {
  ib: {
    "Investment Banking Analyst": ["Analyst (1st year)", "Analyst (2nd year)", "Analyst (3rd year)"],
    "Investment Banking Associate": ["Associate (Year 1)", "Associate (Year 2)", "Associate (Year 3)"],
    "Capital Markets Associate": ["Analyst", "Associate", "Vice President"],
    "M&A Advisor": ["Analyst", "Associate", "Vice President", "Director", "Managing Director"],
    "Sales & Trading Associate": ["Analyst", "Associate", "Vice President", "Director / ED", "Managing Director"],
    "Equity Syndicate": ["Analyst", "Associate", "Vice President", "Director"],
    "Debt Capital Markets Analyst": ["Analyst", "Associate", "Vice President"],
  },
  corporate: {
    "FP&A Analyst": ["FP&A Analyst", "Senior FP&A Analyst"],
    "FP&A Manager": ["FP&A Manager", "Senior FP&A Manager"],
    "Senior Financial Analyst": ["Senior Analyst", "Lead Analyst", "Principal Analyst"],
    "Financial Controller": ["Assistant Controller", "Controller", "VP / Group Controller"],
    "VP of Finance": ["VP of Finance", "SVP of Finance"],
    "CFO": ["VP Finance (pre-CFO)", "CFO", "Group CFO / Division CFO"],
    "Treasurer": ["Treasury Analyst", "Senior Treasury Analyst", "Treasury Manager", "Treasurer"],
  },
  investment: {
    "Equity Research Associate": ["Research Associate (Junior)", "Research Associate (Senior)"],
    "Equity Research Analyst": ["Research Analyst", "Senior Research Analyst", "VP-level Analyst", "MD-level Analyst / Head of Research"],
    "Associate Portfolio Manager": ["Research Analyst", "Associate Portfolio Manager"],
    "Portfolio Manager": ["Portfolio Manager", "Senior Portfolio Manager", "Head of Portfolio Management / CIO"],
    "Quantitative Analyst": ["Junior Quant", "Quantitative Analyst", "Senior Quantitative Analyst", "Principal Quant / Head of Quant"],
    "Fund Manager": ["Associate Fund Manager", "Fund Manager", "Senior Fund Manager"],
    "Credit Analyst": ["Junior Credit Analyst", "Credit Analyst", "Senior Credit Analyst", "Credit Manager"],
    "Investment Strategist": ["Strategist", "Senior Strategist", "Head of Strategy / CIO"],
  },
  risk: {
    "Credit Risk Analyst": ["Credit Risk Analyst", "Senior Credit Risk Analyst", "Credit Risk Manager"],
    "Market Risk Analyst": ["Market Risk Analyst", "Senior Market Risk Analyst", "Market Risk Manager"],
    "Operational Risk Manager": ["Risk Analyst", "Risk Manager", "Senior Risk Manager"],
    "Chief Risk Officer": ["VP of Risk", "Director of Risk", "CRO"],
    "Compliance Analyst": ["Compliance Analyst", "Senior Compliance Analyst / Compliance Officer", "Compliance Manager"],
    "AML / KYC Analyst": ["Analyst", "Senior Analyst", "AML / KYC Manager"],
    "Regulatory Affairs Manager": ["Analyst", "Manager", "Senior Manager / Director"],
  },
  wealth: {
    "Junior Financial Advisor": ["Trainee / Client Service Associate", "Junior Advisor", "Associate Advisor"],
    "Financial Advisor": ["Financial Advisor", "Senior Financial Advisor"],
    "Senior Financial Advisor": ["Senior Financial Advisor", "Lead Advisor", "Branch Manager"],
    "Wealth Manager": ["Wealth Manager", "Senior Wealth Manager", "Director of Wealth Management"],
    "Private Banker": ["Private Banker", "Senior Private Banker", "Managing Director"],
    "Estate Planner": ["Associate", "Estate Planner", "Senior Estate Planner"],
    "Retirement Planning Specialist": ["Specialist", "Senior Specialist", "Director"],
  },
  accounting: {
    "Staff Accountant": ["Intern / Entry-Level", "Staff Accountant I", "Staff Accountant II"],
    "Senior Accountant": ["Senior Accountant", "Lead Accountant", "Accounting Team Lead"],
    "Audit Associate": ["Audit Associate", "Senior Audit Associate", "Audit Supervisor"],
    "Audit Manager": ["Audit Manager", "Senior Audit Manager", "Audit Director"],
    "Tax Analyst": ["Tax Analyst", "Senior Tax Analyst", "Tax Manager"],
    "Internal Auditor": ["Internal Auditor", "Senior Internal Auditor", "Audit Manager"],
    "Controller": ["Assistant Controller", "Controller", "VP / Group Controller"],
    "Accounting Director": ["Accounting Director", "VP of Accounting", "CAO (Chief Accounting Officer)"],
  },
};

var WORK_FOCUS_BY_SECTOR = {
  ib: [
    "Financial modeling",
    "Pitch deck production",
    "Deal origination",
    "Due diligence",
    "Client relationship management",
    "Regulatory navigation",
    "Valuation (DCF / LBO / Comps)",
    "Debt & equity structuring",
  ],
  corporate: [
    "Budgeting & forecasting",
    "Variance analysis",
    "Financial modeling",
    "Board & exec reporting",
    "ERP & systems management",
    "Strategic planning",
    "Cash flow management",
    "Cross-functional leadership",
  ],
  investment: [
    "Equity research & company analysis",
    "Portfolio construction",
    "Quantitative modeling",
    "Risk-adjusted performance",
    "Macro & sector research",
    "Client communication",
    "ESG integration",
    "Factor modeling",
  ],
  risk: [
    "Credit risk modeling",
    "Stress testing & scenario analysis",
    "Regulatory reporting",
    "AML / KYC processes",
    "Policy & control design",
    "Enterprise risk frameworks",
    "Model validation",
    "Regulatory relationships",
  ],
  wealth: [
    "Client relationship management",
    "Financial planning",
    "Portfolio construction",
    "Estate & tax planning",
    "Retirement income planning",
    "Investment recommendations",
    "Client onboarding",
    "Business development",
  ],
  accounting: [
    "Financial statement preparation",
    "Audit procedures",
    "Tax compliance & planning",
    "Internal controls",
    "Month-end close",
    "Revenue recognition",
    "Technical accounting research",
    "External reporting",
  ],
};

var AFFINITY_COPY = {
  ib: {
    conscience: {
      question:
        "When a model, deck, or recommendation goes out that you know is thin, rushed, or not up to institutional standard — how does that sit with you?",
      explanation:
        "This tells us whether execution quality and intellectual honesty in finance work genuinely matter to you, independent of whether the deal team or client pushes back.",
    },
    pull: {
      question:
        "Outside of work, with no bonus and no MD asking, how often does your mind drift toward markets, structures, or how a transaction or business could be valued or improved?",
      explanation:
        "This tells us whether capital-markets and deal thinking is something you're naturally drawn to, or something you do primarily for the career path.",
    },
  },
  corporate: {
    conscience: {
      question:
        "When forecasts, close packages, or board narratives are knowingly optimistic, opaque, or misaligned with what the numbers really say — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about truthful reporting and planning, independent of whether leadership wants a smoother story.",
    },
    pull: {
      question:
        "Outside of work, how often do you find yourself thinking about cash, margins, planning cycles, or how a business could run more efficiently?",
      explanation:
        "This tells us whether corporate finance thinking is wired into how you see the world, or primarily a professional skill you apply at work.",
    },
  },
  investment: {
    conscience: {
      question:
        "When research, models, or portfolio narratives are stretched to fit a thesis you don't fully believe — how does that sit with you?",
      explanation:
        "This tells us whether intellectual rigor in investment judgment matters to you on its own, independent of short-term performance pressure.",
    },
    pull: {
      question:
        "Outside of work, how often does your mind drift toward companies, sectors, risk/reward, or how capital ought to be allocated?",
      explanation:
        "This tells us whether markets and security analysis are a genuine obsession, or chiefly how you earn a living.",
    },
  },
  risk: {
    conscience: {
      question:
        "When controls are weak, models are rubber-stamped, or regulatory obligations are treated as checkbox exercises — how does that sit with you?",
      explanation:
        "This tells us whether you genuinely care about sound risk and compliance culture, independent of whether it's politically easy to speak up.",
    },
    pull: {
      question:
        "Outside of work, how often do you notice flawed incentives, hidden risks, or how rules and guardrails actually behave in practice?",
      explanation:
        "This tells us whether risk and regulatory instinct is natural for you, or something you switch on when you're on the job.",
    },
  },
  wealth: {
    conscience: {
      question:
        "When client advice, suitability, or disclosures fall short of what you'd want for your own family — how does that sit with you?",
      explanation:
        "This tells us whether fiduciary-quality care genuinely matters to you, independent of sales targets or firm messaging.",
    },
    pull: {
      question:
        "Outside of work, how often do you think about people's financial lives — tradeoffs, goals, anxiety about money, or how advice could be clearer and fairer?",
      explanation:
        "This tells us whether client-centered financial thinking is something you're drawn to, or primarily a professional role.",
    },
  },
  accounting: {
    conscience: {
      question:
        "When filings, workpapers, or audit conclusions don't meet your bar for defensibility, documentation, or professional skepticism — how does that sit with you?",
      explanation:
        "This tells us whether technical and ethical quality in accounting work genuinely matters to you, independent of deadline pressure.",
    },
    pull: {
      question:
        "Outside of work, how often does your eye catch sloppy numbers, unclear disclosures, or how financial information could be presented more honestly?",
      explanation:
        "This tells us whether financial reporting and controls thinking is how your mind naturally works, or something you apply in a professional context.",
    },
  },
};

var VALID_FIRMS_BY_SECTOR = {
  ib: ["bulge_bracket", "regional_bank", "boutique_advisory", "pe_vc"],
  corporate: [
    "bulge_bracket",
    "regional_bank",
    "asset_management",
    "pe_vc",
    "hedge_fund",
    "corporate",
    "big4_consulting",
    "fintech",
    "boutique_advisory",
  ],
  investment: ["asset_management", "hedge_fund", "pe_vc", "bulge_bracket", "boutique_advisory", "fintech"],
  risk: ["bulge_bracket", "regional_bank", "asset_management", "hedge_fund", "pe_vc", "corporate", "fintech", "big4_consulting"],
  wealth: ["bulge_bracket", "regional_bank", "asset_management", "corporate", "fintech"],
  accounting: ["big4_consulting", "corporate", "regional_bank", "asset_management", "fintech", "bulge_bracket"],
};

var DEFAULT_SIZES_BY_FIRM = {
  bulge_bracket: ["5,001–50,000", "50,000+"],
  regional_bank: ["Under 50", "51–500", "501–5,000", "5,001–50,000"],
  boutique_advisory: ["Under 50", "51–500", "501–5,000"],
  pe_vc: ["Under 50", "51–500", "501–5,000"],
  hedge_fund: ["Under 50", "51–500"],
  asset_management: ["Under 50", "51–500", "501–5,000", "5,001–50,000", "50,000+"],
  corporate: ["Under 50", "51–500", "501–5,000", "5,001–50,000", "50,000+"],
  big4_consulting: ["5,001–50,000", "50,000+"],
  fintech: ["Under 50", "51–500", "501–5,000", "5,001–50,000"],
};

var OVERRIDE_SIZES = {
  corporate: {
    boutique_advisory: ["501–5,000"],
  },
};

function getValidSizes(sectorId, firmTypeId) {
  return (OVERRIDE_SIZES[sectorId] && OVERRIDE_SIZES[sectorId][firmTypeId]) || DEFAULT_SIZES_BY_FIRM[firmTypeId] || [];
}

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

  // --- STATE VARIABLES (declare at top) ---
  var [step, setStep] = useState(function () {
    try {
      var saved = localStorage.getItem("dz_saved_report_finance");
      if (saved) {
        var d = JSON.parse(saved);
        if (d && d.results && d.step === 6) return 6;
      }
    } catch (e) {}
    return 0;
  });
  var [sector, setSector] = useState("");
  var [role, setRole] = useState("");
  var [seniority, setSeniority] = useState("");
  var [firmType, setFirmType] = useState("");
  var [companySize, setCompanySize] = useState("");
  var [workFocus, setWorkFocus] = useState([]);
  var [conscience, setConscience] = useState(5);
  var [pull, setPull] = useState(5);
  var [fluencies, setFluencies] = useState({});
  var [adjustedSkills, setAdjustedSkills] = useState(new Set());
  var adjustedSkillsRef = useRef(new Set());
  var [skills, setSkills] = useState([]);
  var [landscape, setLandscape] = useState("");
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [error, setError] = useState(null);
  var [results, setResults] = useState(null);
  var [resultsLoading, setResultsLoading] = useState(false);
  var [resultsError, setResultsError] = useState(null);
  var [resultsLoadingMsg, setResultsLoadingMsg] = useState("Scoring your skills against market demand…");
  var [recommendations, setRecommendations] = useState(null);
  var [recsLoading, setRecsLoading] = useState(false);
  var [recsError, setRecsError] = useState(null);
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateError, setGateError] = useState(null);
  var [gateLoading, setGateLoading] = useState(false);
  var [showResend, setShowResend] = useState(false);
  var [gateOnDifferentDevice, setGateOnDifferentDevice] = useState(false);
  var [gateInputFocused, setGateInputFocused] = useState(false);
  var [gateScoreMsg, setGateScoreMsg] = useState("Scoring your skills against market demand…");
  var [tier, setTier] = useState(0);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [promoUsed, setPromoUsed] = useState(false);
  var [discountApplied, setDiscountApplied] = useState(false);
  void results;
  void resultsLoading;
  void resultsError;
  void resultsLoadingMsg;
  void recommendations;
  void recsLoading;
  void recsError;
  void gateEmail;
  void gateSent;
  void gateVerified;
  void gateError;
  void gateLoading;
  void showResend;
  void gateOnDifferentDevice;
  void gateInputFocused;
  void gateScoreMsg;
  void tier;
  void promoCode;
  void promoError;
  void promoUsed;
  void discountApplied;

  function restoreReport() {
    try {
      var saved = localStorage.getItem("dz_saved_report_finance");
      if (!saved) return;
      var d = JSON.parse(saved);
      if (d.sector) setSector(d.sector);
      if (d.role) setRole(d.role);
      if (d.seniority) setSeniority(d.seniority);
      if (d.firmType) setFirmType(d.firmType);
      if (d.companySize) setCompanySize(d.companySize);
      if (d.workFocus) setWorkFocus(d.workFocus);
      if (d.skills) setSkills(d.skills);
      if (d.conscience !== undefined) setConscience(d.conscience);
      if (d.pull !== undefined) setPull(d.pull);
      if (d.fluencies) setFluencies(d.fluencies);
      if (d.promoUsed) {
        setPromoUsed(true);
        setTier(3);
      }
      if (d.results) {
        setResults(d.results);
        setStep(6);
      }
    } catch (e) {
      console.error("restoreReport error:", e);
    }
  }

  useEffect(function () {
    // --- ON-LOAD: DETECT gate_token IN URL ---
    var params = new URLSearchParams(window.location.search);
    var gateToken = params.get("gate_token");

    if (gateToken) {
      window.history.replaceState({}, "", window.location.pathname);
      setGateLoading(true);

      fetch("/api/verify-gate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: gateToken }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data && data.valid === true) {
            setGateVerified(true);
            setGateLoading(false);

            var savedRaw = null;
            try {
              savedRaw = localStorage.getItem("dz_saved_report_finance");
            } catch (e) {}

            if (savedRaw) {
              try {
                var saved = JSON.parse(savedRaw);
                if (saved && typeof saved === "object") {
                  if (saved.sector !== undefined) setSector(saved.sector);
                  if (saved.role !== undefined) setRole(saved.role);
                  if (saved.seniority !== undefined) setSeniority(saved.seniority);
                  if (saved.firmType !== undefined) setFirmType(saved.firmType);
                  if (saved.companySize !== undefined) setCompanySize(saved.companySize);
                  if (saved.workFocus !== undefined) setWorkFocus(saved.workFocus);
                  if (saved.skills !== undefined) setSkills(saved.skills);
                  if (saved.conscience !== undefined) setConscience(saved.conscience);
                  if (saved.pull !== undefined) setPull(saved.pull);
                  if (saved.fluencies !== undefined) setFluencies(saved.fluencies);
                }
              } catch (e) {}
              setStep(5);
              return;
            }

            setStep(0);
            setGateOnDifferentDevice(true);
            return;
          }

          if (data && data.valid === false && data.reason === "expired") {
            setGateError("expired");
            setStep(5);
            setGateLoading(false);
            return;
          }

          setGateError("invalid");
          setStep(5);
          setGateLoading(false);
        })
        .catch(function () {
          setGateError("invalid");
          setStep(5);
          setGateLoading(false);
        });
    }

    var sessionId = params.get("session_id");
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      (async function () {
        try {
          var r = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              product: "finance",
            }),
          });
          var data = await r.json();
          if (data && data.token) {
            localStorage.setItem("dz_token_finance", data.token);
            setTier(data.tier || 2);
            restoreReport();
          }
        } catch (e) {
          console.error("verify-payment error:", e);
        }
      })();
    }

    var storedToken = localStorage.getItem("dz_token_finance");
    if (storedToken) {
      try {
        var parts = storedToken.split(".");
        if (parts.length === 3) {
          var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          var now = Math.floor(Date.now() / 1000);
          if (payload.exp > now && payload.product === "finance") {
            setTier(payload.tier || 2);
            restoreReport();
          }
        }
      } catch (e) {
        console.error("token decode error:", e);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- on-load only; restoreReport uses stable setters

  useEffect(
    function () {
      if (!reportMode) return;
      var restoredAfterToken = false;
      var storedToken = localStorage.getItem("dz_token_finance");
      if (storedToken) {
        try {
          var parts = storedToken.split(".");
          if (parts.length === 3) {
            var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            var now = Math.floor(Date.now() / 1000);
            if (payload.exp > now && payload.product === "finance") {
              setTier(payload.tier || 2);
              // Always try to restore results if they exist in localStorage
              try {
                var savedReport = localStorage.getItem("dz_saved_report_finance");
                if (savedReport) {
                  var parsedReport = JSON.parse(savedReport);
                  if (parsedReport && parsedReport.results &&
                      parsedReport.step === 6) {
                    if (parsedReport.sector) setSector(parsedReport.sector);
                    if (parsedReport.role) setRole(parsedReport.role);
                    if (parsedReport.seniority) setSeniority(parsedReport.seniority);
                    if (parsedReport.firmType) setFirmType(parsedReport.firmType);
                    if (parsedReport.companySize) setCompanySize(parsedReport.companySize);
                    if (parsedReport.workFocus) setWorkFocus(parsedReport.workFocus);
                    if (parsedReport.skills) setSkills(parsedReport.skills);
                    if (parsedReport.conscience !== undefined) setConscience(parsedReport.conscience);
                    if (parsedReport.pull !== undefined) setPull(parsedReport.pull);
                    if (parsedReport.fluencies) setFluencies(parsedReport.fluencies);
                    if (parsedReport.promoUsed) {
                      setPromoUsed(true);
                      setTier(3);
                    }
                    setResults(parsedReport.results);
                    setStep(6);
                  }
                }
              } catch (e) {
                console.error("auto-restore error:", e);
              }
              restoredAfterToken = true;
            }
          }
        } catch (e) {}
      }
      var saved = localStorage.getItem("dz_saved_report_finance");
      if (!saved) {
        window.location.href = "/finance";
        return;
      }
      if (!restoredAfterToken) {
        // Always try to restore results if they exist in localStorage
        try {
          var savedReport = localStorage.getItem("dz_saved_report_finance");
          if (savedReport) {
            var parsedReport = JSON.parse(savedReport);
            if (parsedReport && parsedReport.results &&
                parsedReport.step === 6) {
              if (parsedReport.sector) setSector(parsedReport.sector);
              if (parsedReport.role) setRole(parsedReport.role);
              if (parsedReport.seniority) setSeniority(parsedReport.seniority);
              if (parsedReport.firmType) setFirmType(parsedReport.firmType);
              if (parsedReport.companySize) setCompanySize(parsedReport.companySize);
              if (parsedReport.workFocus) setWorkFocus(parsedReport.workFocus);
              if (parsedReport.skills) setSkills(parsedReport.skills);
              if (parsedReport.conscience !== undefined) setConscience(parsedReport.conscience);
              if (parsedReport.pull !== undefined) setPull(parsedReport.pull);
              if (parsedReport.fluencies) setFluencies(parsedReport.fluencies);
              if (parsedReport.promoUsed) {
                setPromoUsed(true);
                setTier(3);
              }
              setResults(parsedReport.results);
              setStep(6);
            }
          }
        } catch (e) {
          console.error("auto-restore error:", e);
        }
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps -- mount-only report deep-link
  );

  useEffect(
    function () {
      if (reportMode) return;
      try {
        var saved = localStorage.getItem("dz_saved_report_finance");
        if (!saved) return;
        var d = JSON.parse(saved);
        if (d.results && d.step === 6) {
          if (d.sector) setSector(d.sector);
          if (d.role) setRole(d.role);
          if (d.seniority) setSeniority(d.seniority);
          if (d.firmType) setFirmType(d.firmType);
          if (d.companySize) setCompanySize(d.companySize);
          if (d.workFocus) setWorkFocus(d.workFocus);
          if (d.skills) setSkills(d.skills);
          if (d.conscience !== undefined) setConscience(d.conscience);
          if (d.pull !== undefined) setPull(d.pull);
          if (d.fluencies) setFluencies(d.fluencies);
          if (d.promoUsed) {
            setPromoUsed(true);
            setTier(3);
          }
          setResults(d.results);
          setStep(6);
        }
      } catch (e) {
        console.error("auto-restore error:", e);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps -- mount-only auto-restore
  );

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

  useEffect(
    function () {
      setCompanySize("");
    },
    [firmType]
  );

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

  var containerOuter = {
    background: S.bg,
    minHeight: "100vh",
    padding: "32px 20px",
    fontFamily: S.font,
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
  };

  var containerInner = { maxWidth: 640, width: "100%", margin: "0 auto" };

  var backBtnStyle = {
    fontFamily: S.mono,
    fontSize: 12,
    color: S.dim,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  };

  function ProgressDots(props2) {
    var current = props2.current;
    return (
      <div style={{ marginBottom: 32 }}>
        {[0, 1, 2, 3, 4].map(function (i) {
          var filled = i <= current;
          var color = filled ? S.gold : S.border;
          return (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                display: "inline-block",
                marginRight: 6,
                background: color,
              }}
            />
          );
        })}
      </div>
    );
  }

  var continueBtnBase = {
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
  };

  var firmTypeOptions = [
    {
      id: "bulge_bracket",
      label: "Bulge Bracket / Global Bank",
      desc: "JPMorgan, Goldman, Morgan Stanley, Citi, Barclays, Deutsche Bank",
    },
    { id: "regional_bank", label: "Regional / Boutique Bank", desc: "Mid-size commercial and regional banks" },
    {
      id: "boutique_advisory",
      label: "Boutique Advisory",
      desc: "Independent M&A and restructuring advisors (Lazard, Evercore, PJT)",
    },
    { id: "pe_vc", label: "Private Equity / Venture Capital", desc: "Buyout, growth, and venture investment firms" },
    { id: "hedge_fund", label: "Hedge Fund", desc: "Long/short, macro, quant, and multi-strategy funds" },
    {
      id: "asset_management",
      label: "Asset Management / Mutual Fund",
      desc: "Fidelity, Vanguard, BlackRock, and independent managers",
    },
    { id: "corporate", label: "Corporate (In-house)", desc: "Finance team inside a company — any industry" },
    { id: "big4_consulting", label: "Big 4 / Consulting", desc: "Deloitte, PwC, EY, KPMG, McKinsey, Bain, BCG" },
    { id: "fintech", label: "Fintech / AI-native Firm", desc: "Stripe, Robinhood, Plaid, and AI-first financial companies" },
  ];

  function snapToStop(val) {
    var stops = [0, 3, 5, 7, 10];
    return stops.reduce(function (prev, curr) {
      return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
    });
  }

  function calcDZ(aff, aiR, mkt) {
    return Math.min(100, Math.round(100 * Math.pow(aff / 10, 0.35) * Math.pow((10 - aiR) / 10, 0.40) * Math.pow(mkt / 10, 0.25)));
  }

  function computeAffinity(c, p, f) {
    return Math.round((c * 0.35 + p * 0.35 + f * 0.3) * 10) / 10;
  }

  function getSeed(c, p) {
    var raw = Math.round((c * 0.5 + p * 0.5) * 10) / 10;
    var stops = [0, 3, 5, 7, 10];
    return stops.reduce(function (prev, curr) {
      return Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev;
    });
  }

  function markAdjusted(id) {
    adjustedSkillsRef.current.add(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  function fluencyStopLabel(val) {
    if (val === 0) return "Not part of my work";
    if (val === 3) return "Basic familiarity";
    if (val === 5) return "Competent";
    if (val === 7) return "Strong";
    if (val === 10) return "Expert-level";
    return "";
  }

  async function fetchSkills() {
    var loadingMsgs = [
      "Mapping your position on the AI exposure curve…",
      "Pulling current data on your sector…",
      "Building your skill landscape…",
    ];
    setLoading(true);
    setLoadingMsg(loadingMsgs[0]);
    setError(null);
    var msgIndex = 0;
    var msgInterval = setInterval(function () {
      msgIndex = (msgIndex + 1) % loadingMsgs.length;
      setLoadingMsg(loadingMsgs[msgIndex]);
    }, 3000);

    var sectorRow = FINANCE_SECTORS.find(function (s) {
      return s.id === sector;
    });
    var sectorFullLabel = sectorRow ? sectorRow.title : sector;
    var firmOpt = firmTypeOptions.find(function (o) {
      return o.id === firmType;
    });
    var firmTypeLabel = firmOpt ? firmOpt.label : firmType;
    var workFocusJoined = (workFocus || []).join(", ");

    var prompt =
      "You are a senior finance career strategist specializing in AI labor market analysis for financial professionals.\n\nPROFESSIONAL PROFILE:\n- Sector: " +
      sectorFullLabel +
      "\n- Role: " +
      role +
      "\n- Seniority: " +
      seniority +
      "\n- Firm type: " +
      firmTypeLabel +
      "\n- Organization size: " +
      companySize +
      "\n- Work focus: " +
      workFocusJoined +
      "\n\nTask 1 — LANDSCAPE: Write 2-3 precise sentences about how AI is affecting this exact professional profile RIGHT NOW in 2026. Name specific tools where relevant (Bloomberg AI, OpenAI Mercury, Microsoft Copilot for Finance, Harvey, Kensho, Workiva, Alteryx). Be specific to this role, seniority, and firm type — not generic.\n\nTask 2 — SKILLS: Generate exactly 8 skills that are the most strategically important for this professional to assess for AI defensibility right now. Include a realistic mix — some genuinely at risk from AI, some defensible. Be specific to this seniority level and work focus area.\n\nReturn ONLY valid JSON with no preamble:\n{\"landscape\":\"...\",\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]}";

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
      if (!parsed.skills || !Array.isArray(parsed.skills)) throw new Error("Invalid skills");
      var loaded = parsed.skills.map(function (text, i) {
        return { id: "s" + i, text: text };
      });
      setLandscape(parsed.landscape || "");
      setSkills(loaded);
      adjustedSkillsRef.current = new Set();
      setAdjustedSkills(new Set());
      setFluencies({});
    } catch (e) {
      setError("Something went wrong loading your skills. Please try again.");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  async function fetchRecommendations(scoredSkills, overallDZOverride) {
    setRecsLoading(true);
    setRecsError(null);

    var firmOpt = firmTypeOptions.find(function (o) {
      return o.id === firmType;
    });
    var firmTypeLabel = firmOpt ? firmOpt.label : firmType;
    var workFocusJoined = (workFocus || []).join(", ");
    var overallDZ =
      overallDZOverride !== undefined ? overallDZOverride : results && results.overallDZ !== undefined ? results.overallDZ : "";

    var listLines = (scoredSkills || []).map(function (s, idx) {
      var txt = s && s.text ? s.text : "";
      var aiR = s && s.aiR !== undefined ? s.aiR : "";
      var market = s && s.market !== undefined ? s.market : "";
      return idx + 1 + ". " + txt + " — AI Risk: " + aiR + "/10, Market Demand: " + market + "/10";
    });

    var prompt =
      "You are a senior finance career strategist.\n\nA " +
      seniority +
      " " +
      role +
      " at a " +
      firmTypeLabel +
      ",\norganization size " +
      companySize +
      ", focused on\n" +
      workFocusJoined +
      ", just completed a\nDefensible Zone assessment.\n\nTheir overall Defensible Zone score is " +
      overallDZ +
      "/100.\n\nSkills with scores:\n" +
      listLines.join("\n") +
      '\n\nFor each skill write a short personalized recommendation.\nBe direct and specific to their seniority, firm type, \nand focus area.\nDo not use the words threat, danger, or risk.\nDo not use emojis.\nFinance professionals appreciate precision over \nencouragement.\n\nReturn ONLY valid JSON:\n{"recommendations":[{"id":"s0",\n"headline":"5-7 word action headline",\n"action":"One specific thing to do in the next \n90 days.",\n"why":"One sentence on why this matters for \ntheir exact situation."}]}';

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
      var parsed = JSON.parse(m[0]);
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) throw new Error("Invalid recommendations");
      setRecommendations(parsed.recommendations);
    } catch (e) {
      setRecsError("Could not load recommendations.");
    } finally {
      setRecsLoading(false);
    }
  }

  async function fetchResults() {
    var loadingMsgs = ["Scoring your skills against market demand…", "Running the numbers…", "Calculating your Defensible Zone™…"];
    setResultsLoading(true);
    setResultsLoadingMsg(loadingMsgs[0]);
    setResultsError(null);
    var msgIndex = 0;
    var msgInterval = setInterval(function () {
      msgIndex = (msgIndex + 1) % loadingMsgs.length;
      setResultsLoadingMsg(loadingMsgs[msgIndex]);
    }, 3000);

    var sectorRow = FINANCE_SECTORS.find(function (s) {
      return s.id === sector;
    });
    var sectorFullLabel = sectorRow ? sectorRow.title : sector;
    var firmOpt = firmTypeOptions.find(function (o) {
      return o.id === firmType;
    });
    var firmTypeLabel = firmOpt ? firmOpt.label : firmType;
    var workFocusJoined = (workFocus || []).join(", ");

    var skillsLines = (skills || []).map(function (sk, idx) {
      var flu = fluencies[sk.id] !== undefined ? fluencies[sk.id] : 5;
      return idx + 1 + ". " + sk.text + " (user fluency: " + flu + "/10)";
    });

    var prompt =
      "You are a senior finance career strategist and AI labor \nmarket analyst.\n\nPROFESSIONAL PROFILE:\n- Sector: " +
      sectorFullLabel +
      "\n- Role: " +
      role +
      "\n- Seniority: " +
      seniority +
      "\n- Firm type: " +
      firmTypeLabel +
      "\n- Organization size: " +
      companySize +
      "\n- Work focus: " +
      workFocusJoined +
      "\n\nSKILLS TO SCORE:\n" +
      skillsLines.join("\n") +
      '\n\nFor each skill return:\n- ai_replaceability: float 0-10\n- market_demand: float 0-10\n- rationale: one precise sentence for this specific profile\n\nReturn ONLY valid JSON:\n{"skills":[{"id":"s0","aiR":7.5,"market":8.0,\n"rationale":"..."},{"id":"s1","aiR":3.0,\n"market":7.5,"rationale":"..."}]}';

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
      var parsed = JSON.parse(m[0]);
      if (!parsed.skills || !Array.isArray(parsed.skills)) throw new Error("Invalid skills");

      var textById = {};
      (skills || []).forEach(function (s) {
        textById[s.id] = s.text;
      });

      var dzScores = [];
      var scoredSkills = parsed.skills.map(function (s) {
        var flu = fluencies[s.id] !== undefined ? fluencies[s.id] : 5;
        var aff = computeAffinity(conscience, pull, flu);
        var dz = calcDZ(aff, s.aiR, s.market);
        dzScores.push(dz);
        return Object.assign({}, s, { dz: dz, text: textById[s.id] || "" });
      });

      var overallDZ = 0;
      if (dzScores.length > 0) {
        overallDZ = Math.round(
          dzScores.reduce(function (sum, v) {
            return sum + v;
          }, 0) / dzScores.length
        );
      }

      var resultsObject = { overallDZ: overallDZ, skills: scoredSkills };

      try {
        localStorage.setItem(
          "dz_saved_report_finance",
          JSON.stringify({
            step: 6,
            sector: sector,
            role: role,
            seniority: seniority,
            firmType: firmType,
            companySize: companySize,
            workFocus: workFocus,
            skills: skills,
            conscience: conscience,
            pull: pull,
            fluencies: fluencies,
            promoUsed: promoUsed,
            results: resultsObject,
          })
        );
      } catch (e) {}

      setResults(resultsObject);
      setResultsLoading(false);
      setStep(6);
      fetchRecommendations(resultsObject.skills, resultsObject.overallDZ);
    } catch (e) {
      setResultsError("Something went wrong scoring your skills. Please try again.");
      setResultsLoading(false);
    } finally {
      clearInterval(msgInterval);
    }
  }

  useEffect(function () {
    if (results && (tier >= 2 || promoUsed) && recommendations === null && !recsLoading) {
      fetchRecommendations(results.skills, results.overallDZ);
    }
  }, [results, tier, promoUsed]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional gating deps

  useEffect(
    function () {
      if (!(step === 5 && gateVerified)) return;
      var msgs = ["Scoring your skills against market demand…", "Running the numbers…", "Calculating your Defensible Zone™…"];
      var i = 0;
      setGateScoreMsg(msgs[0]);
      var t = setInterval(function () {
        i = (i + 1) % msgs.length;
        setGateScoreMsg(msgs[i]);
      }, 3000);
      return function () {
        clearInterval(t);
      };
    },
    [step, gateVerified]
  );

  useEffect(
    function () {
      if (!gateSent) return;
      setShowResend(false);
      var t = setTimeout(function () {
        setShowResend(true);
      }, 60000);
      return function () {
        clearTimeout(t);
      };
    },
    [gateSent]
  );

  useEffect(
    function () {
      if (step === 5 && gateVerified && !results && !resultsLoading && skills.length > 0) {
        fetchResults();
      }
    },
    [step, gateVerified, skills] // eslint-disable-line react-hooks/exhaustive-deps -- fetchResults stub is stable
  );

  function isValidEmail(email) {
    if (!email) return false;
    var at = email.indexOf("@");
    if (at <= 0) return false;
    var dot = email.indexOf(".", at + 2);
    if (dot === -1) return false;
    if (dot >= email.length - 1) return false;
    return true;
  }

  async function handleGateSubmit() {
    if (!isValidEmail(gateEmail)) {
      setGateError("Please enter a valid email.");
      return;
    }
    setGateLoading(true);
    setGateError(null);

    try {
      await fetch("/api/send-gate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gateEmail }),
      });
      setGateSent(true);
      setGateLoading(false);
    } catch (e) {
      setGateError("Something went wrong. Please try again.");
      setGateLoading(false);
    }
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
      if (step !== 4) return;
      if (skills.length > 0) return;
      fetchSkills();
    },
    [step, skills.length] // eslint-disable-line react-hooks/exhaustive-deps -- fetchSkills closes over latest form state on step 4 entry
  );

  if (resultsLoading) {
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
            __html: "@keyframes dzFinanceDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
            DEFENSIBLE ZONE™ · FINANCE EDITION
          </div>
          <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{resultsLoadingMsg}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
            <span style={{ animation: "dzFinanceDots 1s ease-in-out infinite" }}>.</span>
            <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.2s infinite" }}>.</span>
            <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.4s infinite" }}>.</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 6) {
    function getScoreBand(score) {
      if (score <= 30) return { label: "Minimal AI Exposure", color: S.green };
      if (score <= 55) return { label: "Moderate AI Integration", color: S.blue };
      if (score <= 74) return { label: "High AI Augmentation", color: S.gold };
      return { label: "Extensive AI Transformation", color: S.red };
    }

    var firmOpt = firmTypeOptions.find(function (o) {
      return o.id === firmType;
    });
    var firmTypeLabel = firmOpt ? firmOpt.label : firmType;

    var showResultsError = resultsError !== null;
    var showNullResultsError = !resultsLoading && results === null;
    if (showResultsError || showNullResultsError) {
      var msg = showResultsError ? resultsError : "Something went wrong. Please start over.";
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
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{msg}</div>
            {showResultsError ? (
              <button
                type="button"
                onClick={function () {
                  setResultsError(null);
                  fetchResults();
                }}
                style={Object.assign({}, continueBtnBase, { marginTop: 0, width: "auto", minWidth: 200 })}
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    var overallScore = results && typeof results.overallDZ === "number" ? results.overallDZ : 0;
    var overallBand = getScoreBand(overallScore);

    var skillsList = (results && Array.isArray(results.skills) ? results.skills : []).slice();
    var mostDefensible = null;
    var highestExposure = null;
    skillsList.forEach(function (s) {
      if (!s) return;
      if (!mostDefensible || (typeof s.aiR === "number" && s.aiR < mostDefensible.aiR)) mostDefensible = s;
      if (!highestExposure || (typeof s.aiR === "number" && s.aiR > highestExposure.aiR)) highestExposure = s;
    });

    function skillBandColor(s) {
      var dz = s && typeof s.dz === "number" ? s.dz : 0;
      return getScoreBand(dz).color;
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", padding: "32px 20px", fontFamily: S.font, boxSizing: "border-box" }}>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "@media (max-width:640px){.dz-finance-highlights{flex-wrap:wrap !important;}.dz-finance-highlights > div{min-width:100% !important;}}@media print{.no-print{display:none !important;}}",
          }}
        />
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div id="dz-finance-report">
            <a
              className="no-print"
              href="/"
              style={{
                display: "block",
                marginBottom: 24,
                fontFamily: S.mono,
                fontSize: 12,
                color: S.muted,
                textDecoration: "none",
              }}
            >
              ← DEFENSIBLE ZONE™
            </a>

            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 8, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ · FINANCE EDITION
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: "4px solid " + overallBand.color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: overallBand.color,
                    lineHeight: 1,
                    fontFamily: S.mono,
                  }}
                >
                  {overallScore}
                </span>
                <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: S.mono, marginTop: 2 }}>/ 100</span>
              </div>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: 16,
                  fontWeight: 600,
                  color: overallBand.color,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                {overallBand.label}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid " + S.border,
                borderRadius: 12,
                padding: 24,
                marginTop: 24,
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 18, fontFamily: S.font, fontWeight: 600, color: S.text, marginBottom: 10 }}>What your score means</div>
              <div style={{ fontSize: 15, color: S.dim, lineHeight: 1.7 }}>
                Your {overallScore}/100 reflects how your specific skills as a {seniority} {role} at a {firmTypeLabel} balance against AI displacement risk and
                market demand. A higher score means more of your work sits in areas where human judgment, relationships, and contextual expertise still command a
                premium.
              </div>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, fontStyle: "italic", marginTop: 12, lineHeight: 1.55 }}>
                Role levels and sector classifications sourced from: BLS Occupational Outlook Handbook · Wall Street Prep · Mergers &amp; Acquisitions
                (mergersandinquisitions.com) · Corporate Finance Institute · eFinancialCareers · CFA Institute
              </div>
            </div>

            <div className="dz-finance-highlights" style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid " + S.border,
                  borderRadius: 12,
                  padding: 20,
                  flex: 1,
                  minWidth: 240,
                  borderLeft: "4px solid " + S.green,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.green, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  MOST DEFENSIBLE
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginTop: 6, lineHeight: 1.35 }}>
                  {mostDefensible && mostDefensible.text ? mostDefensible.text : "—"}
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 14, color: S.green, marginTop: 6, fontWeight: 700 }}>
                  DZ {mostDefensible && typeof mostDefensible.dz === "number" ? mostDefensible.dz : "—"}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid " + S.border,
                  borderRadius: 12,
                  padding: 20,
                  flex: 1,
                  minWidth: 240,
                  borderLeft: "4px solid " + S.red,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.red, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  HIGHEST AI EXPOSURE
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginTop: 6, lineHeight: 1.35 }}>
                  {highestExposure && highestExposure.text ? highestExposure.text : "—"}
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 14, color: S.red, marginTop: 6, fontWeight: 700 }}>
                  DZ {highestExposure && typeof highestExposure.dz === "number" ? highestExposure.dz : "—"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              SKILL BREAKDOWN
            </div>

            {skillsList.map(function (skill, idx) {
              var dz = skill && typeof skill.dz === "number" ? skill.dz : 0;
              var col = skillBandColor(skill);
              var aiRVal = skill && typeof skill.aiR === "number" ? skill.aiR : 0;
              var mktVal = skill && typeof skill.market === "number" ? skill.market : 0;
              return (
                <div
                  key={(skill && skill.id ? skill.id : "skill") + "-" + idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid " + S.border,
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginBottom: 12,
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                      {skill && skill.text ? skill.text : "—"}
                    </div>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid " + col,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: S.mono,
                        fontSize: 14,
                        fontWeight: 700,
                        color: col,
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      {dz}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, marginBottom: 4 }}>AI Replaceability</div>
                    <div style={{ height: 6, borderRadius: 3, background: S.card2, overflow: "hidden" }}>
                      <div style={{ width: (aiRVal / 10) * 100 + "%", height: "100%", background: S.red, borderRadius: 3 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, marginBottom: 4 }}>Market Demand</div>
                    <div style={{ height: 6, borderRadius: 3, background: S.card2, overflow: "hidden" }}>
                      <div style={{ width: (mktVal / 10) * 100 + "%", height: "100%", background: S.green, borderRadius: 3 }} />
                    </div>
                  </div>

                  {skill && skill.rationale ? (
                    <div style={{ fontSize: 14, color: S.dim, fontStyle: "italic", marginTop: 10, lineHeight: 1.55 }}>{skill.rationale}</div>
                  ) : null}
                </div>
              );
            })}

            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
                marginTop: 32,
                fontWeight: 600,
              }}
            >
              90-DAY ACTION PLAN
            </div>

            {tier === 0 && !promoUsed ? (
              (function () {
                var recs = Array.isArray(recommendations) ? recommendations : [];
                var first = recs[0];
                return (
                  <div>
                    {first ? (
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid " + S.border,
                          borderRadius: 12,
                          padding: "20px 24px",
                          marginBottom: 12,
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.3 }}>{first.headline}</div>
                        <div style={{ fontSize: 15, color: S.dim, marginTop: 6, lineHeight: 1.6 }}>{first.action}</div>
                        <div style={{ fontSize: 14, color: S.dim, fontStyle: "italic", marginTop: 4, lineHeight: 1.55 }}>{first.why}</div>
                      </div>
                    ) : null}

                    <div style={{ position: "relative" }}>
                      <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
                        {[0, 1, 2].map(function (i) {
                          return (
                            <div
                              key={i}
                              style={{
                                background: "#ffffff",
                                border: "1px solid " + S.border,
                                borderRadius: 12,
                                padding: "20px 24px",
                                marginBottom: 12,
                                boxSizing: "border-box",
                              }}
                            >
                              <div style={{ fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.3 }}>Recommendation {i + 2}</div>
                              <div style={{ fontSize: 15, color: S.dim, marginTop: 6, lineHeight: 1.6 }}>
                                Specific action steps tailored to your role…
                              </div>
                              <div style={{ fontSize: 14, color: S.dim, fontStyle: "italic", marginTop: 4, lineHeight: 1.55 }}>
                                Why this matters in your sector…
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="no-print"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%,-50%)",
                          background: "#ffffff",
                          borderRadius: 16,
                          padding: 32,
                          textAlign: "center",
                          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                          maxWidth: 380,
                          width: "calc(100% - 32px)",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ fontSize: 20, fontWeight: 600, color: S.text, marginBottom: 8 }}>Unlock Your Full Action Plan</div>
                        <div style={{ fontSize: 14, color: S.dim, marginBottom: 24, lineHeight: 1.6 }}>
                          See exactly what to do in the next 90 days — specific to your role, your firm, and where AI is moving in your sector.
                        </div>

                        <button
                          type="button"
                          onClick={function () {
                            var url =
                              "https://buy.stripe.com/00weVdbZocrp99z93UdQQ0a" +
                              (gateEmail ? "?prefilled_email=" + encodeURIComponent(gateEmail) : "");
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                          style={{
                            width: "100%",
                            background: S.accent,
                            color: "#ffffff",
                            borderRadius: 10,
                            padding: 14,
                            fontSize: 15,
                            fontWeight: 600,
                            marginBottom: 10,
                            cursor: "pointer",
                            border: "none",
                            fontFamily: S.font,
                          }}
                        >
                          Unlock My Action Plan — $59
                        </button>

                        <div style={{ position: "relative" }}>
                          <div
                            style={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              background: S.gold,
                              color: "#ffffff",
                              borderRadius: 20,
                              padding: "2px 10px",
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: S.mono,
                            }}
                          >
                            BEST VALUE
                          </div>
                          <button
                            type="button"
                            onClick={function () {
                              var url =
                                "https://buy.stripe.com/7sYcN5bZobnlclL3JAdQQ0b" +
                                (gateEmail ? "?prefilled_email=" + encodeURIComponent(gateEmail) : "");
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            style={{
                              width: "100%",
                              background: S.gold,
                              color: "#ffffff",
                              borderRadius: 10,
                              padding: 14,
                              fontSize: 15,
                              fontWeight: 600,
                              cursor: "pointer",
                              border: "none",
                              fontFamily: S.font,
                            }}
                          >
                            Unlock Plan + PDF — $64
                          </button>
                        </div>

                        <div style={{ color: S.dim, fontSize: 13, margin: "16px 0", lineHeight: 1 }}>or</div>

                        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                          <input
                            type="text"
                            placeholder="Have a promo code?"
                            value={promoCode}
                            onChange={function (e) {
                              setPromoCode(e.target.value);
                              if (promoError) setPromoError("");
                            }}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              padding: "12px 14px",
                              fontSize: 15,
                              fontFamily: S.mono,
                              border: "1px solid " + S.border,
                              borderRadius: 10,
                              background: "#ffffff",
                              color: S.text,
                              boxSizing: "border-box",
                            }}
                          />
                          <button
                            type="button"
                            onClick={function () {
                              var v = (promoCode || "").trim().toUpperCase();
                              if (v === "DZFRIEND" || v === "DZPREVIEW" || v === "DZTEST") {
                                setPromoUsed(true);
                                setTier(3);
                                setPromoError("");
                              } else {
                                setPromoError("Invalid code");
                              }
                            }}
                            style={{
                              padding: "12px 20px",
                              fontSize: 15,
                              fontFamily: S.font,
                              fontWeight: 600,
                              background: S.accent,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              cursor: "pointer",
                            }}
                          >
                            Apply
                          </button>
                        </div>
                        {promoError ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{promoError}</div> : null}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>
                {recsLoading ? (
                  <div style={{ fontSize: 14, color: S.dim, fontStyle: "italic", textAlign: "center", padding: "14px 0" }}>
                    Generating your recommendations…
                  </div>
                ) : recsError ? (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>{recsError}</div>
                    <button
                      type="button"
                      onClick={function () {
                        fetchRecommendations(results.skills);
                      }}
                      style={Object.assign({}, continueBtnBase, { marginTop: 0, width: "auto", minWidth: 200 })}
                    >
                      Try again
                    </button>
                  </div>
                ) : null}

                {(Array.isArray(recommendations) ? recommendations : []).slice(0, 8).map(function (rec, idx) {
                  return (
                    <div
                      key={(rec && rec.id ? rec.id : "rec") + "-" + idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid " + S.border,
                        borderRadius: 12,
                        padding: "20px 24px",
                        marginBottom: 12,
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, fontWeight: 700 }}>{idx + 1}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginTop: 4, lineHeight: 1.3 }}>
                        {rec && rec.headline ? rec.headline : "—"}
                      </div>
                      <div style={{ fontSize: 15, color: S.dim, marginTop: 8, lineHeight: 1.6 }}>{rec && rec.action ? rec.action : ""}</div>
                      <div style={{ fontSize: 14, color: S.dim, fontStyle: "italic", marginTop: 4, lineHeight: 1.55 }}>{rec && rec.why ? rec.why : ""}</div>
                    </div>
                  );
                })}

                {tier >= 3 || promoUsed ? (
                  <div className="no-print" style={{ marginTop: 12 }}>
                    <PDFButton contentId="dz-finance-report" />
                  </div>
                ) : null}
              </div>
            )}

            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: "1px solid " + S.border,
                fontFamily: S.mono,
                fontSize: 11,
                color: S.dim,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              DEFENSIBLE ZONE™ is a product of Recursio Lab. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4 && error) {
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
              setError(null);
              fetchSkills();
            }}
            style={Object.assign({}, continueBtnBase, { marginTop: 0, width: "auto", minWidth: 200 })}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === 4 && (loading || skills.length === 0)) {
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
            __html: "@keyframes dzFinanceDots{0%,100%{opacity:0.25}50%{opacity:1}}",
          }}
        />
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              color: S.gold,
              letterSpacing: "0.1em",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            DEFENSIBLE ZONE™ · FINANCE EDITION
          </div>
          <div style={{ fontFamily: S.serif, fontSize: 22, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{loadingMsg}</div>
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
            <span style={{ animation: "dzFinanceDots 1s ease-in-out infinite" }}>.</span>
            <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.2s infinite" }}>.</span>
            <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.4s infinite" }}>.</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4 && skills.length > 0 && !loading) {
    var affinityStops = [0, 3, 5, 7, 10];
    var conscienceLabelTexts = [
      "Relieved to move on",
      "Mildly bothered",
      "Somewhat unsettled",
      "Want to fix it",
      "Can't let it go",
    ];
    var pullLabelTexts = ["Almost never", "Occasionally", "Sometimes", "Regularly", "Constantly"];
    var affinitySector = sector;
    var consciencePct = (conscience / 10) * 100;
    var pullPct = (pull / 10) * 100;
    return (
      <div style={{ background: S.bg, minHeight: "100vh", padding: "32px 20px", fontFamily: S.font }}>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "input[type=range].dz-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; border: none; } input[type=range].dz-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.18); } input[type=range].conscience-sl::-webkit-slider-thumb { background: #7c3aed; } input[type=range].pull-sl::-webkit-slider-thumb { background: #0891b2; } input[type=range].fluency-sl::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #d97706; border: 2px solid white; cursor: pointer; }",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button type="button" onClick={() => setStep(3)} style={backBtnStyle}>
            ← back
          </button>
          <ProgressDots current={4} />

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
            How does this work feel to you?
          </h1>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 24px" }}>
            These questions are not about how skilled you are. They are about whether this type of work genuinely fits you. Be honest — the model uses this to
            weight your scores.
          </p>

          <div
            style={{
              background: S.card2,
              border: "1px solid " + S.border,
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.gold,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              YOUR AI LANDSCAPE
            </div>
            <div style={{ fontSize: 15, fontFamily: S.font, color: S.muted, lineHeight: 1.7 }}>{landscape}</div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid " + S.border,
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
            <p style={{ fontSize: 16, fontStyle: "italic", color: S.muted, lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              {AFFINITY_COPY[affinitySector]?.conscience?.question ??
                "When your work falls short of your own standard — analysis that felt rushed, or judgment you would not stand behind — how does that sit with you?"}
            </p>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              {AFFINITY_COPY[affinitySector]?.conscience?.explanation ??
                "This tells us whether quality and integrity in finance work genuinely matter to you, independent of whether anyone else notices."}
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
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${consciencePct}%, ${S.card2} ${consciencePct}%, ${S.card2} 100%)`,
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
                      fontFamily: S.mono,
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
              background: "#ffffff",
              border: "1px solid " + S.border,
              borderRadius: 14,
              padding: "24px 28px",
              marginBottom: 32,
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
            <p style={{ fontSize: 16, fontStyle: "italic", color: S.muted, lineHeight: 1.6, marginBottom: 6, marginTop: 0 }}>
              {AFFINITY_COPY[affinitySector]?.pull?.question ??
                "Outside of work, with no deadlines and no brief, how often does your mind drift toward how financial decisions, markets, or organizations could work better?"}
            </p>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
              {AFFINITY_COPY[affinitySector]?.pull?.explanation ??
                "This tells us whether finance thinking is something you're naturally drawn to, or something you do primarily because it pays well."}
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
                background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${pullPct}%, ${S.card2} ${pullPct}%, ${S.card2} 100%)`,
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
                      fontFamily: S.mono,
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

          <div
            style={{
              fontFamily: S.mono,
              fontSize: 12,
              textTransform: "uppercase",
              color: S.muted,
              letterSpacing: "0.08em",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            RATE YOUR FLUENCY
          </div>
          <p style={{ fontSize: 15, color: S.dim, marginBottom: 24, marginTop: 0, lineHeight: 1.6 }}>
            For each skill, how fluent are you? These sliders are pre-seeded from your answers above — adjust any that don&apos;t feel right.
          </p>

          {skills.map(function (skill) {
            var fluencyVal = fluencies[skill.id] !== undefined ? fluencies[skill.id] : getSeed(conscience, pull);
            var pct = ((fluencies[skill.id] ?? getSeed(conscience, pull)) / 10) * 100;
            return (
              <div
                key={skill.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid " + S.border,
                  borderRadius: 12,
                  padding: "20px 24px",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 16, fontFamily: S.font, fontWeight: 600, color: S.text, marginBottom: 12 }}>{skill.text}</div>
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
                    background: `linear-gradient(to right, ${S.gold} 0%, ${S.gold} ${pct}%, ${S.card2} ${pct}%, ${S.card2} 100%)`,
                  }}
                />
                <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, marginTop: 6 }}>{fluencyStopLabel(fluencyVal)}</div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={function () {
              try {
                localStorage.setItem(
                  "dz_saved_report_finance",
                  JSON.stringify({
                    sector: sector,
                    role: role,
                    seniority: seniority,
                    firmType: firmType,
                    companySize: companySize,
                    workFocus: workFocus,
                    skills: skills,
                    conscience: conscience,
                    pull: pull,
                    fluencies: fluencies,
                    promoUsed: promoUsed,
                  })
                );
              } catch (e) {}
              setStep(5);
            }}
            style={continueBtnBase}
          >
            See My Results →
          </button>
        </div>
      </div>
    );
  }

  if (step === 5) {
    var fullScreenCenter = {
      background: S.bg,
      minHeight: "100vh",
      fontFamily: S.font,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      boxSizing: "border-box",
    };

    if (gateLoading) {
      return (
        <div style={fullScreenCenter}>
          <style
            dangerouslySetInnerHTML={{
              __html: "@keyframes dzFinanceDots{0%,100%{opacity:0.25}50%{opacity:1}}",
            }}
          />
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ · FINANCE EDITION
            </div>
            <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>Verifying your email…</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
        </div>
      );
    }

    if (gateVerified) {
      return (
        <div style={fullScreenCenter}>
          <style
            dangerouslySetInnerHTML={{
              __html: "@keyframes dzFinanceDots{0%,100%{opacity:0.25}50%{opacity:1}}",
            }}
          />
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
              DEFENSIBLE ZONE™ · FINANCE EDITION
            </div>
            {resultsError ? (
              <div>
                <div style={{ color: S.red, fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>{resultsError}</div>
                <button
                  type="button"
                  onClick={function () {
                    fetchResults();
                  }}
                  style={Object.assign({}, continueBtnBase, { marginTop: 0, width: "auto", minWidth: 200 })}
                >
                  Try again
                </button>
              </div>
            ) : (
              <div style={{ fontFamily: S.serif, fontSize: 24, fontStyle: "italic", color: S.text, lineHeight: 1.45 }}>{gateScoreMsg}</div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, fontFamily: S.mono, fontSize: 22, color: S.dim, lineHeight: 1 }}>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out infinite" }}>.</span>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.2s infinite" }}>.</span>
              <span style={{ animation: "dzFinanceDots 1s ease-in-out 0.4s infinite" }}>.</span>
            </div>
          </div>
        </div>
      );
    }

    var formShell = {
      background: S.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      boxSizing: "border-box",
      fontFamily: S.font,
    };

    var card = { maxWidth: 480, width: "100%", margin: "0 auto", textAlign: "center" };

    if (gateSent) {
      return (
        <div style={formShell}>
          <div style={card}>
            <div
              style={{
                fontFamily: S.mono,
                fontSize: 12,
                color: S.gold,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              CHECK YOUR INBOX
            </div>

            <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>
              We sent you a link.
            </div>

            <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 20 }}>
              Click the button in the email from noreply@defensiblezone.ai to open your results. Check your spam folder if you do not see it within a minute.
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 20,
                background: S.card2,
                border: "1px solid " + S.border,
                fontFamily: S.mono,
                fontSize: 13,
                color: S.muted,
                marginBottom: 28,
              }}
            >
              {gateEmail}
            </div>

            {showResend ? (
              <button
                type="button"
                onClick={function () {
                  setShowResend(false);
                  handleGateSubmit();
                }}
                style={{
                  background: "transparent",
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontFamily: S.mono,
                  fontSize: 12,
                  color: S.muted,
                  cursor: "pointer",
                }}
              >
                Resend the link
              </button>
            ) : null}

            <div
              role="button"
              tabIndex={0}
              onClick={function () {
                setGateEmail("");
                setGateSent(false);
                setGateError(null);
                setGateVerified(false);
                setGateLoading(false);
                setShowResend(false);
                setStep(0);
              }}
              onKeyDown={function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                setGateEmail("");
                setGateSent(false);
                setGateError(null);
                setGateVerified(false);
                setGateLoading(false);
                setShowResend(false);
                setStep(0);
              }}
              style={{ fontFamily: S.mono, fontSize: 12, color: S.dim, cursor: "pointer", marginTop: 24 }}
            >
              Start over
            </div>
          </div>
        </div>
      );
    }

    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    return (
      <div style={formShell}>
        <div style={card}>
          <div style={{ fontFamily: S.mono, fontSize: 12, color: S.gold, letterSpacing: "0.12em", marginBottom: 24, fontWeight: 600 }}>
            DEFENSIBLE ZONE™ · FINANCE EDITION
          </div>

          <div style={{ fontFamily: S.serif, fontSize: 34, fontStyle: "italic", color: S.text, marginBottom: 10, lineHeight: 1.15 }}>
            Your report is ready.
          </div>

          <div style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, marginBottom: 28 }}>
            Enter your email and we will send you a secure link to access your results. Takes about 30 seconds.
          </div>

          {gateError === "expired" ? (
            <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>This link has expired. Enter your email to get a new one.</div>
          ) : null}
          {gateError === "invalid" ? (
            <div style={{ color: S.red, fontSize: 14, marginBottom: 12 }}>Something went wrong. Please enter your email to continue.</div>
          ) : null}

          <input
            type="email"
            placeholder="your@email.com"
            value={gateEmail}
            disabled={gateLoading}
            onFocus={function () {
              setGateInputFocused(true);
            }}
            onBlur={function () {
              setGateInputFocused(false);
            }}
            onChange={function (e) {
              setGateEmail(e.target.value);
              if (showExpiredInvalid) setGateError(null);
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 16,
              fontFamily: S.font,
              border: gateLoading ? "1px solid " + S.border : gateInputFocused ? "1px solid " + S.gold : "1px solid " + S.border,
              borderRadius: 10,
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
              color: S.text,
            }}
          />

          {gateError && !showExpiredInvalid ? <div style={{ color: S.red, fontSize: 13, marginTop: 8 }}>{gateError}</div> : null}

          <button
            type="button"
            onClick={handleGateSubmit}
            disabled={gateLoading}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: S.font,
              background: gateLoading ? "#e5a820" : S.gold,
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              cursor: gateLoading ? "not-allowed" : "pointer",
              marginTop: 12,
            }}
          >
            Send me my results
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    var canContinue1 = firmType !== "";
    return (
      <div style={containerOuter}>
        <div style={containerInner}>
          <button type="button" onClick={() => setStep(0)} style={backBtnStyle}>
            ← back
          </button>
          <ProgressDots current={1} />

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
            Where do you work?
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 32px" }}>
            Your firm type affects how AI is being deployed around you and what your market looks like.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {firmTypeOptions
              .filter(function (opt) {
                return (VALID_FIRMS_BY_SECTOR[sector] || []).indexOf(opt.id) !== -1;
              })
              .map(function (opt) {
              var selected = firmType === opt.id;
              var bg = selected ? S.gold + "12" : "#ffffff";
              var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
              return (
                <div
                  key={opt.id}
                  role="button"
                  tabIndex={0}
                  onClick={function () {
                    setFirmType(opt.id);
                  }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" || e.key === " ") setFirmType(opt.id);
                  }}
                  style={Object.assign({}, tileBase, { background: bg, border: border })}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6, lineHeight: 1.25 }}>{opt.label}</div>
                  <div style={{ fontSize: 14, color: S.dim, lineHeight: 1.55 }}>{opt.desc}</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canContinue1}
            onClick={function () {
              if (!canContinue1) return;
              setStep(2);
            }}
            style={Object.assign({}, continueBtnBase, !canContinue1 ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            CONTINUE →
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    var sizes = getValidSizes(sector, firmType);
    var canContinue2 = companySize !== "";
    return (
      <div style={containerOuter}>
        <div style={containerInner}>
          <button type="button" onClick={() => setStep(1)} style={backBtnStyle}>
            ← back
          </button>
          <ProgressDots current={2} />

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
            How big is your organization?
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 32px" }}>
            This is the size of your overall organization, not your team.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {sizes.map(function (label) {
              var selected = companySize === label;
              var bg = selected ? S.gold + "12" : "#ffffff";
              var border = selected ? "1px solid " + S.gold : "1px solid " + S.border;
              return (
                <div
                  key={label}
                  role="button"
                  tabIndex={0}
                  onClick={function () {
                    setCompanySize(label);
                  }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" || e.key === " ") setCompanySize(label);
                  }}
                  style={Object.assign({}, tileBase, {
                    background: bg,
                    border: border,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 64,
                  })}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.25 }}>{label}</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canContinue2}
            onClick={function () {
              if (!canContinue2) return;
              setStep(3);
            }}
            style={Object.assign({}, continueBtnBase, !canContinue2 ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            CONTINUE →
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    var focusOptions = WORK_FOCUS_BY_SECTOR[sector] || [];
    var selectedCount = (workFocus || []).length;
    var canContinue3 = selectedCount > 0;
    var countColor = selectedCount > 0 ? S.gold : S.dim;
    var chipBase = {
      display: "inline-block",
      padding: "10px 18px",
      borderRadius: 20,
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
    return (
      <div style={containerOuter}>
        <div style={containerInner}>
          <button type="button" onClick={() => setStep(2)} style={backBtnStyle}>
            ← back
          </button>
          <ProgressDots current={3} />

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
            What do you actually work on?
          </h1>

          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 8px" }}>
            Pick up to 4 areas. Be honest about where your time actually goes — not what looks good on paper.
          </p>

          <div
            style={{
              fontSize: 14,
              fontFamily: S.mono,
              color: countColor,
              marginBottom: 24,
            }}
          >
            {selectedCount} of 4 selected
          </div>

          <div>
            {focusOptions.map(function (label) {
              var isSelected = (workFocus || []).indexOf(label) !== -1;
              var maxed = selectedCount >= 4;
              var disabled = !isSelected && maxed;
              var style = isSelected
                ? Object.assign({}, chipBase, { background: S.accent, color: "#ffffff", border: "1px solid " + S.accent })
                : Object.assign({}, chipBase, disabled ? { opacity: 0.4, cursor: "not-allowed" } : null);
              return (
                <span
                  key={label}
                  role="button"
                  tabIndex={0}
                  onClick={function () {
                    if (disabled) return;
                    if (isSelected) {
                      setWorkFocus(workFocus.filter((x) => x !== label));
                      return;
                    }
                    setWorkFocus(workFocus.concat([label]));
                  }}
                  onKeyDown={function (e) {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    if (disabled) return;
                    if (isSelected) {
                      setWorkFocus(workFocus.filter((x) => x !== label));
                      return;
                    }
                    setWorkFocus(workFocus.concat([label]));
                  }}
                  style={style}
                >
                  {label}
                </span>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canContinue3}
            onClick={function () {
              if (!canContinue3) return;
              setStep(4);
            }}
            style={Object.assign({}, continueBtnBase, !canContinue3 ? { opacity: 0.5, cursor: "not-allowed" } : null)}
          >
            CONTINUE →
          </button>
        </div>
      </div>
    );
  }

  var levelOptions = SENIORITY_BY_SECTOR_AND_ROLE[sector]?.[role] ?? [];

  return (
    <div style={containerOuter}>
      <div style={containerInner}>
        {gateOnDifferentDevice && step === 0 ? (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #d97706",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 14, fontFamily: S.font, color: S.text, lineHeight: 1.5 }}>
              Your email was confirmed. To see your results, please retake the assessment on this device — it only takes a few minutes.
            </div>
            <button
              type="button"
              onClick={function () {
                setGateOnDifferentDevice(false);
              }}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 16,
                lineHeight: 1,
                cursor: "pointer",
                color: S.text,
                padding: 0,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ) : null}
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
              {(ROLES_BY_SECTOR[sector] || []).map(function (item) {
                var sel = role === item.name;
                return (
                  <span
                    key={item.name}
                    role="button"
                    tabIndex={0}
                    onClick={function () {
                      setRole(item.name);
                      setSeniority("");
                    }}
                    onKeyDown={function (e) {
                      if (e.key === "Enter" || e.key === " ") {
                        setRole(item.name);
                        setSeniority("");
                      }
                    }}
                    style={sel ? pillSelected : pillDefault}
                  >
                    <div style={{ fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: S.dim, fontStyle: "italic", marginTop: 4 }}>{item.desc}</div>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {role !== "" && levelOptions.length > 0 ? (
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
              {levelOptions.map(function (label) {
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

        {seniority !== "" && levelOptions.length > 0 ? (
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

