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
    subject: {
      free: "Your Defensible Zone™ Engineer results",
      paid: "Your Defensible Zone™ Engineer 90-day plan",
    },
  },
  doctor: {
    path: "/doctor",
    productName: "Defensible Zone Doctor Edition",
    subject: {
      free: "Your Defensible Zone™ Medical Edition results",
      paid: "Your Defensible Zone™ Medical Edition 90-day plan",
    },
  },
  pm: {
    path: "/pm",
    productName: "Defensible Zone Product Manager Edition",
    subject: {
      free: "Your Defensible Zone™ Product Manager results",
      paid: "Your Defensible Zone™ Product Manager 90-day plan",
    },
  },
  sales: {
    path: "/sales",
    productName: "Defensible Zone Sales Edition",
    subject: {
      free: "Your Defensible Zone™ Sales results",
      paid: "Your Defensible Zone™ Sales 90-day plan",
    },
  },
  ux: {
    path: "/ux",
    productName: "Defensible Zone UX Professional Edition",
    subject: {
      free: "Your Defensible Zone™ UX Professional results",
      paid: "Your Defensible Zone™ UX Professional 90-day plan",
    },
  },
  finance: {
    path: "/finance",
    productName: "Defensible Zone Finance Edition",
    subject: {
      free: "Your Defensible Zone™ Finance Assessment — free results inside",
      paid: "Your Defensible Zone™ Finance Defensibility Report — full report inside",
    },
  },
  smallbusiness: {
    path: "/smallbusiness",
    productName: "Defensible Zone Small Business Edition",
    subjects: {
      session_brief: "Your Defensible Zone™ Business Assessment — free results inside",
      paid: "Your Defensible Zone™ Business Defensibility Report — full report inside",
    },
  },
};

const VALID_TYPES = new Set(["free", "paid", "session_brief"]);

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

function buildLeadCardHtml({ productCfg, trimmedEmail, results }) {
  const profile = results && results.profile && typeof results.profile === "object" ? results.profile : {};
  const skills = results && results.skills;
  const recommendations = results && results.recommendations;
  const landscape = results && typeof results.landscape === "string" ? results.landscape : "";

  const workContexts = Array.isArray(profile.workContextLabels) ? profile.workContextLabels.filter(Boolean) : [];

  const profileRows = [
    ["Sales type", profile.salesTypeLabel],
    ["Role track", profile.roleTrackLabel],
    ["Seniority", profile.seniorityLabel],
    ["Company", profile.companyLabel],
    ["Industry vertical", profile.industryVerticalLabel],
    ["Work context", workContexts.join(", ")],
  ]
    .filter(function (row) {
      return row[1] != null && String(row[1]).trim();
    })
    .map(function (row) {
      return (
        "<tr>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;width:180px;'>" +
        escapeHtml(row[0]) +
        "</td>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0d1117;font-size:14px;font-weight:600;'>" +
        escapeHtml(row[1]) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  const profileBlock = profileRows
    ? "<h2 style='font-size:16px;color:#0d1117;margin:24px 0 12px;'>Profile summary</h2>" +
      "<table style='width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;'>" +
      "<tbody>" +
      profileRows +
      "</tbody></table>"
    : "";

  const skillsBlock =
    "<h2 style='font-size:16px;color:#0d1117;margin:24px 0 12px;'>Skill breakdown</h2>" +
    buildSkillsHtml(skills);

  const recsBlock =
    "<h2 style='font-size:18px;color:#0d1117;margin:32px 0 16px;'>90-day plan</h2>" +
    buildRecommendationsHtml(recommendations);

  const landscapeBlock = landscape
    ? "<h2 style='font-size:16px;color:#0d1117;margin:32px 0 12px;'>AI landscape narrative</h2>" +
      "<div style='padding:16px;background:#f8f9fc;border-left:4px solid #d97706;border-radius:6px;'>" +
      "<p style='margin:0;font-size:14px;color:#4a5568;line-height:1.6;white-space:pre-wrap;'>" +
      escapeHtml(landscape) +
      "</p></div>"
    : "";

  return (
    "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#0d1117;max-width:720px;'>" +
    "<div style='padding:18px 18px 0;'>" +
    "<div style='font-size:12px;color:#6b7280;letter-spacing:0.08em;font-weight:700;'>LEAD CARD</div>" +
    "<h1 style='margin:8px 0 8px;font-size:22px;'>" +
    escapeHtml("New paid completion — " + productCfg.productName) +
    "</h1>" +
    "<div style='margin:0 0 18px;padding:14px 16px;background:#0d1117;border-radius:12px;'>" +
    "<div style='color:#f9fafb;font-size:14px;letter-spacing:0.06em;font-weight:700;margin-bottom:6px;'>USER EMAIL</div>" +
    "<div style='color:#ffffff;font-size:18px;font-weight:800;'>" +
    escapeHtml(trimmedEmail) +
    "</div>" +
    "</div>" +
    profileBlock +
    skillsBlock +
    recsBlock +
    landscapeBlock +
    "<p style='margin:32px 0 0;font-size:12px;color:#9ca3af;text-align:center;'>" +
    "Sent automatically by Defensible Zone™" +
    "</p>" +
    "</div></div>"
  ).trim();
}

function sbProfileSummaryLine(profile) {
  if (!profile || typeof profile !== "object") return "";
  const parts = [profile.industry, profile.stage, profile.archetype].filter(function (v) {
    return v != null && String(v).trim();
  });
  return parts.join(" · ");
}

function sbSectionHeading(label) {
  return (
    "<h2 style='font-size:14px;color:#1e2a42;margin:28px 0 12px;letter-spacing:0.06em;text-transform:uppercase;'>" +
    escapeHtml(label) +
    "</h2>"
  );
}

function sbTextParagraph(text) {
  if (!text) return "";
  return (
    "<p style='margin:0;font-size:15px;color:#4a5568;line-height:1.65;white-space:pre-wrap;'>" +
    escapeHtml(text) +
    "</p>"
  );
}

function sbAccentBox(innerHtml) {
  return (
    "<div style='margin:12px 0;padding:16px 20px;background:#f8f9fc;border-left:4px solid #d97706;border-radius:4px;'>" +
    innerHtml +
    "</div>"
  );
}

function sbRenderRisks(risks, limit, brief) {
  const list = Array.isArray(risks) ? risks : [];
  const slice = limit != null ? list.slice(0, limit) : list;
  if (slice.length === 0) return "";
  return slice
    .map(function (risk, idx) {
      const title = escapeHtml(risk.title || "Risk");
      if (brief) {
        return (
          "<div style='margin-bottom:14px;padding:16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;'>" +
          "<div style='font-size:11px;color:#d97706;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>RISK #" +
          (idx + 1) +
          "</div>" +
          "<div style='font-weight:700;font-size:15px;color:#0d1117;margin-bottom:8px;'>" +
          title +
          "</div>" +
          "<div style='font-size:14px;color:#4a5568;line-height:1.55;'>" +
          escapeHtml(risk.action || "") +
          "</div></div>"
        );
      }
      return (
        "<div style='margin-bottom:16px;padding:16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;'>" +
        "<div style='font-size:11px;color:#d97706;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>RISK #" +
        (idx + 1) +
        "</div>" +
        "<div style='font-weight:700;font-size:15px;color:#0d1117;margin-bottom:10px;'>" +
        title +
        "</div>" +
        "<div style='font-size:12px;color:#6b7280;font-style:italic;margin-bottom:8px;line-height:1.5;'>" +
        escapeHtml(risk.priority_rationale || "") +
        "</div>" +
        "<div style='font-size:14px;color:#4a5568;line-height:1.55;'>" +
        escapeHtml(risk.action || "") +
        "</div></div>"
      );
    })
    .join("");
}

function sbRenderAnchors(anchors) {
  const list = Array.isArray(anchors) ? anchors : [];
  if (list.length === 0) return "";
  return list
    .map(function (anchor) {
      return (
        "<div style='margin-bottom:10px;padding:14px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;'>" +
        "<div style='font-weight:700;font-size:15px;color:#0d1117;margin-bottom:6px;'>" +
        escapeHtml(anchor.title || "") +
        "</div>" +
        "<div style='font-size:14px;color:#4a5568;line-height:1.55;'>" +
        escapeHtml(anchor.desc || "") +
        "</div></div>"
      );
    })
    .join("");
}

function sbRenderSection4(section4) {
  if (!section4 || typeof section4 !== "object") return "";
  return sbAccentBox(
    "<p style='margin:0 0 12px;font-size:18px;font-weight:600;color:#0d1117;line-height:1.4;'>" +
      escapeHtml(section4.question || "") +
      "</p>" +
      sbTextParagraph(section4.context)
  );
}

function sbRenderSection6(section6) {
  if (!section6 || typeof section6 !== "object") return "";
  const periods = [
    { label: "12 months", key: "months12" },
    { label: "24 months", key: "months24" },
    { label: "36 months", key: "months36" },
  ];
  return periods
    .map(function (period) {
      const text = section6[period.key];
      if (!text) return "";
      return (
        "<div style='margin-bottom:10px;padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;'>" +
        "<div style='font-size:11px;color:#dc2626;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>" +
        escapeHtml(period.label.toUpperCase()) +
        "</div>" +
        sbTextParagraph(text) +
        "</div>"
      );
    })
    .join("");
}

function sbRenderSection7(section7) {
  if (!section7 || typeof section7 !== "object") return "";
  const subs = [
    { label: "Who you're competing against", key: "competitors" },
    { label: "What AI is eroding right now", key: "eroding" },
    { label: "Defensible positions in your market", key: "defensible" },
  ];
  return subs
    .map(function (sub) {
      const text = section7[sub.key];
      if (!text) return "";
      return (
        "<div style='margin-bottom:10px;padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;'>" +
        "<div style='font-size:11px;color:#6b7280;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>" +
        escapeHtml(sub.label.toUpperCase()) +
        "</div>" +
        sbTextParagraph(text) +
        "</div>"
      );
    })
    .join("");
}

function sbRenderFactorList(items, borderColor, bgColor) {
  const list = Array.isArray(items) ? items : [];
  return list
    .map(function (item) {
      return (
        "<div style='margin-bottom:8px;padding:14px 16px;background:" +
        bgColor +
        ";border:1px solid " +
        borderColor +
        ";border-radius:8px;'>" +
        "<div style='font-weight:700;font-size:14px;color:#0d1117;margin-bottom:4px;'>" +
        escapeHtml(item.title || "") +
        "</div>" +
        "<div style='font-size:13px;color:#4a5568;line-height:1.5;'>" +
        escapeHtml(item.desc || "") +
        "</div></div>"
      );
    })
    .join("");
}

function sbRenderSection8(section8) {
  if (!section8 || typeof section8 !== "object") return "";
  return (
    "<div style='margin-bottom:12px;'>" +
    "<div style='font-size:11px;color:#16a34a;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>WOULD PAY A PREMIUM FOR</div>" +
    sbRenderFactorList(section8.premium_factors, "#86efac", "#f0fdf4") +
    "</div>" +
    "<div>" +
    "<div style='font-size:11px;color:#dc2626;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>WOULD DISCOUNT FOR</div>" +
    sbRenderFactorList(section8.discount_factors, "#fecaca", "#fef2f2") +
    "</div>"
  );
}

function sbRenderSection9(section9) {
  const list = Array.isArray(section9) ? section9 : [];
  if (list.length === 0) return "";
  return list
    .map(function (dep) {
      return (
        "<div style='margin-bottom:10px;padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;'>" +
        "<div style='font-weight:700;font-size:14px;color:#0d1117;margin-bottom:6px;'>" +
        escapeHtml(dep.name || "") +
        "</div>" +
        "<div style='font-size:14px;color:#4a5568;line-height:1.55;'>" +
        escapeHtml(dep.risk || "") +
        "</div></div>"
      );
    })
    .join("");
}

function sbRenderSection10(section10) {
  if (!section10 || typeof section10 !== "object") return "";
  return sbAccentBox(
    "<div style='font-size:11px;color:#6b7280;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;'>TYPICAL SCORE RANGE</div>" +
      sbTextParagraph(section10.typical_range) +
      "<div style='font-size:11px;color:#6b7280;font-weight:700;letter-spacing:0.06em;margin:16px 0 8px;'>WHAT HIGHER-SCORING BUSINESSES DO</div>" +
      sbTextParagraph(section10.differentiators)
  );
}

function sbRenderFullReport(report, options) {
  const opts = options || {};
  const riskLimit = opts.riskLimit;
  const riskBrief = !!opts.riskBrief;
  const includeSections = opts.includeSections;
  const allSections = !includeSections;
  const hasSection = function (n) {
    return allSections || includeSections.indexOf(n) >= 0;
  };
  if (!report || typeof report !== "object") return "";

  let html = "";

  if (hasSection(1) && report.section1) {
    html += sbSectionHeading("Score in Context") + sbAccentBox(sbTextParagraph(report.section1));
  }
  if (hasSection(2) && report.section2) {
    html += sbSectionHeading("Top Risks") + sbRenderRisks(report.section2, riskLimit, riskBrief);
  }
  if (hasSection(3) && report.section3) {
    html += sbSectionHeading("Strongest Anchors") + sbRenderAnchors(report.section3);
  }
  if (hasSection(4) && report.section4) {
    html += sbSectionHeading("The Strategic Question") + sbRenderSection4(report.section4);
  }
  if (hasSection(5) && report.section5) {
    html +=
      sbSectionHeading("What to Do First") +
      "<div style='margin:12px 0;padding:18px 20px;background:#1a1d2e;border-radius:8px;'>" +
      "<p style='margin:0;font-size:16px;color:#ffffff;line-height:1.65;'>" +
      escapeHtml(report.section5) +
      "</p></div>";
  }
  if (hasSection(6) && report.section6) {
    html += sbSectionHeading("AI Threat Timeline") + sbRenderSection6(report.section6);
  }
  if (hasSection(7) && report.section7) {
    html += sbSectionHeading("Competitive Analysis") + sbRenderSection7(report.section7);
  }
  if (hasSection(8) && report.section8) {
    html += sbSectionHeading("What a Buyer Would Say") + sbRenderSection8(report.section8);
  }
  if (hasSection(9) && report.section9) {
    html += sbSectionHeading("Owner Dependence Analysis") + sbRenderSection9(report.section9);
  }
  if (hasSection(10) && report.section10) {
    html += sbSectionHeading("Competitive Benchmark") + sbRenderSection10(report.section10);
  }

  return html;
}

function buildSmallBusinessEmailHtml(type, profile, report) {
  const summary = sbProfileSummaryLine(profile);
  const isSessionBrief = type === "session_brief";
  const title = isSessionBrief ? "Your Business Assessment" : "Your Defensibility Report";
  const productName = "Defensible Zone Small Business Edition";

  const reportBlock = isSessionBrief
    ? sbRenderFullReport(report, { riskLimit: 3, riskBrief: true, includeSections: [1, 2, 5] })
    : sbRenderFullReport(report, { riskLimit: 5, riskBrief: false });

  const ctaBlock = isSessionBrief
    ? "<div style='margin:32px 0 0;padding:24px;background:#1a1d2e;border-radius:12px;text-align:center;'>" +
      "<p style='margin:0 0 16px;font-size:15px;color:#f9fafb;line-height:1.6;'>" +
      "Unlock your full report — including AI threat timeline, competitive analysis, and owner dependence breakdown" +
      "</p>" +
      "<a href='https://app.defensiblezone.ai/smallbusiness' style='display:inline-block;padding:14px 28px;background:#d97706;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;letter-spacing:0.04em;'>" +
      "Unlock Full Report →" +
      "</a></div>"
    : "";

  return (
    "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#0d1117;max-width:640px;'>" +
    "<div style='padding:20px 20px 16px;background:#1a1d2e;border-radius:12px 12px 0 0;'>" +
    "<div style='font-size:11px;color:#d97706;letter-spacing:0.1em;font-weight:700;margin-bottom:8px;'>DEFENSIBLE ZONE™</div>" +
    "<h1 style='margin:0;font-size:22px;color:#ffffff;'>" +
    escapeHtml(title) +
    "</h1>" +
    "<p style='margin:8px 0 0;font-size:13px;color:#9ca3af;'>" +
    escapeHtml(productName) +
    "</p></div>" +
    "<div style='padding:20px;'>" +
    (summary
      ? "<p style='margin:0 0 20px;font-size:15px;color:#1e2a42;font-weight:600;'>" + escapeHtml(summary) + "</p>"
      : "") +
    reportBlock +
    ctaBlock +
    "<p style='margin:32px 0 0;font-size:13px;color:#9ca3af;'>" +
    "Save this email for your records. You can also return to " +
    "<a href='https://app.defensiblezone.ai/smallbusiness' style='color:#2563eb;'>app.defensiblezone.ai/smallbusiness</a> " +
    "to view your results online." +
    "</p></div></div>"
  ).trim();
}

function buildSmallBusinessProfileTable(profile) {
  if (!profile || typeof profile !== "object") return "";
  const channels = Array.isArray(profile.bizChannels)
    ? profile.bizChannels.filter(Boolean).join(", ")
    : profile.bizChannels;
  const rows = [
    ["Industry", profile.industry],
    ["Stage", profile.stage],
    ["Archetype", profile.archetype],
    ["Value proposition (VP)", profile.sliderVP],
    ["Customer switching cost (CS)", profile.sliderCS],
    ["Knowledge moat (KM)", profile.sliderKM],
    ["Time horizon (TH)", profile.sliderTH],
    ["Business goal", profile.bizGoal],
    ["Owner age bracket", profile.bizAge],
    ["Location type", profile.bizLocation],
    ["Customer acquisition channels", channels],
    ["Tech adoption style", profile.bizTech],
    ["Primary differentiator", profile.bizDiff],
  ]
    .filter(function (row) {
      return row[1] != null && String(row[1]).trim() !== "";
    })
    .map(function (row) {
      return (
        "<tr>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;width:200px;'>" +
        escapeHtml(row[0]) +
        "</td>" +
        "<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0d1117;font-size:14px;font-weight:600;'>" +
        escapeHtml(row[1]) +
        "</td></tr>"
      );
    })
    .join("");

  if (!rows) return "";
  return (
    sbSectionHeading("Profile") +
    "<table style='width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;'>" +
    "<tbody>" +
    rows +
    "</tbody></table>"
  );
}

function buildSmallBusinessLeadCardHtml(resolvedEmail, profile, report) {
  const productName = "Defensible Zone Small Business Edition";
  return (
    "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#0d1117;max-width:720px;'>" +
    "<div style='padding:18px 18px 0;'>" +
    "<div style='font-size:12px;color:#6b7280;letter-spacing:0.08em;font-weight:700;'>LEAD CARD</div>" +
    "<h1 style='margin:8px 0 8px;font-size:22px;'>" +
    escapeHtml("New completion — " + productName) +
    "</h1>" +
    "<div style='margin:0 0 18px;padding:14px 16px;background:#0d1117;border-radius:12px;'>" +
    "<div style='color:#f9fafb;font-size:14px;letter-spacing:0.06em;font-weight:700;margin-bottom:6px;'>USER EMAIL</div>" +
    "<div style='color:#ffffff;font-size:18px;font-weight:800;'>" +
    escapeHtml(resolvedEmail) +
    "</div></div>" +
    buildSmallBusinessProfileTable(profile) +
    sbRenderFullReport(report) +
    "<p style='margin:32px 0 0;font-size:12px;color:#9ca3af;text-align:center;'>" +
    "Sent automatically by Defensible Zone™" +
    "</p></div></div>"
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
  const resolvedEmail = (email || body.ownerEmail || "").trim();
  if (!isValidEmail(resolvedEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (productKey !== "smallbusiness") {
    if (!results || typeof results !== "object") {
      return res.status(400).json({ error: "Missing results" });
    }
    if (type === "paid" && !results.recommendations) {
      return res.status(400).json({ error: "Paid results email requires recommendations" });
    }
  }

  const trimmedEmail = resolvedEmail;

  if (productKey === "smallbusiness") {
    const profile = body.profile;
    const report = body.report;
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ error: "Missing profile" });
    }
    if (!report || typeof report !== "object") {
      return res.status(400).json({ error: "Missing report" });
    }

    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        console.warn("send-results-email: RESEND_API_KEY not configured (skipping email)");
      } else {
        const sbSubject = productCfg.subjects[type];
        const sbHtml = buildSmallBusinessEmailHtml(type, profile, report);
        const sbResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "noreply@defensiblezone.ai",
            to: [trimmedEmail],
            subject: sbSubject,
            html: sbHtml,
          }),
        });
        if (!sbResponse.ok) {
          const text = await sbResponse.text().catch(() => "");
          console.error("send-results-email: smallbusiness Resend error:", sbResponse.status, text);
          return res.status(502).json({ error: "Failed to send email" });
        }
        console.log("send-results-email: sent", type, "email to:", trimmedEmail, "product:", productKey);

        if (type === "session_brief" || type === "paid") {
          try {
            const leadHtml = buildSmallBusinessLeadCardHtml(trimmedEmail, profile, report);
            const leadSubject = "[Lead Card] " + productCfg.productName + " — " + trimmedEmail;
            const leadResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "noreply@defensiblezone.ai",
                to: ["dilip@recursiolab.com"],
                subject: leadSubject,
                html: leadHtml,
              }),
            });
            if (!leadResponse.ok) {
              const text = await leadResponse.text().catch(() => "");
              console.error("send-results-email: smallbusiness lead card Resend error:", leadResponse.status, text);
            } else {
              console.log("send-results-email: lead card sent to dilip@recursiolab.com for:", trimmedEmail, "product:", productKey);
            }
          } catch (err) {
            console.error("send-results-email: smallbusiness lead card unexpected error:", err?.message ?? err);
          }
        }
      }
    } catch (err) {
      console.error("send-results-email: unexpected resend error:", err?.message ?? err);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true });
  }

  const subject = typeof productCfg.subject === "object" ? productCfg.subject[type] : productCfg.subject;
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

      if (type === "paid" || type === "free") {
        try {
          const leadHtml = buildLeadCardHtml({ productCfg, trimmedEmail, results });
          const leadSubject = "[Lead Card] " + productCfg.productName + " — " + trimmedEmail;
          const leadResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "noreply@defensiblezone.ai",
              to: ["dilip@recursiolab.com"],
              subject: leadSubject,
              html: leadHtml,
            }),
          });
          if (!leadResponse.ok) {
            const text = await leadResponse.text().catch(() => "");
            console.error("send-results-email: lead card Resend error:", leadResponse.status, text);
          } else {
            console.log("send-results-email: lead card sent to dilip@recursiolab.com for:", trimmedEmail, "product:", productKey);
          }
        } catch (err) {
          console.error("send-results-email: lead card unexpected error:", err?.message ?? err);
        }
      }
    }
  } catch (err) {
    console.error("send-results-email: unexpected resend error:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to send email" });
  }

  return res.status(200).json({ success: true });
}
