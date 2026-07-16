// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const BASE_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

async function redisGet(key) {
  const res = await fetch(`${BASE_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`redis get failed: ${res.status}`);
  }
  const data = await res.json();
  return data.result;
}

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

function isFounder(email) {
  const founders = (process.env.FOUNDER_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return founders.includes(email);
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

  const { email, destination } = body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    if (!isFounder(trimmedEmail)) {
      if (!BASE_URL || !REDIS_TOKEN) {
        console.error("employer-login: Redis not configured");
        return res.status(500).json({ error: "server_error" });
      }

      const existing = await redisGet(`employer:${trimmedEmail}`);
      if (existing === null || existing === undefined) {
        return res.status(404).json({ error: "not_found" });
      }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("employer-login: JWT_SECRET not configured");
      return res.status(500).json({ error: "server_error" });
    }

    const jwt = (await import("jsonwebtoken")).default;
    const token = jwt.sign(
      { email: trimmedEmail, type: "employer" },
      secret,
      { expiresIn: "24h" }
    );

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("employer-login: RESEND_API_KEY not configured");
      return res.status(500).json({ error: "server_error" });
    }

    const link =
      destination === "admin"
        ? `https://app.defensiblezone.ai/employer/admin?token=${encodeURIComponent(token)}`
        : `https://app.defensiblezone.ai/employer/portal?token=${encodeURIComponent(token)}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
        <h1 style="margin: 0 0 12px 0; font-size: 22px;">Sign in to your employer portal</h1>
        <p style="margin: 0 0 16px 0; color: #111;">
          Click below to sign in. This link expires in 24 hours.
        </p>
        <a href="${link}"
           style="display: inline-block; padding: 12px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 8px;">
          Sign in
        </a>
      </div>
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@defensiblezone.ai",
        to: [trimmedEmail],
        subject: "Your Defensible Zone™ employer portal login link",
        html,
      }),
    });

    if (!resendResponse.ok) {
      const text = await resendResponse.text().catch(() => "");
      console.error("employer-login Resend error:", resendResponse.status, text);
      return res.status(500).json({ error: "server_error" });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("employer-login error:", err?.message ?? err);
    return res.status(500).json({ error: "server_error" });
  }
}
