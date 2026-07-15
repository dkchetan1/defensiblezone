import { useEffect, useState } from "react";

export default function EmployerPortal() {
  var [view, setView] = useState("loading"); // loading | form | sent | logged_in
  var [email, setEmail] = useState("");
  var [companyName, setCompanyName] = useState("");
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);
  var [quota, setQuota] = useState(null);
  var [codesGenerated, setCodesGenerated] = useState(null);
  var [generateCount, setGenerateCount] = useState(10);
  var [generateError, setGenerateError] = useState("");
  var [generating, setGenerating] = useState(false);
  var [lastBatchId, setLastBatchId] = useState("");
  var [lastCodes, setLastCodes] = useState([]);
  var [batches, setBatches] = useState(null);

  function loadBatches() {
    fetch("/api/batch-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({}),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && Array.isArray(result.data.batches)) {
          setBatches(result.data.batches);
        } else {
          setBatches([]);
        }
      })
      .catch(function () {
        setBatches([]);
      });
  }

  function enterLoggedIn(name) {
    setCompanyName(name);
    setView("logged_in");
    fetch("/api/generate-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({}),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data) {
          if (typeof result.data.quota === "number") setQuota(result.data.quota);
          if (typeof result.data.codesGenerated === "number") {
            setCodesGenerated(result.data.codesGenerated);
          }
        }
      })
      .catch(function () {});
    loadBatches();
  }

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
            enterLoggedIn(data.companyName);
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
          enterLoggedIn(data.companyName);
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

  function handleGenerate(e) {
    e.preventDefault();
    var n = Number(generateCount);
    if (!Number.isInteger(n) || n < 1) {
      setGenerateError("Enter a positive whole number of codes to generate.");
      return;
    }
    setGenerateError("");
    setGenerating(true);
    fetch("/api/generate-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ count: n }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        var data = result.data || {};
        if (result.status === 200 && Array.isArray(data.codes)) {
          setLastBatchId(data.batchId || "");
          setLastCodes(data.codes);
          if (typeof data.quota === "number") setQuota(data.quota);
          if (typeof data.codesGenerated === "number") {
            setCodesGenerated(data.codesGenerated);
          }
          loadBatches();
          return;
        }
        if (data.error === "quota_exceeded") {
          var remaining =
            typeof data.remaining === "number" ? data.remaining : 0;
          setGenerateError(
            "Quota exceeded. You have " + remaining + " code" + (remaining === 1 ? "" : "s") + " remaining."
          );
          return;
        }
        if (result.status === 401) {
          setGenerateError("Session expired. Please sign in again.");
          return;
        }
        setGenerateError("Could not generate codes. Please try again.");
      })
      .catch(function () {
        setGenerateError("Could not generate codes. Please try again.");
      })
      .finally(function () {
        setGenerating(false);
      });
  }

  function downloadCsv() {
    if (!lastCodes.length) return;
    var rows = [["batchId", "code"]];
    for (var i = 0; i < lastCodes.length; i++) {
      rows.push([lastBatchId, lastCodes[i]]);
    }
    var csv = rows
      .map(function (row) {
        return row
          .map(function (cell) {
            var s = String(cell == null ? "" : cell);
            if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1) {
              return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
          })
          .join(",");
      })
      .join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "access-codes-" + (lastBatchId || "batch") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div>
            <p style={{ margin: "16px 0 0", fontSize: 16 }}>
              Logged in as {companyName}
            </p>

            <div style={{ marginTop: 24 }}>
              <p style={{ margin: "0 0 16px", fontSize: 15, color: "#333" }}>
                {codesGenerated != null && quota != null
                  ? codesGenerated + " / " + quota + " codes used"
                  : "Loading usage…"}
              </p>

              <form onSubmit={handleGenerate}>
                <label
                  htmlFor="code-count"
                  style={{ display: "block", fontSize: 14, marginBottom: 8 }}
                >
                  How many codes to generate
                </label>
                <input
                  id="code-count"
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  value={generateCount}
                  onChange={function (ev) {
                    setGenerateCount(ev.target.value);
                  }}
                  disabled={generating}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 16,
                    boxSizing: "border-box",
                    marginBottom: 12,
                  }}
                />
                {generateError ? (
                  <p style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 12px" }}>
                    {generateError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={generating}
                  style={{
                    padding: "10px 16px",
                    fontSize: 15,
                    cursor: generating ? "default" : "pointer",
                  }}
                >
                  {generating ? "Generating…" : "Generate codes"}
                </button>
              </form>

              {lastCodes.length > 0 ? (
                <div style={{ marginTop: 24 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
                    Batch {lastBatchId} — {lastCodes.length} code
                    {lastCodes.length === 1 ? "" : "s"}
                  </p>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    style={{
                      padding: "8px 14px",
                      fontSize: 14,
                      cursor: "pointer",
                      marginBottom: 12,
                    }}
                  >
                    Download CSV
                  </button>
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 18px",
                      fontFamily: "ui-monospace, Menlo, monospace",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {lastCodes.map(function (code) {
                      return <li key={code}>{code}</li>;
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>
                Your batches
              </h2>
              {batches == null ? (
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                  Loading batches…
                </p>
              ) : batches.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                  No batches generated yet
                </p>
              ) : (
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {batches.map(function (batch) {
                    var shortId =
                      batch.batchId && batch.batchId.length > 8
                        ? batch.batchId.slice(0, 8)
                        : batch.batchId || "";
                    var createdLabel = batch.createdAt
                      ? new Date(batch.createdAt).toLocaleDateString()
                      : "—";
                    return (
                      <li
                        key={batch.batchId}
                        style={{
                          marginBottom: 12,
                          paddingBottom: 12,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "ui-monospace, Menlo, monospace",
                            marginBottom: 4,
                          }}
                        >
                          {shortId}
                        </div>
                        <div style={{ color: "#333" }}>
                          {createdLabel} — {batch.redeemed} redeemed /{" "}
                          {batch.unused} unused / {batch.codeCount} total
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
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
