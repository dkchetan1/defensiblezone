// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const SUBJECTS = {
  free_results: "Your UX Professional AI Assessment Results",
  paid_report: "Your Full 90-Day Defensible Zone Plan",
};

const PHASE_HEADINGS = {
  1: "Phase 1 — Anchor",
  2: "Phase 2 — Reposition",
  3: "Phase 3 — Extend",
};

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain) return false;
  if (!domain.includes(".")) return false;
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

function dzColor(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "#888";
  if (score < 40) return "#c0392b";
  if (score <= 65) return "#d4a017";
  return "#27ae60";
}

function averageDz(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return 0;
  const sum = skills.reduce((acc, sk) => acc + (typeof sk.dz === "number" ? sk.dz : 0), 0);
  return Math.round(sum / skills.length);
}

function normalizeRecommendations(recommendations) {
  if (!recommendations) return [];
  if (Array.isArray(recommendations)) return recommendations;
  if (Array.isArray(recommendations.recommendations)) return recommendations.recommendations;
  return [];
}

function buildSkillsRows(skills) {
  return skills
    .map((skill) => {
      const name = escapeHtml(skill.text || skill.name || "Skill");
      const dz = typeof skill.dz === "number" ? skill.dz : 0;
      const aiR = typeof skill.ai_replaceability === "number" ? skill.ai_replaceability : 5;
      const mkt = typeof skill.market_demand === "number" ? skill.market_demand : 7;
      const color = dzColor(dz);
      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #111;">${name}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e8e8e8; font-size: 14px; font-weight: 700; color: ${color}; text-align: center;">${dz}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #555; text-align: center;">${aiR}/10</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #555; text-align: center;">${mkt}/10</td>
        </tr>
      `.trim();
    })
    .join("\n");
}

function buildRecommendationsHtml(recommendations) {
  const recs = normalizeRecommendations(recommendations)
    .slice()
    .sort((a, b) => (a.phase || 1) - (b.phase || 1));

  if (recs.length === 0) return "";

  const phases = [1, 2, 3];
  let html = `
    <h2 style="margin: 32px 0 16px 0; font-size: 18px; color: #111; font-weight: 700;">Your 90-Day Action Plan</h2>
  `.trim();

  for (const phase of phases) {
    const phaseRecs = recs.filter((r) => (r.phase || 1) === phase);
    if (phaseRecs.length === 0) continue;

    const heading = PHASE_HEADINGS[phase] || `Phase ${phase}`;
    html += `
      <h3 style="margin: 20px 0 12px 0; font-size: 15px; color: #d4a017; font-weight: 600;">${escapeHtml(heading)}</h3>
    `;

    for (const rec of phaseRecs) {
      const headline = escapeHtml(rec.headline || "");
      const action = escapeHtml(rec.action || "");
      const why = escapeHtml(rec.why || "");
      html += `
        <div style="margin-bottom: 16px; padding: 12px 14px; background: #f9f9f9; border-left: 3px solid #d4a017; border-radius: 4px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #111;">${headline}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #333; line-height: 1.5;">${action}</p>
          <p style="margin: 0; font-size: 12px; color: #666; font-style: italic; line-height: 1.5;">${why}</p>
        </div>
      `.trim();
    }
  }

  return html;
}

function buildReportHtml({ profile, landscape, skills, type, recommendations }) {
  const seniority = escapeHtml(profile?.seniorityLabel || "");
  const role = escapeHtml(profile?.roleLabel || "");
  const landscapeText = escapeHtml(landscape || "");
  const overallDz = averageDz(skills);
  const overallColor = dzColor(overallDz);
  const skillsRows = buildSkillsRows(skills);
  const recsSection = type === "paid_report" ? buildRecommendationsHtml(recommendations) : "";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; color: #111;">
      <div style="background: #1a1a1a; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <span style="font-size: 11px; letter-spacing: 0.15em; color: #d4a017; font-weight: 600;">DEFENSIBLE ZONE™</span>
      </div>
      <div style="padding: 24px 20px; background: #fff; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #111;">
          Here are your results, ${seniority} ${role}
        </p>
        ${
          landscapeText
            ? `<p style="margin: 0 0 24px 0; font-size: 14px; color: #555; font-style: italic; line-height: 1.6;">${landscapeText}</p>`
            : ""
        }
        <div style="text-align: center; margin: 0 0 24px 0;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Overall DZ Score</p>
          <p style="margin: 0; font-size: 48px; font-weight: 700; color: ${overallColor}; line-height: 1;">${overallDz}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; font-size: 11px; color: #888; border-bottom: 2px solid #e8e8e8;">Skill</th>
              <th style="padding: 8px; text-align: center; font-size: 11px; color: #888; border-bottom: 2px solid #e8e8e8;">DZ</th>
              <th style="padding: 8px; text-align: center; font-size: 11px; color: #888; border-bottom: 2px solid #e8e8e8;">AI Replace.</th>
              <th style="padding: 8px; text-align: center; font-size: 11px; color: #888; border-bottom: 2px solid #e8e8e8;">Market</th>
            </tr>
          </thead>
          <tbody>
            ${skillsRows}
          </tbody>
        </table>
        ${recsSection}
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e8e8e8; text-align: center; font-size: 12px; color: #888;">
          <p style="margin: 0 0 6px 0;">
            <a href="https://defensiblezone.ai" style="color: #d4a017; text-decoration: none;">defensiblezone.ai</a>
          </p>
          <p style="margin: 0;">Questions? <a href="mailto:support@recursiolab.com" style="color: #888;">support@recursiolab.com</a></p>
        </div>
      </div>
    </div>
  `.trim();
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid request body" });
      }
    }

    const { email, product, type, profile, landscape, skills, recommendations } = body || {};

    const productKey =
      typeof product === "string" && product.trim() ? product.trim().toLowerCase() : "";
    if (productKey !== "ux") {
      return res.status(400).json({ error: "Unknown or missing product" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const reportType = typeof type === "string" ? type.trim() : "";
    if (reportType !== "free_results" && reportType !== "paid_report") {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "Missing skills" });
    }

    const trimmedEmail = email.trim();
    const subject = SUBJECTS[reportType];
    const html = buildReportHtml({
      profile: profile || {},
      landscape,
      skills,
      type: reportType,
      recommendations,
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("send-report-email: RESEND_API_KEY not configured (skipping email)");
      return res.status(200).json({ success: true });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Defensible Zone <reports@defensiblezone.ai>",
        to: [trimmedEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const text = await resendResponse.text().catch(() => "");
      console.error("Resend error:", resendResponse.status, text);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log("Resend report email sent successfully to:", trimmedEmail);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-report-email: unexpected error:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
