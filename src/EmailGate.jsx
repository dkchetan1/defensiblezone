import { useState, useEffect } from "react";

// ── DESIGN TOKENS (same pattern as Engineer.jsx; DM families for this component) ──
var S = {
  font: "'DM Sans',system-ui,sans-serif",
  mono: "'DM Mono',ui-monospace,monospace",
  serif: "'DM Serif Display',Georgia,serif",
};

function EmailGate(props) {
  var onUnlock = props.onUnlock;
  var productName = props.productName;

  var emailState = useState("");
  var email = emailState[0];
  var setEmail = emailState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var focusState = useState(false);
  var inputFocused = focusState[0];
  var setInputFocused = focusState[1];

  useEffect(function() {
    var link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  function validateEmail(trimmed) {
    var at = trimmed.indexOf("@");
    if (at === -1) return false;
    return trimmed.indexOf(".", at + 1) !== -1;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, productName: productName }),
    })
      .then(function() {
        onUnlock();
      })
      .catch(function() {
        onUnlock();
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #d0d7e8",
        borderRadius: 14,
        padding: "32px 28px",
        maxWidth: 480,
        margin: "0 auto",
        textAlign: "center",
        fontFamily: S.font,
      }}
    >
      <div
        style={{
          fontFamily: S.mono,
          fontSize: 11,
          color: "#d97706",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        YOUR REPORT IS READY
      </div>
      <h2
        style={{
          fontFamily: S.serif,
          fontSize: 28,
          color: "#0d1117",
          margin: "0 0 10px",
          fontWeight: 400,
          lineHeight: 1.2,
        }}
      >
        Enter your email to unlock it.
      </h2>
      <p
        style={{
          fontFamily: S.font,
          fontSize: 15,
          color: "#6b7280",
          lineHeight: 1.6,
          margin: "0 0 24px",
        }}
      >
        We&apos;ll let you know when your Defensible Zone changes as AI capabilities evolve. No spam.
      </p>
      <form onSubmit={handleSubmit} style={{ margin: 0, textAlign: "left" }}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={function(ev) {
            setEmail(ev.target.value);
          }}
          onFocus={function() {
            setInputFocused(true);
          }}
          onBlur={function() {
            setInputFocused(false);
          }}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 16,
            fontFamily: S.font,
            border: inputFocused ? "1px solid #d97706" : "1px solid #d0d7e8",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {error ? (
          <div
            style={{
              fontFamily: S.font,
              fontSize: 13,
              color: "#dc2626",
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: S.font,
            background: loading ? "#e5a820" : "#d97706",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: loading ? "default" : "pointer",
            marginTop: 12,
          }}
        >
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </form>
      <p
        style={{
          fontFamily: S.font,
          fontSize: 12,
          color: "#9ca3af",
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        No spam. Unsubscribe any time.
      </p>
    </div>
  );
}

export default EmailGate;
