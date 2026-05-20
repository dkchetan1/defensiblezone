// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const PRODUCT_CONFIG = {
  engineer: {
    path: "/engineer",
    productName: "Defensible Zone Engineer Edition",
    subjects: {
      free: "Your Defensible Zone™ Engineer results",
      paid: "Your Defensible Zone™ Engineer 90-day plan",
    },
  },
  pm: {
    path: "/pm",
    productName: "Defensible Zone Product Manager Edition",
    subjects: {
      free: "Your Defensible Zone™ Product Manager results",
      paid: "Your Defensible Zone™ Product Manager 90-day plan",
    },
  },
};

const VALID_TYPES = new Set(["free", "paid"]);

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain || !domain.includes(".")) return false;
  if (domain.indexOf(".") <= 0) return false;
  return true;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function profileSummary(profile) {
  if (!profile || typeof profile !== "object") return "";
  if (typeof profile.summary === "string" && profile.summary.trim()) return profile.summary.trim();
  const parts = [];
  if (profile.seniorityLabel) parts.push(profile.seniorityLabel);
  if (profile.pmLabel || profile.devLabel) parts.push(profile.pmLabel || profile.devLabel);
  if (profile.companyLabel) parts.push(profile.companyLabel);
  return parts.join(" · ");
}

function buildSkillsHtml(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return "<p style='color:#4a5568;margin:0;'>No skills data available.</p>";
  }
  const rows = skills
    .map(function (sk) {
      const name = escapeHtml(sk.text || sk.name || "Skill");
      const dz = typeof sk.dz === "number" ? sk.dz : "—";
      const aiR = typeof sk.ai_replaceability === "number" ? sk.ai_replaceability : "—";
      const mkt = typeof sk.market_demand === "number" ? sk.market_demand : "—";
      return (
        "<tr>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>" +
        name +
        "</td>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;'>" +
        dz +
        "</td>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;'>" +
        aiR +
        "</td>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;'>" +
        mkt +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
  return (
    "<table style='width:100%;border-collapse:collapse;font-size:14px;'>" +
    "<thead><tr style='background:#f2f4f8;'>" +
    "<th style='padding:8px 12px;text-align:left;font-size:11px;letter-spacing:0.06em;color:#4a5568;'>SKILL</th>" +
    "<th style='padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.06em;color:#4a5568;'>DZ</th>" +
    "<th style='padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.06em;color:#4a5568;'>AI RISK</th>" +
    "<th style='padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.06em;color:#4a5568;'>MARKET</th>" +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table>"
  );
}

function buildRecommendationsHtml(recommendations) {
  const list =
    recommendations && Array.isArray(recommendations.recommendations)
      ? recommendations.recommendations
      : Array.isArray(recommendations)
        ? recommendations
        : [];
  if (list.length === 0) {
    return "";
  }
  const byPhase = { 1: [], 2: [], 3: [] };
  list.forEach(function (rec) {
    const phase = rec.phase === 2 || rec.phase === 3 ? rec.phase : 1;
    byPhase[phase].push(rec);
  });
  const phaseLabels = {
    1: "Weeks 1–4 — Start now",
    2: "Weeks 5–8 — Build on it",
    3: "Weeks 9–12 — Structural moves",
  };
  return [1, 2, 3]
    .map(function (phase) {
      const recs = byPhase[phase];
      if (recs.length === 0) return "";
      const items = recs
        .map(function (rec) {
          return (
            "<div style='margin-bottom:16px;padding:16px;background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;'>" +
            "<div style='font-weight:700;font-size:15px;color:#0d1117;margin-bottom:8px;'>" +
            escapeHtml(rec.headline || "Action") +
            "</div>" +
            "<div style='font-size:14px;color:#4a5568;line-height:1.5;margin-bottom:8px;'>" +
            escapeHtml(rec.action || "") +
            "</div>" +
            "<div style='font-size:13px;color:#6b7280;font-style:italic;line-height:1.5;'>" +
            escapeHtml(rec.why || "") +
            "</div>" +
            "</div>"
          );
        })
        .join("");
      return (
        "<h3 style='font-size:14px;color:#1e2a42;margin:24px 0 12px;letter-spacing:0.04em;'>" +
        escapeHtml(phaseLabels[phase]) +
        "</h3>" +
        items
      );
    })
    .join("");
}

function buildResultsHtml({ productCfg, type, results }) {
  const profile = results && results.profile;
  const landscape = results && typeof results.landscape === "string" ? results.landscape : "";
  const overallScore =
    results && typeof results.overallScore === "number" ? results.overallScore : null;
  const skills = results && results.skills;
  const summary = profileSummary(profile);
  const isPaid = type === "paid";

  const landscapeBlock = landscape
    ? "<div style='margin:20px 0;padding:16px;background:#f8f9fc;border-left:4px solid #d97706;border-radius:4px;'>" +
      "<p style='margin:0;font-size:14px;color:#4a5568;line-height:1.6;white-space:pre-wrap;'>" +
      escapeHtml(landscape.slice(0, 1200)) +
      (landscape.length > 1200 ? "…" : "") +
      "</p></div>"
    : "";

  const recsBlock =
    isPaid && results.recommendations
      ? "<h2 style='font-size:18px;color:#0d1117;margin:32px 0 16px;'>Your 90-day plan</h2>" +
        buildRecommendationsHtml(results.recommendations)
      : "";

  const scoreBlock =
    overallScore != null
      ? "<div style='display:inline-block;margin:16px 0 24px;padding:20px 28px;background:#f8f9fc;border:2px solid #1a1d2e;border-radius:12px;text-align:center;'>" +
        "<div style='font-size:42px;font-weight:700;color:#1a1d2e;line-height:1;'>" +
        overallScore +
        "</div>" +
        "<div style='font-size:12px;color:#6b7280;margin-top:6px;letter-spacing:0.08em;'>OVERALL DZ SCORE</div>" +
        "</div>"
      : "";

  return (
    "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#0d1117;max-width:640px;'>" +
    "<h1 style='margin:0 0 8px;font-size:22px;'>" +
    escapeHtml(isPaid ? "Your 90-day plan" : "Your Defensible Zone results") +
    "</h1>" +
    "<p style='margin:0 0 20px;color:#6b7280;font-size:14px;'>" +
    escapeHtml(productCfg.productName) +
    "</p>" +
    (summary ? "<p style='margin:0 0 16px;font-size:15px;color:#1e2a42;font-weight:600;'>" + escapeHtml(summary) + "</p>" : "") +
    scoreBlock +
    landscapeBlock +
    "<h2 style='font-size:16px;color:#0d1117;margin:24px 0 12px;'>Skill breakdown</h2>" +
    buildSkillsHtml(skills) +
    recsBlock +
    "<p style='margin:32px 0 0;font-size:13px;color:#9ca3af;'>" +
    "Save this email for your records. You can also return to " +
    "<a href='https://app.defensiblezone.ai" +
    productCfg.path +
    "' style='color:#2563eb;'>app.defensiblezone.ai" +
    productCfg.path +
    "</a> to view your results online." +
    "</p></div>"
  ).trim();
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }
  }

  const rawProduct = body && body.product;
  const productKey =
    typeof rawProduct === "string" && rawProduct.trim() ? rawProduct.trim().toLowerCase() : "";
  const productCfg = productKey ? PRODUCT_CONFIG[productKey] : undefined;
  if (!productCfg) {
    return res.status(400).json({ error: "Unknown or missing product" });
  }

  const rawType = body && body.type;
  const type = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: "Invalid or missing type (expected free or paid)" });
  }

  const { email, results } = body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!results || typeof results !== "object") {
    return res.status(400).json({ error: "Missing results" });
  }
  if (type === "paid" && !results.recommendations) {
    return res.status(400).json({ error: "Paid results email requires recommendations" });
  }

  const trimmedEmail = email.trim();
  const subject = productCfg.subjects[type];
  const html = buildResultsHtml({ productCfg, type, results });

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("send-results-email: RESEND_API_KEY not configured (skipping email)");
    } else {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@defensiblezone.ai",
          to: [trimmedEmail],
          subject,
          html,
        }),
      });
      if (!resendResponse.ok) {
        const text = await resendResponse.text().catch(() => "");
        console.error("send-results-email: Resend error:", resendResponse.status, text);
        return res.status(502).json({ error: "Failed to send email" });
      }
      console.log("send-results-email: sent", type, "email to:", trimmedEmail, "product:", productKey);
    }
  } catch (err) {
    console.error("send-results-email: unexpected resend error:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to send email" });
  }

  return res.status(200).json({ success: true });
}
