import { useEffect, useState } from "react";

var LS = {
  bg:     "#FFFFFF",
  text:   "#1C1917",
  muted:  "#6B6560",
  accent: "#2C5F5F",
  border: "#DDD9D3",
  font:   "'Inter',system-ui,sans-serif",
  serif:  "'DM Serif Display','Playfair Display',Georgia,serif",
  mono:   "'DM Mono','Courier New',monospace",
};

export default function Navbar() {
  var [path, setPath] = useState(window.location.pathname);
  var [menuOpen, setMenuOpen] = useState(false);

  useEffect(function() {
    setPath(window.location.pathname);
  }, []);

  function navigate(href) {
    window.location.href = href;
  }

  return (
    <div style={{ background: LS.bg, borderBottom: "1px solid " + LS.border, padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

        <button
          onClick={function() { navigate("/"); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: LS.serif, fontSize: 18, fontWeight: 700, color: LS.text, padding: 0 }}
        >
          Defensible Zone™
        </button>

        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <button
            onClick={function() { navigate("/#professions"); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: LS.font, fontSize: 14, color: path === "/" ? LS.accent : LS.muted, fontWeight: path === "/" ? 600 : 400, padding: 0 }}
          >
            For Professionals
          </button>
          <button
            onClick={function() { navigate("/about"); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: LS.font, fontSize: 14, color: path === "/about" ? LS.accent : LS.muted, fontWeight: path === "/about" ? 600 : 400, padding: 0 }}
          >
            About
          </button>
          <button
            onClick={function() { navigate("/#professions"); }}
            style={{ background: LS.accent, color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: LS.font }}
          >
            Assess Your Career →
          </button>
        </nav>

      </div>
    </div>
  );
}
