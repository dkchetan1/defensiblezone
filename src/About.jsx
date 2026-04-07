import { useEffect } from "react";
import Navbar from "./Navbar.jsx";

var LS = {
  bg:     "#F5F2EE",
  bg2:    "#EDEAE4",
  text:   "#1C1917",
  muted:  "#6B6560",
  accent: "#2C5F5F",
  border: "#DDD9D3",
  card:   "#FFFFFF",
  light:  "#C8DCDC",
  font:   "'Inter',system-ui,sans-serif",
  serif:  "'DM Serif Display','Playfair Display',Georgia,serif",
  mono:   "'DM Mono','Courier New',monospace",
};

var STATS = [
  { num: "20+",  label: "Years in Tech" },
  { num: "3",    label: "Graduate Degrees" },
  { num: "5",    label: "Major Tech Companies" },
  { num: "450+", label: "Professionals Surveyed" },
];

var SECTIONS = [
  {
    eyebrow: "THE ORIGIN",
    heading: "Where Defensible Zone Came From",
    paras: [
      "After twenty years inside the machine — building products at Oracle, Salesforce, Intuit, Google, and Meta — I watched AI go from a background assumption to a front-page disruption. I worked on AI Infrastructure. I shipped features powered by generative AI. I sat in rooms where the decisions were made.",
      "What I did not see was anyone helping the people on the outside of those rooms. Professionals who had spent a decade building real skills, suddenly uncertain whether those skills still mattered. Managers who were supposed to lead their teams through this, just as lost as everyone else.",
      "I built Defensible Zone because the people navigating this deserved more than think-pieces and anxiety. They deserved a framework — rigorous, honest, and built on real data.",
    ],
  },
  {
    eyebrow: "THE METHODOLOGY",
    heading: "How the Research Was Built",
    paras: [
      "Defensible Zone is not a thought experiment. I spent months developing the underlying model — drawing on labor economics research, AI capability assessments, and original survey data from 450 working professionals across industries and career stages.",
      "The core insight is a three-way intersection: Natural Affinity (how wired you are for a skill), AI Replaceability (how exposed that skill is to automation today and in the next two years), and Market Demand (what employers are actually paying for). The place where all three meet is your Defensible Zone — the part of your professional identity that AI has the hardest time reaching.",
      "I tested the model against real professionals, iterated on the scoring algorithms, and grounded the AI replaceability scores in published research, FDA databases, and role-specific literature. Every score has a source.",
    ],
  },
  {
    eyebrow: "THE WORK",
    heading: "What I Have Seen in the Research",
    paras: [
      "Thirty percent of professionals are actively repositioning their careers in response to AI. The remaining seventy percent know they should be doing something but do not know where to start. The average self-assessed AI clarity score across all professionals surveyed was 56.5 out of 100.",
      "Managers scored statistically identically to their own direct reports on AI clarity. The people who are supposed to be leading from a position of understanding are just as uncertain as the people they manage.",
      "The professionals who are navigating this well share one thing: they have a clear picture of where they are genuinely hard to replace. They are not trying to outrun AI. They are standing in a place AI cannot easily reach.",
    ],
  },
  {
    eyebrow: "THE MISSION",
    heading: "Why Now",
    paras: [
      "After twenty years building products at scale, I came back to this work because I could not stay away. The urgency is too real. The need is too clear.",
      "This is not a business dressed up as a mission. This is my response to what I have watched happen — in Silicon Valley boardrooms, in AI research labs, and in the faces of working professionals who are more informed than any generation in history and more uncertain about their careers than they have ever been.",
      "Defensible Zone is my offering to the professionals who need it most. I hope it finds them.",
    ],
    attribution: true,
  },
];

export default function About() {
  useEffect(function() {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.background = LS.bg;
    document.body.style.margin = "0";
    return function() { document.body.style.background = ""; };
  }, []);

  return (
    <div style={{ background: LS.bg, minHeight: "100vh", fontFamily: LS.font, color: LS.text }}>

      <Navbar />

      {/* PAGE HEADER */}
      <div style={{ textAlign: "center", padding: "72px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.accent, letterSpacing: "0.14em", marginBottom: 18, fontWeight: 600 }}>ABOUT</div>
        <h1 style={{ fontFamily: LS.serif, fontSize: "clamp(38px,5vw,62px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 20px", color: LS.text }}>About the Founder</h1>
        <p style={{ fontFamily: LS.serif, fontStyle: "italic", fontSize: 18, color: LS.muted, margin: 0 }}>The mind behind Defensible Zone™</p>
      </div>

      {/* FOUNDER BIO */}
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 56, alignItems: "start" }}>

          {/* Left column */}
          <div>
            <img src="/Dilip.jpg" alt="Dilip Chetan" style={{ width: "100%", borderRadius: 16, display: "block" }} />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: LS.serif, fontSize: 22, fontWeight: 700, color: LS.text, marginBottom: 4 }}>Dilip Chetan</div>
              <div style={{ fontSize: 14, color: LS.muted, marginBottom: 16 }}>Founder, Defensible Zone™</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Google", "Meta", "Oracle", "Salesforce", "Intuit"].map(function(c) {
                  return (
                    <span key={c} style={{ background: LS.light, color: LS.accent, fontFamily: LS.mono, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, letterSpacing: "0.06em" }}>{c}</span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column — short punchy intro, no overlap with sections below */}
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: LS.text, margin: "0 0 20px" }}>
              I am a researcher, product builder, and educator. For twenty years I worked inside the companies shaping how AI is built and deployed — Oracle, Salesforce, Intuit, Google, and Meta. I have a front-row seat to what is happening, and I have seen what it is doing to the people on the outside.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: LS.text, margin: "0 0 20px" }}>
              Defensible Zone is the framework I built because no rigorous one existed. A clear, data-driven answer to the question every professional is quietly asking: exactly where do I stand, and what do I do about it?
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: LS.muted, margin: 0, fontStyle: "italic" }}>
              I hold three graduate degrees — an MBA, a Master's in Computer Science, and a Master's in Psychology.
            </p>
          </div>

        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ background: LS.accent, padding: "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
          {STATS.map(function(s) {
            return (
              <div key={s.num}>
                <div style={{ fontFamily: LS.serif, fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontFamily: LS.mono, fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      {SECTIONS.map(function(sec, i) {
        return (
          <div key={sec.eyebrow} style={{ background: i % 2 === 0 ? LS.bg : LS.bg2, padding: "80px 24px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.accent, letterSpacing: "0.14em", marginBottom: 16, fontWeight: 600 }}>{sec.eyebrow}</div>
              <h2 style={{ fontFamily: LS.serif, fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, margin: "0 0 32px", color: LS.text, lineHeight: 1.2 }}>{sec.heading}</h2>
              {sec.paras.map(function(para, j) {
                var isLast = j === sec.paras.length - 1;
                var isMission = sec.attribution && isLast;
                return (
                  <p key={j} style={{ fontSize: 17, lineHeight: 1.85, color: isMission ? LS.muted : LS.text, margin: "0 0 20px", fontStyle: isMission ? "italic" : "normal" }}>{para}</p>
                );
              })}
              {sec.attribution && (
                <div style={{ fontFamily: LS.mono, fontSize: 13, color: LS.accent, fontWeight: 600 }}>— Dilip Chetan, Founder, Defensible Zone™</div>
              )}
            </div>
          </div>
        );
      })}

      {/* CTA */}
      <div style={{ background: LS.bg2, borderTop: "1px solid " + LS.border, padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.accent, letterSpacing: "0.14em", marginBottom: 18, fontWeight: 600 }}>START HERE</div>
          <h2 style={{ fontFamily: LS.serif, fontSize: "clamp(28px,3.5vw,38px)", fontWeight: 700, margin: "0 0 20px", color: LS.text, lineHeight: 1.2 }}>
            Find your <em style={{ fontStyle: "italic", color: LS.accent }}>Defensible Zone.</em>
          </h2>
          <p style={{ fontSize: 16, color: LS.muted, lineHeight: 1.75, marginBottom: 36 }}>
            The free self-assessment takes 8 minutes and gives you a clear, personalized picture of where your skills stand against AI — and what to do about it.
          </p>
          <button
            onClick={function() { window.location.href = "/#professions"; }}
            style={{ background: LS.accent, color: "white", border: "none", borderRadius: 8, padding: "16px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: LS.font }}
          >
            Assess Your Career →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: LS.bg2, borderTop: "1px solid " + LS.border, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: LS.serif, fontSize: 17, fontWeight: 700, color: LS.text, marginBottom: 6 }}>Defensible Zone™</div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, marginBottom: 4 }}>DEFENSIBLE ZONE™ is a trademark of its creator. All rights reserved.</div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted, marginBottom: 4 }}>This tool is for professional reflection and educational purposes only. It does not constitute career advice or any professional assessment.</div>
        <div style={{ fontFamily: LS.mono, fontSize: 11, color: LS.muted }}>© 2026</div>
      </div>

    </div>
  );
}
