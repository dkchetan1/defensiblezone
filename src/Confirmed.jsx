import { useEffect } from "react";

export default function Confirmed() {
  useEffect(function() {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ECEAE3", display: "flex", flexDirection: "column" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #DDD9D3", height: 60, padding: "0 32px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
          <a href="/" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1C1917", textDecoration: "none" }}>
            Defensible Zone™
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="https://defensiblezone.ai/#professions" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6B6560", textDecoration: "none" }}>For Professionals</a>
            <a href="https://defensiblezone.ai/about" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6B6560", textDecoration: "none" }}>About</a>
            <a href="https://defensiblezone.ai/#professions" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: "#2C5F5F", borderRadius: 8, padding: "9px 20px", textDecoration: "none", whiteSpace: "nowrap" }}>Assess Your Career →</a>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <div style={{ maxWidth: 580, width: "100%", textAlign: "center" }}>
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#2C5F5F", marginBottom: 16 }}>
            SUBSCRIPTION CONFIRMED
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 48, fontWeight: 700, color: "#1C1917", margin: "0 0 24px", lineHeight: 1.1 }}>
            You're on the list.
          </h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 18, color: "#6B6560", lineHeight: 1.75, margin: "0 0 40px" }}>
            We'll reach out when your Defensible Zone&#8482; changes — as AI capabilities evolve, your scores will shift. You'll hear from us when that happens. No spam, ever.
          </p>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, color: "#6B6560", margin: 0, textAlign: "center" }}>
            You're all set. Close this tab to return to your report.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #DDD9D3", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: "#1C1917", marginBottom: 8 }}>Defensible Zone™</p>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6B6560", margin: 0 }}>© 2026 Defensible Zone™. All rights reserved.</p>
      </footer>

    </div>
  );
}
