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
  return true;
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

  const { email, productName } = body || {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const apiKey = process.env.KIT_API_KEY;
    const formId = process.env.KIT_FORM_ID;
    if (!apiKey || !formId) {
      console.warn("subscribe: KIT_API_KEY or KIT_FORM_ID not configured");
      return res.status(200).json({ success: true });
    }

    const url = `https://api.convertkit.com/v3/forms/${encodeURIComponent(formId)}/subscribe`;
    const kitRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email: email.trim(),
        tags: [],
        fields: { product: productName ?? "" },
      }),
    });

    if (!kitRes.ok) {
      const text = await kitRes.text();
      console.error("Kit subscribe error:", kitRes.status, text);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("subscribe error:", err.message);
    return res.status(200).json({ success: true });
  }
}
