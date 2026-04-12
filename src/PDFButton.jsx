import { useEffect } from "react";

function escapeCssId(id) {
  if (typeof id !== "string" || !id.length) return "invalid";
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, "\\\\").replace(/^(\d)/, "\\3$1 ");
}

export default function PDFButton({ contentId, label = "Save as PDF" }) {

  useEffect(
    function () {
      var sel = escapeCssId(contentId);
      var styleEl = document.createElement("style");
      styleEl.setAttribute("data-dz-pdf-button", "1");
      styleEl.textContent =
        "@media print {\n" +
        "  @page { margin: 1in; }\n" +
        "  html, body { background: #fff !important; }\n" +
        "  body * { display: none !important; }\n" +
        "  #" +
        sel +
        " { display: block !important; }\n" +
        "  #" +
        sel +
        " * { display: revert !important; }\n" +
        "  #" +
        sel +
        ", #" +
        sel +
        " * { font-family: Arial, sans-serif !important; font-size: 12pt !important; box-shadow: none !important; border-radius: 0 !important; }\n" +
        "  #" +
        sel +
        " div { page-break-inside: avoid; }\n" +
        "  .no-print, #" +
        sel +
        " .no-print { display: none !important; }\n" +
        "}\n";

      document.head.appendChild(styleEl);
      return function () {
        if (styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      };
    },
    [contentId]
  );

  return (
    <button
      type="button"
      onClick={function () {
        window.print();
      }}
      style={{
        background: "#1a1d2e",
        color: "#ffffff",
        border: "none",
        borderRadius: 10,
        padding: "12px 28px",
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <span aria-hidden="true">⎙ </span>
      {label}
    </button>
  );
}
