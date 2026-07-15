import { useEffect, useState } from "react";

export default function EmployerPortal() {
  var [view, setView] = useState("loading"); // loading | form | sent | logged_in
  var [email, setEmail] = useState("");
  var [companyName, setCompanyName] = useState("");
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("token");

    if (token) {
      window.history.replaceState({}, "", window.location.pathname);
      fetch("/api/verify-employer-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token: token }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.valid === true && data.companyName) {
            setCompanyName(data.companyName);
            setView("logged_in");
          } else {
            setError(
              data && data.reason === "expired"
                ? "That login link has expired. Request a new one."
                : "That login link is invalid. Request a new one."
            );
            setView("form");
          }
        })
        .catch(function () {
          setError("Something went wrong. Please try again.");
          setView("form");
        });
      return;
    }

    // No query token — check existing httpOnly session cookie via API
    fetch("/api/verify-employer-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({}),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.valid === true && data.companyName) {
          setCompanyName(data.companyName);
          setView("logged_in");
        } else {
          setView("form");
        }
      })
      .catch(function () {
        setView("form");
      });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    var trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || trimmed.indexOf("@") === -1) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    fetch("/api/employer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    })
      .then(async function (res) {
        var data = {};
        try {
          data = await res.json();
        } catch (_e) {}
        if (res.ok && data && data.sent === true) {
          setView("sent");
          return;
        }
        if (res.status === 404) {
          setError("No employer account found for that email.");
          return;
        }
        setError("Something went wrong. Please try again.");
      })
      .catch(function () {
        setError("Something went wrong. Please try again.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        fontFamily: "system-ui, sans-serif",
        color: "#111",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>
          Employer portal
        </h1>

        {view === "loading" ? (
          <p style={{ color: "#666", margin: 0 }}>Checking session…</p>
        ) : null}

        {view === "logged_in" ? (
          <p style={{ margin: "16px 0 0", fontSize: 16 }}>
            Logged in as {companyName}
          </p>
        ) : null}

        {view === "sent" ? (
          <p style={{ margin: "16px 0 0", fontSize: 16 }}>
            Check your email for a login link.
          </p>
        ) : null}

        {view === "form" ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <label
              htmlFor="employer-email"
              style={{ display: "block", fontSize: 14, marginBottom: 8 }}
            >
              Work email
            </label>
            <input
              id="employer-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={function (ev) {
                setEmail(ev.target.value);
              }}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 16,
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            {error ? (
              <p style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 12px" }}>
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 16px",
                fontSize: 15,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Sending…" : "Send me a login link"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
