var S = {
  bg:"#f8f9fc", card:"#ffffff", card2:"#f2f4f8",
  border:"#d0d7e8", text:"#0d1117", muted:"#1e2a42", dim:"#4a5568",
  accent:"#1a1d2e", purple:"#7c3aed", gold:"#d97706",
  font:"system-ui,-apple-system,sans-serif",
  mono:"'Courier New',monospace",
};

function DZNavBar() {
  return (
    <div style={{ width: "100%", boxSizing: "border-box", background: S.card2, borderBottom: "1px solid " + S.border, padding: "14px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <a
          href="https://defensiblezone.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 13, fontWeight: "bold", color: S.accent, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          defensiblezone.ai →
        </a>
        <a
          href="mailto:support@recursiolab.com"
          style={{ fontFamily: S.mono, fontSize: 13, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Questions &amp; Feedback →
        </a>
      </div>
    </div>
  );
}

function DZFooter() {
  return (
    <div style={{ width: "100%", boxSizing: "border-box", background: S.card2, borderTop: "1px solid " + S.border, padding: "20px 24px", marginTop: 32 }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <a
          href="https://defensiblezone.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.accent, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          defensiblezone.ai →
        </a>
        <a
          href="mailto:support@recursiolab.com"
          style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.purple, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Questions &amp; Feedback →
        </a>
        <a
          href="https://defensiblezone.ai/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 14, fontWeight: "bold", color: S.dim, textDecoration: "none" }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
        >
          Privacy Policy →
        </a>
      </div>
    </div>
  );
}

export { DZNavBar, DZFooter };
