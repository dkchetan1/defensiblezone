// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://defensiblezone.ai");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain) return false;
  // Require a domain with at least one dot (e.g. example.com)
  if (!domain.includes(".")) return false;
  // Require a dot after the @ (not just anywhere)
  if (domain.indexOf(".") <= 0) return false;
  return true;
}

function getBaseUrl(req) {
  const proto =
    (typeof req.headers["x-forwarded-proto"] === "string" && req.headers["x-forwarded-proto"]) ||
    "https";
  const host = req.headers.host;
  if (!host) return null;
  return `${proto}://${host}`;
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

  const { email } = body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const trimmedEmail = email.trim();

  let token = "";
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn("send-gate-email: JWT_SECRET not configured");
    } else {
      token = jwt.sign({ email: trimmedEmail, product: "finance", type: "gate" }, secret, {
        expiresIn: "24h",
      });
    }
  } catch (err) {
    console.error("send-gate-email: jwt sign error:", err?.message ?? err);
  }

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("send-gate-email: RESEND_API_KEY not configured (skipping email)");
    } else {
      const link = `https://defensiblezone.ai/finance?gate_token=${encodeURIComponent(token)}`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
          <h1 style="margin: 0 0 12px 0; font-size: 22px;">Your report is ready</h1>
          <p style="margin: 0 0 16px 0; color: #111;">
            Click below to open your results. This link expires in 24 hours.
          </p>
          <a href="${link}"
             style="display: inline-block; padding: 12px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 8px;">
            Open your results
          </a>
        </div>
      `.trim();

      void fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@defensiblezone.ai",
          to: [trimmedEmail],
          subject: "Your Defensible Zone™ Finance report is ready",
          html,
        }),
      })
        .then(async (r) => {
          if (!r.ok) {
            const text = await r.text().catch(() => "");
            console.error("Resend error:", r.status, text);
          }
        })
        .catch((err) => {
          console.error("Resend fetch error:", err?.message ?? err);
        });
    }
  } catch (err) {
    console.error("send-gate-email: unexpected resend error:", err?.message ?? err);
  }

  try {
    const base = getBaseUrl(req);
    if (!base) {
      console.warn("send-gate-email: unable to determine base URL for subscribe call");
    } else {
      void fetch(new URL("/api/subscribe", base).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          productName: "Defensible Zone Finance Edition",
        }),
      }).catch((err) => {
        console.error("send-gate-email: subscribe fetch error:", err?.message ?? err);
      });
    }
  } catch (err) {
    console.error("send-gate-email: unexpected subscribe error:", err?.message ?? err);
  }

  return res.status(200).json({ success: true });
}

