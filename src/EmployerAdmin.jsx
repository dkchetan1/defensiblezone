import { useEffect, useState } from "react";

export default function EmployerAdmin() {
  var [view, setView] = useState("loading");
  var [email, setEmail] = useState("");
  var [loginError, setLoginError] = useState("");
  var [loginLoading, setLoginLoading] = useState(false);
  var [employers, setEmployers] = useState([]);
  var [listLoading, setListLoading] = useState(false);
  var [message, setMessage] = useState("");
  var [actionError, setActionError] = useState("");
  var [createEmail, setCreateEmail] = useState("");
  var [companyName, setCompanyName] = useState("");
  var [createQuota, setCreateQuota] = useState("0");
  var [creating, setCreating] = useState(false);
  var [quotaDrafts, setQuotaDrafts] = useState({});
  var [savingEmail, setSavingEmail] = useState("");

  function adminRequest(body) {
    return fetch("/api/employer-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    }).then(async function (res) {
      var data = {};
      try {
        data = await res.json();
      } catch (_e) {}
      return { ok: res.ok, status: res.status, data: data };
    });
  }

  function loadEmployers() {
    setListLoading(true);
    return adminRequest({ action: "list" })
      .then(function (result) {
        if (result.status === 403) {
          setView("forbidden");
          return;
        }
        if (result.status === 401) {
          setView("form");
          setLoginError("Your session has expired. Request a new login link.");
          return;
        }
        if (!result.ok || !Array.isArray(result.data.employers)) {
          setActionError("Could not load employers. Please try again.");
          return;
        }

        var drafts = {};
        result.data.employers.forEach(function (employer) {
          drafts[employer.email] = String(employer.quota);
        });
        setEmployers(result.data.employers);
        setQuotaDrafts(drafts);
        setView("admin");
      })
      .catch(function () {
        setActionError("Could not load employers. Please try again.");
      })
      .finally(function () {
        setListLoading(false);
      });
  }

  function enterAdmin() {
    setActionError("");
    loadEmployers();
  }

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("token");
    if (token) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetch("/api/verify-employer-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(token ? { token: token } : {}),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.valid === true) {
          enterAdmin();
          return;
        }
        if (token) {
          setLoginError(
            data && data.reason === "expired"
              ? "That login link has expired. Request a new one."
              : "That login link is invalid. Request a new one."
          );
        }
        setView("form");
      })
      .catch(function () {
        setLoginError("Something went wrong. Please try again.");
        setView("form");
      });
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    var trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || trimmed.indexOf("@") === -1) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    setLoginError("");
    setLoginLoading(true);
    fetch("/api/employer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, destination: "admin" }),
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
          setLoginError("No employer account found for that email.");
          return;
        }
        setLoginError("Something went wrong. Please try again.");
      })
      .catch(function () {
        setLoginError("Something went wrong. Please try again.");
      })
      .finally(function () {
        setLoginLoading(false);
      });
  }

  function handleCreate(e) {
    e.preventDefault();
    var trimmedEmail = createEmail.trim().toLowerCase();
    var trimmedCompany = companyName.trim();
    var quota = Number(createQuota);
    if (
      !trimmedEmail ||
      trimmedEmail.indexOf("@") === -1 ||
      !trimmedCompany ||
      createQuota.trim() === "" ||
      !Number.isInteger(quota) ||
      quota < 0
    ) {
      setActionError(
        "Enter a valid email, company name, and non-negative whole-number quota."
      );
      setMessage("");
      return;
    }

    setCreating(true);
    setActionError("");
    setMessage("");
    adminRequest({
      action: "create",
      email: trimmedEmail,
      companyName: trimmedCompany,
      quota: quota,
    })
      .then(function (result) {
        if (result.status === 403) {
          setView("forbidden");
          return;
        }
        if (result.data.error === "already_exists") {
          setActionError("An employer with that email already exists.");
          return;
        }
        if (!result.ok) {
          setActionError("Could not create employer. Check the form and try again.");
          return;
        }
        setCreateEmail("");
        setCompanyName("");
        setCreateQuota("0");
        setMessage("Employer created.");
        return loadEmployers();
      })
      .catch(function () {
        setActionError("Could not create employer. Please try again.");
      })
      .finally(function () {
        setCreating(false);
      });
  }

  function handleQuotaSave(employer) {
    var draft = quotaDrafts[employer.email];
    var quota = Number(draft);
    if (
      typeof draft !== "string" ||
      draft.trim() === "" ||
      !Number.isInteger(quota) ||
      quota < 0
    ) {
      setActionError("Quota must be a non-negative whole number.");
      setMessage("");
      return;
    }

    setSavingEmail(employer.email);
    setActionError("");
    setMessage("");
    adminRequest({
      action: "update_quota",
      email: employer.email,
      quota: quota,
    })
      .then(function (result) {
        if (result.status === 403) {
          setView("forbidden");
          return;
        }
        if (result.data.error === "quota_below_codes_generated") {
          setActionError(
            "Quota cannot be lower than the number of codes already generated."
          );
          return;
        }
        if (!result.ok) {
          setActionError("Could not update quota. Please try again.");
          return;
        }
        setMessage("Quota updated for " + employer.email + ".");
        return loadEmployers();
      })
      .catch(function () {
        setActionError("Could not update quota. Please try again.");
      })
      .finally(function () {
        setSavingEmail("");
      });
  }

  if (view === "forbidden") {
    return <p>Not authorized</p>;
  }

  var inputStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 16,
    boxSizing: "border-box",
    marginBottom: 12,
  };

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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {view === "loading" ? (
          <p style={{ color: "#666", margin: 0 }}>Checking session…</p>
        ) : null}

        {view === "sent" ? (
          <p style={{ margin: 0, fontSize: 16 }}>
            Check your email for a login link.
          </p>
        ) : null}

        {view === "form" ? (
          <div style={{ maxWidth: 420 }}>
            <form onSubmit={handleLogin}>
              <label
                htmlFor="admin-email"
                style={{ display: "block", fontSize: 14, marginBottom: 8 }}
              >
                Work email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={function (event) {
                  setEmail(event.target.value);
                }}
                disabled={loginLoading}
                style={inputStyle}
              />
              {loginError ? (
                <p style={{ color: "#b91c1c", fontSize: 14 }}>
                  {loginError}
                </p>
              ) : null}
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? "Sending…" : "Send me a login link"}
              </button>
            </form>
          </div>
        ) : null}

        {view === "admin" ? (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 24px" }}>
              Employer admin
            </h1>

            {message ? (
              <p style={{ color: "#166534", fontSize: 14 }}>{message}</p>
            ) : null}
            {actionError ? (
              <p style={{ color: "#b91c1c", fontSize: 14 }}>{actionError}</p>
            ) : null}

            <section style={{ marginBottom: 40, maxWidth: 420 }}>
              <h2 style={{ fontSize: 17, margin: "0 0 16px" }}>
                Create new employer
              </h2>
              <form onSubmit={handleCreate}>
                <input
                  type="email"
                  aria-label="Employer email"
                  placeholder="Employer email"
                  value={createEmail}
                  onChange={function (event) {
                    setCreateEmail(event.target.value);
                  }}
                  disabled={creating}
                  style={inputStyle}
                />
                <input
                  type="text"
                  aria-label="Company name"
                  placeholder="Company name"
                  value={companyName}
                  onChange={function (event) {
                    setCompanyName(event.target.value);
                  }}
                  disabled={creating}
                  style={inputStyle}
                />
                <label
                  htmlFor="create-quota"
                  style={{ display: "block", fontSize: 14, marginBottom: 8 }}
                >
                  Initial quota
                </label>
                <input
                  id="create-quota"
                  type="number"
                  min={0}
                  step={1}
                  aria-label="Quota"
                  placeholder="Quota"
                  value={createQuota}
                  onChange={function (event) {
                    setCreateQuota(event.target.value);
                  }}
                  disabled={creating}
                  style={inputStyle}
                />
                <button type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create employer"}
                </button>
              </form>
            </section>

            <section>
              <h2 style={{ fontSize: 17, margin: "0 0 16px" }}>Employers</h2>
              {listLoading ? <p>Loading employers…</p> : null}
              {!listLoading && employers.length === 0 ? (
                <p style={{ color: "#666" }}>No employers found.</p>
              ) : null}
              {employers.map(function (employer) {
                return (
                  <div
                    key={employer.email}
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "14px 0",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: "1 1 340px" }}>
                      <div style={{ fontWeight: 600 }}>{employer.companyName}</div>
                      <div style={{ fontSize: 14, color: "#444" }}>
                        {employer.email} · {employer.codesGenerated} codes generated
                        {" · "}
                        {employer.batchCount} batches
                      </div>
                    </div>
                    <label style={{ fontSize: 14 }}>
                      Quota{" "}
                      <input
                        type="number"
                        min={0}
                        step={1}
                        aria-label={"Quota for " + employer.email}
                        value={quotaDrafts[employer.email] ?? ""}
                        onChange={function (event) {
                          var value = event.target.value;
                          setQuotaDrafts(function (current) {
                            return { ...current, [employer.email]: value };
                          });
                        }}
                        style={{ width: 100, padding: "8px 10px", fontSize: 15 }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={function () {
                        handleQuotaSave(employer);
                      }}
                      disabled={savingEmail === employer.email}
                    >
                      {savingEmail === employer.email ? "Saving…" : "Save quota"}
                    </button>
                  </div>
                );
              })}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
