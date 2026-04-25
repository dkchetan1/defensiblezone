// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://defensiblezone.ai");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

  const { token } = body || {};
  if (!token || typeof token !== "string") {
    return res.status(200).json({ valid: false, reason: "invalid" });
  }

  try {
    const jwt = (await import("jsonwebtoken")).default;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }

    const decoded = jwt.verify(token, secret);
    if (!decoded || typeof decoded !== "object") {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }

    if (decoded.type !== "gate" || decoded.product !== "finance") {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }

    if (typeof decoded.email !== "string" || !decoded.email.trim()) {
      return res.status(200).json({ valid: false, reason: "invalid" });
    }

    return res.status(200).json({ valid: true, email: decoded.email });
  } catch (err) {
    if (err && typeof err === "object" && err.name === "TokenExpiredError") {
      return res.status(200).json({ valid: false, reason: "expired" });
    }
    console.error("verify-gate-token error:", err?.message ?? err);
    return res.status(200).json({ valid: false, reason: "invalid" });
  }
}

