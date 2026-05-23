import { useState, useEffect } from "react";

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

var SB_STAGES = [
  { id: "solo_pre",     label: "Solo / Pre-revenue or just hitting profitability",          sub: "No employees yet, early days" },
  { id: "solo_profit",  label: "Solo & profitable",                                         sub: "No employees, running lean and making money" },
  { id: "early_team",   label: "Early team — 1 to 9 employees",                             sub: "Owner still does delivery, knows every customer" },
  { id: "growing",      label: "Growing & owner-dependent — 10 to 25 employees",            sub: "Owner is still the rainmaker" },
  { id: "scaled",       label: "Scaled but owner-dependent — 26 to 100 employees",          sub: "Business doesn't run without you" },
  { id: "systematized", label: "Systematized",                                              sub: "Business runs with or without you day-to-day" },
  { id: "exiting",      label: "Exit-ready / in transition",                                sub: "Selling, handing off, or winding down in 24 months" },
  { id: "over100",      label: "More than 100 employees",                                   sub: "" },
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
  var [stage, setStage] = useState("");
  var [archetype, setArchetype] = useState("");
  var [archetypes, setArchetypes] = useState([]);
  var [archetypeLoading, setArchetypeLoading] = useState(false);
  var [archetypeError, setArchetypeError] = useState("");
  var [sliderVP, setSliderVP] = useState(5);
  var [sliderCS, setSliderCS] = useState(5);
  var [sliderKM, setSliderKM] = useState(5);
  var [sliderTH, setSliderTH] = useState(5);
  var [snapshot, setSnapshot] = useState([]);
  var [snapshotLoading, setSnapshotLoading] = useState(false);
  var [snapshotError, setSnapshotError] = useState("");
  var [newSentence, setNewSentence] = useState("");
  var [editDraft, setEditDraft] = useState("");

  var sliderCSS = "input[type=range].sb-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none;background:#d0d7e8} input[type=range].sb-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].sb-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;}";

  async function fetchArchetypes() {
    setArchetypeLoading(true);
    setArchetypeError("");
    setArchetypes([]);
    setArchetype("");
    var industryLabel = (SB_INDUSTRIES.find(function(i) { return i.id === industry; }) || {}).label || industry;
    var stageLabel = (SB_STAGES.find(function(s) { return s.id === stage; }) || {}).label || stage;
    var prompt = "You are an expert in small business strategy and AI disruption.\n\nA US small business owner has told you:\n- Industry: " + industryLabel + "\n- Business stage: " + stageLabel + "\n\nGenerate 4 to 6 business model archetypes that are specific and realistic for this exact combination. Each archetype should be a short label (3-6 words) plus one sentence describing what makes it distinct and what its AI defensibility challenge is.\n\nReturn ONLY valid JSON, no other text:\n{\"archetypes\":[{\"id\":\"slug\",\"label\":\"Short Label\",\"desc\":\"One sentence description.\"}]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error("API error");
      var raw = data.content.map(function(b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      setArchetypes(parsed.archetypes || []);
      setArchetypeLoading(false);
    } catch(e) {
      setArchetypeError("Something went wrong loading archetypes. Please try again.");
      setArchetypeLoading(false);
    }
  }

  async function fetchSnapshot() {
    setSnapshotLoading(true);
    setSnapshotError("");
    setSnapshot([]);
    var industryLabel = (SB_INDUSTRIES.find(function(i) { return i.id === industry; }) || {}).label || industry;
    var stageLabel = (SB_STAGES.find(function(s) { return s.id === stage; }) || {}).label || stage;
    var archetypeLabel = (archetypes.find(function(a) { return a.id === archetype; }) || {}).label || archetype;
    var prompt = "You are an expert in small business strategy and AI disruption.\n\nA US small business owner has provided this profile:\n- Industry: " + industryLabel + "\n- Stage: " + stageLabel + "\n- Business model: " + archetypeLabel + "\n- Value proposition clarity (0-10): " + sliderVP + "\n- Customer switching cost (0-10): " + sliderCS + "\n- Knowledge moat (0-10): " + sliderKM + "\n- Time horizon (0-10): " + sliderTH + "\n\nWrite a 3-4 sentence competitive landscape snapshot for this business. Be specific to their industry and model. Describe the AI threat they face right now, what is still defensible, and what is most at risk. Do not be generic.\n\nReturn ONLY valid JSON:\n{\"sentences\":[\"Sentence one.\",\"Sentence two.\",\"Sentence three.\",\"Sentence four.\"]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error("API error");
      var raw = data.content.map(function(b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      setSnapshot((parsed.sentences || []).map(function(text, i) {
        return { id: "s" + i, text: text, wrong: false, editing: false };
      }));
      setSnapshotLoading(false);
    } catch(e) {
      setSnapshotError("Something went wrong. Please try again.");
      setSnapshotLoading(false);
    }
  }

  function calcSubScores(vp, cs, km) {
    var valueD = Math.round(vp * 10);
    var customerD = Math.round(cs * 10);
    var operationalD = Math.round(km * 10);
    return { valueD: valueD, customerD: customerD, operationalD: operationalD };
  }

  function calcOverallScore(vp, cs, km) {
    var v = 100 * Math.pow(vp / 10, 0.40) * Math.pow(cs / 10, 0.35) * Math.pow(km / 10, 0.25);
    return Math.min(100, Math.round(v));
  }

  function getScoreLabel(score) {
    if (score < 30) return "High Risk — significant repositioning needed.";
    if (score < 50) return "Vulnerable — real gaps to address before AI accelerates.";
    if (score < 70) return "Moderate — some strong anchors, targeted moves needed.";
    if (score < 85) return "Solid — well-positioned with room to extend your lead.";
    return "Exceptional — you are operating in rare territory.";
  }

  function getScoreColor(score) {
    if (score < 40) return S.red;
    if (score < 65) return S.gold;
    return S.green;
  }

  function getDiagnosticFlags(vp, cs, km, th, snapshotData) {
    var flags = [];
    if (vp >= 7) flags.push({ type: "positive", label: "Strong value proposition" });
    if (cs >= 7) flags.push({ type: "positive", label: "Strong customer moat" });
    if (km >= 7) flags.push({ type: "positive", label: "Deep knowledge moat" });
    if (vp < 4) flags.push({ type: "warning", label: "Commoditization exposure — value proposition needs sharpening" });
    if (cs < 4) flags.push({ type: "warning", label: "Customer fragility — low switching costs" });
    if (km >= 7 && th <= 3) flags.push({ type: "warning", label: "Exit Risk — concentrated value, short time horizon" });
    var wrongCount = snapshotData.filter(function(s) { return s.wrong; }).length;
    if (wrongCount > 0) flags.push({ type: "warning", label: "AI substitution active — you flagged threats in your landscape" });
    return flags;
  }

  useEffect(function() {
    if (step === 3) fetchArchetypes();
  }, [step]);

  useEffect(function() {
    if (step === 5) fetchSnapshot();
  }, [step]);

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

  if (step === 2) {
    if (stage === "over100") {
      return (
        <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
          <SBNavbar />
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 2 OF 8 — BUSINESS STAGE
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
              <div style={{ height: "100%", width: "25%", background: S.accent, borderRadius: 2 }} />
            </div>
            <div style={{ background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: "36px 32px", textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: S.mono, fontSize: 13, color: S.gold, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 16 }}>
                DEFENSIBLE ZONE™ · SMALL BUSINESS EDITION
              </div>
              <h2 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: "0 0 16px", lineHeight: 1.3, fontWeight: 600 }}>
                This assessment is designed for businesses with up to 100 employees.
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.7, margin: "0 0 24px" }}>
                For larger organizations, our team engagement product is a better fit. Reach out and we'll point you in the right direction.
              </p>
              <a
                href="mailto:support@recursiolab.com"
                style={{
                  display: "inline-block",
                  background: S.accent,
                  color: "#ffffff",
                  borderRadius: 10,
                  padding: "14px 28px",
                  fontFamily: S.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                }}
              >
                CONTACT US →
              </a>
            </div>
            <button
              onClick={function() { setStage(""); }}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
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
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 2 OF 8 — BUSINESS STAGE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "25%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Where is your business right now?
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Pick the stage that best describes how your business operates today.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {SB_STAGES.map(function(s) {
              var isSelected = stage === s.id;
              var isRedirect = s.id === "over100";
              return (
                <button
                  key={s.id}
                  onClick={function() { setStage(s.id); }}
                  style={{
                    background: isSelected ? S.accent : S.card,
                    border: "1px solid " + (isSelected ? S.accent : S.border),
                    borderRadius: 12,
                    padding: "16px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#ffffff" : (isRedirect ? S.dim : S.text), lineHeight: 1.3 }}>
                    {s.label}
                  </div>
                  {s.sub ? (
                    <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 4, lineHeight: 1.4 }}>
                      {s.sub}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            onClick={function() { setStep(3); }}
            disabled={!stage}
            style={{
              background: !stage ? S.card2 : S.accent,
              color: !stage ? S.dim : "#ffffff",
              border: "1px solid " + (!stage ? S.border : S.accent),
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: !stage ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(1); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 3 OF 8 — YOUR BUSINESS MODEL
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "37.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          {archetypeLoading ? (
            <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
              Generating archetypes for your business…
            </p>
          ) : null}

          {archetypeError ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 16px" }}>
                {archetypeError}
              </p>
              <button
                onClick={fetchArchetypes}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 14,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                TRY AGAIN
              </button>
            </div>
          ) : null}

          {!archetypeLoading && !archetypeError && archetypes.length > 0 ? (
            <>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
                How does your business create value?
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
                Pick the model that fits best. This shapes how we score your defensibility.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {archetypes.map(function(a) {
                  var isSelected = archetype === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={function() { setArchetype(a.id); }}
                      style={{
                        background: isSelected ? S.accent : S.card,
                        border: "1px solid " + (isSelected ? S.accent : S.border),
                        borderRadius: 12,
                        padding: "16px 20px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#ffffff" : S.text, lineHeight: 1.3 }}>
                        {a.label}
                      </div>
                      {a.desc ? (
                        <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 4, lineHeight: 1.4 }}>
                          {a.desc}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={function() { setStep(4); }}
                disabled={!archetype}
                style={{
                  background: !archetype ? S.card2 : S.accent,
                  color: !archetype ? S.dim : "#ffffff",
                  border: "1px solid " + (!archetype ? S.border : S.accent),
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 15,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: !archetype ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                }}
              >
                CONTINUE →
              </button>
            </>
          ) : null}

          <button
            onClick={function() { setStep(2); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 4) {
    var exitRisk = sliderKM >= 7 && sliderTH <= 3;
    var cardStyle = {
      background: S.card,
      border: "1px solid " + S.border,
      borderRadius: 12,
      padding: "20px 22px",
      marginBottom: 16,
    };
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <style>{sliderCSS}</style>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 4 OF 8 — YOUR DEFENSIBILITY INPUTS
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "50%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Rate your business on four dimensions
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Be honest — this is for your eyes only. The more accurate your inputs, the more useful your results.
          </p>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              If a potential customer asked why they should hire you instead of using an AI tool plus a cheap offshore assistant — how sharp and specific is your answer?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderVP}
              onChange={function(e) { setSliderVP(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Struggling to answer</span>
              <span>Sharp and specific</span>
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              If you raised your prices by 20% tomorrow, what fraction of your customers would stay?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderCS}
              onChange={function(e) { setSliderCS(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Most would leave</span>
              <span>Almost none would leave</span>
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              How much of what makes your business work lives in your head and your relationships — versus being documented and transferable to someone else?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderKM}
              onChange={function(e) { setSliderKM(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Fully documented</span>
              <span>Almost all in my head</span>
            </div>
          </div>

          <div style={Object.assign({}, cardStyle, { marginBottom: exitRisk ? 8 : 24 })}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              What is your planning horizon for this business?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderTH}
              onChange={function(e) { setSliderTH(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Exiting within 24 months</span>
              <span>10+ years</span>
            </div>
            <p style={{ fontSize: 13, color: S.dim, lineHeight: 1.5, margin: "14px 0 0", fontStyle: "italic" }}>
              This doesn't affect your score — it shapes which recommendations you receive.
            </p>
          </div>

          {exitRisk ? (
            <div style={{
              background: "#fff7ed",
              border: "1px solid #ea580c",
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 24,
              marginTop: 8,
            }}>
              <p style={{ fontSize: 14, color: "#9a3412", lineHeight: 1.6, margin: 0 }}>
                ⚠ Exit Risk detected — you have concentrated value in yourself but a short time horizon. Any buyer will discount heavily for this. We'll factor this into your recommendations.
              </p>
            </div>
          ) : null}

          <button
            onClick={function() { setStep(5); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "1px solid " + S.accent,
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(3); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 5) {
    function startEdit(item) {
      setEditDraft(item.text);
      setSnapshot(snapshot.map(function(s) {
        return { id: s.id, text: s.text, wrong: s.wrong, editing: s.id === item.id };
      }));
    }

    function saveEdit(id) {
      setSnapshot(snapshot.map(function(s) {
        if (s.id === id) {
          return { id: s.id, text: editDraft.trim() || s.text, wrong: s.wrong, editing: false };
        }
        return { id: s.id, text: s.text, wrong: s.wrong, editing: false };
      }));
    }

    function toggleWrong(id) {
      setSnapshot(snapshot.map(function(s) {
        if (s.id === id) {
          return { id: s.id, text: s.text, wrong: !s.wrong, editing: s.editing };
        }
        return s;
      }));
    }

    function addSentence() {
      if (!newSentence.trim()) return;
      setSnapshot(snapshot.concat([{
        id: "s" + Date.now(),
        text: newSentence.trim(),
        wrong: false,
        editing: false,
      }]));
      setNewSentence("");
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 5 OF 8 — YOUR COMPETITIVE LANDSCAPE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "62.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          {snapshotLoading ? (
            <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
              Analyzing your competitive landscape…
            </p>
          ) : null}

          {snapshotError ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 16px" }}>
                {snapshotError}
              </p>
              <button
                onClick={fetchSnapshot}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 14,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                TRY AGAIN
              </button>
            </div>
          ) : null}

          {!snapshotLoading && !snapshotError && snapshot.length > 0 ? (
            <>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
                Does this sound like your business?
              </h2>

              <div style={{
                background: "#eff6ff",
                border: "1px solid #2563eb",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 28,
                marginTop: 24,
              }}>
                <p style={{ fontSize: 14, color: "#1e40af", lineHeight: 1.6, margin: 0 }}>
                  This snapshot is AI-generated based on your inputs and general industry patterns. It is not based on real-time market research. Edit it to reflect your actual situation — your edits sharpen the scoring in the next step.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {snapshot.map(function(item) {
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: S.card,
                        border: "1px solid " + S.border,
                        borderRadius: 12,
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {item.editing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            value={editDraft}
                            onChange={function(e) { setEditDraft(e.target.value); }}
                            onKeyDown={function(e) {
                              if (e.key === "Enter") saveEdit(item.id);
                            }}
                            onBlur={function() { saveEdit(item.id); }}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: "10px 12px",
                              fontSize: 15,
                              fontFamily: S.font,
                              border: "1px solid " + S.border,
                              borderRadius: 8,
                              outline: "none",
                              boxSizing: "border-box",
                              color: S.text,
                              background: S.card,
                            }}
                          />
                          <button
                            onMouseDown={function(e) { e.preventDefault(); }}
                            onClick={function() { saveEdit(item.id); }}
                            style={{
                              background: S.accent,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 8,
                              padding: "10px 16px",
                              fontSize: 13,
                              fontFamily: S.mono,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.06em",
                              flexShrink: 0,
                            }}
                          >
                            SAVE
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
                          <span
                            onClick={function() { startEdit(item); }}
                            style={{
                              fontSize: 15,
                              color: item.wrong ? S.dim : S.text,
                              lineHeight: 1.55,
                              flex: 1,
                              cursor: "pointer",
                              textDecoration: item.wrong ? "line-through" : "none",
                              opacity: item.wrong ? 0.55 : 1,
                            }}
                          >
                            {item.text}
                          </span>
                          <button
                            onClick={function() { toggleWrong(item.id); }}
                            style={{
                              background: item.wrong ? "#fef2f2" : S.card2,
                              color: item.wrong ? S.red : S.dim,
                              border: "1px solid " + (item.wrong ? S.red : S.border),
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 11,
                              fontFamily: S.mono,
                              fontWeight: 600,
                              cursor: "pointer",
                              letterSpacing: "0.04em",
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.wrong ? "Marked wrong" : "Mark as wrong"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                <input
                  type="text"
                  value={newSentence}
                  onChange={function(e) { setNewSentence(e.target.value); }}
                  onKeyDown={function(e) {
                    if (e.key === "Enter") addSentence();
                  }}
                  placeholder="Add a sentence"
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    fontSize: 15,
                    fontFamily: S.font,
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    outline: "none",
                    boxSizing: "border-box",
                    color: S.text,
                    background: S.card,
                  }}
                />
                <button
                  onClick={addSentence}
                  disabled={!newSentence.trim()}
                  style={{
                    background: !newSentence.trim() ? S.card2 : S.accent,
                    color: !newSentence.trim() ? S.dim : "#ffffff",
                    border: "1px solid " + (!newSentence.trim() ? S.border : S.accent),
                    borderRadius: 10,
                    padding: "12px 20px",
                    fontSize: 13,
                    fontFamily: S.mono,
                    fontWeight: 700,
                    cursor: !newSentence.trim() ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  ADD
                </button>
              </div>
            </>
          ) : null}

          {!snapshotLoading ? (
            <>
              <p style={{ fontSize: 13, color: S.dim, lineHeight: 1.5, margin: "0 0 16px", fontStyle: "italic" }}>
                Your edits will recalibrate the scoring in the next step.
              </p>

              <button
                onClick={function() { setStep(6); }}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "1px solid " + S.accent,
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 15,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                }}
              >
                CONTINUE →
              </button>
            </>
          ) : null}

          <button
            onClick={function() { setStep(4); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 6) {
    var overallScore = calcOverallScore(sliderVP, sliderCS, sliderKM);
    var subScores = calcSubScores(sliderVP, sliderCS, sliderKM);
    var scoreColor = getScoreColor(overallScore);
    var scoreLabel = getScoreLabel(overallScore);
    var flags = getDiagnosticFlags(sliderVP, sliderCS, sliderKM, sliderTH, snapshot);
    var subScoreItems = [
      { label: "Value Defensibility", value: subScores.valueD, description: "How clearly your business answers the question: why hire you instead of an AI tool?" },
      { label: "Customer Defensibility", value: subScores.customerD, description: "How likely your customers are to stay if you raise prices or a competitor appears." },
      { label: "Operational Defensibility", value: subScores.operationalD, description: "How much of your business value lives in documented systems versus your personal knowledge and relationships." },
    ];

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 6 OF 8 — YOUR SCORE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "75%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Your defensibility score
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Based on your inputs and competitive landscape edits.
          </p>

          <div style={{
            background: S.card,
            border: "1px solid " + S.border,
            borderRadius: 16,
            padding: "36px 32px",
            textAlign: "center",
            marginBottom: 32,
          }}>
            <div style={{
              fontFamily: S.serif,
              fontSize: 72,
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1,
              marginBottom: 12,
            }}>
              {overallScore}
            </div>
            <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.6, margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              {scoreLabel}
            </p>
          </div>

          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.7, margin: "16px 0 28px" }}>
            Your Defensible Zone™ score reflects how well your business is positioned to survive and grow in an AI-saturated market. A higher score means your value is harder to replicate, your customers are harder to poach, and your business model has real staying power. A lower score is not a verdict — it is a map of where to focus.
          </p>

          <div style={{ marginBottom: 32 }}>
            {subScoreItems.map(function(item) {
              var barColor = getScoreColor(item.value);
              return (
                <div key={item.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{item.label}</span>
                    <span style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 700, color: barColor }}>{item.value}</span>
                  </div>
                  <div style={{ height: 8, background: S.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: item.value + "%", background: barColor, borderRadius: 4 }} />
                  </div>
                  <p style={{ fontSize: 13, color: S.dim, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {flags.length > 0 ? (
            <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
              WHAT WE FOUND
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {flags.map(function(flag, i) {
                var isPositive = flag.type === "positive";
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      background: isPositive ? "#dcfce7" : "#fef3c7",
                      color: isPositive ? "#166534" : "#92400e",
                      fontSize: 13,
                      lineHeight: 1.4,
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontWeight: 500,
                    }}
                  >
                    {isPositive ? "✓ " : "⚠ "}{flag.label}
                  </span>
                );
              })}
            </div>
            </div>
          ) : null}

          <button
            onClick={function() { setStep(7); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "1px solid " + S.accent,
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(5); }}
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
