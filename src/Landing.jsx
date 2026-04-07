import Navbar from "./Navbar.jsx";
import { useEffect } from "react";

var LS = {
  bg: "#F5F2EE",
  bg2: "#EDEAE4",
  text: "#1C1917",
  muted: "#6B6560",
  accent: "#2C5F5F",
  accentHover: "#1E4444",
  lightAccent: "#C8DCDC",
  border: "#DDD9D3",
  card: "#FFFFFF",
  font: "'Inter',system-ui,sans-serif",
  serif: "'DM Serif Display','Playfair Display',Georgia,serif",
  mono: "'DM Mono','Courier New',monospace",
};

var PROFESSIONS = [
  { id:"doctor",   name:"Physician / Doctor",           desc:"AI is matching specialist diagnostic accuracy in radiology, pathology, and imaging.",                                       path:"/doctor",    live:true  },
  { id:"engineer", name:"Software Engineer",             desc:"AI tools like Copilot and Cursor are automating code generation, testing, and documentation.",                              path:"/engineer",  live:true  },
  { id:"admin",    name:"Administrative Assistant",      desc:"AI handles scheduling, email drafting, data entry, and document processing at scale.",                                      path:null,         live:false },
  { id:"sdr",      name:"SDR / Sales Development Rep",  desc:"AI SDR tools are replacing outbound prospecting and lead nurturing at a fraction of the cost.",                             path:null,         live:false },
  { id:"writer",   name:"Copywriter / Content Writer",   desc:"Large language models generate marketing copy, blog posts, and ad creative faster and cheaper.",                            path:null,         live:false },
  { id:"designer", name:"Graphic Designer",              desc:"AI image generation and design tools are automating production-level visual work.",                                         path:null,         live:false },
  { id:"marketing",name:"Marketing Specialist",          desc:"AI automates campaign execution, segmentation, reporting, and content production.",                                         path:null,         live:false },
  { id:"accountant",name:"Accountant / Bookkeeper",      desc:"AI handles routine reconciliation, tax prep, and financial reporting with increasing accuracy.",                            path:null,         live:false },
  { id:"analyst",  name:"Financial Analyst",             desc:"AI drafts models, generates reports, and processes data at speeds no human analyst can match.",                             path:null,         live:false },
  { id:"consultant",name:"Management Consultant",        desc:"AI automates research synthesis, benchmarking, and slide generation — the core of junior consulting work.",                 path:null,         live:false },
  { id:"hr",       name:"HR / Recruiter",                desc:"AI screens resumes, schedules interviews, and drafts job descriptions faster than any human team.",                        path:null,         live:false },
  { id:"pm",       name:"Product Manager",               desc:"AI handles backlog grooming, user research synthesis, and roadmap documentation.",                                          path:null,         live:false },
];

var STATS = [
  { num:"65%",      label:"of professionals have no clear first step on AI" },
  { num:"56.5/100", label:"average self-assessed AI risk clarity" },
  { num:"30%",      label:"are actively repositioning — the rest are waiting" },
];

export default function Landing() {
  useEffect(function() {
    var link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500;600&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);
    document.body.style.background = LS.bg;
    document.body.style.margin = "0";
    return function() { document.body.style.background = ""; };
  }, []);

  function navigate(path) {
    window.location.href = path;
  }

  return (
    <div style={{ background: LS.bg, minHeight: "100vh", fontFamily: LS.font, color: LS.text }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 760, margin: "0 auto" }}>

        <div style={{ fontFamily: LS.mono, fontSize: 12, color: LS.accent, letterSpacing: "0.14em", marginBottom: 28, fontWeight: 600 }}>
          RECURSIO LAB · DEFENSIBLE ZONE™
        </div>

        <h1 style={{ fontFamily: LS.serif, fontSize: "clamp(42px,6vw,72px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 24px", color: LS.text }}>
          Is your career{" "}
          <em style={{ color: LS.accent, fontStyle: "italic" }}>defensible</em>
          <br />against AI?
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.75, color: LS.muted, margin: "0 0 36px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Defensible Zone™ provides rigorous, data-driven assessments of how artificial intelligence will reshape your profession — and what you can do about it.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <button
            onClick={function() { navigate("#professions"); }}
            style={{ background: LS.accent, color: "white", border: "none", borderRadius: 8, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: LS.font, letterSpacing: "0.01em" }}
          >
            Assess Your Career →
          </button>
          <button
            onClick={function() { navigate("#methodology"); }}
            style={{ background: "transparent", color: LS.text, border: "1px solid " + LS.border, borderRadius: 8, padding: "16px 32px", fontSize: 16, fontWeight: 500, cursor: "pointer", fontFamily: LS.font }}
          >
            View Methodology
          </button>
        </div>

        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, letterSpacing: "0.1em", marginBottom: 32, lineHeight: 1.7 }}>
          BUILT BY A 20-YEAR VETERAN OF GOOGLE, META, ORACLE & SALESFORCE<br />
          · GROUNDED IN ORIGINAL RESEARCH ACROSS 450 PROFESSIONALS ·
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {STATS.map(function(s) {
            return (
              <div key={s.num} style={{ background: LS.bg2, borderRadius: 12, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: LS.serif, fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: LS.accent, lineHeight: 1, marginBottom: 10 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: LS.muted, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PROFESSION GRID ──────────────────────────────────── */}
      <div id="professions" style={{ background: LS.bg2, padding: "72px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontFamily: LS.serif, fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, margin: "0 0 16px", color: LS.text }}>
              Find Your Defensible Zone™
            </h2>
            <p style={{ fontSize: 17, color: LS.muted, margin: 0, lineHeight: 1.7, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
              Select your profession below. Each assessment is calibrated to your specific role, seniority, and work context — not a generic career quiz.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
            {PROFESSIONS.map(function(p) {
              var isLive = p.live;
              return (
                <div
                  key={p.id}
                  onClick={isLive ? function() { navigate(p.path); } : undefined}
                  style={{
                    background: LS.card,
                    border: "1px solid " + LS.border,
                    borderRadius: 14,
                    padding: "28px 24px",
                    cursor: isLive ? "pointer" : "default",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 180,
                  }}
                  onMouseEnter={isLive ? function(e) {
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(44,95,95,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  } : undefined}
                  onMouseLeave={isLive ? function(e) {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  } : undefined}
                >
                  <div style={{ fontSize: 17, fontWeight: 700, color: LS.text, marginBottom: 10, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 14, color: LS.muted, lineHeight: 1.6, flex: 1 }}>{p.desc}</div>
                  <div style={{ marginTop: 20 }}>
                    {isLive ? (
                      <span style={{ fontSize: 14, fontWeight: 600, color: LS.accent }}>Take the Assessment →</span>
                    ) : (
                      <span style={{ fontSize: 13, color: "#BFBAB4", fontFamily: LS.mono }}>Coming Soon</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── METHODOLOGY ──────────────────────────────────────── */}
      <div id="methodology" style={{ padding: "72px 24px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.accent, letterSpacing: "0.14em", marginBottom: 16, fontWeight: 600 }}>METHODOLOGY</div>
        <h2 style={{ fontFamily: LS.serif, fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, margin: "0 0 20px", color: LS.text }}>
          How the Assessment Works
        </h2>
        <p style={{ fontSize: 16, color: LS.muted, lineHeight: 1.8, marginBottom: 40 }}>
          Each assessment evaluates your skills across three dimensions: Natural Affinity (how wired you are for the skill), AI Replaceability (how exposed that skill is to automation), and Market Demand (what the market pays for it today). The intersection of these three is your Defensible Zone™.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, textAlign: "left" }}>
          {[
            { label:"Natural Affinity", color:"#7C3AED", desc:"How much the skill feels like you — energizing, not just competent." },
            { label:"AI Replaceability", color:"#DC2626", desc:"How exposed the skill is to automation right now and in the next 2 years." },
            { label:"Market Demand", color:"#2C5F5F", desc:"What employers are paying for and hiring for in your specific role." },
          ].map(function(m) {
            return (
              <div key={m.label} style={{ background: LS.card, border: "1px solid " + LS.border, borderRadius: 12, padding: "22px 20px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: LS.text, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: LS.muted, lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ background: LS.bg2, borderTop: "1px solid " + LS.border, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: LS.serif, fontSize: 17, fontWeight: 700, color: LS.text, marginBottom: 6 }}>Defensible Zone™</div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, marginBottom: 4 }}>
          DEFENSIBLE ZONE™ is a trademark of its creator. All rights reserved.
        </div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, marginBottom: 4 }}>
          This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment.
        </div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted }}>&copy; 2026</div>
      </div>

    </div>
  );
}
